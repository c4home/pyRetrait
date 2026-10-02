import os
import json
import sqlite3
import hashlib
import hmac
import base64
import time
from pathlib import Path
from typing import Optional, Dict, Any, Tuple

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_PATH = DATA_DIR / "pyretrait.db"

SECRET_KEY = os.environ.get("PYRETRAIT_SECRET_KEY", "pyretrait_secret_key_super_secure_jwt_2026_xyz").encode('utf-8')
TOKEN_EXPIRY_SECONDS = 30 * 24 * 3600  # 30 days

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Table users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Table user_plans
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_plans (
        user_id INTEGER PRIMARY KEY,
        plans_json TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    """)

    # Table user_patrimoine
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_patrimoine (
        user_id INTEGER PRIMARY KEY,
        patrimoine_json TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    """)

    conn.commit()
    conn.close()

# Password hashing using PBKDF2-HMAC-SHA256 (standard library, 100,000 iterations)
def hash_password(password: str, salt: bytes = None) -> Tuple[str, str]:
    if not salt:
        salt = os.urandom(16)
    h = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100_000)
    return h.hex(), salt.hex()

def verify_password(password: str, password_hash: str, salt_hex: str) -> bool:
    try:
        salt = bytes.fromhex(salt_hex)
        h = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100_000)
        return hmac.compare_digest(h.hex(), password_hash)
    except Exception:
        return False

# Base64url encoding/decoding for JWT-style tokens
def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _b64_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4)) if len(data) % 4 != 0 else ''
    return base64.urlsafe_b64decode((data + padding).encode('utf-8'))

def create_token(user_id: int, email: str, name: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "email": email,
        "name": name,
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_EXPIRY_SECONDS
    }
    
    header_b64 = _b64_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = _b64_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(SECRET_KEY, signing_input, hashlib.sha256).digest()
    sig_b64 = _b64_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    if not token or not isinstance(token, str):
        return None
    parts = token.strip().split('.')
    if len(parts) != 3:
        return None
    
    header_b64, payload_b64, sig_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    expected_sig = hmac.new(SECRET_KEY, signing_input, hashlib.sha256).digest()
    
    try:
        actual_sig = _b64_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        
        payload_bytes = _b64_decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))
        
        if payload.get("exp", 0) < time.time():
            return None  # Expired
        
        return payload
    except Exception:
        return None

# User CRUD helper functions
def create_user(email: str, password: str, name: str) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    email = email.strip().lower()
    name = name.strip()
    if not email or "@" not in email:
        return None, "Email không hợp lệ"
    if not password or len(password) < 6:
        return None, "Mật khẩu phải có tối thiểu 6 ký tự"
    if not name:
        name = email.split("@")[0]

    pw_hash, salt_hex = hash_password(password)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (email, password_hash, salt, name) VALUES (?, ?, ?, ?)",
            (email, pw_hash, salt_hex, name)
        )
        user_id = cursor.lastrowid
        conn.commit()
        return {"id": user_id, "email": email, "name": name}, None
    except sqlite3.IntegrityError:
        return None, "Email này đã được đăng ký. Vui lòng đăng nhập!"
    except Exception as e:
        return None, f"Lỗi hệ thống: {str(e)}"
    finally:
        conn.close()

def authenticate_user(email: str, password: str) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    email = email.strip().lower()
    if not email or not password:
        return None, "Vui lòng nhập email và mật khẩu"

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, email, password_hash, salt, name FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        if not row:
            return None, "Email hoặc mật khẩu không chính xác"
        
        if not verify_password(password, row["password_hash"], row["salt"]):
            return None, "Email hoặc mật khẩu không chính xác"
        
        return {"id": row["id"], "email": row["email"], "name": row["name"]}, None
    finally:
        conn.close()

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, email, name, created_at FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            return {"id": row["id"], "email": row["email"], "name": row["name"], "created_at": str(row["created_at"])}
        return None
    finally:
        conn.close()

def get_user_plans(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT plans_json FROM user_plans WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            return json.loads(row["plans_json"])
        return None
    finally:
        conn.close()

def save_user_plans(user_id: int, plans_data: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        plans_str = json.dumps(plans_data, ensure_ascii=False)
        cursor.execute("""
            INSERT INTO user_plans (user_id, plans_json, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                plans_json = excluded.plans_json,
                updated_at = CURRENT_TIMESTAMP
        """, (user_id, plans_str))
        conn.commit()
    finally:
        conn.close()

def get_user_patrimoine(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT patrimoine_json FROM user_patrimoine WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            return json.loads(row["patrimoine_json"])
        return None
    finally:
        conn.close()

def save_user_patrimoine(user_id: int, patrimoine_data: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        pat_str = json.dumps(patrimoine_data, ensure_ascii=False)
        cursor.execute("""
            INSERT INTO user_patrimoine (user_id, patrimoine_json, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                patrimoine_json = excluded.patrimoine_json,
                updated_at = CURRENT_TIMESTAMP
        """, (user_id, pat_str))
        conn.commit()
    finally:
        conn.close()
