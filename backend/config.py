"""Cấu hình bảo mật của backend: khóa ký JWT và danh sách CORS.

Module này tự nạp file `.env` TRƯỚC khi đọc biến môi trường, nên kết quả đúng
dù ứng dụng được khởi động bằng `run.py`, `uvicorn` trực tiếp hay Docker.
Không chứa logic tính toán tài chính.
"""
import logging
import os
import secrets
from pathlib import Path
from typing import List

logger = logging.getLogger("pyRetrait")

BASE_DIR = Path(__file__).resolve().parent.parent

# Khóa JWT tối thiểu 32 ký tự để chống brute-force HMAC-SHA256
MIN_SECRET_LENGTH = 32


def load_env_file(env_path: Path) -> None:
    """Nạp biến môi trường từ file .env (không ghi đè biến đã có sẵn).

    Args:
        env_path: Đường dẫn tới file .env.
    """
    if not env_path.exists():
        return
    try:
        from dotenv import load_dotenv
        load_dotenv(env_path, override=False)
    except Exception:
        pass
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip("'\"")
                if key and key not in os.environ and value:
                    os.environ[key] = value
    except Exception:
        pass


load_env_file(BASE_DIR / ".env")


def _resolve_secret_key() -> bytes:
    """Lấy khóa ký JWT từ PYRETRAIT_SECRET_KEY; nếu thiếu/quá ngắn thì sinh khóa ngẫu nhiên.

    Khóa ngẫu nhiên chỉ sống trong một lần chạy: token đã cấp sẽ mất hiệu lực khi
    restart (người dùng phải đăng nhập lại). Không bao giờ ghi khóa ra log.

    Returns:
        Khóa dạng bytes dùng để ký/xác thực JWT.
    """
    configured = os.environ.get("PYRETRAIT_SECRET_KEY", "").strip()
    if len(configured) >= MIN_SECRET_LENGTH:
        return configured.encode("utf-8")

    reason = "chưa được đặt" if not configured else f"quá ngắn (<{MIN_SECRET_LENGTH} ký tự)"
    logger.warning(
        "PYRETRAIT_SECRET_KEY %s trong .env — dùng khóa ngẫu nhiên tạm thời. "
        "Token đăng nhập sẽ mất hiệu lực mỗi lần restart. "
        "Tạo khóa cố định: python3 -c \"import secrets; print(secrets.token_urlsafe(48))\"",
        reason,
    )
    return secrets.token_urlsafe(48).encode("utf-8")


SECRET_KEY: bytes = _resolve_secret_key()


def get_cors_origins() -> List[str]:
    """Danh sách origin được phép gọi API, đọc từ biến CORS_ORIGINS (ngăn cách bởi dấu phẩy).

    Mặc định chỉ cho phép 127.0.0.1 và localhost theo cổng PORT (môi trường dev).
    Giao diện web được phục vụ cùng origin với API nên production sau Nginx/Docker
    thường không cần đặt biến này.

    Returns:
        Danh sách origin hợp lệ.
    """
    raw = os.environ.get("CORS_ORIGINS", "").strip()
    if raw:
        origins = [o.strip().rstrip("/") for o in raw.split(",") if o.strip()]
        if "*" in origins:
            logger.warning("CORS_ORIGINS chứa '*' — chỉ nên dùng khi thử nghiệm, không dùng cho production.")
        return origins
    port = os.environ.get("PORT", "8000")
    return [f"http://127.0.0.1:{port}", f"http://localhost:{port}"]
