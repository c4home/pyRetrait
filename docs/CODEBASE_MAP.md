# Bản Đồ Định Vị Mã Nguồn Tự Động (Codebase Map & Line-Range Index)

> **CẬP NHẬT TỰ ĐỘNG 100% BỞI `./verify_js.sh` (TỐN 0 TOKEN & 0 CÔNG SỨC):**  
> Bạn **KHÔNG BAO GIỜ** phải sửa file này bằng tay. Mỗi khi chạy `./verify_js.sh`, script sẽ tự động quét lại toàn bộ các hàm, thẻ HTML, phân mục CSS và từ điển đa ngôn ngữ để cập nhật số dòng chính xác trong 0.05 giây.  
> **Quy tắc bắt buộc cho AI:** Trước khi đọc hoặc sửa các file UI (`ui.js`, `ui-tab1-charts.js`, `ui-tab1-streams.js`, `ui-tab2-health.js`, `ui-tab3-taxes.js`, `ui-modals.js`), `index.html`, `styles.css`, `i18n.js`, `engine.js`, `patrimoine.js`, **bắt buộc tra bảng số dòng dưới đây** để gọi `view_file` đúng khoảng `StartLine` – `EndLine`.

---

## 1. `frontend/index.html` (6417 dòng)
| Khu vực / Thẻ ID | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `<header>` (Thanh điều hướng trên cùng) | `40 – 258` |
| `#tab-projections` | `259 – 375` |
| Cột 1: Các Luồng Thu nhập (`col1_income_header`) | `376 – 386` |
| `#card-asset-allocation-stream` | `387 – 477` |
| `#card-lmnp-income-stream` | `478 – 556` |
| `#card-french-pension-stream` | `557 – 688` |
| `#card-bhxh-income-stream` | `689 – 833` |
| `#card-german-pension-stream` | `834 – 962` |
| `#card-us-pension-stream` | `963 – 1091` |
| `#card-japan-pension-stream` | `1092 – 1220` |
| `#card-canada-pension-stream` | `1221 – 1363` |
| `#card-australia-pension-stream` | `1364 – 1506` |
| `#card-korea-pension-stream` | `1507 – 1635` |
| `#card-taiwan-pension-stream` | `1636 – 1777` |
| `#card-withdrawal-strategy-controls` | `1778 – 1833` |
| `#card-strat-bengen_4pct` | `1834 – 1860` |
| `#card-strat-guyton_klinger` | `1861 – 1894` |
| `#card-strat-vpw` | `1895 – 1926` |
| `#card-strat-fixed_pct` | `1927 – 2026` |
| Cột 2: Các Luồng Chi tiêu (`col2_expense_header`) | `2027 – 2036` |
| `#card-retire-expense-stream` | `2037 – 2258` |
| `#card-dual-inflation-stream` | `2259 – 2365` |
| `#card-children-family-stream` | `2366 – 2491` |
| `#card-senior-care-stream` | `2492 – 2566` |
| `#card-estate-legacy-combined` | `2567 – 2661` |
| `#section-gemini-projections` | `2662 – 2744` |
| `#chart-networth` | `2745 – 2770` |
| `#chart-cashflow` | `2771 – 2778` |
| `#tab-taxes` | `2779 – 2808` |
| `#card-sustainable-spending` | `2809 – 2945` |
| `#section-country-tools-wrapper` | `2946 – 2965` |
| `#card-pea-masterclass` | `2966 – 3137` |
| `#card-assurance-vie-masterclass` | `3138 – 3312` |
| `#card-livret-masterclass` | `3313 – 3489` |
| `#card-estate-inheritance-masterclass` | `3490 – 3583` |
| `#card-vietnam-tools` | `3584 – 3660` |
| `#card-us-tools` | `3661 – 3737` |
| `#card-germany-tools` | `3738 – 3799` |
| `#card-international-tools` | `3800 – 3865` |
| `#tab-estate` | `3866 – 3902` |
| `#card-healthspan-score` | `3903 – 3930` |
| `#card-couple-primary-col` | `3931 – 3952` |
| `#card-couple-spouse-col` | `3953 – 4361` |
| `#card-longevity-nutrition` | `4362 – 4587` |
| `#card-health-roadmap` | `4588 – 4725` |
| `#card-franco-viet-guide` | `4726 – 4821` |
| `#card-elderly-care-comparison` | `4822 – 4893` |
| `#plan-modal` | `4894 – 5181` |
| `#income-modal` | `5182 – 5236` |
| `#expense-modal` | `5237 – 5331` |
| `#actual-networth-modal` | `5332 – 5412` |
| `#milestone-modal` | `5413 – 5520` |
| `#modal-gemini-settings` | `5521 – 5574` |
| `#apartment-modal` | `5575 – 5760` |
| `#auth-modal` | `5761 – 5844` |
| `#modal-formula-guide` | `5845 – 6079` |
| `#quick-setup-modal` | `6080 – 6295` |
| `#confirm-modal` | `6296 – 6314` |
| `#feature-intro-modal` | `6315 – 6417` |

---

## 2. `frontend/css/styles.css` (9846 dòng)
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
| Income & Expense Streams Side-by-Side Layout | `1635 – 1845` |
| Expense Streams & Crédits | `1846 – 2915` |
| Withdrawal Strategy Cards | `2916 – 3081` |
| Monte Carlo Stats Integrated in Chart Card | `3082 – 3186` |
| What-If Scenarios List | `3187 – 3236` |
| Spending Phases Card & Estate | `3237 – 3261` |
| AI Advisor Panel | `3262 – 3410` |
| Data Table | `3411 – 3452` |
| Dropdown Menus & Modals | `3453 – 3715` |
| Life Milestones Visuals & Markers | `3716 – 3942` |
| French Accounts Tracking & Withdrawal Waterfall Styles | `3943 – 4088` |
| Gemini AI Insights & Chart Commentary Component | `4089 – 4667` |
| Responsive Breakpoints & Layout Adaptations | `4668 – 4757` |
| Print / Export Report Stylesheet | `4758 – 4791` |
| pyLocation / Patrimoine Custom Component Styles | `4792 – 4809` |
| Inline Financial & Mathematical Formulas (Direct Verification) | `4810 – 4812` |
| Collapsible Formula Accordion (Mass Audience UX - Anti-Overwhelm) | `4813 – 5038` |
| PEA Masterclass & Strategic Tips (Native pyRetrait Design System) | `5039 – 5273` |
| Family & Children Planning: Side-by-Side (Inputs Left, Formulas Right) | `5274 – 5361` |
| Estate Planning & Legacy Milestone: Unified Composite Card | `5362 – 5434` |
| Retirement Spending Smile: Side-by-Side (Inputs Left, Budget & Science Right) | `5435 – 5577` |
| Dual-Theme (Light & Dark) UI Optimization & Period Timeline Cards | `5578 – 6094` |
| Cross-Tab Unified Light/Dark Mode Components & Accents | `6095 – 6579` |
| Franco-Viet Guide Components (Health, Pension, Cross-border Benefits) | `6580 – 6758` |
| Onboarding Wizard (Thiết Lập Nhanh 4 Bước) | `6759 – 7147` |
| Feature Discovery / Capabilities Intro Modal | `7148 – 7427` |
| Special Expense Item: Kế Hoạch Thừa Kế & Đánh Giá Mục Tiêu Di Sản | `7428 – 7489` |
| Tab Hero Banners (Universal Philosophy & Core Questions/Answers) | `7490 – 7852` |
| Advanced Healthspan Features (1, 3, 4, 5) | `7853 – 8290` |
| Longevity Nutrition Matrix (3-Column Layout: Sáng, Trưa, Tối) | `8291 – 8308` |
| Longevity Nutrition Matrix Styling | `8309 – 8326` |
| Cellular Hydration & Electrolytes Protocol (70% Body Weight) | `8327 – 8781` |
| Health 3-Tier Layout Architecture | `8782 – 8811` |
| Tab Quản Lý Rủi Ro: Bố Cục 2 Tầng Dọc Liền Mạch (Sequential 2-Tier Dashboard) | `8812 – 8876` |
| Lưới An Toàn 3 Biến Cố & FIRE Bền Bỉ (Triple-Shock Safety Net & Bulletproof FIRE) | `8877 – 9191` |
| .profile-summary-bar { | `9192 – 9656` |
| DÒNG GHI CHÚ: VÌ SAO TIỀN MẶT & QUỸ ĐẦU TƯ QUAN TRỌNG HƠN TỔNG TÀI SẢN | `9657 – 9695` |
| TAB 3: LỜI KHUYÊN & CÔNG CỤ TÀI CHÍNH THEO QUỐC GIA (SMART TIPS HUB) | `9696 – 9846` |

---

## 3. `frontend/js/i18n.js` (1103 dòng) & `state.js` (581 dòng — Tầng 2 State)
### `i18n.js`
| Từ điển / Hàm | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| Từ điển `vi` | `21 – 311` |
| Từ điển `en` | `312 – 602` |
| Từ điển `fr` | `603 – 895` |
| `getSavedLanguage()` | `896 – 907` |
| `t()` | `908 – 919` |
| `applyLanguage()` | `920 – 970` |
| `setLanguage()` | `971 – 974` |
| `renderLanguageDropdown()` | `975 – 1012` |
| `toggleDropdown()` | `1013 – 1028` |
| `closeDropdown()` | `1029 – 1037` |
| `init()` | `1038 – 1070` |
| `registerTranslations()` | `1071 – 1103` |

### `state.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `on()` | `31 – 36` |
| `off()` | `37 – 41` |
| `emit()` | `42 – 49` |
| `getState()` | `50 – 59` |
| `migratePlan()` | `60 – 72` |
| `getActivePlan()` | `73 – 84` |
| `setActivePlanId()` | `85 – 96` |
| `getCurrency()` | `97 – 100` |
| `setCurrency()` | `101 – 105` |
| `getViewMode()` | `106 – 109` |
| `setViewMode()` | `110 – 114` |
| `getActiveTab()` | `115 – 118` |
| `setActiveTab()` | `119 – 123` |
| `ensurePlanDefaults()` | `124 – 255` |
| `syncSalaryStreamsWithMaritalStatus()` | `256 – 353` |
| `applySavedUserPreferences()` | `354 – 386` |
| `savePlansToStorage()` | `387 – 430` |
| `debouncedSavePlansToStorage()` | `431 – 434` |
| `loadInitialPlans()` | `435 – 581` |

---

## 4. `frontend/js/engine.js` (1686 dòng — Tầng 1 Core Engine)
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
| `findOptimalRetirementAge()` | `480 – 597` |
| `runProjection()` | `598 – 1686` |

---

## 5. Tầng 3 UI — Nhạc Trưởng & 3 Tab Độc Lập + Modals
### 5.1. `frontend/js/ui.js` (923 dòng — Nhạc trưởng điều phối trung tâm)
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
| `updateAll()` | `564 – 759` |
| `convertPlanCurrency()` | `760 – 792` |
| `setCurrency()` | `793 – 814` |
| `setViewMode()` | `815 – 826` |
| `updateThemeIcon()` | `827 – 837` |
| `toggleTheme()` | `838 – 848` |
| `loadTheme()` | `849 – 923` |

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

### 5.3. `frontend/js/ui-tab1-streams.js` (3045 dòng — Tab 1B: Luồng Thu/Chi, Phân bổ tài sản & 4 Chiến lược)
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
| `applyProfileVisibilityRules()` | `1737 – 2297` |
| `updateRetirementLocationRadiosUI()` | `2298 – 2467` |
| `updateExpenseSavingsHints()` | `2468 – 2472` |
| `renderExpensePeriodsSummary()` | `2473 – 2764` |
| `renderExpenseStreamsList()` | `2765 – 2879` |
| `updateWithdrawalStrategyCards()` | `2880 – 2891` |
| `hexToRgba()` | `2892 – 3010` |
| `renderWithdrawalComparison()` | `3011 – 3045` |

### 5.4. `frontend/js/ui-tab2-health.js` (1811 dòng — Tab 2: Sức khỏe, Con cái & Y tế dự phòng)
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
| `updateFamilyStreamUI()` | `1069 – 1299` |
| `updateFamilyChildrenSimulation()` | `1300 – 1400` |
| `renderFamilyCashFlowChart()` | `1401 – 1584` |
| `initFamilyChildrenSimulation()` | `1585 – 1621` |
| `updateEstateMilestones()` | `1622 – 1684` |
| `renderEstateTab()` | `1685 – 1691` |
| `renderAdvisorTab()` | `1692 – 1811` |

### 5.5. `frontend/js/ui-tab3-taxes.js` (3114 dòng — Tab 3: Tối ưu Thuế, Lương hưu Pháp/VN & LMNP)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `14 – 18` |
| `parseVal()` | `19 – 25` |
| `setVal()` | `26 – 30` |
| `escapeHtml()` | `31 – 52` |
| `getActivePlan()` | `53 – 60` |
| `savePlansToStorage()` | `61 – 70` |
| `debouncedSavePlansToStorage()` | `71 – 81` |
| `bindTab3Events()` | `82 – 870` |
| `initFrancoVietGuideInteractions()` | `871 – 918` |
| `getPlanActiveCountries()` | `919 – 936` |
| `renderCountryFilterBar()` | `937 – 993` |
| `applyCountryToolsFilter()` | `994 – 1009` |
| `updateTaxRegimeUI()` | `1010 – 1026` |
| `renderGlobalAccountsContent()` | `1027 – 1119` |
| `estimateFrenchFullPension()` | `1120 – 1142` |
| `getPrimarySalaryIncome()` | `1143 – 1157` |
| `syncPensionBaseAuto()` | `1158 – 1181` |
| `updatePensionDecoteUI()` | `1182 – 1399` |
| `updateBhxhVnUI()` | `1400 – 1581` |
| `updateGermanPensionUI()` | `1582 – 1671` |
| `updateUsPensionUI()` | `1672 – 1761` |
| `updateJapanPensionUI()` | `1762 – 1853` |
| `updateCanadaPensionUI()` | `1854 – 1951` |
| `updateAustraliaPensionUI()` | `1952 – 2049` |
| `updateKoreaPensionUI()` | `2050 – 2141` |
| `updateTaiwanPensionUI()` | `2142 – 2233` |
| `syncBhxhVnStreams()` | `2234 – 2324` |
| `eurToPlanFactor()` | `2325 – 2332` |
| `extractPatrimoineLoansEur()` | `2333 – 2363` |
| `buildPatrimoineLoans()` | `2364 – 2384` |
| `applyPatrimoineToPlan()` | `2385 – 2492` |
| `fetchPatrimoineData()` | `2493 – 2508` |
| `syncFromPatrimoine()` | `2509 – 2521` |
| `updateLmnpUI()` | `2522 – 2744` |
| `renderPatrimoineLoansList()` | `2745 – 2767` |
| `updateMortgageUI()` | `2768 – 2853` |
| `syncMortgageToExpenseStreams()` | `2854 – 2943` |
| `renderTaxTab()` | `2944 – 3047` |
| `updateAllInternationalPensionsUI()` | `3048 – 3114` |

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

## 7. `frontend/js/taxOptimizer.js` (1815 dòng), `monteCarlo.js` (265 dòng) & `geminiAdvisor.js` (424 dòng)
### `taxOptimizer.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getFamilyPolicyByCountry()` | `324 – 474` |
| `getRealEstatePolicyByCountry()` | `475 – 544` |
| `calculateProgressiveTax()` | `545 – 647` |
| `computeFrenchTaxParts()` | `648 – 686` |
| `calculateTaxDetailed()` | `687 – 867` |
| `calculateRetireBudgetFromCashflow()` | `868 – 966` |
| `getSuggestedRetirementBudget()` | `967 – 1012` |
| `calculateFrenchPension()` | `1013 – 1088` |
| `calculateVietnamBhxhPension()` | `1089 – 1168` |
| `calculateGermanPension()` | `1169 – 1240` |
| `calculateUsSocialSecurityPension()` | `1241 – 1332` |
| `calculateJapanPension()` | `1333 – 1410` |
| `calculateCanadaPension()` | `1411 – 1497` |
| `calculateAustraliaPension()` | `1498 – 1573` |
| `calculateKoreaPension()` | `1574 – 1650` |
| `calculateTaiwanPension()` | `1651 – 1727` |
| `simulateWithdrawalWaterfall()` | `1728 – 1815` |

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
