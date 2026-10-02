#!/bin/bash
# ==============================================================================
# pyRetrait - Script Tự Động Đồng Bộ & Nâng Cấp Lên Server VPS
# Cách dùng trên Mac: ./deploy.sh
# ==============================================================================

VPS_IP="144.217.95.231"
VPS_USER="ubuntu"
REMOTE_DIR="~/pyRetrait"

echo "=========================================================="
echo "🚀 Đang bắt đầu cập nhật pyRetrait lên server: ${VPS_IP}"
echo "=========================================================="

# 1. Đồng bộ mã nguồn (loại trừ git và database người dùng trên server)
echo "📦 Bước 1/2: Đang đồng bộ các file mới..."
rsync -avz --progress \
  --exclude '.git' \
  --exclude 'data/pyretrait.db' \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude '.DS_Store' \
  --exclude 'node_modules' \
  ./ ${VPS_USER}@${VPS_IP}:${REMOTE_DIR}/

if [ $? -ne 0 ]; then
  echo "❌ Lỗi khi đồng bộ file lên server. Vui lòng kiểm tra kết nối SSH."
  exit 1
fi

# 2. Rebuild container trên VPS
echo "🐳 Bước 2/2: Đang kích hoạt mã nguồn và build lại container trên VPS..."
ssh ${VPS_USER}@${VPS_IP} "cd ${REMOTE_DIR} && docker compose up -d --build"

echo "=========================================================="
echo "🎉 CẬP NHẬT THÀNH CÔNG!"
echo "👉 Truy cập ngay: http://${VPS_IP}:8080/"
echo "=========================================================="
