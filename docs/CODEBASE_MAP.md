# Bản Đồ Định Vị Mã Nguồn Tự Động (Codebase Map & Line-Range Index)

> **CẬP NHẬT TỰ ĐỘNG 100% BỞI `./verify_js.sh` (TỐN 0 TOKEN & 0 CÔNG SỨC):**  
> Bạn **KHÔNG BAO GIỜ** phải sửa file này bằng tay. Mỗi khi chạy `./verify_js.sh`, script sẽ tự động quét lại toàn bộ các hàm, thẻ HTML, phân mục CSS và từ điển đa ngôn ngữ để cập nhật số dòng chính xác trong 0.05 giây.  
> **Quy tắc bắt buộc cho AI:** Trước khi đọc hoặc sửa các file UI (`ui.js`, `ui-tab1-charts.js`, `ui-tab1-streams.js`, `ui-tab2-health.js`, `ui-tab3-taxes.js`, `ui-modals.js`), `index.html`, `styles.css`, `i18n.js`, `engine.js`, `patrimoine.js`, **bắt buộc tra bảng số dòng dưới đây** để gọi `view_file` đúng khoảng `StartLine` – `EndLine`.

---

## 1. `frontend/index.html` (6117 dòng)
| Khu vực / Thẻ ID | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `<header>` (Thanh điều hướng trên cùng) | `40 – 261` |
| `#tab-projections` | `262 – 378` |
| Cột 1: Các Luồng Thu nhập (`col1_income_header`) | `379 – 389` |
| `#card-asset-allocation-stream` | `390 – 480` |
| `#card-lmnp-income-stream` | `481 – 559` |
| `#card-french-pension-stream` | `560 – 691` |
| `#card-bhxh-income-stream` | `692 – 836` |
| `#card-german-pension-stream` | `837 – 965` |
| `#card-us-pension-stream` | `966 – 1094` |
| `#card-japan-pension-stream` | `1095 – 1223` |
| `#card-canada-pension-stream` | `1224 – 1366` |
| `#card-australia-pension-stream` | `1367 – 1509` |
| `#card-korea-pension-stream` | `1510 – 1638` |
| `#card-taiwan-pension-stream` | `1639 – 1788` |
| Cột 2: Các Luồng Chi tiêu (`col2_expense_header`) | `1789 – 1798` |
| `#card-retire-expense-stream` | `1799 – 2023` |
| `#card-dual-inflation-stream` | `2024 – 2130` |
| `#card-children-family-stream` | `2131 – 2256` |
| `#card-senior-care-stream` | `2257 – 2331` |
| `#card-estate-legacy-combined` | `2332 – 2393` |
| `#section-gemini-projections` | `2394 – 2473` |
| `#chart-networth` | `2474 – 2499` |
| `#chart-cashflow` | `2500 – 2507` |
| `#tab-taxes` | `2508 – 2537` |
| `#card-sustainable-spending` | `2538 – 2674` |
| `#section-country-tools-wrapper` | `2675 – 2694` |
| `#card-pea-masterclass` | `2695 – 2866` |
| `#card-assurance-vie-masterclass` | `2867 – 3041` |
| `#card-livret-masterclass` | `3042 – 3218` |
| `#card-estate-inheritance-masterclass` | `3219 – 3312` |
| `#card-vietnam-tools` | `3313 – 3389` |
| `#card-us-tools` | `3390 – 3466` |
| `#card-germany-tools` | `3467 – 3528` |
| `#card-international-tools` | `3529 – 3594` |
| `#tab-estate` | `3595 – 3631` |
| `#card-healthspan-score` | `3632 – 3659` |
| `#card-couple-primary-col` | `3660 – 3681` |
| `#card-couple-spouse-col` | `3682 – 4090` |
| `#card-longevity-nutrition` | `4091 – 4316` |
| `#card-health-roadmap` | `4317 – 4454` |
| `#card-franco-viet-guide` | `4455 – 4550` |
| `#card-elderly-care-comparison` | `4551 – 4622` |
| `#plan-modal` | `4623 – 4910` |
| `#income-modal` | `4911 – 4965` |
| `#expense-modal` | `4966 – 5031` |
| `#actual-networth-modal` | `5032 – 5112` |
| `#milestone-modal` | `5113 – 5220` |
| `#modal-gemini-settings` | `5221 – 5274` |
| `#apartment-modal` | `5275 – 5460` |
| `#auth-modal` | `5461 – 5544` |
| `#modal-formula-guide` | `5545 – 5779` |
| `#quick-setup-modal` | `5780 – 5995` |
| `#confirm-modal` | `5996 – 6014` |
| `#feature-intro-modal` | `6015 – 6117` |

---

## 2. `frontend/css/styles.css` (9925 dòng)
| Phân mục CSS (`/* === ... === */`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| pyRetrait — Premium Design System & Theme Stylesheet | `1 – 78` |
| Base & Reset | `79 – 106` |
| Iconify Unified Icon System | `107 – 157` |
| Top Navigation Bar | `158 – 593` |
| Buttons & Interactive Elements | `594 – 710` |
| App Layout & Sidebar | `711 – 927` |
| Main Content Area & Dashboard KPIs | `928 – 1026` |
| Cards & Layout Panels | `1027 – 1234` |
| Form Controls & Inputs | `1235 – 1383` |
| Expandable Panels for Advanced Modules | `1384 – 1666` |
| Income & Expense Streams Side-by-Side Layout | `1667 – 1912` |
| Expense Streams & Crédits | `1913 – 2982` |
| Withdrawal Strategy Cards | `2983 – 3148` |
| Monte Carlo Stats Integrated in Chart Card | `3149 – 3253` |
| What-If Scenarios List | `3254 – 3303` |
| Spending Phases Card & Estate | `3304 – 3328` |
| AI Advisor Panel | `3329 – 3477` |
| Data Table | `3478 – 3519` |
| Dropdown Menus & Modals | `3520 – 3782` |
| Life Milestones Visuals & Markers | `3783 – 4009` |
| French Accounts Tracking & Withdrawal Waterfall Styles | `4010 – 4155` |
| Gemini AI Insights & Chart Commentary Component | `4156 – 4734` |
| Responsive Breakpoints & Layout Adaptations | `4735 – 4824` |
| Print / Export Report Stylesheet | `4825 – 4858` |
| pyLocation / Patrimoine Custom Component Styles | `4859 – 4876` |
| Inline Financial & Mathematical Formulas (Direct Verification) | `4877 – 4879` |
| Collapsible Formula Accordion (Mass Audience UX - Anti-Overwhelm) | `4880 – 5105` |
| PEA Masterclass & Strategic Tips (Native pyRetrait Design System) | `5106 – 5340` |
| Family & Children Planning: Side-by-Side (Inputs Left, Formulas Right) | `5341 – 5428` |
| Estate Planning & Legacy Milestone: Unified Composite Card | `5429 – 5501` |
| Retirement Spending Smile: Side-by-Side (Inputs Left, Budget & Science Right) | `5502 – 5644` |
| Dual-Theme (Light & Dark) UI Optimization & Period Timeline Cards | `5645 – 6161` |
| Cross-Tab Unified Light/Dark Mode Components & Accents | `6162 – 6658` |
| Franco-Viet Guide Components (Health, Pension, Cross-border Benefits) | `6659 – 6837` |
| Onboarding Wizard (Thiết Lập Nhanh 4 Bước) | `6838 – 7226` |
| Feature Discovery / Capabilities Intro Modal | `7227 – 7506` |
| Special Expense Item: Kế Hoạch Thừa Kế & Đánh Giá Mục Tiêu Di Sản | `7507 – 7568` |
| Tab Hero Banners (Universal Philosophy & Core Questions/Answers) | `7569 – 7931` |
| Advanced Healthspan Features (1, 3, 4, 5) | `7932 – 8369` |
| Longevity Nutrition Matrix (3-Column Layout: Sáng, Trưa, Tối) | `8370 – 8387` |
| Longevity Nutrition Matrix Styling | `8388 – 8405` |
| Cellular Hydration & Electrolytes Protocol (70% Body Weight) | `8406 – 8860` |
| Health 3-Tier Layout Architecture | `8861 – 8890` |
| Tab Quản Lý Rủi Ro: Bố Cục 2 Tầng Dọc Liền Mạch (Sequential 2-Tier Dashboard) | `8891 – 8955` |
| Lưới An Toàn 3 Biến Cố & FIRE Bền Bỉ (Triple-Shock Safety Net & Bulletproof FIRE) | `8956 – 9270` |
| .profile-summary-bar { | `9271 – 9735` |
| DÒNG GHI CHÚ: VÌ SAO TIỀN MẶT & QUỸ ĐẦU TƯ QUAN TRỌNG HƠN TỔNG TÀI SẢN | `9736 – 9774` |
| TAB 3: LỜI KHUYÊN & CÔNG CỤ TÀI CHÍNH THEO QUỐC GIA (SMART TIPS HUB) | `9775 – 9925` |

---

## 3. `frontend/js/i18n.js` (1133 dòng) & `state.js` (631 dòng — Tầng 2 State)
### `i18n.js`
| Từ điển / Hàm | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| Từ điển `vi` | `21 – 321` |
| Từ điển `en` | `322 – 622` |
| Từ điển `fr` | `623 – 925` |
| `getSavedLanguage()` | `926 – 937` |
| `t()` | `938 – 949` |
| `applyLanguage()` | `950 – 1000` |
| `setLanguage()` | `1001 – 1004` |
| `renderLanguageDropdown()` | `1005 – 1042` |
| `toggleDropdown()` | `1043 – 1058` |
| `closeDropdown()` | `1059 – 1067` |
| `init()` | `1068 – 1100` |
| `registerTranslations()` | `1101 – 1133` |

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
| `ensurePlanDefaults()` | `124 – 279` |
| `syncSalaryStreamsWithMaritalStatus()` | `280 – 392` |
| `applySavedUserPreferences()` | `393 – 425` |
| `savePlansToStorage()` | `426 – 469` |
| `debouncedSavePlansToStorage()` | `470 – 473` |
| `loadInitialPlans()` | `474 – 631` |

---

## 4. `frontend/js/engine.js` (2114 dòng — Tầng 1 Core Engine)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getCurrencySymbol()` | `9 – 16` |
| `formatCurrency()` | `17 – 58` |
| `calculateWeightedReturn()` | `59 – 84` |
| `isRealEstateIncomeStream()` | `85 – 94` |
| `calculateMortgageSchedule()` | `95 – 102` |
| `calculateCombinedMortgageSchedule()` | `103 – 142` |
| `computePropertyValue()` | `143 – 194` |
| `calculateSingleMortgageSchedule()` | `195 – 316` |
| `evaluateStressResilience()` | `317 – 487` |
| `findOptimalRetirementAge()` | `488 – 609` |
| `runProjection()` | `610 – 2114` |

---

## 5. Tầng 3 UI — Nhạc Trưởng & 3 Tab Độc Lập + Modals
### 5.1. `frontend/js/ui.js` (977 dòng — Nhạc trưởng điều phối trung tâm)
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
| `syncSalaryStreamsWithRetireAge()` | `290 – 309` |
| `bindInput()` | `310 – 341` |
| `switchTab()` | `342 – 356` |
| `renderActiveTab()` | `357 – 365` |
| `renderActivePlanInputs()` | `366 – 607` |
| `updateAll()` | `608 – 813` |
| `convertPlanCurrency()` | `814 – 846` |
| `setCurrency()` | `847 – 868` |
| `setViewMode()` | `869 – 880` |
| `updateThemeIcon()` | `881 – 891` |
| `toggleTheme()` | `892 – 902` |
| `loadTheme()` | `903 – 977` |

### 5.2. `frontend/js/ui-tab1-charts.js` (1922 dòng — Tab 1A: Biểu đồ, Monte Carlo, Biến cố & Bảng năm)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `16 – 20` |
| `parseVal()` | `21 – 27` |
| `setVal()` | `28 – 32` |
| `escapeHtml()` | `33 – 54` |
| `getActivePlan()` | `55 – 62` |
| `savePlansToStorage()` | `63 – 72` |
| `debouncedSavePlansToStorage()` | `73 – 83` |
| `bindTab1ChartEvents()` | `84 – 157` |
| `triggerPlanProjectionsInsight()` | `158 – 221` |
| `renderMilestonesRibbon()` | `222 – 307` |
| `updateFireCriteriaStatus()` | `308 – 374` |
| `renderStressResilienceCard()` | `375 – 526` |
| `drawMilestoneMarkers()` | `527 – 644` |
| `renderNetWorthChart()` | `645 – 1108` |
| `renderCashFlowChart()` | `1109 – 1401` |
| `renderProjectionsTable()` | `1402 – 1461` |
| `renderMonteCarloTab()` | `1462 – 1702` |
| `renderScenarioTab()` | `1703 – 1922` |

### 5.3. `frontend/js/ui-tab1-streams.js` (3591 dòng — Tab 1B: Luồng Thu/Chi, Phân bổ tài sản & 4 Chiến lược)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `16 – 20` |
| `parseVal()` | `21 – 27` |
| `setVal()` | `28 – 32` |
| `escapeHtml()` | `33 – 54` |
| `getActivePlan()` | `55 – 62` |
| `getRetirementPppRatios()` | `63 – 98` |
| `savePlansToStorage()` | `99 – 108` |
| `debouncedSavePlansToStorage()` | `109 – 118` |
| `formatGenderAgeText()` | `119 – 129` |
| `bindTab1StreamEvents()` | `130 – 871` |
| `ensureAssetAllocationCardPosition()` | `872 – 882` |
| `ensureDualInflationCardPosition()` | `883 – 890` |
| `updateAssetAllocationUI()` | `891 – 1055` |
| `getCrossBorderForexInfo()` | `1056 – 1102` |
| `updateDualInflationUI()` | `1103 – 1333` |
| `updateRetirementLocationUI()` | `1334 – 1365` |
| `computeIncomePeriods()` | `1366 – 1504` |
| `renderIncomePeriodsSummary()` | `1505 – 1659` |
| `isRealEstateStream()` | `1660 – 1666` |
| `renderIncomeStreamsList()` | `1667 – 1833` |
| `getActiveIncomeAtAge()` | `1834 – 1921` |
| `ensureDefaultExpenseStreams()` | `1922 – 1963` |
| `getActiveExpensesAtAge()` | `1964 – 2054` |
| `updateCashflowBalanceUI()` | `2055 – 2155` |
| `syncSavingsAndExpensesFromRate()` | `2156 – 2159` |
| `updateSavingsRateUI()` | `2160 – 2164` |
| `applyProfileVisibilityRules()` | `2165 – 2746` |
| `updateRetirementLocationRadiosUI()` | `2747 – 2956` |
| `updateExpenseSavingsHints()` | `2957 – 2961` |
| `renderExpensePeriodsSummary()` | `2962 – 3246` |
| `renderExpenseStreamsList()` | `3247 – 3382` |
| `updateWithdrawalStrategyCards()` | `3383 – 3396` |
| `hexToRgba()` | `3397 – 3555` |
| `renderWithdrawalComparison()` | `3556 – 3591` |

### 5.4. `frontend/js/ui-tab2-health.js` (1816 dòng — Tab 2: Sức khỏe, Con cái & Y tế dự phòng)
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
| `bindTab2Events()` | `774 – 1007` |
| `updateSeniorCareUI()` | `1008 – 1073` |
| `updateFamilyStreamUI()` | `1074 – 1304` |
| `updateFamilyChildrenSimulation()` | `1305 – 1405` |
| `renderFamilyCashFlowChart()` | `1406 – 1589` |
| `initFamilyChildrenSimulation()` | `1590 – 1626` |
| `updateEstateMilestones()` | `1627 – 1689` |
| `renderEstateTab()` | `1690 – 1696` |
| `renderAdvisorTab()` | `1697 – 1816` |

### 5.5. `frontend/js/ui-tab3-taxes.js` (3095 dòng — Tab 3: Tối ưu Thuế, Lương hưu Pháp/VN & LMNP)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `14 – 18` |
| `parseVal()` | `19 – 25` |
| `setVal()` | `26 – 30` |
| `escapeHtml()` | `31 – 52` |
| `getActivePlan()` | `53 – 60` |
| `savePlansToStorage()` | `61 – 70` |
| `debouncedSavePlansToStorage()` | `71 – 81` |
| `bindTab3Events()` | `82 – 873` |
| `initFrancoVietGuideInteractions()` | `874 – 921` |
| `getPlanActiveCountries()` | `922 – 939` |
| `renderCountryFilterBar()` | `940 – 996` |
| `applyCountryToolsFilter()` | `997 – 1012` |
| `updateTaxRegimeUI()` | `1013 – 1029` |
| `renderGlobalAccountsContent()` | `1030 – 1122` |
| `estimateFrenchFullPension()` | `1123 – 1145` |
| `getPrimarySalaryIncome()` | `1146 – 1160` |
| `syncPensionBaseAuto()` | `1161 – 1184` |
| `updatePensionDecoteUI()` | `1185 – 1402` |
| `updateBhxhVnUI()` | `1403 – 1584` |
| `updateGermanPensionUI()` | `1585 – 1674` |
| `updateUsPensionUI()` | `1675 – 1764` |
| `updateJapanPensionUI()` | `1765 – 1856` |
| `updateCanadaPensionUI()` | `1857 – 1954` |
| `updateAustraliaPensionUI()` | `1955 – 2052` |
| `updateKoreaPensionUI()` | `2053 – 2144` |
| `updateTaiwanPensionUI()` | `2145 – 2236` |
| `syncBhxhVnStreams()` | `2237 – 2327` |
| `eurToPlanFactor()` | `2328 – 2335` |
| `extractPatrimoineLoansEur()` | `2336 – 2366` |
| `buildPatrimoineLoans()` | `2367 – 2387` |
| `applyPatrimoineToPlan()` | `2388 – 2523` |
| `fetchPatrimoineData()` | `2524 – 2539` |
| `syncFromPatrimoine()` | `2540 – 2552` |
| `updateLmnpUI()` | `2553 – 2785` |
| `renderPatrimoineLoansList()` | `2786 – 2808` |
| `updateMortgageUI()` | `2809 – 2894` |
| `syncMortgageToExpenseStreams()` | `2895 – 2924` |
| `renderTaxTab()` | `2925 – 3028` |
| `updateAllInternationalPensionsUI()` | `3029 – 3095` |

### 5.6. `frontend/js/ui-modals.js` (1966 dòng — Popup Modals & Thiết lập nhanh Wizard)
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
| `bindModalEvents()` | `234 – 498` |
| `openExpenseModal()` | `499 – 533` |
| `syncExpenseGrowthVisibility()` | `534 – 537` |
| `closeExpenseModal()` | `538 – 542` |
| `saveExpenseFromModal()` | `543 – 585` |
| `openIncomeModal()` | `586 – 627` |
| `closeIncomeModal()` | `628 – 632` |
| `saveIncomeFromModal()` | `633 – 699` |
| `openMilestoneModal()` | `700 – 711` |
| `closeMilestoneModal()` | `712 – 717` |
| `renderModalMilestonesContent()` | `718 – 801` |
| `showMilestoneForm()` | `802 – 833` |
| `hideMilestoneForm()` | `834 – 838` |
| `saveMilestoneFromForm()` | `839 – 877` |
| `openActualNetWorthModal()` | `878 – 899` |
| `closeActualNetWorthModal()` | `900 – 904` |
| `renderActualRecordsTable()` | `905 – 957` |
| `addActualRecordFromForm()` | `958 – 1011` |
| `deleteActualRecord()` | `1012 – 1023` |
| `fetchPatrimoineBalanceForActual()` | `1024 – 1067` |
| `renderPlanSelector()` | `1068 – 1074` |
| `openModal()` | `1075 – 1145` |
| `updatePlanModalPppTags()` | `1146 – 1193` |
| `updateRetireCityOptionsDiff()` | `1194 – 1235` |
| `setPlanGender()` | `1236 – 1250` |
| `setPlanFamily()` | `1251 – 1265` |
| `setPlanRetireMode()` | `1266 – 1296` |
| `handlePlanWorkCityChange()` | `1297 – 1322` |
| `closeModal()` | `1323 – 1327` |
| `saveNewPlanFromModal()` | `1328 – 1557` |
| `duplicateCurrentPlan()` | `1558 – 1572` |
| `deleteCurrentPlan()` | `1573 – 1599` |
| `handleJSONImport()` | `1600 – 1629` |
| `initQuickSetupWizard()` | `1630 – 1758` |
| `updateSpendCalcText()` | `1759 – 1774` |
| `openQuickSetupWizard()` | `1775 – 1831` |
| `closeQuickSetupWizard()` | `1832 – 1836` |
| `showWizardStep()` | `1837 – 1863` |
| `applyWizardAndCalculate()` | `1864 – 1966` |

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

## 7. `frontend/js/taxOptimizer.js` (1849 dòng), `monteCarlo.js` (277 dòng) & `geminiAdvisor.js` (424 dòng)
### `taxOptimizer.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getFamilyPolicyByCountry()` | `324 – 474` |
| `getRealEstatePolicyByCountry()` | `475 – 578` |
| `calculateProgressiveTax()` | `579 – 681` |
| `computeFrenchTaxParts()` | `682 – 720` |
| `calculateTaxDetailed()` | `721 – 901` |
| `calculateRetireBudgetFromCashflow()` | `902 – 1000` |
| `getSuggestedRetirementBudget()` | `1001 – 1046` |
| `calculateFrenchPension()` | `1047 – 1122` |
| `calculateVietnamBhxhPension()` | `1123 – 1202` |
| `calculateGermanPension()` | `1203 – 1274` |
| `calculateUsSocialSecurityPension()` | `1275 – 1366` |
| `calculateJapanPension()` | `1367 – 1444` |
| `calculateCanadaPension()` | `1445 – 1531` |
| `calculateAustraliaPension()` | `1532 – 1607` |
| `calculateKoreaPension()` | `1608 – 1684` |
| `calculateTaiwanPension()` | `1685 – 1761` |
| `simulateWithdrawalWaterfall()` | `1762 – 1849` |

### `monteCarlo.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `mulberry32()` | `9 – 18` |
| `createRandomNormal()` | `19 – 30` |
| `runSimulation()` | `31 – 277` |

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
