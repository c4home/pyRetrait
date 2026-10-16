# Kế Hoạch Nâng Cấp: Đồng Bộ Sức Khỏe – Tài Chính & Chuẩn Hóa Logic Mô Hình

> **Cách thực thi tiết kiệm 80% Token (Theo Giai đoạn 3 - `QUY_TRINH_TOI_UU_TOKEN_ANTIGRAVITY.md`):**
> Kế hoạch này đã định vị sẵn **chính xác từng file, tên hàm và số dòng code** (đã cập nhật theo cấu trúc 6 file UI module mới: `ui-tab1-charts.js`, `ui-tab1-streams.js`, `ui-tab2-health.js`, `ui-tab3-taxes.js`, `ui-modals.js`, `ui.js`, `state.js`) để khắc phục 7 điểm bất hợp lý và bổ sung các biến còn thiếu từ báo cáo [`NGHIEN_CUU_KIEN_TRUC_VA_MO_HINH_PYRETRAIT.md`](file:///Users/canhhung/Documents/pyRetrait/NGHIEN_CUU_KIEN_TRUC_VA_MO_HINH_PYRETRAIT.md).  
> Khi muốn làm bước nào, bạn chỉ cần bấm **New Chat** và gõ đúng 1 câu:  
> 👉 *"Dựa vào file `docs/plans/upgrade_health_finance_model.md`, hãy thực hiện **Task 1**."*

---

## 1. Mục Tiêu & Ràng Buộc Kỹ Thuật
- **Mục tiêu**:
  1. Khớp nối trực tiếp kết quả **Tuổi sinh học (`bioAge`)** và **Tuổi thọ khỏe mạnh (`estimatedHealthspan`)** từ Tab Sức khỏe ([`ui-tab2-health.js`](file:///Users/canhhung/Documents/pyRetrait/frontend/js/ui-tab2-health.js)) vào đối tượng `plan` và lõi tính toán [`engine.js`](file:///Users/canhhung/Documents/pyRetrait/frontend/js/engine.js).
  2. Đồng bộ 100% dòng tiền chi tiết (thuế, con cái, chăm sóc tuổi già, nợ vay, cột mốc, Spending Smile) vào mô phỏng [`monteCarlo.js`](file:///Users/canhhung/Documents/pyRetrait/frontend/js/monteCarlo.js).
  3. Khắc phục lỗi tính trùng lạm phát 2 chặng EUR/VND, lỗi mất tiền rút thừa khi bật chiến lược rút tiền, lỗi đánh thuế 2 lần và lỗi không cộng lãi kép cho các tài khoản Pháp (`frenchAccounts`).
  4. Bổ sung biến **Giới tính (`gender`)** và **Số phần tính thuế gia đình Pháp (`taxParts` - Quotient Familial)**.
- **Ràng buộc**:
  - Giữ nguyên 100% kiến trúc Vanilla JS Client-side, tuân thủ kiến trúc phân tầng 3 lớp (`state.js` -> 6 UI modules).
  - Không dùng cú pháp LaTeX, không dùng icon/emoji trang trí, tuân thủ Dual-Theme CSS Variables.

---

## 2. Danh Sách Công Việc Cuốn Chiếu (5 Tasks Độc Lập)

### [ ] Task 1: Khớp Nối Mô Hình Sức Khỏe (`ui-tab2-health.js` & `state.js`) Vào Kế Hoạch & Dòng Tiền (`engine.js`)
- **Vấn đề giải quyết**: Hiện tại `updateBioAge()` và `updateHealthspanScore()` chỉ hiển thị trên giao diện mà không lưu vào `plan` và không truyền sang `engine.js`.
- **Các vị trí cần sửa**:
  1. [`frontend/js/ui-tab2-health.js` (Dòng 89–151 và 152–291)](file:///Users/canhhung/Documents/pyRetrait/frontend/js/ui-tab2-health.js#L89-L291) — Hàm `updateBioAge()` và `updateHealthspanScore()`:
     - Lưu các lựa chọn chỉ số sinh học (`rhr`, `bp`, `whtr`, `strength`), 5 thói quen (`habits`) cùng kết quả `{ estimatedBioAge, estimatedHealthspan }` vào `plan.healthProfile`.
     - Gọi `window.AppState.debouncedSavePlansToStorage()` (tại [`frontend/js/state.js` dòng 137–140](file:///Users/canhhung/Documents/pyRetrait/frontend/js/state.js#L137-L140)) khi người dùng thay đổi chỉ số sức khỏe.
  2. [`frontend/js/engine.js` (Dòng 698–725 và 1115–1125)](file:///Users/canhhung/Documents/pyRetrait/frontend/js/engine.js#L698-L725) — Trong hàm `runProjection()`:
     - Nếu `plan.healthProfile?.estimatedHealthspan` tồn tại:
       - Cho phép tự động gợi ý/điều chỉnh mốc kết thúc giai đoạn `Slow-Go` và tuổi kích hoạt `Quỹ chăm sóc tuổi già (seniorCareAge)` khớp với `estimatedHealthspan` nếu người dùng chưa khóa cứng.
     - Trả về thêm chỉ số `healthyRetirementYears = Math.max(0, estimatedHealthspan - retireAge)` (Số năm nghỉ hưu khỏe mạnh tự lập) trong kết quả của `runProjection()`.
  3. [`frontend/index.html` (Dòng 148–168)](file:///Users/canhhung/Documents/pyRetrait/frontend/index.html#L148-L168) & [`frontend/js/ui.js` (Dòng 533–718)](file:///Users/canhhung/Documents/pyRetrait/frontend/js/ui.js#L533-L718):
     - Hiển thị thêm dòng **"Số năm nghỉ hưu khỏe mạnh"** ngay tại thẻ `Mục tiêu Độc lập` trên thanh Sidebar trong hàm `updateAll()` để người dùng thấy rõ mối liên hệ giữa Tuổi nghỉ hưu và Sức khỏe.

---

### [ ] Task 2: Chuẩn Hóa Logic Rút Tiền, Lạm Phát 2 Chặng & Tăng Trưởng Tài Khoản Pháp (`engine.js`)
- **Vấn đề giải quyết**:
  1. Lỗi mất tiền thừa khi `withdrawalAmount > deficit` (rút nhiều hơn chi tiêu nhưng phần dư không được giữ lại).
  2. Lỗi lấy lạm phát VND (4.0%) nhân trực tiếp vào đồng EUR rồi lại nhân thêm trượt giá tỷ giá (+1.2%/năm).
  3. Lỗi số dư `frenchAccounts` (`PEA`, `Assurance-Vie`, `Livret A`) đứng yên không sinh lời suốt thời gian tích lũy.
- **Các vị trí cần sửa**:
  1. [`frontend/js/engine.js` (Dòng 644–655)](file:///Users/canhhung/Documents/pyRetrait/frontend/js/engine.js#L644-L655):
     - Khi đơn vị gốc của kế hoạch là `EUR` và bật `dualInflation` với `eurVndAnnualDrift > 0`: Tốc độ tăng chi phí tính theo đồng `EUR` tại Việt Nam được tính bằng `max(0, inflationPost - eurVndAnnualDrift)` (theo ngang giá sức mua PPP, tránh tính trùng lạm phát), hoặc nếu giữ nguyên `inflationPre` cho đồng EUR thì chỉ dùng `inflationPost` khi quy đổi sang tiền đồng VND.
  2. [`frontend/js/engine.js` (Dòng 870–875 và 915–940)](file:///Users/canhhung/Documents/pyRetrait/frontend/js/engine.js#L870-L875):
     - Trong giai đoạn tích lũy (`!isRetired`) và đầu mỗi năm nghỉ hưu: Cho các số dư trong `frenchAccs` (`peaBalance`, `assuranceVieBalance`, `livretABalance`) tăng trưởng theo tỷ suất sinh lời tương ứng trước khi thực hiện rút vốn.
     - Khi `withdrawalAmount > deficit`: Phần tiền rút ra khỏi danh mục để phục vụ chi tiêu thiếu hụt chỉ là `deficit` (hoặc nếu rút theo `withdrawalAmount` của chiến lược thì chi tiêu khả dụng năm đó tăng lên tương ứng nhưng không vượt quá nhu cầu thực tế nếu người dùng chọn chế độ tái đầu tư thặng dư).

---

### [ ] Task 3: Đồng Bộ 100% Dòng Tiền Giữa `monteCarlo.js` Và `engine.js`
- **Vấn đề giải quyết**: `monteCarlo.js` hiện đang bỏ qua chi phí nuôi con (`familyPlan`), chăm sóc tuổi già (`seniorCareMonthly`), các khoản nợ vay (`expenses`), cột mốc mua nhà (`milestones`), thuế thu nhập và `Spending Smile`.
- **Các vị trí cần sửa**:
  1. [`frontend/js/monteCarlo.js` (Dòng 31–130)](file:///Users/canhhung/Documents/pyRetrait/frontend/js/monteCarlo.js#L31-L130) — Hàm `runSimulation()`:
     - Thay vì tự viết vòng lặp thu – chi sơ sài, hãy trích xuất mảng dòng tiền ròng cơ sở từng năm (`netSavingsOrDeficitByAge`, đã bao gồm thuế, con cái, nợ vay, cột mốc, Spending Smile, chăm sóc tuổi già) từ 1 lần chạy `window.RetirementEngine.runProjection(plan, null, true, true)`.
     - Trong 1,000 vòng lặp Monte Carlo, áp dụng tỷ suất sinh lời ngẫu nhiên `r = randomNormal(meanReturn, sigma)` lên dòng tiền chuẩn của từng năm đó (kèm quy tắc cắt giảm 10% chi tiêu của Guyton-Klinger khi `r < -0.05`).
     - **Ưu điểm kép**: Vừa chính xác tuyệt đối 100% với `engine.js`, vừa chạy cực nhanh (< 5ms cho 1,000 kịch bản).

---

### [ ] Task 4: Bổ Sung Biến Giới Tính (`gender`), Số Phần Thuế Pháp (`Quotient Familial`) & Cờ Thuế (`taxable`)
- **Vấn đề giải quyết**:
  1. Chưa kiểm tra cờ `stream.taxable` (khiến lương đã trừ thuế hoặc quà tặng bị đánh thuế lần nữa).
  2. Thuế Pháp chưa chia cho số phần hộ gia đình (`parts fiscales`: Độc thân = 1, Vợ chồng = 2, 2 con đầu mỗi con +0.5, từ con thứ 3 mỗi con +1.0).
  3. BHXH Việt Nam chưa phân biệt Nam (40% ở 15 năm) và Nữ (45% ở 15 năm).
- **Các vị trí cần sửa**:
  1. [`frontend/js/taxOptimizer.js` (Dòng 37–78 và 83–221)](file:///Users/canhhung/Documents/pyRetrait/frontend/js/taxOptimizer.js#L37-L78):
     - Nhận thêm tham số `taxParts` (mặc định tính tự động từ `maritalStatus` + số con phụ thuộc trong `familyPlan`).
     - Áp dụng đúng công thức thuế Pháp: Tính thuế trên `netTaxableEur / taxParts`, sau đó nhân kết quả với `taxParts` (kèm trần giảm thuế `Plafonnement du quotient familial` 1,759 € cho mỗi 0.5 part tăng thêm).
  2. [`frontend/js/engine.js` (Dòng 656–690 và 830–840)](file:///Users/canhhung/Documents/pyRetrait/frontend/js/engine.js#L656-L690):
     - Tách riêng `taxableAnnualIncome` (chỉ cộng các nguồn thu có `stream.taxable !== false`) để truyền vào `calculateProgressiveTax`.
  3. [`frontend/js/ui-tab3-taxes.js` (Dòng 592–774)](file:///Users/canhhung/Documents/pyRetrait/frontend/js/ui-tab3-taxes.js#L592-L774):
     - Cập nhật công thức BHXH tự nguyện Việt Nam theo biến `plan.gender` (Nữ 15 năm hưởng 45%, Nam 15 năm hưởng 40% cho mốc 15 năm đầu).

---

### [ ] Task 5: Tinh Chỉnh Mô Hình Khấu Hao & Bảo Trì Căn Hộ Chung Cư Pháp (`engine.js` & `patrimoine.js`)
- **Vấn đề giải quyết**: Căn hộ chung cư tại Pháp đang bị mặc định mất 90% giá trị xác nhà sau 30 năm (làm mất 56% giá danh nghĩa), chưa phản ánh việc tòa nhà tại Pháp có quỹ bảo trì định kỳ (`Charges de copropriété` & `Fonds de travaux`).
- **Các vị trí cần sửa**:
  1. [`frontend/js/engine.js` (Dòng 124–150)](file:///Users/canhhung/Documents/pyRetrait/frontend/js/engine.js#L124-L150) & [`frontend/js/patrimoine.js` (Dòng 685–701)](file:///Users/canhhung/Documents/pyRetrait/frontend/js/patrimoine.js#L685-L701):
     - Điều chỉnh mô hình khấu hao chung cư hợp lý hơn: Phần đất (25%–30% giá trị) tăng trưởng theo thị trường (+2.0%/năm); phần xác nhà nếu có đóng phí bảo trì (`annual_maintenance > 0` và `annual_coop > 0`) thì hao mòn vật lý ròng chỉ ở mức nhẹ (sàn bảo toàn 50%–60% sau 30 năm thay vì tụt về 10%), giúp giá trị căn hộ phản ánh đúng thực tế thị trường Pháp.
