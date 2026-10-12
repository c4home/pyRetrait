# Rules — Dự Án pyRetrait

## 1. Ngôn Ngữ & Giao Tiếp

- **Toàn bộ giao tiếp với người dùng bằng Tiếng Việt.**
- Comments trong code: ưu tiên tiếng Việt cho logic nghiệp vụ phức tạp; tiếng Anh cho comment kỹ thuật phổ thông.
- Tên biến và hàm: dùng tiếng Anh (camelCase cho JS, snake_case cho Python).
- Tên hiển thị trên UI (label, tooltip, placeholder): tiếng Việt.

---

## 2. Kiến Trúc Hệ Thống

### Nguyên Tắc Local-First
- **Mọi tính toán tài chính phải chạy được 100% trên client (JS engine)** mà không cần gọi API — kể cả khi offline.
- Backend FastAPI chỉ đảm nhiệm: xác thực người dùng (JWT), lưu/đồng bộ kế hoạch lên SQLite, và expose `/api/...` endpoints.
- **Không bao giờ chuyển logic tính toán cốt lõi (dòng tiền, Monte Carlo, thuế) sang backend.**

### Phân Chia File Frontend
| File | Trách nhiệm |
|------|-------------|
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

---

## 6. UI / UX

- **Thiết kế Dark Mode** là mặc định; hỗ trợ light mode nếu người dùng yêu cầu.
- Mọi thay đổi input phải cập nhật biểu đồ **tức thì** (debounce 300ms) — không cần nhấn nút "Tính toán".
- Màu sắc biểu đồ phải nhất quán trong cả session; dùng bảng màu đã định nghĩa trong CSS variables.
- Responsive: hoạt động tốt trên màn hình từ 768px trở lên (tablet landscape + desktop).
- Không dùng `alert()` / `confirm()` của browser — thay bằng toast notification hoặc modal tùy chỉnh.
- Mọi số tiền hiển thị phải có dấu phân cách nghìn (`.` cho VND, `,` cho EUR/USD) và ký hiệu tiền tệ.

---

## 7. Bảo Mật & Dữ Liệu

- **Không lưu mật khẩu** hay token JWT vào `localStorage` — dùng `sessionStorage` hoặc cookie `HttpOnly`.
- Dữ liệu kế hoạch tài chính trong `localStorage` **không được chứa thông tin nhận dạng cá nhân** (tên thật, CMND...).
- Validate toàn bộ input từ người dùng ở cả frontend (UX) lẫn backend (security).
- Không log thông tin nhạy cảm (token, mật khẩu) ra console hay server logs.

---

## 8. Quy Trình Làm Việc Với Agent

- Khi được yêu cầu thêm tính năng mới, **luôn hỏi lại** nếu tính năng có thể ảnh hưởng đến kết quả tính toán tài chính để tránh sai số.
- Trước khi sửa `engine.js` hoặc `monteCarlo.js`, **đọc lại toàn bộ hàm liên quan** để hiểu context; không patch một phần nhỏ mà bỏ sót tác động dây chuyền.
- Khi sửa `ui.js` (file rất lớn ~238KB), **chỉ sửa đúng đoạn cần thiết** bằng `multi_replace_file_content`; không viết lại toàn bộ file.
- Mỗi thay đổi logic tính toán phải đi kèm ví dụ kiểm chứng số học cụ thể trong comment.
- **Không xóa tính năng hiện có** nếu người dùng không yêu cầu — kể cả khi refactor.

---

## 9. Tài Liệu & Documentation

- Các file `DOCS_*.md` là **nguồn sự thật** cho logic nghiệp vụ; khi có xung đột giữa code và docs, **hỏi người dùng** để làm rõ trước khi sửa.
- Mọi thuật toán mới hoặc thay đổi công thức phải cập nhật vào `DOCS_CALCULATION_ENGINE.md`.
- README.md phải phản ánh đúng danh sách tính năng hiện tại.

---

## 10. Deployment

- Môi trường production: OVH VPS + Docker (xem `DEPLOY_OVH.md`).
- **Không commit file `.env`** — chỉ commit `.env.example`.
- Build image: `docker-compose up --build`; không dùng `npm run build` hay bundler JS phức tạp — frontend là static files.
- Health check: endpoint `/health` phải trả về `{"status": "ok"}` trong vòng < 200ms.
