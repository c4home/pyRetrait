# pyRetrait — Nền tảng Hoạch định Nghỉ Hưu Sớm & Độc Lập Tài Chính (FIRE)

**pyRetrait** là bộ công cụ web mã nguồn mở cao cấp, giải pháp thay thế hoàn hảo cho các phần mềm trả phí quốc tế như *ProjectionLab* hay *Boldin (NewRetirement)*, được tối ưu hóa cho cả thị trường Việt Nam (VND, BĐS, vàng, cổ tức, BHXH) lẫn thị trường Quốc tế / Mỹ (USD, 401(k), Roth IRA, ACA Subsidies).

---

## 🌟 Toàn bộ Tính năng Cao cấp Đã Tích hợp

| Nhóm tính năng | Chi tiết chức năng |
| :--- | :--- |
| 📊 **Cash-Flow Projections** | Mô phỏng dòng tiền từng năm từ tuổi hiện tại đến tuổi 85-100: Thu nhập tích lũy, chi tiêu, thuế, số dư danh mục. |
| 🛡️ **Withdrawal Strategies** | So sánh trực quan 4 chiến lược rút tiền: **Quy tắc 4% (Bengen)**, **Lan can Guyton-Klinger**, **Tỷ lệ thay đổi VPW**, và **Tỷ lệ cố định Fixed %**. |
| ⚖️ **Tax Optimization & Estimation** | Hỗ trợ khung thuế Quốc tế/Việt Nam và biểu thuế lũy tiến Mỹ; ước tính thuế thu nhập, thuế đầu tư. |
| 🔄 **Roth Conversions Ladder** | Tự động tính toán số tiền chuyển đổi Roth hàng năm vào các "năm trũng" thu nhập để lấp đầy bậc thuế thấp, thống kê tổng số tiền thuế tiết kiệm trọn đời. |
| 🏥 **ACA Subsidies Optimization** | Tối ưu hóa thu nhập chịu thuế MAGI trước 65 tuổi để tận dụng tối đa trợ cấp y tế. |
| 📈 **Deeper Insights & Monte Carlo** | Mô phỏng ngẫu nhiên 1,000+ kịch bản thị trường (Gaussian Distribution), biểu đồ quạt phân vị P10 - P90, Sequence of Returns Risk (SRR). |
| 🧬 **What-If Scenarios** | Kiểm thử khả năng chịu đựng của danh mục trước các cú sốc: Khủng hoảng thị trường sớm (-35%), Lạm phát phi mã, Cú sốc chi phí y tế tuổi 65, Thu gọn BĐS tuổi 60. |
| ⚖️ **Compare Mode** | So sánh song song đối chiếu 2 kế hoạch (Kế hoạch A vs Kế hoạch B) trên cùng một màn hình. |
| 🏛️ **Estate Planning & Legacy** | Đặt mục tiêu di sản để lại cho con cháu/từ thiện, theo dõi thanh tiến độ di sản ở tuổi thọ kỳ vọng. |
| 😊 **Flexible Spending (Smile)** | Mô hình chi tiêu thực tế 3 giai đoạn: **Go-Go** (năng động), **Slow-Go** (tiết chế), và **No-Go** (nghỉ dưỡng & chăm sóc y tế). |
| 📄 **Downloadable Reports** | Xuất bảng dòng tiền chi tiết ra file **CSV (Excel)**, In/Lưu Báo cáo tổng quan thành **PDF**, Sao lưu & Phục hồi dữ liệu **JSON**. |
| 📁 **Multiple Plans** | Tạo, nhân bản, đổi tên và lưu trữ không giới hạn các kế hoạch hưu trí độc lập (lưu trữ cục bộ + đồng bộ server). |
| 🤖 **AI Advisor / FIRE Audit** | Trợ lý tự động kiểm tra sức khỏe tài chính, chấm điểm **FIRE Readiness Score (0-100)** và đề xuất hành động thực tiễn. |

---

## 🚀 Hướng dẫn Khởi chạy Ứng dụng

Chỉ cần một lệnh duy nhất:

```bash
python3 run.py
```

Ứng dụng sẽ tự động khởi động tại địa chỉ:
👉 **[http://localhost:8000](http://localhost:8000)**

---

## 🛠️ Cấu trúc Mã nguồn

```
pyRetrait/
├── run.py                 # File khởi động ứng dụng chính
├── backend/
│   ├── __init__.py
│   └── main.py            # FastAPI server & Monte Carlo simulation engine
├── frontend/
│   ├── index.html         # Giao diện web chuẩn ngữ nghĩa & responsive
│   ├── css/
│   │   └── styles.css     # Hệ thống giao diện hiện đại, glassmorphism, Dark/Light mode
│   └── js/
│       ├── engine.js       # Thuật toán tính dòng tiền, Bengen, Guyton-Klinger, VPW
│       ├── taxOptimizer.js # Tối ưu hóa thuế, Roth Ladder, ACA Subsidies
│       ├── monteCarlo.js   # Mô phỏng Monte Carlo & phân tích rủi ro SRR
│       ├── scenarios.js    # Kịch bản What-If & Chế độ so sánh đối chiếu (Compare Mode)
│       ├── export.js       # Xuất CSV, in PDF tóm tắt, sao lưu JSON
│       └── ui.js           # Xử lý tương tác, biểu đồ Chart.js và tính toán thời gian thực
└── data/
    └── plans.json         # Lưu trữ các kế hoạch tài chính của người dùng
```
