# Sổ Tay Hướng Dẫn Sử Dụng pyRetrait (User Guide)

Chào mừng bạn đến với **pyRetrait** — công cụ hoạch định độc lập tài chính và nghỉ hưu sớm cá nhân hóa cao cấp. Sổ tay này sẽ hướng dẫn bạn từng bước làm chủ mọi tính năng của hệ thống.

---

## 1. Khởi Chạy Ứng Dụng

Mở Terminal trên máy tính và chạy lệnh:

```bash
cd /Users/canhhung/Documents/pyRetrait
python3 run.py
```

Mở trình duyệt web và truy cập địa chỉ: **[http://localhost:8000](http://localhost:8000)** (hoặc `http://127.0.0.1:8000`).

---

## 2. Quản Lý Kế Hoạch Hưu Trí (Plans)

Ở thanh điều hướng trên cùng:
- **Chọn Kế hoạch**: Nhấp vào menu thả xuống để chọn giữa các kế hoạch có sẵn (ví dụ: *🇫🇷 ➔ 🇻🇳 Kế hoạch Franco-Viet FIRE*, *Kế hoạch Tiêu chuẩn*, *Lean FIRE*).
- **+ Mới**: Tạo một kế hoạch trắng hoàn toàn với các thông số riêng của bạn.
- **Nhân bản**: Sao chép nguyên trạng kế hoạch hiện tại để thử nghiệm phương án mới mà không làm mất phương án cũ.
- **Xóa**: Xóa kế hoạch không còn sử dụng.
- **Đơn vị tiền tệ**: Nhấp vào các nút **`€`**, **`₫`**, **`$`** để chuyển đổi toàn bộ đơn vị tiền tệ trên toàn giao diện theo tỷ giá thời gian thực.
- **Chế độ Sáng / Tối**: Nhấp biểu tượng 🌙 / ☀️ ở góc phải để đổi giao diện Dark/Light mode theo sở thích.

### 2.1. Tài Khoản pyRetrait Cloud & Bảo Mật Cá Nhân
Ở góc trên bên phải thanh điều hướng có nút **Đăng Nhập / Tạo Tài Khoản**:
- **Chế độ Khách (Guest Mode)**: Dữ liệu được lưu trữ trực tiếp trên bộ nhớ trình duyệt (`localStorage`) của máy tính. Phù hợp khi bạn muốn dùng thử nhanh mà không cần tạo tài khoản.
- **Chế độ Đám Mây (Cloud Account)**:
  - Cho phép đăng ký bằng Email và Mật khẩu (mã hóa chuẩn công nghiệp PBKDF2/SHA-256 + salt).
  - Tự động đồng bộ toàn bộ các kế hoạch của bạn lên cơ sở dữ liệu máy chủ SQLite độc lập.
  - Khi đăng nhập trên máy tính khác, điện thoại hoặc trình duyệt khác, bạn luôn truy cập được đầy đủ dữ liệu mới nhất của mình.
  - **Tự động chuyển tiếp (Migration)**: Khi bạn đang tạo kế hoạch ở chế độ Khách và bấm "Tạo Tài Khoản", hệ thống sẽ tự động đưa các kế hoạch hiện có lên tài khoản mới lập, bạn không lo bị mất dữ liệu.

---

## 3. Thiết Lập Thông Số Cơ Bản & Tích Lũy Hàng Năm

Ở cột bên trái (bảng điều khiển tham số):

1. **Tuổi tác & Lạm phát**:
   - `Tuổi hiện tại`: Ví dụ 29 tuổi.
   - `Tuổi nghỉ hưu`: Ví dụ 42 tuổi (thời điểm bạn dừng đi làm toàn thời gian).
   - `Kỳ vọng tuổi thọ`: Ví dụ 85 tuổi.
   - `Lạm phát bình quân`: Thường đặt 2.0% – 2.5% cho Euro/USD hoặc 3.5% – 4.0% cho VND.
2. **Tài sản đầu tư hiện có**:
   - Nhập tổng số tiền bạn đang có trong các tài khoản đầu tư (chứng khoán, PEA, quỹ mở, tiền gửi, vàng...).
3. **Phân bổ Tỷ lệ Tiết kiệm từ Thu nhập**:
   - Bạn có thể nhấp vào các nút tỷ lệ nhanh:
     - **`1/4 (25%)`**: Dành cho giai đoạn chi tiêu nhiều.
     - **`1/3 (33%)`**: **Mức chuẩn mực cân đối** — Chi tiêu 2/3 và tiết kiệm đầu tư 1/3 thu nhập.
     - **`1/2 (50%)`**: Tích lũy nhanh (Chuyên gia công nghệ / thu nhập cao).
     - **`2/3 (67%)`**: Extreme FIRE — Tiết kiệm tối đa để tự do tài chính thần tốc.
   - Hoặc kéo thanh trượt đến bất kỳ phần trăm nào bạn muốn.
   - Các ô `Chi tiêu/năm (hiện tại)` và `Tiết kiệm/năm (hiện tại)` sẽ tự động nhảy số tiền tương ứng.
4. **Chi tiêu/năm khi về hưu**:
   - Số tiền bạn dự trù sinh hoạt trong một năm khi đã về hưu (ví dụ 10,000 €/năm ≈ 275 triệu ₫/năm tại Việt Nam).
5. **Tỷ suất sinh lời kỳ vọng**:
   - `Lợi nhuận tích lũy`: Tỷ suất sinh lời danh mục cổ phiếu trước nghỉ hưu (ví dụ 8% - 10%/năm).
   - `Lợi nhuận hưu trí`: Tỷ suất sinh lời danh mục phòng thủ sau nghỉ hưu (ví dụ 7% - 8%/năm).

---

## 4. Quản Lý Đa Luồng Thu Nhập (Multiple Streams)

Hệ thống cho phép bạn mô phỏng nhiều nguồn thu khác nhau có thời hạn bắt đầu và kết thúc riêng biệt:
- **Thêm nguồn thu**: Bấm vào nút **`+ Thêm nguồn thu`**.
- Điền các thông tin:
  - Tên nguồn thu (ví dụ: *Lương IT tại Pháp*, *Làm thêm Freelance*, *Cổ tức chứng khoán*, *Tiền thuê nhà*).
  - Số tiền hàng năm.
  - Tuổi bắt đầu và Tuổi kết thúc.
  - Tốc độ tăng trưởng thu nhập (%/năm, ví dụ lương tăng 3.5%/năm).
- **Chỉnh sửa / Xóa**: Nhấp biểu tượng ✏️ để sửa hoặc 🗑️ để xóa luồng thu nhập.
- **Tự động liên thông**: Mỗi khi bạn sửa thu nhập (ví dụ từ 25k€ lên 80k€), hệ thống sẽ **tự động phân bổ lại số tiền tiết kiệm (1/3) và chi tiêu (2/3)**, đồng thời vẽ lại ngay biểu đồ Tài sản Ròng!

---

## 4.1. Quản Lý Cột Mốc Cuộc Đời (Life Milestones Ribbon)

Nằm ngay phía trên biểu đồ Tài sản Ròng (Net Worth Trajectory) là **Dải Ruy Băng Cột Mốc (Life Milestones Ribbon)**:
- **Hiển thị trực quan**: Các mốc quan trọng được gắn cờ (chip) theo thứ tự độ tuổi kèm số tiền tác động (ví dụ: `🏡 35t Mua nhà -50,000 €`, `👶 33t Sinh con`, `💰 50t Thừa kế +100,000 €`).
- **Nút "⚙️ Quản lý Mốc"**: Nhấp nút này để mở hộp thoại quản lý toàn diện:
  - **Cột mốc Cốt lõi**: Tự động tính toán từ kế hoạch (Bắt đầu đi làm, Tuổi đạt FIRE, Tuổi hưởng hưu Pháp/Việt, Tuổi thọ).
  - **Sự kiện Tùy chỉnh (+ Thêm Sự Kiện Mới)**: Cho phép tạo sự kiện bất kỳ (Mua nhà, Sinh con, Quỹ đại học, Mua xe, Kết hôn, Du lịch, Nghỉ ngơi, Thừa kế, Y tế...).
  - **Tác động tài chính linh hoạt**:
    1. *Khoản chi một lần (expense)*: Rút vốn trực tiếp từ danh mục đầu tư tại độ tuổi xảy ra sự kiện.
    2. *Khoản thu đột xuất (income)*: Bơm một khoản tiền mặt lớn vào danh mục đầu tư (thừa kế, thanh lý tài sản).
    3. *Mốc kỷ niệm (none)*: Đánh dấu mốc cuộc sống mà không làm biến động số dư tài sản.
- **Thao tác nhanh tiện ích**:
  - **Nhấp vào chip sự kiện**: Biểu đồ tự động đánh dấu và hiển thị tooltip giá trị tài sản ròng tại năm tuổi đó.
  - **Nhấp đúp chuột (Double click) vào chip**: Mở ngay modal chỉnh sửa thông số của sự kiện đó.
  - **Đóng nhanh modal**: Nhấn phím **Escape** hoặc nhấp chuột vào vùng nền đen mờ bên ngoài. Form chỉnh sửa có các nút **💾 Lưu Sự Kiện** và **✕ Hủy form** lớn, rõ ràng và tự động cuộn vào giữa tầm nhìn.

---

## 5. Khám Phá Các Tab Chức Năng Chuyên Sâu

### Tab 1: Dòng tiền & Tài sản (`tab-projections`)
- Xem biểu đồ đường cong tăng trưởng **Tài sản Ròng (Net Worth)** từ hiện tại đến cuối đời.
- Có thể chuyển đổi qua lại giữa **Giá trị Tương lai (Nominal)** và **Sức mua Hiện tại (Real)** đã khấu trừ lạm phát.
- Biểu đồ **Cân đối Dòng tiền Hàng năm (Cash-Flow Projections)**: Xem cột thu nhập (xanh) và cột chi tiêu (đỏ) qua từng năm.
- **Công tắc Bật/Tắt So sánh 4 Chiến lược Rút tiền trên Biểu đồ Tài sản Ròng**:
  - Nhấp vào nút `So sánh 4 Chiến lược` trên thanh tiêu đề biểu đồ Net Worth để kích hoạt hiển thị 4 nhánh phân kỳ từ tuổi nghỉ hưu:
    1. **Quy tắc 4% Cố định (Bengen)**: Nét xanh dương.
    2. **Lan can Guyton-Klinger (Khuyên dùng)**: Nét xanh ngọc lục bảo (đậm nếu đang chọn).
    3. **Tỷ lệ Thay đổi (VPW)**: Nét tím violet.
    4. **Tỷ lệ Cố định (Fixed %)**: Nét cam hổ phách.
- **Thẻ Cấu hình Chiến Lược Rút Tiền & Tỷ Lệ SWR**: Nằm ngay trong cột điều khiển bên trái của Tab 1:
  - Cho phép chọn nhanh 1 trong 4 chiến lược kèm thanh trượt điều chỉnh **Tỷ lệ Rút tiền Khởi điểm (SWR %)** từ 2.5% đến 6.0%.
  - Tích hợp số dư tuổi 85 và tỷ lệ sống sót tự động cập nhật thời gian thực.
- **Mô hình Chi tiêu Thực tế 3 Giai đoạn (Spending Smile)**: Tích hợp trực tiếp bên trong thẻ *Dòng Chi Tiêu Hàng Tháng Khi Về Hưu*, cho phép thiết lập linh hoạt 3 giai đoạn:
  - *Go-Go (Nghỉ hưu đến 60 tuổi)*: Hệ số 1.15x (+15% du lịch, trải nghiệm).
  - *Slow-Go (60 – 75 tuổi)*: Hệ số 0.90x (-10% sinh hoạt tại gia thanh bình).
  - *No-Go (sau 75 tuổi)*: Hệ số 0.80x (-20% chi tiêu sinh hoạt tối giản, chuyển ngân sách sang y tế).
- **Mô hình Lương Hưu VN (BHXH Tự Nguyện)**: Tích hợp trực tiếp trong danh mục thu nhập hàng năm, tính toán tiền đóng 22% và lương hưu nhận về trọn đời theo chuẩn Luật BHXH 2024 (mốc 15 năm).
- **Bảng Thống kê Chi tiết Từng Năm**: Bấm *Mở rộng Bảng* để xem chi tiết từng dòng số liệu của 60 năm.

### Tab 2: Monte Carlo & Rủi ro (`tab-insights`)
- Mô phỏng xác suất sống sót với 1.000 kịch bản thị trường ngẫu nhiên (Mulberry32 PRNG seed 42).
- Biểu đồ quạt phân vị P10 (xấu nhất), P50 (trung vị), P90 (thuận lợi nhất).
- Phân tích rủi ro thứ tự sinh lời (Sequence of Returns Risk - SRR) và rủi ro cạn vốn sớm.

### Tab 3: Kịch bản What-If (`tab-scenarios`)
- Thử nghiệm độ bền vững của danh mục trước các cú sốc: Khủng hoảng thị trường sớm (-35%), Lạm phát phi mã, Cú sốc chi phí y tế tuổi 65, Thu gọn BĐS tuổi 60.

### Tab 4: Gia Đình, Sức Khỏe & Di Sản (`tab-estate`)
- **Hoạch định Con cái & Học vấn Đại học**:
  - Nhập năm sinh các con để hệ thống tự động xác định độ tuổi qua từng năm mô phỏng.
  - Tự động cộng trợ cấp gia đình Pháp (CAF) và trừ chi phí đỉnh điểm khi con học Đại học (18–23 tuổi).
  - Cơ chế **Tự tài trợ học vấn bằng BĐS**: Dòng tiền BĐS tất toán nợ tự động nuôi con học Đại học.
- **Biểu Đồ Dòng Tiền Nuôi Con & BĐS (`chart-family-cashflow`)**: Hiển thị trực quan mối tương quan giữa chi phí nuôi con, đỉnh học phí Đại học và dòng tiền BĐS bù đắp.
- **Kế Hoạch Thừa Kế & Đánh Giá Mục Tiêu Di Sản (`card-estate-legacy-combined`)**:
  - Thiết lập mục tiêu tài sản để lại cho thế hệ sau / từ thiện và theo dõi thanh tiến độ tích lũy thực tế.
  - Hướng dẫn 4 chiến lược chuyển giao tối ưu thuế:
    - *Tách quyền (Démembrement / Nue-propriété)*: Cho tặng quyền sở hữu trần theo Điều 669 CGI (định giá 50% ở tuổi 51–60 hoặc 60% ở tuổi 61–70), giữ quyền hưởng dụng (Usufruit) nhận tiền thuê nhà; con nhận toàn quyền sở hữu 100% miễn thuế khi bố mẹ qua đời.
    - *Hạn mức miễn thuế cho tặng định kỳ*: 100.000 €/con/bố mẹ mỗi chu kỳ 15 năm (Điều 779 CGI).
    - *Bảo hiểm nhân thọ Pháp (Assurance-Vie)*: Miễn thuế thừa kế đến 152.500 €/người thụ hưởng (Điều 990 I CGI).
    - *Di chúc & Thừa kế Quốc tế Pháp – Việt*: Tận dụng Luật EU 650/2012 chọn luật quốc tịch áp dụng cho toàn bộ khối tài sản song tịch.
- **Cẩm Nang Y Tế Dự Phòng & Sức Khỏe Song Tịch**:
  - Quyền lợi y tế miễn phí tại Pháp: *Mon Bilan Prévention* (18–25t, 45–50t, 60–65t, 70–75t) miễn phí 100% và khám tổng quát *EPS CPAM* mỗi 5 năm.
  - Tầm soát chất lượng cao tại Việt Nam kết hợp thẻ CFE + Mutuelle quốc tế bảo lãnh viện phí trực tiếp (Tiers Payant).

### Tab 5: Tối Ưu Thuế (`tab-taxes`)
- Nằm ngay sau nhóm Gia đình & Di sản, cung cấp cơ chế tối ưu thuế chuyên sâu:
  - Phân tích bậc thuế thu nhập lũy tiến Pháp (IR 2024) và giảm trừ 10% chi phí chuyên nghiệp.
- Nằm ngay sau nhóm Gia đình & Di sản, cung cấp cơ chế tối ưu thuế chuyên sâu:
  - Phân tích bậc thuế thu nhập lũy tiến Pháp (IR 2024) và giảm trừ 10% chi phí chuyên nghiệp.
  - Tối ưu danh mục đầu tư qua tài khoản PEA (miễn thuế thu nhập sau 5 năm) và quỹ hưu trí.
  - Chiến lược **Roth Conversion Ladder** lấp đầy bậc thuế thấp trong các năm trũng thu nhập.
  - Tối ưu hóa thu nhập chịu thuế MAGI trước 65 tuổi để nhận trợ cấp y tế **ACA Subsidies**.

### Tab 5: Monte Carlo & Rủi ro (`tab-insights`)
- Chạy 1,000 kịch bản thị trường mô phỏng rủi ro chuỗi lợi nhuận (Sequence of Returns Risk).
- Sử dụng thuật toán sinh số giả ngẫu nhiên xác định **Mulberry32 (Seed 42)** đảm bảo kết quả P10/P50/P90 nhất quán 100% trên mọi trình duyệt.
- Đánh giá xác suất thành công của kế hoạch hưu trí.

### Tab 6: Kịch bản What-If (`tab-scenarios`)
- Thử nghiệm độ bền tài chính trước 4 biến cố lớn:
  1. *Khủng hoảng sụp đổ thị trường sớm (-35%)*
  2. *Lạm phát phi mã (+30% chi phí)*
  3. *Cú sốc y tế ở tuổi 65*
  4. *Thu gọn bán bớt BĐS ở tuổi 60*

---

## 6. Các Tính Năng Hiện Thực Hóa & Franco-Viet Chuyên Sâu

### 6.1. Lựa Chọn Địa Điểm Hưu Trí & Sức Mua PPP (Purchasing Power Parity)
Tại bảng điều khiển bên trái, bạn có thể lựa chọn 1 trong 3 kịch bản địa điểm:
1. **100% Pháp**: Áp dụng 100% mức chi phí sống chuẩn Euro.
2. **Song hành (6 tháng Pháp / 6 tháng Việt Nam)**: Chi phí sinh hoạt tự động giảm 30% (hệ số 0.70).
3. **100% Việt Nam (Hồi hương toàn phần)**: Sức mua tại Việt Nam giúp **tiết kiệm tới 55% chi phí sống** (hệ số 0.45), đồng thời tự động cộng thêm chi phí bảo hiểm quốc tế CFE (1,800 €/năm).

### 6.2. Cấu Hình Hưu Trí Pháp & Phạt Décote (Réforme 2023)
Nhấp vào thanh mở rộng **Lương Hưu Pháp & Phạt Décote** ở sidebar:
- Nhập `Tuổi bắt đầu đi làm` (ví dụ 24 tuổi) và `Tuổi nhận lương hưu Pháp` (ví dụ 64 hoặc 67 tuổi).
- Hệ thống tự động tính toán:
  - Số năm và số quý đã đóng bảo hiểm (Trimestres).
  - So sánh với chuẩn 172 quý (43 năm) theo luật mới.
  - Tỷ lệ giảm trừ (Décote -1.25%/quý thiếu, tối đa -25%) nếu nhận hưu trước 67 tuổi.
  - **Mẹo tối ưu**: Nhận hưu từ mốc 67 tuổi sẽ kích hoạt cơ chế **Taux Plein Tự Động**, xóa bỏ hoàn toàn phạt phần trăm dù bạn chỉ đóng một số năm tại Pháp!

### 6.3. Quỹ Chăm Sóc Tuổi Già (Senior Care / Dépendance từ 78t)
- Nhập ngân sách dự trù hàng tháng (ví dụ 1,500 €/tháng) trong thanh mở rộng bên trái.
- Mô hình sẽ tự động cộng khoản chi này vào chi phí sinh hoạt từ tuổi 78 trở đi, kiểm tra xem danh mục có đủ sức chống đỡ chi phí điều dưỡng hay viện dưỡng lão cao cấp mà không làm thâm hụt di sản để lại cho con cái.

### 6.4. Cẩm Nang Y Tế Dự Phòng Song Tịch & Lương Hưu VN
- **Cẩm nang Y tế Dự phòng (Pháp ⇄ Việt Nam)** (trong Tab Gia đình, Sức khỏe & Di sản):
  - Chi tiết chương trình mới `Mon Bilan Prévention` (18-25t, 45-50t, 60-65t, 70-75t) miễn phí 100% tại Pháp.
  - Khám tổng quát dự phòng `EPS CPAM` mỗi 5 năm qua cổng Ameli.fr.
  - Gói khám bệnh viện quốc tế (Vinmec, FV, Hoàn Mỹ) và công lập tuyến đầu tại Việt Nam.
  - Giải pháp thẻ CFE + Mutuelle quốc tế để hưởng dịch vụ **Bảo lãnh viện phí trực tiếp (Tiers Payant)**.
- **Lương hưu kép & BHXH Tự nguyện Việt Nam**: Được mô hình hóa tài chính trực tiếp trong Cột Thu nhập hàng năm của Tab 1 (Dòng tiền & Tài sản), tính toán chính xác tiền đóng 22% và lương hưu trọn đời theo Luật BHXH 2024.

### 6.5. Kế Hoạch Con Cái & Gia Đình (Family Planning)
- Nhập **Năm sinh** của các con thay vì tuổi cố định để hệ thống tự động đồng bộ tuổi của con theo từng năm chạy mô phỏng.
- Tự động tích hợp trợ cấp Caf, các đợt đỉnh chi phí đại học/thạc sĩ (18 - 23 tuổi), và quà hỗ trợ lập nghiệp/kết hôn (24 - 26 tuổi).
- Biểu đồ **Family Cash Flow Trajectory Chart** giúp bạn nhìn rõ toàn cảnh dòng tiền gia đình.

---

## 7. Trợ Lý Chiến Lược Gemini AI (AI Advisor)

- Tự động đọc dữ liệu tài chính kế hoạch hiện tại (tuổi nghỉ hưu, tài sản, tỷ lệ tiết kiệm, dòng tiền BĐS).
- **Nhận xét chuyên sâu từ Google Gemini AI**: Đánh giá tính khả thi, phân tích rủi ro thị trường (SRR), tính toán tuổi nghỉ hưu tối ưu nhất và đưa ra các ví dụ cụ thể, dễ làm theo (tránh thuật ngữ học thuật phức tạp).
- Có chế độ tự động chuyển sang **Heuristic Fallback** thông minh nếu mất kết nối hoặc hết hạn mức API, đảm bảo luôn luôn có khuyến nghị tài chính hữu ích.

---

## 8. Giao Diện Pinned Sidebar & Trải Nghiệm Người Dùng

- **Thanh điều hướng Pinned Sidebar (Đóng băng)**: Cột menu bên trái luôn đứng yên tại chỗ khi bạn cuộn trang xem nội dung bên phải, giúp bạn chuyển đổi giữa các tab nhanh chóng bất kể trang dài bao nhiêu.
- **Icon lề trái tiết kiệm không gian**: Toàn bộ icon được bố trí bên trái văn bản giúp thanh điều hướng gọn gàng, hiển thị trọn vẹn cả 7 tab và thẻ tóm tắt *Mục tiêu Độc lập* trên mọi độ phân giải.

---

## 9. Xuất Báo Cáo & Sao Lưu Dữ Liệu

Nhấp vào nút xanh **Xuất báo cáo** ở góc trên cùng bên phải:
- **📊 Xuất dữ liệu CSV (Excel)**: Tải về file `.csv` chứa toàn bộ bảng dòng tiền chi tiết từng năm.
- **🖨️ In / Lưu Báo cáo PDF**: Mở giao diện in chuẩn định dạng tài liệu, hỗ trợ lưu thành tệp PDF chất lượng cao.
- **💾 Sao lưu Kế hoạch (JSON)**: Tải tệp dự phòng toàn bộ các kế hoạch của bạn.
- **📂 Khôi phục từ JSON**: Nhập lại dữ liệu kế hoạch từ tệp sao lưu trước đó.

