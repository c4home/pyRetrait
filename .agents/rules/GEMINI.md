# Rules — Dự Án pyRetrait

## 1. Ngôn Ngữ & Giao Tiếp

- **Toàn bộ giao tiếp với người dùng bằng Tiếng Việt.**
- Comments trong code: ưu tiên tiếng Việt cho logic nghiệp vụ phức tạp; tiếng Anh cho comment kỹ thuật phổ thông.
- Tên biến và hàm: dùng tiếng Anh (camelCase cho JS, snake_case cho Python).
- **Hỗ Trợ Đa Ngôn Ngữ Giao Diện (Internationalization - i18n) & Kiến Trúc Mở Rộng N Ngôn Ngữ:**
  - Hệ thống hỗ trợ đa ngôn ngữ linh hoạt với kiến trúc mở rộng không giới hạn (hiện tại hỗ trợ: **Tiếng Việt (`vi`)**, **Tiếng Anh (`en`)**, **Tiếng Pháp (`fr`)**, và sẵn sàng mở rộng thêm bất kỳ ngôn ngữ nào như `de`, `es`, `ja`...).
  - Ngôn ngữ mặc định khởi tạo: **Tiếng Việt (`vi`)**.
  - **Quy Chuẩn Điều Khiển Chuyển Ngôn Ngữ (Scalable Dropdown Selector Kèm Cờ Quốc Gia):**
    - Để tính tới việc có nhiều ngôn ngữ khác nhau trong tương lai, cụm chuyển đổi ngôn ngữ trên thanh Header bắt buộc phải dùng **Dropdown Menu Selector co giãn linh hoạt** (`.lang-dropdown-container`), hiển thị icon cờ quốc gia cùng mã ngôn ngữ hiện tại (ví dụ: `🇻🇳 VI ▾`) và khi bấm sẽ mở menu danh sách các ngôn ngữ có thể chọn (mỗi mục kèm cờ quốc gia như 🇻🇳 Tiếng Việt, 🇬🇧 English, 🇫🇷 Français).
    - **Tuyệt đối KHÔNG hardcode dàn hàng ngang các nút bấm cố định** (như `VI | EN | FR`), vì khi số lượng ngôn ngữ tăng lên (5, 10 ngôn ngữ...) sẽ gây chiếm dụng diện tích, tràn vỡ bố cục thanh Header.
    - Danh sách ngôn ngữ được nạp động từ mảng cấu hình `AVAILABLE_LANGUAGES = [{ code, label, short, flag }]` trong `i18n.js`. Khi thêm ngôn ngữ mới, chỉ cần khai báo metadata vào mảng này và bổ sung từ điển tương ứng, menu dropdown sẽ tự động cập nhật mà không cần sửa code HTML.
    - Vị trí cụm chọn ngôn ngữ: Đặt trang trọng trên thanh điều khiển phía trên (Header), ngay phía trước nút chuyển giao diện Sáng/Tối.
  - Toàn bộ văn bản hiển thị trên giao diện (nhãn label, tooltip title, placeholder, thẻ điều hướng tab, thông báo status) phải được quản lý tập trung qua module `i18n.js`:
    - Khai báo trên HTML bằng các thuộc tính chuẩn: `data-i18n="key"`, `data-i18n-title="key"`, `data-i18n-placeholder="key"`.
    - Gọi hàm helper trong JavaScript: `window.I18n.t(key, fallback)` đối với các chuỗi sinh động (dynamic HTML, nhãn biểu đồ, tooltip).
  - Khi thêm bất kỳ tính năng, nút bấm, biểu đồ hoặc thẻ nội dung mới lên giao diện, **bắt buộc phải bổ sung đầy đủ bản dịch cho các ngôn ngữ đang hoạt động** trong từ điển của `i18n.js`.
  - Trạng thái ngôn ngữ được lưu tự động trong `localStorage` (key: `pyretrait_lang`) và kích hoạt sự kiện `pyretrait:language-changed` để cập nhật giao diện tức thì mà không cần tải lại trang.
- **Quy Chuẩn Ngôn Ngữ Phổ Thông Cho Đại Chúng (Plain Language & Mass Audience UX — Phục Vụ 100,000+ Người Dùng):**
  - **Tư duy tiếp cận đại chúng:** Ứng dụng hướng tới phục vụ 100,000+ người dùng phổ thông, đa dạng lứa tuổi, nghề nghiệp và trình độ học vấn. Mọi nội dung hiển thị phải dễ hiểu, trong sáng và mang tính ứng dụng thực tế ngay lập tức.
  - **Tối thiểu hóa thuật ngữ kỹ thuật (technical jargon):** Tuyệt đối không lạm dụng các thuật ngữ hàn lâm, đao to búa lớn của phòng thí nghiệm hoặc giới y khoa / tài chính chuyên sâu (như *Zone 2*, *Glymphatic*, *Sarcopenia*, *Autophagy*, *Polyphenol*, *Sulforaphane*, *Apigenin*, *Nocturia*, *GI thấp*...).
  - **Tránh tuyệt đối cảm giác AI bịa từ / ảo giác (Anti-Hallucination Perception):** Các thuật ngữ lạ lẫm như "Cardio Zone 2" khiến đại đa số người dùng nghĩ rằng AI bịa từ hoặc hallucination. Bắt buộc chuyển hóa thành cách diễn đạt thuần Việt đời thường, dễ liên tưởng:
    - Thay vì "Cardio (Zone 2)" ➔ Dùng: "Vận động vừa sức (Đi bộ nhanh, chạy bộ nhẹ nhàng hoặc đạp xe vừa sức)".
    - Thay vì "chống Sarcopenia" ➔ Dùng: "chống teo cơ tuổi già / giữ cơ bắp dẻo dai".
    - Thay vì "kích hoạt Autophagy" ➔ Dùng: "giúp cơ thể tự dọn dẹp tế bào cũ hỏng".
    - Thay vì "hệ thống Glymphatic dọn mảng bám amyloid não" ➔ Dùng: "giúp não bộ tự làm sạch các chất thải tích tụ ban ngày, ngừa sa sút trí tuệ".
    - Thay vì "tránh Nocturia" ➔ Dùng: "tránh thức giấc đi tiểu đêm làm đứt đoạn giấc ngủ sâu".
  - **Chỉ sử dụng thuật ngữ khi thực sự cần thiết:** Khi bắt buộc phải nhắc đến một khái niệm tài chính hoặc y khoa chuẩn, luôn phải có giải thích ngắn gọn bằng ví dụ đời thường mở ngoặc đi kèm.
- **Tuyệt đối KHÔNG viết công thức bằng cú pháp LaTeX (cấm dùng `$$...$$`, `$...$`, `\text{...}`, `\frac{...}`):**
  - Trong toàn bộ giao tiếp chat, tài liệu Markdown (`.md`), giải thích nghiệp vụ và UI: Mọi công thức tính toán tài chính phải được trình bày dưới dạng văn bản thường trực quan, dễ đọc hoặc code block đơn giản (ví dụ: `Tỷ lệ rút năm nay = Số tiền dự kiến rút / Số dư tài sản thực tế`, hoặc `Rút(t) = Danh mục(0) * SWR * (1 + lạm phát)^t`). Tuyệt đối không dùng LaTeX vì gây rối mắt, thô kệch và lỗi hiển thị khi không có trình render chuyên dụng.

---

## 2. Kiến Trúc Hệ Thống

### Nguyên Tắc Local-First
- **Mọi tính toán tài chính phải chạy được 100% trên client (JS engine)** mà không cần gọi API — kể cả khi offline.
- Backend FastAPI chỉ đảm nhiệm: xác thực người dùng (JWT), lưu/đồng bộ kế hoạch lên SQLite, và expose `/api/...` endpoints.
- **Không bao giờ chuyển logic tính toán cốt lõi (dòng tiền, Monte Carlo, thuế) sang backend.**

### Phân Chia File Frontend
| File | Trách nhiệm |
|------|-------------|
| `i18n.js` | Quản lý đa ngôn ngữ (i18n), từ điển dịch Tiếng Việt, Anh, Pháp |
| `engine.js` | Toàn bộ engine tính toán dòng tiền, chiến lược rút tiền |
| `monteCarlo.js` | Mô phỏng Monte Carlo (Mulberry32 seed=42) |
| `patrimoine.js` | Quản lý tài sản, BĐS, LMNP, Turo |
| `taxOptimizer.js` | Thuế lũy tiến Pháp / Mỹ / Việt Nam, Roth Conversion |
| `scenarios.js` | Kịch bản What-If |
| `geminiAdvisor.js` | Tích hợp Gemini AI Advisor |
| `auth.js` | Đăng nhập / đăng ký / JWT |
| `ui.js` | Toàn bộ render UI, event handlers, Chart.js |
| `export.js` | Xuất CSV / PDF / JSON |

- **Không được gộp logic từ các file khác vào `ui.js`** — `ui.js` chỉ được gọi các hàm từ các module khác.

---

## 3. Backend — Python / FastAPI

- **Python 3.10+**, dùng type hints đầy đủ cho mọi function.
- **Không sử dụng ORM** (SQLAlchemy, Tortoise...). Chỉ dùng `sqlite3` thuần để giữ dependency tối giản.
- Mọi endpoint trả về JSON; lỗi trả về `{"detail": "..."}` theo chuẩn FastAPI HTTPException.
- **Không expose logic tính toán tài chính qua API** — backend chỉ lưu/trả dữ liệu thô (JSON kế hoạch).
- Bảo mật: mật khẩu phải hash bằng PBKDF2/SHA-256 + salt, JWT token có thời hạn rõ ràng.
- CORS chỉ mở rộng trong môi trường dev; production phải whitelist domain cụ thể.

---

## 4. Frontend — Vanilla JS

- **Không sử dụng framework** (React, Vue, Angular...). Dự án dùng Vanilla JS thuần.
- **Không import thư viện ngoài** trừ: Chart.js (bundled local), Google Fonts (CDN).
- Tất cả state kế hoạch lưu trong `localStorage` (key: `pyretrait_plans`) trước, rồi đồng bộ server khi có mạng.
- Dùng `const` / `let` — **không dùng `var`**.
- Hàm thuần (pure function) cho mọi tính toán; tránh side-effect ẩn.
- Mọi hàm công khai phải có JSDoc comment mô tả params và return value.

---

## 5. Tính Toán Tài Chính — Quy Tắc Bất Di Bất Dịch

### Tiền tệ
- Đơn vị nội bộ luôn là **EUR (€)** cho các kịch bản Franco-Viet; **USD** cho kịch bản Mỹ.
- Hiển thị ra UI mới áp dụng tỷ giá chuyển đổi (EUR↔VND↔USD).
- **Không làm tròn số trong tính toán trung gian** — chỉ làm tròn khi hiển thị cuối cùng.

### Monte Carlo
- Luôn dùng **Mulberry32** với seed cố định `42` để đảm bảo kết quả deterministic trên mọi trình duyệt.
- Số lượng mô phỏng mặc định: **1,000 runs**. Không giảm xuống dưới 500.
- Output bắt buộc: P10, P50, P90; xác suất thành công (portfolio > 0 ở năm cuối).

### Thuế Pháp
- Biểu thuế IR phải cập nhật theo năm hiện hành (2024 trở đi).
- Giảm trừ frais professionnels tối đa **10%** (trần 14.171 euro / năm 2024).
- Mô hình lương hưu Pháp: chuẩn **172 quý**, phạt décote **-1.25%/quý thiếu**, tự động xóa phạt ở tuổi **67**.

### Chiến Lược Rút Tiền
- 4 chiến lược bắt buộc: Bengen 4%, Guyton-Klinger, VPW, Fixed %.
- Tỷ lệ rút mặc định gợi ý: **3.5%** (conservative).

### Định Giá Bất Động Sản (Nhà Mặt Đất vs Căn Hộ Chung Cư)
- **Tuyệt đối KHÔNG áp dụng một tỷ lệ tăng trưởng dương liên tục đến vô tận cho mọi loại BĐS.**
- **Phân tách 2 công thức định giá riêng biệt theo loại hình:**
  1. **Nhà mặt đất (House / Maison individuelle):**
     - Giá trị gắn liền với quyền sử dụng đất lâu dài và khan hiếm, tăng trưởng đều đặn theo tỷ lệ thị trường:
       `Giá trị(t) = Giá ban đầu * (1 + Tỷ lệ tăng trưởng)^t` (mặc định +2.5%/năm).
  2. **Căn hộ chung cư (Apartment / Copropriété):**
     - Áp dụng mô hình khấu hao hao mòn xác nhà sau 30 năm sử dụng:
       - Phần Đất (20% giá trị ban đầu): Tăng trưởng dài hạn theo thị trường (+2.0%/năm).
       - Phần Xác nhà (80% giá trị ban đầu): Khấu hao vật lý theo thời gian sử dụng 30 năm (giảm dần về sàn 10% ở năm thứ 30).
       - `Giá trị căn hộ(t) = Phần Đất(t) + Phần Xác nhà(t) * (1 + Tỷ lệ điều chỉnh)^t`.
     - Phản ánh đúng thực tế chung cư cũ bị xuống cấp, mất giá và tốn chi phí trùng tu sau 25–40 năm thay vì tăng ảo đến vô tận.

---

## 6. UI / UX

- **Hỗ trợ toàn diện 2 chế độ (Dark Mode & Light Mode) — Nguyên tắc thiết kế bất biến:**
  - Cả Dark Mode và Light Mode đều là công dân hạng nhất (first-class citizens), phải đảm bảo tính thẩm mỹ cao, độ tương phản sắc nét và dễ đọc (chuẩn WCAG AA).
  - **Tuyệt đối KHÔNG hardcode màu nền tối cố định:**
    - Cấm dùng `rgba(0, 0, 0, ...)`, `rgba(15, 23, 42, ...)`, `rgba(30, 41, 59, ...)`, `#0f172a`, `#1e293b` trong các class định nghĩa component gốc (như `.item`, `.card`, `.metric-item`, `.box`, `.row`, `.btn`, `.panel`, `.chip`).
    - Lớp phủ đen bán trong suốt (`rgba(0, 0, 0, 0.15 - 0.3)`) khi đặt trên nền sáng của Light Mode sẽ bị biến thành màu xám xi măng đục/tối om — hoàn toàn bị cấm làm background thẻ nội dung.
  - **Sử dụng 100% CSS Variables cho màu nền, viền và văn bản:**
    - Nền: `var(--bg-app)`, `var(--bg-card)`, `var(--bg-card-hover)`, `var(--bg-sidebar)`, `var(--bg-input)`.
    - Viền: `var(--border-subtle)`, `var(--border-strong)`.
    - Chữ: `var(--text-main)`, `var(--text-muted)`, `var(--text-faint)`.
  - **Quy chuẩn hiển thị Light Mode (`[data-theme="light"]`):**
    - Mọi thẻ/hộp dữ liệu con (card, list item, metric item, breakdown box, table row, chip, callout) khi ở Light Mode phải có nền trắng thuần (`#ffffff`) hoặc màu sáng nhạt có chủ đích (`#f8fafc`, `#f0fdf4`), viền xám sáng tương phản rõ (`#cbd5e1`, `#e2e8f0`), chữ đen/xám đậm rõ nét (`#0f172a`, `#334155`).
    - Các thành phần nổi bật (badge, metric subtext, tag) phải dùng nền màu nhạt (pastel/soft tint) kết hợp chữ màu đậm tương ứng (ví dụ: nền xanh ngọc nhạt `#ecfdf5` + chữ `#059669`, nền đỏ nhạt `#fef2f2` + chữ `#e11d48`).
  - **Cấm inject màu nền tối hardcode trong JavaScript (`ui.js`, `patrimoine.js`, dynamic HTML):**
    - Tuyệt đối không sinh HTML template string có chứa `style="background: rgba(...)"` hoặc `style="background: #0f172a..."`. Mọi dynamic styling phải dùng CSS class có sẵn hoặc biến CSS (`var(--bg-card)`).
  - **Quy tắc Cache-Busting khi cập nhật CSS/Theme:**
    - Mỗi khi bổ sung hoặc sửa đổi CSS (đặc biệt là quy tắc theme), bắt buộc phải tăng query version parameter (`?v=...`) trong thẻ `<link rel="stylesheet">` và `<script>` của `index.html` để đảm bảo trình duyệt người dùng nhận file mới ngay lập tức mà không bị kẹt cache cũ.
  - **Quy Chuẩn Độ Tương Phản Văn Bản (Anti-Washed-Out & Typography Contrast):**
    - **Tuyệt đối KHÔNG hardcode màu chữ xám nhạt/sáng trong HTML hoặc CSS cho văn bản thường:**
      - Cấm dùng `#cbd5e1`, `#94a3b8`, `#e2e8f0`, `#64748b`, `#cbd5e1`, `#ffffff`, `#f8fafc` làm thuộc tính `color` cho đoạn văn, thẻ `<li>`, thẻ `<p>`, danh sách, nhãn hoặc nội dung hướng dẫn.
      - Các màu chữ xám nhạt này chỉ đọc được trên nền tối. Khi hiển thị trên nền trắng (`#ffffff`) của Light Mode, chúng có độ tương phản cực thấp (< 2:1), khiến chữ bị bạc màu, mờ căm và không thể đọc nổi (vi phạm nghiêm trọng chuẩn tiếp cận WCAG AA).
    - **Bắt buộc dùng 100% biến CSS cho màu văn bản:**
      - Tiêu đề, chữ chính, nội dung quan trọng: `color: var(--text-main);` (Dark Mode: `#f8fafc`; Light Mode: `#0f172a` — độ tương phản 16:1).
      - Chữ mô tả, danh sách gạch đầu dòng, nội dung giải thích: `color: var(--text-muted);` (Dark Mode: `#94a3b8`; Light Mode: `#475569` — độ tương phản 7.5:1).
      - Chú thích nhỏ: `color: var(--text-faint);` (Dark Mode: `#64748b`; Light Mode: `#64748b`).
    - **Màu chữ nhấn (Accent Titles & Highlights) phải phân tách rõ theo theme:**
      - Tuyệt đối không dùng các mã màu pastel sáng (`#38bdf8`, `#60a5fa`, `#34d399`, `#fbbf24`) trực tiếp trên nền trắng vì sẽ bị chói/mờ tịt.
      - Trong Light Mode:
        - Xanh dương/cyan: Bắt buộc dùng màu đậm `#0284c7`, `#1d4ed8`, `#2563eb` (thay vì `#38bdf8`, `#60a5fa`).
        - Xanh lá/ngọc: Bắt buộc dùng `#059669`, `#047857` (thay vì `#34d399`).
        - Cam/vàng: Bắt buộc dùng hổ phách đậm `#d97706`, `#b45309` (thay vì `#fbbf24`).
        - Đỏ/hồng: Bắt buộc dùng `#e11d48`, `#be123c` (thay vì `#fb7185`).
        - Tím: Bắt buộc dùng `#7c3aed`, `#6d28d9` (thay vì `#c084fc`).
    - **Không dùng inline styles để gán màu chữ:**
      - Mọi thẻ thông tin, hướng dẫn (Guide cards, Callouts, Formula boxes) phải dùng CSS class có sẵn trong `styles.css` để stylesheet tự động điều chỉnh màu chữ tương phản cao trên cả 2 chế độ sáng và tối.
  - **Quy Chuẩn Đồng Nhất Typography & Cấm Dùng Monospace Cho Văn Bản Đa Ngôn Ngữ:**
    - **Thống nhất 100% font giao diện chính `var(--font-sans)` (Inter):**
      - Mọi văn bản giải thích, mô tả, công thức tài chính và cơ chế tính toán (áp dụng cho mọi ngôn ngữ: Tiếng Việt, Tiếng Anh, Tiếng Pháp) bắt buộc phải sử dụng font chính của dự án `var(--font-sans)`, tuyệt đối KHÔNG để font `monospace` hoặc `var(--font-mono)`.
      - **Lý do:** Font `monospace` khi hiển thị văn bản (đặc biệt là tiếng Việt có dấu thanh và tiếng Pháp có dấu phụ accents é, è, ê, à, ç...) thường gặp lỗi bất tương thích ký tự (inconsistent glyphs, dấu bị lệch hoặc biến dạng, khoảng cách ký tự đứt đoạn, fallback font xấu xí), tạo cảm giác thô kệch và lệch pha hoàn toàn so với phong cách thiết kế hiện đại của toàn bộ ứng dụng.
    - **Quy định đối với thẻ `<code>` và các khối công thức:**
      - Thẻ `<code>` khi dùng để thể hiện công thức tài chính, giải thuật hoặc ghi chú nghiệp vụ trong giao diện người dùng bắt buộc phải kế thừa `font-family: var(--font-sans);` kết hợp `font-weight: 500` hoặc `600`, bo góc, padding và màu sắc hài hòa.
      - **Chỉ dùng `var(--font-mono)` hoặc `monospace` cho:** Các con số tài chính dạng bảng cần căn thẳng hàng (tabular figures), mã định danh (ticker, transaction ID, hash) hoặc câu lệnh kỹ thuật/terminal thuần túy không chứa văn bản giao diện.
      - **Tuyệt đối KHÔNG gộp chữ cái hoặc đơn vị đo lường (như `t`, `tuổi`, `năm`, `tháng`, `đ`, `€`, `%`) vào chung thẻ mang font `monospace` (`.font-mono`):**
        - Font monospace biến các chữ cái thường (đặc biệt chữ `t` có nét gạch ngang và chân chữ dạng slab thô kệch) trở nên lạc quẻ, thô ráp và đứt gãy hoàn toàn so với các từ ngữ xung quanh.
        - Các con số thống kê hoặc chỉ số Hero/Card lớn (như Điểm sức khỏe `80`, Tuổi sinh học `24.5`, Tuổi hưu `60`) bắt buộc phải dùng font giao diện chuẩn `var(--font-sans)` (Inter) kết hợp `font-weight: 700 - 800`.
        - Bắt buộc tách bạch giữa **Giá trị số** và **Đơn vị đo lường**: Giá trị số nằm riêng trong thẻ hiển thị số, đơn vị đo lường (như `tuổi`, `năm`, `điểm`) phải đặt riêng ở thẻ con kế bên (`<span style="font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-sans);">tuổi</span>`), tuyệt đối không nối chuỗi kiểu `${bioAge}t tuổi`.
  - **Quy Chuẩn Đồng Nhất Hệ Màu Cho Cột Mốc (Life Milestones & Chart Pins):**
    - Toàn bộ các mốc sự kiện cuộc đời (Life Milestones) trên thanh Ribbon, Modal và trên Biểu Đồ (ghim mốc nổi floating pins, đường gióng nét đứt vertical guidelines, các chấm tròn data points) bắt buộc phải **dùng chung một hệ màu thống nhất theo theme**, tuyệt đối KHÔNG để mỗi mốc một màu sắc cầu vồng sặc sỡ (hồng, cam, vàng, tím, lục...).
    - **Trong Light Mode (`[data-theme="light"]`):**
      - Thẻ ghim trên biểu đồ: Nền trắng thuần (`#ffffff`), viền xám sáng rõ ràng (`#cbd5e1`), chữ xanh dương đậm sắc nét (`#0284c7`). Tuyệt đối CẤM hardcode nền đen/tối (`rgba(15, 23, 42, ...)` hoặc `#0f172a`) trên canvas ở Light Mode.
      - Đường gióng nét đứt và chấm dữ liệu: Dùng chung một màu xanh dương đồng bộ (`rgba(2, 132, 199, 0.4)` / `#0284c7`).
    - **Trong Dark Mode:**
      - Thẻ ghim: Nền tối sang trọng (`rgba(15, 23, 42, 0.95)`), viền mờ (`rgba(56, 189, 248, 0.45)`), chữ và đường gióng màu cyan sáng (`#38bdf8`).
    - Khi chuyển đổi chế độ sáng/tối (toggle theme), canvas biểu đồ phải được kích hoạt re-render ngay lập tức (`updateAll()`) để cập nhật màu nền và đường nét chuẩn xác.
  - **Quy Chuẩn Đồng Bộ Phong Cách & Độ Dày Biểu Đồ (Unified Chart Styles & Line Width):**
    - **Thống nhất độ dày đường vẽ (Line Width):**
      - Tuyệt đối KHÔNG dùng nét vẽ quá mỏng (`borderWidth: 1` hoặc `1.5`) cho các đường xu hướng quan trọng vì sẽ bị chìm nghỉm, mờ nhạt và rất khó nhìn trên màn hình độ phân giải cao.
      - Đường quỹ đạo chính (Net Worth chính, P50 Median Monte Carlo, Dòng tiền chuẩn): Bắt buộc đạt `borderWidth: 2.8 - 3.2px`.
      - Đường kịch bản so sánh, dải bao phân vị (P10, P90), đường trần/sàn lan can (Upper/Lower Bands): `borderWidth: 2.0 - 2.5px`.
      - Đường mốc tham chiếu (Mục tiêu FIRE Nest Egg, Dư nợ gốc): Nét đứt `borderDash: [5, 5]`, độ dày `1.8 - 2.0px`.
    - **Độ cong mượt (Curve Tension):**
      - Thống nhất `tension: 0.35` cho toàn bộ các biểu đồ đường dự báo tài chính (Dòng tiền & Tài sản, Monte Carlo Fan Chart, So sánh 4 Chiến lược Rút tiền, Kịch bản What-If), tạo đường cong chuyển động mềm mại, tự nhiên; tuyệt đối không để đường gãy góc thô cứng (`tension: 0`).
    - **Tương tác & Dễ dàng chọn điểm (Interaction Mode & Hit Radius):**
      - Mọi biểu đồ đường phải luôn cấu hình:
        ```javascript
        interaction: {
          mode: 'index',
          intersect: false
        }
        ```
        giúp người dùng chỉ cần rê chuột theo trục thời gian dọc là tooltip hiển thị đầy đủ giá trị của tất cả các kịch bản/chiến lược tại mốc tuổi/năm đó mà không bắt người dùng phải căn rê trúng từng pixel nhỏ li ti (`intersect: true`).
      - Bán kính điểm chạm nhạy: `pointHitRadius: 10 - 15px`.
      - Trạng thái mặc định: `pointRadius: 0` (hoặc `1.5 - 2px` tại mốc đặc biệt), `pointHoverRadius: 5 - 6px` khi di chuột tới để biểu đồ luôn thoáng mắt và sạch sẽ.
    - **Độ sâu trực quan (Visual Layering & Gradient Fill):**
      - Các đường quỹ đạo chính nên có vùng phủ mờ nhẹ dưới chân (`fill: true` với opacity `0.06 - 0.15`), tạo chiều sâu sang trọng và phân lớp dữ liệu rõ ràng.
    - **Bảng màu & Trục tọa độ Dual-Theme:**
      - Dark Mode: Dùng hệ màu neon sáng rõ nét (Cyan `#38bdf8`, Emerald `#10b981`, Purple `#a855f7`, Amber `#f59e0b`, Rose `#f43f5e`), lưới tọa độ `rgba(255, 255, 255, 0.06)`.
      - Light Mode: Bắt buộc dùng hệ màu đậm sâu (Blue `#0284c7`, Emerald `#059669`, Violet `#7c3aed`, Amber `#d97706`, Crimson `#e11d48`), lưới tọa độ `rgba(0, 0, 0, 0.06)`.
      - Trục hoành thời gian (Age/Year Axis): Dùng chuẩn `ageAxisTicks()` với nhãn 2 dòng nằm ngang (`35t \n 2032`, `maxRotation: 0`), font `Inter` 9px, tránh xoay chữ 45 độ làm rối và chiếm dụng không gian.
    - **Cập nhật tức thời khi đổi Theme:**
      - Hàm `toggleTheme()` phải luôn kích hoạt re-render toàn bộ các biểu đồ (`updateAll()`) để cập nhật màu sắc trục, đường kẻ và thẻ ghim ngay lập tức.
  - **Checklist bắt buộc trước khi hoàn thành task UI:**
    - Luôn tự kiểm tra đối chiếu component mới/được sửa trên cả 2 chế độ:
      1. Dark Mode: Nền tối sang trọng, viền mờ tinh tế, chữ sáng dễ đọc.
      2. Light Mode: Nền trắng sạch sẽ (không có mảng xám đục hay mảng tối sót lại), viền sắc nét, chữ đen/xám đậm rõ ràng. Mọi dòng chữ phải sắc sảo, độ tương phản cao, tuyệt đối không bị mờ nhạt hay bạc màu.
      3. Typography: Đồng nhất font `Inter` (`var(--font-sans)`), không để font chữ `monospace` lạc quẻ trong các câu văn bản hoặc công thức (Tiếng Việt, Tiếng Anh, Tiếng Pháp).
      4. Cột Mốc & Biểu Đồ: Thống nhất một màu hài hòa, không có ghim đen hay đường gióng đa sắc rối mắt; độ dày nét đường chuẩn 2.8 - 3.2px, `mode: 'index'`, `intersect: false`.
- Mọi thay đổi input phải cập nhật biểu đồ **tức thì** (debounce 300ms) — không cần nhấn nút "Tính toán".
- Màu sắc biểu đồ phải nhất quán trong cả session; dùng bảng màu đã định nghĩa trong CSS variables.
- Responsive: hoạt động tốt trên màn hình từ 768px trở lên (tablet landscape + desktop).
- **Tuyệt đối KHÔNG dùng icon hoặc emoji trong toàn bộ project** (bao gồm HTML, CSS, JS, UI labels, buttons, navigation tabs, toast, modal, SVG icon trang trí, tên dữ liệu mẫu...). **Chỉ sử dụng icon khi người dùng yêu cầu rõ ràng.** Thiết kế ưu tiên phong cách tối giản (clean, minimalist, typography-first).
- Mọi số tiền hiển thị phải có dấu phân cách nghìn (`.` cho VND, `,` cho EUR/USD) và ký hiệu tiền tệ.

---

## 7. Gemini AI Advisor & Tối Ưu Hóa Quota Token — Nguyên Tắc Bất Biến

### Nguyên Tắc Gọi Theo Biến Đổi Dữ Liệu (Data-Fingerprint Invocations)
- **Tuyệt đối KHÔNG gọi lại API Gemini khi chuyển đổi qua lại giữa các tab, đổi giao diện (theme), hoặc khi re-render UI thông thường.**
- **Cơ chế Cache dựa trên Dấu vân tay dữ liệu (Data Fingerprint / Hash):**
  - Mọi yêu cầu phân tích biểu đồ hoặc kế hoạch phải gắn liền với một khóa cache được tính từ mã băm (hash) của toàn bộ các biến tài chính đầu vào cốt lõi:
    - Tham số kế hoạch: Tiết kiệm hiện có, tích lũy hàng năm, chi tiêu hưu trí, tuổi hiện tại, tuổi nghỉ hưu, kỳ vọng sống, lợi nhuận kỳ vọng, lạm phát, chiến lược rút tiền, tỷ lệ SWR, chế độ thuế, dòng thu nhập, bất động sản.
    - Dữ liệu tóm tắt ngữ cảnh biểu đồ (`chartSummary`) và loại tiền tệ (`currency`).
  - **Khi các biến tài chính không đổi:** Bắt buộc tái sử dụng kết quả phân tích có sẵn trong RAM cache tức thì (0ms), không hiển thị vòng quay tải (loading spinner), không gửi HTTP request mạng, **tiết kiệm 100% token**.
  - **Khi có biến tài chính thay đổi:** Dấu vân tay dữ liệu tự động thay đổi, hệ thống nhận diện bài toán tài chính mới và mới gửi yêu cầu phân tích mới lên Gemini.

### Cấm Hardcode Làm Mới Cưỡng Bức (`forceRefresh = true`)
- Trong toàn bộ các hàm render UI mặc định (`renderScenarioTab`, `renderNetWorthChart`, `renderWithdrawalComparison`...), **tuyệt đối cấm truyền `forceRefresh = true`**.
- Cờ `forceRefresh = true` CHỈ được phép kích hoạt khi người dùng **chủ động nhấp chuột** vào nút bấm "Phân tích lại / Làm mới" trên giao diện.

### Quy Chuẩn Hiển Thị Huy Hiệu & Thời Gian Cập Nhật
- Huy hiệu tên mô hình (ví dụ: `gemini-3.5-flash-lite`, `Gemini Intelligence`) và nhãn thời gian `Cập nhật lúc: [HH:MM]` bắt buộc phải được bọc trong một container nhóm có `display: inline-flex; flex-wrap: nowrap; white-space: nowrap; flex-shrink: 0;`.
- **Luôn luôn nằm trên cùng một dòng**, tuyệt đối không được để xảy ra tình trạng huy hiệu ở dòng trên còn thời gian rớt xuống dòng dưới khi màn hình co giãn.

### Cơ Chế Phục Hồi & Fallback Ngoại Tuyến (Graceful Degradation)
- Khi gặp sự cố mạng, quá giới hạn tần suất (Rate Limit 429), hoặc thiếu API key, hệ thống phải tự động chuyển sang bộ phân tích cục bộ dựng sẵn (Local Financial Intelligence) mà không làm gián đoạn trải nghiệm của người dùng hay làm hỏng luồng tính toán client-side.
- **Quy chuẩn hiển thị biểu tượng cảnh báo ngoại tuyến tại nhãn thời gian:**
  - Khi hệ thống ở chế độ Fallback Ngoại Tuyến (`source !== 'gemini_api'`), bắt buộc hiển thị ký hiệu/biểu tượng cảnh báo (Warning symbol `⚠` hoặc `[!]`) đặt ngay trước nhãn thời gian: `⚠ Cập nhật lúc: [HH:MM] (Ngoại tuyến)`.
  - Cụm nhãn thời gian phải tự động đổi sang màu cảnh báo (màu hổ phách/cam vàng: Dark Mode `#f59e0b`, Light Mode `#b45309` trên nền nhạt `#fef3c7`) kết hợp thuộc tính `title` giải thích lý do ngoại tuyến, giúp người dùng nhận biết ngay lập tức phân tích đang được sinh từ bộ máy suy luận cục bộ thay vì gọi trực tiếp lên Google Gemini API.
- Giữ vững nguyên tắc Local-First: Trí tuệ nhân tạo chỉ đóng vai trò tư vấn viên (advisor) phân tích nhận xét, tuyệt đối không dùng AI để thực hiện các phép tính số học cốt lõi.

---

## 8. Bảo Mật & Dữ Liệu

- **Không lưu mật khẩu** hay token JWT vào `localStorage` — dùng `sessionStorage` hoặc cookie `HttpOnly`.
- Dữ liệu kế hoạch tài chính trong `localStorage` **không được chứa thông tin nhận dạng cá nhân** (tên thật, CMND...).
- Validate toàn bộ input từ người dùng ở cả frontend (UX) lẫn backend (security).
- Không log thông tin nhạy cảm (token, mật khẩu) ra console hay server logs.

---

## 9. Quy Trình Làm Việc Với Agent

- Khi được yêu cầu thêm tính năng mới, **luôn hỏi lại** nếu tính năng có thể ảnh hưởng đến kết quả tính toán tài chính để tránh sai số.
- Trước khi sửa `engine.js` hoặc `monteCarlo.js`, **đọc lại toàn bộ hàm liên quan** để hiểu context; không patch một phần nhỏ mà bỏ sót tác động dây chuyền.
- Khi sửa `ui.js` (file rất lớn ~238KB), **chỉ sửa đúng đoạn cần thiết** bằng `multi_replace_file_content`; không viết lại toàn bộ file.
- Mỗi thay đổi logic tính toán phải đi kèm ví dụ kiểm chứng số học cụ thể trong comment.
- **Không xóa tính năng hiện có** nếu người dùng không yêu cầu — kể cả khi refactor.

---

## 10. Tài Liệu & Documentation

- Các file `DOCS_*.md` là **nguồn sự thật** cho logic nghiệp vụ; khi có xung đột giữa code và docs, **hỏi người dùng** để làm rõ trước khi sửa.
- Mọi thuật toán mới hoặc thay đổi công thức phải cập nhật vào `DOCS_CALCULATION_ENGINE.md`.
- README.md phải phản ánh đúng danh sách tính năng hiện tại.

---

## 11. Deployment

- Môi trường production: OVH VPS + Docker (xem `DEPLOY_OVH.md`).
- **Không commit file `.env`** — chỉ commit `.env.example`.
- Build image: `docker-compose up --build`; không dùng `npm run build` hay bundler JS phức tạp — frontend là static files.
- Health check: endpoint `/health` phải trả về `{"status": "ok"}` trong vòng < 200ms.
