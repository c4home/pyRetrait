# Kế Hoạch Tính Năng: Mở Rộng Hồ Sơ Người Dùng Đa Chiều Qua Popup `+ Mới` (`#plan-modal`) & Tự Động Quy Đổi Chi Tiêu Hưu Trí Từ Số Dư Hàng Tháng (`multi_country_ppp_expansion.md`)

> **Quy trình Thực Thi Tiết Kiệm Token (Theo Chuẩn [`docs/QUY_TRINH_PHAT_TRIEN_APP_BANG_ANTIGRAVITY.md`](file:///Users/canhhung/Documents/pyRetrait/docs/QUY_TRINH_PHAT_TRIEN_APP_BANG_ANTIGRAVITY.md)):**
> 1. **Giai đoạn 1 & 2 (Đã chốt & đóng băng thiết kế — Scope Freeze):**
>    - **Định hình Hồ sơ ngay tại Popup `+ Mới` (`#plan-modal` — Dòng 3386 – 3595 trong `frontend/index.html`):**  
>      Đã chốt khung HTML tĩnh chuẩn phong cách tối giản:
>      - **Kế hoạch này dành cho:** `Cá nhân` (1 người) | `Vợ chồng` (2 người).
>      - **Bố cục Side-by-Side & Cấu trúc Dropdown 2 Lớp Tinh Gọn:**
>        - `Nơi làm việc hiện tại` và `Nơi dự định nghỉ hưu` đặt song song cạnh nhau với mũi tên chuyển đổi ở giữa.
>        - **Quy chuẩn hiển thị 2 lớp (2-Layer Dropdown Hierarchy):**
>          * **Lớp 1 (Nhóm cha `<optgroup>`):** `[Cờ quốc gia] + [Tên quốc gia]` (ví dụ: `🇫🇷 Pháp`, `🇻🇳 Việt Nam`, `🇵🇹 Bồ Đào Nha`, `🇪🇸 Tây Ban Nha`, `🇩🇪 Đức`, `🇺🇸 Mỹ`...).
>          * **Lớp 2 (Lựa chọn con `<option>`):** Chỉ hiển thị `[Khu vực] ([Tỷ lệ PPP])`, tuyệt đối không lặp lại cờ quốc gia hay tên nước (ví dụ: `Paris & Vùng Thủ Đô (1.00x)`, `Tỉnh lẻ (0.85x)`, `Lisbon / Porto (0.65x)`, `Algarve / Tỉnh lẻ (0.55x)`).
>      - **Quy tắc bắt buộc:** Khi chọn `Chỉ 1 nơi`, Nơi nghỉ hưu tự động bằng Nơi làm việc hiện tại (`retireCity = workCity` và bị khóa/disabled), mũi tên đổi thành `=`.
>    - **Ưu tiên số 1 (Mặc định):** Tự động suy ra mức chi tiêu hưu trí từ chính **Thu nhập & Số dư tiết kiệm hàng tháng hiện tại của người dùng** (`Chi tiêu sinh hoạt thực tế = Thu nhập sau thuế - Tiết kiệm đầu tư - Trả góp nợ nhà`), sau đó quy đổi theo tỷ lệ Sức mua tương đương (`PPP nơi nghỉ hưu / PPP nơi làm việc`) và cộng phí bảo hiểm y tế tuổi già.
>    - **Thước đo đối chiếu trực quan (Chỉ đọc — Không phải nút bấm):** Hiển thị dòng tham chiếu 3 mốc xã hội (`Cơ bản 1.600€ | Thoải mái 2.400€ | Thịnh vượng 4.000€ × PPP`) dưới dạng chỉ báo tĩnh trên Tab 1 để người dùng đối chiếu phân khúc sống tại nơi nghỉ hưu.
> 2. **Giai đoạn 3 (Thực thi từng Task cuốn chiếu):**  
>    Sau khi duyệt tài liệu này, người dùng mở phiên chat mới và ra lệnh:  
>    *"Dựa vào file `docs/plans/multi_country_ppp_expansion.md`, hãy thực hiện **Task [N]**. Chỉ dùng `replace_file_content` sửa đúng dòng đã chỉ định trong `docs/CODEBASE_MAP.md`."*
> 3. **Quy chuẩn Kiểm thử Tiết kiệm Token (Non-negotiable Testing Rule):**
>    - Mặc định chỉ kiểm tra giao diện và tính năng trên ngôn ngữ chính là **Tiếng Việt (`vi`)**.
>    - Bản dịch tiếng Anh (`en`) và tiếng Pháp (`fr`) được bảo đảm bằng kiểm tra tĩnh (static code inspection) trong từ điển `i18n.js`. Tuyệt đối không ra lệnh cho browser subagent/tester chuyển qua lại giữa các ngôn ngữ (`VI -> EN -> FR`) trong cùng một phiên test để tránh lãng phí token và thời gian.

---

## 1. Mục Tiêu & Ràng Buộc Kỹ Thuật (Dựa Trên [`PROJECT_BLUEPRINT.md`](file:///Users/canhhung/Documents/pyRetrait/PROJECT_BLUEPRINT.md))

- **Mục tiêu nghiệp vụ**:
  1. **Thiết lập Hồ sơ trong Popup `+ Mới` (`#plan-modal`) để tự động tối ưu Giao diện**:
     - Cấu hình Side-by-Side tinh gọn:
       1. **Kế hoạch này dành cho:** `Cá nhân` (1 người) hoặc `Vợ chồng` (2 người).
       2. **Định hướng không gian sống:** `Chỉ 1 nơi` | `Chuyển hẳn` | `Song hành (50/50)`.
       3. **Bố cục Side-by-Side song song (Dropdown 2 lớp chuẩn mực):**
          - Lớp 1 (Nhóm cha `<optgroup>`): Cờ quốc gia + Tên nước (`🇫🇷 Pháp`, `🇻🇳 Việt Nam`, `🇵🇹 Bồ Đào Nha`, `🇪🇸 Tây Ban Nha`, `🇩🇪 Đức`, `🇺🇸 Mỹ`...).
          - Lớp 2 (Lựa chọn con `<option>`): Khu vực/Thành phố + Tỷ lệ PPP (`Lisbon / Porto (0.65x)`, `Tỉnh lẻ (0.55x)`...).
     - Tự động ẩn/hiện thẻ giao diện theo Hồ sơ: Nếu chọn **`Chỉ 1 nơi`**, tự động ẩn thẻ *Lạm phát 2 chặng & Tỷ giá* (`#card-dual-inflation-stream`) và ẩn cụm 3 radio *Pháp / Việt / Song hành*; nếu không liên quan đến Pháp/Việt Nam thì tự động ẩn thẻ *BĐS LMNP Pháp* và *BHXH Việt Nam*.
  2. **Công thức Mặc định: Tính Chi tiêu Hưu trí từ Số dư Hàng tháng Hiện tại (`Cashflow-Derived Retirement Spending`)**:
     - `Chi tiêu sinh hoạt hiện tại/tháng = Thu nhập sau thuế/tháng - Số tiền tiết kiệm đầu tư/tháng - Tiền trả góp mua nhà/tháng (đã trả xong trước khi nghỉ hưu)`
     - `Chi tiêu hưu trí dự kiến/tháng = Chi tiêu sinh hoạt hiện tại/tháng * Hệ_số_PPP + Phụ phí Y tế tuổi già`
     - Hiển thị kèm dòng tham chiếu tĩnh (`Cơ bản | Thoải mái | Thịnh vượng × PPP` — chỉ để xem, không bấm) và bảng bóc tách 7 hạng mục chi tiêu trên Tab 1.
  3. **Đồng bộ Thuế, Lương hưu & Miễn trừ cho cả Cá nhân lẫn Vợ chồng**:
     - Khi chọn **Vợ chồng (`married`)**: Tự động chia phần thuế hộ gia đình (`taxParts = 2.0`), nhân đôi hạn mức rút lãi miễn thuế (**Assurance-Vie `9.200 EUR/năm`**, **Sparer-Pauschbetrag `2.000 EUR/năm`**), và tính tổng lương hưu từ cả 2 nguồn thu nhập của vợ & chồng.
     - **Nguyên Tắc Thiết Kế Trực Quan — Luôn Luôn Hiển Thị Trực Tiếp (Show Mọi Thứ Ngay Trên Giao Diện, Tuyệt Đối Không Giấu Sau Nút Sửa / Không Dùng Modal Phụ):**
       - **Hiển thị trực tiếp (Inline UI), không popup/modal che khuất:**
         * Toàn bộ thông số cấu hình và tính toán đều được **hiển thị trực tiếp ngay trên giao diện Tab 1**. Người dùng không cần phải bấm nút `[Sửa]` hay mở bất kỳ hộp thoại Modal phụ nào mới thấy hoặc sửa được dữ liệu.
       - **Hiển thị chi tiết theo Hồ sơ Cá nhân / Vợ chồng:**
         * **Khi chọn Cá nhân (`single`):** Các thẻ lương hưu hiển thị 1 khối thông số trực tiếp (Tuổi bắt đầu đi làm, Tuổi hưởng hưu, Giới tính, Số năm đóng bảo hiểm).
         * **Khi chọn Vợ chồng (`married`):** Các thẻ lương hưu (Lương hưu Pháp CNAV/Agirc-Arrco và BHXH Việt Nam) tự động bung nở / hiển thị trực tiếp 2 cột hoặc 2 khối song song cho **Bạn (Người 1)** và **Bạn đời (Người 2)**:
           - **Lương hưu Pháp:** Ô nhập Tuổi bắt đầu đi làm (`startWorkAge`), Tuổi nhận hưu (`claimAge`), Mức lương tính hưu của từng người hiển thị ngay trên thẻ. Người dùng thấy ngay số quý đóng (`trimestres`), tỷ lệ phạt/thưởng décote và số tiền lương hưu độc lập của từng người + tổng lương hưu gia đình. Chỉnh sửa trực tiếp ngay trên thẻ, số liệu cập nhật tức thì.
           - **Lương hưu BHXH Việt Nam:** Ô chọn Giới tính (`Nam` chuẩn 35 năm = 75% / `Nữ` chuẩn 30 năm = 75%), Số năm đóng (`yearsContributed`), Mức lương đóng của Chồng và Vợ hiển thị ngay trên thẻ.
       - **Bóc tách chi tiêu & Đối chiếu PPP luôn mở sẵn:**
         * Khung giải thích công thức từ Số dư hàng tháng, dòng tham chiếu 3 mức sống (`Cơ bản | Thoải mái | Thịnh vượng × PPP`) và bảng bóc tách 7 hạng mục chi tiêu thiết yếu luôn luôn hiển thị trực quan (visible by default), không giấu trong các accordion hay dropdown đóng.

- **Ràng buộc kỹ thuật bất biến (Theo [`PROJECT_BLUEPRINT.md`](file:///Users/canhhung/Documents/pyRetrait/PROJECT_BLUEPRINT.md) Mục 2 & 3)**:
  - **Local-First 100%**: Mọi phép tính tài chính, Monte Carlo, thuế và hưu trí phải chạy 100% trên JavaScript client, không gọi API backend để tính toán.
  - **Tab 3 là nội dung tĩnh thuần túy (Static Guide / Reference)**: Chỉ hiển thị cẩm nang pháp lý, tối ưu thuế, mẹo tài khoản đầu tư và infographic tĩnh; tuyệt đối không gắn các logic tính toán động hay can thiệp vào dòng tiền tính toán ngầm. Toàn bộ logic tính toán tài chính cốt lõi tập trung 100% tại Core Engine (`engine.js`, `taxOptimizer.js`) và tương tác trực quan trên Tab 1.
  - **Hệ thống giao diện kép (Dual-Theme)**: Hỗ trợ 100% Dark Mode và Light Mode qua biến CSS (`var(--bg-card)`, `var(--text-main)`, `var(--text-muted)`). Tuyệt đối không hardcode màu nền tối cố định hoặc màu chữ xám nhạt làm mất độ tương phản.
  - **Typography & Biểu thức**: Thống nhất font `var(--font-sans)` (Inter) cho toàn bộ văn bản và công thức. Tuyệt đối không dùng cú pháp LaTeX.
  - **Nguyên tắc phân chia file & chống phình file**: Mỗi Task chỉ sửa tối đa **2–3 file** và xác thực ngay bằng `./verify_js.sh`.

---

## 2. Tổng Quan Các File & Tọa Độ Dòng Cần Thay Đổi (Cập Nhật Chuẩn Xác Theo [`docs/CODEBASE_MAP.md`](file:///Users/canhhung/Documents/pyRetrait/docs/CODEBASE_MAP.md))

| Task | File tác động (Tối đa 2–3 file/Task) | Khoảng dòng hiện tại trong `CODEBASE_MAP.md` | Nội dung nâng cấp |
| :--- | :--- | :--- | :--- |
| **Task 1** [x] | `frontend/js/taxOptimizer.js` | Dòng `1 – 747` | Bổ sung `COUNTRY_PPP_PROFILES` (22+ khu vực), hàm `calculateRetireBudgetFromCashflow()` (tính từ Thu nhập - Tiết kiệm - Trả góp nhà), thước đo tham chiếu 3 mức sống, chia thuế theo `taxParts` & lương hưu tham số hóa cho cả 2 vợ chồng |
| **Task 2** [x] | `frontend/js/state.js`<br>`frontend/js/engine.js`<br>`frontend/js/ui.js` | Dòng `99 – 339`<br>Dòng `525 – 1354`<br>Dòng `752 – 881` | Chuẩn hóa schema Hồ sơ theo Blueprint (`workCountry`, `retireMode`, `retireCountry`, `retireCity`, `maritalStatus`, `taxParts`), chế độ 1 quốc gia (`isSingleCountry`), gộp lương hưu độc lập 2 vợ chồng và đồng bộ Cloud preferences (`theme`, `lang`, `currency`, `viewMode`) |
| **Task 3** [x] | `frontend/index.html`<br>`frontend/js/ui-modals.js`<br>`frontend/js/ui.js` | Dòng `3386 – 3595`<br>Dòng `1022 – 1215`<br>Dòng `255 – 353` | Hoàn thiện đấu nối DOM cho `#plan-modal` (lưu profile đa quốc gia & gia đình, đồng bộ select khi chọn Chỉ 1 nơi) |
| **Task 4** | `frontend/index.html`<br>`frontend/js/ui-tab1-streams.js` | Dòng `410 – 745`, `1067 – 1280`, `1573 – 1695`<br>Dòng `878 – 903`, `1540 – 1649` | Tự động ẩn/hiện thẻ theo Hồ sơ (`applyProfileVisibilityRules`), hiển thị trực tiếp (inline, không popup) cấu hình Bạn & Bạn đời trên thẻ hưu trí khi chọn Vợ chồng; công thức chi tiêu từ Số dư + dòng tham chiếu tĩnh & bảng 7 khoản chi luôn mở sẵn |
| **Task 5** | `frontend/js/i18n.js`<br>`frontend/js/engine.js`<br>`frontend/index.html` | Dòng `21 – 620`<br>Dòng `9 – 47`<br>Dòng `27`, `4850 – 4896` | Bổ sung đầy đủ bản dịch (`vi`, `en`, `fr`), hỗ trợ tiền tệ `CNY`, xóa file nháp `frontend/preview.html` và tăng query version cache-busting `?v=...` trên `index.html` |

---

## 3. Phân Tích Rủi Ro Logic & Trường Hợp Biên (Edge Cases)

- **Trường hợp 1 — Người dùng chọn `"Chỉ 1 nơi (Ở lại nơi làm việc)"` (`retireMode === 'domestic'`)**:
  - Hệ thống tự động gán `retireCountry = workCountry`, `retireCity = workCity`, `dualInflation.enabled = false`, `forexDrift = 0`.
  - Trên popup `#plan-modal`: Ô *Nơi dự định nghỉ hưu* tự động nhận giá trị của *Nơi làm việc hiện tại* và bị khóa mờ (`disabled`), mũi tên đổi thành `=`.
  - Trên giao diện Tab 1: Tự động **ẩn** thẻ `#card-dual-inflation-stream` (Lạm phát 2 chặng & Tỷ giá) và **ẩn** cụm `#retire-location-radios` (3 nút Pháp / Việt / Song hành), giúp giao diện dành cho người sống ở 1 nơi cực kỳ tinh gọn.
- **Trường hợp 2 — Người dùng chọn `"Song hành 2 nơi (50% nơi làm việc / 50% nơi nghỉ hưu)"` (`retireMode === 'hybrid'`)**:
  - Hệ số PPP áp dụng bằng trung bình cộng: `pppEffective = 0.5 * pppWork + 0.5 * pppRetire` (cộng thêm dự phòng vé máy bay khứ hồi hàng năm trong nhóm Giải trí/Đi lại).
  - Mũi tên giữa 2 cột hiển thị biểu tượng `⇄`.
- **Trường hợp 3 — Khấu trừ khoản trả góp mua nhà (`monthlyMortgagePaidOff`) khi bước vào tuổi nghỉ hưu**:
  - Công thức `calculateRetireBudgetFromCashflow()` tự động trừ khoản trả góp ngân hàng mua nhà sẽ tất toán trước tuổi nghỉ hưu ra khỏi chi tiêu hiện tại trước khi quy đổi PPP.
- **Trường hợp 4 — Tương thích ngược với Kế hoạch cũ (Backward Compatibility)**:
  - Khi nạp kế hoạch cũ từ `localStorage` hoặc SQLite chưa có các trường mới, `ensurePlanDefaults(plan)` trong `state.js` tự động bổ sung giá trị mặc định an toàn: `maritalStatus: 'single'`, `taxParts: 1.0`, suy luận `workCountry` và `retireCountry` từ `taxRegime` hoặc `retireLocation`.

---

## 4. Danh Sách Công Việc Cuốn Chiếu (Actionable Tasks)

### [x] Task 1 — Xây dựng Công Thức Quy Đổi Chi Tiêu Từ Số Dư Hàng Tháng & Ma Trận PPP 22+ Quốc Gia (`frontend/js/taxOptimizer.js`)

- **File cần sửa**:
  1. `frontend/js/taxOptimizer.js` (Toàn bộ file 469 dòng, bổ sung các hằng số và hàm mới).
- **Tọa độ dòng code theo `CODEBASE_MAP.md`**:
  - Dòng `1 – 36`: Khai báo **Giỏ chuẩn gốc Tây Âu (`BASE_RETIRE_BASKET_EUR = { lean: 1600, standard: 2400, fat: 4000, seniorHealth: 180 }`)** và bảng `COUNTRY_PPP_PROFILES` cho **22+ quốc gia/khu vực trọng điểm** kèm tùy chọn `custom`.
  - Dòng `37 – 221` (`calculateProgressiveTax` và `calculateTaxDetailed`):
    - Hỗ trợ chia thu nhập chịu thuế theo số phần gia đình `taxParts` (`options.taxParts || 1.0`).
    - Hỗ trợ **4 Khuôn mẫu Thuế Toàn cầu (`taxArchetype`)**: `'fr_quotient'`, `'eu_splitting'`, `'asia_pacific'`, `'zero_cgt'`.
  - Dòng `222 – 333`:
    - Bổ sung hàm cốt lõi số 1: **`calculateRetireBudgetFromCashflow(params)`** — tính chi tiêu hưu trí trực tiếp từ Thu nhập, Số dư tiết kiệm hàng tháng và Nợ vay mua nhà hiện tại (hỗ trợ cả 3 chế độ `retireMode`: `'domestic'`, `'relocate'`, `'hybrid'`).
    - Bổ sung hàm số 2: **`getSuggestedRetirementBudget(cityKey, lifestyleTier, householdSize, customPppFactor)`** — trả về 3 mốc tham chiếu xã hội chỉ đọc (`1.600€ / 2.400€ / 4.000€ × PPP`) để đối chiếu và bóc tách 7 hạng mục chi tiêu.
    - Cập nhật hàm số 3: **`calculateFrenchPension(averageSalary, startWorkAge, stopWorkAge, claimAge)`** — tính chính xác số quý đóng (`trimestres`), phạt décote (-1.25%/quý thiếu nếu claim < 67t) và tự động xóa phạt ở tuổi 67 theo luật Pháp 2023. Khi là Vợ chồng, hàm được gọi độc lập cho từng người (`spouse1`, `spouse2`) với tuổi bắt đầu đi làm riêng biệt rồi cộng gộp quyền lợi.
    - Bổ sung hàm số 4: **`calculateVietnamBhxhPension(salaryVnd, yearsContributed, gender = 'male', claimAge)`** — phân định chuẩn xác theo luật BHXH Việt Nam:
      * **Nam:** 20 năm đầu = 45%, mỗi năm sau +2% ➔ Cần 35 năm để đạt 75% tối đa, tuổi hưởng lộ trình 62 tuổi.
      * **Nữ:** 15 năm đầu = 45%, mỗi năm sau +2% ➔ Cần 30 năm để đạt 75% tối đa, tuổi hưởng lộ trình 60 tuổi.
      * Khi là Vợ chồng: Chồng mặc định nhận quyền lợi Nam (62t), Vợ nhận quyền lợi Nữ (60t).
- **Công thức & Logic Đầu vào – Đầu ra**:
  1. **Công thức Chính: `calculateRetireBudgetFromCashflow(params)`**:
     - **Đầu vào (`params`)**:
       - `monthlyNetIncome`: Thu nhập ròng sau thuế hàng tháng hiện tại (EUR).
       - `monthlySavings`: Số dư tiết kiệm / đầu tư hàng tháng hiện tại (EUR).
       - `monthlyMortgagePaidOff`: Tiền trả góp mua nhà hàng tháng hiện tại sẽ trả xong trước khi nghỉ hưu (EUR, mặc định `0`).
       - `currentMonthlyLivingFallback`: Chi tiêu sinh hoạt hiện tại nếu người dùng nhập trực tiếp (EUR).
       - `workCityKey`: Mã nơi đang làm việc (ví dụ `'fr_paris'`, `pppWork = 1.00`).
       - `retireCityKey`: Mã nơi dự định nghỉ hưu (ví dụ `'vn_hcm_hn'`, `pppRetire = 0.45`).
       - `retireMode`: `'domestic'` (Ở lại 1 nơi) | `'relocate'` (Chuyển hẳn sang nơi nghỉ hưu) | `'hybrid'` (Song hành 50/50 giữa 2 nơi).
       - `householdSize`: `1` (Cá nhân) hoặc `2` (Vợ chồng).
     - **Các bước tính toán**:
       - `Bước 1 (Chi tiêu sinh hoạt thực tế hiện tại - currentLivingMonthly)`:
         Nếu `monthlyNetIncome > monthlySavings`:
         `currentLivingMonthly = max(500, monthlyNetIncome - monthlySavings - monthlyMortgagePaidOff)`
         Ngược lại: dùng `currentMonthlyLivingFallback`.
       - `Bước 2 (Quy đổi tương đương sức mua sang nơi nghỉ hưu - pppAdjustedLiving)`:
         - Nếu `retireMode === 'domestic'`: `effectivePpp = pppWork`, `pppRatio = 1.0`.
         - Nếu `retireMode === 'hybrid'`: `effectivePpp = 0.5 * pppWork + 0.5 * pppRetire`, `pppRatio = effectivePpp / pppWork`.
         - Nếu `retireMode === 'relocate'` (mặc định khi `workCityKey !== retireCityKey`): `effectivePpp = pppRetire`, `pppRatio = pppRetire / pppWork`.
         - `pppAdjustedLiving = Làm tròn(currentLivingMonthly * pppRatio)`
       - `Bước 3 (Cộng Bảo hiểm Y tế tuổi già)`:
         `seniorHealthAddon = Làm tròn(180 * effectivePpp * (householdSize >= 2 ? 1.90 : 1.0))`
         `monthlyRetireTotal = pppAdjustedLiving + seniorHealthAddon`
     - **Đầu ra**: Trả về `{ currentLivingMonthly, pppRatio, effectivePpp, pppAdjustedLiving, seniorHealthAddon, monthlyRetireTotal, annualRetireTotal: monthlyRetireTotal * 12, matchedTierLabel, referenceBenchmarks: { lean, standard, fat }, breakdown }`.
- **Biểu thức kiểm thử bằng `./verify_js.sh`**:
  ```zsh
  ./verify_js.sh "({ fromCashflowParis: window.TaxOptimizer.calculateRetireBudgetFromCashflow({ monthlyNetIncome: 3200, monthlySavings: 1000, monthlyMortgagePaidOff: 700, workCityKey: 'fr_paris', retireCityKey: 'fr_paris', retireMode: 'domestic', householdSize: 1 }), fromCashflowVN: window.TaxOptimizer.calculateRetireBudgetFromCashflow({ monthlyNetIncome: 3200, monthlySavings: 1000, monthlyMortgagePaidOff: 700, workCityKey: 'fr_paris', retireCityKey: 'vn_hcm_hn', retireMode: 'relocate', householdSize: 1 }) })"
  ```
  - *Kết quả kỳ vọng*: `fromCashflowParis.currentLivingMonthly === 1500`, `fromCashflowParis.monthlyRetireTotal === 1680`, `fromCashflowVN.monthlyRetireTotal === 756`.

---

### [x] Task 2 — Chuẩn hóa Hồ sơ Người dùng & Đồng Bộ Đám Mây Toàn Bộ Biến (`Theme`, `Ngôn ngữ`, `Tiền tệ`, `Profile`) Khi Đăng Nhập (`state.js`, `engine.js`, `ui.js`)

- **File cần sửa**:
  1. `frontend/js/state.js` (Dòng `99 – 275`, các hàm `savePlansToStorage`, `loadInitialPlans` & hàm bổ sung `ensurePlanDefaults`).
  2. `frontend/js/engine.js` (Dòng `525 – 1298`, hàm `runProjection`).
  3. `frontend/js/ui.js` (Dòng `752 – 877`, các hàm `setCurrency`, `toggleTheme`, `loadTheme`, `reloadPlansFromBackend`).
- **Tọa độ dòng code theo `CODEBASE_MAP.md`**:
  - `frontend/js/state.js` dòng `99 – 140` (`savePlansToStorage` & `debouncedSavePlansToStorage`):
    - **Lưu kèm `preferences` vào gói JSON đồng bộ lên Cloud (`/api/plans`)**: Trước khi lưu vào `localStorage` và gửi `POST /api/plans` lên SQLite backend, tự động đính kèm đối tượng `state.plansData.preferences`:
      ```javascript
      state.plansData.preferences = {
        lang: localStorage.getItem('pyretrait_lang') || 'vi',
        theme: localStorage.getItem('pyRetrait_theme') || document.documentElement.getAttribute('data-theme') || 'dark',
        currency: state.currency || 'EUR',
        viewMode: state.viewMode || 'nominal'
      };
      ```
    - **Khôi phục tự động khi tải dữ liệu / Đăng nhập (`applySavedUserPreferences(plansData)`)**: Khi `loadInitialPlans()` hoặc `reloadPlansFromBackend()` nhận dữ liệu từ `/api/plans` của tài khoản vừa đăng nhập, nếu có `plansData.preferences`, hệ thống tự động:
      1. Khôi phục **Theme (`dark` / `light`)**: Cập nhật `localStorage.setItem('pyRetrait_theme', pref.theme)`, đặt `document.documentElement.setAttribute('data-theme', pref.theme)` và đổi icon Mặt trời/Mặt trăng.
      2. Khôi phục **Ngôn ngữ (`vi` / `en` / `fr`)**: Cập nhật `localStorage.setItem('pyretrait_lang', pref.lang)` và gọi `window.I18n.setLanguage(pref.lang)`.
      3. Khôi phục **Đơn vị tiền tệ (`EUR` / `VND` / `USD` / `CNY`)** và **Chế độ xem (`nominal` / `real`)**.
    - Bổ sung hàm `ensurePlanDefaults(plan)` để tự động di trú an toàn theo `Plan Schema` tại Mục 4 của Blueprint:
      - `workCountry`: `'FR'`, `workCity`: `'fr_paris'`
      - `retireMode`: `'relocate'` (`'domestic' | 'relocate' | 'hybrid'`)
      - `retireCountry`: `'VN'`, `retireCity`: `'vn_hcm_hn'`
      - `maritalStatus`: `'single'` (`'single' | 'married'`), `taxParts`: `1.0`
      - `monthlyMortgagePaidOff`: `0`
      - `frenchPensionDetails`: `{ spouse1: { startWorkAge: 24, claimAge: 64, targetAnnualPension: 18000 }, spouse2: { startWorkAge: 24, claimAge: 64, targetAnnualPension: 16000 } }`
      - `bhxhVnDetails`: `{ spouse1: { gender: 'male', yearsContributed: 20, monthlySalaryVnd: 10000000, claimAge: 62 }, spouse2: { gender: 'female', yearsContributed: 20, monthlySalaryVnd: 10000000, claimAge: 60 } }`
  - `frontend/js/ui.js` dòng `752 – 877`:
    - Trong `toggleTheme()`, `setCurrency()`, `setViewMode()`: Gọi `debouncedSavePlansToStorage()` để lưu preferences lên Cloud.
    - Trong `reloadPlansFromBackend()`: Gọi `applySavedUserPreferences(state.plansData)` ngay sau khi đăng nhập thành công.
  - `frontend/js/engine.js` dòng `525 – 1298` (trong hàm `runProjection`):
    - Xác định `isSingleCountry = (plan.retireMode === 'domestic' || (plan.workCountry && plan.retireCountry && plan.workCountry === plan.retireCountry))` và `isSingle = (plan.maritalStatus !== 'married')`.
    - Nếu `isSingleCountry === true`: Đặt `forexDrift = 0` (không trượt tỷ giá ngoại tệ).
    - Truyền `taxParts: Number(plan.taxParts) || (isSingle ? 1.0 : 2.0)` vào `window.TaxOptimizer.calculateProgressiveTax`.
    - **Tính lương hưu độc lập & cộng gộp chính xác:** Khi `maritalStatus === 'married'`, tính lương hưu Pháp/BHXH theo tuổi bắt đầu đi làm và giới tính Nam/Nữ của từng người (`spouse1`, `spouse2`), sau đó cộng gộp vào dòng tiền an sinh của gia đình (`annualIncome += pensionSpouse1 + pensionSpouse2`).
- **Biểu thức kiểm thử bằng `./verify_js.sh`**:
  ```zsh
  ./verify_js.sh "(() => { const p = { currentAge: 30, retirementAge: 50, lifeExpectancy: 85, workCountry: 'FR', retireMode: 'domestic', retireCountry: 'FR', maritalStatus: 'married', taxParts: 2.0, currentSavings: 100000, annualSavings: 20000, retirementExpenses: 29760 }; const res = window.RetirementEngine.runProjection(p); return { survived: res.survived, isSingleCountry: res.isSingleCountry, finalPortfolio: Math.round(res.finalPortfolio) }; })()"
  ```

---

### [x] Task 3 — Đấu Nối Sự Kiện & Lưu Trữ Cho Popup `#plan-modal` (`frontend/js/ui-modals.js` & `frontend/index.html`)

- **File cần sửa**:
  1. `frontend/index.html` (Dòng `3386` đổi `style="display: flex;"` thành `style="display: none;"` sau khi hoàn thành kiểm tra bố cục; Dòng `255 – 270` chèn thanh `#profile-summary-bar` vào đầu `#tab-projections`).
  2. `frontend/js/ui-modals.js` (Dòng `1022 – 1070`, các hàm `openModal`, `saveNewPlanFromModal`).
  3. `frontend/js/ui.js` (Dòng `354 – 532`, hàm `renderActivePlanInputs` cập nhật dữ liệu hiển thị trên `#profile-summary-bar`).
- **Tọa độ dòng code theo `CODEBASE_MAP.md`**:
  - `frontend/index.html` dòng `3386 – 3595`: Khung HTML của `#plan-modal` đã có sẵn. Đóng mở modal qua class/display.
  - `frontend/index.html` dòng `255 – 270` (ngay đầu `#tab-projections` trước `#baseline-params-card`): Thêm thanh tóm tắt Hồ sơ `#profile-summary-bar` sử dụng class `.profile-summary-bar` đã có sẵn trong `styles.css` (dòng 8887–8930):
    ```html
    <div class="profile-summary-bar" id="profile-summary-bar">
      <div class="profile-summary-info">
        <span class="profile-tag-pill" id="lbl-summary-household">👤 Cá nhân (1 người)</span>
        <span class="profile-tag-pill" id="lbl-summary-locations">🇫🇷 Paris ➔ 🇻🇳 TP.HCM</span>
        <span class="profile-tag-pill" id="lbl-summary-mode">Chuyển hẳn (PPP 0.45x)</span>
      </div>
      <button class="btn btn-secondary btn-sm" id="btn-edit-profile-summary" style="font-size: 0.78rem; padding: 0.25rem 0.65rem;">
        ⚙️ Đổi hồ sơ
      </button>
    </div>
    ```
  - `frontend/js/ui-modals.js` dòng `1029 – 1068`:
    - Hàm `openModal(title, mode = 'create')`:
      - Nếu `mode === 'edit'`: Tải giá trị hiện tại của `getActivePlan()` vào các ô (`#inp-new-plan-name`, `#inp-plan-work-city`, `#inp-plan-retire-city`, các nút chọn gia đình và định hướng nơi sống).
      - Nếu `mode === 'create'`: Đặt các giá trị mặc định.
      - Gắn sự kiện chuyển đổi giữa các nút bấm `btn-plan-fam-*`, `btn-plan-mode-*`.
      - Khi chọn `btn-plan-mode-domestic`: Tự động khóa `inp-plan-retire-city` và đồng bộ bằng `inp-plan-work-city`.
    - Hàm `saveNewPlanFromModal()`:
      - Đọc `household` (`single` / `married`), `taxParts` (`1.0` / `2.0`).
      - Đọc `retireMode` (`domestic` / `relocate` / `hybrid`).
      - Đọc `workCity`, `workCountry`, `retireCity`, `retireCountry`.
      - Tự động gọi `calculateRetireBudgetFromCashflow()` để cập nhật ngân sách hưu trí cho kế hoạch.
      - Gọi `savePlansToStorage()`, `renderPlanSelector()`, `updateAll()`.
  - `frontend/js/ui.js` dòng `168 – 289`: Bắt sự kiện click vào nút `#btn-edit-profile-summary` để gọi `window.openModal('Chỉnh sửa Hồ sơ & Quốc gia', 'edit')`.
- **Biểu thức kiểm thử bằng `./verify_js.sh`**:
  ```zsh
  ./verify_js.sh "typeof window.saveNewPlanFromModal === 'function' && typeof window.openModal === 'function'"
  ```

---

### [x] Task 4 — Hiển Thị Trực Tiếp Toàn Bộ Thông Số (Inline Show All, Không Cần Nút Sửa) & Tự Động Ẩn/Hiện Thẻ Theo Hồ Sơ (`frontend/index.html` & `frontend/js/ui-tab1-streams.js`)

- **File cần sửa**:
  1. `frontend/index.html` (Dòng `489 – 745`: thẻ Lương hưu Pháp và BHXH VN; Dòng `1067 – 1280`: thẻ Chi tiêu hưu trí).
  2. `frontend/js/ui-tab1-streams.js` (Dòng `878 – 903`, `1540 – 1649`).
- **Tọa độ dòng code theo `CODEBASE_MAP.md`**:
  - **Nguyên tắc Hiển thị Trực tiếp — Show Mọi Thứ Ngay Trên Giao Diện (Inline Show All):**
    * Thẻ *Thông số Cơ bản & Dòng tiền* (`.baseline-params-card`): Giữ nguyên 5 cột chuẩn (Năm sinh, Tuổi nghỉ hưu, Kỳ vọng tuổi thọ, Tài sản hiện có, Lạm phát bình quân).
    * Cột *Các Luồng Thu Nhập* — **Cấu hình Lương hưu hiển thị trực tiếp, tuyệt đối không giấu sau nút Sửa hay Popup/Modal:**
      - **Khi `plan.maritalStatus === 'single'` (Cá nhân):** Thẻ lương hưu hiển thị 1 khối cấu hình trực tiếp ngay trên mặt thẻ (Tuổi bắt đầu đi làm, Tuổi nhận hưu, Giới tính, Số năm đóng bảo hiểm).
      - **Khi `plan.maritalStatus === 'married'` (Vợ chồng):** Thẻ lương hưu tự động hiển thị trực tiếp 2 khối/cột song song cho **Bạn (Người 1)** và **Bạn đời (Người 2)**:
        * **Lương hưu Pháp (CNAV + Agirc-Arrco):** Hiển thị trực tiếp ô nhập Tuổi bắt đầu đi làm (`startWorkAge`), Tuổi claim (`claimAge`) của từng người. Người dùng nhìn thấy ngay số quý đóng (`trimestres`), tỷ lệ phạt/thưởng décote, số tiền lương hưu riêng của từng người và tổng lương hưu gia đình. Có thể chỉnh sửa trực tiếp ngay trên thẻ, số liệu cập nhật tức thì.
        * **Lương hưu BHXH Việt Nam:** Hiển thị trực tiếp chọn Giới tính (`Nam`/`Nữ`), Số năm đóng (`yearsContributed`), Mức lương đóng của Chồng và Vợ ngay trên mặt thẻ.
  - `frontend/index.html` dòng `1067 – 1280` (trong `#card-retire-expense-stream`):
    - Hiển thị hộp giải thích tự động **"Tính từ mức sống hiện tại của bạn (Thu nhập - Số dư tiết kiệm)"** (`#box-cashflow-derived-retire`):
      Hiển thị rõ phép tính: `Thu nhập ròng/tháng - Tiết kiệm/tháng - Nợ nhà tất toán = Chi tiêu hiện tại ➔ × Hệ số PPP = Chi tiêu hưu trí`.
    - Bên dưới là **dòng tham chiếu tĩnh (Read-only, chỉ để xem đối chiếu)** (`#lbl-ppp-static-benchmarks`):
      `Mốc tham khảo tại [Thành phố]: Cơ bản ~X €/tháng • Thoải mái ~Y €/tháng • Thịnh vượng ~Z €/tháng`.
    - **Bảng bóc tách 7 khoản chi tiêu thực tế hàng tháng (`#box-ppp-breakdown-detail`):** Luôn luôn hiển thị mở sẵn (show all by default), không cần bấm click mở/đóng hay giấu trong accordion. Người dùng nhìn thấy ngay chi tiết từng nhóm chi phí (Ăn uống, Nhà ở, Y tế, Năng lượng, Đi lại, Đồ gia dụng, Giải trí/Giao lưu).
  - `frontend/js/ui-tab1-streams.js` dòng `1540 – 1649` (hàm `applyProfileVisibilityRules(plan)`):
    1. **Nếu `plan.retireMode === 'domestic'` (Chỉ 1 nơi — Làm việc và nghỉ hưu cùng chỗ)**:
       - Ẩn hoàn toàn thẻ `#card-dual-inflation-stream` (Lạm phát 2 chặng & Tỷ giá).
       - Ẩn cụm `#retire-location-radios` (3 nút Pháp / Việt / Song hành).
    2. **Nếu `plan.workCountry !== 'FR'`**:
       - Ẩn thẻ `#card-lmnp-income-stream` (BĐS LMNP Pháp).
    3. **Nếu `plan.workCountry !== 'VN'` và `plan.retireCountry !== 'VN'`**:
       - Ẩn thẻ `#card-bhxh-income-stream` (BHXH Việt Nam).
    4. Tự động gọi `window.TaxOptimizer.calculateRetireBudgetFromCashflow()` để cập nhật chi tiêu hưu trí, dòng tham chiếu tĩnh và bảng 7 khoản chi tiêu.
- **Biểu thức kiểm thử bằng `./verify_js.sh`**:
  ```zsh
  ./verify_js.sh "Object.keys(window.TaxOptimizer.COUNTRY_PPP_PROFILES).slice(0, 6).map(k => ({ city: k, fromCashflow: window.TaxOptimizer.calculateRetireBudgetFromCashflow({ monthlyNetIncome: 3500, monthlySavings: 1300, monthlyMortgagePaidOff: 0, workCityKey: 'fr_paris', retireCityKey: k, retireMode: 'relocate', householdSize: 1 }).monthlyRetireTotal }))"
  ```

---

### [x] Task 5 — Mở Rộng Đa Ngôn Ngữ (`vi`, `en`, `fr`), Tiền Tệ `CNY`, Dọn Dẹp File Nháp & Cache-Busting (`frontend/js/i18n.js`, `frontend/js/engine.js`, `frontend/index.html`)

- **File cần sửa / xóa**:
  1. `frontend/js/i18n.js` (Bổ sung khóa dịch cho popup hồ sơ và công thức cho `vi`, `en`, `fr`).
  2. `frontend/js/engine.js` (Hỗ trợ tiền tệ `'CNY'`).
  3. `frontend/index.html` (Tăng query version cache-busting `?v=...`).
  4. Xóa file nháp tạm `frontend/preview.html` nếu tồn tại.
- **Tọa độ dòng code theo `CODEBASE_MAP.md`**:
  - `frontend/js/i18n.js` dòng `21 – 620`: Bổ sung từ điển dịch cho các chuỗi mới của popup hồ sơ, thanh tóm tắt và bảng bóc tách chi tiêu cho cả 3 ngôn ngữ (`vi`, `en`, `fr`).
  - `frontend/js/engine.js` dòng `9 – 47`: Hỗ trợ mã tiền tệ `'CNY'` (`¥`) trong `formatCurrency()`.
  - `frontend/index.html` dòng `27` và `4850 – 4896`: Tăng query version `?v=...` cho `styles.css` và các file JS đã sửa để tránh cache trình duyệt.
- **Biểu thức kiểm thử bằng `./verify_js.sh`**:
  ```zsh
  ./verify_js.sh "({ eur: window.RetirementEngine.formatCurrency(1600, 'EUR'), cny: window.RetirementEngine.formatCurrency(12000, 'CNY'), vnd: window.RetirementEngine.formatCurrency(25000000, 'VND') })"
  ```

---

## 5. Nguồn Dữ Liệu PPP & Cơ Chế Cập Nhật Tự Động Định Kỳ (World Bank API, Numbeo & Cache Sync)

### 5.1. Bản Chất Dữ Liệu Thống Kê PPP
- **Dữ liệu Vĩ mô Quốc tế (World Bank / ICP)**: 
  - Chỉ số: `PA.NUS.PRVT.PP` (*PPP conversion factor, private consumption*) do Ngân Hàng Thế Giới khảo sát và công bố.
  - **Chu kỳ công bố:** Thống kê theo **NĂM** (Annual), **không có số liệu theo tháng** do quá trình khảo sát rổ hàng hóa toàn cầu mất nhiều thời gian.
- **Dữ liệu Cấp Thành phố & Hưu trí Thực tế (Numbeo / Expatistan / Eurostat)**:
  - World Bank đo bình quân toàn quốc. Trong thực tế nghỉ hưu, mức chi phí tại các thành phố lớn (Paris, TP.HCM, Hà Nội, New York) chênh lệch lớn so với vùng nông thôn hoặc tỉnh lẻ.
  - Vì vậy, hệ số PPP trong pyRetrait lấy mốc gốc là **Pháp (Paris = 1.00)** kết hợp giữa tỷ lệ giá tiêu dùng thực tế của **Numbeo** (*Cost of Living Plus Rent Index*) và mức giá so sánh của **Eurostat/OECD**.

---

### 5.2. Cách Khai Thác Trực Tiếp World Bank REST API (Miễn Phí 100%, Không Cần API Key)

- **Endpoint chính thức**:
  `https://api.worldbank.org/v2/country/{MÃ_QUỐC_GIA}/indicator/PA.NUS.PRVT.PP?mrv=1&format=json`
  - Tham số `mrv=1` (*Most Recent Value*): Tự động lấy số liệu năm mới nhất đã công bố.
  - Ví dụ gọi nhiều quốc gia cùng lúc:
    `https://api.worldbank.org/v2/country/FRA;VNM;DEU;USA;ESP;PRT;THA;MYS;SGP;JPN/indicator/PA.NUS.PRVT.PP?mrv=1&format=json`
- **Cấu trúc JSON trả về từ World Bank**:
  ```json
  [
    { "page": 1, "pages": 1, "total": 10 },
    [
      { "countryiso3code": "FRA", "date": "2023", "value": 0.81 },
      { "countryiso3code": "VNM", "date": "2023", "value": 7850.25 },
      { "countryiso3code": "DEU", "date": "2023", "value": 0.79 },
      { "countryiso3code": "USA", "date": "2023", "value": 1.00 }
    ]
  ]
  ```

---

### 5.3. Hai Phương Án Tự Động Hóa Cập Nhật Định Kỳ (Bảo Đảm Nguyên Tắc Local-First)

Vì pyRetrait bắt buộc phải chạy 100% offline và không bắt người dùng phải chờ API ngoài mỗi khi tải trang, việc cập nhật định kỳ được tổ chức theo 2 giải pháp:

#### Phương án A: Tự Động Kiểm Tra & Cache Trên Trình Duyệt (Frontend LocalStorage Sync — 30 Ngày/Lần)
Khi người dùng mở ứng dụng có kết nối mạng, trình duyệt kiểm tra thời gian đồng bộ lần cuối. Nếu đã quá 30 ngày, hệ thống tự động fetch ngầm trong background và lưu cache:

```javascript
async function syncWorldBankPppIfExpired() {
  const CACHE_KEY = 'pyretrait_wb_ppp_cache';
  const lastSync = localStorage.getItem('pyretrait_wb_ppp_last_sync');
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  if (lastSync && (now - Number(lastSync) < THIRTY_DAYS)) {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  }

  try {
    const url = 'https://api.worldbank.org/v2/country/FRA;VNM;DEU;USA;ESP;PRT;THA/indicator/PA.NUS.PRVT.PP?mrv=1&format=json';
    const res = await fetch(url);
    const data = await res.json();
    if (data && data[1]) {
      const pppMap = {};
      data[1].forEach(row => {
        if (row.value) pppMap[row.countryiso3code] = row.value;
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(pppMap));
      localStorage.setItem('pyretrait_wb_ppp_last_sync', String(now));
      return pppMap;
    }
  } catch (err) {
    console.warn('Không thể kết nối World Bank API, sử dụng bảng cấu hình tĩnh.', err);
  }
  return null;
}
```

#### Phương án B: Script Python Trên Backend / Cron Job Hàng Tháng (`scripts/fetch_worldbank_ppp.py`)
Định kỳ hàng tháng, một cron job đơn giản chạy ngầm tải dữ liệu mới nhất từ World Bank API và chốt vào bảng cấu hình:

```python
import urllib.request
import json

url = "https://api.worldbank.org/v2/country/FRA;VNM;DEU;USA;ESP;PRT;THA;MYS;SGP;JPN/indicator/PA.NUS.PRVT.PP?mrv=1&format=json"
req = urllib.request.Request(url, headers={'User-Agent': 'pyRetrait-Sync/1.0'})

with urllib.request.urlopen(req) as response:
    raw_data = json.loads(response.read().decode())[1]

ppp_data = {item['countryiso3code']: item['value'] for item in raw_data if item.get('value')}
print("Dữ liệu PPP World Bank mới nhất:", ppp_data)
```

---

### 5.4. Ma Trận Bảng Giá Tham Chiếu Mặc Định (`COUNTRY_PPP_PROFILES`)
Bảng tĩnh dự phòng tích hợp sẵn trong `frontend/js/taxOptimizer.js` (gốc Pháp Paris = 1.00):
- **Pháp & Tây Âu**: Paris (`1.00`), Tỉnh lẻ Pháp (`0.82`), Đức (`0.95`), Bỉ (`0.92`), Thụy Sĩ (`1.45`), Anh (`1.10`).
- **Nam Âu (Thiên đường hưu trí)**: Bồ Đào Nha (`0.65`), Tây Ban Nha (`0.62`), Ý (`0.78`), Hy Lạp (`0.58`).
- **Bắc Mỹ & Châu Đại Dương**: Mỹ NY/SF (`1.25`), Mỹ Texas/Florida (`0.95`), Canada (`0.98`), Úc (`1.05`).
- **Đông Nam Á & Châu Á**: Việt Nam TP.HCM/Hà Nội (`0.45`), Đà Nẵng/Tỉnh lẻ (`0.36`), Thái Lan (`0.50`), Malaysia (`0.46`), Singapore (`1.20`), Trung Quốc (`0.58`), Nhật Bản (`0.85`).
- **Tùy chỉnh cá nhân**: `custom` (Mặc định `1.00`, cho phép người dùng tự nhập hệ số hoặc số tiền thực tế).
