import os
import sys
import webbrowser
from pathlib import Path
import uvicorn

# Nạp file .env nếu có
BASE_DIR = Path(__file__).resolve().parent
env_file = BASE_DIR / ".env"
if env_file.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(env_file, override=False)
    except Exception:
        pass
    try:
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k and k not in os.environ and v:
                    os.environ[k] = v
    except Exception:
        pass

def start():
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", 8000))
    gemini_key = os.environ.get("GEMINI_API_KEY")
    masked_key = f"{gemini_key[:4]}...{gemini_key[-4:]}" if gemini_key and len(gemini_key) > 8 else ("Chưa cấu hình (có thể thêm vào .env)" if not gemini_key else "Đã thiết lập")

    print("=" * 60)
    print("🚀 Khởi động pyRetrait - Nền tảng Hoạch định Nghỉ hưu sớm & FIRE")
    print(f"📍 Truy cập ứng dụng tại: http://{host}:{port}")
    print(f"✨ Trạng thái Gemini AI: {masked_key}")
    print("=" * 60)
    uvicorn.run("backend.main:app", host=host, port=port, reload=True, log_level="info")

if __name__ == "__main__":
    start()
