# Bản Đồ Định Vị Mã Nguồn Tự Động (Codebase Map & Line-Range Index)

> **CẬP NHẬT TỰ ĐỘNG 100% BỞI `./verify_js.sh` (TỐN 0 TOKEN & 0 CÔNG SỨC):**  
> Bạn **KHÔNG BAO GIỜ** phải sửa file này bằng tay. Mỗi khi chạy `./verify_js.sh`, script sẽ tự động quét lại toàn bộ các hàm, thẻ HTML, phân mục CSS và từ điển đa ngôn ngữ để cập nhật số dòng chính xác trong 0.05 giây.  
> **Quy tắc bắt buộc cho AI:** Trước khi đọc hoặc sửa các file UI (`ui.js`, `ui-tab1-charts.js`, `ui-tab1-streams.js`, `ui-tab2-health.js`, `ui-tab3-taxes.js`, `ui-modals.js`), `index.html`, `styles.css`, `i18n.js`, `engine.js`, `patrimoine.js`, **bắt buộc tra bảng số dòng dưới đây** để gọi `view_file` đúng khoảng `StartLine` – `EndLine`.

---

## 1. `frontend/index.html` (5345 dòng)
| Khu vực / Thẻ ID | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `<header>` (Thanh điều hướng trên cùng) | `36 – 257` |
| `#tab-projections` | `258 – 372` |
| Cột 1: Các Luồng Thu nhập (`col1_income_header`) | `373 – 383` |
| `#card-asset-allocation-stream` | `384 – 468` |
| `#card-lmnp-income-stream` | `469 – 547` |
| `#card-french-pension-stream` | `548 – 673` |
| `#card-bhxh-income-stream` | `674 – 812` |
| `#card-german-pension-stream` | `813 – 935` |
| `#card-us-pension-stream` | `936 – 1071` |
| `#card-withdrawal-strategy-controls` | `1072 – 1127` |
| `#card-strat-bengen_4pct` | `1128 – 1148` |
| `#card-strat-guyton_klinger` | `1149 – 1176` |
| `#card-strat-vpw` | `1177 – 1202` |
| `#card-strat-fixed_pct` | `1203 – 1296` |
| Cột 2: Các Luồng Chi tiêu (`col2_expense_header`) | `1297 – 1306` |
| `#card-retire-expense-stream` | `1307 – 1499` |
| `#card-dual-inflation-stream` | `1500 – 1600` |
| `#card-children-family-stream` | `1601 – 1719` |
| `#card-senior-care-stream` | `1720 – 1788` |
| `#card-estate-legacy-combined` | `1789 – 1877` |
| `#section-gemini-projections` | `1878 – 1955` |
| `#chart-networth` | `1956 – 1981` |
| `#chart-cashflow` | `1982 – 1989` |
| `#tab-taxes` | `1990 – 2023` |
| `#card-french-accounts` | `2024 – 2117` |
| `#card-global-accounts-guide` | `2118 – 2134` |
| `#card-pea-masterclass` | `2135 – 2306` |
| `#card-assurance-vie-masterclass` | `2307 – 2481` |
| `#card-livret-masterclass` | `2482 – 2658` |
| `#card-estate-inheritance-masterclass` | `2659 – 2755` |
| `#tab-estate` | `2756 – 2792` |
| `#card-healthspan-score` | `2793 – 2820` |
| `#card-couple-primary-col` | `2821 – 2842` |
| `#card-couple-spouse-col` | `2843 – 3245` |
| `#card-longevity-nutrition` | `3246 – 3471` |
| `#card-health-roadmap` | `3472 – 3603` |
| `#card-franco-viet-guide` | `3604 – 3699` |
| `#card-elderly-care-comparison` | `3700 – 3765` |
| `#plan-modal` | `3766 – 4041` |
| `#income-modal` | `4042 – 4096` |
| `#expense-modal` | `4097 – 4191` |
| `#actual-networth-modal` | `4192 – 4272` |
| `#milestone-modal` | `4273 – 4380` |
| `#modal-gemini-settings` | `4381 – 4434` |
| `#apartment-modal` | `4435 – 4688` |
| `#auth-modal` | `4689 – 4772` |
| `#modal-formula-guide` | `4773 – 5007` |
| `#quick-setup-modal` | `5008 – 5223` |
| `#confirm-modal` | `5224 – 5242` |
| `#feature-intro-modal` | `5243 – 5345` |

---

## 2. `frontend/css/styles.css` (9498 dòng)
| Phân mục CSS (`/* === ... === */`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| pyRetrait — Premium Design System & Theme Stylesheet | `1 – 78` |
| Base & Reset | `79 – 106` |
| Iconify Unified Icon System | `107 – 157` |
| Top Navigation Bar | `158 – 593` |
| Buttons & Interactive Elements | `594 – 710` |
| App Layout & Sidebar | `711 – 895` |
| Main Content Area & Dashboard KPIs | `896 – 994` |
| Cards & Layout Panels | `995 – 1145` |
| Form Controls & Inputs | `1146 – 1294` |
| Expandable Panels for Advanced Modules | `1295 – 1577` |
| Income & Expense Streams Side-by-Side Layout | `1578 – 1751` |
| Expense Streams & Crédits | `1752 – 2821` |
| Withdrawal Strategy Cards | `2822 – 2987` |
| Monte Carlo Stats Integrated in Chart Card | `2988 – 3092` |
| What-If Scenarios List | `3093 – 3142` |
| Spending Phases Card & Estate | `3143 – 3167` |
| AI Advisor Panel | `3168 – 3316` |
| Data Table | `3317 – 3358` |
| Dropdown Menus & Modals | `3359 – 3621` |
| Life Milestones Visuals & Markers | `3622 – 3848` |
| French Accounts Tracking & Withdrawal Waterfall Styles | `3849 – 3994` |
| Gemini AI Insights & Chart Commentary Component | `3995 – 4573` |
| Responsive Breakpoints & Layout Adaptations | `4574 – 4663` |
| Print / Export Report Stylesheet | `4664 – 4697` |
| pyLocation / Patrimoine Custom Component Styles | `4698 – 4715` |
| Inline Financial & Mathematical Formulas (Direct Verification) | `4716 – 4840` |
| PEA Masterclass & Strategic Tips (Native pyRetrait Design System) | `4841 – 5075` |
| Family & Children Planning: Side-by-Side (Inputs Left, Formulas Right) | `5076 – 5163` |
| Estate Planning & Legacy Milestone: Unified Composite Card | `5164 – 5236` |
| Retirement Spending Smile: Side-by-Side (Inputs Left, Budget & Science Right) | `5237 – 5379` |
| Dual-Theme (Light & Dark) UI Optimization & Period Timeline Cards | `5380 – 5896` |
| Cross-Tab Unified Light/Dark Mode Components & Accents | `5897 – 6381` |
| Franco-Viet Guide Components (Health, Pension, Cross-border Benefits) | `6382 – 6560` |
| Onboarding Wizard (Thiết Lập Nhanh 4 Bước) | `6561 – 6949` |
| Feature Discovery / Capabilities Intro Modal | `6950 – 7229` |
| Special Expense Item: Kế Hoạch Thừa Kế & Đánh Giá Mục Tiêu Di Sản | `7230 – 7291` |
| Tab Hero Banners (Universal Philosophy & Core Questions/Answers) | `7292 – 7654` |
| Advanced Healthspan Features (1, 3, 4, 5) | `7655 – 8092` |
| Longevity Nutrition Matrix (3-Column Layout: Sáng, Trưa, Tối) | `8093 – 8110` |
| Longevity Nutrition Matrix Styling | `8111 – 8128` |
| Cellular Hydration & Electrolytes Protocol (70% Body Weight) | `8129 – 8583` |
| Health 3-Tier Layout Architecture | `8584 – 8613` |
| Tab Quản Lý Rủi Ro: Bố Cục 2 Tầng Dọc Liền Mạch (Sequential 2-Tier Dashboard) | `8614 – 8678` |
| Lưới An Toàn 3 Biến Cố & FIRE Bền Bỉ (Triple-Shock Safety Net & Bulletproof FIRE) | `8679 – 8993` |
| .profile-summary-bar { | `8994 – 9460` |
| DÒNG GHI CHÚ: VÌ SAO TIỀN MẶT & QUỸ ĐẦU TƯ QUAN TRỌNG HƠN TỔNG TÀI SẢN | `9461 – 9498` |

---

## 3. `frontend/js/i18n.js` (946 dòng) & `state.js` (484 dòng — Tầng 2 State)
### `i18n.js`
| Từ điển / Hàm | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| Từ điển `vi` | `21 – 266` |
| Từ điển `en` | `267 – 512` |
| Từ điển `fr` | `513 – 760` |
| `getSavedLanguage()` | `761 – 772` |
| `t()` | `773 – 784` |
| `applyLanguage()` | `785 – 835` |
| `setLanguage()` | `836 – 839` |
| `renderLanguageDropdown()` | `840 – 877` |
| `toggleDropdown()` | `878 – 893` |
| `closeDropdown()` | `894 – 902` |
| `init()` | `903 – 946` |

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

## 4. `frontend/js/engine.js` (1522 dòng — Tầng 1 Core Engine)
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
| `findOptimalRetirementAge()` | `475 – 590` |
| `runProjection()` | `591 – 1522` |

---

## 5. Tầng 3 UI — Nhạc Trưởng & 3 Tab Độc Lập + Modals
### 5.1. `frontend/js/ui.js` (906 dòng — Nhạc trưởng điều phối trung tâm)
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
| `renderActivePlanInputs()` | `354 – 553` |
| `updateAll()` | `554 – 742` |
| `convertPlanCurrency()` | `743 – 775` |
| `setCurrency()` | `776 – 797` |
| `setViewMode()` | `798 – 809` |
| `updateThemeIcon()` | `810 – 820` |
| `toggleTheme()` | `821 – 831` |
| `loadTheme()` | `832 – 906` |

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

### 5.3. `frontend/js/ui-tab1-streams.js` (2808 dòng — Tab 1B: Luồng Thu/Chi, Phân bổ tài sản & 4 Chiến lược)
| Tên hàm (`function`) | Khoảng dòng (`StartLine` – `EndLine`) |
| :--- | :--- |
| `getVal()` | `16 – 20` |
| `parseVal()` | `21 – 27` |
| `setVal()` | `28 – 32` |
| `escapeHtml()` | `33 – 54` |
| `getActivePlan()` | `55 – 62` |
| `savePlansToStorage()` | `63 – 72` |
| `debouncedSavePlansToStorage()` | `73 – 83` |
| `bindTab1StreamEvents()` | `84 – 749` |
| `ensureAssetAllocationCardPosition()` | `750 – 760` |
| `ensureDualInflationCardPosition()` | `761 – 768` |
| `updateAssetAllocationUI()` | `769 – 883` |
| `updateDualInflationUI()` | `884 – 991` |
| `updateRetirementLocationUI()` | `992 – 1017` |
| `computeIncomePeriods()` | `1018 – 1156` |
| `renderIncomePeriodsSummary()` | `1157 – 1306` |
| `renderIncomeStreamsList()` | `1307 – 1448` |
| `getActiveIncomeAtAge()` | `1449 – 1464` |
| `ensureDefaultExpenseStreams()` | `1465 – 1532` |
| `getActiveExpensesAtAge()` | `1533 – 1581` |
| `updateCashflowBalanceUI()` | `1582 – 1682` |
| `syncSavingsAndExpensesFromRate()` | `1683 – 1686` |
| `updateSavingsRateUI()` | `1687 – 1691` |
| `applyProfileVisibilityRules()` | `1692 – 2065` |
| `updateRetirementLocationRadiosUI()` | `2066 – 2231` |
| `updateExpenseSavingsHints()` | `2232 – 2236` |
| `renderExpensePeriodsSummary()` | `2237 – 2528` |
| `renderExpenseStreamsList()` | `2529 – 2643` |
| `updateWithdrawalStrategyCards()` | `2644 – 2655` |
| `hexToRgba()` | `2656 – 2774` |
| `renderWithdrawalComparison()` | `2775 – 2808` |

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
