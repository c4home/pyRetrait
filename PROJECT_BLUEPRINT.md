# pyRetrait — Kiến Trúc & Mục Tiêu Hệ Thống (Project Blueprint)

Tài liệu thiết kế gốc (Blueprint) này định nghĩa mục tiêu cốt lõi, ranh giới phạm vi, ràng buộc kỹ thuật, phân bổ thư mục, cấu trúc dữ liệu chuẩn (`Core Data Schema`) và lộ trình phát triển của **pyRetrait** theo đúng quy trình tiết kiệm token tại [`docs/QUY_TRINH_PHAT_TRIEN_APP_BANG_ANTIGRAVITY.md`](file:///Users/canhhung/Documents/pyRetrait/docs/QUY_TRINH_PHAT_TRIEN_APP_BANG_ANTIGRAVITY.md).

---

## 1. Mục Tiêu Cốt Lõi & Đối Tượng Sử Dụng

### 1.1. Bài Toán Cốt Lõi Dự Án Giải Quyết
Giúp người dùng (đặc biệt là người Việt sinh sống và làm việc tại Pháp, châu Âu, Mỹ và Việt Nam) nhìn thấu bức tranh tương lai song hành cả về **Tài chính (Financial Lifespan)** lẫn **Sức khỏe & Thể lực (Healthspan)** xuyên suốt cuộc đời (từ 18 đến 85–110 tuổi). Từ đó trả lời chính xác câu hỏi:
> **"Bao giờ tôi nên nghỉ hưu để vừa an toàn tuyệt đối về tiền bạc trước mọi biến cố, vừa còn đủ năm tháng khỏe mạnh tự lập để tận hưởng cuộc sống tự do?"**

### 1.2. Bốn Trụ Cột "Sống Còn" & Con Hào Kinh Tế (Defensible Moats)
1. **Mô phỏng Dòng tiền & Định vị Tuổi Nghỉ Hưu Tối Ưu (`optimalFireAge`)**:
   - Kết hợp thu nhập chủ động, bất động sản cho thuê LMNP Pháp, đội xe Turo, lương hưu Pháp (CNAV/Agirc-Arrco có tính quý `trimestres` và phạt `décote`), BHXH tự nguyện Việt Nam (Luật 2024) và 4 chiến lược rút vốn (`Guyton-Klinger`, `Bengen 4%`, `VPW`, `Fixed %`).
   - Xác thực độ an toàn qua **1,000 kịch bản Monte Carlo** (Mulberry32 Seed = 42) và **Lưới an toàn 3 biến cố khắc nghiệt** (Khủng hoảng thị trường sớm -35%, Bão giá lạm phát +30% trong 5 năm, Cú sốc y tế tuổi 65).
2. **Đo lường Tuổi Sinh Học & Khoảng Cách Suy Yếu Cuối Đời (`Healthspan vs Lifespan`)**:
   - Đánh giá tuổi sinh học thực tế qua 4 chỉ số lâm sàng (Nhịp tim nghỉ, Huyết áp, Vòng eo/Chiều cao, Sức mạnh cơ bắp) và 5 thói quen lối sống vàng.
   - Lượng hóa số năm sống khỏe tự lập (`Healthspan`), giai đoạn chuyển tiếp và số năm phụ thuộc y tế cuối đời (`Healthspan Gap`) để đồng bộ trực tiếp vào chi phí chăm sóc tuổi già (EHPAD Pháp vs Chăm sóc tại nhà ở Việt Nam).
3. **Tối Ưu Hóa Thuế Quốc Tế & Quy Đổi Sức Mua Đa Tiền Tệ (`EUR ↔ VND ↔ USD`)**:
   - Tối ưu thuế lũy tiến Pháp (IR 2024, giảm trừ 10% frais pro, chia phần gia đình `Quotient Familial`), thác rút tiền ưu đãi thuế (`Livret A` ➔ `Assurance-Vie` ➔ `PEA` ➔ `CTO`) và chênh lệch chi phí sống (Geo-arbitrage Pháp – Việt).
4. **Thư Viện Kịch Bản Cộng Đồng & Con Hào Dữ Liệu Thực Chiến (Network & Data Moat — Chống Sao Chép)**:
   - "Chợ Kịch bản Cộng đồng" (Community Marketplace) mở tự do, cho phép kiều bào xuất bản kịch bản ẩn danh, bình chọn (Upvote) và chia sẻ kinh nghiệm đời thực.
   - Cơ chế **Smart Forking (Nhân bản thông minh)**: Tự động chuẩn hóa phân bổ tài sản dạng % và tự động map vào số tiền/thu nhập thực của người dùng mới.
   - Kiến trúc Hybrid Local-First: Đóng gói sẵn 6 kịch bản thực chiến offline (`community-seed.js`) kết hợp đồng bộ API SQLite để đảm bảo web luôn sống động ngay cả khi offline. Đây là con hào kinh tế mà các web clone mã nguồn rỗng không thể bắt chước.

### 1.3. Những Tính Năng Cố Tình KHÔNG LÀM (Out-of-Scope) Để Chống Phình Dự Án
- **Không kết nối trực tiếp tài khoản ngân hàng thật (Open Banking / Plaid)**: Vừa bảo vệ tuyệt đối quyền riêng tư người dùng, vừa tránh phụ thuộc API bên thứ ba đắt đỏ.
- **Không làm sàn giao dịch hay bảng giá chứng khoán/crypto thời gian thực**: Dự án tập trung vào hoạch định vĩ mô dài hạn 30–60 năm, không phục vụ lướt sóng ngắn hạn.
- **Không dùng AI để tính toán số học tài chính**: Mọi phép tính dòng tiền, thuế, lãi kép phải chạy 100% bằng công thức toán học tất định (`Deterministic JS Engine`). AI Gemini chỉ đóng vai trò đọc kết quả đầu ra để viết lời khuyên.
- **Không dùng Framework Frontend (React/Vue/Angular) hay ORM Backend (SQLAlchemy)**: Giữ hệ thống siêu nhẹ, không cần bước build phức tạp, tải trang dưới 100ms.

---

## 2. Tech Stack & Ràng Buộc Kỹ Thuật Bất Biến (Non-negotiable Rules)

- **Frontend**: 100% Vanilla JavaScript (ES6+), HTML5, Vanilla CSS.
- **Biểu đồ**: Chart.js (`frontend/js/chart.umd.min.js` đóng gói cục bộ, fallback CDN).
- **Giao diện (Dual-Theme & Plain Language)**:
  - Hỗ trợ song song **Dark Mode** và **Light Mode** qua biến CSS (`var(--bg-card)`, `var(--text-main)`, `var(--text-muted)`). Tuyệt đối cấm hardcode nền tối hay màu chữ xám nhạt trực tiếp.
  - Thống nhất font `Inter` (`var(--font-sans)`) cho toàn bộ văn bản và công thức hiển thị. Không dùng cú pháp LaTeX.
  - Cấm dùng icon/emoji trang trí trừ khi người dùng yêu cầu rõ ràng.
- **Đa ngôn ngữ (`i18n.js`)**: Tiếng Việt (`vi` - mặc định), Tiếng Anh (`en`), Tiếng Pháp (`fr`) qua Dropdown Menu co giãn trên Header. Khi kiểm thử chỉ kiểm tra trên Tiếng Việt (`vi`), kiểm tra tĩnh cho `en`/`fr`.
- **Lưu trữ & Backend**:
  - **Local-First**: Lưu tức thì vào `localStorage` (`pyretrait_plans`, `pyRetrait_guest_patrimoine_v2`).
  - **Cloud Sync**: Python 3.10+ FastAPI + `sqlite3` thuần (`data/pyretrait.db`), xác thực JWT + mật khẩu băm `PBKDF2-HMAC-SHA256` (100,000 vòng lặp).

---

## 3. Cấu Trúc Thư Mục & Phân Trách Nhiệm (File Organization)

Chi tiết vị trí dòng code của từng hàm được lập chỉ mục tại [`docs/CODEBASE_MAP.md`](file:///Users/canhhung/Documents/pyRetrait/docs/CODEBASE_MAP.md).

```text
pyRetrait/
├── PROJECT_BLUEPRINT.md              # Tài liệu thiết kế gốc (File này)
├── NGHIEN_CUU_KIEN_TRUC_VA_MO_HINH_PYRETRAIT.md # Phân tích biến số & kiểm toán logic
├── DOCS_ARCHITECTURE.md              # Tài liệu kiến trúc hệ thống
├── DOCS_CALCULATION_ENGINE.md        # Đặc tả công thức toán học
├── .antigravityignore                # Chặn file nhị phân/minified giúp tiết kiệm token
├── .agents/rules/GEMINI.md           # Luật bất biến cho AI Agent
├── docs/
│   ├── CODEBASE_MAP.md               # Bản đồ dòng code (Chống Context Hunting)
│   ├── QUY_TRINH_PHAT_TRIEN_APP_BANG_ANTIGRAVITY.md
│   └── plans/                        # Thư mục chứa kế hoạch từng tính năng (Scope Freeze)
│       ├── TEMPLATE_FEATURE_PLAN.md
│       ├── upgrade_health_finance_model.md
│       └── community_marketplace_plan.md # Kế hoạch Chợ Kịch bản Cộng đồng (Network Moat)
├── frontend/
│   ├── index.html                    # Khung giao diện chính (4 Tabs + Modals)
│   ├── css/styles.css                # Hệ thống biến CSS Dual-Theme & Layout
│   └── js/
│       ├── state.js                  # Quản lý State tập trung (AppState), LocalStorage, Cloud Sync & Event Bus
│       ├── engine.js                 # Lõi tính toán dòng tiền, rút vốn, Stress Test, Optimal Age
│       ├── monteCarlo.js             # Mô phỏng 1,000 kịch bản (Mulberry32 Seed = 42)
│       ├── taxOptimizer.js           # Thuế Pháp/Mỹ/VN, Lương hưu Décote, Thác rút tiền
│       ├── patrimoine.js             # Quản lý BĐS LMNP Pháp, Điểm hòa vốn & Đội xe Turo
│       ├── scenarios.js              # Kịch bản What-If
│       ├── geminiAdvisor.js          # Tích hợp & Cache Data-Fingerprint cho Gemini AI
│       ├── auth.js                   # Đăng nhập, Đăng ký, Đồng bộ đám mây
│       ├── i18n.js                   # Từ điển đa ngôn ngữ (VI, EN, FR)
│       ├── export.js                 # Xuất PDF, CSV, JSON
│       ├── ui-modals.js              # Tầng 3 UI: Quản lý toàn bộ Modal & 4-Step Quick Setup Wizard
│       ├── ui-tab1-charts.js         # Tầng 3 UI (Tab 1A): Biểu đồ Tài sản/Dòng tiền, Cột mốc, Monte Carlo, Biến cố & Bảng năm
│       ├── ui-tab1-streams.js        # Tầng 3 UI (Tab 1B): Luồng Thu/Chi, Phân bổ tài sản, Lạm phát kép & 4 Chiến lược rút vốn
│       ├── ui-tab2-health.js         # Tầng 3 UI (Tab 2): Tuổi sinh học, Healthspan, Chăm sóc tuổi già, Con cái CAF & Y tế Pháp-VN
│       ├── ui-tab3-taxes.js          # Tầng 3 UI (Tab 3): Tối ưu Thuế Pháp/Việt/Mỹ, PEA/AV/Livret A, Lương hưu & BĐS LMNP
│       ├── community-seed.js         # 6 Kịch bản thực chiến offline chuẩn mực
│       ├── community.js              # Tầng 3 UI (Tab 4): Chợ Kịch bản Cộng đồng, Smart Forking, Filter & Upvote
│       └── ui.js                     # Tầng 3 UI: Nhạc trưởng điều phối trung tâm (initApp, switchTab, updateAll, Tiền tệ, Theme)
└── backend/
    ├── main.py                       # FastAPI Endpoints (/api/auth, /api/plans, /api/patrimoine, /api/community, /api/ai)
    ├── auth.py                       # Xử lý SQLite thuần, PBKDF2-SHA256 & JWT
    └── config.py                     # Cấu hình môi trường & CORS
```

---

## 4. Mô Hình Dữ Liệu Chuẩn (Core Data Schema)
 
### 4.1. Cấu Trúc Đối Tượng Kế Hoạch Chuẩn (`Plan Schema`)
Dưới đây là cấu trúc JSON chuẩn của một đối tượng kế hoạch (`plan`) kết hợp đầy đủ cả **Tài chính**, **Sức khỏe** và **Hưu trí liên quốc gia**:

```json
{
  "id": "plan_franco_viet",
  "name": "Kế hoạch Franco-Viet FIRE",
  "currency": "EUR",
  "birthYear": 1997,
  "currentAge": 29,
  "retirementAge": 43,
  "lifeExpectancy": 85,
  "startWorkAge": 24,
  "gender": "male",
  "maritalStatus": "married",
  "taxParts": 3.0,
  "currentSavings": 10000,
  "annualSavings": 13500,
  "annualExpenses": 21240,
  "retirementExpenses": 12960,
  "retireLocation": "vietnam",
  "inflationRate": 4.0,
  "dualInflation": {
    "enabled": true,
    "inflationPre": 2.2,
    "inflationPost": 4.0,
    "eurVndInitialRate": 27500,
    "eurVndAnnualDrift": 1.2
  },
  "assetAllocation": {
    "stocks": 60,
    "bonds": 20,
    "realEstate": 20,
    "cash": 0
  },
  "assetReturns": {
    "stocks": 9.5,
    "bonds": 3.5,
    "realEstate": 6.5,
    "cash": 1.5
  },
  "withdrawalStrategy": "guyton_klinger",
  "enableWithdrawalStrategy": true,
  "initialWithdrawalRate": 4.0,
  "targetLegacy": 36000,
  "taxRegime": "france_vietnam",
  "enableFrenchPension": true,
  "enableFrenchDecote": true,
  "socialSecurityAge": 64,
  "socialSecurityAnnual": 18000,
  "enableSeniorCare": true,
  "seniorCareAge": 78,
  "seniorCareMonthly": 1000,
  "spendingPhases": {
    "enabled": true,
    "gogoAge": 60,
    "gogoFactor": 1.15,
    "slowgoAge": 75,
    "slowgoFactor": 0.90,
    "nogoFactor": 0.80
  },
  "familyPlan": {
    "enabled": true,
    "kidsCount": 2,
    "kid1Birth": 2022,
    "kid2Birth": 2025,
    "kidCostMonthly": 350,
    "kidUniMonthly": 900
  },
  "frenchAccounts": {
    "peaBalance": 35000,
    "peaCostBasis": 25000,
    "assuranceVieBalance": 10000,
    "avCostBasis": 8000,
    "livretABalance": 5000,
    "ctoBalance": 0
  },
  "healthProfile": {
    "rhr": "good",
    "bp": "optimal",
    "whtr": "optimal",
    "strength": "high",
    "habits": {
      "exercise": true,
      "sleep": true,
      "diet": true,
      "checkup": true,
      "social": true
    },
    "smokingStatus": "never",
    "workStressLevel": "moderate",
    "estimatedBioAge": 27.5,
    "estimatedHealthspan": 78
  },
  "bhxhVnEnabled": true,
  "bhxhVnIncome": 10000000,
  "bhxhVnYears": 15,
  "bhxhVnStartAge": 29,
  "bhxhVnRetireAge": 62,
  "incomes": [],
  "expenses": [],
  "milestones": [],
  "actualRecords": []
}
```

### 4.2. Cấu Trúc Kịch Bản Chia Sẻ Cộng Đồng (`CommunityTemplate Schema`)
Cấu trúc bản ghi lưu trữ trên SQLite backend và đóng gói trong [`frontend/js/community-seed.js`](file:///Users/canhhung/Documents/pyRetrait/frontend/js/community-seed.js):

```json
{
  "id": "tpl_paris_it_fire",
  "title": "Kỹ sư IT 35 tuổi ngoại ô Paris: Tích lũy PEA + BĐS LMNP, mục tiêu FIRE tuổi 48",
  "authorNickname": "Huy Expat",
  "avatarSeed": "huy_paris",
  "location": "france",
  "targetAge": 48,
  "tags": ["france", "lmnp", "pea", "tech"],
  "story": "Chiến lược tích lũy kỷ luật 10 năm tại Pháp: lấp đầy trần PEA 150k€, đòn bẩy 1 căn studio LMNP tự trả nợ, hướng tới tự do tài chính tuổi 48.",
  "upvotes": 48,
  "forks": 19,
  "isNormalizedPercent": true,
  "createdAt": "2026-10-17T00:00:00Z",
  "planData": { "...kế hoạch đã được khử định danh và chuẩn hóa tỷ lệ %..." }
}
```

### 4.3. Cấu Trúc Trạng Thái Ứng Dụng Toàn Cục (`AppState Schema` trong `state.js`)

```json
{
  "activePlanId": "plan_franco_viet",
  "currency": "EUR",
  "viewMode": "nominal",
  "activeTab": "tab-projections",
  "compareWithdrawals": false,
  "compareStressScenarios": false,
  "showMonteCarloFan": false,
  "plans": {
    "plan_franco_viet": { "...Plan Schema..." }
  }
}
```

---

## 5. Lộ Trình Triển Khai & Nâng Cấp Theo Giai Đoạn (Milestones)

- **Phase 1 — Foundation & Core Engine (Đã hoàn thành)**: Khung giao diện Dual-Theme, mô phỏng dòng tiền cơ sở, 4 chiến lược rút tiền, biểu đồ Chart.js, đa ngôn ngữ `i18n.js` và lưu trữ đám mây SQLite.
- **Phase 2 — Franco-Viet Ecosystem & Patrimoine (Đã hoàn thành)**: Tích hợp BĐS LMNP Pháp, đội xe Turo, lương hưu Pháp Décote, BHXH tự nguyện Việt Nam, mô hình con cái CAF và Tab Sức khỏe & Y tế dự phòng.
- **Phase 3 — Đồng Bộ Sức Khỏe – Tài Chính & Chuẩn Hóa Toán Học (Đang triển khai — xem [`docs/plans/upgrade_health_finance_model.md`](file:///Users/canhhung/Documents/pyRetrait/docs/plans/upgrade_health_finance_model.md))**:
  - Khớp nối trực tiếp `estimatedHealthspan` từ Tab Sức khỏe vào `engine.js` (tự động điều chỉnh tuổi kích hoạt chăm sóc tuổi già và các chặng chi tiêu Go-Go/Slow-Go/No-Go).
  - Đồng bộ 100% dòng tiền chi tiết giữa `monteCarlo.js` và `engine.js`.
  - Chuẩn hóa công thức lạm phát 2 chặng EUR/VND, thuế hộ gia đình Pháp (`Quotient Familial`), tái đầu tư thặng dư rút vốn và lãi kép cho các tài khoản Pháp (`frenchAccounts`).
- **Phase 4 — Chợ Kịch Bản Cộng Đồng (Community Marketplace) & Hiệu Ứng Mạng Lưới (Network Moat — xem [`docs/plans/community_marketplace_plan.md`](file:///Users/canhhung/Documents/pyRetrait/docs/plans/community_marketplace_plan.md))**:
  - Bổ sung **Tab 4: Cộng đồng** trên giao diện chính, hiển thị thư viện kịch bản đa dạng với các bộ lọc thông minh (độ tuổi, địa điểm hồi hương, phong cách sống).
  - Đóng gói 6 kịch bản thực chiến kinh điển (Offline Seed Data) đảm bảo trải nghiệm tức thì ngay cả khi offline.
  - Cơ chế **Smart Forking (Nhân bản thông minh)**: Tự động điều chỉnh quy mô tài sản theo % tương ứng với tình hình thực tế của người dùng mới.
  - Tích hợp xuất bản ẩn danh với Chế độ bảo vệ tài chính kép (Nickname + Chuẩn hóa %) và bình chọn cộng đồng (Upvote/Fork counter) lưu trữ trên SQLite backend.
