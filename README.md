# pyRetrait — Nền tảng Hoạch định Nghỉ Hưu Sớm & Độc Lập Tài Chính (FIRE)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![NumPy](https://img.shields.io/badge/Engine-NumPy-013243?style=flat&logo=numpy)](https://numpy.org)
[![Chart.js](https://img.shields.io/badge/Charts-Chart.js-FF6384?style=flat&logo=chartdotjs)](https://www.chartjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**pyRetrait** là bộ công cụ web mã nguồn mở cao cấp, giải pháp thay thế hoàn hảo cho các phần mềm trả phí quốc tế như *ProjectionLab* hay *Boldin (NewRetirement)*. Ứng dụng được thiết kế chuyên biệt cho chiến lược **Franco-Viet Geo-Arbitrage** (tích lũy thu nhập bằng Euro € tại Pháp và nghỉ hưu sung túc tại Việt Nam ₫), đồng thời hỗ trợ linh hoạt cho cả thị trường Việt Nam (VND, BĐS, vàng, BHXH) lẫn thị trường Quốc tế / Mỹ (USD, 401(k), Roth IRA, ACA Subsidies).

---

## 📚 Bộ Tài Liệu Dự Án (Documentation Suite)

Để hiểu sâu về hệ thống và các chiến lược tài chính, vui lòng tham khảo các tài liệu chuyên đề:

| Tài liệu | Mô tả nội dung |
| :--- | :--- |
| 📖 [**DOCS_USER_GUIDE.md**](file:///Users/canhhung/Documents/pyRetrait/DOCS_USER_GUIDE.md) | **Sổ tay Hướng dẫn Sử dụng**: Hướng dẫn chi tiết từng bước tạo kế hoạch, quản lý đa nguồn thu, phân bổ tỷ lệ chi tiêu/tiết kiệm, thử nghiệm kịch bản What-If và xuất báo cáo. |
| 🇫🇷 [**DOCS_FRANCO_VIET_FIRE.md**](file:///Users/canhhung/Documents/pyRetrait/DOCS_FRANCO_VIET_FIRE.md) | **Cẩm nang Franco-Viet FIRE**: Phân tích toán học Geo-arbitrage, luật giữ tài khoản PEA sau khi rời Pháp, bảo lưu lương hưu CNAV/Agirc-Arrco chi trả về VN, và hiệp định thuế Pháp-Việt 1992. |
| 🧮 [**DOCS_CALCULATION_ENGINE.md**](file:///Users/canhhung/Documents/pyRetrait/DOCS_CALCULATION_ENGINE.md) | **Đặc tả Toán học & Thuật toán**: Công thức tính dòng tiền lũy tiến, 4 chiến lược rút tiền (Bengen, Guyton-Klinger, VPW, Fixed %), mô hình chi tiêu Spending Smile và mô phỏng Monte Carlo. |
| 🏛️ [**DOCS_ARCHITECTURE.md**](file:///Users/canhhung/Documents/pyRetrait/DOCS_ARCHITECTURE.md) | **Kiến trúc Kỹ thuật Hệ thống**: Thiết kế Local-First, luồng dữ liệu 2 tầng (Client JS Engine & Backend FastAPI NumPy), cấu trúc Schema và cơ chế phản hồi tức thì. |

---

## 🌟 Toàn Bộ 25 Tính Năng Cao Cấp

| Nhóm tính năng | Chi tiết chức năng |
| :--- | :--- |
| 📊 **Cash-Flow Projections** | Mô phỏng dòng tiền từng năm từ tuổi hiện tại đến tuổi 85-100: Thu nhập tích lũy, chi tiêu, thuế, số dư danh mục. |
| 🚩 **Life Milestones (Cột Mốc Cuộc Đời)** | Dải ruy băng sự kiện trực quan trên đầu biểu đồ Net Worth. Đánh dấu các mốc quan trọng (mua nhà, sinh con, quỹ học vấn, kết hôn, thừa kế...) kèm tác động tài chính rút vốn/bơm vốn tức thì; tương tác nhấp đúp để chỉnh sửa nhanh. |
| 🎲 **Deterministic Monte Carlo (Mulberry32)** | Mô phỏng 1,000+ kịch bản thị trường với thuật toán sinh số giả ngẫu nhiên có hạt giống cố định (Seed 42), đảm bảo kết quả P10/P50/P90 đồng nhất 100% trên mọi trình duyệt (Chrome, Brave, Safari, Edge). |
| ⚖️ **Phân bổ Tỷ lệ Thu nhập Tự động** | Tự động phân bổ thu nhập thành **Tiết kiệm (ví dụ 1/3)** và **Chi tiêu (ví dụ 2/3)**. Khi lương tăng trưởng qua các năm, tiền tiết kiệm tự động tăng tương ứng để tính toán tăng trưởng tài sản ròng. |
| 🛡️ **Withdrawal Strategies** | So sánh trực quan 4 chiến lược rút tiền: **Quy tắc 4% (Bengen)**, **Lan can Guyton-Klinger**, **Tỷ lệ thay đổi VPW**, và **Tỷ lệ cố định Fixed %**. |
| 💶 **Franco-Viet Geo-Arbitrage & PPP** | Mô hình hóa thu nhập EUR tại Pháp, tối ưu thuế IR 2024, tài khoản đầu tư PEA (trần 150k€), chi tiêu hưu trí VND tại VN, bảo lưu lương hưu Pháp chi trả sau tuổi 65. Hỗ trợ 3 chế độ địa điểm hưu trí với hệ số sức mua PPP (100% Pháp, Song hành 6T/6T, 100% Việt Nam). |
| 🇫🇷 **Hưu Trí Pháp & Phạt Décote (Réforme 2023)** | Mô hình hóa chuẩn 172 quý (43 năm), tính toán số quý đóng theo tuổi đi làm, mức phạt -1.25%/quý thiếu (tối đa -25%) khi nghỉ hưu trước 67 tuổi, và cơ chế tự động xóa phạt ở tuổi 67 (*Taux plein automatique à 67 ans*). |
| 🏥 **Cẩm Nang Sức Khỏe & Lương Hưu Kép (BHXH Tự Nguyện)** | Hướng dẫn khám sức khỏe định kỳ miễn phí *Mon Bilan Prévention* tại Pháp; khám bệnh viện quốc tế/công lập tuyến đầu tại VN kết hợp thẻ CFE + Mutuelle bảo lãnh viện phí trực tiếp. Tích hợp công cụ tính thử BHXH Tự nguyện Việt Nam (Luật 2024 mốc 15 năm, hoàn vốn sau 7.3 năm, thẻ BHYT 95% trọn đời). |
| 🏢 **Quản Lý Tài Sản & BĐS Thực Tế** | Quản lý danh mục BĐS cho thuê tại Pháp theo luật thuế **LMNP Réel** (khấu hao 0% thuế), tính toán lịch trả nợ vay ngân hàng (*amortissement*), phí công chứng tự động 7.5%, tỷ lệ phòng trống (*vacance locative*), thuế đất *taxe foncière*, theo dõi dòng tiền ròng thực tế trực tiếp và dòng tiền thụ động bùng nổ sau khi tất toán nợ (+1,400 €/tháng), kèm đội xe **Turo**; đồng bộ 1-click vào kế hoạch FIRE. |
| 👨‍👩‍👧‍👦 **Kế Hoạch Con Cái & Dòng Tiền Gia Đình** | Quản lý năm sinh con cái, mô phỏng tự động trợ cấp gia đình Pháp (Caf), các đợt đỉnh chi phí đại học/thạc sĩ (18-23 tuổi), và hỗ trợ tài chính ban đầu (24-26 tuổi) hiển thị trên biểu đồ *Family Trajectory*. |
| 🏛️ **Di Sản & Chuyển Nhượng Démembrement** | Đặt mục tiêu di sản để lại cho con cháu, tích hợp kỹ thuật chuyển nhượng quyền sở hữu trần (Nue-propriété) theo Điều 669 CGI tận dụng hạn mức miễn thuế 100.000 €/con mỗi 15 năm của Pháp. |
| 👵 **Quỹ Chăm Sóc Tuổi Già (Dépendance / EHPAD)** | Ngân sách dự phòng y tế & viện dưỡng lão cao cấp từ 78 tuổi trở đi để bảo vệ nguyên vẹn khối tài sản di sản. |
| 🔐 **Multi-User Cloud & Authentication** | Đăng ký & Đăng nhập tài khoản cá nhân (mật khẩu mã hóa an toàn PBKDF2/SHA-256 + salt, JWT token). Mỗi người dùng có một không gian dữ liệu đám mây riêng biệt (SQLite DB), độc lập tuyệt đối giữa các bạn bè khi chia sẻ đường link web. Chế độ Khách (Guest) tự động đồng bộ khi đăng ký. |
| 🔄 **Tái đầu tư Thặng dư Hưu trí** | Nếu thu nhập thụ động tuổi già (lương hưu, cổ tức, tiền thuê nhà) lớn hơn chi phí sinh hoạt, thặng dư sẽ được tự động tái đầu tư vào danh mục. |
| 📈 **Realistic Past & Future Timeline** | Dòng thời gian tài chính trung thực 100%: Dựa trên thu nhập và cấu hình thực tế, loại bỏ hoàn toàn các ước lượng toán học giả định ở các độ tuổi quá khứ. |
| ⚖️ **Tax Optimization & Estimation** | Biểu thuế lũy tiến Pháp (IR 2024 có giảm trừ 10% frais pro), biểu thuế Mỹ và Việt Nam; ước tính thuế thu nhập, thuế đầu tư. |
| 🔄 **Roth Conversions Ladder** | Tính toán số tiền chuyển đổi Roth hàng năm vào các "năm trũng" thu nhập để lấp đầy bậc thuế thấp, thống kê tổng số tiền thuế tiết kiệm trọn đời. |
| 🏥 **ACA Subsidies Optimization** | Tối ưu hóa thu nhập chịu thuế MAGI trước 65 tuổi để tận dụng tối đa trợ cấp y tế. |
| 📈 **Deeper Insights & Monte Carlo** | Mô phỏng rủi ro thứ tự sinh lời (Sequence of Returns Risk - SRR), biểu đồ quạt phân vị P10 - P90, xác suất hoàn thành mục tiêu. |
| 🧬 **What-If Scenarios** | Kiểm thử khả năng chịu đựng của danh mục trước các cú sốc: Khủng hoảng thị trường sớm (-35%), Lạm phát phi mã, Cú sốc chi phí y tế tuổi 65, Thu gọn BĐS tuổi 60. |
| 😊 **Flexible Spending (Smile)** | Mô hình chi tiêu thực tế 3 giai đoạn: **Go-Go** (năng động), **Slow-Go** (tiết chế), và **No-Go** (nghỉ dưỡng & chăm sóc y tế). |
| 📄 **Downloadable Reports** | Xuất bảng dòng tiền chi tiết ra file **CSV (Excel)**, In/Lưu Báo cáo tổng quan thành **PDF**, Sao lưu & Phục hồi dữ liệu **JSON**. |
| 📁 **Multiple Plans** | Tạo, nhân bản, đổi tên và lưu trữ không giới hạn các kế hoạch hưu trí độc lập (lưu trữ cục bộ + đồng bộ server SQLite). |
| 💱 **Đa Tiền tệ Thời gian thực** | Chuyển đổi linh hoạt giữa **€ (Euro)**, **₫ (VND)** và **$ (USD)** với nhãn ký hiệu trực quan và đồng bộ tức thì. |
| ✨ **Gemini AI Strategy Advisor** | Phân tích sức khỏe tài chính bằng **Google Gemini AI 2.5 / Flash** (hoặc Heuristic dự phòng), chỉ ra rủi ro cốt lõi và đưa ra khuyến nghị thực thi bằng ví dụ dễ hiểu. |

---

## 🚀 Hướng Dẫn Khởi Chạy Ứng Dụng

Chỉ cần một lệnh duy nhất:

```bash
python3 run.py
```

Ứng dụng sẽ tự động khởi động tại địa chỉ:
👉 **[http://localhost:8000](http://localhost:8000)** (hoặc `http://127.0.0.1:8000`)

---

## 🛠️ Cấu Trúc Mã Nguồn

```
pyRetrait/
├── run.py                 # File khởi động ứng dụng chính (Uvicorn / FastAPI launcher)
├── deploy.sh              # Script 1-click tự động đồng bộ & deploy VPS Docker
├── Dockerfile             # Cấu hình đóng gói container Docker
├── docker-compose.yml     # Quản lý container pyRetrait và gắn volume dữ liệu bền vững
├── README.md              # Giới thiệu tổng quan & chỉ mục tài liệu
├── DOCS_USER_GUIDE.md     # Sổ tay hướng dẫn sử dụng chi tiết
├── DOCS_FRANCO_VIET_FIRE.md # Cẩm nang chiến lược Franco-Viet FIRE
├── DOCS_CALCULATION_ENGINE.md # Đặc tả toán học & thuật toán tính toán
├── DOCS_ARCHITECTURE.md   # Tài liệu kiến trúc kỹ thuật hệ thống
├── DEPLOY_OVH.md          # Hướng dẫn chi tiết triển khai server OVH
├── HUONG_DAN_CAP_NHAT_SERVER.md # Quy trình nâng cấp & bảo toàn database trên VPS
├── backend/
│   ├── __init__.py
│   ├── auth.py            # Quản lý xác thực JWT, mã hóa PBKDF2/SHA-256 + salt
│   └── main.py            # FastAPI server, REST API, SQLite persistence & Gemini AI proxy
├── frontend/
│   ├── index.html         # Giao diện web chuẩn ngữ nghĩa, modal responsive & milestone ribbon
│   ├── css/
│   │   └── styles.css     # Dark mode, glassmorphism, responsive modal scrolling & pinned layout
│   └── js/
│       ├── chart.umd.min.js # Thư viện Chart.js cục bộ (Local-first, không phụ thuộc CDN)
│       ├── engine.js       # Thuật toán tính dòng tiền, Bengen, Guyton-Klinger, VPW
│       ├── taxOptimizer.js # Tối ưu hóa thuế, Lương hưu Pháp, Roth Ladder, ACA Subsidies
│       ├── monteCarlo.js   # Mô phỏng Monte Carlo xác định (Mulberry32 PRNG seed 42)
│       ├── scenarios.js    # Kịch bản What-If & Stress Test
│       ├── patrimoine.js   # Quản lý BĐS Pháp LMNP, Đội xe Turo & Đồng bộ 1-click vào FIRE
│       ├── auth.js         # Quản lý đăng nhập/đăng ký Cloud, đồng bộ Guest mode
│       ├── export.js       # Xuất CSV, in PDF tóm tắt, sao lưu JSON
│       └── ui.js           # Xử lý tương tác, modal quản lý sự kiện, reactive Chart.js
├── pyLocation/            # Bộ công cụ chuyên sâu phân tích BĐS Pháp & LMNP (Streamlit / Core Engine)
│   ├── app.py             # Ứng dụng Streamlit độc lập
│   ├── calculations.py    # Thuật toán tính thuế LMNP Réel, khấu hao, lãi vay & dòng tiền
│   ├── README.md          # Tài liệu chi tiết pyLocation
│   └── USER_GUIDE.md      # Cẩm nang đầu tư BĐS LMNP Pháp
└── data/
    ├── pyretrait.db       # Cơ sở dữ liệu SQLite lưu trữ người dùng & kế hoạch đám mây
    └── plans.json         # Dữ liệu mẫu / kế hoạch mặc định cục bộ
```

---

## 🔒 Bảo Mật & Bản Quyền

- Nền tảng hoạt động **100% Local-First**, toàn bộ dữ liệu tài chính của bạn được lưu trữ trên máy cá nhân, không gửi thông tin tài sản lên bất kỳ máy chủ bên thứ ba nào.
- Được phát hành dưới giấy phép mã nguồn mở [MIT License](LICENSE).
