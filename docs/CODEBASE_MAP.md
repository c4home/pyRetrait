# Bản Đồ Định Vị Mã Nguồn Tự Động (Codebase Map & Line-Range Index)

> **CẬP NHẬT TỰ ĐỘNG 100% BỞI `./verify_js.sh` (TỐN 0 TOKEN & 0 CÔNG SỨC):**  
> Bạn **KHÔNG BAO GIỜ** phải sửa file này bằng tay. Mỗi khi chạy `./verify_js.sh`, script sẽ tự động quét lại toàn bộ các hàm, thẻ HTML, phân mục CSS và từ điển đa ngôn ngữ để cập nhật số dòng chính xác trong 0.05 giây.  
> **Quy tắc bắt buộc cho AI:** Trước khi đọc hoặc sửa các file UI (`ui.js`, `ui-tab1-charts.js`, `ui-tab1-streams.js`, `ui-tab2-health.js`, `ui-tab3-taxes.js`, `ui-modals.js`), `index.html`, `styles.css`, `i18n.js`, `engine.js`, `patrimoine.js`, **bắt buộc tra bảng số dòng dưới đây** để gọi `view_file` đúng khoảng `StartLine` – `EndLine`.

---

## 1. `frontend/index.html` (4617 dòng)
| Khu vực / Thẻ ID | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `<header>` (Thanh điều hướng trên cùng) | `32 – 254` |
| `#tab-projections` | `255 – 382` |
| Cột 1: Các Luồng Thu nhập (`col1_income_header`) | `383 – 393` |
| `#card-lmnp-income-stream` | `394 – 472` |
| `#card-french-pension-stream` | `473 – 573` |
| `#card-bhxh-income-stream` | `574 – 678` |
| `#card-asset-allocation-stream` | `679 – 764` |
| `#card-withdrawal-strategy-controls` | `765 – 820` |
| `#card-strat-bengen_4pct` | `821 – 841` |
| `#card-strat-guyton_klinger` | `842 – 869` |
| `#card-strat-vpw` | `870 – 895` |
| `#card-strat-fixed_pct` | `896 – 989` |
| Cột 2: Các Luồng Chi tiêu (`col2_expense_header`) | `990 – 999` |
| `#card-retire-expense-stream` | `1000 – 1182` |
| `#card-children-family-stream` | `1183 – 1301` |
| `#card-senior-care-stream` | `1302 – 1370` |
| `#card-estate-legacy-combined` | `1371 – 1474` |
| `#card-dual-inflation-stream` | `1475 – 1597` |
| `#section-gemini-projections` | `1598 – 1675` |
| `#chart-networth` | `1676 – 1692` |
| `#chart-cashflow` | `1693 – 1700` |
| `#tab-taxes` | `1701 – 1734` |
| `#card-french-accounts` | `1735 – 1828` |
| `#card-pea-masterclass` | `1829 – 2000` |
| `#card-assurance-vie-masterclass` | `2001 – 2175` |
| `#card-livret-masterclass` | `2176 – 2355` |
| `#tab-estate` | `2356 – 2392` |
| `#card-healthspan-score` | `2393 – 2767` |
| `#card-longevity-nutrition` | `2768 – 2993` |
| `#card-health-roadmap` | `2994 – 3125` |
| `#card-franco-viet-guide` | `3126 – 3221` |
| `#card-elderly-care-comparison` | `3222 – 3287` |
| `#plan-modal` | `3288 – 3316` |
| `#income-modal` | `3317 – 3371` |
| `#expense-modal` | `3372 – 3466` |
| `#actual-networth-modal` | `3467 – 3547` |
| `#milestone-modal` | `3548 – 3655` |
| `#modal-gemini-settings` | `3656 – 3709` |
| `#apartment-modal` | `3710 – 3960` |
| `#auth-modal` | `3961 – 4044` |
| `#modal-formula-guide` | `4045 – 4279` |
| `#quick-setup-modal` | `4280 – 4495` |
| `#confirm-modal` | `4496 – 4514` |
| `#feature-intro-modal` | `4515 – 4617` |

---

## 2. `frontend/css/styles.css` (8769 dòng)
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
| Dropdown Menus & Modals | `3268 – 3401` |
| Life Milestones Visuals & Markers | `3402 – 3628` |
| French Accounts Tracking & Withdrawal Waterfall Styles | `3629 – 3774` |
| Gemini AI Insights & Chart Commentary Component | `3775 – 4353` |
| Responsive Breakpoints & Layout Adaptations | `4354 – 4443` |
| Print / Export Report Stylesheet | `4444 – 4477` |
| pyLocation / Patrimoine Custom Component Styles | `4478 – 4495` |
| Inline Financial & Mathematical Formulas (Direct Verification) | `4496 – 4620` |
| PEA Masterclass & Strategic Tips (Native pyRetrait Design System) | `4621 – 4853` |
| Family & Children Planning: Side-by-Side (Inputs Left, Formulas Right) | `4854 – 4941` |
| Estate Planning & Legacy Milestone: Unified Composite Card | `4942 – 5014` |
| Retirement Spending Smile: Side-by-Side (Inputs Left, Budget & Science Right) | `5015 – 5157` |
| Dual-Theme (Light & Dark) UI Optimization & Period Timeline Cards | `5158 – 5674` |
| Cross-Tab Unified Light/Dark Mode Components & Accents | `5675 – 6159` |
| Franco-Viet Guide Components (Health, Pension, Cross-border Benefits) | `6160 – 6338` |
| Onboarding Wizard (Thiết Lập Nhanh 4 Bước) | `6339 – 6727` |
| Feature Discovery / Capabilities Intro Modal | `6728 – 7007` |
| Special Expense Item: Kế Hoạch Thừa Kế & Đánh Giá Mục Tiêu Di Sản | `7008 – 7069` |
| Tab Hero Banners (Universal Philosophy & Core Questions/Answers) | `7070 – 7432` |
| Advanced Healthspan Features (1, 3, 4, 5) | `7433 – 7870` |
| Longevity Nutrition Matrix (3-Column Layout: Sáng, Trưa, Tối) | `7871 – 7888` |
| Longevity Nutrition Matrix Styling | `7889 – 7906` |
| Cellular Hydration & Electrolytes Protocol (70% Body Weight) | `7907 – 8361` |
| Health 3-Tier Layout Architecture | `8362 – 8391` |
| Tab Quản Lý Rủi Ro: Bố Cục 2 Tầng Dọc Liền Mạch (Sequential 2-Tier Dashboard) | `8392 – 8456` |
| Lưới An Toàn 3 Biến Cố & FIRE Bền Bỉ (Triple-Shock Safety Net & Bulletproof FIRE) | `8457 – 8769` |

---

## 3. `frontend/js/i18n.js` (802 dòng) & `state.js` (275 dòng — Tầng 2 State)
### `i18n.js`
| Từ điển / Hàm | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| Từ điển `vi` | `21 – 219` |
| Từ điển `en` | `220 – 418` |
| Từ điển `fr` | `419 – 620` |
| `getSavedLanguage()` | `621 – 632` |
| `t()` | `633 – 644` |
| `applyLanguage()` | `645 – 691` |
| `setLanguage()` | `692 – 695` |
| `renderLanguageDropdown()` | `696 – 733` |
| `toggleDropdown()` | `734 – 749` |
| `closeDropdown()` | `750 – 758` |
| `init()` | `759 – 802` |

### `state.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `on()` | `30 – 35` |
| `off()` | `36 – 40` |
| `emit()` | `41 – 48` |
| `getState()` | `49 – 52` |
| `getActivePlan()` | `53 – 58` |
| `setActivePlanId()` | `59 – 70` |
| `getCurrency()` | `71 – 74` |
| `setCurrency()` | `75 – 79` |
| `getViewMode()` | `80 – 83` |
| `setViewMode()` | `84 – 88` |
| `getActiveTab()` | `89 – 92` |
| `setActiveTab()` | `93 – 98` |
| `savePlansToStorage()` | `99 – 136` |
| `debouncedSavePlansToStorage()` | `137 – 140` |
| `loadInitialPlans()` | `141 – 275` |

---

## 4. `frontend/js/engine.js` (1298 dòng — Tầng 1 Core Engine)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getCurrencySymbol()` | `9 – 15` |
| `formatCurrency()` | `16 – 47` |
| `calculateWeightedReturn()` | `48 – 75` |
| `calculateMortgageSchedule()` | `76 – 83` |
| `calculateCombinedMortgageSchedule()` | `84 – 123` |
| `computePropertyValue()` | `124 – 150` |
| `calculateSingleMortgageSchedule()` | `151 – 271` |
| `evaluateStressResilience()` | `272 – 437` |
| `findOptimalRetirementAge()` | `438 – 524` |
| `runProjection()` | `525 – 1298` |

---

## 5. Tầng 3 UI — Nhạc Trưởng & 3 Tab Độc Lập + Modals
### 5.1. `frontend/js/ui.js` (877 dòng — Nhạc trưởng điều phối trung tâm)
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
| `renderActivePlanInputs()` | `354 – 532` |
| `updateAll()` | `533 – 718` |
| `convertPlanCurrency()` | `719 – 751` |
| `setCurrency()` | `752 – 773` |
| `setViewMode()` | `774 – 784` |
| `updateThemeIcon()` | `785 – 795` |
| `toggleTheme()` | `796 – 805` |
| `loadTheme()` | `806 – 877` |

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

### 5.3. `frontend/js/ui-tab1-streams.js` (2224 dòng — Tab 1B: Luồng Thu/Chi, Phân bổ tài sản & 4 Chiến lược)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `16 – 20` |
| `parseVal()` | `21 – 27` |
| `setVal()` | `28 – 32` |
| `escapeHtml()` | `33 – 54` |
| `getActivePlan()` | `55 – 62` |
| `savePlansToStorage()` | `63 – 72` |
| `debouncedSavePlansToStorage()` | `73 – 83` |
| `bindTab1StreamEvents()` | `84 – 680` |
| `updateAssetAllocationUI()` | `681 – 802` |
| `updateDualInflationUI()` | `803 – 877` |
| `updateRetirementLocationUI()` | `878 – 903` |
| `computeIncomePeriods()` | `904 – 1042` |
| `renderIncomePeriodsSummary()` | `1043 – 1192` |
| `renderIncomeStreamsList()` | `1193 – 1296` |
| `getActiveIncomeAtAge()` | `1297 – 1312` |
| `ensureDefaultExpenseStreams()` | `1313 – 1380` |
| `getActiveExpensesAtAge()` | `1381 – 1429` |
| `updateCashflowBalanceUI()` | `1430 – 1530` |
| `syncSavingsAndExpensesFromRate()` | `1531 – 1534` |
| `updateSavingsRateUI()` | `1535 – 1539` |
| `updateRetirementLocationRadiosUI()` | `1540 – 1649` |
| `updateExpenseSavingsHints()` | `1650 – 1654` |
| `renderExpensePeriodsSummary()` | `1655 – 1946` |
| `renderExpenseStreamsList()` | `1947 – 2061` |
| `updateWithdrawalStrategyCards()` | `2062 – 2073` |
| `hexToRgba()` | `2074 – 2192` |
| `renderWithdrawalComparison()` | `2193 – 2224` |

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

### 5.6. `frontend/js/ui-modals.js` (1471 dòng — Popup Modals & Thiết lập nhanh Wizard)
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
| `openModal()` | `1029 – 1034` |
| `closeModal()` | `1035 – 1038` |
| `saveNewPlanFromModal()` | `1039 – 1068` |
| `duplicateCurrentPlan()` | `1069 – 1083` |
| `deleteCurrentPlan()` | `1084 – 1110` |
| `handleJSONImport()` | `1111 – 1140` |
| `initQuickSetupWizard()` | `1141 – 1269` |
| `updateSpendCalcText()` | `1270 – 1285` |
| `openQuickSetupWizard()` | `1286 – 1342` |
| `closeQuickSetupWizard()` | `1343 – 1347` |
| `showWizardStep()` | `1348 – 1374` |
| `applyWizardAndCalculate()` | `1375 – 1471` |

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

## 7. `frontend/js/taxOptimizer.js` (333 dòng), `monteCarlo.js` (171 dòng) & `geminiAdvisor.js` (424 dòng)
### `taxOptimizer.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `calculateProgressiveTax()` | `37 – 82` |
| `calculateTaxDetailed()` | `83 – 221` |
| `calculateFrenchPension()` | `222 – 262` |
| `simulateWithdrawalWaterfall()` | `263 – 333` |

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
