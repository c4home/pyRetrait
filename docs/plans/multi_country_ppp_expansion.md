# Kế Hoạch Tính Năng: Mở Rộng Hồ Sơ Người Dùng Đa Chiều Qua Popup `+ Mới` (`#plan-modal`) & Tự Động Quy Đổi Chi Tiêu Hưu Trí Từ Số Dư Hàng Tháng (`multi_country_ppp_expansion.md`)

> **Hướng dẫn sử dụng (Quy trình Tiết kiệm 75% Token):**
> 1. **Giai đoạn 1 & 2 (Làm rõ & Đóng băng phạm vi):** Tài liệu này định nghĩa chi tiết lộ trình nâng cấp **Hồ Sơ Người Dùng Đa Chiều (Multi-Profile & Cashflow-Derived PPP Engine)**:
>    - **Định hình Hồ sơ ngay tại Popup `+ Mới` (`#plan-modal`):** Khi tạo kế hoạch mới (hoặc bấm sửa hồ sơ), người dùng chọn 3 thông tin cốt lõi: **Quy mô (`Cá nhân 1 người` / `Vợ chồng 2 người`)**, **Quốc gia làm việc**, và **Chế độ nơi nghỉ hưu (`Chỉ 1 nơi` / `Về nước khác` / `Song hành 2 nơi`)**. Giao diện bên ngoài sẽ tự động ẩn toàn bộ các thẻ không liên quan (ẩn tỷ giá/lạm phát 2 chặng nếu chỉ ở 1 nơi, ẩn LMNP/BHXH nếu không thuộc Pháp/Việt Nam).
>    - **Ưu tiên số 1 (Mặc định):** Tự động suy ra mức chi tiêu hưu trí từ chính **Thu nhập & Số dư tiết kiệm hàng tháng hiện tại của người dùng** (`Chi tiêu sinh hoạt thực tế = Thu nhập sau thuế - Tiết kiệm đầu tư - Trả góp nợ nhà`), sau đó quy đổi theo tỷ lệ Sức mua tương đương (`PPP nơi nghỉ hưu / PPP nơi làm việc`) và cộng phí bảo hiểm y tế tuổi già.
>    - **Thước đo đối chiếu trực quan (Chỉ đọc — Không phải nút bấm):** Hiển thị dòng tham chiếu 3 mốc xã hội (`Cơ bản 1.600€ | Thoải mái 2.400€ | Thịnh vượng 4.000€ × PPP`) dưới dạng chỉ báo tĩnh (read-only badge) để người dùng biết mức chi tiêu của mình đang tương đương phân khúc nào tại nơi nghỉ hưu, tuyệt đối không làm nút bấm.
> 2. **Giai đoạn 3 (Mở Phiên Chat Mới & Thực thi từng Task):** Sau khi chốt file này, bấm **New Chat** và gửi câu lệnh ngắn gọn:  
>    *"Dựa vào file `docs/plans/multi_country_ppp_expansion.md`, hãy thực hiện **Task 1**. Chỉ dùng `replace_file_content` sửa đúng dòng đã chỉ định."*

---

## 1. Mục Tiêu & Ràng Buộc Kỹ Thuật

- **Mục tiêu nghiệp vụ**:
  1. **Thiết lập Hồ sơ trong Popup `+ Mới` (`#plan-modal`) để tự động tối ưu Giao diện**:
     - Thay thế ô chọn mẫu *Lean/Fat FIRE* cũ kỹ trong `#plan-modal` bằng 3 lựa chọn Hồ sơ:
       1. **Hồ sơ gia đình:** `Cá nhân (1 người)` hoặc `Vợ chồng (2 người đồng hành)`.
       2. **Quốc gia đang làm việc:** `Pháp (FR)`, `Đức (DE)`, `Việt Nam (VN)`, `Trung Quốc (CN)`, `Mỹ / Quốc tế`...
       3. **Định hướng nơi nghỉ hưu:** `Ở lại nơi làm việc (Chỉ 1 nơi)` | `Chuyển sang quốc gia khác` | `Song hành 2 nơi (50/50)`.
     - Tự động ẩn/hiện thẻ giao diện theo Hồ sơ: Nếu chọn **`Chỉ 1 nơi`**, tự động ẩn thẻ *Lạm phát 2 chặng & Tỷ giá* (`#card-dual-inflation-stream`) và ẩn cụm 3 radio *Pháp / Việt / Song hành*; nếu không liên quan đến Pháp/Việt Nam thì tự động ẩn thẻ *BĐS LMNP Pháp* và *BHXH Việt Nam*.
  2. **Công thức Mặc định: Tính Chi tiêu Hưu trí từ Số dư Hàng tháng Hiện tại (`Cashflow-Derived Retirement Spending`)**:
     - `Chi tiêu sinh hoạt hiện tại/tháng = Thu nhập sau thuế/tháng - Số tiền tiết kiệm đầu tư/tháng - Tiền trả góp mua nhà/tháng (đã trả xong trước khi nghỉ hưu)`
     - `Chi tiêu hưu trí dự kiến/tháng = Chi tiêu sinh hoạt hiện tại/tháng * Hệ_số_PPP + Phụ phí Y tế tuổi già + Phụ phí thuê nhà (nếu đi thuê)`
     - Hiển thị kèm dòng tham chiếu tĩnh (`Cơ bản | Thoải mái | Thịnh vượng × PPP` — chỉ để xem, không bấm) và bảng bóc tách 7 hạng mục chi tiêu.
  3. **Đồng bộ Thuế, Lương hưu & Miễn trừ cho cả Cá nhân lẫn Vợ chồng**:
     - Khi chọn **Vợ chồng (`married`)**: Tự động chia phần thuế hộ gia đình (`taxParts >= 2.0`), nhân đôi hạn mức rút lãi miễn thuế (**Assurance-Vie `9.200 EUR/năm`**, **Sparer-Pauschbetrag `2.000 EUR/năm`**), và tính tổng lương hưu từ cả 2 nguồn thu nhập của vợ & chồng.

- **Ràng buộc bắt buộc**:
  - 100% tính toán chạy trên trình duyệt (Vanilla JS), tuyệt đối không đưa logic tài chính sang Backend.
  - Hỗ trợ cả Dark Mode và Light Mode bằng biến CSS (`var(--bg-card)`, `var(--text-main)`, `var(--text-muted)`).
  - Không dùng cú pháp LaTeX, dùng font `var(--font-sans)` cho toàn bộ văn bản giải thích và công thức.
  - Mỗi Task chỉ sửa tối đa **2–3 file** để thực hiện trọn vẹn trong 1 phiên chat và kiểm chứng ngay bằng `./verify_js.sh`.

---

## 2. Tổng Quan Các File & Tọa Độ Dòng Cần Thay Đổi (Tra cứu từ `docs/CODEBASE_MAP.md`)

| Task | File tác động (Tối đa 2–3 file/Task) | Khoảng dòng dự kiến | Nội dung nâng cấp |
| :--- | :--- | :--- | :--- |
| **Task 1** | `frontend/js/taxOptimizer.js` | Dòng `1 – 333` | Bổ sung `COUNTRY_PPP_PROFILES` (22+ khu vực), hàm `calculateRetireBudgetFromCashflow()` (tính từ Thu nhập - Tiết kiệm - Trả góp nhà), thước đo tham chiếu 3 mức sống, chia thuế theo `taxParts` & lương hưu tham số hóa |
| **Task 2** | `frontend/js/state.js`<br>`frontend/js/engine.js`<br>`frontend/js/ui-tab3-taxes.js` | Dòng `141 – 275`<br>Dòng `525 – 568`, `829 – 938`<br>Dòng `476 – 513` | Chuẩn hóa schema Hồ sơ (`workCountry`, `retireMode`, `retireCountry`, `retireCity`, `maritalStatus`), chế độ 1 quốc gia và tính gộp lương hưu cho 2 vợ chồng |
| **Task 3** | `frontend/index.html`<br>`frontend/js/ui-modals.js` | Dòng `290 – 300`, `3288 – 3315`<br>Dòng `1029 – 1068` | Nâng cấp Popup `+ Mới` (`#plan-modal`) để chọn Hồ sơ (Cá nhân/Vợ chồng, Nước làm việc, Chế độ nghỉ hưu 1 nơi / Liên quốc gia / Song hành) & nút mở sửa lại Hồ sơ trên Tab 1 |
| **Task 4** | `frontend/index.html`<br>`frontend/js/ui-tab1-streams.js` | Dòng `1000 – 1180`<br>Dòng `878 – 903`, `1540 – 1649` | Tự động ẩn/hiện các thẻ theo Hồ sơ (ẩn tỷ giá/radio nếu ở 1 nơi, ẩn LMNP/BHXH nếu khác nước), hiển thị công thức tính từ Số dư hàng tháng + dòng tham chiếu tĩnh & 7 khoản chi |
| **Task 5** | `frontend/js/i18n.js`<br>`frontend/js/engine.js`<br>`frontend/index.html` | Dòng `13 – 620`<br>Dòng `9 – 47`<br>Dòng `27`, `4598 – 4614` | Bổ sung khóa dịch (`vi`, `en`, `fr`) + cấu hình mở rộng `zh` (Tiếng Trung), `de` (Tiếng Đức), tiền tệ `CNY` và tăng version `?v=...` |

---

## 3. Phân Tích Rủi Ro Logic & Trường Hợp Biên (Edge Cases)

- **Trường hợp 1 — Người dùng chọn `"Ở lại chính nơi đang làm việc (Chỉ 1 nơi)"` (`retireMode === 'domestic'`) trong `#plan-modal`**:
  - Hệ thống tự động gán `retireCountry = workCountry`, `retireCity = workCity`, `dualInflation.enabled = false`, `forexDrift = 0`.
  - Trên giao diện: Tự động **ẩn** thẻ `#card-dual-inflation-stream` (Lạm phát 2 chặng & Tỷ giá) và **ẩn** cụm `#retire-location-radios` (3 nút Pháp / Việt / Song hành), giúp giao diện dành cho người sống ở 1 nơi cực kỳ tinh gọn.
- **Trường hợp 2 — Người dùng chọn `"Song hành 2 nơi (50% nơi làm việc / 50% nơi nghỉ hưu)"` (`retireMode === 'hybrid'`)**:
  - Hệ số PPP áp dụng bằng trung bình cộng: `pppEffective = 0.5 * pppWork + 0.5 * pppRetire` (cộng thêm dự phòng vé máy bay khứ hồi hàng năm trong nhóm Giải trí/Đi lại).
- **Trường hợp 3 — Khấu trừ khoản trả góp mua nhà (`mortgagePayment`) khi bước vào tuổi nghỉ hưu**:
  - Công thức `calculateRetireBudgetFromCashflow()` tự động trừ khoản trả góp ngân hàng mua nhà sẽ tất toán trước tuổi nghỉ hưu ra khỏi chi tiêu hiện tại trước khi quy đổi PPP.

---

## 4. Danh Sách Công Việc Cuốn Chiếu (Actionable Tasks)

### Task 1 — Xây dựng Công Thức Quy Đổi Chi Tiêu Từ Số Dư Hàng Tháng & Ma Trận PPP 22+ Quốc Gia (`frontend/js/taxOptimizer.js`)

- **File cần sửa**:
  1. `frontend/js/taxOptimizer.js` (Dòng `1 – 333`).
- **Tọa độ dòng code dự kiến**:
  - Dòng `8 – 30`: Khai báo **Giỏ chuẩn gốc Tây Âu (`BASE_RETIRE_BASKET_EUR = { lean: 1600, standard: 2400, fat: 4000, rent: 700, seniorHealth: 180 }`)** và bảng `COUNTRY_PPP_PROFILES` cho **22+ quốc gia/khu vực trọng điểm** kèm tùy chọn `custom`.
  - Dòng `37 – 221` (`calculateProgressiveTax` và `calculateTaxDetailed`):
    - Hỗ trợ chia thu nhập chịu thuế theo số phần gia đình `taxParts` (`options.taxParts || 1.0`).
    - Hỗ trợ **4 Khuôn mẫu Thuế Toàn cầu (`taxArchetype`)**: `'fr_quotient'`, `'eu_splitting'`, `'asia_pacific'`, `'zero_cgt'`.
  - Dòng `222 – 333`:
    - Bổ sung hàm cốt lõi số 1: **`calculateRetireBudgetFromCashflow(params)`** — tính chi tiêu hưu trí trực tiếp từ Thu nhập, Số dư tiết kiệm hàng tháng và Nợ vay mua nhà hiện tại (hỗ trợ cả 3 chế độ `retireMode`: `'domestic'`, `'relocate'`, `'hybrid'`).
    - Bổ sung hàm số 2: **`getSuggestedRetirementBudget(cityKey, lifestyleTier, isRenter, householdSize, customPppFactor)`** — trả về 3 mốc tham chiếu xã hội chỉ đọc (`1.600€ / 2.400€ / 4.000€ × PPP`) để đối chiếu và bóc tách 7 hạng mục chi tiêu.
    - Bổ sung hàm số 3: **`calculateParametricPension(averageSalaryEur, startWorkAge, stopWorkAge, claimAge, countryCode)`**.
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
       - `isRenterAtRetire`: `true` nếu khi nghỉ hưu vẫn phải đi thuê nhà, `false` nếu đã có nhà riêng.
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
       - `Bước 3 (Cộng Bảo hiểm Y tế tuổi già & Tiền thuê nhà nếu chưa có nhà)`:
         `seniorHealthAddon = Làm tròn(180 * effectivePpp * (householdSize >= 2 ? 1.90 : 1.0))`
         `rentAddon = isRenterAtRetire ? Làm tròn(700 * effectivePpp * (householdSize >= 2 ? 1.20 : 1.0)) : 0`
         `monthlyRetireTotal = pppAdjustedLiving + seniorHealthAddon + rentAddon`
     - **Đầu ra**: Trả về `{ currentLivingMonthly, pppRatio, effectivePpp, pppAdjustedLiving, seniorHealthAddon, rentAddon, monthlyRetireTotal, annualRetireTotal: monthlyRetireTotal * 12, matchedTierLabel, referenceBenchmarks: { lean, standard, fat }, breakdown }`.
- **Biểu thức kiểm thử bằng `./verify_js.sh`**:
  ```zsh
  ./verify_js.sh "({ fromCashflowParis: window.TaxOptimizer.calculateRetireBudgetFromCashflow({ monthlyNetIncome: 3200, monthlySavings: 1000, monthlyMortgagePaidOff: 700, workCityKey: 'fr_paris', retireCityKey: 'fr_paris', retireMode: 'domestic', isRenterAtRetire: false, householdSize: 1 }), fromCashflowVN: window.TaxOptimizer.calculateRetireBudgetFromCashflow({ monthlyNetIncome: 3200, monthlySavings: 1000, monthlyMortgagePaidOff: 700, workCityKey: 'fr_paris', retireCityKey: 'vn_hcm_hn', retireMode: 'relocate', isRenterAtRetire: false, householdSize: 1 }), parisCoupleOwn: window.TaxOptimizer.getSuggestedRetirementBudget('fr_paris', 'lean', false, 2) })"
  ```
  - *Kết quả kỳ vọng*: `fromCashflowParis.currentLivingMonthly === 1500`, `fromCashflowParis.monthlyRetireTotal === 1680`, `fromCashflowVN.monthlyRetireTotal === 756`, `parisCoupleOwn.monthlyTotal === 2480`.

---

### Task 2 — Chuẩn hóa Hồ sơ Người dùng & Đồng Bộ Đám Mây Toàn Bộ Biến (`Theme`, `Ngôn ngữ`, `Tiền tệ`, `Profile`) Khi Đăng Nhập (`state.js`, `engine.js`, `ui.js`)

- **File cần sửa**:
  1. `frontend/js/state.js` (Dòng `99 – 275`, các hàm `savePlansToStorage` & `loadInitialPlans`).
  2. `frontend/js/engine.js` (Dòng `525 – 568` và `829 – 938`, hàm `runProjection`).
  3. `frontend/js/ui.js` (Dòng `752 – 850`, các hàm `setCurrency`, `toggleTheme`, `pyretrait:language-changed`, `reloadPlansFromBackend`).
- **Tọa độ dòng code dự kiến**:
  - `frontend/js/state.js` dòng `99 – 179` (`savePlansToStorage` & `loadInitialPlans`):
    - **Lưu kèm `preferences` vào gói JSON đồng bộ lên Cloud (`/api/plans`)**: Trước khi lưu vào `localStorage` và gửi `POST /api/plans` lên SQLite backend, tự động đính kèm đối tượng `state.plansData.preferences`:
      ```text
      state.plansData.preferences = {
        lang: localStorage.getItem('pyretrait_lang') || 'vi',
        theme: localStorage.getItem('pyRetrait_theme') || document.documentElement.getAttribute('data-theme') || 'dark',
        currency: state.currency || 'EUR',
        viewMode: state.viewMode || 'nominal'
      }
      ```
    - **Khôi phục tự động khi tải dữ liệu / Đăng nhập (`applySavedUserPreferences(plansData)`)**: Khi `loadInitialPlans()` hoặc `reloadPlansFromBackend()` nhận dữ liệu từ `/api/plans` của tài khoản vừa đăng nhập, nếu có `plansData.preferences`, hệ thống tự động:
      1. Khôi phục **Theme (`dark` / `light`)**: Cập nhật `localStorage.setItem('pyRetrait_theme', pref.theme)`, đặt `document.documentElement.setAttribute('data-theme', pref.theme)` và đổi icon Mặt trời/Mặt trăng.
      2. Khôi phục **Ngôn ngữ (`vi` / `en` / `fr` / `zh` / `de`)**: Cập nhật `localStorage.setItem('pyretrait_lang', pref.lang)` và gọi `window.I18n.setLanguage(pref.lang)`.
      3. Khôi phục **Đơn vị tiền tệ (`EUR` / `VND` / `USD` / `CNY`)** và **Chế độ xem (`nominal` / `real`)**.
    - Bổ sung các trường hồ sơ người dùng mặc định vào từng `plan` trong `state.plansData.plans` (tự động được lưu trọn vẹn trong cột JSON của bảng `user_plans` trên SQLite):
      - `workCountry`: `'FR'`, `workCity`: `'fr_paris'`
      - `retireMode`: `'relocate'` (`'domestic' | 'relocate' | 'hybrid'`)
      - `retireCountry`: `'VN'`, `retireCity`: `'vn_hcm_hn'`
      - `housingStatusAtRetire`: `'owner_paid'` (`'owner_paid' | 'renter'`)
  - `frontend/js/ui.js` dòng `752 – 850`:
    - Trong `toggleTheme()` (dòng `796 – 804`), `setCurrency()` (dòng `752 – 773`) và sự kiện `pyretrait:language-changed` (dòng `812 – 820`): Gọi `debouncedSavePlansToStorage()` để mỗi khi người dùng đổi **Giao diện Sáng/Tối**, đổi **Ngôn ngữ** hoặc đổi **Tiền tệ**, tùy chọn mới được đồng bộ ngay lên tài khoản đám mây.
    - Trong `reloadPlansFromBackend()` (dòng `829 – 849`, được gọi ngay sau khi người dùng Đăng nhập thành công): Gọi `applySavedUserPreferences(state.plansData)` để lập tức áp dụng lại Ngôn ngữ, Theme và Hồ sơ của người dùng đó.
  - `frontend/js/engine.js` dòng `556 – 568`, `829 – 842` và `932 – 938`:
    - Xác định `isSingleCountry = (plan.retireMode === 'domestic' || (plan.workCountry && plan.retireCountry && plan.workCountry === plan.retireCountry))` và `isSingle = (plan.maritalStatus !== 'married')`.
    - Nếu `isSingleCountry === true`: Đặt `forexDrift = 0` (không trượt tỷ giá ngoại tệ).
    - Truyền `taxParts: Number(plan.taxParts) || (isSingle ? 1.0 : 2.0)` vào `window.TaxOptimizer.calculateProgressiveTax` và truyền `isSingle` vào `simulateWithdrawalWaterfall`.
- **Biểu thức kiểm thử bằng `./verify_js.sh`**:
  ```zsh
  ./verify_js.sh "(() => { const p = { currentAge: 30, retirementAge: 50, lifeExpectancy: 85, workCountry: 'FR', retireMode: 'domestic', retireCountry: 'FR', maritalStatus: 'married', taxParts: 2.0, currentSavings: 100000, annualSavings: 20000, retirementExpenses: 29760 }; const res = window.RetirementEngine.runProjection(p); return { survived: res.survived, isSingleCountry: res.isSingleCountry, finalPortfolio: Math.round(res.finalPortfolio) }; })()"
  ```

---

### Task 3 — Nâng cấp Popup `+ Mới` (`#plan-modal`) Để Chọn Hồ Sơ & Chỉnh Sửa Hồ Sơ Hiện Tại (`frontend/index.html` & `frontend/js/ui-modals.js`)

- **File cần sửa**:
  1. `frontend/index.html` (Dòng `290 – 300` trong `#baseline-params-card` và dòng `3288 – 3315` trong `#plan-modal`).
  2. `frontend/js/ui-modals.js` (Dòng `234 – 310` và `1029 – 1068`, các hàm `openModal`, `saveNewPlanFromModal`).
- **Tọa độ dòng code dự kiến**:
  - `frontend/index.html` dòng `3288 – 3315` (Popup `#plan-modal` bật lên khi bấm nút **`+ Mới`** hoặc nút **`Đổi hồ sơ`**):
    - Giữ ô **Tên kế hoạch (`#inp-new-plan-name`)**.
    - Thay thế ô chọn mẫu *Lean/Fat FIRE* cũ bằng **3 trường thiết lập Hồ sơ**:
      1. **Quy mô gia đình (`#inp-plan-household`)**: `Cá nhân (1 người)` (`single`) / `Vợ chồng (2 người đồng hành)` (`married`).
      2. **Nơi làm việc & Tích lũy hiện tại (`#inp-plan-work-city`)**: Chọn quốc gia/thành phố đang làm việc (Paris - Pháp, Tỉnh lẻ Pháp, Munich - Đức, Berlin - Đức, Việt Nam, Trung Quốc, Mỹ, Nhật, Hàn...).
      3. **Định hướng nơi nghỉ hưu (`#inp-plan-retire-mode`)**:
         - `Ở lại chính nơi đang làm việc (Chỉ 1 nơi — Không rủi ro tỷ giá)` (`domestic`)
         - `Chuyển về quê hương / Quốc gia khác` (`relocate`)
         - `Ở song hành 2 nơi (50% nơi làm việc / 50% nơi nghỉ hưu)` (`hybrid`)
      4. **Khung chọn Điểm đến nghỉ hưu (`#group-plan-retire-destination` — Tự động ẩn đi nếu chọn `"Chỉ 1 nơi"`)**:
         - Chọn **Thành phố / Quốc gia nghỉ hưu (`#inp-plan-retire-city`)** (22+ khu vực PPP + Tùy chỉnh) và **Nhà ở khi về hưu (`#inp-plan-retire-housing`: Đã có nhà trả hết nợ / Đi thuê nhà)**.
  - `frontend/index.html` dòng `290 – 295` (Đầu thẻ `Thông số Cơ bản & Dòng tiền`):
    - Thêm một thanh hiển thị trạng thái Hồ sơ hiện tại gọn nhẹ (`#profile-summary-bar`, ví dụ: `Vợ chồng (2 người) • Làm việc: Pháp ➔ Nghỉ hưu: Việt Nam [Đổi hồ sơ]`) để người dùng có thể bấm mở lại `#plan-modal` ở chế độ **Cập nhật hồ sơ kế hoạch hiện tại** bất cứ lúc nào mà không cần tạo kế hoạch mới.
  - `frontend/js/ui-modals.js` dòng `1029 – 1068`:
    - Hỗ trợ 2 chế độ cho `#plan-modal`: `mode = 'create'` (khi bấm nút `+ Mới` trên Header) và `mode = 'edit'` (khi bấm `[Đổi hồ sơ]` trên kế hoạch hiện tại).
    - Khi người dùng đổi `#inp-plan-retire-mode` sang `'domestic'`, ẩn ngay `#group-plan-retire-destination` trong popup để không bắt người dùng nhập thừa.
    - Khi bấm Lưu: Ghi `maritalStatus`, `taxParts` (`1.0` hoặc `2.0`), `workCountry`, `workCity`, `retireMode`, `retireCountry`, `retireCity`, `housingStatusAtRetire` vào `plan`, tự động tính lại mức chi tiêu hưu trí từ Số dư hàng tháng (`calculateRetireBudgetFromCashflow`) và gọi `updateAll()`.
- **Biểu thức kiểm thử bằng `./verify_js.sh`**:
  ```zsh
  ./verify_js.sh "({ domesticMode: window.TaxOptimizer.calculateRetireBudgetFromCashflow({ monthlyNetIncome: 3500, monthlySavings: 1200, workCityKey: 'de_munich', retireCityKey: 'de_munich', retireMode: 'domestic', householdSize: 2 }).pppRatio, hybridMode: window.TaxOptimizer.calculateRetireBudgetFromCashflow({ monthlyNetIncome: 3500, monthlySavings: 1200, workCityKey: 'fr_paris', retireCityKey: 'vn_hcm_hn', retireMode: 'hybrid', householdSize: 2 }).pppRatio })"
  ```
  - *Kết quả kỳ vọng*: `domesticMode === 1`, `hybridMode === 0.725` (`(1.0 + 0.45) / 2`).

---

### Task 4 — Tự Động Ẩn/Hiện Giao Diện Theo Hồ Sơ & Hiển Thị Công Thức Số Dư Hàng Tháng (`frontend/index.html` & `frontend/js/ui-tab1-streams.js`)

- **File cần sửa**:
  1. `frontend/index.html` (Dòng `1000 – 1080`, thẻ `#card-retire-expense-stream`).
  2. `frontend/js/ui-tab1-streams.js` (Dòng `878 – 903`, `1540 – 1649`).
- **Tọa độ dòng code dự kiến**:
  - `frontend/index.html` dòng `1026 – 1079` (trong `.retire-expense-config-box` của `#card-retire-expense-stream`):
    - Hiển thị hộp giải thích tự động **"Tính từ mức sống hiện tại của bạn (Thu nhập - Số dư tiết kiệm)"** (`#box-cashflow-derived-retire`):
      Hiển thị rõ phép tính: `Thu nhập ròng/tháng - Tiết kiệm/tháng - Nợ nhà tất toán = Chi tiêu hiện tại ➔ × Hệ số PPP = Chi tiêu hưu trí`.
    - Bên dưới là **dòng tham chiếu tĩnh (Read-only, tuyệt đối không phải nút bấm)** (`#lbl-ppp-static-benchmarks`):
      `Mốc tham khảo tại [Thành phố]: Cơ bản ~X €/tháng • Thoải mái ~Y €/tháng • Thịnh vượng ~Z €/tháng` kèm khung thu gọn/mở rộng **"Xem bóc tách 7 khoản chi tiêu thực tế hàng tháng"** (`#box-ppp-breakdown-detail`).
  - `frontend/js/ui-tab1-streams.js` dòng `1540 – 1649` (hàm `updateRetirementLocationRadiosUI` & hàm mới `applyProfileVisibilityRules(plan)`):
    1. **Nếu `plan.retireMode === 'domestic'` (Chỉ 1 nơi — Làm việc và nghỉ hưu cùng chỗ)**:
       - Ẩn hoàn toàn thẻ `#card-dual-inflation-stream` (Lạm phát 2 chặng & Tỷ giá).
       - Ẩn cụm `#retire-location-radios` (3 nút Pháp / Việt / Song hành).
    2. **Nếu `plan.workCountry !== 'FR'`**:
       - Ẩn thẻ `#card-lmnp-income-stream` (BĐS LMNP Pháp).
    3. **Nếu `plan.workCountry !== 'VN'` và `plan.retireCountry !== 'VN'`**:
       - Ẩn thẻ `#card-bhxh-income-stream` (BHXH Việt Nam).
    4. **Nếu `plan.maritalStatus === 'single'` và `plan.familyPlan?.kidsCount === 0`**:
       - Tự động thu gọn/tắt mặc định thẻ `#card-children-family-stream`.
    5. Tự động gọi `window.TaxOptimizer.calculateRetireBudgetFromCashflow()` để cập nhật chi tiêu hưu trí, dòng tham chiếu tĩnh và bảng 7 khoản chi tiêu.
- **Biểu thức kiểm thử bằng `./verify_js.sh`**:
  ```zsh
  ./verify_js.sh "Object.keys(window.TaxOptimizer.COUNTRY_PPP_PROFILES).slice(0, 6).map(k => ({ city: k, fromCashflow: window.TaxOptimizer.calculateRetireBudgetFromCashflow({ monthlyNetIncome: 3500, monthlySavings: 1300, monthlyMortgagePaidOff: 0, workCityKey: 'fr_paris', retireCityKey: k, retireMode: 'relocate', isRenterAtRetire: false, householdSize: 1 }).monthlyRetireTotal }))"
  ```

---

### Task 5 — Mở Rộng Đa Ngôn Ngữ (`vi`, `en`, `fr`, `zh`, `de`), Tiền Tệ `CNY` & Cache-Busting (`frontend/js/i18n.js`, `frontend/js/engine.js`, `frontend/index.html`)

- **File cần sửa**:
  1. `frontend/js/i18n.js` (Dòng `13 – 18` và từ điển dòng `21 – 620`).
  2. `frontend/js/engine.js` (Dòng `9 – 47`, hàm `getCurrencySymbol` và `formatCurrency`).
  3. `frontend/index.html` (Dòng `27` và `4598 – 4614`).
- **Tọa độ dòng code dự kiến**:
  - `frontend/js/i18n.js` dòng `13 – 18`: Bổ sung `{ code: 'zh', label: '中文 (简体)', short: 'ZH', flag: '🇨🇳' }` và `{ code: 'de', label: 'Deutsch', short: 'DE', flag: '🇩🇪' }` vào `AVAILABLE_LANGUAGES`, bổ sung khóa dịch cho Popup Hồ sơ `#plan-modal`, công thức tính từ số dư hàng tháng và danh mục quốc gia.
  - `frontend/js/engine.js` dòng `9 – 47`: Hỗ trợ thêm mã tiền tệ `'CNY'` (`¥`) trong `getCurrencySymbol()` và `formatCurrency()`.
  - `frontend/index.html` dòng `27` và `4598 – 4614`: Tăng query version `?v=...` cho `styles.css` và các file script đã sửa.
- **Biểu thức kiểm thử bằng `./verify_js.sh`**:
  ```zsh
  ./verify_js.sh "({ eur: window.RetirementEngine.formatCurrency(1600, 'EUR'), cny: window.RetirementEngine.formatCurrency(12000, 'CNY'), vnd: window.RetirementEngine.formatCurrency(25000000, 'VND') })"
  ```
