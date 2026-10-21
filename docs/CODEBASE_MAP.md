# Bản Đồ Định Vị Mã Nguồn Tự Động (Codebase Map & Line-Range Index)

> **CẬP NHẬT TỰ ĐỘNG 100% BỞI `./verify_js.sh` (TỐN 0 TOKEN & 0 CÔNG SỨC):**  
> Bạn **KHÔNG BAO GIỜ** phải sửa file này bằng tay. Mỗi khi chạy `./verify_js.sh`, script sẽ tự động quét lại toàn bộ các hàm, thẻ HTML, phân mục CSS và từ điển đa ngôn ngữ để cập nhật số dòng chính xác trong 0.05 giây.  
> **Quy tắc bắt buộc cho AI:** Trước khi đọc hoặc sửa các file UI (`ui.js`, `ui-tab1-charts.js`, `ui-tab1-streams.js`, `ui-tab2-health.js`, `ui-tab3-taxes.js`, `ui-modals.js`), `index.html`, `styles.css`, `i18n.js`, `engine.js`, `patrimoine.js`, **bắt buộc tra bảng số dòng dưới đây** để gọi `view_file` đúng khoảng `StartLine` – `EndLine`.

---

## 1. `frontend/index.html` (6114 dòng)
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
| `#card-taiwan-pension-stream` | `1636 – 1785` |
| Cột 2: Các Luồng Chi tiêu (`col2_expense_header`) | `1786 – 1795` |
| `#card-retire-expense-stream` | `1796 – 2020` |
| `#card-dual-inflation-stream` | `2021 – 2127` |
| `#card-children-family-stream` | `2128 – 2253` |
| `#card-senior-care-stream` | `2254 – 2328` |
| `#card-estate-legacy-combined` | `2329 – 2390` |
| `#section-gemini-projections` | `2391 – 2470` |
| `#chart-networth` | `2471 – 2496` |
| `#chart-cashflow` | `2497 – 2504` |
| `#tab-taxes` | `2505 – 2534` |
| `#card-sustainable-spending` | `2535 – 2671` |
| `#section-country-tools-wrapper` | `2672 – 2691` |
| `#card-pea-masterclass` | `2692 – 2863` |
| `#card-assurance-vie-masterclass` | `2864 – 3038` |
| `#card-livret-masterclass` | `3039 – 3215` |
| `#card-estate-inheritance-masterclass` | `3216 – 3309` |
| `#card-vietnam-tools` | `3310 – 3386` |
| `#card-us-tools` | `3387 – 3463` |
| `#card-germany-tools` | `3464 – 3525` |
| `#card-international-tools` | `3526 – 3591` |
| `#tab-estate` | `3592 – 3628` |
| `#card-healthspan-score` | `3629 – 3656` |
| `#card-couple-primary-col` | `3657 – 3678` |
| `#card-couple-spouse-col` | `3679 – 4087` |
| `#card-longevity-nutrition` | `4088 – 4313` |
| `#card-health-roadmap` | `4314 – 4451` |
| `#card-franco-viet-guide` | `4452 – 4547` |
| `#card-elderly-care-comparison` | `4548 – 4619` |
| `#plan-modal` | `4620 – 4907` |
| `#income-modal` | `4908 – 4962` |
| `#expense-modal` | `4963 – 5028` |
| `#actual-networth-modal` | `5029 – 5109` |
| `#milestone-modal` | `5110 – 5217` |
| `#modal-gemini-settings` | `5218 – 5271` |
| `#apartment-modal` | `5272 – 5457` |
| `#auth-modal` | `5458 – 5541` |
| `#modal-formula-guide` | `5542 – 5776` |
| `#quick-setup-modal` | `5777 – 5992` |
| `#confirm-modal` | `5993 – 6011` |
| `#feature-intro-modal` | `6012 – 6114` |

---

## 2. `frontend/css/styles.css` (9893 dòng)
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
| Income & Expense Streams Side-by-Side Layout | `1635 – 1880` |
| Expense Streams & Crédits | `1881 – 2950` |
| Withdrawal Strategy Cards | `2951 – 3116` |
| Monte Carlo Stats Integrated in Chart Card | `3117 – 3221` |
| What-If Scenarios List | `3222 – 3271` |
| Spending Phases Card & Estate | `3272 – 3296` |
| AI Advisor Panel | `3297 – 3445` |
| Data Table | `3446 – 3487` |
| Dropdown Menus & Modals | `3488 – 3750` |
| Life Milestones Visuals & Markers | `3751 – 3977` |
| French Accounts Tracking & Withdrawal Waterfall Styles | `3978 – 4123` |
| Gemini AI Insights & Chart Commentary Component | `4124 – 4702` |
| Responsive Breakpoints & Layout Adaptations | `4703 – 4792` |
| Print / Export Report Stylesheet | `4793 – 4826` |
| pyLocation / Patrimoine Custom Component Styles | `4827 – 4844` |
| Inline Financial & Mathematical Formulas (Direct Verification) | `4845 – 4847` |
| Collapsible Formula Accordion (Mass Audience UX - Anti-Overwhelm) | `4848 – 5073` |
| PEA Masterclass & Strategic Tips (Native pyRetrait Design System) | `5074 – 5308` |
| Family & Children Planning: Side-by-Side (Inputs Left, Formulas Right) | `5309 – 5396` |
| Estate Planning & Legacy Milestone: Unified Composite Card | `5397 – 5469` |
| Retirement Spending Smile: Side-by-Side (Inputs Left, Budget & Science Right) | `5470 – 5612` |
| Dual-Theme (Light & Dark) UI Optimization & Period Timeline Cards | `5613 – 6129` |
| Cross-Tab Unified Light/Dark Mode Components & Accents | `6130 – 6626` |
| Franco-Viet Guide Components (Health, Pension, Cross-border Benefits) | `6627 – 6805` |
| Onboarding Wizard (Thiết Lập Nhanh 4 Bước) | `6806 – 7194` |
| Feature Discovery / Capabilities Intro Modal | `7195 – 7474` |
| Special Expense Item: Kế Hoạch Thừa Kế & Đánh Giá Mục Tiêu Di Sản | `7475 – 7536` |
| Tab Hero Banners (Universal Philosophy & Core Questions/Answers) | `7537 – 7899` |
| Advanced Healthspan Features (1, 3, 4, 5) | `7900 – 8337` |
| Longevity Nutrition Matrix (3-Column Layout: Sáng, Trưa, Tối) | `8338 – 8355` |
| Longevity Nutrition Matrix Styling | `8356 – 8373` |
| Cellular Hydration & Electrolytes Protocol (70% Body Weight) | `8374 – 8828` |
| Health 3-Tier Layout Architecture | `8829 – 8858` |
| Tab Quản Lý Rủi Ro: Bố Cục 2 Tầng Dọc Liền Mạch (Sequential 2-Tier Dashboard) | `8859 – 8923` |
| Lưới An Toàn 3 Biến Cố & FIRE Bền Bỉ (Triple-Shock Safety Net & Bulletproof FIRE) | `8924 – 9238` |
| .profile-summary-bar { | `9239 – 9703` |
| DÒNG GHI CHÚ: VÌ SAO TIỀN MẶT & QUỸ ĐẦU TƯ QUAN TRỌNG HƠN TỔNG TÀI SẢN | `9704 – 9742` |
| TAB 3: LỜI KHUYÊN & CÔNG CỤ TÀI CHÍNH THEO QUỐC GIA (SMART TIPS HUB) | `9743 – 9893` |

---

## 3. `frontend/js/i18n.js` (1115 dòng) & `state.js` (631 dòng — Tầng 2 State)
### `i18n.js`
| Từ điển / Hàm | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| Từ điển `vi` | `21 – 315` |
| Từ điển `en` | `316 – 610` |
| Từ điển `fr` | `611 – 907` |
| `getSavedLanguage()` | `908 – 919` |
| `t()` | `920 – 931` |
| `applyLanguage()` | `932 – 982` |
| `setLanguage()` | `983 – 986` |
| `renderLanguageDropdown()` | `987 – 1024` |
| `toggleDropdown()` | `1025 – 1040` |
| `closeDropdown()` | `1041 – 1049` |
| `init()` | `1050 – 1082` |
| `registerTranslations()` | `1083 – 1115` |

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
### 5.1. `frontend/js/ui.js` (974 dòng — Nhạc trưởng điều phối trung tâm)
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
| `updateAll()` | `608 – 810` |
| `convertPlanCurrency()` | `811 – 843` |
| `setCurrency()` | `844 – 865` |
| `setViewMode()` | `866 – 877` |
| `updateThemeIcon()` | `878 – 888` |
| `toggleTheme()` | `889 – 899` |
| `loadTheme()` | `900 – 974` |

### 5.2. `frontend/js/ui-tab1-charts.js` (1844 dòng — Tab 1A: Biểu đồ, Monte Carlo, Biến cố & Bảng năm)
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
| `renderMilestonesRibbon()` | `222 – 298` |
| `renderStressResilienceCard()` | `299 – 450` |
| `drawMilestoneMarkers()` | `451 – 568` |
| `renderNetWorthChart()` | `569 – 1032` |
| `renderCashFlowChart()` | `1033 – 1325` |
| `renderProjectionsTable()` | `1326 – 1385` |
| `renderMonteCarloTab()` | `1386 – 1625` |
| `renderScenarioTab()` | `1626 – 1844` |

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
