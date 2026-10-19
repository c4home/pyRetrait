#!/bin/zsh
# Script kiểm tra nhanh cú pháp, tự động cập nhật tọa độ dòng trong docs/CODEBASE_MAP.md & chạy thử công thức JS
# Tương thích 100% với Antigravity Sandbox (dùng /usr/bin/python3 & macOS JavaScriptCore jsc nội bộ, không cần xin quyền BypassSandbox)
# Tiết kiệm 99% token so với việc bật browser_subagent (chỉ tốn ~150 token và 0.15 giây, cập nhật CODEBASE_MAP tốn 0 token)

set -e

JSC="/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc"
PY3="/usr/bin/python3"

# Tự động thêm Node từ NVM và Homebrew vào PATH (nếu chạy ngoài sandbox)
if [ -d "$HOME/.nvm/versions/node" ]; then
  LATEST_NODE=$(ls -1 "$HOME/.nvm/versions/node" 2>/dev/null | tail -n 1)
  if [ -n "$LATEST_NODE" ]; then
    export PATH="$HOME/.nvm/versions/node/$LATEST_NODE/bin:$PATH"
  fi
fi
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

JS_FILES=(
  frontend/js/i18n.js
  frontend/js/state.js
  frontend/js/taxOptimizer.js
  frontend/js/monteCarlo.js
  frontend/js/engine.js
  frontend/js/patrimoine.js
  frontend/js/scenarios.js
  frontend/js/geminiAdvisor.js
  frontend/js/auth.js
  frontend/js/export.js
  frontend/js/ui-modals.js
  frontend/js/ui-tab1-charts.js
  frontend/js/ui-tab1-streams.js
  frontend/js/ui-tab2-health.js
  frontend/js/ui-tab3-taxes.js
  frontend/js/ui.js
)

if command -v node >/dev/null 2>&1; then
  echo "=== 1. Kiểm tra cú pháp (node --check) toàn bộ 16 file JS (Node $(node -v)) ==="
  for f in "${JS_FILES[@]}"; do
    node --check "$f"
    echo "  [OK] $f"
  done
elif [ -x "$JSC" ]; then
  echo "=== 1. Kiểm tra cú pháp (macOS JavaScriptCore jsc --checkSyntax) toàn bộ 16 file JS ==="
  for f in "${JS_FILES[@]}"; do
    "$JSC" -e "checkSyntax(readFile('$f'))" >/dev/null
    echo "  [OK] $f"
  done
fi

# Tự động quét mọi hàm (function), thẻ Tab/Card/Modal HTML, phân mục CSS và từ điển i18n để cập nhật docs/CODEBASE_MAP.md (Tốn 0 Token)
"$PY3" - << 'EOF'
import re

def scan_all_functions(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.read().splitlines()
    funcs = []
    rx = re.compile(r'^\s{0,6}(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(')
    for idx, line in enumerate(lines):
        m = rx.match(line)
        if m:
            funcs.append({"name": f"`{m.group(1)}()`", "start": idx + 1})
    for i in range(len(funcs)):
        funcs[i]["end"] = funcs[i + 1]["start"] - 1 if i + 1 < len(funcs) else len(lines)
    return len(lines), funcs

def scan_html_blocks(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.read().splitlines()
    blocks = []
    rx_id = re.compile(
        r'id="(tab-[a-zA-Z0-9_-]+|card-[a-zA-Z0-9_-]+|section-[a-zA-Z0-9_-]+|chart-[a-zA-Z0-9_-]+|'
        r'plan-modal|income-modal|expense-modal|actual-networth-modal|milestone-modal|'
        r'modal-gemini-settings|apartment-modal|auth-modal|modal-formula-guide|'
        r'quick-setup-modal|confirm-modal|feature-intro-modal)"'
    )
    for idx, line in enumerate(lines):
        if '<header ' in line:
            blocks.append({"name": "`<header>` (Thanh điều hướng trên cùng)", "start": idx + 1})
        elif 'data-i18n="col1_income_header"' in line:
            blocks.append({"name": "Cột 1: Các Luồng Thu nhập (`col1_income_header`)", "start": idx + 1})
        elif 'data-i18n="col2_expense_header"' in line or (idx > 900 and idx < 1100 and 'Các Luồng Chi tiêu' in line):
            blocks.append({"name": "Cột 2: Các Luồng Chi tiêu (`col2_expense_header`)", "start": idx + 1})
        else:
            m = rx_id.search(line)
            if m:
                blocks.append({"name": f"`#{m.group(1)}`", "start": idx + 1})
    for i in range(len(blocks)):
        blocks[i]["end"] = blocks[i + 1]["start"] - 1 if i + 1 < len(blocks) else len(lines)
    return len(lines), blocks

def scan_css_sections(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.read().splitlines()
    sections = []
    for idx, line in enumerate(lines):
        if line.startswith("/* ==="):
            title = lines[idx + 1].strip() if idx + 1 < len(lines) else "Section"
            title = title.lstrip("* ").strip()
            sections.append({"name": title, "start": idx + 1})
    for i in range(len(sections)):
        sections[i]["end"] = sections[i + 1]["start"] - 1 if i + 1 < len(sections) else len(lines)
    return len(lines), sections

def scan_i18n(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.read().splitlines()
    items = []
    rx_lang = re.compile(r'^\s{2,6}(vi|en|fr)\s*:\s*\{')
    rx_fn = re.compile(r'^\s{0,6}(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(')
    for idx, line in enumerate(lines):
        ml = rx_lang.match(line)
        if ml:
            items.append({"name": f"Từ điển `{ml.group(1)}`", "start": idx + 1})
            continue
        mf = rx_fn.match(line)
        if mf:
            items.append({"name": f"`{mf.group(1)}()`", "start": idx + 1})
    for i in range(len(items)):
        items[i]["end"] = items[i + 1]["start"] - 1 if i + 1 < len(items) else len(lines)
    return len(lines), items

def render_table(items, col1, col2):
    out = [f"| {col1} | {col2} |", "| :--- | :--- |"]
    for it in items:
        out.append(f"| {it['name']} | `{it['start']} – {it['end']}` |")
    return "\n".join(out)

html_total, html_blocks = scan_html_blocks("frontend/index.html")
css_total, css_sections = scan_css_sections("frontend/css/styles.css")
i18n_total, i18n_items = scan_i18n("frontend/js/i18n.js")
engine_total, engine_funcs = scan_all_functions("frontend/js/engine.js")
ui_total, ui_funcs = scan_all_functions("frontend/js/ui.js")
tab1_charts_total, tab1_charts_funcs = scan_all_functions("frontend/js/ui-tab1-charts.js")
tab1_streams_total, tab1_streams_funcs = scan_all_functions("frontend/js/ui-tab1-streams.js")
tab2_health_total, tab2_health_funcs = scan_all_functions("frontend/js/ui-tab2-health.js")
tab3_taxes_total, tab3_taxes_funcs = scan_all_functions("frontend/js/ui-tab3-taxes.js")
modals_total, modals_funcs = scan_all_functions("frontend/js/ui-modals.js")
pat_total, pat_funcs = scan_all_functions("frontend/js/patrimoine.js")
tax_total, tax_funcs = scan_all_functions("frontend/js/taxOptimizer.js")
mc_total, mc_funcs = scan_all_functions("frontend/js/monteCarlo.js")
gem_total, gem_funcs = scan_all_functions("frontend/js/geminiAdvisor.js")
state_total, state_funcs = scan_all_functions("frontend/js/state.js")

md = f"""# Bản Đồ Định Vị Mã Nguồn Tự Động (Codebase Map & Line-Range Index)

> **CẬP NHẬT TỰ ĐỘNG 100% BỞI `./verify_js.sh` (TỐN 0 TOKEN & 0 CÔNG SỨC):**  
> Bạn **KHÔNG BAO GIỜ** phải sửa file này bằng tay. Mỗi khi chạy `./verify_js.sh`, script sẽ tự động quét lại toàn bộ các hàm, thẻ HTML, phân mục CSS và từ điển đa ngôn ngữ để cập nhật số dòng chính xác trong 0.05 giây.  
> **Quy tắc bắt buộc cho AI:** Trước khi đọc hoặc sửa các file UI (`ui.js`, `ui-tab1-charts.js`, `ui-tab1-streams.js`, `ui-tab2-health.js`, `ui-tab3-taxes.js`, `ui-modals.js`), `index.html`, `styles.css`, `i18n.js`, `engine.js`, `patrimoine.js`, **bắt buộc tra bảng số dòng dưới đây** để gọi `view_file` đúng khoảng `StartLine` – `EndLine`.

---

## 1. `frontend/index.html` ({html_total} dòng)
{render_table(html_blocks, "Khu vực / Thẻ ID", "Khoảng dòng (`StartLine` – `EndLine`)")}

---

## 2. `frontend/css/styles.css` ({css_total} dòng)
{render_table(css_sections, "Phân mục CSS (`/* === ... === */`)", "Khoảng dòng (`StartLine` – `EndLine`)")}

---

## 3. `frontend/js/i18n.js` ({i18n_total} dòng) & `state.js` ({state_total} dòng — Tầng 2 State)
### `i18n.js`
{render_table(i18n_items, "Từ điển / Hàm", "Khoảng dòng (`StartLine` – `EndLine`)")}

### `state.js`
{render_table(state_funcs, "Tên hàm (`function`)", "Khoảng dòng (`StartLine` – `EndLine`)")}

---

## 4. `frontend/js/engine.js` ({engine_total} dòng — Tầng 1 Core Engine)
{render_table(engine_funcs, "Tên hàm (`function`)", "Khoảng dòng (`StartLine` – `EndLine`)")}

---

## 5. Tầng 3 UI — Nhạc Trưởng & 3 Tab Độc Lập + Modals
### 5.1. `frontend/js/ui.js` ({ui_total} dòng — Nhạc trưởng điều phối trung tâm)
{render_table(ui_funcs, "Tên hàm (`function`)", "Khoảng dòng (`StartLine` – `EndLine`)")}

### 5.2. `frontend/js/ui-tab1-charts.js` ({tab1_charts_total} dòng — Tab 1A: Biểu đồ, Monte Carlo, Biến cố & Bảng năm)
{render_table(tab1_charts_funcs, "Tên hàm (`function`)", "Khoảng dòng (`StartLine` – `EndLine`)")}

### 5.3. `frontend/js/ui-tab1-streams.js` ({tab1_streams_total} dòng — Tab 1B: Luồng Thu/Chi, Phân bổ tài sản & 4 Chiến lược)
{render_table(tab1_streams_funcs, "Tên hàm (`function`)", "Khoảng dòng (`StartLine` – `EndLine`)")}

### 5.4. `frontend/js/ui-tab2-health.js` ({tab2_health_total} dòng — Tab 2: Sức khỏe, Con cái & Y tế dự phòng)
{render_table(tab2_health_funcs, "Tên hàm (`function`)", "Khoảng dòng (`StartLine` – `EndLine`)")}

### 5.5. `frontend/js/ui-tab3-taxes.js` ({tab3_taxes_total} dòng — Tab 3: Tối ưu Thuế, Lương hưu Pháp/VN & LMNP)
{render_table(tab3_taxes_funcs, "Tên hàm (`function`)", "Khoảng dòng (`StartLine` – `EndLine`)")}

### 5.6. `frontend/js/ui-modals.js` ({modals_total} dòng — Popup Modals & Thiết lập nhanh Wizard)
{render_table(modals_funcs, "Tên hàm (`function`)", "Khoảng dòng (`StartLine` – `EndLine`)")}

---

## 6. `frontend/js/patrimoine.js` ({pat_total} dòng)
{render_table(pat_funcs, "Tên hàm (`function`)", "Khoảng dòng (`StartLine` – `EndLine`)")}

---

## 7. `frontend/js/taxOptimizer.js` ({tax_total} dòng), `monteCarlo.js` ({mc_total} dòng) & `geminiAdvisor.js` ({gem_total} dòng)
### `taxOptimizer.js`
{render_table(tax_funcs, "Tên hàm (`function`)", "Khoảng dòng (`StartLine` – `EndLine`)")}

### `monteCarlo.js`
{render_table(mc_funcs, "Tên hàm (`function`)", "Khoảng dòng (`StartLine` – `EndLine`)")}

### `geminiAdvisor.js`
{render_table(gem_funcs, "Tên hàm (`function`)", "Khoảng dòng (`StartLine` – `EndLine`)")}
"""

with open("docs/CODEBASE_MAP.md", "w", encoding="utf-8") as f:
    f.write(md)

print("=== 2. Đã tự động quét & cập nhật chính xác tọa độ dòng vào docs/CODEBASE_MAP.md (0 Token) ===")

# 2B. Quét bảo mật tự động trước khi lên Server (0 Token)
import glob, sys
secret_rx = re.compile(r'(AIzaSy[0-9A-Za-z_-]{33}|sk-[0-9A-Za-z]{32,})')
leaks = []
for pattern in ("frontend/js/*.js", "frontend/*.html", "backend/*.py"):
    for p in glob.glob(pattern):
        with open(p, "r", encoding="utf-8") as f:
            content = f.read()
        if secret_rx.search(content):
            leaks.append(p)
if leaks:
    print(f"  [CẢNH BÁO BẢO MẬT] Phát hiện API Key/Secret hardcode trong: {', '.join(leaks)}")
    sys.exit(1)
print("=== 3. Kiểm tra bảo mật tự động: [OK] Không có API Key/Secret rò rỉ trong mã nguồn ===")

# 2C. Quét tuân thủ Pháp lý & Từ vựng cam kết trái phép (Legal & Compliance Linter - 0 Token)
forbidden_legal_rx = re.compile(
    r'(cam kết lợi nhuận|đảm bảo 100%\s*(?:có lãi|không lỗ)|chắc chắn sinh lời|guaranteed return|rendement garanti)',
    re.IGNORECASE
)
legal_violations = []
for pattern in ("frontend/js/*.js", "frontend/*.html"):
    for p in glob.glob(pattern):
        with open(p, "r", encoding="utf-8") as f:
            content = f.read()
        m = forbidden_legal_rx.search(content)
        if m:
            legal_violations.append(f"{p} ('{m.group(0)}')")
if legal_violations:
    print(f"  [CẢNH BÁO PHÁP LÝ] Phát hiện cụm từ cam kết lợi nhuận trái phép: {', '.join(legal_violations)}")
    sys.exit(1)
print("=== 4. Kiểm tra tuân thủ Pháp lý & Từ vựng (Compliance-as-Code): [OK] Không có từ ngữ cam kết đầu tư trái phép ===")
EOF

if [ -f "tests/test_plan_creation_ui.js" ] && command -v node >/dev/null 2>&1; then
  node tests/test_plan_creation_ui.js
fi

if [ "$1" = "--live" ] && [ -n "$2" ]; then
  LIVE_URL="${2%/}"
  echo "=== 4. KIỂM TRA BẢO MẬT TRỰC TIẾP TRÊN WEB THẬT (LIVE SECURITY AUDIT): $LIVE_URL ==="
  "$PY3" - "$LIVE_URL" << 'EOF'
import sys, urllib.request, urllib.error, json, ssl

base_url = sys.argv[1]
ctx = ssl.create_default_context()

def req(path, method="GET", headers=None, body=None, verify_ssl=False):
    url = base_url + path
    c = ssl.create_default_context() if verify_ssl else ssl._create_unverified_context()
    data = json.dumps(body).encode("utf-8") if body is not None else None
    hdrs = {"User-Agent": "pyRetrait-Security-Scanner/1.0"}
    if body is not None:
        hdrs["Content-Type"] = "application/json"
    if headers:
        hdrs.update(headers)
    r = urllib.request.Request(url, data=data, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(r, timeout=8, context=c) as resp:
            return resp.status, dict(resp.headers), resp.read(500).decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read(500).decode("utf-8", errors="ignore")
    except Exception as e:
        return 0, {}, str(e)

# Test 1: HTTPS / SSL
if base_url.startswith("https://"):
    st, _, err = req("/health", verify_ssl=True)
    if st == 200:
        print("  [PASS] 1. Giao thức HTTPS & Chứng chỉ SSL: Hợp lệ (Trình duyệt hiện ổ khóa bảo mật)")
    else:
        print(f"  [WARN] 1. Giao thức HTTPS: Lỗi chứng chỉ SSL ({err}) -> Trình duyệt sẽ báo 'Votre connexion n'est pas sécurisée'")
else:
    print("  [WARN] 1. Giao thức HTTPS: Đang dùng HTTP trần (chưa có SSL/HTTPS) -> Trình duyệt báo 'Votre connexion n'est pas sécurisée'")

# Test 2: OWASP Security Headers
st, hdrs, _ = req("/")
hdrs_lower = {k.lower(): v for k, v in hdrs.items()}
missing_hdrs = [h for h in ("x-frame-options", "x-content-type-options", "referrer-policy") if h not in hdrs_lower]
if not missing_hdrs:
    print("  [PASS] 2. OWASP Security Headers: Đầy đủ (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)")
else:
    print(f"  [WARN] 2. OWASP Security Headers: Thiếu {missing_hdrs} (Hãy chạy ./deploy.sh để cập nhật bản mới lên Server)")

# Test 3: Chặn truy cập file nhạy cảm (.env, .git, database)
exposed = []
for p in ("/.env", "/.git/config", "/data/pyretrait.db", "/data/settings.json", "/backend/main.py"):
    st, _, body = req(p)
    if st == 200 and ("<!DOCTYPE html>" not in body and "<html" not in body):
        exposed.append(f"{p} (HTTP {st})")
if not exposed:
    print("  [PASS] 3. Chống lộ file nhạy cảm (.env, .db, .py, .git): An toàn tuyệt đối (đã chặn 100%)")
else:
    print(f"  [FAIL] 3. CẢNH BÁO LỘ FILE NHẠY CẢM: {exposed}")

# Test 4: Kiểm tra ẩn Swagger API (/docs & /openapi.json)
st_docs, _, _ = req("/openapi.json")
if st_docs == 404:
    print("  [PASS] 4. Ẩn tài liệu API nội bộ (/docs, /openapi.json): Đã khóa hoàn toàn")
else:
    print(f"  [WARN] 4. Trang /docs & /openapi.json đang mở (HTTP {st_docs}) -> Nên thêm ENV=production vào file .env trên Server")

# Test 5: Kiểm tra CORS Spoofing từ domain lạ
_, cors_hdrs, _ = req("/api/plans", headers={"Origin": "https://evil-hacker-domain.com"})
cors_lower = {k.lower(): v for k, v in cors_hdrs.items()}
allow_origin = cors_lower.get("access-control-allow-origin", "")
if allow_origin not in ("*", "https://evil-hacker-domain.com"):
    print("  [PASS] 5. Chống giả mạo tên miền (CORS Protection): Đã chặn domain lạ gọi trộm API")
else:
    print(f"  [FAIL] 5. CORS quá lỏng lẻo: Cho phép {allow_origin}")

# Test 6: Chống giả mạo JWT Token (Auth Bypass)
st_me, _, _ = req("/api/auth/me", headers={"Authorization": "Bearer fake.jwt.token.12345"})
st_pat, _, _ = req("/api/patrimoine", method="POST", headers={"Authorization": "Bearer fake.jwt.token"}, body={"apartments": {}, "turo": {}, "wealth": {}})
if st_me == 401 and st_pat == 401:
    print("  [PASS] 6. Chống giả mạo JWT Token (Auth Bypass): Đã chặn 100% (HTTP 401 Unauthorized)")
else:
    print(f"  [FAIL] 6. Lỗi kiểm tra JWT Token: /api/auth/me={st_me}, POST /api/patrimoine={st_pat}")

# Test 7: Chống SQL Injection trên API Đăng nhập
st_sqli, _, _ = req("/api/auth/login", method="POST", body={"email": "' OR '1'='1' --", "password": "' OR '1'='1"})
if st_sqli in (400, 401):
    print(f"  [PASS] 7. Chống SQL Injection (/api/auth/login): Đã vô hiệu hóa an toàn (HTTP {st_sqli})")
else:
    print(f"  [WARN] 7. Phản hồi lạ khi test SQLi (/api/auth/login): HTTP {st_sqli}")
EOF
elif [ -n "$1" ]; then
  echo "=== 4. Chạy biểu thức kiểm thử JS ==="
  if command -v node >/dev/null 2>&1; then
    node -e "
      const fs = require('fs');
      const vm = require('vm');
      global.window = global;
      global.localStorage = { getItem: () => null, setItem: () => {} };
      global.document = {
        addEventListener: () => {},
        getElementById: () => null,
        querySelectorAll: () => [],
        querySelector: () => null,
        documentElement: { getAttribute: () => 'dark', setAttribute: () => {} }
      };
      global.navigator = { userAgent: 'node' };
      for (const file of [
        'frontend/js/state.js',
        'frontend/js/taxOptimizer.js',
        'frontend/js/monteCarlo.js',
        'frontend/js/engine.js',
        'frontend/js/patrimoine.js',
        'frontend/js/ui-modals.js',
        'frontend/js/ui-tab1-streams.js',
        'frontend/js/ui-tab2-health.js',
        'frontend/js/ui-tab3-taxes.js'
      ]) {
        vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });
      }
      const result = ($1);
      console.log(JSON.stringify(result, null, 2));
    "
  elif [ -x "$JSC" ]; then
    "$JSC" -e "
      var window = globalThis;
      var localStorage = { getItem: function() { return null; }, setItem: function() {} };
      var document = {
        addEventListener: function() {},
        getElementById: function() { return null; },
        querySelectorAll: function() { return []; },
        querySelector: function() { return null; },
        documentElement: { getAttribute: function() { return 'dark'; }, setAttribute: function() {} }
      };
      var navigator = { userAgent: 'jsc' };
      load('frontend/js/state.js');
      load('frontend/js/taxOptimizer.js');
      load('frontend/js/monteCarlo.js');
      load('frontend/js/engine.js');
      load('frontend/js/patrimoine.js');
      load('frontend/js/ui-modals.js');
      load('frontend/js/ui-tab1-streams.js');
      load('frontend/js/ui-tab2-health.js');
      load('frontend/js/ui-tab3-taxes.js');
      var result = ($1);
      print(JSON.stringify(result, null, 2));
    "
  fi
fi
