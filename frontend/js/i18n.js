/**
 * pyRetrait — Internationalization (i18n) Engine
 * Hỗ trợ 3 ngôn ngữ: Tiếng Việt (vi), English (en), Français (fr)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'pyretrait_lang';
  const DEFAULT_LANG = 'vi';

  // Cấu hình danh sách ngôn ngữ hỗ trợ (dễ dàng mở rộng thêm N ngôn ngữ mới)
  const AVAILABLE_LANGUAGES = [
    { code: 'vi', label: 'Tiếng Việt', short: 'VI', flag: '🇻🇳' },
    { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', short: 'FR', flag: '🇫🇷' },
  ];
  const SUPPORTED_LANGS = AVAILABLE_LANGUAGES.map(l => l.code);

  const translations = {
    vi: {
      // Topbar Header
      "app_title": "pyRetrait — Hoạch định Độc lập Tài chính & Nghỉ hưu sớm (FIRE)",
      "brand_tagline": "Độc Lập Tài Chính",
      "plan_select_label": "Kế hoạch:",
      "quick_setup": "Thiết lập nhanh",
      "new_plan": "+ Mới",
      "duplicate_plan": "Nhân bản",
      "delete_plan": "Xóa",
      "formula_guide": "Công thức",
      "auth_login": "Đăng Nhập",
      "auth_account": "Tài khoản",
      "auth_synced": "Đã đồng bộ đám mây",
      "auth_logout": "Đăng xuất",
      "theme_toggle_title": "Chuyển đổi giao diện Sáng/Tối",

      // Navigation Sidebar
      "nav_projections": "Dòng tiền & Tài sản",
      "nav_projections_sub": "Thu nhập có đủ chi tiêu hay không?",
      "nav_insights": "Quản Lý Rủi Ro",
      "nav_insights_sub": "Kế hoạch có trụ vững trước rủi ro và biến cố không?",
      "nav_scenarios": "Kịch bản What-If",
      "nav_scenarios_sub": "Sẽ ra sao nếu bị bệnh hay thị trường khủng hoảng?",
      "nav_patrimoine": "Quản lý BĐS & Đội xe",
      "nav_patrimoine_sub": "Bất động sản sinh lời bao nhiêu mỗi tháng?",
      "nav_tax": "Tối ưu Thuế & Roth",
      "nav_tax_sub": "Làm sao giữ lại tối đa tiền sau thuế?",
      "nav_milestones": "Cột Mốc Cuộc Đời",
      "nav_milestones_sub": "Khi nào mua nhà, sinh con hay tất toán nợ?",
      "nav_table": "Bảng Dòng Tiền Hàng Năm",
      "nav_table_sub": "Dòng tiền chi tiết từng năm đến cuối đời",
      "nav_family": "Sức Khỏe & Y Tế Dự Phòng",
      "nav_family_sub": "Làm sao sống thọ mà vẫn khỏe mạnh độc lập?",
      "nav_gemini": "Tư Vấn Trí Tuệ Gemini AI",
      "nav_gemini_sub": "Chiến lược nào tối ưu nhất cho hoàn cảnh của bạn?",
      "nav_export": "Xuất Dữ Liệu Báo Cáo",
      "nav_export_sub": "In báo cáo tài chính hưu trí PDF hoặc Excel",

      // Top KPIs
      "kpi_current_networth": "Tài sản ròng hiện tại",
      "kpi_peak_networth": "Tài sản lúc Nghỉ hưu",
      "kpi_safe_spend": "Chi tiêu an toàn/năm (SWR)",
      "kpi_estate_end": "Tài sản thừa kế dự kiến (85t)",

      // Column Headers
      "col1_income_header": "Các Luồng Thu Nhập",
      "col2_expense_header": "Các Luồng Chi Tiêu",
      "btn_add_income": "+ Thêm thu nhập",
      "btn_add_expense": "+ Thêm khoản chi",
      "card_withdrawal_strategy": "Chiến Lược Rút Tiền Hưu Trí",
      "card_asset_allocation": "Phân bổ Danh mục & Tái cân bằng",
      "card_french_pension": "Lương hưu Pháp (Agirc-Arrco / CNAV)",
      "card_vn_pension": "Lương hưu BHXH Tự Nguyện Việt Nam",
      "card_lmnp_turo": "Doanh thu BĐS LMNP & Cho thuê xe Turo",
      "card_senior_care": "Dự phòng Chăm sóc Tuổi Già (78t+)",
      "card_family_plan": "Kế Hoạch Con Cái & Gia Đình",
      "card_estate_legacy": "Kế Hoạch Thừa Kế & Đánh Giá Mục Tiêu Di Sản",
      "card_healthspan_title": "Chỉ Số Tuổi Thọ Khỏe Mạnh (Healthspan vs Lifespan)",
      "card_preventive_budget_title": "Hoạch Định Ngân Sách Y Tế Dự Phòng Theo Độ Tuổi",
      "card_health_roadmap_title": "Lộ Trình Tầm Soát Y Tế Vàng Theo Mốc Tuổi",

      // Parameters
      "param_current_age": "Tuổi hiện tại",
      "param_birth_year": "Năm sinh",
      "param_retire_age": "Tuổi nghỉ hưu mục tiêu",
      "param_life_expectancy": "Kỳ vọng sống",
      "param_current_savings": "Tiết kiệm & Đầu tư hiện có",
      "param_monthly_savings": "Tiết kiệm hàng tháng",
      "param_savings_rate": "Tỷ lệ Tiết kiệm",
      "param_return_pre": "Lợi nhuận trước hưu (%/năm)",
      "param_return_post": "Lợi nhuận sau hưu (%/năm)",
      "param_inflation": "Lạm phát dự kiến (%/năm)",
      "param_target_legacy": "Mục tiêu di sản (để lại con cháu)",
      "param_tax_rate": "Thuế suất dự kiến (%)",

      // Charts
      "chart_networth_title": "Biểu đồ Tăng trưởng Tài sản Ròng (Net Worth Trajectory)",
      "chart_cashflow_title": "Dòng tiền Hàng năm (Cash-Flow Projections)",
      "chart_income_label": "Thu nhập Hàng năm",
      "chart_expense_label": "Chi tiêu Sinh hoạt",
      "chart_fire_target": "Mục tiêu FIRE Nest Egg",

      // Actions & Generic
      "btn_edit": "Sửa",
      "btn_delete": "Xóa",
      "btn_save": "Lưu",
      "btn_cancel": "Hủy",
      "btn_close": "Đóng",
      "status_active": "Đang bật",
      "status_inactive": "Chưa kích hoạt",
      "strategy_active": "Lan can Guyton-Klinger",
      "strategy_inactive": "Rút theo thực tế",
      "strategy_inactive_desc": "Chưa kích hoạt chiến lược rút tiền • Danh mục chỉ bù đắp chi tiêu sinh hoạt",
      "badge_dual_inflation_active": "2 Chặng",
      "hint_dual_inflation_active": "Đang áp dụng mô hình Lạm phát 2 chặng bên dưới",
      "lbl_property_name": "Tên BĐS (Định danh)",
      "lbl_property_category": "Hình thức BĐS",
      "opt_property_apartment": "Căn hộ chung cư (Copropriété)",
      "opt_property_house": "Nhà mặt đất (Maison individuelle)",
      "lbl_property_typology": "Loại phân hạng",
      "lbl_property_appreciation": "Tỷ lệ điều chỉnh tăng trưởng/năm (%)",
      "summary_optimal_age": "Tuổi tối ưu:",
      "nav_feature_intro": "Tính năng",
      "nav_feature_intro_title": "Khám phá các tính năng cốt lõi của pyRetrait",
      "intro_modal_badge": "KHÁM PHÁ PYRETRAIT",
      "intro_modal_title": "pyRetrait Giúp Bạn Giải Quyết Những Bài Toán Nào?",
      "intro_modal_subtitle": "La bàn tài chính chuẩn xác giúp bạn trả lời những câu hỏi quan trọng nhất cho cuộc sống tự do và an tâm.",
      "intro_q1": "Làm sao để biết chính xác dòng tiền và tài sản ròng của bạn trong 30–50 năm tới?",
      "intro_a1": "Mô phỏng toàn diện dòng tiền theo từng năm cuộc đời: thu nhập, tích lũy, lãi kép đầu tư và chi phí sinh hoạt đến tuổi 100.",
      "intro_tag1": "DÒNG TIỀN & TÀI SẢN",
      "intro_q2": "Làm sao biết được độ tuổi sớm nhất bạn có thể nghỉ hưu mà không bao giờ cạn tiền?",
      "intro_a2": "Tự động tính Điểm chạm Tự do Tài chính (FIRE Number) và Tuổi nghỉ hưu tối ưu khi tài sản sinh lời đủ bù đắp 100% chi tiêu sống.",
      "intro_tag2": "TUỔI NGHỈ HƯU TỐI ƯU",
      "intro_q3": "Nếu có con cái hay người phụ thuộc, nguồn thu nhập có thể bù đắp chu toàn?",
      "intro_a3": "Mô phỏng chi phí nuôi dạy con theo độ tuổi (0–18 tuổi), quỹ học đại học và chi phí chăm sóc y tế tuổi già (78 tuổi trở lên).",
      "intro_tag3": "GIA ĐÌNH & CON CÁI",
      "intro_q4": "Làm sao để rút tiền từ các khoản đầu tư mà không làm hao hụt di sản tương lai?",
      "intro_a4": "Tích hợp 4 chiến lược rút tiền khoa học (Guyton-Klinger có lan can phòng hộ, Bengen 4%, VPW, Fixed %) bảo vệ vốn gốc cho thế hệ sau.",
      "intro_tag4": "CHIẾN LƯỢC RÚT TIỀN",
      "intro_q5": "Làm sao an tâm kế hoạch không bị lạm phát bào mòn hay sụp đổ trước khủng hoảng?",
      "intro_a5": "Kiểm tra độ bền danh mục với 1.000 kịch bản ngẫu nhiên Monte Carlo và mô hình Lạm phát 2 chặng EUR/VND trước mọi biến động thị trường.",
      "intro_tag5": "MONTE CARLO & LẠM PHÁT",
      "intro_q6": "Làm sao định giá đúng BĐS (nhà đất vs chung cư hao mòn) và tối ưu hóa thuế?",
      "intro_a6": "Thuật toán tách biệt tăng trưởng đất với khấu hao công trình chung cư sau 30 năm; tích hợp biểu thuế lũy tiến Pháp, Mỹ và Việt Nam.",
      "intro_tag6": "BẤT ĐỘNG SẢN & THUẾ",
      "intro_btn_start": "Bắt Đầu Hoạch Định Ngay",
      "intro_footer_note": "Hoàn toàn miễn phí • Tính toán 100% trên trình duyệt của bạn • Dữ liệu bảo mật tuyệt đối",
      "lbl_alloc_cash": "Tiền mặt / Thanh khoản chờ đầu tư (Tài khoản thanh toán, Cash)",
      "lbl_alloc_cash_short": "TM"
    },

    en: {
      // Topbar Header
      "app_title": "pyRetrait — Financial Independence & Early Retirement (FIRE) Planner",
      "brand_tagline": "Financial Independence",
      "plan_select_label": "Plan:",
      "quick_setup": "Quick Setup",
      "new_plan": "+ New",
      "duplicate_plan": "Duplicate",
      "delete_plan": "Delete",
      "formula_guide": "Formulas",
      "auth_login": "Sign In",
      "auth_account": "Account",
      "auth_synced": "Cloud Synced",
      "auth_logout": "Sign Out",
      "theme_toggle_title": "Toggle Light/Dark Theme",

      // Navigation Sidebar
      "nav_projections": "Cash Flow & Wealth",
      "nav_projections_sub": "Will your income cover all expenses?",
      "nav_insights": "Risk Management",
      "nav_insights_sub": "Will your plan survive market shocks & crises?",
      "nav_scenarios": "What-If Scenarios",
      "nav_scenarios_sub": "What if you get sick or markets crash?",
      "nav_patrimoine": "Real Estate & Cars",
      "nav_patrimoine_sub": "How much net rental cash flow every month?",
      "nav_tax": "Tax & Roth Optimization",
      "nav_tax_sub": "How to legally minimize taxes and keep more wealth?",
      "nav_milestones": "Life Milestones",
      "nav_milestones_sub": "When to buy a home, have kids, or clear debt?",
      "nav_table": "Annual Cash Flow Table",
      "nav_table_sub": "Detailed cash flow projection year by year",
      "nav_family": "Health & Longevity",
      "nav_family_sub": "How to stay healthy & independent in old age?",
      "nav_gemini": "Gemini AI Advisor",
      "nav_gemini_sub": "What is the optimal strategy for your situation?",
      "nav_export": "Export Reports",
      "nav_export_sub": "Export retirement financial report to PDF/Excel",

      // Top KPIs
      "kpi_current_networth": "Current Net Worth",
      "kpi_peak_networth": "Net Worth at Retirement",
      "kpi_safe_spend": "Safe Annual Spending (SWR)",
      "kpi_estate_end": "Projected Estate (Age 85)",

      // Column Headers
      "col1_income_header": "Income Streams",
      "col2_expense_header": "Expense Streams",
      "btn_add_income": "+ Add Income",
      "btn_add_expense": "+ Add Expense",
      "card_withdrawal_strategy": "Retirement Withdrawal Strategy",
      "card_asset_allocation": "Asset Allocation & Rebalancing",
      "card_french_pension": "French Pension (Agirc-Arrco / CNAV)",
      "card_vn_pension": "Vietnam Voluntary Social Security Pension",
      "card_lmnp_turo": "LMNP Real Estate & Turo Fleet Income",
      "card_senior_care": "Senior Long-Term Care Reserve (Age 78+)",
      "card_family_plan": "Children & Family Planning",
      "card_estate_legacy": "Estate Planning & Legacy Milestone",
      "card_healthspan_title": "Healthspan & Longevity Score",
      "card_preventive_budget_title": "Preventive Healthcare Budget by Age",
      "card_health_roadmap_title": "Preventive Health Milestones Roadmap",

      // Parameters
      "param_current_age": "Current Age",
      "param_birth_year": "Birth Year",
      "param_retire_age": "Target Retirement Age",
      "param_life_expectancy": "Life Expectancy",
      "param_current_savings": "Current Savings & Investments",
      "param_monthly_savings": "Monthly Savings",
      "param_savings_rate": "Savings Rate",
      "param_return_pre": "Pre-Retirement Return (%/yr)",
      "param_return_post": "Post-Retirement Return (%/yr)",
      "param_inflation": "Expected Inflation (%/yr)",
      "param_target_legacy": "Target Legacy Estate",
      "param_tax_rate": "Expected Effective Tax Rate (%)",

      // Charts
      "chart_networth_title": "Net Worth Trajectory Chart",
      "chart_cashflow_title": "Annual Cash-Flow Projections",
      "chart_income_label": "Annual Income",
      "chart_expense_label": "Living Expenses",
      "chart_fire_target": "FIRE Target Nest Egg",

      // Actions & Generic
      "btn_edit": "Edit",
      "btn_delete": "Delete",
      "btn_save": "Save",
      "btn_cancel": "Cancel",
      "btn_close": "Close",
      "status_active": "Active",
      "status_inactive": "Inactive",
      "strategy_active": "Guyton-Klinger Guardrails",
      "strategy_inactive": "Expense-Matching",
      "strategy_inactive_desc": "Withdrawal strategy inactive • Portfolio covers living deficit only",
      "badge_dual_inflation_active": "2-Stage",
      "hint_dual_inflation_active": "Applying 2-stage inflation model below",
      "lbl_property_name": "Property Name (Identifier)",
      "lbl_property_category": "Property Category",
      "opt_property_apartment": "Apartment / Condominium",
      "opt_property_house": "Single-Family House / Villa",
      "lbl_property_typology": "Typology",
      "lbl_property_appreciation": "Annual Appreciation/Depreciation (%)",
      "summary_optimal_age": "Optimal Age:",
      "nav_feature_intro": "Features",
      "nav_feature_intro_title": "Discover core features of pyRetrait",
      "intro_modal_badge": "DISCOVER PYRETRAIT",
      "intro_modal_title": "What Financial Questions Does pyRetrait Answer?",
      "intro_modal_subtitle": "Your mathematical compass to navigate financial independence and early retirement with confidence.",
      "intro_q1": "How will your cash flows and net worth evolve over the next 30 to 50 years?",
      "intro_a1": "Comprehensive year-by-year modeling of your net worth, savings, compound returns, and living expenses up to age 100.",
      "intro_tag1": "CASH FLOW & NET WORTH",
      "intro_q2": "At what earliest age can you safely retire without ever running out of money?",
      "intro_a2": "Automatically computes your Financial Independence (FIRE) crossover point and optimal retirement age based on safe asset returns.",
      "intro_tag2": "OPTIMAL RETIREMENT AGE",
      "intro_q3": "If you have children or dependents, will your income cover their upbringing?",
      "intro_a3": "Simulates child-rearing costs by age bracket (0–18 years), university education funds, and later-life healthcare reserves (age 78+).",
      "intro_tag3": "FAMILY & DEPENDENTS",
      "intro_q4": "How can you withdraw investment funds in retirement without depleting your legacy?",
      "intro_a4": "Implements 4 dynamic withdrawal strategies (Guyton-Klinger guardrails, Bengen 4%, VPW, Fixed %) to preserve principal for heirs.",
      "intro_tag4": "WITHDRAWAL STRATEGIES",
      "intro_q5": "Can your portfolio withstand soaring inflation and severe market crashes?",
      "intro_a5": "Stress-tests your wealth across 1,000 Monte Carlo runs and 2-stage inflation models (EUR/VND) through historical bear markets.",
      "intro_tag5": "MONTE CARLO & INFLATION",
      "intro_q6": "How to evaluate real estate (houses vs aging apartments) and minimize taxes?",
      "intro_a6": "Separates land appreciation from 30-year building depreciation for condos; integrates progressive tax brackets for FR, US, and VN.",
      "intro_tag6": "REAL ESTATE & TAXES",
      "intro_btn_start": "Get Started Now",
      "intro_footer_note": "100% Free • Runs locally in your browser • Absolute data privacy",
      "lbl_alloc_cash": "Cash / Uninvested Liquidity (Checking account, Cash)",
      "lbl_alloc_cash_short": "Cash"
    },

    fr: {
      // Topbar Header
      "app_title": "pyRetrait — Planificateur d'Indépendance Financière & Retraite Anticipée (FIRE)",
      "brand_tagline": "Indépendance Financière",
      "plan_select_label": "Plan :",
      "quick_setup": "Configuration Rapide",
      "new_plan": "+ Nouveau",
      "duplicate_plan": "Dupliquer",
      "delete_plan": "Supprimer",
      "formula_guide": "Formules",
      "auth_login": "Connexion",
      "auth_account": "Compte",
      "auth_synced": "Synchronisé Cloud",
      "auth_logout": "Déconnexion",
      "theme_toggle_title": "Basculer Thème Clair/Sombre",

      // Navigation Sidebar
      "nav_projections": "Flux & Patrimoine",
      "nav_projections_sub": "Vos revenus couvriront-ils vos dépenses ?",
      "nav_insights": "Gestion des Risques",
      "nav_insights_sub": "Le plan résistera-t-il aux crises et aléas ?",
      "nav_scenarios": "Scénarios What-If",
      "nav_scenarios_sub": "Que se passe-t-il en cas de maladie ou de crise ?",
      "nav_patrimoine": "Immobilier & Flotte Auto",
      "nav_patrimoine_sub": "Combien rapporte votre immobilier par mois ?",
      "nav_tax": "Fiscalité & Optimisation",
      "nav_tax_sub": "Comment préserver vos gains après impôts ?",
      "nav_milestones": "Étapes de Vie",
      "nav_milestones_sub": "Quand acheter, avoir des enfants ou solder vos prêts ?",
      "nav_table": "Tableau des Flux Annuels",
      "nav_table_sub": "Flux de trésorerie détaillés année par année",
      "nav_family": "Santé & Longévité",
      "nav_family_sub": "Comment vieillir en bonne santé et autonome ?",
      "nav_gemini": "Conseiller IA Gemini",
      "nav_gemini_sub": "Quelle est la meilleure stratégie pour votre profil ?",
      "nav_export": "Exportation & Rapports",
      "nav_export_sub": "Exporter votre bilan de retraite en PDF ou Excel",

      // Top KPIs
      "kpi_current_networth": "Patrimoine Net Actuel",
      "kpi_peak_networth": "Patrimoine à la Retraite",
      "kpi_safe_spend": "Dépense Annuelle Sûre (SWR)",
      "kpi_estate_end": "Succession Prévue (85 ans)",

      // Column Headers
      "col1_income_header": "Flux de Revenus",
      "col2_expense_header": "Flux de Dépenses",
      "btn_add_income": "+ Ajouter un revenu",
      "btn_add_expense": "+ Ajouter une dépense",
      "card_withdrawal_strategy": "Stratégie de Retrait Retraite",
      "card_asset_allocation": "Allocation d'Actifs & Rééquilibrage",
      "card_french_pension": "Retraite Française (Agirc-Arrco / CNAV)",
      "card_vn_pension": "Retraite Volontaire Vietnam (BHXH)",
      "card_lmnp_turo": "Revenus Immobiliers LMNP & Flotte Turo",
      "card_senior_care": "Réserve Dépendance & EHPAD (78+ ans)",
      "card_family_plan": "Plan Enfants & Famille",
      "card_estate_legacy": "Planification Successorale & Transmission",
      "card_healthspan_title": "Score d'Espérance de Vie en Bonne Santé",
      "card_preventive_budget_title": "Budget Santé Préventive par Âge",
      "card_health_roadmap_title": "Calendrier des Bilans de Santé Préventifs",

      // Parameters
      "param_current_age": "Âge actuel",
      "param_birth_year": "Année de naissance",
      "param_retire_age": "Âge de départ en retraite",
      "param_life_expectancy": "Espérance de vie",
      "param_current_savings": "Épargne & Investissements actuels",
      "param_monthly_savings": "Épargne mensuelle",
      "param_savings_rate": "Taux d'épargne",
      "param_return_pre": "Rendement avant retraite (%/an)",
      "param_return_post": "Rendement après retraite (%/an)",
      "param_inflation": "Inflation anticipée (%/an)",
      "param_target_legacy": "Objectif de succession",
      "param_tax_rate": "Taux effectif d'imposition prévu (%)",

      // Charts
      "chart_networth_title": "Trajectoire du Patrimoine Net (Net Worth)",
      "chart_cashflow_title": "Projections des Flux Annuels (Cash-Flow)",
      "chart_income_label": "Revenu Annuel",
      "chart_expense_label": "Dépenses de Vie",
      "chart_fire_target": "Objectif de Capital FIRE",

      // Actions & Generic
      "btn_edit": "Modifier",
      "btn_delete": "Supprimer",
      "btn_save": "Enregistrer",
      "btn_cancel": "Annuler",
      "btn_close": "Fermer",
      "status_active": "Actif",
      "status_inactive": "Inactif",
      "strategy_active": "Gardes-Fous Guyton-Klinger",
      "strategy_inactive": "Retrait au Réel",
      "strategy_inactive_desc": "Stratégie inactive • Le portefeuille couvre uniquement le déficit de vie",
      "badge_dual_inflation_active": "2 Étapes",
      "hint_dual_inflation_active": "Modèle d'inflation en 2 étapes appliqué ci-dessous",
      "lbl_property_name": "Nom du Bien (Identifiant)",
      "lbl_property_category": "Type de Propriété",
      "opt_property_apartment": "Appartement en Copropriété",
      "opt_property_house": "Maison Individuelle / Villa",
      "lbl_property_typology": "Typologie",
      "lbl_property_appreciation": "Ajustement Plus-value Annuelle (%)",
      "summary_optimal_age": "Âge Optimal :",
      "nav_feature_intro": "Fonctionnalités",
      "nav_feature_intro_title": "Découvrir les fonctionnalités clés de pyRetrait",
      "intro_modal_badge": "DÉCOUVRIR PYRETRAIT",
      "intro_modal_title": "Quelles Questions Financières pyRetrait Résout-il ?",
      "intro_modal_subtitle": "Votre boussole financière rigoureuse pour planifier votre indépendance financière et votre retraite en toute sérénité.",
      "intro_q1": "Comment anticiper vos flux de trésorerie et votre patrimoine sur 30 à 50 ans ?",
      "intro_a1": "Modélisation annuelle détaillée du patrimoine net, de l'épargne, des intérêts composés et du train de vie jusqu'à 100 ans.",
      "intro_tag1": "FLUX & PATRIMOINE",
      "intro_q2": "À quel âge pouvez-vous partir à la retraite sans jamais manquer d'argent ?",
      "intro_a2": "Calcule automatiquement votre point de bascule FIRE et votre âge de départ optimal quand les rendements couvrent 100% de vos dépenses.",
      "intro_tag2": "ÂGE OPTIMAL DE RETRAITE",
      "intro_q3": "Avec des enfants à charge, vos revenus suffiront-ils à couvrir toutes les dépenses ?",
      "intro_a3": "Intègre le coût d'éducation par tranche d'âge (0–18 ans), les études supérieures et la réserve dépendance/santé pour le grand âge (78 ans+).",
      "intro_tag3": "FAMILLE & ENFANTS",
      "intro_q4": "Comment effectuer des retraits réguliers sans amputer votre héritage patrimonial ?",
      "intro_a4": "Propose 4 stratégies dynamiques (garde-fous de Guyton-Klinger, règle des 4% Bengen, VPW, % fixe) pour préserver le capital transmis.",
      "intro_tag4": "STRATÉGIES DE RETRAIT",
      "intro_q5": "Votre plan résistera-t-il à une forte inflation ou à des crises boursières sévères ?",
      "intro_a5": "Test de résistance sur 1 000 trajectoires Monte Carlo et modèle d'inflation à 2 paliers (EUR/VND) face aux pires baisses de marché.",
      "intro_tag5": "MONTE CARLO & INFLATION",
      "intro_q6": "Comment valoriser l'immobilier (maison vs copropriété amortie) et optimiser la fiscalité ?",
      "intro_a6": "Distingue la prise de valeur du foncier de l'amortissement du bâti sur 30 ans pour les appartements; intègre les barèmes fiscaux FR, US et VN.",
      "intro_tag6": "IMMOBILIER & FISCALITÉ",
      "intro_btn_start": "Commencer Dès Maintenant",
      "intro_footer_note": "100% Gratuit • Calculs locaux dans votre navigateur • Confidentialité absolue",
      "lbl_alloc_cash": "Liquidités / Trésorerie non investie (Compte courant, Cash)",
      "lbl_alloc_cash_short": "Liq"
    }
  };

  let currentLang = DEFAULT_LANG;

  function getSavedLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGS.includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.warn("Could not read language from localStorage:", e);
    }
    return DEFAULT_LANG;
  }

  function t(key, fallback = '') {
    const langDict = translations[currentLang] || translations[DEFAULT_LANG];
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    const defaultDict = translations[DEFAULT_LANG];
    if (defaultDict && defaultDict[key] !== undefined) {
      return defaultDict[key];
    }
    return fallback || key;
  }

  function applyLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
    currentLang = lang;

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn("Could not save language to localStorage:", e);
    }

    // Set document lang attribute
    document.documentElement.setAttribute('lang', lang);

    // Re-render language dropdown selector
    renderLanguageDropdown();

    // Translate DOM elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const text = t(key);
        if (text) el.textContent = text;
      }
    });

    // Translate title tooltips
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        const text = t(key);
        if (text) el.setAttribute('title', text);
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        const text = t(key);
        if (text) el.setAttribute('placeholder', text);
      }
    });

    // Dispatch event for other modules
    window.dispatchEvent(new CustomEvent('pyretrait:language-changed', { detail: { lang } }));
  }

  function setLanguage(lang) {
    applyLanguage(lang);
  }

  function renderLanguageDropdown() {
    const container = document.getElementById('lang-dropdown-container');
    const menu = document.getElementById('lang-dropdown-menu');
    const currentCode = document.getElementById('lang-current-code');
    if (!container || !menu) return;

    // Sinh danh sách ngôn ngữ động từ AVAILABLE_LANGUAGES
    menu.innerHTML = AVAILABLE_LANGUAGES.map(item => `
      <button type="button" class="lang-menu-item ${item.code === currentLang ? 'active' : ''}" data-lang="${item.code}" role="menuitem">
        <span class="lang-item-flag">${item.flag || ''}</span>
        <span class="lang-item-code">${item.short}</span>
        <span class="lang-item-label">${item.label}</span>
      </button>
    `).join('');

    const cur = AVAILABLE_LANGUAGES.find(l => l.code === currentLang);
    if (currentCode) {
      currentCode.textContent = cur ? cur.short : currentLang.toUpperCase();
    }
    const currentFlag = document.getElementById('lang-current-flag');
    if (currentFlag && cur && cur.flag) {
      currentFlag.textContent = cur.flag;
    }

    // Gắn sự kiện click cho từng mục ngôn ngữ
    menu.querySelectorAll('.lang-menu-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const code = btn.getAttribute('data-lang');
        if (code) {
          setLanguage(code);
          closeDropdown();
        }
      });
    });
  }

  function toggleDropdown() {
    const container = document.getElementById('lang-dropdown-container');
    const menu = document.getElementById('lang-dropdown-menu');
    const trigger = document.getElementById('lang-dropdown-btn');
    if (!container || !menu) return;

    const isOpen = container.classList.contains('open');
    if (isOpen) {
      closeDropdown();
    } else {
      container.classList.add('open');
      menu.classList.remove('hidden');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
    }
  }

  function closeDropdown() {
    const container = document.getElementById('lang-dropdown-container');
    const menu = document.getElementById('lang-dropdown-menu');
    const trigger = document.getElementById('lang-dropdown-btn');
    if (container) container.classList.remove('open');
    if (menu) menu.classList.add('hidden');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function init() {
    const lang = getSavedLanguage();
    applyLanguage(lang);

    const trigger = document.getElementById('lang-dropdown-btn');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown();
      });
    }

    document.addEventListener('click', (e) => {
      const container = document.getElementById('lang-dropdown-container');
      if (container && !container.contains(e.target)) {
        closeDropdown();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDropdown();
      }
    });
  }

  // Export module
  window.I18n = {
    t,
    setLanguage,
    getLanguage: () => currentLang,
    AVAILABLE_LANGUAGES,
    SUPPORTED_LANGS,
    init
  };

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
