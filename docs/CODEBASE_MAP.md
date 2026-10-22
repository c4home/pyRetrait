# Bản Đồ Định Vị Mã Nguồn Tự Động (Codebase Map & Line-Range Index)

> **CẬP NHẬT TỰ ĐỘNG 100% BỞI `./verify_js.sh` (TỐN 0 TOKEN & 0 CÔNG SỨC):**  
> Bạn **KHÔNG BAO GIỜ** phải sửa file này bằng tay. Mỗi khi chạy `./verify_js.sh`, script sẽ tự động quét lại toàn bộ các hàm, thẻ HTML, phân mục CSS và từ điển đa ngôn ngữ để cập nhật số dòng chính xác trong 0.05 giây.  
> **Quy tắc bắt buộc cho AI:** Trước khi đọc hoặc sửa các file UI (`ui.js`, `ui-tab1-charts.js`, `ui-tab1-streams.js`, `ui-tab2-health.js`, `ui-tab3-taxes.js`, `ui-modals.js`), `index.html`, `styles.css`, `i18n.js`, `engine.js`, `patrimoine.js`, **bắt buộc tra bảng số dòng dưới đây** để gọi `view_file` đúng khoảng `StartLine` – `EndLine`.

---

## 1. `frontend/index.html` (6159 dòng)
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
| `#section-gemini-projections` | `2394 – 2433` |
| `#chart-header-networth` | `2434 – 2437` |
| `#chart-header-cashflow` | `2438 – 2486` |
| `#chart-networth` | `2487 – 2489` |
| `#chart-cashflow` | `2490 – 2521` |
| `#chart-networth-extra-controls` | `2522 – 2549` |
| `#tab-taxes` | `2550 – 2579` |
| `#card-sustainable-spending` | `2580 – 2716` |
| `#section-country-tools-wrapper` | `2717 – 2736` |
| `#card-pea-masterclass` | `2737 – 2908` |
| `#card-assurance-vie-masterclass` | `2909 – 3083` |
| `#card-livret-masterclass` | `3084 – 3260` |
| `#card-estate-inheritance-masterclass` | `3261 – 3354` |
| `#card-vietnam-tools` | `3355 – 3431` |
| `#card-us-tools` | `3432 – 3508` |
| `#card-germany-tools` | `3509 – 3570` |
| `#card-international-tools` | `3571 – 3636` |
| `#tab-estate` | `3637 – 3673` |
| `#card-healthspan-score` | `3674 – 3701` |
| `#card-couple-primary-col` | `3702 – 3723` |
| `#card-couple-spouse-col` | `3724 – 4132` |
| `#card-longevity-nutrition` | `4133 – 4358` |
| `#card-health-roadmap` | `4359 – 4496` |
| `#card-franco-viet-guide` | `4497 – 4592` |
| `#card-elderly-care-comparison` | `4593 – 4664` |
| `#plan-modal` | `4665 – 4952` |
| `#income-modal` | `4953 – 5007` |
| `#expense-modal` | `5008 – 5073` |
| `#actual-networth-modal` | `5074 – 5154` |
| `#milestone-modal` | `5155 – 5262` |
| `#modal-gemini-settings` | `5263 – 5316` |
| `#apartment-modal` | `5317 – 5502` |
| `#auth-modal` | `5503 – 5586` |
| `#modal-formula-guide` | `5587 – 5821` |
| `#quick-setup-modal` | `5822 – 6037` |
| `#confirm-modal` | `6038 – 6056` |
| `#feature-intro-modal` | `6057 – 6159` |

---

## 2. `frontend/css/styles.css` (10187 dòng)
| Phân mục CSS (`/* === ... === */`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| pyRetrait — Premium Design System & Theme Stylesheet | `1 – 78` |
| Base & Reset | `79 – 106` |
| Iconify Unified Icon System | `107 – 157` |
| Top Navigation Bar | `158 – 593` |
| Buttons & Interactive Elements | `594 – 710` |
| App Layout & Sidebar | `711 – 927` |
| Main Content Area & Dashboard KPIs | `928 – 1026` |
| Cards & Layout Panels | `1027 – 1496` |
| Form Controls & Inputs | `1497 – 1645` |
| Expandable Panels for Advanced Modules | `1646 – 1928` |
| Income & Expense Streams Side-by-Side Layout | `1929 – 2174` |
| Expense Streams & Crédits | `2175 – 3244` |
| Withdrawal Strategy Cards | `3245 – 3410` |
| Monte Carlo Stats Integrated in Chart Card | `3411 – 3515` |
| What-If Scenarios List | `3516 – 3565` |
| Spending Phases Card & Estate | `3566 – 3590` |
| AI Advisor Panel | `3591 – 3739` |
| Data Table | `3740 – 3781` |
| Dropdown Menus & Modals | `3782 – 4044` |
| Life Milestones Visuals & Markers | `4045 – 4271` |
| French Accounts Tracking & Withdrawal Waterfall Styles | `4272 – 4417` |
| Gemini AI Insights & Chart Commentary Component | `4418 – 4996` |
| Responsive Breakpoints & Layout Adaptations | `4997 – 5086` |
| Print / Export Report Stylesheet | `5087 – 5120` |
| pyLocation / Patrimoine Custom Component Styles | `5121 – 5138` |
| Inline Financial & Mathematical Formulas (Direct Verification) | `5139 – 5141` |
| Collapsible Formula Accordion (Mass Audience UX - Anti-Overwhelm) | `5142 – 5367` |
| PEA Masterclass & Strategic Tips (Native pyRetrait Design System) | `5368 – 5602` |
| Family & Children Planning: Side-by-Side (Inputs Left, Formulas Right) | `5603 – 5690` |
| Estate Planning & Legacy Milestone: Unified Composite Card | `5691 – 5763` |
| Retirement Spending Smile: Side-by-Side (Inputs Left, Budget & Science Right) | `5764 – 5906` |
| Dual-Theme (Light & Dark) UI Optimization & Period Timeline Cards | `5907 – 6423` |
| Cross-Tab Unified Light/Dark Mode Components & Accents | `6424 – 6920` |
| Franco-Viet Guide Components (Health, Pension, Cross-border Benefits) | `6921 – 7099` |
| Onboarding Wizard (Thiết Lập Nhanh 4 Bước) | `7100 – 7488` |
| Feature Discovery / Capabilities Intro Modal | `7489 – 7768` |
| Special Expense Item: Kế Hoạch Thừa Kế & Đánh Giá Mục Tiêu Di Sản | `7769 – 7830` |
| Tab Hero Banners (Universal Philosophy & Core Questions/Answers) | `7831 – 8193` |
| Advanced Healthspan Features (1, 3, 4, 5) | `8194 – 8631` |
| Longevity Nutrition Matrix (3-Column Layout: Sáng, Trưa, Tối) | `8632 – 8649` |
| Longevity Nutrition Matrix Styling | `8650 – 8667` |
| Cellular Hydration & Electrolytes Protocol (70% Body Weight) | `8668 – 9122` |
| Health 3-Tier Layout Architecture | `9123 – 9152` |
| Tab Quản Lý Rủi Ro: Bố Cục 2 Tầng Dọc Liền Mạch (Sequential 2-Tier Dashboard) | `9153 – 9217` |
| Lưới An Toàn 3 Biến Cố & FIRE Bền Bỉ (Triple-Shock Safety Net & Bulletproof FIRE) | `9218 – 9532` |
| .profile-summary-bar { | `9533 – 9997` |
| DÒNG GHI CHÚ: VÌ SAO TIỀN MẶT & QUỸ ĐẦU TƯ QUAN TRỌNG HƠN TỔNG TÀI SẢN | `9998 – 10036` |
| TAB 3: LỜI KHUYÊN & CÔNG CỤ TÀI CHÍNH THEO QUỐC GIA (SMART TIPS HUB) | `10037 – 10187` |

---

## 3. `frontend/js/i18n.js` (1202 dòng) & `state.js` (667 dòng — Tầng 2 State)
### `i18n.js`
| Từ điển / Hàm | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| Từ điển `vi` | `21 – 344` |
| Từ điển `en` | `345 – 668` |
| Từ điển `fr` | `669 – 994` |
| `getSavedLanguage()` | `995 – 1006` |
| `t()` | `1007 – 1018` |
| `applyLanguage()` | `1019 – 1069` |
| `setLanguage()` | `1070 – 1073` |
| `renderLanguageDropdown()` | `1074 – 1111` |
| `toggleDropdown()` | `1112 – 1127` |
| `closeDropdown()` | `1128 – 1136` |
| `init()` | `1137 – 1169` |
| `registerTranslations()` | `1170 – 1202` |

### `state.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `on()` | `33 – 38` |
| `off()` | `39 – 43` |
| `emit()` | `44 – 51` |
| `getState()` | `52 – 61` |
| `migratePlan()` | `62 – 74` |
| `getActivePlan()` | `75 – 86` |
| `setActivePlanId()` | `87 – 98` |
| `getCurrency()` | `99 – 102` |
| `setCurrency()` | `103 – 107` |
| `getViewMode()` | `108 – 111` |
| `setViewMode()` | `112 – 116` |
| `getCashflowViewMode()` | `117 – 120` |
| `setCashflowViewMode()` | `121 – 125` |
| `getMainChartTab()` | `126 – 129` |
| `setMainChartTab()` | `130 – 134` |
| `getActiveTab()` | `135 – 138` |
| `setActiveTab()` | `139 – 143` |
| `ensurePlanDefaults()` | `144 – 299` |
| `syncSalaryStreamsWithMaritalStatus()` | `300 – 412` |
| `applySavedUserPreferences()` | `413 – 455` |
| `savePlansToStorage()` | `456 – 501` |
| `debouncedSavePlansToStorage()` | `502 – 505` |
| `loadInitialPlans()` | `506 – 667` |

---

## 4. `frontend/js/engine.js` (2113 dòng — Tầng 1 Core Engine)
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
| `runProjection()` | `610 – 2113` |

---

## 5. Tầng 3 UI — Nhạc Trưởng & 3 Tab Độc Lập + Modals
### 5.1. `frontend/js/ui.js` (1024 dòng — Nhạc trưởng điều phối trung tâm)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `31 – 35` |
| `parseVal()` | `36 – 42` |
| `setVal()` | `43 – 47` |
| `showConfirmDialog()` | `48 – 56` |
| `closeConfirmDialog()` | `57 – 81` |
| `initApp()` | `82 – 107` |
| `arrangeAiAndControlsColumns()` | `108 – 131` |
| `loadInitialPlans()` | `132 – 139` |
| `savePlansToStorage()` | `140 – 149` |
| `debouncedSavePlansToStorage()` | `150 – 156` |
| `getActivePlan()` | `157 – 168` |
| `bindEvents()` | `169 – 296` |
| `syncSalaryStreamsWithRetireAge()` | `297 – 316` |
| `bindInput()` | `317 – 348` |
| `switchTab()` | `349 – 363` |
| `renderActiveTab()` | `364 – 372` |
| `renderActivePlanInputs()` | `373 – 614` |
| `updateAll()` | `615 – 820` |
| `convertPlanCurrency()` | `821 – 853` |
| `setCurrency()` | `854 – 875` |
| `setViewMode()` | `876 – 899` |
| `setCashflowViewMode()` | `900 – 926` |
| `updateThemeIcon()` | `927 – 937` |
| `toggleTheme()` | `938 – 948` |
| `loadTheme()` | `949 – 1024` |

### 5.2. `frontend/js/ui-tab1-charts.js` (2294 dòng — Tab 1A: Biểu đồ, Monte Carlo, Biến cố & Bảng năm)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `16 – 20` |
| `parseVal()` | `21 – 27` |
| `setVal()` | `28 – 32` |
| `escapeHtml()` | `33 – 54` |
| `getActivePlan()` | `55 – 62` |
| `savePlansToStorage()` | `63 – 72` |
| `debouncedSavePlansToStorage()` | `73 – 83` |
| `bindTab1ChartEvents()` | `84 – 244` |
| `triggerPlanProjectionsInsight()` | `245 – 308` |
| `renderMilestonesRibbon()` | `309 – 394` |
| `updateFireCriteriaStatus()` | `395 – 461` |
| `renderStressResilienceCard()` | `462 – 613` |
| `drawMilestoneMarkers()` | `614 – 736` |
| `switchMainChartTab()` | `737 – 809` |
| `renderNetWorthChart()` | `810 – 1282` |
| `renderCashFlowChart()` | `1283 – 1772` |
| `renderProjectionsTable()` | `1773 – 1832` |
| `renderMonteCarloTab()` | `1833 – 2073` |
| `renderScenarioTab()` | `2074 – 2294` |

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

## 6. `frontend/js/patrimoine.js` (1577 dòng)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `formatMoneyEUR()` | `14 – 18` |
| `formatMoneyVND()` | `19 – 28` |
| `sanitizeApartmentsMap()` | `29 – 43` |
| `getGuestPatrimoine()` | `44 – 57` |
| `saveGuestPatrimoine()` | `58 – 72` |
| `numOr()` | `73 – 77` |
| `truthyOr()` | `78 – 89` |
| `calcNotaryFees()` | `90 – 102` |
| `calcMonthlyPayment()` | `103 – 116` |
| `computeApartmentMetrics()` | `117 – 194` |
| `computeFullPatrimoine()` | `195 – 221` |
| `loadRawData()` | `222 – 257` |
| `saveRawToCloud()` | `258 – 266` |
| `loadData()` | `267 – 272` |
| `render()` | `273 – 283` |
| `renderKPIs()` | `284 – 325` |
| `renderApartmentsList()` | `326 – 426` |
| `renderChart()` | `427 – 527` |
| `renderBreakEvenSection()` | `528 – 562` |
| `updateBreakEvenView()` | `563 – 579` |
| `renderBreakEvenSingleApt()` | `580 – 852` |
| `renderBreakEvenComparisonAll()` | `853 – 1001` |
| `renderGeminiAIBox()` | `1002 – 1024` |
| `autoSyncToFire()` | `1025 – 1038` |
| `showAutoSyncToast()` | `1039 – 1082` |
| `removeApartmentFromObject()` | `1083 – 1100` |
| `openApartmentModal()` | `1101 – 1218` |
| `updatePropertyFormulaUI()` | `1219 – 1242` |
| `closeApartmentModal()` | `1243 – 1247` |
| `saveApartment()` | `1248 – 1353` |
| `deleteApartment()` | `1354 – 1412` |
| `setVal()` | `1413 – 1417` |
| `getVal()` | `1418 – 1422` |
| `updateAptLiveSummary()` | `1423 – 1481` |
| `bindEvents()` | `1482 – 1577` |

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
