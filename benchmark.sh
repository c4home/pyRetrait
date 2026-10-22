#!/usr/bin/env bash
# benchmark.sh — Đo toàn diện hiệu suất app (Mã nguồn, Dung lượng, Tốc độ Engine, Test)
# Cách dùng: ./benchmark.sh ["ghi chú ngắn"]
set -u
cd "$(dirname "$0")"

LOG="docs/BENCHMARK_LOG.md"
NOTE="${1:-}"
DATE="$(date +%Y-%m-%d\ %H:%M)"
COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo "n/a")"

# 1. Đo quy mô mã nguồn (JS + CSS + HTML frontend)
FILES=$(ls frontend/js/*.js frontend/css/*.css frontend/index.html 2>/dev/null)
TOTAL_LINES=$(cat $FILES | wc -l | tr -d ' ')
BIGGEST=$(wc -l $FILES | grep -v ' total$' | sort -rn | head -1)
BIGGEST_LINES=$(echo "$BIGGEST" | awk '{print $1}')
BIGGEST_NAME=$(basename "$(echo "$BIGGEST" | awk '{print $2}')")
OVER_2000=$(wc -l $FILES | grep -v ' total$' | awk '$1 > 2000' | wc -l | tr -d ' ')

# 2. Đo dung lượng tải
RAW_KB=$(( $(cat $FILES | wc -c) / 1024 ))
GZIP_KB=$(( $(cat $FILES | gzip -c | wc -c) / 1024 ))

# 3. Đo tốc độ tính toán Core Engine qua Node.js (5 lần lấy trung bình)
ENGINE_METRICS=$(node -e "
  const fs = require('fs');
  const vm = require('vm');
  global.window = global;
  global.localStorage = { getItem: () => null, setItem: () => {} };
  global.document = { addEventListener: () => {}, getElementById: () => null, querySelectorAll: () => [], querySelector: () => null, documentElement: { getAttribute: () => 'dark', setAttribute: () => {} } };
  global.navigator = { userAgent: 'node' };
  for (const f of ['frontend/js/state.js', 'frontend/js/taxOptimizer.js', 'frontend/js/monteCarlo.js', 'frontend/js/engine.js', 'frontend/js/patrimoine.js']) {
    try { vm.runInThisContext(fs.readFileSync(f, 'utf8')); } catch(e) {}
  }
  const plan = (typeof AppState !== 'undefined' && AppState.plan) ? AppState.plan : (typeof ensurePlanDefaults === 'function' ? ensurePlanDefaults({}) : {});
  let projMs = 0;
  if (typeof RetirementEngine !== 'undefined' && RetirementEngine.runProjection) {
    const t0 = Date.now();
    for (let i = 0; i < 5; i++) RetirementEngine.runProjection(plan);
    projMs = ((Date.now() - t0) / 5).toFixed(1);
  }
  let mcMs = 0;
  if (typeof MonteCarloSimulator !== 'undefined' && MonteCarloSimulator.runSimulation) {
    const t1 = Date.now();
    MonteCarloSimulator.runSimulation(plan, 1000);
    mcMs = (Date.now() - t1).toFixed(1);
  }
  console.log(projMs + ' ' + mcMs);
" 2>/dev/null || echo "0.0 0.0")

PROJ_MS=$(echo "$ENGINE_METRICS" | awk '{print $1}')
MC_MS=$(echo "$ENGINE_METRICS" | awk '{print $2}')

# 4. Kiểm thử logic & tuân thủ bằng verify_js.sh
VERIFY_OUT="$(./verify_js.sh 2>&1)"
PASS=$(echo "$VERIFY_OUT" | grep -cE '\[(OK|PASS)\]')
FAIL=$(echo "$VERIFY_OUT" | grep -cE '\[FAIL\]')

# 5. Đọc số liệu mốc trước từ docs/BENCHMARK_LOG.md
PREV_LINE=$(grep -E '^\| [0-9]{4}-' "$LOG" 2>/dev/null | tail -1 || true)
PREV_TOTAL_LINES=""
PREV_GZIP=""
PREV_PROJ=""
PREV_MC=""
PREV_OVER_2000=""

if [ -n "$PREV_LINE" ]; then
  PREV_TOTAL_LINES=$(echo "$PREV_LINE" | awk -F'|' '{gsub(/ /,"",$4); print $4}')
  PREV_OVER_2000=$(echo "$PREV_LINE" | awk -F'|' '{gsub(/ /,"",$6); print $6}')
  PREV_GZIP=$(echo "$PREV_LINE" | awk -F'|' '{gsub(/ /,"",$7); print $7}')
  PREV_PROJ=$(echo "$PREV_LINE" | awk -F'|' '{gsub(/ /,"",$8); print $8}')
  PREV_MC=$(echo "$PREV_LINE" | awk -F'|' '{gsub(/ /,"",$9); print $9}')
fi

# Hàm định dạng delta và icon
calc_diff() {
  local cur="$1"
  local prev="$2"
  local unit="$3"
  local invert="$4" # 0: càng giảm càng tốt (lines, ms, gzip); 1: càng tăng càng tốt

  if [ -z "$prev" ] || [ "$prev" = "n/a" ] || [ "$prev" = "0" ]; then
    echo "--- (mốc đầu)"
    return
  fi

  # Tính hiệu số
  local diff=$(python3 -c "print(round($cur - $prev, 1))" 2>/dev/null || echo "0")
  local is_neg=$(python3 -c "print(1 if $diff < 0 else 0)" 2>/dev/null || echo "0")
  local is_zero=$(python3 -c "print(1 if $diff == 0 else 0)" 2>/dev/null || echo "0")

  if [ "$is_zero" = "1" ]; then
    echo "➡️ Không đổi"
  elif [ "$invert" = "0" ]; then
    # Càng giảm càng tốt (ms, gzip, file>2000)
    if [ "$is_neg" = "1" ]; then
      echo "📉 Giảm ${diff#-}${unit} (🟢 TỐT)"
    else
      echo "📈 Tăng +${diff}${unit} (🟡 Cần theo dõi)"
    fi
  else
    # Càng tăng càng tốt (test pass)
    if [ "$is_neg" = "1" ]; then
      echo "📉 Giảm ${diff#-}${unit} (🔴 CẢNH BÁO)"
    else
      echo "📈 Tăng +${diff}${unit} (🟢 TỐT)"
    fi
  fi
}

TREND_GZIP=$(calc_diff "$GZIP_KB" "${PREV_GZIP:-}" " KB" 0)
TREND_PROJ=$(calc_diff "$PROJ_MS" "${PREV_PROJ:-}" " ms" 0)
TREND_MC=$(calc_diff "$MC_MS" "${PREV_MC:-}" " ms" 0)
TREND_OVER=$(calc_diff "$OVER_2000" "${PREV_OVER_2000:-}" " file" 0)

# Đánh giá tổng quan
STATUS_VERDICT="🟢 BẢN MỚI TỐT HƠN / ĐẠT CHUẨN"
if [ "$FAIL" -gt 0 ]; then
  STATUS_VERDICT="🔴 CẢNH BÁO: CÓ $FAIL BÀI TEST BỊ THẤT BẠI!"
fi

# Khởi tạo bảng log nếu chưa tồn tại
if [ ! -f "$LOG" ] || ! grep -q "Monte Carlo" "$LOG"; then
  cat > "$LOG" <<'EOF'
# Nhật Ký Đo Hiệu Suất (Benchmark Log)

Tạo tự động bởi `./benchmark.sh`. Mỗi lần đo ghi lại 1 mốc hoàn chỉnh (Mã nguồn, Dung lượng, Tốc độ Engine, Test).

| Thời gian | Commit | Tổng dòng | File lớn nhất | File >2k dòng | Gzip (KB) | Projection (ms) | Monte Carlo (ms) | Test (OK/FAIL) | Đánh giá | Ghi chú |
| :--- | :--- | ---: | :--- | ---: | ---: | ---: | ---: | :--- | :--- | :--- |
EOF
fi

# Ghi vào file log
echo "| $DATE | $COMMIT | $TOTAL_LINES | $BIGGEST_NAME ($BIGGEST_LINES) | $OVER_2000 | $GZIP_KB | $PROJ_MS | $MC_MS | $PASS / $FAIL | $STATUS_VERDICT | $NOTE |" >> "$LOG"

# Hiển thị trực quan ra màn hình Terminal
echo ""
echo "================================================================================"
echo "          📊 BẢNG THEO DÕI HIỆU SUẤT TOÀN DIỆN (APP BENCHMARK)                "
echo "================================================================================"
echo " Thời điểm đo : $DATE (Git Commit: $COMMIT)"
echo " Ghi chú      : ${NOTE:-"(Không có ghi chú)"}"
echo "--------------------------------------------------------------------------------"
printf "%-26s | %-16s | %-16s | %-16s\n" "Nhóm chỉ số" "Hiện tại" "Mục tiêu chuẩn" "So với lần trước"
echo "--------------------------------------------------------------------------------"
printf "%-26s | %-16s | %-16s | %-16s\n" "1. Dung lượng nén Gzip" "${GZIP_KB} KB" "< 450 KB" "$TREND_GZIP"
printf "%-26s | %-16s | %-16s | %-16s\n" "2. Tính dòng tiền (5 lần)" "${PROJ_MS} ms" "< 30 ms" "$TREND_PROJ"
printf "%-26s | %-16s | %-16s | %-16s\n" "3. Monte Carlo (1.000 run)" "${MC_MS} ms" "< 400 ms" "$TREND_MC"
printf "%-26s | %-16s | %-16s | %-16s\n" "4. File phình to >2.000 dòng" "$OVER_2000 file" "0 file" "$TREND_OVER"
printf "%-26s | %-16s | %-16s | %-16s\n" "5. File lớn nhất hiện tại" "$BIGGEST_NAME" "< 2.000 dòng" "$BIGGEST_LINES dòng"
printf "%-26s | %-16s | %-16s | %-16s\n" "6. Kiểm thử tự động" "$PASS OK / $FAIL FAIL" "100% OK, 0 FAIL" "$( [ "$FAIL" -eq 0 ] && echo "🟢 Đạt tuyệt đối" || echo "🔴 CÓ LỖI FAIL" )"
echo "--------------------------------------------------------------------------------"
echo " Kết luận: $STATUS_VERDICT"
echo " Đã lưu kết quả vào: $LOG"
echo "================================================================================"
echo ""
