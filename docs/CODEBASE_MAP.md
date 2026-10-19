# Bản Đồ Định Vị Mã Nguồn Tự Động (Codebase Map & Line-Range Index)

> **CẬP NHẬT TỰ ĐỘNG 100% BỞI `./verify_js.sh` (TỐN 0 TOKEN & 0 CÔNG SỨC):**  
> Bạn **KHÔNG BAO GIỜ** phải sửa file này bằng tay. Mỗi khi chạy `./verify_js.sh`, script sẽ tự động quét lại toàn bộ các hàm, thẻ HTML, phân mục CSS và từ điển đa ngôn ngữ để cập nhật số dòng chính xác trong 0.05 giây.  
> **Quy tắc bắt buộc cho AI:** Trước khi đọc hoặc sửa các file UI (`ui.js`, `ui-tab1-charts.js`, `ui-tab1-streams.js`, `ui-tab2-health.js`, `ui-tab3-taxes.js`, `ui-modals.js`), `index.html`, `styles.css`, `i18n.js`, `engine.js`, `patrimoine.js`, **bắt buộc tra bảng số dòng dưới đây** để gọi `view_file` đúng khoảng `StartLine` – `EndLine`.

---

## 1. `frontend/index.html` (5359 dòng)
| Khu vực / Thẻ ID | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `<header>` (Thanh điều hướng trên cùng) | `36 – 258` |
| `#tab-projections` | `259 – 402` |
| Cột 1: Các Luồng Thu nhập (`col1_income_header`) | `403 – 413` |
| `#card-asset-allocation-stream` | `414 – 499` |
| `#card-lmnp-income-stream` | `500 – 578` |
| `#card-french-pension-stream` | `579 – 704` |
| `#card-bhxh-income-stream` | `705 – 843` |
| `#card-german-pension-stream` | `844 – 966` |
| `#card-us-pension-stream` | `967 – 1102` |
| `#card-withdrawal-strategy-controls` | `1103 – 1158` |
| `#card-strat-bengen_4pct` | `1159 – 1179` |
| `#card-strat-guyton_klinger` | `1180 – 1207` |
| `#card-strat-vpw` | `1208 – 1233` |
| `#card-strat-fixed_pct` | `1234 – 1327` |
| Cột 2: Các Luồng Chi tiêu (`col2_expense_header`) | `1328 – 1337` |
| `#card-retire-expense-stream` | `1338 – 1530` |
| `#card-children-family-stream` | `1531 – 1649` |
| `#card-senior-care-stream` | `1650 – 1718` |
| `#card-estate-legacy-combined` | `1719 – 1768` |
| `#card-dual-inflation-stream` | `1769 – 1891` |
| `#section-gemini-projections` | `1892 – 1969` |
| `#chart-networth` | `1970 – 1995` |
| `#chart-cashflow` | `1996 – 2003` |
| `#tab-taxes` | `2004 – 2037` |
| `#card-french-accounts` | `2038 – 2131` |
| `#card-global-accounts-guide` | `2132 – 2148` |
| `#card-pea-masterclass` | `2149 – 2320` |
| `#card-assurance-vie-masterclass` | `2321 – 2495` |
| `#card-livret-masterclass` | `2496 – 2672` |
| `#card-estate-inheritance-masterclass` | `2673 – 2769` |
| `#tab-estate` | `2770 – 2806` |
| `#card-healthspan-score` | `2807 – 2834` |
| `#card-couple-primary-col` | `2835 – 2856` |
| `#card-couple-spouse-col` | `2857 – 3259` |
| `#card-longevity-nutrition` | `3260 – 3485` |
| `#card-health-roadmap` | `3486 – 3617` |
| `#card-franco-viet-guide` | `3618 – 3713` |
| `#card-elderly-care-comparison` | `3714 – 3779` |
| `#plan-modal` | `3780 – 4055` |
| `#income-modal` | `4056 – 4110` |
| `#expense-modal` | `4111 – 4205` |
| `#actual-networth-modal` | `4206 – 4286` |
| `#milestone-modal` | `4287 – 4394` |
| `#modal-gemini-settings` | `4395 – 4448` |
| `#apartment-modal` | `4449 – 4702` |
| `#auth-modal` | `4703 – 4786` |
| `#modal-formula-guide` | `4787 – 5021` |
| `#quick-setup-modal` | `5022 – 5237` |
| `#confirm-modal` | `5238 – 5256` |
| `#feature-intro-modal` | `5257 – 5359` |

---

## 2. `frontend/css/styles.css` (9420 dòng)
| Phân mục CSS (`/* === ... === */`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| pyRetrait — Premium Design System & Theme Stylesheet | `1 – 78` |
| Base & Reset | `79 – 106` |
| Iconify Unified Icon System | `107 – 157` |
| Top Navigation Bar | `158 – 528` |
| Buttons & Interactive Elements | `529 – 645` |
| App Layout & Sidebar | `646 – 830` |
| Main Content Area & Dashboard KPIs | `831 – 929` |
| Cards & Layout Panels | `930 – 1080` |
| Form Controls & Inputs | `1081 – 1229` |
| Expandable Panels for Advanced Modules | `1230 – 1512` |
| Income & Expense Streams Side-by-Side Layout | `1513 – 1686` |
| Expense Streams & Crédits | `1687 – 2743` |
| Withdrawal Strategy Cards | `2744 – 2909` |
| Monte Carlo Stats Integrated in Chart Card | `2910 – 3014` |
| What-If Scenarios List | `3015 – 3064` |
| Spending Phases Card & Estate | `3065 – 3089` |
| AI Advisor Panel | `3090 – 3238` |
| Data Table | `3239 – 3280` |
| Dropdown Menus & Modals | `3281 – 3543` |
| Life Milestones Visuals & Markers | `3544 – 3770` |
| French Accounts Tracking & Withdrawal Waterfall Styles | `3771 – 3916` |
| Gemini AI Insights & Chart Commentary Component | `3917 – 4495` |
| Responsive Breakpoints & Layout Adaptations | `4496 – 4585` |
| Print / Export Report Stylesheet | `4586 – 4619` |
| pyLocation / Patrimoine Custom Component Styles | `4620 – 4637` |
| Inline Financial & Mathematical Formulas (Direct Verification) | `4638 – 4762` |
| PEA Masterclass & Strategic Tips (Native pyRetrait Design System) | `4763 – 4997` |
| Family & Children Planning: Side-by-Side (Inputs Left, Formulas Right) | `4998 – 5085` |
| Estate Planning & Legacy Milestone: Unified Composite Card | `5086 – 5158` |
| Retirement Spending Smile: Side-by-Side (Inputs Left, Budget & Science Right) | `5159 – 5301` |
| Dual-Theme (Light & Dark) UI Optimization & Period Timeline Cards | `5302 – 5818` |
| Cross-Tab Unified Light/Dark Mode Components & Accents | `5819 – 6303` |
| Franco-Viet Guide Components (Health, Pension, Cross-border Benefits) | `6304 – 6482` |
| Onboarding Wizard (Thiết Lập Nhanh 4 Bước) | `6483 – 6871` |
| Feature Discovery / Capabilities Intro Modal | `6872 – 7151` |
| Special Expense Item: Kế Hoạch Thừa Kế & Đánh Giá Mục Tiêu Di Sản | `7152 – 7213` |
| Tab Hero Banners (Universal Philosophy & Core Questions/Answers) | `7214 – 7576` |
| Advanced Healthspan Features (1, 3, 4, 5) | `7577 – 8014` |
| Longevity Nutrition Matrix (3-Column Layout: Sáng, Trưa, Tối) | `8015 – 8032` |
| Longevity Nutrition Matrix Styling | `8033 – 8050` |
| Cellular Hydration & Electrolytes Protocol (70% Body Weight) | `8051 – 8505` |
| Health 3-Tier Layout Architecture | `8506 – 8535` |
| Tab Quản Lý Rủi Ro: Bố Cục 2 Tầng Dọc Liền Mạch (Sequential 2-Tier Dashboard) | `8536 – 8600` |
| Lưới An Toàn 3 Biến Cố & FIRE Bền Bỉ (Triple-Shock Safety Net & Bulletproof FIRE) | `8601 – 8915` |
| .profile-summary-bar { | `8916 – 9382` |
| DÒNG GHI CHÚ: VÌ SAO TIỀN MẶT & QUỸ ĐẦU TƯ QUAN TRỌNG HƠN TỔNG TÀI SẢN | `9383 – 9420` |

---

## 3. `frontend/js/i18n.js` (925 dòng) & `state.js` (484 dòng — Tầng 2 State)
### `i18n.js`
| Từ điển / Hàm | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| Từ điển `vi` | `21 – 259` |
| Từ điển `en` | `260 – 498` |
| Từ điển `fr` | `499 – 739` |
| `getSavedLanguage()` | `740 – 751` |
| `t()` | `752 – 763` |
| `applyLanguage()` | `764 – 814` |
| `setLanguage()` | `815 – 818` |
| `renderLanguageDropdown()` | `819 – 856` |
| `toggleDropdown()` | `857 – 872` |
| `closeDropdown()` | `873 – 881` |
| `init()` | `882 – 925` |

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
| `ensurePlanDefaults()` | `99 – 167` |
| `syncSalaryStreamsWithMaritalStatus()` | `168 – 265` |
| `applySavedUserPreferences()` | `266 – 298` |
| `savePlansToStorage()` | `299 – 342` |
| `debouncedSavePlansToStorage()` | `343 – 346` |
| `loadInitialPlans()` | `347 – 484` |

---

## 4. `frontend/js/engine.js` (1477 dòng — Tầng 1 Core Engine)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getCurrencySymbol()` | `9 – 16` |
| `formatCurrency()` | `17 – 58` |
| `calculateWeightedReturn()` | `59 – 86` |
| `calculateMortgageSchedule()` | `87 – 94` |
| `calculateCombinedMortgageSchedule()` | `95 – 134` |
| `computePropertyValue()` | `135 – 186` |
| `calculateSingleMortgageSchedule()` | `187 – 308` |
| `evaluateStressResilience()` | `309 – 474` |
| `findOptimalRetirementAge()` | `475 – 561` |
| `runProjection()` | `562 – 1477` |

---

## 5. Tầng 3 UI — Nhạc Trưởng & 3 Tab Độc Lập + Modals
### 5.1. `frontend/js/ui.js` (904 dòng — Nhạc trưởng điều phối trung tâm)
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
| `renderActivePlanInputs()` | `354 – 551` |
| `updateAll()` | `552 – 740` |
| `convertPlanCurrency()` | `741 – 773` |
| `setCurrency()` | `774 – 795` |
| `setViewMode()` | `796 – 807` |
| `updateThemeIcon()` | `808 – 818` |
| `toggleTheme()` | `819 – 829` |
| `loadTheme()` | `830 – 904` |

### 5.2. `frontend/js/ui-tab1-charts.js` (1841 dòng — Tab 1A: Biểu đồ, Monte Carlo, Biến cố & Bảng năm)
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
| `renderCashFlowChart()` | `1104 – 1330` |
| `renderProjectionsTable()` | `1331 – 1390` |
| `renderMonteCarloTab()` | `1391 – 1622` |
| `renderScenarioTab()` | `1623 – 1841` |

### 5.3. `frontend/js/ui-tab1-streams.js` (2755 dòng — Tab 1B: Luồng Thu/Chi, Phân bổ tài sản & 4 Chiến lược)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `16 – 20` |
| `parseVal()` | `21 – 27` |
| `setVal()` | `28 – 32` |
| `escapeHtml()` | `33 – 54` |
| `getActivePlan()` | `55 – 62` |
| `savePlansToStorage()` | `63 – 72` |
| `debouncedSavePlansToStorage()` | `73 – 83` |
| `bindTab1StreamEvents()` | `84 – 731` |
| `ensureAssetAllocationCardPosition()` | `732 – 739` |
| `updateAssetAllocationUI()` | `740 – 864` |
| `updateDualInflationUI()` | `865 – 939` |
| `updateRetirementLocationUI()` | `940 – 965` |
| `computeIncomePeriods()` | `966 – 1104` |
| `renderIncomePeriodsSummary()` | `1105 – 1254` |
| `renderIncomeStreamsList()` | `1255 – 1396` |
| `getActiveIncomeAtAge()` | `1397 – 1412` |
| `ensureDefaultExpenseStreams()` | `1413 – 1480` |
| `getActiveExpensesAtAge()` | `1481 – 1529` |
| `updateCashflowBalanceUI()` | `1530 – 1630` |
| `syncSavingsAndExpensesFromRate()` | `1631 – 1634` |
| `updateSavingsRateUI()` | `1635 – 1639` |
| `applyProfileVisibilityRules()` | `1640 – 2012` |
| `updateRetirementLocationRadiosUI()` | `2013 – 2178` |
| `updateExpenseSavingsHints()` | `2179 – 2183` |
| `renderExpensePeriodsSummary()` | `2184 – 2475` |
| `renderExpenseStreamsList()` | `2476 – 2590` |
| `updateWithdrawalStrategyCards()` | `2591 – 2602` |
| `hexToRgba()` | `2603 – 2721` |
| `renderWithdrawalComparison()` | `2722 – 2755` |

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

### 5.5. `frontend/js/ui-tab3-taxes.js` (2114 dòng — Tab 3: Tối ưu Thuế, Lương hưu Pháp/VN & LMNP)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `14 – 18` |
| `parseVal()` | `19 – 25` |
| `setVal()` | `26 – 30` |
| `escapeHtml()` | `31 – 52` |
| `getActivePlan()` | `53 – 60` |
| `savePlansToStorage()` | `61 – 70` |
| `debouncedSavePlansToStorage()` | `71 – 81` |
| `bindTab3Events()` | `82 – 633` |
| `initFrancoVietGuideInteractions()` | `634 – 670` |
| `updateTaxRegimeUI()` | `671 – 703` |
| `renderGlobalAccountsContent()` | `704 – 796` |
| `estimateFrenchFullPension()` | `797 – 819` |
| `getPrimarySalaryIncome()` | `820 – 834` |
| `syncPensionBaseAuto()` | `835 – 858` |
| `updatePensionDecoteUI()` | `859 – 962` |
| `updateBhxhVnUI()` | `963 – 1144` |
| `updateGermanPensionUI()` | `1145 – 1234` |
| `updateUsPensionUI()` | `1235 – 1324` |
| `syncBhxhVnStreams()` | `1325 – 1415` |
| `eurToPlanFactor()` | `1416 – 1423` |
| `extractPatrimoineLoansEur()` | `1424 – 1454` |
| `buildPatrimoineLoans()` | `1455 – 1475` |
| `applyPatrimoineToPlan()` | `1476 – 1558` |
| `fetchPatrimoineData()` | `1559 – 1574` |
| `syncFromPatrimoine()` | `1575 – 1587` |
| `updateLmnpUI()` | `1588 – 1767` |
| `renderPatrimoineLoansList()` | `1768 – 1790` |
| `updateMortgageUI()` | `1791 – 1876` |
| `syncMortgageToExpenseStreams()` | `1877 – 1966` |
| `renderTaxTab()` | `1967 – 2114` |

### 5.6. `frontend/js/ui-modals.js` (1892 dòng — Popup Modals & Thiết lập nhanh Wizard)
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
| `updatePlanModalPppTags()` | `1118 – 1162` |
| `setPlanGender()` | `1163 – 1177` |
| `setPlanFamily()` | `1178 – 1192` |
| `setPlanRetireMode()` | `1193 – 1223` |
| `handlePlanWorkCityChange()` | `1224 – 1249` |
| `closeModal()` | `1250 – 1254` |
| `saveNewPlanFromModal()` | `1255 – 1484` |
| `duplicateCurrentPlan()` | `1485 – 1499` |
| `deleteCurrentPlan()` | `1500 – 1526` |
| `handleJSONImport()` | `1527 – 1556` |
| `initQuickSetupWizard()` | `1557 – 1685` |
| `updateSpendCalcText()` | `1686 – 1701` |
| `openQuickSetupWizard()` | `1702 – 1758` |
| `closeQuickSetupWizard()` | `1759 – 1763` |
| `showWizardStep()` | `1764 – 1790` |
| `applyWizardAndCalculate()` | `1791 – 1892` |

---

## 6. `frontend/js/patrimoine.js` (1553 dòng)
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
| `computeApartmentMetrics()` | `97 – 166` |
| `computeFullPatrimoine()` | `167 – 193` |
| `loadRawData()` | `194 – 223` |
| `saveRawToCloud()` | `224 – 232` |
| `loadData()` | `233 – 238` |
| `render()` | `239 – 249` |
| `renderKPIs()` | `250 – 291` |
| `renderApartmentsList()` | `292 – 392` |
| `renderChart()` | `393 – 493` |
| `renderBreakEvenSection()` | `494 – 528` |
| `updateBreakEvenView()` | `529 – 545` |
| `renderBreakEvenSingleApt()` | `546 – 818` |
| `renderBreakEvenComparisonAll()` | `819 – 967` |
| `renderGeminiAIBox()` | `968 – 990` |
| `autoSyncToFire()` | `991 – 1004` |
| `showAutoSyncToast()` | `1005 – 1047` |
| `removeApartmentFromObject()` | `1048 – 1063` |
| `openApartmentModal()` | `1064 – 1168` |
| `updatePropertyFormulaUI()` | `1169 – 1192` |
| `closeApartmentModal()` | `1193 – 1197` |
| `saveApartment()` | `1198 – 1294` |
| `deleteApartment()` | `1295 – 1353` |
| `setVal()` | `1354 – 1358` |
| `getVal()` | `1359 – 1363` |
| `updateAptLiveSummary()` | `1364 – 1434` |
| `bindEvents()` | `1435 – 1553` |

---

## 7. `frontend/js/taxOptimizer.js` (974 dòng), `monteCarlo.js` (265 dòng) & `geminiAdvisor.js` (424 dòng)
### `taxOptimizer.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `calculateProgressiveTax()` | `108 – 210` |
| `computeFrenchTaxParts()` | `211 – 249` |
| `calculateTaxDetailed()` | `250 – 430` |
| `calculateRetireBudgetFromCashflow()` | `431 – 529` |
| `getSuggestedRetirementBudget()` | `530 – 575` |
| `calculateFrenchPension()` | `576 – 651` |
| `calculateVietnamBhxhPension()` | `652 – 731` |
| `calculateGermanPension()` | `732 – 803` |
| `calculateUsSocialSecurityPension()` | `804 – 895` |
| `simulateWithdrawalWaterfall()` | `896 – 974` |

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
