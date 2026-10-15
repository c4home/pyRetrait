# Cẩm Nang Tối Ưu & Tiết Kiệm Token Trong Antigravity

Tài liệu này phân tích chi tiết dựa trên **thực tế cách tương tác của bạn trong dự án pyRetrait**, giải thích rõ nguyên nhân vì sao token bị hao hụt nhanh và tổng hợp các giải pháp giúp bạn tiết kiệm **từ 60% đến 80% lượng token tiêu thụ**.

---

## I. Nguyên Nhân Cốt Lõi: Token Bị Tiêu Tốn Như Thế Nào?

Trong các AI Coding Agent như Antigravity, mô hình hoạt động theo nguyên lý **Context Tích Lũy (Cumulative Context)**:
- Mỗi khi bạn gửi một tin nhắn mới, hệ thống **không chỉ gửi riêng câu nói đó**, mà phải gửi lại **toàn bộ lịch sử từ đầu phiên chat**, bao gồm:
  1. System Rules & Hướng dẫn dự án (`GEMINI.md`, Custom Skills).
  2. Toàn bộ các câu hỏi - đáp trước đó.
  3. Lịch sử các công cụ đã chạy (đọc file, grep search, chạy lệnh terminal).
  4. Nội dung các đoạn code đã sửa hoặc file đã nạp vào bộ nhớ.
  5. Ảnh chụp màn hình từ Browser Subagent (mỗi ảnh chiếm hàng ngàn tokens).
- **Hệ quả:** Ở lượt chat thứ 1, câu lệnh ngắn tốn ~5.000 tokens. Nhưng đến lượt chat thứ 30, **cùng một câu lệnh ngắn 5 từ đó có thể tốn tới 150.000 - 250.000 tokens** vì phải gánh toàn bộ lịch sử phía trước!

---

## II. Phân Tích Thói Quen Của Bạn

### 1. Thói Quen Tốt (Cần Tiếp Tục Phát Huy)
- **Yêu cầu trực diện, không dài dòng:** Bạn ra lệnh rất ngắn gọn, rõ ràng, đi thẳng vào trọng tâm (ví dụ: *"xoa text chuan quoc te"*, *"3. Đạt chuẩn an toàn phải cùng size với..."*). Điều này giúp tiết kiệm token cho prompt đầu vào của bạn.
- **Cung cấp dữ liệu kiểm chứng cụ thể:** Khi thấy bug phân bổ danh mục (0% ra 89k, 5% ra 1.18M, 100% ra 1.18M), bạn mô tả đúng hành vi bất thường của số liệu, giúp agent định vị ngay hàm tính toán mà không phải chạy đoán mò nhiều vòng.
- **Có định hướng thống nhất thuật ngữ:** Việc yêu cầu đồng bộ từ ngữ chuẩn hóa (ví dụ: bỏ "Độc lập" chỉ giữ "Vững chắc") giúp giao diện nhất quán.

---

### 2. Thói Quen Gây Tốn Token Nghiêm Trọng (Cần Khắc Phục)

####  Thói quen 1: Kéo dài một phiên chat (Session) quá nhiều bước
- **Thực tế vừa qua:** Một session duy nhất được dùng để giải quyết:
  - Debug thuật toán tài chính `engine.js` (rút vốn Guyton-Klinger, phân bổ 4 lớp tài sản).
  - Tích hợp vẽ biểu đồ dòng tiền rút vốn.
  - Sửa lỗi slider và logic phân bổ tài sản.
  - Sửa nhiều chi tiết text nhỏ lẻ trong `index.html`.
- **Hậu quả:** Phiên chat tích lũy hàng chục lượt trao đổi, hàng chục lần mở file lớn và nhiều lượt browser test. Đến các câu lệnh cuối cùng, lượng token ngữ cảnh (Input Token) bị đội lên mức cực đại, dẫn đến việc cạn kiệt hạn ngạch (quota) rất nhanh.

####  Thói quen 2: Gửi các yêu cầu vụn vặt liên tiếp (Micro-Prompts)
- **Thực tế vừa qua:** Bạn chia nhỏ thành nhiều lượt chat liên tiếp:
  - Lượt 1: *"-xoa text (rút 4%/năm)... -trong Độc lập Vững chắc xoa Doc lap"*
  - Lượt 2: *"-thanh the Cách Tính Mục Tiêu Độc Lập bang dieu kien... -• Đạt chuẩn an toàn... thay • bang 3"*
  - Lượt 3: *"-3. Đạt chuẩn an toàn: phai cung size... -1,000 kịch bản... phai xuong dong"*
- **Hậu quả:** Mỗi lần bạn ấn gửi là **1 lần Antigravity nạp lại toàn bộ lịch sử 100k+ token**, đọc lại file, biên dịch và trả lời. 3 lượt chat nhỏ này tiêu tốn token gấp **3 lần** so với việc gộp chung vào 1 lần gửi.

####  Thói quen 3: Mở sẵn các file có dung lượng rất lớn trên IDE
- Khi bạn chat, Antigravity sẽ đính kèm thông tin các file đang mở (Active Document & Open Documents) vào phần metadata.
- Dự án pyRetrait có các file rất lớn như `frontend/js/ui.js` (~365 KB) hay `frontend/index.html` (~300 KB). Việc giữ nhiều tab file lớn mở liên tục khiến ngữ cảnh nền luôn ở mức nặng nề.

####  Thói quen 4: Không chỉ định file cụ thể trong câu lệnh
- Khi bạn bảo *"xoa text..."* mà không nói nằm ở file nào, Agent phải dùng công cụ `grep_search` hoặc duyệt qua `index.html`, `ui.js`, `i18n.js`. Quá trình tìm kiếm này sinh ra các log công cụ và nạp thêm token vào lịch sử.

---

## III. 5 Nguyên Tắc Vàng Để Tiết Kiệm 70% Token

### 1. Nguyên Tắc "1 Nhiệm Vụ = 1 Phiên Chat Mới" (Quy Tắc Quan Trọng Nhất)
- **Khi nào nên bấm `New Chat`:**
  - Vừa sửa xong 1 tính năng/bug lớn ➔ Bấm `New Chat`.
  - Chuẩn bị chuyển sang làm việc khác (ví dụ: đang sửa thuật toán chuyển sang sửa giao diện CSS/HTML) ➔ Bấm `New Chat`.
  - Phiên chat đã vượt quá 10 - 15 lượt đối thoại ➔ Bấm `New Chat`.
- **Lợi ích:** Đưa mức tiêu thụ token input từ ~150.000 tokens/lượt quay trở về ~5.000 - 10.000 tokens/lượt (tiết kiệm đến **95%** cho các lượt kế tiếp).

### 2. Kỹ Thuật Gộp Yêu Cầu (Prompt Batching)
Thay vì gửi 3 - 4 tin nhắn ngắn nối tiếp nhau, hãy gom tất cả các chỉnh sửa vào **1 danh sách gạch đầu dòng duy nhất** rồi gửi 1 lần:

> **❌ Cách tốn token (gửi 3 lần):**
> - Tin nhắn 1: Đổi tiêu đề A thành B.
> - Tin nhắn 2: Xóa dòng chữ C.
> - Tin nhắn 3: Cho mục D xuống dòng.

> ** Cách tiết kiệm token (gửi 1 lần):**
> *"Trong file `frontend/index.html`, nhờ bạn sửa các điểm sau:*
> *1. Đổi tiêu đề thẻ 'Cách Tính...' thành 'Điều Kiện...'*
> *2. Xóa các đoạn text '(rút 4%/năm)'*
> *3. Đổi bullet '• Đạt chuẩn an toàn' thành '3. Đạt chuẩn an toàn', cùng cỡ chữ với mục 2 và ngắt dòng nội dung bên dưới."*

### 3. Chỉ Rõ Tên File / Khu Vực Cần Chỉnh Sửa
- Nêu rõ tên file và component: Ví dụ `frontend/index.html`, thẻ sidebar hoặc hàm `calculateWeightedReturn` trong `frontend/js/engine.js`.
- Giúp agent nhảy thẳng vào đúng file và dùng công cụ thay thế chính xác dòng cần sửa (`replace_file_content`), không phải grep toàn bộ dự án.

### 4. Đóng Các Tab File Lớn Không Dùng Đến
- Khi đang tập trung làm việc ở file nào, hãy đóng bớt các tab file khổng lồ khác trên editor (nhất là `ui.js` hay các file log, database).
- Giữ editor gọn gàng giúp metadata gửi kèm mỗi turn luôn nhẹ nhàng.

### 5. Chọn Cấu Hình Mô Hình (Model Selection) Phù Hợp
- **Gemini Flash (Medium / Low):** Rất tối ưu, tốc độ nhanh, tốn ít quota, phù hợp cho 90% công việc hàng ngày (sửa HTML/CSS, chỉnh text, sửa hàm JS đơn giản, refactor nhỏ).
- **Gemini Pro / Thinking cao:** Chỉ nên bật khi cần thiết kế kiến trúc hệ thống mới, debug các thuật toán tài chính cực kỳ hóc búa hoặc phân tích logic toán học đa biến phức tạp.

---

## IV. Bảng Tóm Tắt Hành Động Nhanh

| Tình Huống | Hành Động Tiết Kiệm Token |
| :--- | :--- |
| **Sửa giao diện / text nhỏ lẻ** | Gom tất cả các điểm cần sửa vào 1 tin nhắn có gạch đầu dòng. |
| **Vừa hoàn thành xong 1 bug/tính năng** | Bấm ngay **New Chat** để làm mới bộ nhớ đệm (context). |
| **Chuẩn bị ra lệnh cho Agent** | Ghi rõ tên file (ví dụ: `index.html` hoặc `engine.js`). |
| **Thấy chat bắt đầu phản hồi chậm** | Dấu hiệu context đã quá đầy (~100k+ tokens) ➔ Mở chat mới ngay. |
| **Hỏi giải thích lý thuyết / tài liệu** | Yêu cầu tóm tắt ngắn gọn thay vì viết quá dài dòng. |
