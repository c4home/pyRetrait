# Bản Đồ Định Vị Mã Nguồn Tự Động (Codebase Map & Line-Range Index)

> **CẬP NHẬT TỰ ĐỘNG 100% BỞI `./verify_js.sh` (TỐN 0 TOKEN & 0 CÔNG SỨC):**  
> Bạn **KHÔNG BAO GIỜ** phải sửa file này bằng tay. Mỗi khi chạy `./verify_js.sh`, script sẽ tự động quét lại toàn bộ các hàm, thẻ HTML, phân mục CSS và từ điển đa ngôn ngữ để cập nhật số dòng chính xác trong 0.05 giây.  
> **Quy tắc bắt buộc cho AI:** Trước khi đọc hoặc sửa các file UI (`ui.js`, `ui-tab1-charts.js`, `ui-tab1-streams.js`, `ui-tab2-health.js`, `ui-tab3-taxes.js`, `ui-modals.js`), `index.html`, `styles.css`, `i18n.js`, `engine.js`, `patrimoine.js`, **bắt buộc tra bảng số dòng dưới đây** để gọi `view_file` đúng khoảng `StartLine` – `EndLine`.

---

## 1. `frontend/index.html` (4924 dòng)
| Khu vực / Thẻ ID | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `<header>` (Thanh điều hướng trên cùng) | `32 – 254` |
| `#tab-projections` | `255 – 398` |
| Cột 1: Các Luồng Thu nhập (`col1_income_header`) | `399 – 409` |
| `#card-asset-allocation-stream` | `410 – 495` |
| `#card-lmnp-income-stream` | `496 – 574` |
| `#card-french-pension-stream` | `575 – 700` |
| `#card-bhxh-income-stream` | `701 – 831` |
| `#card-withdrawal-strategy-controls` | `832 – 887` |
| `#card-strat-bengen_4pct` | `888 – 908` |
| `#card-strat-guyton_klinger` | `909 – 936` |
| `#card-strat-vpw` | `937 – 962` |
| `#card-strat-fixed_pct` | `963 – 1056` |
| Cột 2: Các Luồng Chi tiêu (`col2_expense_header`) | `1057 – 1066` |
| `#card-retire-expense-stream` | `1067 – 1259` |
| `#card-children-family-stream` | `1260 – 1378` |
| `#card-senior-care-stream` | `1379 – 1447` |
| `#card-estate-legacy-combined` | `1448 – 1497` |
| `#card-dual-inflation-stream` | `1498 – 1620` |
| `#section-gemini-projections` | `1621 – 1698` |
| `#chart-networth` | `1699 – 1724` |
| `#chart-cashflow` | `1725 – 1732` |
| `#tab-taxes` | `1733 – 1766` |
| `#card-french-accounts` | `1767 – 1860` |
| `#card-pea-masterclass` | `1861 – 2032` |
| `#card-assurance-vie-masterclass` | `2033 – 2207` |
| `#card-livret-masterclass` | `2208 – 2384` |
| `#card-estate-inheritance-masterclass` | `2385 – 2481` |
| `#tab-estate` | `2482 – 2518` |
| `#card-healthspan-score` | `2519 – 2893` |
| `#card-longevity-nutrition` | `2894 – 3119` |
| `#card-health-roadmap` | `3120 – 3251` |
| `#card-franco-viet-guide` | `3252 – 3347` |
| `#card-elderly-care-comparison` | `3348 – 3413` |
| `#plan-modal` | `3414 – 3623` |
| `#income-modal` | `3624 – 3678` |
| `#expense-modal` | `3679 – 3773` |
| `#actual-networth-modal` | `3774 – 3854` |
| `#milestone-modal` | `3855 – 3962` |
| `#modal-gemini-settings` | `3963 – 4016` |
| `#apartment-modal` | `4017 – 4267` |
| `#auth-modal` | `4268 – 4351` |
| `#modal-formula-guide` | `4352 – 4586` |
| `#quick-setup-modal` | `4587 – 4802` |
| `#confirm-modal` | `4803 – 4821` |
| `#feature-intro-modal` | `4822 – 4924` |

---

## 2. `frontend/css/styles.css` (9382 dòng)
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
| PEA Masterclass & Strategic Tips (Native pyRetrait Design System) | `4737 – 4971` |
| Family & Children Planning: Side-by-Side (Inputs Left, Formulas Right) | `4972 – 5059` |
| Estate Planning & Legacy Milestone: Unified Composite Card | `5060 – 5132` |
| Retirement Spending Smile: Side-by-Side (Inputs Left, Budget & Science Right) | `5133 – 5275` |
| Dual-Theme (Light & Dark) UI Optimization & Period Timeline Cards | `5276 – 5792` |
| Cross-Tab Unified Light/Dark Mode Components & Accents | `5793 – 6277` |
| Franco-Viet Guide Components (Health, Pension, Cross-border Benefits) | `6278 – 6456` |
| Onboarding Wizard (Thiết Lập Nhanh 4 Bước) | `6457 – 6845` |
| Feature Discovery / Capabilities Intro Modal | `6846 – 7125` |
| Special Expense Item: Kế Hoạch Thừa Kế & Đánh Giá Mục Tiêu Di Sản | `7126 – 7187` |
| Tab Hero Banners (Universal Philosophy & Core Questions/Answers) | `7188 – 7550` |
| Advanced Healthspan Features (1, 3, 4, 5) | `7551 – 7988` |
| Longevity Nutrition Matrix (3-Column Layout: Sáng, Trưa, Tối) | `7989 – 8006` |
| Longevity Nutrition Matrix Styling | `8007 – 8024` |
| Cellular Hydration & Electrolytes Protocol (70% Body Weight) | `8025 – 8479` |
| Health 3-Tier Layout Architecture | `8480 – 8509` |
| Tab Quản Lý Rủi Ro: Bố Cục 2 Tầng Dọc Liền Mạch (Sequential 2-Tier Dashboard) | `8510 – 8574` |
| Lưới An Toàn 3 Biến Cố & FIRE Bền Bỉ (Triple-Shock Safety Net & Bulletproof FIRE) | `8575 – 8889` |
| .profile-summary-bar { | `8890 – 9344` |
| DÒNG GHI CHÚ: VÌ SAO TIỀN MẶT & QUỸ ĐẦU TƯ QUAN TRỌNG HƠN TỔNG TÀI SẢN | `9345 – 9382` |

---

## 3. `frontend/js/i18n.js` (874 dòng) & `state.js` (445 dòng — Tầng 2 State)
### `i18n.js`
| Từ điển / Hàm | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| Từ điển `vi` | `21 – 242` |
| Từ điển `en` | `243 – 464` |
| Từ điển `fr` | `465 – 688` |
| `getSavedLanguage()` | `689 – 700` |
| `t()` | `701 – 712` |
| `applyLanguage()` | `713 – 763` |
| `setLanguage()` | `764 – 767` |
| `renderLanguageDropdown()` | `768 – 805` |
| `toggleDropdown()` | `806 – 821` |
| `closeDropdown()` | `822 – 830` |
| `init()` | `831 – 874` |

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
| `ensurePlanDefaults()` | `99 – 128` |
| `syncSalaryStreamsWithMaritalStatus()` | `129 – 226` |
| `applySavedUserPreferences()` | `227 – 259` |
| `savePlansToStorage()` | `260 – 303` |
| `debouncedSavePlansToStorage()` | `304 – 307` |
| `loadInitialPlans()` | `308 – 445` |

---

## 4. `frontend/js/engine.js` (1403 dòng — Tầng 1 Core Engine)
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
| `runProjection()` | `562 – 1403` |

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

### 5.3. `frontend/js/ui-tab1-streams.js` (2573 dòng — Tab 1B: Luồng Thu/Chi, Phân bổ tài sản & 4 Chiến lược)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `16 – 20` |
| `parseVal()` | `21 – 27` |
| `setVal()` | `28 – 32` |
| `escapeHtml()` | `33 – 54` |
| `getActivePlan()` | `55 – 62` |
| `savePlansToStorage()` | `63 – 72` |
| `debouncedSavePlansToStorage()` | `73 – 83` |
| `bindTab1StreamEvents()` | `84 – 728` |
| `ensureAssetAllocationCardPosition()` | `729 – 736` |
| `updateAssetAllocationUI()` | `737 – 861` |
| `updateDualInflationUI()` | `862 – 936` |
| `updateRetirementLocationUI()` | `937 – 962` |
| `computeIncomePeriods()` | `963 – 1101` |
| `renderIncomePeriodsSummary()` | `1102 – 1251` |
| `renderIncomeStreamsList()` | `1252 – 1393` |
| `getActiveIncomeAtAge()` | `1394 – 1409` |
| `ensureDefaultExpenseStreams()` | `1410 – 1477` |
| `getActiveExpensesAtAge()` | `1478 – 1526` |
| `updateCashflowBalanceUI()` | `1527 – 1627` |
| `syncSavingsAndExpensesFromRate()` | `1628 – 1631` |
| `updateSavingsRateUI()` | `1632 – 1636` |
| `applyProfileVisibilityRules()` | `1637 – 1883` |
| `updateRetirementLocationRadiosUI()` | `1884 – 1996` |
| `updateExpenseSavingsHints()` | `1997 – 2001` |
| `renderExpensePeriodsSummary()` | `2002 – 2293` |
| `renderExpenseStreamsList()` | `2294 – 2408` |
| `updateWithdrawalStrategyCards()` | `2409 – 2420` |
| `hexToRgba()` | `2421 – 2539` |
| `renderWithdrawalComparison()` | `2540 – 2573` |

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

### 5.5. `frontend/js/ui-tab3-taxes.js` (1539 dòng — Tab 3: Tối ưu Thuế, Lương hưu Pháp/VN & LMNP)
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
| `updateTaxRegimeUI()` | `439 – 465` |
| `estimateFrenchFullPension()` | `466 – 488` |
| `getPrimarySalaryIncome()` | `489 – 503` |
| `syncPensionBaseAuto()` | `504 – 527` |
| `updatePensionDecoteUI()` | `528 – 631` |
| `updateBhxhVnUI()` | `632 – 757` |
| `syncBhxhVnStreams()` | `758 – 828` |
| `eurToPlanFactor()` | `829 – 836` |
| `extractPatrimoineLoansEur()` | `837 – 867` |
| `buildPatrimoineLoans()` | `868 – 888` |
| `applyPatrimoineToPlan()` | `889 – 988` |
| `fetchPatrimoineData()` | `989 – 1004` |
| `syncFromPatrimoine()` | `1005 – 1017` |
| `updateLmnpUI()` | `1018 – 1194` |
| `renderPatrimoineLoansList()` | `1195 – 1217` |
| `updateMortgageUI()` | `1218 – 1303` |
| `syncMortgageToExpenseStreams()` | `1304 – 1393` |
| `renderTaxTab()` | `1394 – 1539` |

### 5.6. `frontend/js/ui-modals.js` (1701 dòng — Popup Modals & Thiết lập nhanh Wizard)
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
| `saveIncomeFromModal()` | `601 – 667` |
| `openMilestoneModal()` | `668 – 679` |
| `closeMilestoneModal()` | `680 – 685` |
| `renderModalMilestonesContent()` | `686 – 769` |
| `showMilestoneForm()` | `770 – 801` |
| `hideMilestoneForm()` | `802 – 806` |
| `saveMilestoneFromForm()` | `807 – 845` |
| `openActualNetWorthModal()` | `846 – 867` |
| `closeActualNetWorthModal()` | `868 – 872` |
| `renderActualRecordsTable()` | `873 – 925` |
| `addActualRecordFromForm()` | `926 – 979` |
| `deleteActualRecord()` | `980 – 991` |
| `fetchPatrimoineBalanceForActual()` | `992 – 1035` |
| `renderPlanSelector()` | `1036 – 1042` |
| `openModal()` | `1043 – 1116` |
| `closeModal()` | `1117 – 1121` |
| `saveNewPlanFromModal()` | `1122 – 1298` |
| `duplicateCurrentPlan()` | `1299 – 1313` |
| `deleteCurrentPlan()` | `1314 – 1340` |
| `handleJSONImport()` | `1341 – 1370` |
| `initQuickSetupWizard()` | `1371 – 1499` |
| `updateSpendCalcText()` | `1500 – 1515` |
| `openQuickSetupWizard()` | `1516 – 1572` |
| `closeQuickSetupWizard()` | `1573 – 1577` |
| `showWizardStep()` | `1578 – 1604` |
| `applyWizardAndCalculate()` | `1605 – 1701` |

---

## 6. `frontend/js/patrimoine.js` (1622 dòng)
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
| `renderBreakEvenSingleApt()` | `635 – 907` |
| `renderBreakEvenComparisonAll()` | `908 – 1056` |
| `renderGeminiAIBox()` | `1057 – 1080` |
| `autoSyncToFire()` | `1081 – 1094` |
| `showAutoSyncToast()` | `1095 – 1135` |
| `openApartmentModal()` | `1136 – 1230` |
| `updatePropertyFormulaUI()` | `1231 – 1254` |
| `closeApartmentModal()` | `1255 – 1259` |
| `saveApartment()` | `1260 – 1346` |
| `deleteApartment()` | `1347 – 1374` |
| `saveTuroSettings()` | `1375 – 1433` |
| `setVal()` | `1434 – 1438` |
| `getVal()` | `1439 – 1443` |
| `updateAptLiveSummary()` | `1444 – 1514` |
| `bindEvents()` | `1515 – 1622` |

---

## 7. `frontend/js/taxOptimizer.js` (805 dòng), `monteCarlo.js` (265 dòng) & `geminiAdvisor.js` (424 dòng)
### `taxOptimizer.js`
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `calculateProgressiveTax()` | `108 – 210` |
| `computeFrenchTaxParts()` | `211 – 249` |
| `calculateTaxDetailed()` | `250 – 430` |
| `calculateRetireBudgetFromCashflow()` | `431 – 529` |
| `getSuggestedRetirementBudget()` | `530 – 575` |
| `calculateFrenchPension()` | `576 – 651` |
| `calculateVietnamBhxhPension()` | `652 – 728` |
| `simulateWithdrawalWaterfall()` | `729 – 805` |

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
