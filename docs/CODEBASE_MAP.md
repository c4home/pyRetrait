# Bản Đồ Định Vị Mã Nguồn Tự Động (Codebase Map & Line-Range Index)

> **CẬP NHẬT TỰ ĐỘNG 100% BỞI `./verify_js.sh` (TỐN 0 TOKEN & 0 CÔNG SỨC):**  
> Bạn **KHÔNG BAO GIỜ** phải sửa file này bằng tay. Mỗi khi chạy `./verify_js.sh`, script sẽ tự động quét lại toàn bộ các hàm, thẻ HTML, phân mục CSS và từ điển đa ngôn ngữ để cập nhật số dòng chính xác trong 0.05 giây.  
> **Quy tắc bắt buộc cho AI:** Trước khi đọc hoặc sửa các file UI (`ui.js`, `ui-tab1-charts.js`, `ui-tab1-streams.js`, `ui-tab2-health.js`, `ui-tab3-taxes.js`, `ui-modals.js`), `index.html`, `styles.css`, `i18n.js`, `engine.js`, `patrimoine.js`, **bắt buộc tra bảng số dòng dưới đây** để gọi `view_file` đúng khoảng `StartLine` – `EndLine`.

---

## 1. `frontend/index.html` (4875 dòng)
| Khu vực / Thẻ ID | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `<header>` (Thanh điều hướng trên cùng) | `32 – 254` |
| `#tab-projections` | `255 – 398` |
| Cột 1: Các Luồng Thu nhập (`col1_income_header`) | `399 – 409` |
| `#card-lmnp-income-stream` | `410 – 488` |
| `#card-french-pension-stream` | `489 – 614` |
| `#card-bhxh-income-stream` | `615 – 745` |
| `#card-asset-allocation-stream` | `746 – 831` |
| `#card-withdrawal-strategy-controls` | `832 – 887` |
| `#card-strat-bengen_4pct` | `888 – 908` |
| `#card-strat-guyton_klinger` | `909 – 936` |
| `#card-strat-vpw` | `937 – 962` |
| `#card-strat-fixed_pct` | `963 – 1056` |
| Cột 2: Các Luồng Chi tiêu (`col2_expense_header`) | `1057 – 1066` |
| `#card-retire-expense-stream` | `1067 – 1259` |
| `#card-children-family-stream` | `1260 – 1378` |
| `#card-senior-care-stream` | `1379 – 1447` |
| `#card-estate-legacy-combined` | `1448 – 1551` |
| `#card-dual-inflation-stream` | `1552 – 1674` |
| `#section-gemini-projections` | `1675 – 1752` |
| `#chart-networth` | `1753 – 1769` |
| `#chart-cashflow` | `1770 – 1777` |
| `#tab-taxes` | `1778 – 1811` |
| `#card-french-accounts` | `1812 – 1905` |
| `#card-pea-masterclass` | `1906 – 2077` |
| `#card-assurance-vie-masterclass` | `2078 – 2252` |
| `#card-livret-masterclass` | `2253 – 2432` |
| `#tab-estate` | `2433 – 2469` |
| `#card-healthspan-score` | `2470 – 2844` |
| `#card-longevity-nutrition` | `2845 – 3070` |
| `#card-health-roadmap` | `3071 – 3202` |
| `#card-franco-viet-guide` | `3203 – 3298` |
| `#card-elderly-care-comparison` | `3299 – 3364` |
| `#plan-modal` | `3365 – 3574` |
| `#income-modal` | `3575 – 3629` |
| `#expense-modal` | `3630 – 3724` |
| `#actual-networth-modal` | `3725 – 3805` |
| `#milestone-modal` | `3806 – 3913` |
| `#modal-gemini-settings` | `3914 – 3967` |
| `#apartment-modal` | `3968 – 4218` |
| `#auth-modal` | `4219 – 4302` |
| `#modal-formula-guide` | `4303 – 4537` |
| `#quick-setup-modal` | `4538 – 4753` |
| `#confirm-modal` | `4754 – 4772` |
| `#feature-intro-modal` | `4773 – 4875` |

---

## 2. `frontend/css/styles.css` (9340 dòng)
| Phân mục CSS (`/* === ... === */`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| pyRetrait — Premium Design System & Theme Stylesheet | `1 – 78` |
| Base & Reset | `79 – 144` |
| Top Navigation Bar | `145 – 515` |
| Buttons & Interactive Elements | `516 – 632` |
| App Layout & Sidebar | `633 – 817` |
| Main Content Area & Dashboard KPIs | `818 – 916` |
| Cards & Layout Panels | `917 – 1067` |
| Form Controls & Inputs | `1068 – 1216` |
| Expandable Panels for Advanced Modules | `1217 – 1499` |
| Income & Expense Streams Side-by-Side Layout | `1500 – 1673` |
| Expense Streams & Crédits | `1674 – 2730` |
| Withdrawal Strategy Cards | `2731 – 2896` |
| Monte Carlo Stats Integrated in Chart Card | `2897 – 3001` |
| What-If Scenarios List | `3002 – 3051` |
| Spending Phases Card & Estate | `3052 – 3076` |
| AI Advisor Panel | `3077 – 3225` |
| Data Table | `3226 – 3267` |
| Dropdown Menus & Modals | `3268 – 3517` |
| Life Milestones Visuals & Markers | `3518 – 3744` |
| French Accounts Tracking & Withdrawal Waterfall Styles | `3745 – 3890` |
| Gemini AI Insights & Chart Commentary Component | `3891 – 4469` |
| Responsive Breakpoints & Layout Adaptations | `4470 – 4559` |
| Print / Export Report Stylesheet | `4560 – 4593` |
| pyLocation / Patrimoine Custom Component Styles | `4594 – 4611` |
| Inline Financial & Mathematical Formulas (Direct Verification) | `4612 – 4736` |
| PEA Masterclass & Strategic Tips (Native pyRetrait Design System) | `4737 – 4969` |
| Family & Children Planning: Side-by-Side (Inputs Left, Formulas Right) | `4970 – 5057` |
| Estate Planning & Legacy Milestone: Unified Composite Card | `5058 – 5130` |
| Retirement Spending Smile: Side-by-Side (Inputs Left, Budget & Science Right) | `5131 – 5273` |
| Dual-Theme (Light & Dark) UI Optimization & Period Timeline Cards | `5274 – 5790` |
| Cross-Tab Unified Light/Dark Mode Components & Accents | `5791 – 6275` |
| Franco-Viet Guide Components (Health, Pension, Cross-border Benefits) | `6276 – 6454` |
| Onboarding Wizard (Thiết Lập Nhanh 4 Bước) | `6455 – 6843` |
| Feature Discovery / Capabilities Intro Modal | `6844 – 7123` |
| Special Expense Item: Kế Hoạch Thừa Kế & Đánh Giá Mục Tiêu Di Sản | `7124 – 7185` |
| Tab Hero Banners (Universal Philosophy & Core Questions/Answers) | `7186 – 7548` |
| Advanced Healthspan Features (1, 3, 4, 5) | `7549 – 7986` |
| Longevity Nutrition Matrix (3-Column Layout: Sáng, Trưa, Tối) | `7987 – 8004` |
| Longevity Nutrition Matrix Styling | `8005 – 8022` |
| Cellular Hydration & Electrolytes Protocol (70% Body Weight) | `8023 – 8477` |
| Health 3-Tier Layout Architecture | `8478 – 8507` |
| Tab Quản Lý Rủi Ro: Bố Cục 2 Tầng Dọc Liền Mạch (Sequential 2-Tier Dashboard) | `8508 – 8572` |
| Lưới An Toàn 3 Biến Cố & FIRE Bền Bỉ (Triple-Shock Safety Net & Bulletproof FIRE) | `8573 – 8886` |
| .profile-summary-bar { | `8887 – 9340` |

---

## 3. `frontend/js/i18n.js` (843 dòng) & `state.js` (358 dòng — Tầng 2 State)
### `i18n.js`
| Từ điển / Hàm | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| Từ điển `vi` | `21 – 233` |
| Từ điển `en` | `234 – 446` |
| Từ điển `fr` | `447 – 661` |
| `getSavedLanguage()` | `662 – 673` |
| `t()` | `674 – 685` |
| `applyLanguage()` | `686 – 732` |
| `setLanguage()` | `733 – 736` |
| `renderLanguageDropdown()` | `737 – 774` |
| `toggleDropdown()` | `775 – 790` |
| `closeDropdown()` | `791 – 799` |
| `init()` | `800 – 843` |

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
| `ensurePlanDefaults()` | `99 – 127` |
| `applySavedUserPreferences()` | `128 – 160` |
| `savePlansToStorage()` | `161 – 204` |
| `debouncedSavePlansToStorage()` | `205 – 208` |
| `loadInitialPlans()` | `209 – 358` |

---

## 4. `frontend/js/engine.js` (1364 dòng — Tầng 1 Core Engine)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getCurrencySymbol()` | `9 – 16` |
| `formatCurrency()` | `17 – 58` |
| `calculateWeightedReturn()` | `59 – 86` |
| `calculateMortgageSchedule()` | `87 – 94` |
| `calculateCombinedMortgageSchedule()` | `95 – 134` |
| `computePropertyValue()` | `135 – 161` |
| `calculateSingleMortgageSchedule()` | `162 – 282` |
| `evaluateStressResilience()` | `283 – 448` |
| `findOptimalRetirementAge()` | `449 – 535` |
| `runProjection()` | `536 – 1364` |

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

### 5.2. `frontend/js/ui-tab1-charts.js` (1871 dòng — Tab 1A: Biểu đồ, Monte Carlo, Biến cố & Bảng năm)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `16 – 20` |
| `parseVal()` | `21 – 27` |
| `setVal()` | `28 – 32` |
| `escapeHtml()` | `33 – 54` |
| `getActivePlan()` | `55 – 62` |
| `savePlansToStorage()` | `63 – 72` |
| `debouncedSavePlansToStorage()` | `73 – 83` |
| `bindTab1ChartEvents()` | `84 – 189` |
| `triggerPlanProjectionsInsight()` | `190 – 271` |
| `renderMilestonesRibbon()` | `272 – 338` |
| `renderStressResilienceCard()` | `339 – 505` |
| `drawMilestoneMarkers()` | `506 – 623` |
| `renderNetWorthChart()` | `624 – 1133` |
| `renderCashFlowChart()` | `1134 – 1360` |
| `renderProjectionsTable()` | `1361 – 1420` |
| `renderMonteCarloTab()` | `1421 – 1652` |
| `renderScenarioTab()` | `1653 – 1871` |

### 5.3. `frontend/js/ui-tab1-streams.js` (2517 dòng — Tab 1B: Luồng Thu/Chi, Phân bổ tài sản & 4 Chiến lược)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `16 – 20` |
| `parseVal()` | `21 – 27` |
| `setVal()` | `28 – 32` |
| `escapeHtml()` | `33 – 54` |
| `getActivePlan()` | `55 – 62` |
| `savePlansToStorage()` | `63 – 72` |
| `debouncedSavePlansToStorage()` | `73 – 83` |
| `bindTab1StreamEvents()` | `84 – 722` |
| `updateAssetAllocationUI()` | `723 – 844` |
| `updateDualInflationUI()` | `845 – 919` |
| `updateRetirementLocationUI()` | `920 – 945` |
| `computeIncomePeriods()` | `946 – 1084` |
| `renderIncomePeriodsSummary()` | `1085 – 1234` |
| `renderIncomeStreamsList()` | `1235 – 1338` |
| `getActiveIncomeAtAge()` | `1339 – 1354` |
| `ensureDefaultExpenseStreams()` | `1355 – 1422` |
| `getActiveExpensesAtAge()` | `1423 – 1471` |
| `updateCashflowBalanceUI()` | `1472 – 1572` |
| `syncSavingsAndExpensesFromRate()` | `1573 – 1576` |
| `updateSavingsRateUI()` | `1577 – 1581` |
| `applyProfileVisibilityRules()` | `1582 – 1828` |
| `updateRetirementLocationRadiosUI()` | `1829 – 1941` |
| `updateExpenseSavingsHints()` | `1942 – 1946` |
| `renderExpensePeriodsSummary()` | `1947 – 2238` |
| `renderExpenseStreamsList()` | `2239 – 2353` |
| `updateWithdrawalStrategyCards()` | `2354 – 2365` |
| `hexToRgba()` | `2366 – 2484` |
| `renderWithdrawalComparison()` | `2485 – 2517` |

### 5.4. `frontend/js/ui-tab2-health.js` (1361 dòng — Tab 2: Sức khỏe, Con cái & Y tế dự phòng)
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
| `updateBioAge()` | `89 – 151` |
| `updateHealthspanScore()` | `152 – 291` |
| `updateCrossBorderChecklist()` | `292 – 338` |
| `renderHealthTab()` | `339 – 358` |
| `initHealthTabEvents()` | `359 – 393` |
| `bindTab2Events()` | `394 – 622` |
| `updateSeniorCareUI()` | `623 – 688` |
| `updateFamilyStreamUI()` | `689 – 867` |
| `updateFamilyChildrenSimulation()` | `868 – 955` |
| `renderFamilyCashFlowChart()` | `956 – 1137` |
| `initFamilyChildrenSimulation()` | `1138 – 1174` |
| `updateEstateMilestones()` | `1175 – 1237` |
| `renderEstateTab()` | `1238 – 1244` |
| `renderAdvisorTab()` | `1245 – 1361` |

### 5.5. `frontend/js/ui-tab3-taxes.js` (1476 dòng — Tab 3: Tối ưu Thuế, Lương hưu Pháp/VN & LMNP)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `14 – 18` |
| `parseVal()` | `19 – 25` |
| `setVal()` | `26 – 30` |
| `escapeHtml()` | `31 – 52` |
| `getActivePlan()` | `53 – 60` |
| `savePlansToStorage()` | `61 – 70` |
| `debouncedSavePlansToStorage()` | `71 – 81` |
| `bindTab3Events()` | `82 – 401` |
| `initFrancoVietGuideInteractions()` | `402 – 438` |
| `updateTaxRegimeUI()` | `439 – 452` |
| `estimateFrenchFullPension()` | `453 – 475` |
| `getPrimarySalaryIncome()` | `476 – 489` |
| `syncPensionBaseAuto()` | `490 – 513` |
| `updatePensionDecoteUI()` | `514 – 591` |
| `updateBhxhVnUI()` | `592 – 703` |
| `syncBhxhVnStreams()` | `704 – 774` |
| `eurToPlanFactor()` | `775 – 782` |
| `extractPatrimoineLoansEur()` | `783 – 813` |
| `buildPatrimoineLoans()` | `814 – 834` |
| `applyPatrimoineToPlan()` | `835 – 934` |
| `fetchPatrimoineData()` | `935 – 950` |
| `syncFromPatrimoine()` | `951 – 963` |
| `updateLmnpUI()` | `964 – 1140` |
| `renderPatrimoineLoansList()` | `1141 – 1163` |
| `updateMortgageUI()` | `1164 – 1249` |
| `syncMortgageToExpenseStreams()` | `1250 – 1339` |
| `renderTaxTab()` | `1340 – 1476` |

### 5.6. `frontend/js/ui-modals.js` (1616 dòng — Popup Modals & Thiết lập nhanh Wizard)
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
| `bindModalEvents()` | `234 – 466` |
| `openExpenseModal()` | `467 – 507` |
| `syncExpenseGrowthVisibility()` | `508 – 513` |
| `closeExpenseModal()` | `514 – 518` |
| `saveExpenseFromModal()` | `519 – 561` |
| `openIncomeModal()` | `562 – 596` |
| `closeIncomeModal()` | `597 – 600` |
| `saveIncomeFromModal()` | `601 – 653` |
| `openMilestoneModal()` | `654 – 665` |
| `closeMilestoneModal()` | `666 – 671` |
| `renderModalMilestonesContent()` | `672 – 755` |
| `showMilestoneForm()` | `756 – 787` |
| `hideMilestoneForm()` | `788 – 792` |
| `saveMilestoneFromForm()` | `793 – 831` |
| `openActualNetWorthModal()` | `832 – 853` |
| `closeActualNetWorthModal()` | `854 – 858` |
| `renderActualRecordsTable()` | `859 – 911` |
| `addActualRecordFromForm()` | `912 – 965` |
| `deleteActualRecord()` | `966 – 977` |
| `fetchPatrimoineBalanceForActual()` | `978 – 1021` |
| `renderPlanSelector()` | `1022 – 1028` |
| `openModal()` | `1029 – 1102` |
| `closeModal()` | `1103 – 1107` |
| `saveNewPlanFromModal()` | `1108 – 1213` |
| `duplicateCurrentPlan()` | `1214 – 1228` |
| `deleteCurrentPlan()` | `1229 – 1255` |
| `handleJSONImport()` | `1256 – 1285` |
| `initQuickSetupWizard()` | `1286 – 1414` |
| `updateSpendCalcText()` | `1415 – 1430` |
| `openQuickSetupWizard()` | `1431 – 1487` |
| `closeQuickSetupWizard()` | `1488 – 1492` |
| `showWizardStep()` | `1493 – 1519` |
| `applyWizardAndCalculate()` | `1520 – 1616` |

---

## 6. `frontend/js/patrimoine.js` (1602 dòng)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `formatMoneyEUR()` | `14 – 18` |
| `formatMoneyVND()` | `19 – 28` |
| `getGuestPatrimoine()` | `29 – 37` |
| `saveGuestPatrimoine()` | `38 – 53` |
| `numOr()` | `54 – 58` |
| `truthyOr()` | `59 – 70` |
| `calcNotaryFees()` | `71 – 83` |
| `calcMonthlyPayment()` | `84 – 97` |
| `computeApartmentMetrics()` | `98 – 166` |
| `computeTuroMetrics()` | `167 – 205` |
| `computeFullPatrimoine()` | `206 – 235` |
| `loadRawData()` | `236 – 265` |
| `saveRawToCloud()` | `266 – 274` |
| `loadData()` | `275 – 280` |
| `render()` | `281 – 292` |
| `renderKPIs()` | `293 – 342` |
| `renderApartmentsList()` | `343 – 443` |
| `renderTuroSection()` | `444 – 473` |
| `renderChart()` | `474 – 582` |
| `renderBreakEvenSection()` | `583 – 617` |
| `updateBreakEvenView()` | `618 – 634` |
| `renderBreakEvenSingleApt()` | `635 – 887` |
| `renderBreakEvenComparisonAll()` | `888 – 1036` |
| `renderGeminiAIBox()` | `1037 – 1060` |
| `autoSyncToFire()` | `1061 – 1074` |
| `showAutoSyncToast()` | `1075 – 1115` |
| `openApartmentModal()` | `1116 – 1210` |
| `updatePropertyFormulaUI()` | `1211 – 1234` |
| `closeApartmentModal()` | `1235 – 1239` |
| `saveApartment()` | `1240 – 1326` |
| `deleteApartment()` | `1327 – 1354` |
| `saveTuroSettings()` | `1355 – 1413` |
| `setVal()` | `1414 – 1418` |
| `getVal()` | `1419 – 1423` |
| `updateAptLiveSummary()` | `1424 – 1494` |
| `bindEvents()` | `1495 – 1602` |

---

## 7. `frontend/js/taxOptimizer.js` (747 dòng), `monteCarlo.js` (171 dòng) & `geminiAdvisor.js` (424 dòng)
### `taxOptimizer.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `calculateProgressiveTax()` | `108 – 225` |
| `calculateTaxDetailed()` | `226 – 372` |
| `calculateRetireBudgetFromCashflow()` | `373 – 471` |
| `getSuggestedRetirementBudget()` | `472 – 517` |
| `calculateFrenchPension()` | `518 – 593` |
| `calculateVietnamBhxhPension()` | `594 – 670` |
| `simulateWithdrawalWaterfall()` | `671 – 747` |

### `monteCarlo.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `mulberry32()` | `9 – 18` |
| `createRandomNormal()` | `19 – 30` |
| `runSimulation()` | `31 – 171` |

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
