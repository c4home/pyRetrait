#!/bin/bash
# ==============================================================================
# pyRetrait - Script Tự Động Đồng Bộ & Nâng Cấp Lên Server VPS
# Cách dùng trên Mac: ./deploy.sh
# ==============================================================================

VPS_IP="144.217.95.231"
VPS_USER="ubuntu"
REMOTE_DIR="~/pyRetrait"

echo "=========================================================="
echo "Đang bắt đầu kiểm tra an toàn & cập nhật pyRetrait lên server: ${VPS_IP}"
echo "=========================================================="

# 0. Chạy kiểm tra cú pháp & an toàn trước khi đẩy lên server
if [ -x "./verify_js.sh" ]; then
  echo "Bước 0/2: Kiểm tra cú pháp mã nguồn..."
  ./verify_js.sh || { echo "Lỗi cú pháp JS! Đã hủy quá trình upload để bảo vệ server."; exit 1; }
fi

# 1. Đồng bộ mã nguồn (TUYỆT ĐỐI loại trừ .env, database, settings chứa API key, file nháp preview và thư mục .agents)
echo "Bước 1/2: Đang đồng bộ các file mã nguồn sạch lên server..."
rsync -avz --progress \
  --exclude '.git' \
  --exclude '.env' \
  --exclude '.agents' \
  --exclude '.antigravityignore' \
  --exclude 'data/pyretrait.db*' \
  --exclude 'data/settings.json' \
  --exclude 'data/plans.json' \
  --exclude 'frontend/preview.html' \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude '.DS_Store' \
  --exclude 'node_modules' \
  ./ ${VPS_USER}@${VPS_IP}:${REMOTE_DIR}/

if [ $? -ne 0 ]; then
  echo "Lỗi khi đồng bộ file lên server. Vui lòng kiểm tra kết nối SSH."
  exit 1
fi

# 2. Tự động sao lưu Database trên VPS (giữ 10 bản gần nhất) & Rebuild container
echo "Bước 2/2: Đang tự động sao lưu Database người dùng và khởi động lại container trên VPS..."
ssh ${VPS_USER}@${VPS_IP} "cd ${REMOTE_DIR} && mkdir -p data/backups && if [ -f data/pyretrait.db ]; then cp data/pyretrait.db data/backups/pyretrait_\$(date +%Y%m%d_%H%M%S).db && ls -1t data/backups/pyretrait_*.db 2>/dev/null | tail -n +11 | xargs -r rm -f; fi && docker compose up -d --build"

echo "=========================================================="
echo "CẬP NHẬT THÀNH CÔNG & AN TOÀN!"
echo "Truy cập ngay: http://${VPS_IP}:8080/"
echo "=========================================================="
