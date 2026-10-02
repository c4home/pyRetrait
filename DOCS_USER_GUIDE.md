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

## 5. Khám Phá Các Tab Chức Năng Chuyên Sâu

### Tab 1: Dòng tiền & Tài sản (`tab-projections`)
- Xem biểu đồ đường cong tăng trưởng **Tài sản Ròng (Net Worth)** từ hiện tại đến cuối đời.
- Có thể chuyển đổi qua lại giữa **Giá trị Tương lai (Nominal)** và **Sức mua Hiện tại (Real)** đã khấu trừ lạm phát.
- Biểu đồ **Cân đối Dòng tiền Hàng năm (Cash-Flow Projections)**: Xem cột thu nhập (xanh) và cột chi tiêu (đỏ) qua từng năm.
- **Bảng Thống kê Chi tiết Từng Năm**: Bấm *Mở rộng Bảng* để xem chi tiết từng dòng số liệu của 60 năm.

### Tab 2: Chiến lược Rút tiền (`tab-withdrawals`)
- Lựa chọn 1 trong 4 chiến lược: **Bengen 4%**, **Lan can Guyton-Klinger**, **VPW**, hoặc **Cố định**.
- Bảng so sánh chỉ rõ số tiền rút năm đầu, mức sụt giảm tối đa (drawdown) và độ bền danh mục của từng phương án.

### Tab 3: Tối ưu Thuế & Roth (`tab-taxes`)
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

### Tab 7: Gestion de Patrimoine (`tab-patrimoine`)
- **Dashboard Tổng Quan Tài Sản Pháp**:
  - `Tổng giá trị BĐS Pháp`: Theo dõi tổng giá trị các bất động sản sở hữu (ví dụ 293,000 € ≈ 8.06 Tỷ ₫).
  - `Dư nợ vay ngân hàng`: Theo dõi số nợ thế chấp còn lại (ví dụ 304,491 €).
  - `Dòng tiền hiện tại (Đang vay)`: Dòng tiền ròng thực tế hàng tháng sau khi trừ tiền trả góp ngân hàng, thuế địa phương và chi phí quản lý (-369 €/tháng - bù nhẹ trong thời gian trả nợ).
  - `Dòng tiền BĐS (Hết nợ)`: Dòng tiền thụ động thuần túy bùng nổ sau khi trả hết nợ (**+1,401 €/tháng** ≈ 38.5 Triệu ₫/tháng).
  - `Lợi nhuận đội xe Turo`: Doanh thu và lợi nhuận ròng từ đội xe cho thuê (+234 €/tháng).
  - `Dòng tiền thụ động hưu trí`: Tổng tiền tạo ra hàng tháng sau tuổi 50 (**+1,635 €/tháng** ≈ 45.0 Triệu ₫/tháng - thừa sức bao phủ 100% chi phí sống an nhàn tại Việt Nam!).
- **Quản Lý Danh Mục Căn Hộ**:
  - Nhấp nút **➕ Thêm Căn Hộ** để nhập căn hộ mới (tên căn, thành phố, giá mua, tiền vay, lãi suất %, thời hạn vay, tiền thuê tháng, thuế foncière, phí quản lý, chế độ LMNP).
  - Xem từng thẻ căn hộ với tiến độ trả nợ, dòng tiền theo từng năm và nút chỉnh sửa ✏️ / xóa 🗑️.
- **⚡ Đồng Bộ Vào Kế Hoạch FIRE (1-Click Sync)**:
  - Nhấp nút xanh **Đồng Bộ Vào Kế Hoạch FIRE**: Hệ thống sẽ tự động chuyển đổi dòng tiền thuê nhà (giai đoạn đang vay bù lỗ nhẹ và giai đoạn sau khi hết nợ sinh lời lớn) thành các luồng thu nhập chính thức trong kế hoạch FIRE!

---

## 6. Trợ Lý Chiến Lược Gemini AI (AI Advisor)

- Nhấp nút **✨ Gemini AI** màu vàng kim trên thanh menu trên cùng.
- Cửa sổ phân tích thông minh mở ra:
  - Tự động đọc dữ liệu tài chính kế hoạch hiện tại (tuổi nghỉ hưu, tài sản, tỷ lệ tiết kiệm, dòng tiền BĐS).
  - **Nhận xét chuyên sâu từ Google Gemini AI**: Đánh giá tính khả thi, phân tích rủi ro thị trường (SRR), tính toán tuổi nghỉ hưu tối ưu nhất và đưa ra các ví dụ cụ thể, dễ làm theo (tránh thuật ngữ học thuật phức tạp).
  - Có chế độ tự động chuyển sang **Heuristic Fallback** thông minh nếu mất kết nối hoặc hết hạn mức API, đảm bảo luôn luôn có khuyến nghị tài chính hữu ích.
  - Nhấp nút **Phân tích lại với AI** bất kỳ lúc nào để nhận đánh giá mới sau khi điều chỉnh các tham số.

---

## 7. Giao Diện Pinned Sidebar & Trải Nghiệm Người Dùng

- **Thanh điều hướng Pinned Sidebar (Đóng băng)**: Cột menu bên trái luôn đứng yên tại chỗ khi bạn cuộn trang xem nội dung bên phải, giúp bạn chuyển đổi giữa các tab nhanh chóng bất kể trang dài bao nhiêu.
- **Icon lề trái tiết kiệm không gian**: Toàn bộ icon được bố trí bên trái văn bản giúp thanh điều hướng gọn gàng, hiển thị trọn vẹn cả 7 tab và thẻ tóm tắt *Mục tiêu Độc lập* trên mọi độ phân giải.

---

## 8. Xuất Báo Cáo & Sao Lưu Dữ Liệu

Nhấp vào nút xanh **Xuất báo cáo** ở góc trên cùng bên phải:
- **📊 Xuất dữ liệu CSV (Excel)**: Tải về file `.csv` chứa toàn bộ bảng dòng tiền chi tiết từng năm.
- **🖨️ In / Lưu Báo cáo PDF**: Mở giao diện in chuẩn định dạng tài liệu, hỗ trợ lưu thành tệp PDF chất lượng cao.
- **💾 Sao lưu Kế hoạch (JSON)**: Tải tệp dự phòng toàn bộ các kế hoạch của bạn.
- **📂 Khôi phục từ JSON**: Nhập lại dữ liệu kế hoạch từ tệp sao lưu trước đó.
