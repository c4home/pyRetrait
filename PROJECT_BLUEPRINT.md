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
│   │   └── apple-theme.css           # Bổ sung kiểu dáng Apple Design & Human Interface Guidelines (nếu kích hoạt)
│   └── js/
│       ├── state.js                  # Quản lý State tập trung (AppState), LocalStorage, Cloud Sync & Event Bus
│       ├── engine.js                 # Lõi tính toán dòng tiền, rút vốn, Stress Test, Optimal Age
│       ├── monteCarlo.js             # Mô phỏng 1,000 kịch bản (Mulberry32 Seed = 42)
│       ├── taxOptimizer.js           # Thuế Pháp/Mỹ/VN, Lương hưu Pháp/BHXH VN/Đức/Mỹ, Thác rút tiền
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
├── tests/
│   └── test_plan_creation_ui.js      # Bộ kiểm thử tự động 42 tiêu chí logic & UI cho quy trình tạo kế hoạch mới
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
  "_schemaVersion": 1,
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
  "spouseBirthYear": 1997,
  "taxParts": 2.0,
  "workCountry": "FR",
  "workCity": "fr_paris",
  "retireMode": "relocate",
  "retireCountry": "VN",
  "retireCity": "vn_hcm_hn",
  "monthlyMortgagePaidOff": 0,
  "currentSavings": 10000,
  "annualSavings": 13500,
  "annualExpenses": 21240,
  "retirementExpenses": 12960,
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
  "frenchPensionDetails": {
    "spouse1": {
      "startWorkAge": 24,
      "claimAge": 64,
      "targetAnnualPension": 18000
    },
    "spouse2": {
      "startWorkAge": 25,
      "claimAge": 64,
      "targetAnnualPension": 16000
    }
  },
  "bhxhVnEnabled": true,
  "bhxhVnIncome": 10000000,
  "bhxhVnYears": 15,
  "bhxhVnStartAge": 29,
  "bhxhVnRetireAge": 62,
  "bhxhVnDetails": {
    "spouse1": {
      "gender": "male",
      "yearsContributed": 15,
      "monthlySalaryVnd": 10000000,
      "claimAge": 62
    },
    "spouse2": {
      "gender": "female",
      "yearsContributed": 15,
      "monthlySalaryVnd": 10000000,
      "claimAge": 60
    }
  },
  "enableGermanPension": true,
  "germanPensionDetails": {
    "spouse1": {
      "grossAnnualSalary": 45000,
      "yearsContributed": 35,
      "claimAge": 67
    },
    "spouse2": {
      "grossAnnualSalary": 38000,
      "yearsContributed": 35,
      "claimAge": 67
    }
  },
  "enableUsPension": true,
  "usPensionDetails": {
    "spouse1": {
      "grossAnnualSalary": 65000,
      "yearsWorked": 35,
      "claimAge": 67
    },
    "spouse2": {
      "grossAnnualSalary": 55000,
      "yearsWorked": 35,
      "claimAge": 67
    }
  },
  "enableJapanPension": true,
  "japanPensionDetails": {
    "spouse1": {
      "grossAnnualSalary": 4500000,
      "yearsContributed": 25,
      "claimAge": 65
    },
    "spouse2": {
      "grossAnnualSalary": 3500000,
      "yearsContributed": 20,
      "claimAge": 65
    }
  },
  "enableCanadaPension": true,
  "canadaPensionDetails": {
    "spouse1": {
      "grossAnnualSalary": 65000,
      "yearsContributed": 30,
      "yearsResident": 30,
      "claimAge": 65
    },
    "spouse2": {
      "grossAnnualSalary": 50000,
      "yearsContributed": 25,
      "yearsResident": 25,
      "claimAge": 65
    }
  },
  "enableAustraliaPension": true,
  "australiaPensionDetails": {
    "spouse1": {
      "grossAnnualSalary": 85000,
      "yearsWorked": 25,
      "superBalance": 250000,
      "claimAge": 67
    },
    "spouse2": {
      "grossAnnualSalary": 65000,
      "yearsWorked": 20,
      "superBalance": 180000,
      "claimAge": 67
    }
  },
  "enableKoreaPension": true,
  "koreaPensionDetails": {
    "spouse1": {
      "grossMonthlySalary": 3500000,
      "yearsContributed": 20,
      "claimAge": 65
    },
    "spouse2": {
      "grossMonthlySalary": 2800000,
      "yearsContributed": 15,
      "claimAge": 65
    }
  },
  "enableTaiwanPension": true,
  "taiwanPensionDetails": {
    "spouse1": {
      "insuredMonthlySalary": 45800,
      "yearsContributed": 20,
      "claimAge": 65
    },
    "spouse2": {
      "insuredMonthlySalary": 36000,
      "yearsContributed": 15,
      "claimAge": 65
    }
  },
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
  "healthProfiles": {
    "primary": {
      "habits": [true, true, true, false, true],
      "biomarkers": { "rhr": "good", "bp": "optimal", "whtr": "optimal", "strength": "high" }
    },
    "spouse": {
      "habits": [true, true, true, false, true],
      "biomarkers": { "rhr": "good", "bp": "optimal", "whtr": "optimal", "strength": "high" }
    }
  },
  "incomes": [],
  "expenses": [],
  "milestones": [],
  "actualRecords": []
}
```

### 4.2. Bảng Đặc Tả Chi Tiết Các Trường Dữ Liệu Mới (Data Dictionary & Fallback Rules)

Để đảm bảo tính nhất quán và tương thích ngược tuyệt đối với các kế hoạch đã lưu cũ trong `localStorage` và cơ sở dữ liệu SQLite, bảng dưới đây định nghĩa chi tiết từng trường dữ liệu mới:

| Tên trường (camelCase) | Kiểu dữ liệu | Đơn vị nội bộ | Giá trị mặc định | Diễn giải & Cơ chế tương thích ngược (Backward Compatibility) |
|---|---|---|---|---|
| `gender` | `string` | enum: `'male'`, `'female'` | `'male'` | Giới tính người lập kế hoạch. Quyết định tuổi nghỉ hưu chuẩn BHXH VN (Nam 62t, Nữ 60t), số năm đóng tối thiểu hưởng 45% (Nam 20 năm, Nữ 15 năm), và bảng chỉ số sinh học (Vòng eo/Chiều cao, Sức mạnh cơ bắp) ở Tab 2. |
| `maritalStatus` | `string` | enum: `'single'`, `'married'` | `'single'` | Tình trạng kế hoạch: Cá nhân (`'single'`) hoặc Cặp đôi/Vợ chồng (`'married'`). Nếu `'single'`, các ô nhập Bạn đời được ẩn và áp dụng thuế cá nhân (`taxParts = 1.0`). |
| `spouseBirthYear` | `number \| null` | Năm (YYYY) | `null` | Năm sinh Bạn đời. Nếu `null` hoặc ở chế độ `'single'`, tự động fallback an toàn về `birthYear` để tránh lỗi tính toán. |
| `taxParts` | `number` | Số thực (parts) | `1.0` (single) / `2.0` (married) | Số phần gia cảnh (Quotient Familial Pháp). Tự động cộng thêm 0.5 suất cho con thứ 1 & 2, +1.0 cho con thứ 3+. |
| `workCountry` | `string` | ISO-2 (`'FR'`, `'VN'`, `'US'`, `'DE'`) | `'FR'` | Quốc gia làm việc tích lũy chính. Quyết định chế độ thuế và nguồn lương hưu mặc định. |
| `workCity` | `string` | Tên mã định danh | `'fr_paris'` | Thành phố / khu vực làm việc (ảnh hưởng mức chi phí sinh hoạt trước hưu). |
| `retireMode` | `string` | enum: `'domestic'`, `'relocate'`, `'hybrid'` | `'relocate'` | Chế độ hưu trí: `'domestic'` (trong nước), `'relocate'` (chuyển quốc gia), `'hybrid'` (song hành 2 nơi). |
| `retireCountry` | `string` | ISO-2 (`'VN'`, `'FR'`, `'TH'`, `'US'`, `'DE'`) | `'VN'` | Quốc gia nghỉ hưu dự kiến. Quyết định rổ chi phí PPP và tỷ lệ lạm phát chặng sau. |
| `retireCity` | `string` | Tên mã định danh | `'vn_hcm_hn'` | Thành phố / vùng nghỉ hưu (ví dụ: `'vn_hcm_hn'`, `'vn_coastal'`). |
| `monthlyMortgagePaidOff` | `number` | EUR / tháng | `0` | Khoản nợ mua nhà dự kiến tất toán trước khi nghỉ hưu, dùng để trừ khỏi chi phí hưu trí khi đối chiếu dòng tiền. |
| `frenchPensionDetails` | `object` | JSON lồng | Xem bên dưới | Chi tiết lương hưu Pháp cho 2 vợ chồng (`spouse1` và `spouse2`). Fallback: lấy từ `socialSecurityAnnual` và `socialSecurityAge`. |
| `bhxhVnDetails` | `object` | JSON lồng | Xem bên dưới | Chi tiết BHXH VN cho 2 vợ chồng (`spouse1` và `spouse2`). Fallback: lấy từ `bhxhVnIncome`, `bhxhVnYears`, `bhxhVnRetireAge`. |
| `germanPensionDetails` | `object` | JSON lồng | Xem bên dưới | Chi tiết lương hưu Đức (Gesetzliche Rentenversicherung - DRV) cho 2 vợ chồng (`grossAnnualSalary`, `yearsContributed`, `claimAge`). |
| `usPensionDetails` | `object` | JSON lồng | Xem bên dưới | Chi tiết trợ cấp an sinh Mỹ (Social Security Administration - SSA) cho 2 vợ chồng (`grossAnnualSalary`, `yearsWorked`, `claimAge`). |
| `japanPensionDetails` | `object` | JSON lồng | Xem bên dưới | Chi tiết lương hưu Nhật Bản (Nenkin Kosei/Kokumin) cho 2 vợ chồng (`grossAnnualSalary`, `yearsContributed`, `claimAge`). |
| `canadaPensionDetails` | `object` | JSON lồng | Xem bên dưới | Chi tiết lương hưu Canada (CPP & OAS) cho 2 vợ chồng (`grossAnnualSalary`, `yearsContributed`, `yearsResident`, `claimAge`). |
| `australiaPensionDetails` | `object` | JSON lồng | Xem bên dưới | Chi tiết lương hưu Úc (Superannuation & Age Pension) cho 2 vợ chồng (`grossAnnualSalary`, `yearsWorked`, `superBalance`, `claimAge`). |
| `koreaPensionDetails` | `object` | JSON lồng | Xem bên dưới | Chi tiết lương hưu Quốc gia Hàn Quốc (NPS) cho 2 vợ chồng (`grossMonthlySalary`, `yearsContributed`, `claimAge`). |
| `taiwanPensionDetails` | `object` | JSON lồng | Xem bên dưới | Chi tiết lương hưu Đài Loan (Bảo hiểm Lao động & Quỹ hưu trí) cho 2 vợ chồng (`insuredMonthlySalary`, `yearsContributed`, `claimAge`). |
| `healthProfiles` | `object` | JSON lồng | Xem bên dưới | Chỉ số sức khỏe & thói quen sinh học độc lập cho cả Bạn (`primary`) và Bạn đời (`spouse`). |

- **Cơ chế Fallback an toàn trong `state.js`**:
  Khi nạp kế hoạch cũ (`loadPlan` hoặc `migratePlan`):
  - Nếu thiếu `gender`: Gán mặc định `'male'`.
  - Nếu thiếu `maritalStatus`: Gán mặc định `'single'`, `spouseBirthYear: null`.
  - Nếu `maritalStatus === 'married'`: Tự động suy luận giới tính bạn đời `spouseGender` ngược lại với người lập (`isFemale ? 'male' : 'female'`) nếu chưa được khai báo riêng.
  - Nếu thiếu `workCountry` / `retireCountry`: Suy luận từ `taxRegime` hoặc `retireLocation` (ví dụ `retireLocation === 'vietnam'` ➔ `workCountry: 'FR'`, `retireCountry: 'VN'`).
  - Nếu thiếu `frenchPensionDetails`: Khởi tạo tự động từ `socialSecurityAge` và `socialSecurityAnnual` cho `spouse1`.
  - Nếu thiếu `bhxhVnDetails`: Khởi tạo tự động từ `bhxhVnIncome`, `bhxhVnYears`, `bhxhVnRetireAge` cho `spouse1`.
  - Nếu `workCountry === retireCountry` hoặc `retireMode === 'domestic'`: Tự động đặt `isSingleCountry = true`, tắt tính năng trôi dạt tỷ giá (`eurVndAnnualDrift = 0`) và hợp nhất tỷ lệ lạm phát 1 chặng.

### 4.3. Cấu Trúc Kịch Bản Chia Sẻ Cộng Đồng (`CommunityTemplate Schema`)
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

### 4.4. Cấu Trúc Trạng Thái Ứng Dụng Toàn Cục (`AppState Schema` trong `state.js`)

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

### 4.5. Bảng Kiểm Toán Biến Số & Input Giao Diện (Input Audit & Dead Variables Register)

Kiểm toán tĩnh định kỳ (Static Code Audit) giữa giao diện HTML (`index.html`), tầng State (`state.js`) và tầng tính toán (`engine.js`, `taxOptimizer.js`):

| Nhóm | Tên Element / Biến | Vị trí xuất hiện | Tình trạng hiện tại | Hướng xử lý kiến trúc |
|---|---|---|---|---|
| **Lương Hưu Pháp 2 Cột** (Đã kết nối 2 chiều hoàn chỉnh) | `inp-pension-spouse1-start`<br>`inp-pension-spouse1-age`<br>`inp-pension-spouse1-base`<br>`inp-pension-spouse2-start`<br>`inp-pension-spouse2-age`<br>`inp-pension-spouse2-base` | `frontend/index.html` dòng 595–641 (Khu vực Cấu hình chi tiết lương hưu Pháp 2 cột song song `#french-inputs-body` ở Tab 1) | **Đã kết nối 2 chiều hoàn chỉnh** trong `ui-tab3-taxes.js` (`updatePensionDecoteUI` và `bindTab3Events`). Cho phép người dùng chỉnh độc lập tuổi đi làm, tuổi nhận hưu và lương chuẩn cho cả Bạn & Bạn đời, cập nhật tức thì số quý, Décote và dòng tiền toàn đời. | Đã hoàn thành. |
| **Checkbox Lương Hưu Quốc Tế** (Đã kích hoạt phản hồi tức thì) | `chk-enable-japan-pension`<br>`chk-enable-canada-pension`<br>`chk-enable-australia-pension`<br>`chk-enable-korea-pension`<br>`chk-enable-taiwan-pension` | `frontend/index.html` (Thẻ lương hưu quốc tế Tab 1 & Tab 3) | **Đã gắn listener `change` trực tiếp**, cập nhật `plan.enable[Country]Pension`, đồng bộ hiển thị và tính toán lại dòng tiền tức thì trong `engine.js` (không phân biệt quốc gia làm việc hiện tại). | Đã hoàn thành. |
| **Cosmetic Checkbox** (Chỉ đổi CSS, không lưu State) | `chk-enable-estate-legacy` | `frontend/index.html` dòng 3438, `ui-tab2-health.js` dòng 990 | Chỉ đổi opacity của card `card-estate-legacy-combined`, không lưu trạng thái vào `plan` và không ảnh hưởng tới `targetLegacy`. | Giữ nguyên nếu chỉ là hiệu ứng toggle trực quan, hoặc gán vào `plan.enableEstateLegacy` nếu người dùng muốn bật/tắt di sản mục tiêu. |
| **Static Checklists** (Checklist tĩnh không lưu trữ) | `chk-cross-vitale`<br>`chk-cross-cfe`<br>`chk-cross-ordonnance`<br>`chk-cross-espace`<br>`chk-cross-tiers` | `frontend/index.html` (Thẻ Y tế xuyên biên giới Tab 2) | Checklist tĩnh hỗ trợ ghi nhớ thủ tục hành chính, không có listener và không lưu vào `state.js`. | Giữ nguyên dưới dạng checklist hướng dẫn hoặc lưu vào `localStorage` nếu muốn nhớ trạng thái hoàn thành của người dùng. |
| **Derived / Display Input** (Chỉ hiển thị, không lưu) | `wz-cur-age` | `frontend/index.html`, `ui-modals.js` | Hiển thị tuổi tự động tính từ Năm sinh (`curYear - bYear`). Wizard chỉ đọc `wz-birth-year` để lưu vào plan. | Chuyển thành nhãn `<span>` hoặc giữ `<input readonly>` để người dùng dễ quan sát. |
| **Dead Schema Fields** (Trường cũ đã bị thay thế hoặc bỏ) | `benchmarkSpendingStandard`<br>`retireLocation`<br>`healthProfile` (số ít) | Đã từng có trong Blueprint cũ | `benchmarkSpendingStandard` đã được thay bằng bảng `COUNTRY_PPP_PROFILES`; `retireLocation` đã được thay bằng `retireCountry` + `retireCity` + `retireMode`; `healthProfile` đơn thể đã chuyển thành `healthProfiles` đa nhân. | Đã chính thức loại bỏ khỏi JSON Schema chuẩn tại mục 4.1. |

---

## 5. Lộ Trình Triển Khai & Nâng Cấp Theo Giai Đoạn (Milestones)

- **Phase 1 — Foundation & Core Engine (Đã hoàn thành)**: Khung giao diện Dual-Theme, mô phỏng dòng tiền cơ sở, 4 chiến lược rút tiền, biểu đồ Chart.js, đa ngôn ngữ `i18n.js` và lưu trữ đám mây SQLite.
- **Phase 2 — Franco-Viet Ecosystem & Patrimoine (Đã hoàn thành)**: Tích hợp BĐS LMNP Pháp, đội xe Turo, lương hưu Pháp Décote, BHXH tự nguyện Việt Nam, mô hình con cái CAF và Tab Sức khỏe & Y tế dự phòng.
- **Phase 3 — Đồng Bộ Sức Khỏe – Tài Chính & Chuẩn Hóa Toán Học (Đã hoàn thành)**:
  - Khớp nối trực tiếp `estimatedHealthspan` từ Tab Sức khỏe vào `engine.js` (tự động điều chỉnh tuổi kích hoạt chăm sóc tuổi già và các chặng chi tiêu Go-Go/Slow-Go/No-Go).
  - Đồng bộ 100% dòng tiền chi tiết giữa `monteCarlo.js` và `engine.js`.
  - Chuẩn hóa công thức lạm phát 2 chặng EUR/VND, thuế hộ gia đình Pháp (`Quotient Familial`), tái đầu tư thặng dư rút vốn và lãi kép cho các tài khoản Pháp (`frenchAccounts`).
- **Phase 4 — Chợ Kịch Bản Cộng Đồng (Community Marketplace) & Hiệu Ứng Mạng Lưới (Đã hoàn thành)**:
  - Bổ sung **Tab 4: Cộng đồng** trên giao diện chính, hiển thị thư viện kịch bản đa dạng với các bộ lọc thông minh (độ tuổi, địa điểm hồi hương, phong cách sống).
  - Đóng gói 6 kịch bản thực chiến kinh điển (Offline Seed Data) đảm bảo trải nghiệm tức thì ngay cả khi offline.
  - Cơ chế **Smart Forking (Nhân bản thông minh)**: Tự động điều chỉnh quy mô tài sản theo % tương ứng với tình hình thực tế của người dùng mới.
  - Tích hợp xuất bản ẩn danh với Chế độ bảo vệ tài chính kép (Nickname + Chuẩn hóa %) và bình chọn cộng đồng (Upvote/Fork counter) lưu trữ trên SQLite backend.
- **Phase 5 — Phân Hệ Vợ Chồng, PPP Đa Quốc Gia & 9 Hệ Thống Lương Hưu Toàn Cầu (Đã hoàn thành)**:
  - Mở rộng hỗ trợ cấu trúc Cá nhân (`single`) và Vợ Chồng / Cặp Đôi (`married`) với dòng tiền song hành độc lập (bạn & bạn đời).
  - Tích hợp **9 hệ thống an sinh xã hội & lương hưu quốc tế** vào `engine.js` và `taxOptimizer.js`:
    1. Pháp: CNAV & Agirc-Arrco (172 quý, phạt décote -1.25%/quý thiếu, xóa phạt tuổi 67).
    2. Việt Nam: BHXH tự nguyện / bắt buộc (Luật BHXH 2024: Nam 62t/20n, Nữ 60t/15n).
    3. Đức: DRV (Gesetzliche Rentenversicherung).
    4. Mỹ: SSA (Social Security Administration).
    5. Nhật Bản: Nenkin Kosei & Kokumin Nenkin.
    6. Canada: CPP (Canada Pension Plan) & OAS (Old Age Security).
    7. Úc: Superannuation & Age Pension.
    8. Hàn Quốc: NPS (National Pension Service).
    9. Đài Loan: Bảo hiểm Lao động & Quỹ hưu trí cá nhân.
  - Hệ thống dữ liệu PPP Đa Quốc Gia (`COUNTRY_PPP_PROFILES`) với hệ số chi phí sống, lạm phát chuẩn và tự động tính toán chi tiêu hưu trí thực tế từ thu nhập ròng trừ tiết kiệm và nợ nhà đã trả.
  - Tách biệt Tài sản thanh khoản (Liquid Networth - Cổ phiếu, Trái phiếu, Tiền mặt) khỏi Bất động sản / Tài sản cố định để đánh giá sức chịu đựng thực tế trước các cú sốc dòng tiền.
  - **Mô hình định giá BĐS chuẩn hóa**: Phân tách rõ ràng giữa **Nhà mặt đất** (tăng giá đều theo đất) và **Căn hộ chung cư** (khấu hao 80% giá trị xác nhà theo chu kỳ 30 năm).
  - Bộ kiểm thử tự động 42 tiêu chí logic & UI cho quy trình tạo kế hoạch mới (`tests/test_plan_creation_ui.js`).
- **Phase 6 — Tối Ưu Giao Diện Tinh Tế & Apple Human Interface Guidelines (Đang triển khai)**:
  - Hoàn thiện trải nghiệm thẩm mỹ cao cấp với cảm hứng từ Apple Design (typography Inter sắc nét, padding/spacing hài hòa, micro-interactions, modal bóng mờ thanh thoát).
  - Kiểm toán độ tương phản chuẩn WCAG AA trên cả Light Mode và Dark Mode, chống chữ mờ/bạc màu trên nền sáng.
  - Tiếp tục tinh giản thuật ngữ chuyên ngành (Plain Language) hướng tới 100,000+ người dùng phổ thông.
