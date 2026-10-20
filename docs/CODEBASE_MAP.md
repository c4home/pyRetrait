# Bản Đồ Định Vị Mã Nguồn Tự Động (Codebase Map & Line-Range Index)

> **CẬP NHẬT TỰ ĐỘNG 100% BỞI `./verify_js.sh` (TỐN 0 TOKEN & 0 CÔNG SỨC):**  
> Bạn **KHÔNG BAO GIỜ** phải sửa file này bằng tay. Mỗi khi chạy `./verify_js.sh`, script sẽ tự động quét lại toàn bộ các hàm, thẻ HTML, phân mục CSS và từ điển đa ngôn ngữ để cập nhật số dòng chính xác trong 0.05 giây.  
> **Quy tắc bắt buộc cho AI:** Trước khi đọc hoặc sửa các file UI (`ui.js`, `ui-tab1-charts.js`, `ui-tab1-streams.js`, `ui-tab2-health.js`, `ui-tab3-taxes.js`, `ui-modals.js`), `index.html`, `styles.css`, `i18n.js`, `engine.js`, `patrimoine.js`, **bắt buộc tra bảng số dòng dưới đây** để gọi `view_file` đúng khoảng `StartLine` – `EndLine`.

---

## 1. `frontend/index.html` (6406 dòng)
| Khu vực / Thẻ ID | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `<header>` (Thanh điều hướng trên cùng) | `36 – 254` |
| `#tab-projections` | `255 – 371` |
| Cột 1: Các Luồng Thu nhập (`col1_income_header`) | `372 – 382` |
| `#card-asset-allocation-stream` | `383 – 473` |
| `#card-lmnp-income-stream` | `474 – 552` |
| `#card-french-pension-stream` | `553 – 684` |
| `#card-bhxh-income-stream` | `685 – 829` |
| `#card-german-pension-stream` | `830 – 958` |
| `#card-us-pension-stream` | `959 – 1087` |
| `#card-japan-pension-stream` | `1088 – 1216` |
| `#card-canada-pension-stream` | `1217 – 1359` |
| `#card-australia-pension-stream` | `1360 – 1502` |
| `#card-korea-pension-stream` | `1503 – 1631` |
| `#card-taiwan-pension-stream` | `1632 – 1773` |
| `#card-withdrawal-strategy-controls` | `1774 – 1829` |
| `#card-strat-bengen_4pct` | `1830 – 1856` |
| `#card-strat-guyton_klinger` | `1857 – 1890` |
| `#card-strat-vpw` | `1891 – 1922` |
| `#card-strat-fixed_pct` | `1923 – 2022` |
| Cột 2: Các Luồng Chi tiêu (`col2_expense_header`) | `2023 – 2032` |
| `#card-retire-expense-stream` | `2033 – 2254` |
| `#card-dual-inflation-stream` | `2255 – 2361` |
| `#card-children-family-stream` | `2362 – 2486` |
| `#card-senior-care-stream` | `2487 – 2561` |
| `#card-estate-legacy-combined` | `2562 – 2650` |
| `#section-gemini-projections` | `2651 – 2733` |
| `#chart-networth` | `2734 – 2759` |
| `#chart-cashflow` | `2760 – 2767` |
| `#tab-taxes` | `2768 – 2797` |
| `#card-sustainable-spending` | `2798 – 2934` |
| `#section-country-tools-wrapper` | `2935 – 2954` |
| `#card-pea-masterclass` | `2955 – 3126` |
| `#card-assurance-vie-masterclass` | `3127 – 3301` |
| `#card-livret-masterclass` | `3302 – 3478` |
| `#card-estate-inheritance-masterclass` | `3479 – 3572` |
| `#card-vietnam-tools` | `3573 – 3649` |
| `#card-us-tools` | `3650 – 3726` |
| `#card-germany-tools` | `3727 – 3788` |
| `#card-international-tools` | `3789 – 3854` |
| `#tab-estate` | `3855 – 3891` |
| `#card-healthspan-score` | `3892 – 3919` |
| `#card-couple-primary-col` | `3920 – 3941` |
| `#card-couple-spouse-col` | `3942 – 4350` |
| `#card-longevity-nutrition` | `4351 – 4576` |
| `#card-health-roadmap` | `4577 – 4714` |
| `#card-franco-viet-guide` | `4715 – 4810` |
| `#card-elderly-care-comparison` | `4811 – 4882` |
| `#plan-modal` | `4883 – 5170` |
| `#income-modal` | `5171 – 5225` |
| `#expense-modal` | `5226 – 5320` |
| `#actual-networth-modal` | `5321 – 5401` |
| `#milestone-modal` | `5402 – 5509` |
| `#modal-gemini-settings` | `5510 – 5563` |
| `#apartment-modal` | `5564 – 5749` |
| `#auth-modal` | `5750 – 5833` |
| `#modal-formula-guide` | `5834 – 6068` |
| `#quick-setup-modal` | `6069 – 6284` |
| `#confirm-modal` | `6285 – 6303` |
| `#feature-intro-modal` | `6304 – 6406` |

---

## 2. `frontend/css/styles.css` (9809 dòng)
| Phân mục CSS (`/* === ... === */`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| pyRetrait — Premium Design System & Theme Stylesheet | `1 – 78` |
| Base & Reset | `79 – 106` |
| Iconify Unified Icon System | `107 – 157` |
| Top Navigation Bar | `158 – 593` |
| Buttons & Interactive Elements | `594 – 710` |
| App Layout & Sidebar | `711 – 895` |
| Main Content Area & Dashboard KPIs | `896 – 994` |
| Cards & Layout Panels | `995 – 1202` |
| Form Controls & Inputs | `1203 – 1351` |
| Expandable Panels for Advanced Modules | `1352 – 1634` |
| Income & Expense Streams Side-by-Side Layout | `1635 – 1808` |
| Expense Streams & Crédits | `1809 – 2878` |
| Withdrawal Strategy Cards | `2879 – 3044` |
| Monte Carlo Stats Integrated in Chart Card | `3045 – 3149` |
| What-If Scenarios List | `3150 – 3199` |
| Spending Phases Card & Estate | `3200 – 3224` |
| AI Advisor Panel | `3225 – 3373` |
| Data Table | `3374 – 3415` |
| Dropdown Menus & Modals | `3416 – 3678` |
| Life Milestones Visuals & Markers | `3679 – 3905` |
| French Accounts Tracking & Withdrawal Waterfall Styles | `3906 – 4051` |
| Gemini AI Insights & Chart Commentary Component | `4052 – 4630` |
| Responsive Breakpoints & Layout Adaptations | `4631 – 4720` |
| Print / Export Report Stylesheet | `4721 – 4754` |
| pyLocation / Patrimoine Custom Component Styles | `4755 – 4772` |
| Inline Financial & Mathematical Formulas (Direct Verification) | `4773 – 4775` |
| Collapsible Formula Accordion (Mass Audience UX - Anti-Overwhelm) | `4776 – 5001` |
| PEA Masterclass & Strategic Tips (Native pyRetrait Design System) | `5002 – 5236` |
| Family & Children Planning: Side-by-Side (Inputs Left, Formulas Right) | `5237 – 5324` |
| Estate Planning & Legacy Milestone: Unified Composite Card | `5325 – 5397` |
| Retirement Spending Smile: Side-by-Side (Inputs Left, Budget & Science Right) | `5398 – 5540` |
| Dual-Theme (Light & Dark) UI Optimization & Period Timeline Cards | `5541 – 6057` |
| Cross-Tab Unified Light/Dark Mode Components & Accents | `6058 – 6542` |
| Franco-Viet Guide Components (Health, Pension, Cross-border Benefits) | `6543 – 6721` |
| Onboarding Wizard (Thiết Lập Nhanh 4 Bước) | `6722 – 7110` |
| Feature Discovery / Capabilities Intro Modal | `7111 – 7390` |
| Special Expense Item: Kế Hoạch Thừa Kế & Đánh Giá Mục Tiêu Di Sản | `7391 – 7452` |
| Tab Hero Banners (Universal Philosophy & Core Questions/Answers) | `7453 – 7815` |
| Advanced Healthspan Features (1, 3, 4, 5) | `7816 – 8253` |
| Longevity Nutrition Matrix (3-Column Layout: Sáng, Trưa, Tối) | `8254 – 8271` |
| Longevity Nutrition Matrix Styling | `8272 – 8289` |
| Cellular Hydration & Electrolytes Protocol (70% Body Weight) | `8290 – 8744` |
| Health 3-Tier Layout Architecture | `8745 – 8774` |
| Tab Quản Lý Rủi Ro: Bố Cục 2 Tầng Dọc Liền Mạch (Sequential 2-Tier Dashboard) | `8775 – 8839` |
| Lưới An Toàn 3 Biến Cố & FIRE Bền Bỉ (Triple-Shock Safety Net & Bulletproof FIRE) | `8840 – 9154` |
| .profile-summary-bar { | `9155 – 9619` |
| DÒNG GHI CHÚ: VÌ SAO TIỀN MẶT & QUỸ ĐẦU TƯ QUAN TRỌNG HƠN TỔNG TÀI SẢN | `9620 – 9658` |
| TAB 3: LỜI KHUYÊN & CÔNG CỤ TÀI CHÍNH THEO QUỐC GIA (SMART TIPS HUB) | `9659 – 9809` |

---

## 3. `frontend/js/i18n.js` (1057 dòng) & `state.js` (553 dòng — Tầng 2 State)
### `i18n.js`
| Từ điển / Hàm | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| Từ điển `vi` | `21 – 303` |
| Từ điển `en` | `304 – 586` |
| Từ điển `fr` | `587 – 871` |
| `getSavedLanguage()` | `872 – 883` |
| `t()` | `884 – 895` |
| `applyLanguage()` | `896 – 946` |
| `setLanguage()` | `947 – 950` |
| `renderLanguageDropdown()` | `951 – 988` |
| `toggleDropdown()` | `989 – 1004` |
| `closeDropdown()` | `1005 – 1013` |
| `init()` | `1014 – 1057` |

### `state.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `on()` | `30 – 35` |
| `off()` | `36 – 40` |
| `emit()` | `41 – 48` |
| `getState()` | `49 – 52` |
| `getActivePlan()` | `53 – 59` |
| `setActivePlanId()` | `60 – 71` |
| `getCurrency()` | `72 – 75` |
| `setCurrency()` | `76 – 80` |
| `getViewMode()` | `81 – 84` |
| `setViewMode()` | `85 – 89` |
| `getActiveTab()` | `90 – 93` |
| `setActiveTab()` | `94 – 98` |
| `ensurePlanDefaults()` | `99 – 229` |
| `syncSalaryStreamsWithMaritalStatus()` | `230 – 327` |
| `applySavedUserPreferences()` | `328 – 360` |
| `savePlansToStorage()` | `361 – 404` |
| `debouncedSavePlansToStorage()` | `405 – 408` |
| `loadInitialPlans()` | `409 – 553` |

---

## 4. `frontend/js/engine.js` (1680 dòng — Tầng 1 Core Engine)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getCurrencySymbol()` | `9 – 16` |
| `formatCurrency()` | `17 – 58` |
| `calculateWeightedReturn()` | `59 – 86` |
| `calculateMortgageSchedule()` | `87 – 94` |
| `calculateCombinedMortgageSchedule()` | `95 – 134` |
| `computePropertyValue()` | `135 – 186` |
| `calculateSingleMortgageSchedule()` | `187 – 308` |
| `evaluateStressResilience()` | `309 – 479` |
| `findOptimalRetirementAge()` | `480 – 595` |
| `runProjection()` | `596 – 1680` |

---

## 5. Tầng 3 UI — Nhạc Trưởng & 3 Tab Độc Lập + Modals
### 5.1. `frontend/js/ui.js` (916 dòng — Nhạc trưởng điều phối trung tâm)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `30 – 34` |
| `parseVal()` | `35 – 41` |
| `setVal()` | `42 – 46` |
| `showConfirmDialog()` | `47 – 55` |
| `closeConfirmDialog()` | `56 – 80` |
| `initApp()` | `81 – 106` |
| `arrangeAiAndControlsColumns()` | `107 – 130` |
| `loadInitialPlans()` | `131 – 138` |
| `savePlansToStorage()` | `139 – 148` |
| `debouncedSavePlansToStorage()` | `149 – 155` |
| `getActivePlan()` | `156 – 167` |
| `bindEvents()` | `168 – 289` |
| `syncSalaryStreamsWithRetireAge()` | `290 – 300` |
| `bindInput()` | `301 – 329` |
| `switchTab()` | `330 – 344` |
| `renderActiveTab()` | `345 – 353` |
| `renderActivePlanInputs()` | `354 – 563` |
| `updateAll()` | `564 – 752` |
| `convertPlanCurrency()` | `753 – 785` |
| `setCurrency()` | `786 – 807` |
| `setViewMode()` | `808 – 819` |
| `updateThemeIcon()` | `820 – 830` |
| `toggleTheme()` | `831 – 841` |
| `loadTheme()` | `842 – 916` |

### 5.2. `frontend/js/ui-tab1-charts.js` (1852 dòng — Tab 1A: Biểu đồ, Monte Carlo, Biến cố & Bảng năm)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `16 – 20` |
| `parseVal()` | `21 – 27` |
| `setVal()` | `28 – 32` |
| `escapeHtml()` | `33 – 54` |
| `getActivePlan()` | `55 – 62` |
| `savePlansToStorage()` | `63 – 72` |
| `debouncedSavePlansToStorage()` | `73 – 83` |
| `bindTab1ChartEvents()` | `84 – 191` |
| `triggerPlanProjectionsInsight()` | `192 – 273` |
| `renderMilestonesRibbon()` | `274 – 340` |
| `renderStressResilienceCard()` | `341 – 495` |
| `drawMilestoneMarkers()` | `496 – 613` |
| `renderNetWorthChart()` | `614 – 1103` |
| `renderCashFlowChart()` | `1104 – 1341` |
| `renderProjectionsTable()` | `1342 – 1401` |
| `renderMonteCarloTab()` | `1402 – 1633` |
| `renderScenarioTab()` | `1634 – 1852` |

### 5.3. `frontend/js/ui-tab1-streams.js` (3057 dòng — Tab 1B: Luồng Thu/Chi, Phân bổ tài sản & 4 Chiến lược)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `16 – 20` |
| `parseVal()` | `21 – 27` |
| `setVal()` | `28 – 32` |
| `escapeHtml()` | `33 – 54` |
| `getActivePlan()` | `55 – 62` |
| `savePlansToStorage()` | `63 – 72` |
| `debouncedSavePlansToStorage()` | `73 – 82` |
| `formatGenderAgeText()` | `83 – 93` |
| `bindTab1StreamEvents()` | `94 – 794` |
| `ensureAssetAllocationCardPosition()` | `795 – 805` |
| `ensureDualInflationCardPosition()` | `806 – 813` |
| `updateAssetAllocationUI()` | `814 – 928` |
| `updateDualInflationUI()` | `929 – 1036` |
| `updateRetirementLocationUI()` | `1037 – 1062` |
| `computeIncomePeriods()` | `1063 – 1201` |
| `renderIncomePeriodsSummary()` | `1202 – 1351` |
| `renderIncomeStreamsList()` | `1352 – 1493` |
| `getActiveIncomeAtAge()` | `1494 – 1509` |
| `ensureDefaultExpenseStreams()` | `1510 – 1577` |
| `getActiveExpensesAtAge()` | `1578 – 1626` |
| `updateCashflowBalanceUI()` | `1627 – 1727` |
| `syncSavingsAndExpensesFromRate()` | `1728 – 1731` |
| `updateSavingsRateUI()` | `1732 – 1736` |
| `applyProfileVisibilityRules()` | `1737 – 2309` |
| `updateRetirementLocationRadiosUI()` | `2310 – 2479` |
| `updateExpenseSavingsHints()` | `2480 – 2484` |
| `renderExpensePeriodsSummary()` | `2485 – 2776` |
| `renderExpenseStreamsList()` | `2777 – 2891` |
| `updateWithdrawalStrategyCards()` | `2892 – 2903` |
| `hexToRgba()` | `2904 – 3022` |
| `renderWithdrawalComparison()` | `3023 – 3057` |

### 5.4. `frontend/js/ui-tab2-health.js` (1759 dòng — Tab 2: Sức khỏe, Con cái & Y tế dự phòng)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `14 – 18` |
| `parseVal()` | `19 – 25` |
| `setVal()` | `26 – 30` |
| `escapeHtml()` | `31 – 52` |
| `getActivePlan()` | `53 – 60` |
| `savePlansToStorage()` | `61 – 70` |
| `debouncedSavePlansToStorage()` | `71 – 78` |
| `getCurrency()` | `79 – 88` |
| `ensureHealthProfiles()` | `89 – 116` |
| `saveCurrentHealthInputs()` | `117 – 138` |
| `loadHealthMemberInputs()` | `139 – 165` |
| `calculateMemberMetrics()` | `166 – 229` |
| `updateBioAge()` | `230 – 301` |
| `updateHealthspanScore()` | `302 – 441` |
| `updateCrossBorderChecklist()` | `442 – 491` |
| `updateBiomarkersForGender()` | `492 – 566` |
| `switchHealthMember()` | `567 – 581` |
| `updateCoupleHealthOverview()` | `582 – 659` |
| `renderHealthTab()` | `660 – 699` |
| `initHealthTabEvents()` | `700 – 773` |
| `bindTab2Events()` | `774 – 1002` |
| `updateSeniorCareUI()` | `1003 – 1068` |
| `updateFamilyStreamUI()` | `1069 – 1247` |
| `updateFamilyChildrenSimulation()` | `1248 – 1348` |
| `renderFamilyCashFlowChart()` | `1349 – 1532` |
| `initFamilyChildrenSimulation()` | `1533 – 1569` |
| `updateEstateMilestones()` | `1570 – 1632` |
| `renderEstateTab()` | `1633 – 1639` |
| `renderAdvisorTab()` | `1640 – 1759` |

### 5.5. `frontend/js/ui-tab3-taxes.js` (2881 dòng — Tab 3: Tối ưu Thuế, Lương hưu Pháp/VN & LMNP)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `14 – 18` |
| `parseVal()` | `19 – 25` |
| `setVal()` | `26 – 30` |
| `escapeHtml()` | `31 – 52` |
| `getActivePlan()` | `53 – 60` |
| `savePlansToStorage()` | `61 – 70` |
| `debouncedSavePlansToStorage()` | `71 – 81` |
| `bindTab3Events()` | `82 – 810` |
| `initFrancoVietGuideInteractions()` | `811 – 858` |
| `getPlanActiveCountries()` | `859 – 876` |
| `renderCountryFilterBar()` | `877 – 933` |
| `applyCountryToolsFilter()` | `934 – 949` |
| `updateTaxRegimeUI()` | `950 – 966` |
| `renderGlobalAccountsContent()` | `967 – 1059` |
| `estimateFrenchFullPension()` | `1060 – 1082` |
| `getPrimarySalaryIncome()` | `1083 – 1097` |
| `syncPensionBaseAuto()` | `1098 – 1121` |
| `updatePensionDecoteUI()` | `1122 – 1225` |
| `updateBhxhVnUI()` | `1226 – 1407` |
| `updateGermanPensionUI()` | `1408 – 1497` |
| `updateUsPensionUI()` | `1498 – 1587` |
| `updateJapanPensionUI()` | `1588 – 1679` |
| `updateCanadaPensionUI()` | `1680 – 1777` |
| `updateAustraliaPensionUI()` | `1778 – 1875` |
| `updateKoreaPensionUI()` | `1876 – 1967` |
| `updateTaiwanPensionUI()` | `1968 – 2059` |
| `syncBhxhVnStreams()` | `2060 – 2150` |
| `eurToPlanFactor()` | `2151 – 2158` |
| `extractPatrimoineLoansEur()` | `2159 – 2189` |
| `buildPatrimoineLoans()` | `2190 – 2210` |
| `applyPatrimoineToPlan()` | `2211 – 2318` |
| `fetchPatrimoineData()` | `2319 – 2334` |
| `syncFromPatrimoine()` | `2335 – 2347` |
| `updateLmnpUI()` | `2348 – 2544` |
| `renderPatrimoineLoansList()` | `2545 – 2567` |
| `updateMortgageUI()` | `2568 – 2653` |
| `syncMortgageToExpenseStreams()` | `2654 – 2743` |
| `renderTaxTab()` | `2744 – 2881` |

### 5.6. `frontend/js/ui-modals.js` (1938 dòng — Popup Modals & Thiết lập nhanh Wizard)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `14 – 18` |
| `parseVal()` | `19 – 25` |
| `setVal()` | `26 – 30` |
| `escapeHtml()` | `31 – 52` |
| `getActivePlan()` | `53 – 60` |
| `savePlansToStorage()` | `61 – 70` |
| `debouncedSavePlansToStorage()` | `71 – 83` |
| `showConfirmDialog()` | `84 – 114` |
| `closeConfirmDialog()` | `115 – 123` |
| `openFormulaModal()` | `124 – 132` |
| `closeFormulaModal()` | `133 – 140` |
| `openFeatureIntroModal()` | `141 – 148` |
| `closeFeatureIntroModal()` | `149 – 163` |
| `initModals()` | `164 – 233` |
| `bindModalEvents()` | `234 – 470` |
| `openExpenseModal()` | `471 – 511` |
| `syncExpenseGrowthVisibility()` | `512 – 517` |
| `closeExpenseModal()` | `518 – 522` |
| `saveExpenseFromModal()` | `523 – 565` |
| `openIncomeModal()` | `566 – 600` |
| `closeIncomeModal()` | `601 – 604` |
| `saveIncomeFromModal()` | `605 – 671` |
| `openMilestoneModal()` | `672 – 683` |
| `closeMilestoneModal()` | `684 – 689` |
| `renderModalMilestonesContent()` | `690 – 773` |
| `showMilestoneForm()` | `774 – 805` |
| `hideMilestoneForm()` | `806 – 810` |
| `saveMilestoneFromForm()` | `811 – 849` |
| `openActualNetWorthModal()` | `850 – 871` |
| `closeActualNetWorthModal()` | `872 – 876` |
| `renderActualRecordsTable()` | `877 – 929` |
| `addActualRecordFromForm()` | `930 – 983` |
| `deleteActualRecord()` | `984 – 995` |
| `fetchPatrimoineBalanceForActual()` | `996 – 1039` |
| `renderPlanSelector()` | `1040 – 1046` |
| `openModal()` | `1047 – 1117` |
| `updatePlanModalPppTags()` | `1118 – 1165` |
| `updateRetireCityOptionsDiff()` | `1166 – 1207` |
| `setPlanGender()` | `1208 – 1222` |
| `setPlanFamily()` | `1223 – 1237` |
| `setPlanRetireMode()` | `1238 – 1268` |
| `handlePlanWorkCityChange()` | `1269 – 1294` |
| `closeModal()` | `1295 – 1299` |
| `saveNewPlanFromModal()` | `1300 – 1529` |
| `duplicateCurrentPlan()` | `1530 – 1544` |
| `deleteCurrentPlan()` | `1545 – 1571` |
| `handleJSONImport()` | `1572 – 1601` |
| `initQuickSetupWizard()` | `1602 – 1730` |
| `updateSpendCalcText()` | `1731 – 1746` |
| `openQuickSetupWizard()` | `1747 – 1803` |
| `closeQuickSetupWizard()` | `1804 – 1808` |
| `showWizardStep()` | `1809 – 1835` |
| `applyWizardAndCalculate()` | `1836 – 1938` |

---

## 6. `frontend/js/patrimoine.js` (1526 dòng)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `formatMoneyEUR()` | `14 – 18` |
| `formatMoneyVND()` | `19 – 28` |
| `getGuestPatrimoine()` | `29 – 37` |
| `saveGuestPatrimoine()` | `38 – 52` |
| `numOr()` | `53 – 57` |
| `truthyOr()` | `58 – 69` |
| `calcNotaryFees()` | `70 – 82` |
| `calcMonthlyPayment()` | `83 – 96` |
| `computeApartmentMetrics()` | `97 – 173` |
| `computeFullPatrimoine()` | `174 – 200` |
| `loadRawData()` | `201 – 230` |
| `saveRawToCloud()` | `231 – 239` |
| `loadData()` | `240 – 245` |
| `render()` | `246 – 256` |
| `renderKPIs()` | `257 – 298` |
| `renderApartmentsList()` | `299 – 399` |
| `renderChart()` | `400 – 500` |
| `renderBreakEvenSection()` | `501 – 535` |
| `updateBreakEvenView()` | `536 – 552` |
| `renderBreakEvenSingleApt()` | `553 – 825` |
| `renderBreakEvenComparisonAll()` | `826 – 974` |
| `renderGeminiAIBox()` | `975 – 997` |
| `autoSyncToFire()` | `998 – 1011` |
| `showAutoSyncToast()` | `1012 – 1054` |
| `removeApartmentFromObject()` | `1055 – 1070` |
| `openApartmentModal()` | `1071 – 1169` |
| `updatePropertyFormulaUI()` | `1170 – 1193` |
| `closeApartmentModal()` | `1194 – 1198` |
| `saveApartment()` | `1199 – 1302` |
| `deleteApartment()` | `1303 – 1361` |
| `setVal()` | `1362 – 1366` |
| `getVal()` | `1367 – 1371` |
| `updateAptLiveSummary()` | `1372 – 1430` |
| `bindEvents()` | `1431 – 1526` |

---

## 7. `frontend/js/taxOptimizer.js` (1376 dòng), `monteCarlo.js` (265 dòng) & `geminiAdvisor.js` (424 dòng)
### `taxOptimizer.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `calculateProgressiveTax()` | `110 – 212` |
| `computeFrenchTaxParts()` | `213 – 251` |
| `calculateTaxDetailed()` | `252 – 432` |
| `calculateRetireBudgetFromCashflow()` | `433 – 531` |
| `getSuggestedRetirementBudget()` | `532 – 577` |
| `calculateFrenchPension()` | `578 – 653` |
| `calculateVietnamBhxhPension()` | `654 – 733` |
| `calculateGermanPension()` | `734 – 805` |
| `calculateUsSocialSecurityPension()` | `806 – 897` |
| `calculateJapanPension()` | `898 – 975` |
| `calculateCanadaPension()` | `976 – 1062` |
| `calculateAustraliaPension()` | `1063 – 1138` |
| `calculateKoreaPension()` | `1139 – 1215` |
| `calculateTaiwanPension()` | `1216 – 1292` |
| `simulateWithdrawalWaterfall()` | `1293 – 1376` |

### `monteCarlo.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `mulberry32()` | `9 – 18` |
| `createRandomNormal()` | `19 – 30` |
| `runSimulation()` | `31 – 265` |

### `geminiAdvisor.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `renderMarkdown()` | `19 – 63` |
| `hashString()` | `64 – 72` |
| `computeCacheKey()` | `73 – 103` |
| `getStoredInsights()` | `104 – 113` |
| `setStoredInsight()` | `114 – 123` |
| `resolveModelLabel()` | `124 – 142` |
| `updateActionButton()` | `143 – 183` |
| `fetchChartInsight()` | `184 – 224` |
| `updateChartBox()` | `225 – 394` |
| `clearCache()` | `395 – 424` |
