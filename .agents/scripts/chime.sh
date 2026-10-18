#!/bin/bash
# Phát âm thanh chuông Glass của macOS trong background
afplay /System/Library/Sounds/Glass.aiff &

# Gửi thông báo banner lên macOS (nếu có quyền)
osascript -e 'display notification "Task Antigravity đã hoàn thành!" with title "Antigravity"' 2>/dev/null &

# Trả về JSON hợp lệ cho Antigravity Hook
echo '{}'
