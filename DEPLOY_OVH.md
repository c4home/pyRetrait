# 🚀 Hướng Dẫn Triển Khai pyRetrait Lên Máy Chủ OVH

Tài liệu này hướng dẫn chi tiết từng bước để đưa ứng dụng **pyRetrait** lên máy chủ OVH (VPS hoặc Dedicated Server chạy Ubuntu/Debian), giúp bạn bè hoặc gia đình có thể truy cập qua Internet 24/7.

---

## 🎯 Chọn Cách Triển Khai Phù Hợp

| Cách | Ưu điểm | Phù hợp với |
|---|---|---|
| **Cách 1: Docker (Khuyên dùng)** | Nhanh, chuẩn hóa, không lo xung đột môi trường Python | Đa số người dùng |
| **Cách 2: Systemd + Nginx + SSL** | Chạy trực tiếp, có tên miền riêng & HTTPS miễn phí | Khi có tên miền (domain) |
| **Cách 3: Cloudflare Tunnel** | Chia sẻ tức thì từ máy tính cá nhân qua mạng Internet trong 1 phút | Thử nghiệm nhanh |

---

## 🐳 CÁCH 1: Triển khai nhanh bằng Docker & Docker Compose (Khuyên dùng)

### Bước 1: Kết nối SSH vào máy chủ OVH
Mở Terminal trên máy tính của bạn và gõ:
```bash
ssh root@<IP_MAY_CHU_OVH>
# hoặc: ssh ubuntu@<IP_MAY_CHU_OVH>
```

### Bước 2: Cài đặt Docker (Nếu máy chủ chưa có)
```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker & Docker Compose plugin
sudo apt install -y docker.io docker-compose-plugin git

# Khởi động dịch vụ Docker
sudo systemctl enable --now docker
```

### Bước 3: Đưa mã nguồn pyRetrait lên OVH
Bạn có thể clone từ Git repository của bạn:
```bash
cd /opt
git clone https://github.com/<tai-khoan-cua-ban>/pyRetrait.git
cd pyRetrait
```
*(Hoặc dùng lệnh `scp -r /Users/canhhung/Documents/pyRetrait root@<IP_OVH>:/opt/` từ máy tính nếu chưa đẩy lên GitHub).*

### Bước 4: Tạo file cấu hình `.env` (bắt buộc đặt khóa bảo mật)
`docker-compose.yml` đọc biến môi trường từ file `.env`, nên cần tạo file này trước khi chạy:
```bash
cp .env.example .env

# Sinh khóa ký JWT ngẫu nhiên và ghi vào .env
SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(48))")
sed -i "s|^PYRETRAIT_SECRET_KEY=.*|PYRETRAIT_SECRET_KEY=$SECRET|" .env
```
- **`PYRETRAIT_SECRET_KEY`** (tối thiểu 32 ký tự): khóa ký token đăng nhập. Nếu để trống, backend tự sinh khóa ngẫu nhiên và in cảnh báo; khi đó **mọi người dùng phải đăng nhập lại sau mỗi lần restart container**. Nếu đổi khóa, token cũ cũng mất hiệu lực. Tuyệt đối không commit file `.env`.
- **`CORS_ORIGINS`** (tùy chọn): mặc định chỉ cho phép `localhost`/`127.0.0.1`. Giao diện web và API cùng một origin nên chạy qua Docker hoặc Nginx **không cần đặt**. Chỉ khai báo khi có frontend ở domain khác, ví dụ `CORS_ORIGINS=https://fire.yourdomain.com`.
- Điền thêm `GEMINI_API_KEY` nếu muốn dùng Gemini AI mặc định cho mọi người dùng.

### Bước 5: Khởi chạy container
```bash
docker compose up -d --build

# Kiểm tra không còn cảnh báo thiếu khóa bảo mật
docker compose logs | grep -i SECRET_KEY || echo "OK: khóa bảo mật đã được cấu hình"
```

### Bước 6: Mở cổng Firewall trên OVH (Nếu có UFW)
```bash
sudo ufw allow 8080/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

🎉 **Xong!** Bạn và bạn bè có thể truy cập ứng dụng ngay tại:
```
http://<IP_MAY_CHU_OVH>:8080
```

---

## 🌐 CÁCH 2: Cài đặt chuyên nghiệp với Tên Miền riêng & HTTPS (Nginx + SSL Let's Encrypt)

Nếu bạn có một tên miền (ví dụ `fire.yourdomain.com`), hãy làm theo các bước sau để web có ổ khóa xanh **HTTPS**:

### Bước 1: Trỏ DNS tên miền về IP OVH
Vào trang quản trị Domain của bạn (OVH, Cloudflare, Namecheap...), tạo một bản ghi **A Record**:
- **Type**: `A`
- **Name**: `fire` (hoặc `@` nếu dùng domain chính)
- **Content / Value**: `<IP_MAY_CHU_OVH>`

### Bước 2: Cài đặt Nginx & Certbot trên OVH
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Bước 3: Tạo cấu hình Nginx Reverse Proxy
Tạo file cấu hình:
```bash
sudo nano /etc/nginx/sites-available/pyretrait
```
Dán nội dung sau vào file (thay `fire.yourdomain.com` bằng tên miền của bạn):
```nginx
server {
    server_name fire.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Lưu lại (`Ctrl + O`, `Enter`, `Ctrl + X`), sau đó kích hoạt cấu hình:
```bash
sudo ln -s /etc/nginx/sites-available/pyretrait /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 4: Tạo chứng chỉ SSL Let's Encrypt miễn phí
```bash
sudo certbot --nginx -d fire.yourdomain.com
```
Certbot sẽ tự động cấu hình HTTPS và tự động gia hạn khi hết hạn.

Bây giờ bạn bè của bạn có thể truy cập qua đường link chuyên nghiệp:
```
https://fire.yourdomain.com
```

---

## ⚡ CÁCH 3: Chia sẻ trực tiếp từ máy Mac trong 1 phút (Cloudflare Tunnel miễn phí)

Nếu bạn muốn bạn bè thử nghiệm ngay lập tức mà chưa muốn cài đặt gì lên máy chủ OVH:

1. **Cài Cloudflared trên máy Mac**:
   ```bash
   brew install cloudflared
   ```
2. **Khởi chạy đường hầm tức thì** (trong khi `python3 run.py` vẫn đang chạy trên máy bạn):
   ```bash
   cloudflared tunnel --url http://127.0.0.1:8000
   ```
3. Cloudflare sẽ tạo ra một đường link công khai dạng:
   `https://random-name.trycloudflare.com`
4. Gửi đường link đó cho bạn bè của bạn là họ có thể trải nghiệm ngay lập tức trên điện thoại hoặc máy tính!

---

## 💡 Lưu Ý Quan Trọng Khi Thử Nghiệm

1. **Bảo mật Dữ liệu**:
   - Dữ liệu kế hoạch được lưu trữ cục bộ trong thư mục `data/plans.json`. Khi triển khai qua Docker, thư mục này đã được mount tự động (`- ./data:/app/data`) nên không bị mất khi restart container.
2. **Cấu hình Google Gemini**:
   - Trên web, bạn bè có thể bấm nút `✨ Gemini AI` ở góc trên bên phải để nhập API Key riêng nếu muốn gọi trực tiếp model Gemini 2.5 Flash, hoặc hệ thống sẽ tự động dùng bộ máy Gemini Intelligence tích hợp sẵn.
3. **Lệnh quản lý Docker hữu ích**:
   ```bash
   # Xem trạng thái container
   docker compose ps

   # Xem log hoạt động theo thời gian thực
   docker compose logs -f

   # Khởi động lại
   docker compose restart

   # Cập nhật code mới
   git pull && docker compose up -d --build
   ```
