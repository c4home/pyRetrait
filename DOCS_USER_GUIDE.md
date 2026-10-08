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
- **Bảng Thống kê Chi tiết Từng Năm**: Bấm *Mở rộng Bảng* để xem chi tiết từng dòng số liệu của 60 năm.

### Tab 2: Chiến lược Rút tiền (`tab-withdrawals`)
- Lựa chọn 1 trong 4 chiến lược: **Bengen 4%**, **Lan can Guyton-Klinger**, **VPW**, hoặc **Cố định**.
- Bảng so sánh chỉ rõ số tiền rút năm đầu, mức sụt giảm tối đa (drawdown) và độ bền danh mục của từng phương án.

### Tab 3: Tối ưu Thuế (`tab-taxes`)
- Khám phá cơ chế tối ưu thuế lũy tiến Pháp (IR 2024), tài khoản PEA, và chiến lược Roth Conversion Ladder.

### Tab 4: Monte Carlo & Rủi ro (`tab-insights`)
- Chạy 1,000 kịch bản thị trường mô phỏng rủi ro Sequence of Returns Risk.
- Biểu đồ quạt hiển thị xác suất thành công và các phân vị tài sản xấu nhất (P10) tới tốt nhất (P90).

### Tab 5: Kịch bản What-If (`tab-scenarios`)
- Thử nghiệm độ bền tài chính trước 4 biến cố lớn:
  1. *Khủng hoảng sụp đổ thị trường sớm (-35%)*
  2. *Lạm phát phi mã (+30% chi phí)*
  3. *Cú sốc y tế ở tuổi 65*
  4. *Thu gọn bán bớt BĐS ở tuổi 60*

### Tab 6: Thừa kế & Chi tiêu Smile (`tab-estate`)
- Bật/tắt mô hình chi tiêu thực tế **Spending Smile** (Go-Go, Slow-Go, No-Go).
- Đặt mục tiêu tài sản thừa kế để lại cho con cháu và xem thanh tiến độ hoàn thành.
- **Kỹ thuật Chuyển nhượng Di sản (Démembrement / Nue-propriété)**: Xem hướng dẫn tối ưu hạn mức miễn thuế 100.000 €/bố mẹ/con mỗi 15 năm và định giá theo Điều 669 CGI.

### Tab 7: Quản Lý Tài Sản (`tab-patrimoine`)
- **Dashboard Tổng Quan Tài Sản Pháp**:
  - `Tổng giá trị BĐS Pháp`: Theo dõi tổng giá trị các bất động sản sở hữu (ví dụ 214,000 € ≈ 5.88 Tỷ ₫).
  - `Dư nợ vay ngân hàng`: Theo dõi số nợ thế chấp còn lại (ví dụ 220,618 €).
  - `Dòng tiền hiện tại (Đang vay)`: Dòng tiền ròng thực tế hàng tháng sau khi trừ tiền trả góp ngân hàng, thuế địa phương và chi phí quản lý (-258 €/tháng - bù nhẹ trong thời gian trả nợ).
  - `Dòng tiền BĐS (Hết nợ)`: Dòng tiền thụ động thuần túy bùng nổ sau khi trả hết nợ (**+1,014 €/tháng** ≈ 27.9 Triệu ₫/tháng).
  - `Lợi nhuận đội xe Turo`: Doanh thu và lợi nhuận ròng từ đội xe cho thuê (+234 €/tháng).
  - `Dòng tiền thụ động hưu trí`: Tổng tiền tạo ra hàng tháng sau tuổi 50 (**+1,248 €/tháng** ≈ 34.3 Triệu ₫/tháng - bao phủ sinh hoạt an nhàn tại Việt Nam!).
- **🎯 Biểu Đồ & Điểm Hòa Vốn Từng Căn Hộ (Break-Even Trajectory)**:
  - Chọn từng căn hộ hoặc **So sánh tất cả căn hộ** để xem đường cong thu hồi vốn.
  - **📅 Năm bắt đầu mua**: Đặt mốc thời gian mua nhà để tính toán tiến trình trả nợ gốc chuẩn xác theo từng năm.
  - **🎯 Hòa vốn tài sản ròng (Equity Break-Even)**: Thời điểm `Giá trị nhà - Nợ vay` vượt qua 100% vốn tự có bỏ ra ban đầu (thường sau 3 - 7 năm).
  - **💵 Hòa vốn dòng tiền mặt (Cash-on-Cash Break-Even)**: Thời điểm lũy kế tiền thuê ròng thu về bù đắp toàn bộ số tiền tự bỏ ra.
  - **🏆 Tất toán sạch nợ (Debt Payoff)**: Năm nợ ngân hàng về 0 €, dòng tiền thụ động bùng nổ đạt đỉnh.
- **Quản Lý Danh Mục Căn Hộ Thực Tế**:
  - Nhấp nút **➕ Thêm Căn Hộ** (nằm ngay cạnh tiêu đề *Danh Mục Căn Hộ Cho Thuê*) để mở modal thiết lập:
    - **Phí công chứng tự động (Frais de Notaire 7.5%)**: Tự động tính vào tổng chi phí đầu tư và số tiền vay thế chấp.
    - **Tỷ lệ phòng trống (Vacance Locative %)**: Mặc định 5% (khoảng 2.5 tuần trống/năm), cho phép người dùng tùy biến sát thực tế thị trường.
    - **Thuế đất Taxe Foncière & Phí quản lý**: Tích hợp đầy đủ vào chi phí vận hành.
    - **⚡ Live Net Cash Flow**: Khung hiển thị màu xanh/hổ phách tính toán ngay dòng tiền ròng thực tế hàng tháng theo thời gian thực mỗi khi bạn thay đổi bất kỳ ô nhập liệu nào!
  - Xem từng thẻ căn hộ với huy hiệu hiển thị mốc thời gian: `📅 Mua: 2022 ➔ Tất toán: 2042`.
- **⚡ Tự Động Đồng Bộ Vào Kế Hoạch FIRE (Auto-Sync)**:
  - Hệ thống **tự động 100%** chuyển đổi và cập nhật toàn bộ dòng tiền bất động sản & xe Turo vào luồng thu nhập của kế hoạch FIRE mỗi khi bạn thêm, sửa hoặc xóa căn hộ — bạn không cần phải bấm nút đồng bộ thủ công.

---

## 6. Các Tính Năng Hiện Thực Hóa & Franco-Viet Chuyên Sâu

### 6.1. Lựa Chọn Địa Điểm Hưu Trí & Sức Mua PPP (Purchasing Power Parity)
Tại bảng điều khiển bên trái, bạn có thể lựa chọn 1 trong 3 kịch bản địa điểm:
1. **🇫🇷 100% Pháp**: Áp dụng 100% mức chi phí sống chuẩn Euro.
2. **✈️ Song hành (6 tháng Pháp / 6 tháng Việt Nam)**: Chi phí sinh hoạt tự động giảm 30% (hệ số 0.70).
3. **🇻🇳 100% Việt Nam (Hồi hương toàn phần)**: Sức mua tại Việt Nam giúp **tiết kiệm tới 55% chi phí sống** (hệ số 0.45), đồng thời tự động cộng thêm chi phí bảo hiểm quốc tế CFE (1,800 €/năm).

### 6.2. Cấu Hình Hưu Trí Pháp & Phạt Décote (Réforme 2023)
Nhấp vào thanh mở rộng **🇫🇷 Lương Hưu Pháp & Phạt Décote** ở sidebar:
- Nhập `Tuổi bắt đầu đi làm` (ví dụ 24 tuổi) và `Tuổi nhận lương hưu Pháp` (ví dụ 64 hoặc 67 tuổi).
- Hệ thống tự động tính toán:
  - Số năm và số quý đã đóng bảo hiểm (Trimestres).
  - So sánh với chuẩn 172 quý (43 năm) theo luật mới.
  - Tỷ lệ giảm trừ (Décote -1.25%/quý thiếu, tối đa -25%) nếu nhận hưu trước 67 tuổi.
  - **Mẹo tối ưu**: Nhận hưu từ mốc 67 tuổi sẽ kích hoạt cơ chế **Taux Plein Tự Động**, xóa bỏ hoàn toàn phạt phần trăm dù bạn chỉ đóng một số năm tại Pháp!

### 6.3. Quỹ Chăm Sóc Tuổi Già (Senior Care / Dépendance từ 78t)
- Nhập ngân sách dự trù hàng tháng (ví dụ 1,500 €/tháng) trong thanh mở rộng bên trái.
- Mô hình sẽ tự động cộng khoản chi này vào chi phí sinh hoạt từ tuổi 78 trở đi, kiểm tra xem danh mục có đủ sức chống đỡ chi phí điều dưỡng hay viện dưỡng lão cao cấp mà không làm thâm hụt di sản để lại cho con cái.

### 6.4. Cẩm Nang Sức Khỏe & Lương Hưu Song Tịch (Franco-Viet Guide)
Nằm ngay dưới biểu đồ dòng tiền ở Tab 1, thẻ cẩm nang cung cấp 2 chuyên đề cốt lõi:
- **Tab 1: Khám Sức Khỏe Định Kỳ & Y Tế Dự Phòng (Pháp vs Việt Nam)**:
  - Chi tiết chương trình mới `Mon Bilan Prévention` (18-25t, 45-50t, 60-65t, 70-75t) miễn phí 100% tại Pháp.
  - Khám tổng quát dự phòng `EPS CPAM` mỗi 5 năm qua cổng Ameli.fr.
  - Gói khám bệnh viện quốc tế (Vinmec, FV, Hoàn Mỹ) và công lập tuyến 1 tại Việt Nam.
  - Giải pháp thẻ CFE + Mutuelle quốc tế để hưởng dịch vụ **Bảo lãnh viện phí trực tiếp (Tiers Payant)**.
- **Tab 2: Lương Hưu Kép & BHXH Tự Nguyện Việt Nam**:
  - Hướng dẫn Luật BHXH 2024 (hiệu lực 01/07/2025) hạ mốc đóng tối thiểu xuống **15 năm**.
  - Cơ chế đóng một lần cho các năm còn thiếu (đóng vét) khi đủ tuổi nghỉ hưu.
  - Đặc quyền thẻ BHYT thanh toán 95% chi phí y tế trọn đời.
  - **Công cụ Tính thử BHXH Tự nguyện Live Calculator**: Cho phép bạn nhập mức thu nhập lựa chọn (ví dụ 10.000.000 ₫/tháng) và xem ngay:
    - Tiền đóng 22%: 2.200.000 ₫/tháng (~80 €)
    - Lương hưu nhận về: ~4.500.000 ₫/tháng (~164 €)
    - Thời gian hoàn vốn gốc: **7.3 năm!**

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

