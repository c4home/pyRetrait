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
      "app_title": "pyRetrait — Hoạch định Tự do Tài chính & Nghỉ hưu sớm",
      "brand_tagline": "Tự Do Tài Chính",
      "plan_select_label": "Kế hoạch:",
      "quick_setup": "Thiết lập nhanh",
      "new_plan": "+ Mới",
      "duplicate_plan": "Nhân bản",
      "delete_plan": "Xóa",
      "formula_guide": "Công thức",
      "auth_login": "Kết Nối",
      "auth_account": "Tài khoản",
      "auth_synced": "Đã đồng bộ đám mây",
      "auth_logout": "Đăng xuất",
      "auth_logout_confirm": "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?",
      "theme_toggle_title": "Chuyển đổi giao diện Sáng/Tối",

      // Navigation Sidebar
      "nav_projections": "Dòng tiền & Tài sản",
      "nav_projections_sub": "Thu nhập có đủ chi tiêu hay không?",
      "nav_insights": "Quản Lý Rủi Ro",
      "nav_insights_sub": "Kế hoạch có trụ vững trước rủi ro và biến cố không?",
      "nav_scenarios": "Kịch bản What-If",
      "nav_scenarios_sub": "Sẽ ra sao nếu bị bệnh hay thị trường khủng hoảng?",
      "nav_patrimoine": "Bất động sản & Đội xe",
      "nav_patrimoine_sub": "Bất động sản sinh lời bao nhiêu mỗi tháng?",
      "nav_tax": "Lời Khuyên",
      "nav_tax_sub": "Tiêu dùng bền vững & Công cụ tài chính",
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
      "kpi_safe_spend": "Rút vốn năm đầu hưu trí",
      "kpi_estate_end": "Tài sản thừa kế dự kiến (85t)",

      // Column Headers
      "section_plan_target": "Kế hoạch dành cho",
      "col1_income_header": "Các Luồng Thu Nhập",
      "col2_expense_header": "Các Luồng Chi Tiêu",
      "btn_add_income": "+ Thêm thu nhập",
      "btn_add_expense": "+ Thêm khoản chi",
      "income_salary_primary": "Lương hiện tại của bạn",
      "income_salary_spouse": "Lương hiện tại của bạn đời",
      "badge_primary_salary": "Bạn",
      "badge_spouse_salary": "Bạn đời",
      "placeholder_income_name": "Ví dụ: Lương hiện tại của bạn, Lương bạn đời, Bất động sản cho thuê, Cổ tức ETF...",
      "card_withdrawal_strategy": "Cơ Chế Rút Vốn Hưu Trí",
      "card_asset_allocation": "Danh mục đầu tư",
      "card_inflation_domestic": "Lạm phát chi tiêu",
      "card_inflation_crossborder": "Lạm phát 2 Chặng & Tỷ giá EUR/VND",
      "card_retire_badge_ppp": "Quy đổi PPP",
      "lbl_current_savings": "Tài sản ròng đầu tư hiện có",
      "card_french_pension": "Lương hưu Pháp (Agirc-Arrco / CNAV)",
      "card_german_pension": "Lương hưu Đức (Gesetzliche Rentenversicherung)",
      "card_us_pension": "Lương hưu An sinh Mỹ (Social Security SSA)",
      "card_japan_pension": "Lương hưu Nhật Bản (Nenkin 2 tầng)",
      "card_canada_pension": "Lương hưu Canada (CPP & OAS)",
      "card_australia_pension": "Lương hưu Úc (Superannuation & Age Pension)",
      "card_korea_pension": "Lương hưu Quốc gia Hàn Quốc (NPS - 국민연금)",
      "card_taiwan_pension": "Lương hưu Đài Loan (Bảo hiểm & Hưu trí Lao động)",
      "card_vn_pension": "Lương hưu BHXH Tự Nguyện Việt Nam",
      "callout_pension_unsupported_title": "Chưa có mô hình hưu trí tự động",
      "callout_pension_unsupported_desc": "pyRetrait hiện chưa có mô hình tính toán lương hưu tự động theo luật của quốc gia này. Bạn có thể ước tính riêng và bổ sung trực tiếp khoản lương hưu này vào danh sách Luồng Thu Nhập tùy chỉnh bằng nút [+ Thêm Thu Nhập] bên dưới.",
      "card_global_accounts": "Cẩm Nang Quản Lý Tài Khoản Đầu Tư Quốc Tế",
      "card_lmnp_stream": "Doanh thu Bất động sản",
      "card_lmnp_turo": "Doanh thu Bất động sản LMNP & Cho thuê xe Turo",
      "card_senior_care": "Dự phòng Chăm sóc Tuổi Già (78t+)",
      "card_family_plan": "Kế Hoạch Con Cái & Gia Đình",
      "income_periods_title": "Tổng thu nhập theo giai đoạn tuổi",
      "expense_periods_title": "Tổng chi tiêu theo giai đoạn tuổi",
      "periods_summary_note_prefix": "Lưu ý:",
      "periods_summary_note_text": "Số tiền danh nghĩa tương lai đã tính lạm phát trượt giá qua các năm (phản ánh dòng tiền thực tế cần chi và nhận tại thời điểm đó).",
      "card_estate_legacy": "Kế Hoạch Thừa Kế & Đánh Giá Mục Tiêu Di Sản",
      "card_healthspan_title": "Chỉ Số Tuổi Thọ Khỏe Mạnh (Healthspan vs Lifespan)",
      "card_preventive_budget_title": "Hoạch Định Ngân Sách Y Tế Dự Phòng Theo Độ Tuổi",
      "card_health_roadmap_title": "Lộ Trình Tầm Soát Y Tế Vàng Theo Mốc Tuổi",

      // Formula Accordion Toggles
      "lbl_view_formula": "Xem công thức tính toán",
      "lbl_view_formula_short": "Xem công thức tính",
      "lbl_view_formula_fire": "Xem tiêu chuẩn & công thức tính tự do tài chính",
      "lbl_view_formula_alloc": "Xem quy chuẩn phân bổ & công thức lãi suất",
      "lbl_view_formula_lmnp": "Xem cơ chế thuế LMNP & khấu hao Pháp",
      "lbl_view_formula_french_pension": "Xem công thức hưu trí Pháp (Réforme 2023)",
      "lbl_view_formula_vn_pension": "Xem công thức BHXH Tự nguyện VN (Luật 2024)",
      "lbl_view_formula_german_pension": "Xem công thức Hưu trí Đức (Rentenpunkte)",
      "lbl_view_formula_us_pension": "Xem công thức An sinh xã hội Mỹ (SSA / AIME)",
      "lbl_view_formula_japan_pension": "Xem công thức Lương hưu Nhật Bản (Nenkin 2 tầng)",
      "lbl_view_formula_canada_pension": "Xem công thức Lương hưu Canada (CPP & OAS)",
      "lbl_view_formula_australia_pension": "Xem công thức Hưu bổng & Trợ cấp Úc",
      "lbl_view_formula_korea_pension": "Xem công thức Lương hưu Quốc gia Hàn Quốc (NPS)",
      "lbl_view_formula_taiwan_pension": "Xem công thức Hưu trí Đài Loan (Bảo hiểm lao động)",
      "lbl_view_formula_ppp": "Xem nguồn dữ liệu & công thức đối chiếu PPP",
      "lbl_view_formula_inflation": "Xem công thức lạm phát 2 chặng & tỷ giá",
      "lbl_view_formula_children": "Xem cơ chế chi phí con cái & ưu đãi gia đình",
      "lbl_kid_cost_title": "Nuôi con",
      "lbl_kid_uni_title": "Đại học",
      "lbl_kid_cost_hint": "Chi phí ăn uống, trường học, sinh hoạt 0 - 18 tuổi",
      "lbl_kid_uni_hint": "Học phí & tiền thuê nhà sinh viên 18 - 23 tuổi",
      "lbl_view_formula_senior": "Xem công thức quỹ chăm sóc cao niên",
      "lbl_view_formula_healthspan": "Xem công thức tính khoảng cách suy yếu (Healthspan Gap)",
      "lbl_view_formula_medical_roi": "Xem quy luật hoàn vốn đầu tư (ROI) y tế dự phòng",
      "lbl_view_formula_geo_health": "Xem hiệu ứng chênh lệch chi phí y tế Pháp - Việt",
      "lbl_view_formula_property": "Xem công thức định giá BĐS & khấu hao",
      "lbl_view_formula_net_cashflow": "Xem công thức dòng tiền ròng BĐS thực tế",

      // Parameters
      "unit_age": "tuổi",
      "hint_toggle_gender": "Nhấp để đổi giới tính Nam / Nữ",
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
      "chart_networth_title": "Biểu đồ Tăng trưởng Tài sản Ròng",
      "chart_networth_desc": "Phân lớp trực quan giữa Tổng Tài sản Ròng (gồm BĐS) và Tiền Mặt & Quỹ Đầu Tư rút chi tiêu hưu trí.",
      "chart_cashflow_title": "Dòng tiền Hàng năm",
      "chart_cashflow_desc": "Cân đối thu nhập chủ động, thụ động, lương hưu, số tiền rút từ danh mục và chi tiêu sinh hoạt.",
      "chart_tab_networth_label": "Tài sản Ròng",
      "chart_tab_cashflow_label": "Dòng tiền Hàng năm",
      "chart_tab_toggle_title": "Chuyển đổi giữa Biểu đồ Tài sản Ròng và Dòng tiền Hàng năm",
      "chart_income_label": "Thu nhập",
      "chart_expense_label": "Chi tiêu",
      "chart_fire_target": "Mục tiêu FIRE Nest Egg",
      "btn_view_nominal": "Giá trị Tương lai (Nominal)",
      "btn_view_real": "Sức mua Hiện tại (Real)",
      "btn_cashflow_real": "Sức mua Hiện tại (Real)",
      "btn_cashflow_real_title": "Mặc định: Xem theo sức mua thời giá hiện tại đã chiết khấu lạm phát",
      "btn_cashflow_nominal": "Giá trị Tương lai (Nominal)",
      "btn_cashflow_nominal_title": "Xem theo giá trị tương lai đã bao gồm lạm phát và trượt giá theo từng năm",
      "cashflow_inflation_notice_title": "Lưu ý quan trọng:",
      "cashflow_inflation_notice_desc": "Biểu đồ đang hiển thị theo Giá trị Tương lai (Nominal). Hàng năm số liệu thu nhập, chi tiêu và dòng tiền rút đã được tính gộp lạm phát và trượt giá lũy kế theo thời gian (các con số danh nghĩa sẽ tăng dần tương ứng).",
      "cashflow_tooltip_nominal_tag": "Đã tính lạm phát & trượt giá",
      "cashflow_tooltip_real_tag": "Sức mua hiện tại (Real)",
      "chart_withdrawal_flow": "Dòng tiền Rút vốn",
      "lbl_mode_real_tag": "Sức mua hiện tại",
      "lbl_mode_nominal_tag": "Giá trị tương lai",
      "cashflow_stress_title": "Mô phỏng Biến cố:",
      "cf_chip_baseline": "Bình thường",
      "cf_chip_crash": "Khủng hoảng Thị trường Sớm (-35% Năm 1 & 2)",
      "cf_chip_crash_desc": "Danh mục đầu tư bị tổn thất (-35% Năm 1 & 2) nhưng mức chi tiêu sinh hoạt không đổi. Khi cạn kiệt danh mục thanh khoản, bạn sẽ không còn tiền mặt để rút bù đắp chi tiêu.",
      "cf_chip_inflation": "Lạm phát Phi mã (+30% Chi phí trong 5 năm)",
      "cf_chip_inflation_desc": "Bão giá khiến chi phí sinh hoạt tăng vọt 30% liên tục 5 năm đầu, buộc phải rút thêm tiền mặt từ danh mục để bù đắp thâm hụt.",
      "cf_chip_medical": "Cú sốc Chi phí Y tế Đột xuất (500Tr ₫ ở tuổi 65)",
      "cf_chip_medical_desc": "Phát sinh viện phí đột xuất khoảng 500Tr ₫ ở tuổi 65, chi tiêu tăng đột biến và đòi hỏi rút tiền mặt cấp bách để trang trải.",
      "cf_baseline_ref_expense": "Chi tiêu (Kịch bản chuẩn)",
      "cf_baseline_ref_withdrawal": "Rút vốn (Kịch bản chuẩn)",
      "btn_toggle_compare_withdrawals": "So sánh 4 chiến lược rút tiền",
      "btn_toggle_compare_withdrawals_title": "Bật/Tắt so sánh 4 chiến lược rút tiền từ tuổi nghỉ hưu",
      "btn_toggle_compare_stress": "Ba biến cố tồi tệ nhất",
      "btn_toggle_compare_stress_title": "Bật/Tắt so sánh 3 kịch bản biến cố rủi ro lớn nhất: Khủng hoảng sớm (-35%), Lạm phát phi mã, Cú sốc y tế",
      "btn_toggle_mc_fan": "Biến cố biến động thị trường Monte Carlo",
      "btn_toggle_mc_fan_title": "Bật/Tắt hiển thị Biến cố biến động thị trường Monte Carlo (P10 - P90) trên biểu đồ tài sản",
      "mc_p90_label": "90th Percentile (Thị trường Bùng nổ)",
      "mc_p50_label": "50th Percentile (Trung vị Kỳ vọng)",
      "mc_p10_label": "10th Percentile (Thị trường Gấu / Khủng hoảng)",
      "scenario_baseline_label": "Cơ sở",
      "scenario_crash_label": "Khủng hoảng Sớm (-35%)",
      "scenario_inflation_label": "Lạm phát Phi mã (7%/năm)",
      "scenario_medical_label": "Cú sốc Y tế (Tuổi 65)",
      "scenario_medical_withdrawal_label": "Rút vốn khi Sốc y tế",
      "scenario_inflation_withdrawal_label": "Rút vốn khi Bão giá",
      "scenario_crash_withdrawal_label": "Rút vốn khi Khủng hoảng (-35%)",
      "scenario_crash_expense_label": "Chi tiêu khi Khủng hoảng (-35%)",
      "scenario_medical_expense_label": "Chi tiêu khi Sốc y tế Tuổi 65",
      "scenario_inflation_expense_label": "Chi tiêu khi Bão giá (+4.5%/năm)",
      "legend_actual": "Thực tế",
      "legend_liquid_portfolio": "Tiền Mặt & Quỹ Đầu Tư",
      "legend_forecast_assets": "Dự báo Tài sản",
      "legend_total_networth": "Tổng Tài sản Ròng",
      "legend_networth_realestate": "Tổng Tài sản Ròng (gồm BĐS)",
      "why_liquid_strip_title": "Tiền mặt & Quỹ đầu tư quan trọng hơn Tổng tài sản,",
      "why_liquid_strip_desc": "vì đây là nguồn tạo dòng tiền sinh hoạt mỗi tháng. Căn nhà tiền tỷ không thể bẻ từng viên gạch để đi chợ hay trả viện phí. Nếu cạn tiền thanh khoản quá sớm, bạn sẽ rơi vào thế bị động và buộc phải bán tháo nhà đất lúc về hưu.",

      // Actions & Generic
      "btn_edit": "Sửa",
      "btn_delete": "Xóa",
      "btn_save": "Lưu",
      "btn_cancel": "Hủy",
      "btn_close": "Đóng",
      "status_active": "Đang bật",
      "status_inactive": "Chưa kích hoạt",
      "strategy_active": "Rút vốn bù đắp chi tiêu",
      "strategy_inactive": "Rút theo chi tiêu",
      "strategy_inactive_desc": "Danh mục chỉ bù đắp khi chi tiêu vượt qua thu nhập",
      "smart_cap_title": "Rút bù đắp chi tiêu: Không rút dư thừa",
      "smart_cap_desc": "Khi đã có lương hưu hoặc thu nhập thụ động bù đắp, hệ thống chỉ rút đúng số tiền còn thiếu để trang trải chi tiêu, bảo toàn danh mục tối đa.",
      "excess_warning_title": "Cảnh báo: Dòng tiền không đủ bù đắp chi tiêu",
      "excess_warning_desc": "Chi tiêu vượt quá tổng thu nhập và số dư danh mục. Cần điều chỉnh mức sống hoặc tăng vốn tích lũy.",
      "badge_dual_inflation_active": "2 Chặng",
      "hint_dual_inflation_active": "Đang áp dụng mô hình Lạm phát 2 chặng bên dưới",
      "lbl_property_name": "Tên BĐS (Định danh)",
      "lbl_property_category": "Hình thức BĐS",
      "opt_property_apartment": "Căn hộ chung cư",
      "opt_property_house": "Nhà mặt đất",
      "lbl_property_typology": "Loại phân hạng",
      "lbl_property_appreciation": "Tỷ lệ điều chỉnh tăng trưởng/năm (%)",
      "summary_optimal_age": "Tuổi tối ưu:",
      "summary_not_feasible": "Chưa khả thi",
      "summary_target_nest_egg": "Tài sản mục tiêu",
      "status_solid": "Vững chắc",
      "status_suboptimal": "Chưa tối ưu",
      "fire_p1_ok": "✓ Đạt: có {have} / cần {need}",
      "fire_p1_fail": "✗ Chưa đạt: lúc nghỉ hưu có {have}, cần {need} (thiếu {gap}). Hãy lùi tuổi nghỉ hưu hoặc tăng tiết kiệm.",
      "fire_p2_ok": "✓ Đạt: tỷ lệ thành công {rate}%",
      "fire_p2_fail": "✗ Chưa đạt: tỷ lệ thành công {rate}% (cần ≥ 80%)",
      "fire_p3_ok": "✓ Đạt: vượt qua {n}/{m} biến cố",
      "fire_p3_fail": "✗ Chưa đạt: vượt {n}/{m} biến cố. Chưa qua: {list}",
      "fire_p1_title": "1. Vốn trước khi về hưu",
      "fire_verdict_ok": "✓ Đạt",
      "fire_verdict_fail": "✗ Chưa đạt",
      "fire_p1_hint": "Tài sản thanh khoản ≥ 25–30 lần khoản thiếu hàng năm",
      "fire_p1_tip": "Tài sản thanh khoản (trừ BĐS) ≥ 25–30 lần khoản thiếu hàng năm (Khoản thiếu = Chi tiêu hưu − Thu nhập hưu). Hưu ≤ 30 năm: 25 lần; 30–35 năm: 28 lần; > 35 năm: 30 lần.",
      "fire_p2_title": "2. Chịu được biến động thị trường",
      "fire_p2_hint": "1,000 kịch bản ngẫu nhiên, thành công ≥ 80%",
      "fire_p2_tip": "Mô phỏng 1,000 kịch bản thị trường ngẫu nhiên, tỷ lệ thành công phải ≥ 80%.",
      "fire_p3_title": "3. Chịu được biến cố bệnh tật, khủng hoảng",
      "fire_p3_hint": "Luôn đủ tiền ≥ 5 năm thiếu hụt, chi tiêu giữ ≥ 80%",
      "fire_p3_tip": "Tài sản thanh khoản tại mọi thời điểm luôn ≥ 5 năm khoản tiền thiếu; chi tiêu thực tế luôn giữ vững ≥ 80% kế hoạch ban đầu (không bị bóp nghẹt chi tiêu thiết yếu).",
      "status_risky": "Khá Rủi ro",
      "status_needs_adjust": "Cần Điều chỉnh",
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
      "intro_a4": "Cơ chế rút vốn tự nhiên: Chỉ rút vốn khi chi tiêu vượt qua tổng thu nhập, không ép rút thừa giúp bảo toàn vốn gốc và di sản thừa kế.",
      "intro_tag4": "CƠ CHẾ RÚT VỐN",
      "intro_q5": "Làm sao an tâm kế hoạch không bị lạm phát bào mòn hay sụp đổ trước khủng hoảng?",
      "intro_a5": "Kiểm tra độ bền danh mục với 1.000 kịch bản ngẫu nhiên Monte Carlo và mô hình Lạm phát 2 chặng EUR/VND trước mọi biến động thị trường.",
      "intro_tag5": "MONTE CARLO & LẠM PHÁT",
      "intro_q6": "Làm sao định giá đúng BĐS (nhà đất vs chung cư hao mòn) và tối ưu hóa thuế?",
      "intro_a6": "Thuật toán tách biệt tăng trưởng đất với khấu hao công trình chung cư sau 30 năm; tích hợp biểu thuế lũy tiến Pháp, Mỹ và Việt Nam.",
      "intro_tag6": "BẤT ĐỘNG SẢN & THUẾ",
      "intro_btn_start": "Bắt Đầu Hoạch Định Ngay",
      "intro_footer_note": "Hoàn toàn miễn phí • Tính toán 100% trên trình duyệt của bạn • Dữ liệu bảo mật tuyệt đối",
      "lbl_alloc_stocks": "Cổ phiếu & Quỹ ETF",
      "lbl_alloc_bonds": "Trái phiếu & Tiết kiệm",
      "lbl_alloc_re": "Bất động sản & Vàng",
      "lbl_alloc_cash": "Tiền mặt & Thanh khoản",
      "lbl_alloc_cash_short": "TM",
      "btn_add_investment": "+ Thêm khoản đầu tư",
      "btn_reset_investments": "Khôi phục mặc định",
      "title_reset_investments": "Đặt lại Danh mục đầu tư",
      "msg_confirm_reset_alloc": "Bạn có muốn đặt lại danh mục đầu tư về chuẩn mặc định 3 lớp tài sản: Cổ phiếu & Quỹ ETF (60%), Trái phiếu & Tiết kiệm (20%), Tiền mặt (0%)?",
      "lbl_investment_name": "Tên danh mục",
      "lbl_investment_ratio": "Tỷ lệ",
      "lbl_investment_return": "Lãi suất/năm",
      "lbl_new_investment_default": "Khoản đầu tư mới",
      "placeholder_investment_name": "Tên khoản đầu tư (VD: Cổ phiếu, Vàng, BĐS...)",
      "lbl_allocated_total": "Đã phân bổ",
      "lbl_unallocated_capital": "Vốn nhàn rỗi (0%/năm)",
      "lbl_fully_allocated": "Đã phân bổ trọn vẹn 100% vốn",
      "lbl_alloc_rule_max100": "Quy tắc 100%: Tổng tỷ lệ không được vượt quá 100%.",
      "lbl_max_reached_hint": "Đã đạt giới hạn tối đa 100%. Vui lòng giảm bớt tỷ lệ ở khoản khác trước khi tăng.",
      "lbl_alloc_idle_explanation": "Vẫn còn <strong style=\"color: var(--text-main);\">{pct}%</strong> tiền nhàn rỗi. Mỗi tháng số tiền tiết kiệm của bạn sẽ được tự động đưa vào các % danh mục đầu tư như trên để mô phỏng.",
      "lbl_alloc_fully_explanation": "Đã phân bổ trọn vẹn <strong style=\"color: #10b981;\">100%</strong> danh mục. Mỗi tháng số tiền tiết kiệm của bạn sẽ được tự động đưa vào các % danh mục đầu tư như trên để mô phỏng.",
      "lbl_alloc_disabled_explanation": "Đã tắt danh mục đầu tư: Tiền nhàn rỗi và tiền tiết kiệm hàng tháng được giữ bằng tiền mặt (0% sinh lời).",

      // Gemini AI On-Demand & Warnings
      "gemini_warning_title": "Thông số kế hoạch đã có thay đổi",
      "gemini_warning_desc": "Nhận xét bên dưới được tạo từ dữ liệu cũ. Nhấn nút để phân tích lại theo thông số mới nhất.",
      "gemini_btn_update": "Cập nhật nhận xét AI",
      "gemini_btn_generate": "Tạo nhận xét AI (Gemini)",
      "gemini_empty_title": "Chưa tạo nhận xét AI cho biểu đồ này",
      "gemini_empty_desc": "Nhấn nút để Gemini AI phân tích chuyên sâu các chỉ số và đưa ra khuyến nghị chiến lược.",
      "gemini_loading": "Đang phân tích dữ liệu chuyên sâu với Gemini AI...",
      "gemini_stale_time": "Chưa cập nhật",
      "gemini_ready_badge": "Sẵn sàng",
      "gemini_btn_reanalyze": "Phân tích lại",
      "gemini_btn_reanalyze_title": "Nhấn để yêu cầu Gemini AI phân tích lại",
      "gemini_updated_at": "Cập nhật lúc:",

      // Lưới An Toàn 3 Biến Cố & FIRE Bền Bỉ
      "stress_resilience_title": "Lưới An Toàn 3 Biến Cố & FIRE Bền Bỉ",
      "stress_resilience_sub": "Kiểm định độc lập sức chống chịu của kế hoạch trước 3 kịch bản khủng hoảng khắc nghiệt nhất.",
      "stress_badge_bulletproof": "FIRE Thép Đúc",
      "stress_badge_bulletproof_desc": "Xuất sắc! Kế hoạch bảo toàn trọn vẹn quỹ an toàn 5 năm khoản tiền thiếu qua cả 3 biến cố khắc nghiệt.",
      "stress_badge_standard": "FIRE Tiêu Chuẩn",
      "stress_badge_standard_desc": "Kế hoạch khả thi trong điều kiện bình thường nhưng có nguy cơ thâm hụt khi gặp biến cố lớn.",
      "stress_badge_fragile": "FIRE Dễ Tổn Thương",
      "stress_badge_fragile_desc": "Cần tích lũy thêm quỹ tiền mặt dự phòng hoặc lùi tuổi hưu để hấp thụ các cú sốc tài chính.",
      "stress_pass_tag": "Vượt qua",
      "stress_fail_tag": "Nguy cơ",
      "stress_gap_capital": "Cần tích lũy thêm khoảng",
      "stress_gap_delay": "Hoặc lùi tuổi nghỉ hưu thêm",
      "stress_gap_years": "năm",
      "stress_test_market_crash": "Khủng hoảng Thị trường (-35%)",
      "stress_test_high_inflation": "Bão giá Lạm phát (+30%)",
      "stress_test_medical_shock": "Cú sốc Viện phí (500Tr ₫)",
      "stress_advice_label": "Mẹo phòng thủ chiến thuật:",
      "stress_btn_view_chart": "Xem thử thách trên biểu đồ",
      "stress_details_toggle": "Khuyến nghị & Cơ chế",
      "stress_toggle_all_advice": "Hiện tất cả khuyến nghị",
      "stress_hide_all_advice": "Thu gọn tất cả khuyến nghị",
      "stress_mechanism_label": "Bản chất rủi ro:",
      "sidebar_stress_gate_ok": "• Sàn thanh khoản ≥ 5 năm khoản tiền thiếu & Mức sống ≥ 80%",
      "stress_fail_floor": "Hụt sàn thanh khoản 5 năm ở tuổi",
      "stress_fail_spending": "Tụt mức sống ở tuổi",
      "stress_fail_depleted": "Cạn tiền ở tuổi",
      "stress_preserved_desc": "Bảo toàn sàn thanh khoản 5 năm khoản tiền thiếu",
      "stress_spending_cut_desc": "Chi tiêu thực tế bị bóp nghẹt dưới 80%",

      // Hồ Sơ Gia Đình & Định Hướng Nơi Sống (PPP Đa Quốc Gia)
      "profile_modal_title": "Thiết lập Hồ sơ & Quốc gia",
      "profile_gender_title": "1. Người lập kế hoạch là",
      "gender_male": "Nam",
      "gender_female": "Nữ",
      "gender_male_badge": "Tuổi hưu 62t",
      "gender_female_badge": "Tuổi hưu 60t",
      "profile_target_title": "2. Kế hoạch này dành cho",
      "profile_family_type": "Quy mô gia đình",
      "profile_single": "Cá nhân (1 người)",
      "profile_married": "Cặp đôi (2 người)",
      "profile_single_short": "Cá nhân",
      "profile_married_short": "Cặp đôi",
      "profile_retire_mode": "Nơi sinh sống",
      "profile_retire_destination": "Nơi bạn có thể đến",
      "profile_mode_domestic": "Chỉ 1 nơi (Ở lại nơi làm việc)",
      "profile_mode_relocate": "Nhiều nơi (Chuyển đi hoặc sống giữa các nơi)",
      "profile_mode_hybrid": "Nhiều nơi (Chuyển đi hoặc sống giữa các nơi)",
      "profile_mode_domestic_short": "Chỉ 1 nơi",
      "profile_mode_domestic_sub": "Ở lại nơi làm việc",
      "profile_mode_relocate_short": "Nhiều nơi",
      "profile_mode_relocate_sub": "Chuyển đi hoặc sống giữa các nơi",
      "profile_work_location": "Nơi làm việc tích lũy",
      "profile_retire_location": "Nơi nghỉ hưu sinh sống",
      "profile_summary_edit": "Đổi hồ sơ",
      "profile_derived_callout": "Gợi ý từ mức sống thực tế",
      "profile_ppp_benchmarks": "Mốc tham khảo xã hội"
    },

    en: {
      // Topbar Header
      "app_title": "pyRetrait — Financial Independence & Early Retirement Planner",
      "brand_tagline": "Financial Independence",
      "plan_select_label": "Plan:",
      "quick_setup": "Quick Setup",
      "new_plan": "+ New",
      "duplicate_plan": "Duplicate",
      "delete_plan": "Delete",
      "formula_guide": "Formulas",
      "auth_login": "Connect",
      "auth_account": "Account",
      "auth_synced": "Cloud Synced",
      "auth_logout": "Sign Out",
      "auth_logout_confirm": "Are you sure you want to sign out of your account?",
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
      "nav_tax": "Smart Tips & Advice",
      "nav_tax_sub": "Sustainable spending & Country financial tools",
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
      "kpi_safe_spend": "Initial Retirement Withdrawal",
      "kpi_estate_end": "Projected Estate (Age 85)",

      // Column Headers
      "section_plan_target": "Plan for",
      "col1_income_header": "Income Streams",
      "col2_expense_header": "Expense Streams",
      "btn_add_income": "+ Add Income",
      "btn_add_expense": "+ Add Expense",
      "income_salary_primary": "Your Current Salary",
      "income_salary_spouse": "Spouse's Current Salary",
      "badge_primary_salary": "You",
      "badge_spouse_salary": "Spouse",
      "placeholder_income_name": "e.g. Your current salary, Spouse salary, Rental property, ETF dividends...",
      "card_withdrawal_strategy": "Retirement Withdrawal Mechanism",
      "card_asset_allocation": "Investment Portfolio",
      "card_inflation_domestic": "Expense Inflation",
      "card_inflation_crossborder": "Dual-Stage Inflation & EUR/VND Forex",
      "card_retire_badge_ppp": "PPP Conversion",
      "lbl_current_savings": "Current Investable Net Worth",
      "card_french_pension": "French Pension (Agirc-Arrco / CNAV)",
      "card_german_pension": "German Statutory Pension (Gesetzliche Rentenversicherung)",
      "card_us_pension": "US Social Security (SSA Retirement)",
      "card_japan_pension": "Japanese Statutory Pension (Nenkin: Kokumin & Kōsei)",
      "card_canada_pension": "Canada Pension Plan & Old Age Security (CPP & OAS)",
      "card_australia_pension": "Australian Retirement (Superannuation & Age Pension)",
      "card_korea_pension": "South Korea National Pension Scheme (NPS)",
      "card_taiwan_pension": "Taiwan Labor Insurance & Labor Pension (勞保 & 勞退)",
      "card_vn_pension": "Vietnam Voluntary Social Security Pension",
      "callout_pension_unsupported_title": "Automated pension model not yet available",
      "callout_pension_unsupported_desc": "pyRetrait does not yet have an automated statutory pension calculation model for this country. You can estimate your pension independently and add it directly via [+ Add Income].",
      "card_global_accounts": "International Investment Accounts Guide",
      "card_lmnp_stream": "Real Estate Income",
      "card_lmnp_turo": "LMNP Real Estate & Turo Fleet Income",
      "card_senior_care": "Senior Long-Term Care Reserve (Age 78+)",
      "card_family_plan": "Children & Family Planning",
      "income_periods_title": "Income by Age Phase",
      "expense_periods_title": "Expenses by Age Phase",
      "periods_summary_note_prefix": "Note:",
      "periods_summary_note_text": "Future nominal figures already factor in cumulative inflation over the years (actual cashflow at each phase).",
      "card_estate_legacy": "Estate Planning & Legacy Milestone",
      "card_healthspan_title": "Healthspan & Longevity Score",
      "card_preventive_budget_title": "Preventive Healthcare Budget by Age",
      "card_health_roadmap_title": "Preventive Health Milestones Roadmap",

      // Formula Accordion Toggles
      "lbl_view_formula": "View calculation formula",
      "lbl_view_formula_short": "View formula",
      "lbl_view_formula_fire": "View FIRE standards & calculation rules",
      "lbl_view_formula_alloc": "View allocation rules & weighted return formula",
      "lbl_view_formula_lmnp": "View French LMNP tax & depreciation mechanism",
      "lbl_view_formula_french_pension": "View French pension formula (2023 Reform)",
      "lbl_view_formula_vn_pension": "View Vietnam voluntary social insurance formula (2024 Law)",
      "lbl_view_formula_german_pension": "View German pension formula (Rentenpunkte)",
      "lbl_view_formula_us_pension": "View US Social Security formula (SSA / AIME)",
      "lbl_view_formula_japan_pension": "View Japanese pension formula (2-Tier Nenkin)",
      "lbl_view_formula_canada_pension": "View Canadian pension formula (CPP & OAS)",
      "lbl_view_formula_australia_pension": "View Australian Superannuation & Age Pension formula",
      "lbl_view_formula_korea_pension": "View South Korean National Pension formula (NPS)",
      "lbl_view_formula_taiwan_pension": "View Taiwan Labor Insurance pension formula",
      "lbl_view_formula_ppp": "View data sources & PPP comparison formula",
      "lbl_view_formula_inflation": "View dual-stage inflation & FX drift formula",
      "lbl_view_formula_children": "View child expenses mechanism & family benefits",
      "lbl_kid_cost_title": "Child rearing",
      "lbl_kid_uni_title": "University",
      "lbl_kid_cost_hint": "Food, schooling, living expenses ages 0 - 18",
      "lbl_kid_uni_hint": "Tuition & student accommodation ages 18 - 23",
      "lbl_view_formula_senior": "View senior long-term care fund formula",
      "lbl_view_formula_healthspan": "View Healthspan Gap calculation formula",
      "lbl_view_formula_medical_roi": "View preventive health ROI model",
      "lbl_view_formula_geo_health": "View France-Vietnam healthcare geo-arbitrage effect",
      "lbl_view_formula_property": "View real estate valuation & depreciation formula",
      "lbl_view_formula_net_cashflow": "View real estate net cashflow formula",

      // Parameters
      "unit_age": "years old",
      "hint_toggle_gender": "Click to toggle gender (Male / Female)",
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
      "chart_networth_desc": "Visual breakdown between Total Net Worth (incl. Real Estate) and Liquid Portfolio for retirement expenses.",
      "chart_cashflow_title": "Annual Cash-Flow Projections",
      "chart_cashflow_desc": "Annual balance of active income, passive cash flows, pensions, portfolio withdrawals, and living expenses.",
      "chart_tab_networth_label": "Net Worth",
      "chart_tab_cashflow_label": "Annual Cash Flow",
      "chart_tab_toggle_title": "Toggle between Net Worth and Annual Cash Flow charts",
      "chart_income_label": "Income",
      "chart_expense_label": "Expenses",
      "chart_fire_target": "FIRE Target Nest Egg",
      "btn_view_nominal": "Future Value (Nominal)",
      "btn_view_real": "Current Purchasing Power (Real)",
      "btn_cashflow_real": "Today's Purchasing Power (Real)",
      "btn_cashflow_real_title": "Default: View in today's purchasing power with inflation discounted",
      "btn_cashflow_nominal": "Future Value (Nominal)",
      "btn_cashflow_nominal_title": "View in future values including annual inflation and purchasing drift",
      "cashflow_inflation_notice_title": "Important Notice:",
      "cashflow_inflation_notice_desc": "Chart is currently displaying in Future Value (Nominal). Annual income, expenses, and withdrawals already include cumulative inflation and purchasing drift over time (nominal amounts increase accordingly).",
      "cashflow_tooltip_nominal_tag": "Includes cumulative inflation & drift",
      "cashflow_tooltip_real_tag": "Today's Purchasing Power (Real)",
      "chart_withdrawal_flow": "Withdrawal Flow",
      "lbl_mode_real_tag": "Purchasing Power",
      "lbl_mode_nominal_tag": "Future Value",
      "cashflow_stress_title": "Simulate Shocks:",
      "cf_chip_baseline": "Baseline",
      "cf_chip_crash": "Early Market Crash (-35% Yr 1 & 2)",
      "cf_chip_crash_desc": "Portfolios suffer losses (-35% in Yr 1 & 2) while living expenses remain unchanged. If liquid assets run out, no cash remains to cover living costs.",
      "cf_chip_inflation": "High Inflation Spike (+30% Expenses for 5 Yrs)",
      "cf_chip_inflation_desc": "Living costs jump 30% for 5 consecutive years, requiring higher cash withdrawals from your portfolio to bridge the deficit.",
      "cf_chip_medical": "Medical Expense Shock (€18k at Age 65)",
      "cf_chip_medical_desc": "Sudden medical bill (~€18k) at age 65, causing a sharp spending spike and urgent cash withdrawal needs.",
      "cf_baseline_ref_expense": "Expenses (Baseline)",
      "cf_baseline_ref_withdrawal": "Withdrawals (Baseline)",
      "btn_toggle_compare_withdrawals": "Compare 4 Withdrawal Strategies",
      "btn_toggle_compare_withdrawals_title": "Toggle comparison of 4 withdrawal strategies from retirement age",
      "btn_toggle_compare_stress": "Top 3 Worst-Case Scenarios",
      "btn_toggle_compare_stress_title": "Toggle comparison of 3 worst stress scenarios: Early crash (-35%), High inflation, Medical shock",
      "btn_toggle_mc_fan": "Monte Carlo Market Volatility",
      "btn_toggle_mc_fan_title": "Toggle Monte Carlo market volatility fan chart (P10 - P90) on net worth trajectory",
      "mc_p90_label": "90th Percentile (Boom Market)",
      "mc_p50_label": "50th Percentile (Median Expectation)",
      "mc_p10_label": "10th Percentile (Bear Market / Crisis)",
      "scenario_baseline_label": "Baseline",
      "scenario_crash_label": "Early Crash (-35%)",
      "scenario_inflation_label": "High Inflation (7%/yr)",
      "scenario_medical_label": "Medical Shock (Age 65)",
      "scenario_medical_withdrawal_label": "Withdrawals under Medical Shock",
      "scenario_inflation_withdrawal_label": "Withdrawals under Price Surge",
      "scenario_crash_withdrawal_label": "Withdrawals under Market Crash (-35%)",
      "scenario_crash_expense_label": "Expenses under Market Crash (-35%)",
      "scenario_medical_expense_label": "Expenses under Medical Shock (Age 65)",
      "scenario_inflation_expense_label": "Expenses under Price Surge (+4.5%/yr)",
      "legend_actual": "Actual",
      "legend_liquid_portfolio": "Liquid Portfolio",
      "legend_forecast_assets": "Forecast Assets",
      "legend_total_networth": "Total Net Worth",
      "legend_networth_realestate": "Total Net Worth (incl. Real Estate)",
      "why_liquid_strip_title": "Liquid Portfolio is more critical than Total Net Worth,",
      "why_liquid_strip_desc": "as it generates monthly living cash flow. A valuable house cannot be chipped away brick by brick to buy groceries or pay medical bills. Running out of liquid funds early forces you into distressed property sales in retirement.",

      // Actions & Generic
      "btn_edit": "Edit",
      "btn_delete": "Delete",
      "btn_save": "Save",
      "btn_cancel": "Cancel",
      "btn_close": "Close",
      "status_active": "Active",
      "status_inactive": "Inactive",
      "strategy_active": "Deficit-Matching Withdrawal",
      "strategy_inactive": "Expense-Matching",
      "strategy_inactive_desc": "Portfolio covers living deficit only when expenses exceed income",
      "smart_cap_title": "Deficit Matching: Prevent Excess Withdrawals",
      "smart_cap_desc": "When pensions cover your needs, only the actual deficit is withdrawn, preserving principal and legacy.",
      "excess_warning_title": "Warning: Cash flow deficit",
      "excess_warning_desc": "Living expenses exceed total income and portfolio balance.",
      "badge_dual_inflation_active": "2-Stage",
      "hint_dual_inflation_active": "Applying 2-stage inflation model below",
      "lbl_property_name": "Property Name (Identifier)",
      "lbl_property_category": "Property Category",
      "opt_property_apartment": "Apartment / Condominium",
      "opt_property_house": "Single-Family House / Villa",
      "lbl_property_typology": "Typology",
      "lbl_property_appreciation": "Annual Appreciation/Depreciation (%)",
      "summary_optimal_age": "Optimal Age:",
      "summary_not_feasible": "Not yet feasible",
      "summary_target_nest_egg": "Target Nest Egg",
      "status_solid": "Solid",
      "status_suboptimal": "Suboptimal",
      "fire_p1_ok": "✓ Met: {have} / need {need}",
      "fire_p1_fail": "✗ Not met: {have} at retirement, need {need} (short by {gap}). Retire later or save more.",
      "fire_p2_ok": "✓ Met: success rate {rate}%",
      "fire_p2_fail": "✗ Not met: success rate {rate}% (need ≥ 80%)",
      "fire_p3_ok": "✓ Met: passed {n}/{m} shocks",
      "fire_p3_fail": "✗ Not met: passed {n}/{m} shocks. Failed: {list}",
      "fire_p1_title": "1. Capital before retiring",
      "fire_verdict_ok": "✓ Met",
      "fire_verdict_fail": "✗ Not met",
      "fire_p1_hint": "Liquid assets ≥ 25–30x the yearly shortfall",
      "fire_p1_tip": "Liquid assets (excluding real estate) ≥ 25–30x the yearly shortfall (Shortfall = Retirement spending − Retirement income). Retirement ≤ 30 yrs: 25x; 30–35 yrs: 28x; > 35 yrs: 30x.",
      "fire_p2_title": "2. Withstands market swings",
      "fire_p2_hint": "1,000 random scenarios, success ≥ 80%",
      "fire_p2_tip": "1,000 random market scenarios are simulated; the success rate must be ≥ 80%.",
      "fire_p3_title": "3. Withstands illness & crises",
      "fire_p3_hint": "Always ≥ 5 yrs of shortfall covered, spending kept ≥ 80%",
      "fire_p3_tip": "Liquid assets always cover ≥ 5 years of the shortfall; real spending stays ≥ 80% of the original plan (essential spending is never squeezed).",
      "status_risky": "Risky",
      "status_needs_adjust": "Needs Adjustment",
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
      "intro_a4": "Natural withdrawal mechanism: Portfolio funds are only drawn when living expenses exceed total income, preserving principal and legacy.",
      "intro_tag4": "WITHDRAWAL MECHANISM",
      "intro_q5": "Can your portfolio withstand soaring inflation and severe market crashes?",
      "intro_a5": "Stress-tests your wealth across 1,000 Monte Carlo runs and 2-stage inflation models (EUR/VND) through historical bear markets.",
      "intro_tag5": "MONTE CARLO & INFLATION",
      "intro_q6": "How to evaluate real estate (houses vs aging apartments) and minimize taxes?",
      "intro_a6": "Separates land appreciation from 30-year building depreciation for condos; integrates progressive tax brackets for FR, US, and VN.",
      "intro_tag6": "REAL ESTATE & TAXES",
      "intro_btn_start": "Get Started Now",
      "intro_footer_note": "100% Free • Runs locally in your browser • Absolute data privacy",
      "lbl_alloc_stocks": "Stocks & ETFs",
      "lbl_alloc_bonds": "Bonds & Savings",
      "lbl_alloc_re": "Real Estate & Gold",
      "lbl_alloc_cash": "Cash & Liquidity",
      "lbl_alloc_cash_short": "Cash",
      "btn_add_investment": "+ Add Investment",
      "btn_reset_investments": "Reset to Default",
      "title_reset_investments": "Reset Investment Portfolio",
      "msg_confirm_reset_alloc": "Do you want to reset your investment portfolio to default 3 asset classes: Stocks & ETFs (60%), Bonds & Savings (20%), Cash (0%)?",
      "lbl_investment_name": "Category Name",
      "lbl_investment_ratio": "Allocation",
      "lbl_investment_return": "Annual Return",
      "lbl_new_investment_default": "New Investment",
      "placeholder_investment_name": "Investment name (e.g. Stocks, Gold, Real Estate...)",
      "lbl_allocated_total": "Allocated",
      "lbl_unallocated_capital": "Idle Capital (0%/yr)",
      "lbl_fully_allocated": "100% Fully Allocated",
      "lbl_alloc_rule_max100": "100% Rule: Total allocation cannot exceed 100%.",
      "lbl_max_reached_hint": "100% limit reached. Please reduce another allocation before increasing this one.",
      "lbl_alloc_idle_explanation": "<strong style=\"color: var(--text-main);\">{pct}%</strong> idle cash remaining. Each month, your savings will automatically be allocated into the investment portfolio above for simulation.",
      "lbl_alloc_fully_explanation": "<strong style=\"color: #10b981;\">100%</strong> fully allocated. Each month, your savings will automatically be allocated into the investment portfolio above for simulation.",
      "lbl_alloc_disabled_explanation": "Investment portfolio disabled: Idle cash and monthly savings are kept as cash (0% return).",

      // Gemini AI On-Demand & Warnings
      "gemini_warning_title": "Plan parameters have changed",
      "gemini_warning_desc": "The analysis below is based on previous parameters. Click to re-analyze with current data.",
      "gemini_btn_update": "Update AI Insight",
      "gemini_btn_generate": "Generate AI Insight (Gemini)",
      "gemini_empty_title": "No AI insight generated yet for this chart",
      "gemini_empty_desc": "Click the button to receive an in-depth financial analysis and strategic recommendations from Gemini.",
      "gemini_loading": "Analyzing financial data in depth with Gemini AI...",
      "gemini_stale_time": "Outdated",
      "gemini_ready_badge": "Ready",
      "gemini_btn_reanalyze": "Re-analyze",
      "gemini_btn_reanalyze_title": "Click to re-analyze with Gemini AI",
      "gemini_updated_at": "Updated at:",

      // Triple-Shock Safety Net & Bulletproof FIRE
      "stress_resilience_title": "Triple-Shock Safety Net & Bulletproof FIRE",
      "stress_resilience_sub": "Independent stress-testing of your plan against the 3 harshest financial crises.",
      "stress_badge_bulletproof": "Bulletproof FIRE",
      "stress_badge_bulletproof_desc": "Outstanding! Your plan preserves the 5-year safety buffer and living standard through all 3 major shocks.",
      "stress_badge_standard": "Standard FIRE",
      "stress_badge_standard_desc": "Feasible under normal conditions, but vulnerable when facing major financial shocks.",
      "stress_badge_fragile": "Fragile FIRE",
      "stress_badge_fragile_desc": "Requires higher savings cushion or delayed retirement to absorb financial shocks.",
      "stress_pass_tag": "Passed",
      "stress_fail_tag": "Vulnerable",
      "stress_gap_capital": "Needs approx.",
      "stress_gap_delay": "Or delay retirement by",
      "stress_gap_years": "years",
      "stress_test_market_crash": "Market Crash (-35%)",
      "stress_test_high_inflation": "High Inflation (+30%)",
      "stress_test_medical_shock": "Medical Shock (€18k)",
      "stress_advice_label": "Defensive strategy tip:",
      "stress_btn_view_chart": "View shock on chart",
      "stress_details_toggle": "Advice & Mechanism",
      "stress_toggle_all_advice": "Show all advice",
      "stress_hide_all_advice": "Hide all advice",
      "stress_mechanism_label": "Risk nature:",
      "sidebar_stress_gate_ok": "• Liquid floor ≥ 5 yrs net deficit & Living std ≥ 80%",
      "stress_fail_floor": "Liquid floor breached at age",
      "stress_fail_spending": "Living std drop at age",
      "stress_fail_depleted": "Depleted at age",
      "stress_preserved_desc": "Liquid buffer of 5 yrs net deficit preserved",
      "stress_spending_cut_desc": "Actual spending dropped below 80% baseline",

      // Household & Relocation Mode (Multi-Country PPP)
      "profile_modal_title": "Household & Relocation Setup",
      "profile_gender_title": "1. Plan Owner Gender",
      "gender_male": "Male",
      "gender_female": "Female",
      "gender_male_badge": "Retire Age 62",
      "gender_female_badge": "Retire Age 60",
      "profile_target_title": "2. This Plan is for",
      "profile_family_type": "Household Size",
      "profile_single": "Single (1 person)",
      "profile_married": "Couple / Partner (2 persons)",
      "profile_single_short": "Single",
      "profile_married_short": "Couple",
      "profile_retire_mode": "Place of residence",
      "profile_retire_destination": "Where you might move to",
      "profile_mode_domestic": "Single Location (Stay where working)",
      "profile_mode_relocate": "Multiple Locations (Relocate / Multi-base)",
      "profile_mode_hybrid": "Multiple Locations (Relocate / Multi-base)",
      "profile_mode_domestic_short": "Single Location",
      "profile_mode_domestic_sub": "Stay where working",
      "profile_mode_relocate_short": "Multiple Locations",
      "profile_mode_relocate_sub": "Relocate or live between places",
      "profile_work_location": "Working Location",
      "profile_retire_location": "Retirement Location",
      "profile_summary_edit": "Edit Profile",
      "profile_derived_callout": "Suggested from Current Living Standard",
      "profile_ppp_benchmarks": "Social Benchmarks"
    },

    fr: {
      // Topbar Header
      "app_title": "pyRetrait — Planificateur d'Indépendance Financière & Retraite Anticipée",
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
      "auth_logout_confirm": "Êtes-vous sûr de vouloir vous déconnecter de votre compte ?",
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
      "nav_tax": "Conseils & Astuces",
      "nav_tax_sub": "Dépenses durables & Outils financiers par pays",
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
      "kpi_safe_spend": "Retrait initial à la retraite",
      "kpi_estate_end": "Succession Prévue (85 ans)",

      // Column Headers
      "section_plan_target": "Plan pour",
      "col1_income_header": "Flux de Revenus",
      "col2_expense_header": "Flux de Dépenses",
      "btn_add_income": "+ Ajouter un revenu",
      "btn_add_expense": "+ Ajouter une dépense",
      "income_salary_primary": "Votre salaire actuel",
      "income_salary_spouse": "Salaire actuel de votre conjoint",
      "badge_primary_salary": "Vous",
      "badge_spouse_salary": "Conjoint",
      "placeholder_income_name": "Ex : Votre salaire actuel, Salaire conjoint, Immobilier locatif, Dividendes ETF...",
      "card_withdrawal_strategy": "Mécanisme de Retrait Retraite",
      "card_asset_allocation": "Portefeuille d'Investissement",
      "card_inflation_domestic": "Inflation des Dépenses",
      "card_inflation_crossborder": "Inflation à 2 Étapes & Taux EUR/VND",
      "card_retire_badge_ppp": "Conversion PPA",
      "lbl_current_savings": "Patrimoine Net d'Investissement Actuel",
      "card_french_pension": "Retraite Française (Agirc-Arrco / CNAV)",
      "card_german_pension": "Retraite Allemande (Gesetzliche Rentenversicherung)",
      "card_us_pension": "Sécurité Sociale Américaine (US Social Security SSA)",
      "card_japan_pension": "Retraite Japonaise (Nenkin: Kokumin & Kōsei)",
      "card_canada_pension": "Régime de Pensions du Canada & SV (RPC/CPP & SV/OAS)",
      "card_australia_pension": "Retraite Australienne (Superannuation & Age Pension)",
      "card_korea_pension": "Régime National de Retraite Coréen (NPS)",
      "card_taiwan_pension": "Assurance & Retraite des Salariés Taïwanais (勞保 & 勞退)",
      "card_vn_pension": "Retraite Volontaire Vietnam (BHXH)",
      "callout_pension_unsupported_title": "Modèle de retraite automatique non disponible",
      "callout_pension_unsupported_desc": "pyRetrait ne dispose pas encore d'un modèle de calcul automatisé selon les lois de ce pays. Vous pouvez estimer votre pension séparément et l'ajouter directement via [+ Ajouter un revenu].",
      "card_global_accounts": "Guide des Comptes d'Investissement Internationaux",
      "card_lmnp_stream": "Revenus Immobiliers",
      "card_lmnp_turo": "Revenus Immobiliers LMNP & Flotte Turo",
      "card_senior_care": "Réserve Dépendance & EHPAD (78+ ans)",
      "card_family_plan": "Plan Enfants & Famille",
      "income_periods_title": "Revenus par tranche d'âge",
      "expense_periods_title": "Dépenses par tranche d'âge",
      "periods_summary_note_prefix": "Remarque :",
      "periods_summary_note_text": "Les montants nominaux futurs intègrent l'inflation cumulée au fil des années (flux réels constatés à cette période).",
      "card_estate_legacy": "Planification Successorale & Transmission",
      "card_healthspan_title": "Score d'Espérance de Vie en Bonne Santé",
      "card_preventive_budget_title": "Budget Santé Préventive par Âge",
      "card_health_roadmap_title": "Calendrier des Bilans de Santé Préventifs",

      // Formula Accordion Toggles
      "lbl_view_formula": "Voir la formule de calcul",
      "lbl_view_formula_short": "Voir la formule",
      "lbl_view_formula_fire": "Voir critères FIRE & règles de calcul",
      "lbl_view_formula_alloc": "Voir règles d'allocation & formule de rendement",
      "lbl_view_formula_lmnp": "Voir fiscalité LMNP & mécanisme d'amortissement",
      "lbl_view_formula_french_pension": "Voir formule retraite française (Réforme 2023)",
      "lbl_view_formula_vn_pension": "Voir formule assurance sociale volontaire VN (Loi 2024)",
      "lbl_view_formula_german_pension": "Voir formule retraite allemande (Points de retraite)",
      "lbl_view_formula_us_pension": "Voir formule Sécurité sociale américaine (SSA / AIME)",
      "lbl_view_formula_japan_pension": "Voir formule retraite japonaise (Nenkin à 2 piliers)",
      "lbl_view_formula_canada_pension": "Voir formule retraite canadienne (RPC & SV)",
      "lbl_view_formula_australia_pension": "Voir formule retraite australienne (Super & Pension)",
      "lbl_view_formula_korea_pension": "Voir formule retraite nationale coréenne (NPS)",
      "lbl_view_formula_taiwan_pension": "Voir formule retraite taïwanaise (Assurance travail)",
      "lbl_view_formula_ppp": "Voir sources de données & formule de parité PPA",
      "lbl_view_formula_inflation": "Voir formule inflation à 2 étapes & dérive de change",
      "lbl_view_formula_children": "Mécanisme des dépenses enfants & allocations familiales",
      "lbl_kid_cost_title": "Éducation enfant",
      "lbl_kid_uni_title": "Université",
      "lbl_kid_cost_hint": "Nourriture, scolarité, quotidien 0 - 18 ans",
      "lbl_kid_uni_hint": "Frais de scolarité & logement étudiant 18 - 23 ans",
      "lbl_view_formula_senior": "Voir formule du fonds de dépendance grand âge",
      "lbl_view_formula_healthspan": "Voir formule de l'écart d'incapacité (Healthspan Gap)",
      "lbl_view_formula_medical_roi": "Voir modèle de rentabilité (ROI) santé préventive",
      "lbl_view_formula_geo_health": "Voir effet géo-arbitrage santé France - Vietnam",
      "lbl_view_formula_property": "Voir formule de valorisation immobilière & amortissement",
      "lbl_view_formula_net_cashflow": "Voir formule du cashflow net immobilier",

      // Parameters
      "unit_age": "ans",
      "hint_toggle_gender": "Cliquer pour changer le sexe (Homme / Femme)",
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
      "chart_networth_desc": "Décomposition visuelle entre Patrimoine Net Total (immo inclus) et Portefeuille Liquide pour la retraite.",
      "chart_cashflow_title": "Projections des Flux Annuels (Cash-Flow)",
      "chart_cashflow_desc": "Équilibre annuel des revenus actifs, flux passifs, pensions, retraits du portefeuille et dépenses de subsistance.",
      "chart_tab_networth_label": "Patrimoine Net",
      "chart_tab_cashflow_label": "Flux de Trésorerie",
      "chart_tab_toggle_title": "Basculer entre les graphiques de Patrimoine Net et Flux Annuels",
      "chart_income_label": "Revenus",
      "chart_expense_label": "Dépenses",
      "chart_fire_target": "Objectif de Capital FIRE",
      "btn_view_nominal": "Valeur Future (Nominal)",
      "btn_view_real": "Pouvoir d'Achat Actuel (Réel)",
      "btn_cashflow_real": "Pouvoir d'Achat Actuel (Réel)",
      "btn_cashflow_real_title": "Par défaut : Afficher en pouvoir d'achat actuel corrigé de l'inflation",
      "btn_cashflow_nominal": "Valeur Future (Nominal)",
      "btn_cashflow_nominal_title": "Afficher en valeurs futures incluant l'inflation annuelle et l'érosion monétaire",
      "cashflow_inflation_notice_title": "Remarque importante :",
      "cashflow_inflation_notice_desc": "Le graphique est affiché en Valeur Future (Nominal). Les montants annuels de revenus, dépenses et retraits intègrent déjà l'inflation cumulée et l'érosion monétaire au fil des ans (les valeurs nominales progressent donc dans le temps).",
      "cashflow_tooltip_nominal_tag": "Inclut l'inflation cumulée et l'érosion monétaire",
      "cashflow_tooltip_real_tag": "Pouvoir d'achat actuel (Réel)",
      "chart_withdrawal_flow": "Flux de Retraits",
      "lbl_mode_real_tag": "Pouvoir d'achat",
      "lbl_mode_nominal_tag": "Valeur future",
      "cashflow_stress_title": "Simuler les Chocs :",
      "cf_chip_baseline": "Référence",
      "cf_chip_crash": "Krach Boursier Précoce (-35% An 1 & 2)",
      "cf_chip_crash_desc": "Le portefeuille subit des pertes (-35% An 1 & 2) sans modifier les dépenses du ménage. En cas d'épuisement des liquidités, il ne reste plus d'argent disponible à retirer.",
      "cf_chip_inflation": "Flambée Inflationniste (+30% Dépenses pdt 5 Ans)",
      "cf_chip_inflation_desc": "Les dépenses augmentent de 30% pendant 5 ans, exigeant des retraits accrus du portefeuille pour financer le déficit.",
      "cf_chip_medical": "Choc de Dépenses de Santé (18k € à 65 ans)",
      "cf_chip_medical_desc": "Dépense de santé imprévue (~18k €) à 65 ans, provoquant un pic soudain de dépenses et des retraits urgents.",
      "cf_baseline_ref_expense": "Dépenses (Scénario de référence)",
      "cf_baseline_ref_withdrawal": "Retraits (Scénario de référence)",
      "btn_toggle_compare_withdrawals": "Comparer 4 Stratégies de Retrait",
      "btn_toggle_compare_withdrawals_title": "Activer/désactiver la comparaison des 4 stratégies de retrait dès la retraite",
      "btn_toggle_compare_stress": "3 Pires Scénarios de Crise",
      "btn_toggle_compare_stress_title": "Activer/désactiver la comparaison des 3 pires scénarios : Krach précoce (-35%), Forte inflation, Choc médical",
      "btn_toggle_mc_fan": "Volatilité des Marchés Monte Carlo",
      "btn_toggle_mc_fan_title": "Afficher/Masquer l'éventail de volatilité des marchés Monte Carlo (P10 - P90) sur la trajectoire patrimoniale",
      "mc_p90_label": "90e Percentile (Marché Haussier)",
      "mc_p50_label": "50e Percentile (Médiane Attendue)",
      "mc_p10_label": "10e Percentile (Marché Baissier / Crise)",
      "scenario_baseline_label": "Scénario de Base",
      "scenario_crash_label": "Krach Précoce (-35%)",
      "scenario_inflation_label": "Forte Inflation (7%/an)",
      "scenario_medical_label": "Choc Médical (Âge 65)",
      "scenario_medical_withdrawal_label": "Retraits en cas de Choc médical",
      "scenario_inflation_withdrawal_label": "Retraits en cas de Flambée des prix",
      "scenario_crash_withdrawal_label": "Retraits en cas de Krach (-35%)",
      "scenario_crash_expense_label": "Dépenses en cas de Krach (-35%)",
      "scenario_medical_expense_label": "Dépenses en cas de Choc médical (Âge 65)",
      "scenario_inflation_expense_label": "Dépenses en cas de Flambée des prix (+4,5%/an)",
      "legend_actual": "Réel",
      "legend_liquid_portfolio": "Portefeuille Liquide",
      "legend_forecast_assets": "Actifs Projetés",
      "legend_total_networth": "Patrimoine Net Total",
      "legend_networth_realestate": "Patrimoine Net Total (avec Immo)",
      "why_liquid_strip_title": "Le Portefeuille Liquide prime sur le Patrimoine Total,",
      "why_liquid_strip_desc": "car il génère vos liquidités mensuelles de subsistance. Une maison de valeur ne permet pas d'en détacher des briques pour faire ses courses ou payer l'hôpital. Épuiser ses liquidités trop tôt contraint à brader ses biens immobiliers à la retraite.",

      // Actions & Generic
      "btn_edit": "Modifier",
      "btn_delete": "Supprimer",
      "btn_save": "Enregistrer",
      "btn_cancel": "Annuler",
      "btn_close": "Fermer",
      "status_active": "Actif",
      "status_inactive": "Inactif",
      "strategy_active": "Retrait au déficit réel",
      "strategy_inactive": "Retrait au Réel",
      "strategy_inactive_desc": "Le portefeuille couvre uniquement le déficit de vie",
      "smart_cap_title": "Retrait au déficit réel : Éviter les retraits superflus",
      "smart_cap_desc": "Lorsque la pension couvre les dépenses, seul le déficit réel est retiré du portefeuille, préservant ainsi le capital.",
      "excess_warning_title": "Attention : Déficit de trésorerie",
      "excess_warning_desc": "Les dépenses de vie dépassent les revenus totaux et le solde du portefeuille.",
      "badge_dual_inflation_active": "2 Étapes",
      "hint_dual_inflation_active": "Modèle d'inflation en 2 étapes appliqué ci-dessous",
      "lbl_property_name": "Nom du Bien (Identifiant)",
      "lbl_property_category": "Type de Propriété",
      "opt_property_apartment": "Appartement",
      "opt_property_house": "Maison Individuelle",
      "lbl_property_typology": "Typologie",
      "lbl_property_appreciation": "Ajustement Plus-value Annuelle (%)",
      "summary_optimal_age": "Âge Optimal :",
      "summary_not_feasible": "Pas encore réalisable",
      "summary_target_nest_egg": "Capital Cible",
      "status_solid": "Solide",
      "status_suboptimal": "Sous-optimal",
      "fire_p1_ok": "✓ Atteint : {have} / requis {need}",
      "fire_p1_fail": "✗ Non atteint : {have} à la retraite, requis {need} (manque {gap}). Reculez l'âge de départ ou épargnez plus.",
      "fire_p2_ok": "✓ Atteint : taux de réussite {rate}%",
      "fire_p2_fail": "✗ Non atteint : taux de réussite {rate}% (≥ 80% requis)",
      "fire_p3_ok": "✓ Atteint : {n}/{m} chocs surmontés",
      "fire_p3_fail": "✗ Non atteint : {n}/{m} chocs surmontés. Échec : {list}",
      "fire_p1_title": "1. Capital avant la retraite",
      "fire_verdict_ok": "✓ Atteint",
      "fire_verdict_fail": "✗ Non atteint",
      "fire_p1_hint": "Actifs liquides ≥ 25–30 fois le manque annuel",
      "fire_p1_tip": "Actifs liquides (hors immobilier) ≥ 25–30 fois le manque annuel (Manque = Dépenses retraite − Revenus retraite). Retraite ≤ 30 ans : 25x ; 30–35 ans : 28x ; > 35 ans : 30x.",
      "fire_p2_title": "2. Résiste aux aléas du marché",
      "fire_p2_hint": "1 000 scénarios aléatoires, réussite ≥ 80%",
      "fire_p2_tip": "1 000 scénarios de marché aléatoires sont simulés ; le taux de réussite doit être ≥ 80%.",
      "fire_p3_title": "3. Résiste à la maladie et aux crises",
      "fire_p3_hint": "Toujours ≥ 5 ans de manque couverts, dépenses ≥ 80%",
      "fire_p3_tip": "Les actifs liquides couvrent toujours ≥ 5 ans de manque ; les dépenses réelles restent ≥ 80% du plan initial (dépenses essentielles préservées).",
      "status_risky": "Risqué",
      "status_needs_adjust": "À Ajuster",
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
      "intro_a4": "Mécanisme de retrait naturel : le portefeuille n'est prélevé que lorsque les dépenses dépassent les revenus, préservant ainsi le capital et la transmission.",
      "intro_tag4": "MÉCANISME DE RETRAIT",
      "intro_q5": "Votre plan résistera-t-il à une forte inflation ou à des crises boursières sévères ?",
      "intro_a5": "Test de résistance sur 1 000 trajectoires Monte Carlo et modèle d'inflation à 2 paliers (EUR/VND) face aux pires baisses de marché.",
      "intro_tag5": "MONTE CARLO & INFLATION",
      "intro_q6": "Comment valoriser l'immobilier (maison vs copropriété amortie) et optimiser la fiscalité ?",
      "intro_a6": "Distingue la prise de valeur du foncier de l'amortissement du bâti sur 30 ans pour les appartements; intègre les barèmes fiscaux FR, US et VN.",
      "intro_tag6": "IMMOBILIER & FISCALITÉ",
      "intro_btn_start": "Commencer Dès Maintenant",
      "intro_footer_note": "100% Gratuit • Calculs locaux dans votre navigateur • Confidentialité absolue",
      "lbl_alloc_stocks": "Actions & ETF",
      "lbl_alloc_bonds": "Obligations & Épargne",
      "lbl_alloc_re": "Immobilier & Or",
      "lbl_alloc_cash": "Liquidités & Trésorerie",
      "lbl_alloc_cash_short": "Liq",
      "btn_add_investment": "+ Ajouter un investissement",
      "btn_reset_investments": "Réinitialiser",
      "title_reset_investments": "Réinitialiser le portefeuille",
      "msg_confirm_reset_alloc": "Voulez-vous réinitialiser votre portefeuille par défaut : Actions & ETF (60%), Obligations & Épargne (20%), Liquidités (0%) ?",
      "lbl_investment_name": "Nom de la catégorie",
      "lbl_investment_ratio": "Allocation",
      "lbl_investment_return": "Rendement annuel",
      "lbl_new_investment_default": "Nouvel investissement",
      "placeholder_investment_name": "Nom (ex: Actions, Or, Immobilier...)",
      "lbl_allocated_total": "Alloué",
      "lbl_unallocated_capital": "Liquidités dormantes (0%/an)",
      "lbl_fully_allocated": "100% Alloué",
      "lbl_alloc_rule_max100": "Règle 100% : Le total ne peut pas dépasser 100%.",
      "lbl_max_reached_hint": "Limite de 100% atteinte. Veuillez réduire une autre ligne avant d'augmenter celle-ci.",
      "lbl_alloc_idle_explanation": "Il reste <strong style=\"color: var(--text-main);\">{pct}%</strong> de liquidités dormantes. Chaque mois, votre épargne sera automatiquement investie selon cette allocation pour la simulation.",
      "lbl_alloc_fully_explanation": "Portefeuille alloué à <strong style=\"color: #10b981;\">100%</strong>. Chaque mois, votre épargne sera automatiquement investie selon cette allocation pour la simulation.",
      "lbl_alloc_disabled_explanation": "Portefeuille désactivé : Les liquidités et l'épargne mensuelle sont conservées en trésorerie (0% de rendement).",

      // Gemini AI On-Demand & Warnings
      "gemini_warning_title": "Les paramètres du plan ont changé",
      "gemini_warning_desc": "L'analyse ci-dessous est basée sur d'anciennes données. Cliquez pour réanalyser avec les données actuelles.",
      "gemini_btn_update": "Mettre à jour l'analyse IA",
      "gemini_btn_generate": "Générer l'analyse IA (Gemini)",
      "gemini_empty_title": "Aucune analyse IA générée pour ce graphique",
      "gemini_empty_desc": "Cliquez pour obtenir une analyse financière approfondie et des recommandations de Gemini.",
      "gemini_loading": "Analyse approfondie en cours avec Gemini AI...",
      "gemini_stale_time": "Non actualisé",
      "gemini_ready_badge": "Prêt",
      "gemini_btn_reanalyze": "Réanalyser",
      "gemini_btn_reanalyze_title": "Cliquez pour réanalyser avec Gemini AI",
      "gemini_updated_at": "Mis à jour à :",

      // Filet de Sécurité 3 Chocs & FIRE Blindé
      "stress_resilience_title": "Filet de Sécurité 3 Chocs & FIRE Blindé",
      "stress_resilience_sub": "Test de résistance indépendant face aux 3 pires scénarios de crise financière.",
      "stress_badge_bulletproof": "FIRE Blindé",
      "stress_badge_bulletproof_desc": "Remarquable ! Votre plan préserve le coussin de 5 ans et le niveau de vie à travers les 3 chocs majeurs.",
      "stress_badge_standard": "FIRE Standard",
      "stress_badge_standard_desc": "Viable en conditions normales, mais vulnérable en cas de choc économique majeur.",
      "stress_badge_fragile": "FIRE Vulnérable",
      "stress_badge_fragile_desc": "Nécessite une marge d'épargne accrue ou un départ différé pour absorber les chocs.",
      "stress_pass_tag": "Validé",
      "stress_fail_tag": "Vulnérable",
      "stress_gap_capital": "Capital requis approx.",
      "stress_gap_delay": "Ou décaler la retraite de",
      "stress_gap_years": "ans",
      "stress_test_market_crash": "Krach Boursier (-35%)",
      "stress_test_high_inflation": "Flambée Inflation (+30%)",
      "stress_test_medical_shock": "Choc Médical (18k €)",
      "stress_advice_label": "Conseil de défense tactique :",
      "stress_btn_view_chart": "Afficher le choc sur le graphique",
      "stress_details_toggle": "Conseils & Mécanisme",
      "stress_toggle_all_advice": "Afficher tous les conseils",
      "stress_hide_all_advice": "Masquer tous les conseils",
      "stress_mechanism_label": "Nature du risque :",
      "sidebar_stress_gate_ok": "• Coussin liquide ≥ 5 ans déficit net & Niveau de vie ≥ 80%",
      "stress_fail_floor": "Coussin liquide rompu à",
      "stress_fail_spending": "Baisse niveau de vie à",
      "stress_fail_depleted": "Épuisé à",
      "stress_spending_cut_desc": "Dépenses réelles sous 80% du niveau de base",

      // Profil Familial & Délocalisation (PPA Multi-Pays)
      "profile_modal_title": "Profil Familial & Délocalisation",
      "profile_gender_title": "1. Sexe du planificateur",
      "gender_male": "Homme",
      "gender_female": "Femme",
      "gender_male_badge": "Âge retraite 62 ans",
      "gender_female_badge": "Âge retraite 60 ans",
      "profile_target_title": "2. Ce plan est destiné à",
      "profile_family_type": "Situation Familiale",
      "profile_single": "Célibataire (1 personne)",
      "profile_married": "En couple / Partenaires (2 personnes)",
      "profile_single_short": "Célibataire",
      "profile_married_short": "En couple",
      "profile_retire_mode": "Lieu de résidence",
      "profile_retire_destination": "Où vous pourriez vous installer",
      "profile_mode_domestic": "Un seul lieu (Sur place)",
      "profile_mode_relocate": "Plusieurs lieux (Expatriation / Bi-résidence)",
      "profile_mode_hybrid": "Plusieurs lieux (Expatriation / Bi-résidence)",
      "profile_mode_domestic_short": "Un seul lieu",
      "profile_mode_domestic_sub": "Sur place",
      "profile_mode_relocate_short": "Plusieurs lieux",
      "profile_mode_relocate_sub": "Expatriation / Bi-résidence",
      "profile_work_location": "Lieu d'Activité & Épargne",
      "profile_retire_location": "Lieu de Retraite",
      "profile_summary_edit": "Changer de Profil",
      "profile_derived_callout": "Suggéré selon Votre Train de Vie Actuel",
      "profile_ppp_benchmarks": "Repères Sociaux de Référence"
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
      // Bảo vệ nhãn nút tài khoản người dùng nếu đã đăng nhập
      if (el.id === 'auth-btn-label' && window.Auth && typeof window.Auth.isLoggedIn === 'function' && window.Auth.isLoggedIn()) {
        return;
      }
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

  /**
   * Tự đăng ký từ điển động cho từng Module/Tab độc lập (Decentralized i18n)
   * Giúp các lập trình viên hoặc AI Agents thêm từ vựng riêng mà không cần sửa file i18n.js gốc
   * @param {string} namespace - Tên định danh phân hệ (ví dụ: 'health', 'taxes', 'community')
   * @param {Object} translationsByLang - Đối tượng dạng { vi: {...}, en: {...}, fr: {...} }
   */
  function registerTranslations(namespace, translationsByLang) {
    if (!translationsByLang || typeof translationsByLang !== 'object') return;
    SUPPORTED_LANGS.forEach(lang => {
      if (translationsByLang[lang] && typeof translationsByLang[lang] === 'object') {
        if (!translations[lang]) translations[lang] = {};
        Object.assign(translations[lang], translationsByLang[lang]);
      }
    });

    // Nếu DOM đã sẵn sàng, tự động áp dụng bản dịch mới cho các phần tử trên trang
    if (typeof document !== 'undefined' && document.body) {
      applyLanguage(currentLang);
    }
  }

  // Export module
  window.I18n = {
    t,
    setLanguage,
    getLanguage: () => currentLang,
    AVAILABLE_LANGUAGES,
    SUPPORTED_LANGS,
    registerTranslations,
    init
  };

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
