# 🚀 Hướng Dẫn Nâng Cấp & Cập Nhật Mã Nguồn Lên Máy Chủ (VPS)

> **pyRetrait — Quy trình Triển khai & Cập nhật liên tục (CI/CD Thủ công)**

Tài liệu này hướng dẫn chi tiết các bước để khi bạn sửa đổi hoặc phát triển thêm tính năng mới trên máy tính (Mac), bạn có thể **cập nhật phiên bản mới nhất lên máy chủ VPS** nhanh chóng, an toàn và **không làm mất dữ liệu người dùng**.

---

## 🔒 Nguyên Tắc An Toàn Dữ Liệu
> [!IMPORTANT]
> Toàn bộ tài khoản và kế hoạch của người dùng được lưu trong thư mục `./data` (cụ thể là file `data/pyretrait.db`). Thư mục này đã được gắn kết độc lập (*Volume Mount*) vào Docker trong file `docker-compose.yml`:
> ```yaml
> volumes:
>   - ./data:/app/data
> ```
> **Do đó, việc bạn nâng cấp mã nguồn và build lại container Docker sẽ KHÔNG BAO GIỜ làm mất dữ liệu người dùng.**

---

## 📋 Cách 1: Nâng Cấp Qua GitHub (Khuyên dùng - Chuẩn quy trình)

Đây là quy trình chuẩn mực và tiện lợi nhất nếu bạn quản lý mã nguồn trên GitHub.

### Bước 1: Đẩy mã nguồn mới từ máy Mac lên GitHub
Mở Terminal trên máy Mac của bạn và chạy:

```bash
cd /Users/canhhung/Documents/pyRetrait

# 1. Kiểm tra các file đã chỉnh sửa
git status

# 2. Gom tất cả các thay đổi và commit
git add .
git commit -m "Nâng cấp tính năng mới"

# 3. Đẩy code lên GitHub
git push origin main
```

*(Mẹo: Nếu Terminal hỏi `Username` và `Password`, hãy nhập `c4home` và dán mã **GitHub Personal Access Token** `ghp_...` vào ô Password).*

---

### Bước 2: Kéo code mới và kích hoạt trên VPS
Kết nối SSH vào máy chủ VPS của bạn (`ssh ubuntu@<IP_VPS>`), sau đó chạy:

```bash
# 1. Di chuyển vào thư mục dự án
cd ~/pyRetrait

# 2. Tải toàn bộ code mới nhất về
git pull origin main

# 3. Rebuild và khởi động lại container với code mới
docker compose up -d --build
```

🎉 **Xong!** Ứng dụng đã được cập nhật phiên bản mới nhất trên VPS sau khoảng 5–10 giây.

---

## ⚡ Cách 2: Đồng Bộ Trực Tiếp Bằng `rsync` (Nhanh nhất - Không cần qua GitHub)

Nếu bạn đang thử nghiệm và muốn **đẩy code thẳng từ máy Mac lên VPS ngay lập tức** mà không muốn phải commit/push lên GitHub mỗi lần sửa:

### Chạy 1 lệnh duy nhất trên máy Mac:

```bash
rsync -avz --exclude '.git' --exclude 'data/pyretrait.db' --exclude '__pycache__' \
  /Users/canhhung/Documents/pyRetrait/ ubuntu@<IP_VPS>:~/pyRetrait/
```
*(Thay `<IP_VPS>` bằng địa chỉ IP máy chủ của bạn).*

> ⚠️ **Lưu ý quan trọng:** Tham số `--exclude 'data/pyretrait.db'` giúp đảm bảo file database chứa tài khoản người dùng trên VPS không bị ghi đè bởi file database trên máy tính của bạn.

Sau đó, trên VPS chỉ cần chạy:
```bash
cd ~/pyRetrait && docker compose up -d --build
```

---

## 🤖 Cách 3: Tự Động Hóa 1 Click Bằng Script `deploy.sh`

Bạn có thể tạo một script tự động trên máy Mac để mỗi lần muốn nâng cấp server, chỉ cần gõ đúng **1 lệnh duy nhất**.

Tạo file `deploy.sh` trong thư mục dự án trên Mac:
```bash
#!/bin/bash
VPS_IP="144.217.95.231"
VPS_USER="ubuntu"

echo "📦 Đang đồng bộ mã nguồn sang VPS..."
rsync -avz --exclude '.git' --exclude 'data/pyretrait.db' --exclude '__pycache__' \
  ./ ${VPS_USER}@${VPS_IP}:~/pyRetrait/

echo "🐳 Đang rebuild Docker container trên VPS..."
ssh ${VPS_USER}@${VPS_IP} "cd ~/pyRetrait && docker compose up -d --build"

echo "✅ Cập nhật hoàn tất thành công!"
```

Mỗi lần nâng cấp, trên máy Mac bạn chỉ cần gõ:
```bash
./deploy.sh
```

---

## 🛠️ Các Lệnh Kiểm Tra Hữu Ích Trên VPS

| Tình huống | Lệnh trên VPS |
| :--- | :--- |
| **Xem ứng dụng có chạy không** | `docker compose ps` |
| **Xem log lỗi trực tiếp (Live logs)** | `docker compose logs -f` |
| **Khởi động lại ứng dụng** | `docker compose restart` |
| **Tắt ứng dụng** | `docker compose down` |
| **Dọn dẹp các image Docker cũ giải phóng ổ cứng** | `docker image prune -f` |
| **Sao lưu (Backup) cơ sở dữ liệu** | `cp ~/pyRetrait/data/pyretrait.db ~/pyretrait_backup_$(date +%F).db` |

---
*Tài liệu đính kèm hệ thống pyRetrait — Hướng dẫn DevOps & Vận hành.*
