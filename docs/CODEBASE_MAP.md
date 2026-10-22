# Bản Đồ Định Vị Mã Nguồn Tự Động (Codebase Map & Line-Range Index)

> **CẬP NHẬT TỰ ĐỘNG 100% BỞI `./verify_js.sh` (TỐN 0 TOKEN & 0 CÔNG SỨC):**  
> Bạn **KHÔNG BAO GIỜ** phải sửa file này bằng tay. Mỗi khi chạy `./verify_js.sh`, script sẽ tự động quét lại toàn bộ các hàm, thẻ HTML, phân mục CSS và từ điển đa ngôn ngữ để cập nhật số dòng chính xác trong 0.05 giây.  
> **Quy tắc bắt buộc cho AI:** Trước khi đọc hoặc sửa các file UI (`ui.js`, `ui-tab1-charts.js`, `ui-tab1-streams.js`, `ui-tab2-health.js`, `ui-tab3-taxes.js`, `ui-modals.js`), `index.html`, `styles.css`, `i18n.js`, `engine.js`, `patrimoine.js`, **bắt buộc tra bảng số dòng dưới đây** để gọi `view_file` đúng khoảng `StartLine` – `EndLine`.

---

## 1. `frontend/index.html` (6147 dòng)
| Khu vực / Thẻ ID | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `<header>` (Thanh điều hướng trên cùng) | `40 – 261` |
| `#tab-projections` | `262 – 378` |
| Cột 1: Các Luồng Thu nhập (`col1_income_header`) | `379 – 389` |
| `#card-asset-allocation-stream` | `390 – 463` |
| `#card-lmnp-income-stream` | `464 – 542` |
| `#card-french-pension-stream` | `543 – 674` |
| `#card-bhxh-income-stream` | `675 – 819` |
| `#card-german-pension-stream` | `820 – 948` |
| `#card-us-pension-stream` | `949 – 1077` |
| `#card-japan-pension-stream` | `1078 – 1206` |
| `#card-canada-pension-stream` | `1207 – 1349` |
| `#card-australia-pension-stream` | `1350 – 1492` |
| `#card-korea-pension-stream` | `1493 – 1621` |
| `#card-taiwan-pension-stream` | `1622 – 1771` |
| Cột 2: Các Luồng Chi tiêu (`col2_expense_header`) | `1772 – 1781` |
| `#card-retire-expense-stream` | `1782 – 2006` |
| `#card-dual-inflation-stream` | `2007 – 2113` |
| `#card-children-family-stream` | `2114 – 2239` |
| `#card-senior-care-stream` | `2240 – 2314` |
| `#card-estate-legacy-combined` | `2315 – 2376` |
| `#section-gemini-projections` | `2377 – 2416` |
| `#chart-header-cashflow` | `2417 – 2420` |
| `#chart-header-networth` | `2421 – 2469` |
| `#chart-cashflow` | `2470 – 2472` |
| `#chart-networth` | `2473 – 2510` |
| `#chart-networth-extra-controls` | `2511 – 2538` |
| `#tab-taxes` | `2539 – 2568` |
| `#card-sustainable-spending` | `2569 – 2705` |
| `#section-country-tools-wrapper` | `2706 – 2725` |
| `#card-pea-masterclass` | `2726 – 2897` |
| `#card-assurance-vie-masterclass` | `2898 – 3072` |
| `#card-livret-masterclass` | `3073 – 3249` |
| `#card-estate-inheritance-masterclass` | `3250 – 3343` |
| `#card-vietnam-tools` | `3344 – 3420` |
| `#card-us-tools` | `3421 – 3497` |
| `#card-germany-tools` | `3498 – 3559` |
| `#card-international-tools` | `3560 – 3625` |
| `#tab-estate` | `3626 – 3662` |
| `#card-healthspan-score` | `3663 – 3690` |
| `#card-couple-primary-col` | `3691 – 3712` |
| `#card-couple-spouse-col` | `3713 – 4121` |
| `#card-longevity-nutrition` | `4122 – 4347` |
| `#card-health-roadmap` | `4348 – 4485` |
| `#card-franco-viet-guide` | `4486 – 4581` |
| `#card-elderly-care-comparison` | `4582 – 4653` |
| `#plan-modal` | `4654 – 4941` |
| `#income-modal` | `4942 – 4996` |
| `#expense-modal` | `4997 – 5062` |
| `#actual-networth-modal` | `5063 – 5143` |
| `#milestone-modal` | `5144 – 5251` |
| `#modal-gemini-settings` | `5252 – 5304` |
| `#apartment-modal` | `5305 – 5490` |
| `#auth-modal` | `5491 – 5574` |
| `#modal-formula-guide` | `5575 – 5809` |
| `#quick-setup-modal` | `5810 – 6025` |
| `#confirm-modal` | `6026 – 6044` |
| `#feature-intro-modal` | `6045 – 6147` |

---

## 2. `frontend/css/styles.css` (10446 dòng)
| Phân mục CSS (`/* === ... === */`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| pyRetrait — Premium Design System & Theme Stylesheet | `1 – 78` |
| Base & Reset | `79 – 106` |
| Iconify Unified Icon System | `107 – 157` |
| Top Navigation Bar | `158 – 593` |
| Buttons & Interactive Elements | `594 – 710` |
| App Layout & Sidebar | `711 – 927` |
| Main Content Area & Dashboard KPIs | `928 – 1026` |
| Cards & Layout Panels | `1027 – 1527` |
| Form Controls & Inputs | `1528 – 1676` |
| Expandable Panels for Advanced Modules | `1677 – 1959` |
| Income & Expense Streams Side-by-Side Layout | `1960 – 2205` |
| Expense Streams & Crédits | `2206 – 3442` |
| Withdrawal Strategy Cards | `3443 – 3608` |
| Monte Carlo Stats Integrated in Chart Card | `3609 – 3713` |
| What-If Scenarios List | `3714 – 3763` |
| Spending Phases Card & Estate | `3764 – 3788` |
| AI Advisor Panel | `3789 – 3937` |
| Data Table | `3938 – 3979` |
| Dropdown Menus & Modals | `3980 – 4242` |
| Life Milestones Visuals & Markers | `4243 – 4530` |
| French Accounts Tracking & Withdrawal Waterfall Styles | `4531 – 4676` |
| Gemini AI Insights & Chart Commentary Component | `4677 – 5255` |
| Responsive Breakpoints & Layout Adaptations | `5256 – 5345` |
| Print / Export Report Stylesheet | `5346 – 5379` |
| pyLocation / Patrimoine Custom Component Styles | `5380 – 5397` |
| Inline Financial & Mathematical Formulas (Direct Verification) | `5398 – 5400` |
| Collapsible Formula Accordion (Mass Audience UX - Anti-Overwhelm) | `5401 – 5626` |
| PEA Masterclass & Strategic Tips (Native pyRetrait Design System) | `5627 – 5861` |
| Family & Children Planning: Side-by-Side (Inputs Left, Formulas Right) | `5862 – 5949` |
| Estate Planning & Legacy Milestone: Unified Composite Card | `5950 – 6022` |
| Retirement Spending Smile: Side-by-Side (Inputs Left, Budget & Science Right) | `6023 – 6165` |
| Dual-Theme (Light & Dark) UI Optimization & Period Timeline Cards | `6166 – 6682` |
| Cross-Tab Unified Light/Dark Mode Components & Accents | `6683 – 7179` |
| Franco-Viet Guide Components (Health, Pension, Cross-border Benefits) | `7180 – 7358` |
| Onboarding Wizard (Thiết Lập Nhanh 4 Bước) | `7359 – 7747` |
| Feature Discovery / Capabilities Intro Modal | `7748 – 8027` |
| Special Expense Item: Kế Hoạch Thừa Kế & Đánh Giá Mục Tiêu Di Sản | `8028 – 8089` |
| Tab Hero Banners (Universal Philosophy & Core Questions/Answers) | `8090 – 8452` |
| Advanced Healthspan Features (1, 3, 4, 5) | `8453 – 8890` |
| Longevity Nutrition Matrix (3-Column Layout: Sáng, Trưa, Tối) | `8891 – 8908` |
| Longevity Nutrition Matrix Styling | `8909 – 8926` |
| Cellular Hydration & Electrolytes Protocol (70% Body Weight) | `8927 – 9381` |
| Health 3-Tier Layout Architecture | `9382 – 9411` |
| Tab Quản Lý Rủi Ro: Bố Cục 2 Tầng Dọc Liền Mạch (Sequential 2-Tier Dashboard) | `9412 – 9476` |
| Lưới An Toàn 3 Biến Cố & FIRE Bền Bỉ (Triple-Shock Safety Net & Bulletproof FIRE) | `9477 – 9791` |
| .profile-summary-bar { | `9792 – 10256` |
| DÒNG GHI CHÚ: VÌ SAO TIỀN MẶT & QUỸ ĐẦU TƯ QUAN TRỌNG HƠN TỔNG TÀI SẢN | `10257 – 10295` |
| TAB 3: LỜI KHUYÊN & CÔNG CỤ TÀI CHÍNH THEO QUỐC GIA (SMART TIPS HUB) | `10296 – 10446` |

---

## 3. `frontend/js/i18n.js` (1253 dòng) & `state.js` (693 dòng — Tầng 2 State)
### `i18n.js`
| Từ điển / Hàm | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| Từ điển `vi` | `21 – 361` |
| Từ điển `en` | `362 – 702` |
| Từ điển `fr` | `703 – 1045` |
| `getSavedLanguage()` | `1046 – 1057` |
| `t()` | `1058 – 1069` |
| `applyLanguage()` | `1070 – 1120` |
| `setLanguage()` | `1121 – 1124` |
| `renderLanguageDropdown()` | `1125 – 1162` |
| `toggleDropdown()` | `1163 – 1178` |
| `closeDropdown()` | `1179 – 1187` |
| `init()` | `1188 – 1220` |
| `registerTranslations()` | `1221 – 1253` |

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
| `ensurePlanDefaults()` | `144 – 320` |
| `syncSalaryStreamsWithMaritalStatus()` | `321 – 433` |
| `applySavedUserPreferences()` | `434 – 476` |
| `savePlansToStorage()` | `477 – 522` |
| `debouncedSavePlansToStorage()` | `523 – 526` |
| `loadInitialPlans()` | `527 – 693` |

---

## 4. `frontend/js/engine.js` (2140 dòng — Tầng 1 Core Engine)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getCurrencySymbol()` | `9 – 16` |
| `formatCurrency()` | `17 – 58` |
| `calculateWeightedReturn()` | `59 – 111` |
| `isRealEstateIncomeStream()` | `112 – 121` |
| `calculateMortgageSchedule()` | `122 – 129` |
| `calculateCombinedMortgageSchedule()` | `130 – 169` |
| `computePropertyValue()` | `170 – 221` |
| `calculateSingleMortgageSchedule()` | `222 – 343` |
| `evaluateStressResilience()` | `344 – 514` |
| `findOptimalRetirementAge()` | `515 – 636` |
| `runProjection()` | `637 – 2140` |

---

## 5. Tầng 3 UI — Nhạc Trưởng & 3 Tab Độc Lập + Modals
### 5.1. `frontend/js/ui.js` (1017 dòng — Nhạc trưởng điều phối trung tâm)
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
| `renderActivePlanInputs()` | `373 – 607` |
| `updateAll()` | `608 – 813` |
| `convertPlanCurrency()` | `814 – 846` |
| `setCurrency()` | `847 – 868` |
| `setViewMode()` | `869 – 892` |
| `setCashflowViewMode()` | `893 – 919` |
| `updateThemeIcon()` | `920 – 930` |
| `toggleTheme()` | `931 – 941` |
| `loadTheme()` | `942 – 1017` |

### 5.2. `frontend/js/ui-tab1-charts.js` (2460 dòng — Tab 1A: Biểu đồ, Monte Carlo, Biến cố & Bảng năm)
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
| `renderMilestonesRibbon()` | `309 – 397` |
| `updateFireCriteriaStatus()` | `398 – 464` |
| `renderStressResilienceCard()` | `465 – 616` |
| `drawMilestoneMarkers()` | `617 – 787` |
| `drawDeficitIntervalsBackground()` | `788 – 810` |
| `drawDeficitIntervalsLines()` | `811 – 844` |
| `switchMainChartTab()` | `845 – 925` |
| `renderNetWorthChart()` | `926 – 1412` |
| `renderCashFlowChart()` | `1413 – 1932` |
| `renderProjectionsTable()` | `1933 – 1998` |
| `renderMonteCarloTab()` | `1999 – 2239` |
| `renderScenarioTab()` | `2240 – 2460` |

### 5.3. `frontend/js/ui-tab1-streams.js` (3773 dòng — Tab 1B: Luồng Thu/Chi, Phân bổ tài sản & 4 Chiến lược)
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
| `bindTab1StreamEvents()` | `130 – 800` |
| `ensureAssetAllocationCardPosition()` | `801 – 811` |
| `ensureDualInflationCardPosition()` | `812 – 823` |
| `ensurePlanInvestments()` | `824 – 849` |
| `handleInvestmentRatioChange()` | `850 – 884` |
| `handleInvestmentReturnChange()` | `885 – 906` |
| `handleInvestmentNameChange()` | `907 – 917` |
| `handleInvestmentAdd()` | `918 – 952` |
| `handleInvestmentDelete()` | `953 – 970` |
| `handleInvestmentReset()` | `971 – 993` |
| `renderInvestmentsList()` | `994 – 1091` |
| `renderAllocationSummaryBar()` | `1092 – 1113` |
| `updateAssetAllocationUI()` | `1114 – 1237` |
| `getCrossBorderForexInfo()` | `1238 – 1284` |
| `updateDualInflationUI()` | `1285 – 1515` |
| `updateRetirementLocationUI()` | `1516 – 1547` |
| `computeIncomePeriods()` | `1548 – 1686` |
| `renderIncomePeriodsSummary()` | `1687 – 1841` |
| `isRealEstateStream()` | `1842 – 1848` |
| `renderIncomeStreamsList()` | `1849 – 2015` |
| `getActiveIncomeAtAge()` | `2016 – 2103` |
| `ensureDefaultExpenseStreams()` | `2104 – 2145` |
| `getActiveExpensesAtAge()` | `2146 – 2236` |
| `updateCashflowBalanceUI()` | `2237 – 2337` |
| `syncSavingsAndExpensesFromRate()` | `2338 – 2341` |
| `updateSavingsRateUI()` | `2342 – 2346` |
| `applyProfileVisibilityRules()` | `2347 – 2928` |
| `updateRetirementLocationRadiosUI()` | `2929 – 3138` |
| `updateExpenseSavingsHints()` | `3139 – 3143` |
| `renderExpensePeriodsSummary()` | `3144 – 3428` |
| `renderExpenseStreamsList()` | `3429 – 3564` |
| `updateWithdrawalStrategyCards()` | `3565 – 3578` |
| `hexToRgba()` | `3579 – 3737` |
| `renderWithdrawalComparison()` | `3738 – 3773` |

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

## 7. `frontend/js/taxOptimizer.js` (1849 dòng), `monteCarlo.js` (277 dòng) & `geminiAdvisor.js` (465 dòng)
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
| `computeCacheKey()` | `73 – 144` |
| `getStoredInsights()` | `145 – 154` |
| `setStoredInsight()` | `155 – 164` |
| `resolveModelLabel()` | `165 – 183` |
| `updateActionButton()` | `184 – 224` |
| `fetchChartInsight()` | `225 – 265` |
| `updateChartBox()` | `266 – 435` |
| `clearCache()` | `436 – 465` |
