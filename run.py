import sys
import webbrowser
import uvicorn
from backend.main import app

def start():
    print("=" * 60)
    print("🚀 Khởi động pyRetrait - Nền tảng Hoạch định Nghỉ hưu sớm & FIRE")
    print("📍 Truy cập ứng dụng tại: http://localhost:8000")
    print("=" * 60)
    # Tự động mở trình duyệt sau khi khởi động
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

if __name__ == "__main__":
    start()
