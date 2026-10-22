/**
 * pyRetrait — Tầng 3: Nhạc Trưởng Điều Phối Giao Diện Trung Tâm (ui.js)
 * Khởi tạo ứng dụng, chuyển đổi giữa 3 Tab chính, đồng bộ Form - State,
 * chuyển đổi Tiền tệ (EUR/VND/USD), Chế độ hiển thị (Danh nghĩa/Thực tế) và Giao diện Sáng/Tối.
 */

(function() {
  'use strict';

  // Global App State (Đồng bộ với Tầng 2: AppState)
  let state = (window.AppState && window.AppState.state) || {
    plansData: {
      activePlanId: "plan_franco_viet",
      plans: {}
    },
    currency: "EUR", // Default to EUR
    viewMode: "nominal", // "nominal" or "real"
    cashflowViewMode: "real", // "real" or "nominal" (mặc định: sức mua hiện tại)
    compareStressScenarios: false,
    showMonteCarloFan: false,
    activeTab: "tab-projections",
    activeScenario: "baseline",
    charts: {}
  };

  // Local Storage Key
  const STORAGE_KEY = (window.AppState && window.AppState.STORAGE_KEY) || "pyRetrait_plans_v2";

  // Safe DOM input value getter & setter helpers
  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  function parseVal(id, fallback = 0) {
    const el = document.getElementById(id);
    if (!el) return fallback;
    const v = parseFloat(el.value);
    return isNaN(v) ? fallback : v;
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined && val !== null) el.value = val;
  }

  function showConfirmDialog(opts) {
    if (window.ModalsUI && typeof window.ModalsUI.showConfirmDialog === 'function') {
      return window.ModalsUI.showConfirmDialog(opts);
    }
    if (window.confirm(((opts && opts.message) || "").replace(/<[^>]*>?/gm, ''))) {
      if (opts && opts.onConfirm) opts.onConfirm();
    }
  }

  function closeConfirmDialog() {
    if (window.ModalsUI && typeof window.ModalsUI.closeConfirmDialog === 'function') {
      return window.ModalsUI.closeConfirmDialog();
    }
  }

  // Shared x-axis ticks for age/year axes: horizontal two-line labels ("35t" / "2032")
  // take far less room than 45° rotated ones, so many more ages fit on the axis.
  const ageAxisTicks = () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    return {
      color: isLight ? '#475569' : '#94a3b8',
      font: { size: 9, family: 'Inter, sans-serif' },
      maxRotation: 0,
      minRotation: 0,
      autoSkip: true,
      autoSkipPadding: 4
    };
  };

  // Document Ready
  document.addEventListener("DOMContentLoaded", () => {
    initApp();
  });

  async function initApp() {
    try { loadTheme(); } catch (e) { console.warn(e); }
    try { arrangeAiAndControlsColumns(); } catch (e) { console.warn(e); }
    try { await loadInitialPlans(); } catch (e) { console.warn(e); }
    try { await syncFromPatrimoine({ rerender: false }); } catch (e) { console.warn(e); }
    try { bindEvents(); } catch (e) { console.warn(e); }
    try { renderPlanSelector(); } catch (e) { console.warn(e); }
    try { renderActivePlanInputs(); } catch (e) { console.warn(e); }
    try { updateAll(); } catch (e) { console.error("updateAll failed:", e); }

    // Support deep-linking via URL hash (e.g., #patrimoine, #tab-patrimoine)
    if (window.location.hash) {
      try {
        const clean = window.location.hash.replace("#", "");
        const tabId = clean.startsWith("tab-") ? clean : `tab-${clean}`;
        const pane = document.getElementById(tabId);
        if (pane) {
          switchTab(tabId);
        }
      } catch (e) { console.warn(e); }
    }
  }

  // Layout per tab: Charts & schedule table on top, then Gemini AI commentary boxes
  // grouped in a horizontal row right after the schedule table, leaving the parameter
  // controls card full width below for spacious and unconstrained stream columns.
  function arrangeAiAndControlsColumns() {
    document.querySelectorAll(".panel-layout").forEach(layout => {
      const vis = layout.querySelector(":scope > .panel-visualization");
      if (!vis) return;
      const boxes = vis.querySelectorAll(".gemini-insight-box");
      if (!boxes.length) return;

      let row = vis.querySelector(".gemini-insights-horizontal");
      if (!row) {
        row = document.createElement("div");
        row.className = "gemini-insights-horizontal";
        vis.appendChild(row);
      }
      boxes.forEach(box => {
        if (box.parentElement !== row) {
          row.appendChild(box);
        }
      });
    });
  }

  // -------------------------------------------------------------
  // Data Loading & Persistence
  // -------------------------------------------------------------
  async function loadInitialPlans() {
    if (window.AppState && typeof window.AppState.loadInitialPlans === 'function') {
      await window.AppState.loadInitialPlans();
      state = window.AppState.state;
      return state.plansData;
    }
  }

  function savePlansToStorage(immediateCloud = true) {
    if (window.AppState && typeof window.AppState.savePlansToStorage === 'function') {
      return window.AppState.savePlansToStorage(immediateCloud);
    }
    if (state.plansData) {
      state.plansData.updatedAt = Date.now();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plansData));
  }

  function debouncedSavePlansToStorage() {
    if (window.AppState && typeof window.AppState.debouncedSavePlansToStorage === 'function') {
      return window.AppState.debouncedSavePlansToStorage();
    }
    savePlansToStorage(false);
  }

  function getActivePlan() {
    if (window.AppState && typeof window.AppState.getActivePlan === 'function') {
      return window.AppState.getActivePlan();
    }
    const plan = state.plansData.plans[state.plansData.activePlanId];
    return plan || Object.values(state.plansData.plans)[0];
  }


  // -------------------------------------------------------------
  // Event Binding (Điều phối sự kiện chung & kích hoạt sự kiện 3 Tab + Modals)
  // -------------------------------------------------------------
  function bindEvents() {
    // Navigation Tabs
    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const tabId = btn.getAttribute("data-tab");
        switchTab(tabId);
      });
    });

    // Plan Selector
    const planSelect = document.getElementById("plan-selector");
    planSelect.addEventListener("change", (e) => {
      state.plansData.activePlanId = e.target.value;
      savePlansToStorage();
      renderActivePlanInputs();
      updateAll();
    });

    // New Plan Button
    document.getElementById("btn-new-plan").addEventListener("click", () => {
      openModal("Tạo Kế hoạch Hưu trí Mới");
    });

    // Duplicate Plan Button
    document.getElementById("btn-duplicate-plan").addEventListener("click", () => {
      duplicateCurrentPlan();
    });

    // Delete Plan Button
    document.getElementById("btn-delete-plan").addEventListener("click", () => {
      deleteCurrentPlan();
    });

    // Currency Switcher
    document.getElementById("cur-eur")?.addEventListener("click", () => setCurrency("EUR"));
    document.getElementById("cur-vnd")?.addEventListener("click", () => setCurrency("VND"));
    document.getElementById("cur-usd")?.addEventListener("click", () => setCurrency("USD"));

    // Theme Toggle
    document.getElementById("theme-toggle-btn").addEventListener("click", toggleTheme);

    // Export Dropdown
    const exportBtn = document.getElementById("btn-export-menu");
    const exportDropdown = document.getElementById("export-dropdown");
    if (exportBtn && exportDropdown) {
      exportBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        exportDropdown.classList.toggle("show");
      });
      document.addEventListener("click", () => exportDropdown.classList.remove("show"));
    }

    const exportCsvBtn = document.getElementById("export-csv-btn");
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const plan = getActivePlan();
        const proj = window.RetirementEngine.runProjection(plan);
        window.ReportExporter.exportScheduleToCSV(plan, proj);
      });
    }

    const exportPdfBtn = document.getElementById("export-pdf-btn");
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.ReportExporter.printExecutiveSummary();
      });
    }

    const exportJsonBtn = document.getElementById("export-json-btn");
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.ReportExporter.exportPlansToJSON(state.plansData);
      });
    }

    const importJsonBtn = document.getElementById("import-json-btn");
    const jsonFileInput = document.getElementById("json-file-input");
    if (importJsonBtn && jsonFileInput) {
      importJsonBtn.addEventListener("click", (e) => {
        e.preventDefault();
        jsonFileInput.click();
      });
      jsonFileInput.addEventListener("change", handleJSONImport);
    }

    // Nominal vs Real View Toggle
    document.getElementById("btn-view-nominal").addEventListener("click", () => setViewMode("nominal"));
    document.getElementById("btn-view-real").addEventListener("click", () => setViewMode("real"));

    // Cashflow View Mode Toggle (Sức mua hiện tại vs Giá trị tương lai)
    const btnCfReal = document.getElementById("btn-cashflow-real");
    const btnCfNominal = document.getElementById("btn-cashflow-nominal");
    if (btnCfReal) btnCfReal.addEventListener("click", () => setCashflowViewMode("real"));
    if (btnCfNominal) btnCfNominal.addEventListener("click", () => setCashflowViewMode("nominal"));


    // Refresh and Generate buttons click delegation (On-Demand only)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-gemini-refresh, .btn-gemini-trigger");
      if (btn) {
        const chartId = btn.getAttribute("data-chart");
        if (chartId && window.GeminiAdvisor) {
          window.GeminiAdvisor.updateChartBox(chartId, chartId, {}, true);
        }
      }
    });

    // Khởi tạo sự kiện của 3 Tab (Tab 1A Charts, Tab 1B Streams, Tab 2 Health, Tab 3 Taxes) và hệ thống Modal
    if (window.ModalsUI && typeof window.ModalsUI.bindEvents === 'function') {
      window.ModalsUI.bindEvents();
    }
    if (window.Tab1ChartsUI && typeof window.Tab1ChartsUI.bindEvents === 'function') {
      window.Tab1ChartsUI.bindEvents();
    }
    if (window.Tab1StreamsUI && typeof window.Tab1StreamsUI.bindEvents === 'function') {
      window.Tab1StreamsUI.bindEvents();
    }
    if (window.Tab2HealthUI && typeof window.Tab2HealthUI.bindEvents === 'function') {
      window.Tab2HealthUI.bindEvents();
    }
    if (window.Tab3TaxesUI && typeof window.Tab3TaxesUI.bindEvents === 'function') {
      window.Tab3TaxesUI.bindEvents();
    }
  }

  function syncSalaryStreamsWithRetireAge(plan) {
    if (!plan || !Array.isArray(plan.incomes)) return;
    const rAge = Number(plan.retirementAge) || 42;
    const curAge = Number(plan.currentAge) || 29;
    plan.incomes.forEach(stream => {
      if (!stream) return;
      const name = stream.name || "";
      const isSalary = stream.isSalary || stream.isPrimarySalary || stream.isSpouseSalary || (/lương|salary|impôt|impot/i).test(name);
      if (isSalary) {
        stream.endAge = rAge;
        if (stream.isPrimarySalary && curAge) {
          stream.startAge = curAge;
        }
      }
    });
    if (typeof renderIncomeStreamsList === 'function') {
      try { renderIncomeStreamsList(); } catch (e) {}
    }
  }

  function bindInput(id, fieldPath, typeConverter) {
    const el = document.getElementById(id);
    if (!el) return;
    ['input', 'change'].forEach(evt => {
      el.addEventListener(evt, (e) => {
        const val = typeConverter(e.target.value);
        const plan = getActivePlan();
        
        if (fieldPath.includes('.')) {
          const parts = fieldPath.split('.');
          if (!plan[parts[0]]) plan[parts[0]] = {};
          plan[parts[0]][parts[1]] = val;
        } else {
          plan[fieldPath] = val;
        }

        if (fieldPath === "retirementAge") {
          syncSalaryStreamsWithRetireAge(plan);
          if (typeof renderIncomeStreamsList === 'function') {
            try { renderIncomeStreamsList(); } catch (e) {}
          }
        }
        
        savePlansToStorage();
        updateAll();
      });
    });
  }

  // -------------------------------------------------------------
  // Tab Switching
  // -------------------------------------------------------------
  function switchTab(tabId) {
    state.activeTab = tabId;
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item.getAttribute("data-tab") === tabId);
    });
    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === tabId);
    });

    // Schedule render after browser reflow to ensure canvas has valid dimensions
    setTimeout(() => {
      renderActiveTab(tabId);
    }, 40);
  }

  function renderActiveTab(tabId) {
    if (tabId === "tab-taxes") renderTaxTab();
    else if (tabId === "tab-scenarios") renderScenarioTab();
    else if (tabId === "tab-estate") renderEstateTab();
  }

  // -------------------------------------------------------------
  // Render Inputs to Match Active Plan
  // -------------------------------------------------------------
  function renderActivePlanInputs() {
    const p = getActivePlan();
    if (!p) return;

    const curYear = new Date().getFullYear();
    const bYear = Number(p.birthYear) || (curYear - (Number(p.currentAge) || 29));
    p.birthYear = bYear;
    p.currentAge = curYear - bYear;
    setVal("inp-birth-year", bYear);
    setVal("inp-current-age", p.currentAge);
    const lblCurrentAge = document.getElementById("lbl-current-age");
    if (lblCurrentAge) {
      const g = p.gender || 'male';
      lblCurrentAge.innerText = (window.Tab1StreamsUI && window.Tab1StreamsUI.formatGenderAgeText)
        ? window.Tab1StreamsUI.formatGenderAgeText(g, p.currentAge)
        : `${g === 'female' ? 'Nữ' : 'Nam'} (${p.currentAge} tuổi)`;
    }

    const isMarried = (p.maritalStatus === 'married');
    const boxSpouseBirth = document.getElementById("box-spouse-birth-year");
    if (boxSpouseBirth) {
      boxSpouseBirth.style.display = isMarried ? "" : "none";
    }
    if (isMarried) {
      const spouseBYear = Number(p.spouseBirthYear) || (curYear - (Number(p.spouseAge) || 29));
      p.spouseBirthYear = spouseBYear;
      p.spouseAge = curYear - spouseBYear;
      setVal("inp-spouse-birth-year", spouseBYear);
      setVal("inp-spouse-current-age", p.spouseAge);
      const lblSpouseAge = document.getElementById("lbl-spouse-age");
      if (lblSpouseAge) {
        const spouseGender = (p.gender === 'female' ? 'male' : 'female');
        lblSpouseAge.innerText = (window.Tab1StreamsUI && window.Tab1StreamsUI.formatGenderAgeText)
          ? window.Tab1StreamsUI.formatGenderAgeText(spouseGender, p.spouseAge)
          : `${spouseGender === 'female' ? 'Nữ' : 'Nam'} (${p.spouseAge} tuổi)`;
      }
    }

    setVal("inp-retire-age", p.retirementAge);
    syncSalaryStreamsWithRetireAge(p);
    setVal("inp-life-expectancy", p.lifeExpectancy);
    setVal("inp-current-savings", p.currentSavings !== undefined ? p.currentSavings : 0);
    const annualExp = p.annualExpenses !== undefined ? p.annualExpenses : (state.currency === 'EUR' ? 15000 : state.currency === 'USD' ? 18000 : 240000000);
    const annualSav = Number(p.annualSavings) || 0;
    const annualRetire = Number(p.retirementExpenses) || 0;

    setVal("inp-monthly-expenses", Math.round(annualExp / 12));
    setVal("inp-monthly-savings", Math.round(annualSav / 12));

    // Base Monthly là mức chi tiêu tại nơi chi phí cao nhất (factor 1.00)
    const loc = p.retirementLocation || "vietnam";
    const ratios = (window.Tab1StreamsUI && typeof window.Tab1StreamsUI.getRetirementPppRatios === 'function')
      ? window.Tab1StreamsUI.getRetirementPppRatios(p)
      : null;
    const factor = ratios ? (ratios.factors[loc] || 1.0) : 1.0;
    let baseMonthly = Number(p.baseRetireMonthly);
    if (!baseMonthly || isNaN(baseMonthly) || baseMonthly <= 0) {
      if (annualRetire > 0) {
        baseMonthly = Math.round((annualRetire / factor) / 12);
      } else {
        baseMonthly = 1000;
      }
      p.baseRetireMonthly = baseMonthly;
    }
    setVal("inp-monthly-retire-expenses", baseMonthly);

    const radLoc = document.querySelector(`input[name='rad-retire-location'][value='${loc}']`);
    if (radLoc) radLoc.checked = true;

    updateRetirementLocationRadiosUI(p);
    updateExpenseSavingsHints(p);

    setVal("inp-return-pre", p.investmentReturnPre);
    setVal("inp-return-post", p.investmentReturnPost);
    setVal("inp-target-legacy", p.targetLegacy);
    setVal("inp-effective-tax", p.taxRate || 10);
    const taxRegime = p.taxRegime || "france_vietnam";
    setVal("inp-tax-regime", taxRegime);
    setVal("inp-acc-pea", p.frenchAccounts?.peaBalance ?? 35000);
    setVal("inp-acc-av", p.frenchAccounts?.assuranceVieBalance ?? 10000);
    setVal("inp-acc-livreta", p.frenchAccounts?.livretABalance ?? 5000);
    updateTaxRegimeUI(taxRegime);

    // Location & Multi-Country PPP
    setVal("sel-retirement-location", p.retirementLocation || "vietnam");
    updateRetirementLocationUI(p.retirementLocation || "vietnam", p);

    // French Pension & Décote
    setVal("inp-start-work-age", p.startWorkAge || 24);
    setVal("inp-pension-age", p.socialSecurityAge || 64);
    syncPensionBaseAuto(p);
    updatePensionDecoteUI(p);

    // Vietnam BHXH Tự Nguyện
    if (p.bhxhVnEnabled === undefined) {
      p.bhxhVnEnabled = true;
    }
    updateBhxhVnUI(p);
    syncBhxhVnStreams(p);
    updateLmnpUI(p);

    // Senior Care / Dépendance
    setVal("inp-senior-care-age", p.seniorCareAge || 78);
    setVal("inp-senior-care-monthly", p.seniorCareMonthly || 0);
    updateSeniorCareUI(p);

    // Kế Hoạch Con Cái & Gia Đình
    const chkFamily = document.getElementById("chk-enable-family-stream");
    if (chkFamily && p.familyPlan) {
      chkFamily.checked = p.familyPlan.enabled !== false;
    }
    updateFamilyStreamUI(p);

    // Sync currency badge & buttons
    const cur = p.currency || state.currency || 'EUR';
    state.currency = cur;
    const curSymbol = cur === 'VND' ? '₫' : cur === 'EUR' ? '€' : '$';
    const unitEl = document.getElementById("unit-savings");
    if (unitEl) unitEl.innerText = curSymbol;
    const modalUnit = document.getElementById("modal-income-unit");
    if (modalUnit) modalUnit.innerText = curSymbol;
    const modalUnitMonthly = document.getElementById("modal-income-unit-monthly");
    if (modalUnitMonthly) modalUnitMonthly.innerText = curSymbol;

    document.getElementById("cur-eur")?.classList.toggle("active", cur === "EUR");
    document.getElementById("cur-vnd")?.classList.toggle("active", cur === "VND");
    document.getElementById("cur-usd")?.classList.toggle("active", cur === "USD");

    // Sync Savings Rate slider & badges
    const savingsRate = Number(p.savingsRate) > 0 ? Number(p.savingsRate) : 33.33;
    p.savingsRate = savingsRate;
    updateSavingsRateUI(savingsRate);


    // Spending Smile (Retirement Card)
    if (p.spendingPhases) {
      const isSmileOn = p.spendingPhases.enabled !== false;
      const chk2 = document.getElementById("chk-card-smile-enabled");
      if (chk2) chk2.checked = isSmileOn;
      const contPhases = document.getElementById("container-card-smile-phases");
      if (contPhases) contPhases.style.display = isSmileOn ? "grid" : "none";

      const gAge = p.spendingPhases.gogoAge || 60;
      const gFactor = p.spendingPhases.gogoFactor || 1.15;
      const sAge = p.spendingPhases.slowgoAge || 75;
      const sFactor = p.spendingPhases.slowgoFactor || 0.90;
      const nFactor = p.spendingPhases.nogoFactor || 0.80;

      setVal("inp-card-gogo-age", gAge);
      setVal("inp-card-gogo-factor", gFactor);
      setVal("inp-card-slowgo-age", sAge);
      setVal("inp-card-slowgo-factor", sFactor);
      setVal("inp-card-nogo-factor", nFactor);
    }

    // 1. Asset Allocation Sync
    const chkAlloc = document.getElementById("chk-enable-asset-allocation");
    if (chkAlloc) chkAlloc.checked = p.enableAssetAllocation !== false;
    if (typeof updateAssetAllocationUI === 'function') {
      updateAssetAllocationUI(p, false);
    }

    // LMNP Stream Sync
    const chkLmnp = document.getElementById("chk-enable-lmnp-stream");
    if (chkLmnp) chkLmnp.checked = p.lmnpEnabled !== false;

    // French Pension Sync
    const chkFrench = document.getElementById("chk-enable-french-pension");
    if (chkFrench) chkFrench.checked = p.enableFrenchPension !== false;

    // Vietnam BHXH Sync
    const chkBhxhVn = document.getElementById("chk-enable-bhxh-vn");
    if (chkBhxhVn) chkBhxhVn.checked = (p.enableBhxhVn !== false && p.bhxhVnEnabled !== false);

    // 2. Dual Inflation & Forex Sync
    const chkDual = document.getElementById("chk-dual-inflation-enabled");
    if (chkDual) chkDual.checked = p.dualInflation ? (p.dualInflation.enabled !== false) : true;
    if (p.dualInflation) {
      setVal("inp-inflation-pre", p.dualInflation.inflationPre || 2.2);
      setVal("inp-inflation-post", p.dualInflation.inflationPost || 4.0);
      setVal("inp-forex-base", p.dualInflation.eurVndInitialRate || 27500);
      setVal("inp-forex-drift", p.dualInflation.eurVndAnnualDrift || 1.2);
    }
    updateDualInflationUI(p);

    // 3. Mortgage Sync
    if (p.mortgage) {
      const chkMort = document.getElementById("chk-mortgage-enabled");
      if (chkMort) chkMort.checked = p.mortgage.enabled !== false;
      setVal("inp-mortgage-prop-val", p.mortgage.propertyValue || 200000);
      setVal("inp-mortgage-loan", p.mortgage.loanAmount || 160000);
      setVal("inp-mortgage-rate", p.mortgage.interestRate || 2.2);
      setVal("inp-mortgage-term", p.mortgage.loanTermYears || 20);
      setVal("inp-mortgage-start", p.mortgage.startAge || (p.currentAge || 29));
    }
    const chkMortPat = document.getElementById("chk-mortgage-from-patrimoine");
    if (chkMortPat) chkMortPat.checked = p.mortgageFromPatrimoine !== false;
    updateMortgageUI(p);

    // 4. Estate Legacy Sync
    const chkLegacy = document.getElementById("chk-enable-estate-legacy");
    if (chkLegacy) {
      chkLegacy.checked = p.enableEstateLegacy !== false;
      const cardLeg = document.getElementById("card-estate-legacy-combined");
      if (cardLeg) cardLeg.style.opacity = p.enableEstateLegacy !== false ? "1" : "0.55";
    }

    renderIncomeStreamsList();
    renderExpenseStreamsList();
    updateCashflowBalanceUI(p);
    if (typeof applyProfileVisibilityRules === 'function') {
      applyProfileVisibilityRules(p);
    }
  }

  // -------------------------------------------------------------
  // Core Update Routine (Renders KPIs, Charts, Table)
  // -------------------------------------------------------------
  function updateAll() {
    const plan = getActivePlan();
    const proj = window.RetirementEngine.runProjection(plan);

    // Keep Pension & Décote live display synchronized
    try { updatePensionDecoteUI(plan); } catch (e) { console.warn("updatePensionDecoteUI error:", e); }
    try { updateBhxhVnUI(plan); } catch (e) { console.warn("updateBhxhVnUI error:", e); }
    try {
      if (window.Tab3TaxesUI?.updateAllInternationalPensionsUI) {
        window.Tab3TaxesUI.updateAllInternationalPensionsUI(plan);
      } else {
        window.dispatchEvent(new CustomEvent('pyretrait:pension-sync', { detail: { plan } }));
      }
    } catch (e) {}
    try { updateLmnpUI(plan); } catch (e) { console.warn("updateLmnpUI error:", e); }
    try { updateDualInflationUI(plan); } catch (e) { console.warn("updateDualInflationUI error:", e); }
    try { updateEstateMilestones(plan, proj); } catch (e) { console.warn("updateEstateMilestones error:", e); }
    if (typeof applyProfileVisibilityRules === 'function') {
      try { applyProfileVisibilityRules(plan); } catch (e) { console.warn("applyProfileVisibilityRules error:", e); }
    }

    // Bảng giai đoạn tuổi phụ thuộc tuổi nghỉ hưu -> phải render lại khi bất kỳ input nào đổi
    try { renderIncomePeriodsSummary(plan); } catch (e) { console.warn("renderIncomePeriodsSummary error:", e); }
    try { renderExpensePeriodsSummary(plan); } catch (e) { console.warn("renderExpensePeriodsSummary error:", e); }
    try { if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList(); } catch (e) {}
    try { if (typeof renderExpenseStreamsList === 'function') renderExpenseStreamsList(); } catch (e) {}

    // Top KPIs: 3 thẻ trụ cột Tiêu chuẩn Tự do Tài chính được cập nhật bởi updateFireCriteriaStatus (ui-tab1-charts.js)

    // KPI: Estate / Inheritance (85t)
    const estateVal = proj.finalTotalNetWorth !== undefined ? proj.finalTotalNetWorth : proj.finalPortfolio;
    document.getElementById("kpi-estate-end").innerText = window.RetirementEngine.formatCurrency(estateVal, state.currency);
    const estateSubEl = document.getElementById("kpi-estate-subtitle");
    if (estateSubEl) {
      if (plan.enableEstateLegacy === false) {
        estateSubEl.className = "kpi-subtitle text-muted";
        estateSubEl.innerHTML = `<span>Tắt mục tiêu di sản thừa kế (Không ép để lại tài sản)</span>`;
      } else {
        const targetLegacy = Number(plan.targetLegacy) || 100000;
        const legacyPct = targetLegacy > 0 ? Math.round((estateVal / targetLegacy) * 100) : 100;
        const fmtTarget = window.RetirementEngine.formatCurrency(targetLegacy, state.currency);
        if (proj.finalPortfolio <= 0 && estateVal > 0) {
          estateSubEl.className = "kpi-subtitle text-warning";
          estateSubEl.innerHTML = `Tiền mặt cạn trước 85t (Còn lại BĐS: <strong>${window.RetirementEngine.formatCurrency(estateVal, state.currency)}</strong>)`;
        } else if (estateVal >= targetLegacy) {
          estateSubEl.className = "kpi-subtitle text-success";
          estateSubEl.innerHTML = `Đạt <strong>${legacyPct}%</strong> mục tiêu thừa kế (${fmtTarget})`;
        } else if (estateVal > 0) {
          estateSubEl.className = "kpi-subtitle text-warning";
          estateSubEl.innerHTML = `Đạt <strong>${legacyPct}%</strong> mục tiêu (${fmtTarget})`;
        } else {
          estateSubEl.className = "kpi-subtitle text-danger";
          estateSubEl.innerHTML = `Thâm hụt di sản (Mục tiêu: ${fmtTarget})`;
        }
      }
    }

    // Đồng bộ phân bổ tài sản hiện tại
    updateAssetAllocationUI(plan);
    updateDualInflationUI(plan);

    const fireScoreEl = document.getElementById("kpi-fire-score");
    if (fireScoreEl) fireScoreEl.innerText = proj.readinessScore + "%";

    updateExpenseSavingsHints(plan);

    const kpiRate = document.getElementById("kpi-savings-rate");
    if (kpiRate) {
      const rate = Number(plan.savingsRate) > 0 ? Number(plan.savingsRate) : 33.33;
      const monthlySav = Math.round((Number(plan.annualSavings) || 0) / 12);
      kpiRate.innerHTML = `Tỷ lệ tiết kiệm: <strong>${rate.toFixed(1)}%</strong> (${window.RetirementEngine.formatCurrency(monthlySav, state.currency)}/tháng)`;
    }

    // Update Sidebar
    document.getElementById("summary-retire-age").innerText = plan.retirementAge + " tuổi";
    const optimalSummaryEl = document.getElementById("summary-optimal-age");
    const optAge = proj.optimalFireAge;
    const t = (k, fb) => (window.I18n ? window.I18n.t(k, fb) : fb);
    if (optimalSummaryEl) {
      optimalSummaryEl.innerText = optAge ? `${optAge} tuổi` : t('summary_not_feasible', 'Chưa khả thi');
      optimalSummaryEl.className = "metric-value font-semibold " + (optAge && optAge <= plan.retirementAge ? "text-success" : "text-warning");
    }
    const lblOptimalAge = document.getElementById("lbl-optimal-age");
    if (lblOptimalAge) {
      lblOptimalAge.innerText = optAge ? `${optAge}t` : t('summary_not_feasible', 'Chưa khả thi');
    }
    document.getElementById("summary-years-to-fire").innerText = proj.yearsToFIRE + " năm nữa";

    // Hệ số an toàn tự động thay đổi theo số năm hưu (> 35 năm: 30x, 30–35 năm: 28x, ≤ 30 năm: 25x)
    const horizon = (Number(plan.lifeExpectancy) || 85) - Number(plan.retirementAge);
    const mult = proj.safetyMultiplier || (horizon > 35 ? 30 : (horizon > 30 ? 28 : 25));
    const lblNestEgg = document.getElementById("summary-target-nest-egg-label");
    if (lblNestEgg) {
      const prefix = window.I18n ? window.I18n.t('summary_target_nest_egg', 'Tài sản mục tiêu') : 'Tài sản mục tiêu';
      lblNestEgg.innerText = `${prefix} (${mult}x):`;
    }
    document.getElementById("summary-target-nest-egg").innerText = window.RetirementEngine.formatCurrency(proj.fireTargetNestEgg, state.currency);

    // Calculate realistic Monte Carlo success probability if engine is available
    let mcSuccessRate = null;
    if (window.MonteCarloSimulator && typeof window.MonteCarloSimulator.runSimulation === "function") {
      try {
        const mcRes = window.MonteCarloSimulator.runSimulation(plan, 400, 15.0);
        mcSuccessRate = mcRes.successRate;
      } catch (e) {
        console.warn("Lỗi tính Monte Carlo nhanh cho sidebar:", e);
      }
    }

    const probEl = document.getElementById("summary-success-prob");
    const statusEl = document.getElementById("summary-fire-status");

    const userRetireAge = Number(plan.retirementAge) || 42;
    const allCriteriaOk = (typeof updateFireCriteriaStatus === "function")
      ? updateFireCriteriaStatus(plan, proj, mcSuccessRate)
      : false;
    const isOptimalReached = allCriteriaOk || (optAge ? (userRetireAge >= optAge) : false);

    if (mcSuccessRate !== null) {
      if (probEl) {
        probEl.innerText = mcSuccessRate + "%";
        probEl.className = "metric-value " + (mcSuccessRate >= 80 ? "text-success font-semibold" : (mcSuccessRate >= 50 ? "text-warning font-semibold" : "text-danger font-semibold"));
      }
      if (statusEl) {
        if (mcSuccessRate >= 80) {
          if (isOptimalReached) {
            statusEl.innerText = t('status_solid', 'Vững chắc');
            statusEl.className = "summary-status status-success";
          } else {
            statusEl.innerText = t('status_suboptimal', 'Chưa tối ưu');
            statusEl.className = "summary-status status-warning";
          }
        } else if (mcSuccessRate >= 50) {
          statusEl.innerText = t('status_risky', 'Khá Rủi ro');
          statusEl.className = "summary-status status-warning";
        } else {
          statusEl.innerText = t('status_needs_adjust', 'Cần Điều chỉnh');
          statusEl.className = "summary-status status-danger";
        }
      }
    } else {
      if (probEl) {
        probEl.innerText = proj.survived ? "100% (Lý tưởng)" : "Nguy cơ";
        probEl.className = "metric-value " + (proj.survived ? "text-success" : "text-danger");
      }
      if (statusEl) {
        if (proj.survived) {
          statusEl.innerText = isOptimalReached ? t('status_solid', 'Vững chắc') : t('status_suboptimal', 'Chưa tối ưu');
          statusEl.className = "summary-status " + (isOptimalReached ? "status-success" : "status-warning");
        } else {
          statusEl.innerText = t('status_needs_adjust', 'Cần Điều chỉnh');
          statusEl.className = "summary-status status-danger";
        }
      }
    }

    // Render Charts & Cards
    updateWithdrawalStrategyCards(plan);
    renderNetWorthChart(proj);
    renderStressResilienceCard(proj);
    renderCashFlowChart(proj);
    renderProjectionsTable(proj);
    renderIncomePeriodsSummary(plan);
    triggerPlanProjectionsInsight(proj);

    // Also re-render current active tab if different from projections
    if (state.activeTab && state.activeTab !== "tab-projections") {
      renderActiveTab(state.activeTab);
    }
  }

  // -------------------------------------------------------------
  // Helpers: Currency, ViewMode, Theme
  // -------------------------------------------------------------
  function convertPlanCurrency(plan, fromCur, toCur) {
    if (!plan || fromCur === toCur) return;

    // Exchange rates: 1 EUR ≈ 27,500 VND; 1 USD ≈ 25,000 VND; 1 EUR ≈ 1.10 USD
    let rate = 1;
    if (fromCur === "VND" && toCur === "EUR") rate = 1 / 27500;
    else if (fromCur === "EUR" && toCur === "VND") rate = 27500;
    else if (fromCur === "VND" && toCur === "USD") rate = 1 / 25000;
    else if (fromCur === "USD" && toCur === "VND") rate = 25000;
    else if (fromCur === "EUR" && toCur === "USD") rate = 1.10;
    else if (fromCur === "USD" && toCur === "EUR") rate = 1 / 1.10;

    const roundAmt = (val) => {
      const converted = (Number(val) || 0) * rate;
      return toCur === "VND" ? Math.round(converted / 100000) * 100000 : Math.round(converted);
    };

    plan.currentSavings = roundAmt(plan.currentSavings);
    plan.annualSavings = roundAmt(plan.annualSavings);
    plan.annualExpenses = roundAmt(plan.annualExpenses);
    plan.retirementExpenses = roundAmt(plan.retirementExpenses);
    plan.targetLegacy = roundAmt(plan.targetLegacy);
    if (plan.socialSecurityAnnual) plan.socialSecurityAnnual = roundAmt(plan.socialSecurityAnnual);

    if (Array.isArray(plan.incomes)) {
      plan.incomes.forEach(stream => {
        stream.amount = roundAmt(stream.amount);
      });
    }

    plan.currency = toCur;
  }

  function setCurrency(cur) {
    const oldCur = state.currency;
    state.currency = cur;
    const plan = getActivePlan();

    if (oldCur !== cur) {
      convertPlanCurrency(plan, oldCur, cur);
    } else {
      plan.currency = cur;
    }

    document.getElementById("cur-eur")?.classList.toggle("active", cur === "EUR");
    document.getElementById("cur-vnd")?.classList.toggle("active", cur === "VND");
    document.getElementById("cur-usd")?.classList.toggle("active", cur === "USD");
    const unitEl = document.getElementById("unit-savings");
    if (unitEl) unitEl.innerText = cur === "VND" ? "₫" : cur === "EUR" ? "€" : "$";

    savePlansToStorage();
    renderActivePlanInputs();
    updateAll();
  }

  function setViewMode(mode) {
    state.viewMode = mode;
    state.cashflowViewMode = mode;
    if (window.AppState) {
      if (typeof window.AppState.setViewMode === 'function') window.AppState.setViewMode(mode);
      if (typeof window.AppState.setCashflowViewMode === 'function') window.AppState.setCashflowViewMode(mode);
    }
    const btnNominal = document.getElementById("btn-view-nominal");
    const btnReal = document.getElementById("btn-view-real");
    if (btnNominal) btnNominal.classList.toggle("active", mode === "nominal");
    if (btnReal) btnReal.classList.toggle("active", mode === "real");

    const noticeEl = document.getElementById("cashflow-inflation-notice");
    if (noticeEl) {
      const activeChartTab = (window.AppState && typeof window.AppState.getMainChartTab === 'function')
        ? window.AppState.getMainChartTab()
        : (state.mainChartTab || 'cashflow');
      noticeEl.style.display = (mode === "nominal" && activeChartTab === "cashflow") ? "flex" : "none";
    }

    debouncedSavePlansToStorage();
    updateAll();
  }

  function setCashflowViewMode(mode) {
    state.cashflowViewMode = mode;
    if (window.AppState && typeof window.AppState.setCashflowViewMode === 'function') {
      window.AppState.setCashflowViewMode(mode);
    }
    const btnReal = document.getElementById("btn-cashflow-real");
    const btnNominal = document.getElementById("btn-cashflow-nominal");
    if (btnReal) btnReal.classList.toggle("active", mode === "real");
    if (btnNominal) btnNominal.classList.toggle("active", mode === "nominal");

    const noticeEl = document.getElementById("cashflow-inflation-notice");
    if (noticeEl) {
      noticeEl.style.display = (mode === "nominal") ? "flex" : "none";
    }

    debouncedSavePlansToStorage();
    const plan = getActivePlan();
    const proj = window.RetirementEngine.runProjection(plan);
    if (window.Tab1ChartsUI && typeof window.Tab1ChartsUI.renderCashFlowChart === 'function') {
      window.Tab1ChartsUI.renderCashFlowChart(proj);
    }
  }

  const SUN_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-svg-icon"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;

  const MOON_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-svg-icon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

  function updateThemeIcon(theme) {
    const icon = document.getElementById("theme-icon");
    const btn = document.getElementById("theme-toggle-btn");
    if (icon) {
      icon.innerHTML = (theme === "dark") ? SUN_ICON_SVG : MOON_ICON_SVG;
    }
    if (btn) {
      btn.title = (theme === "dark") ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối";
    }
  }

  function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    const nextTheme = isDark ? "light" : "dark";
    html.setAttribute("data-theme", nextTheme);
    updateThemeIcon(nextTheme);
    localStorage.setItem("pyRetrait_theme", nextTheme);
    debouncedSavePlansToStorage();
    updateAll();
  }

  function loadTheme() {
    const saved = localStorage.getItem("pyRetrait_theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    updateThemeIcon(saved);
  }

  window.addEventListener('pyretrait:language-changed', () => {
    try {
      if (typeof getActivePlan === 'function' && getActivePlan()) {
        updateAll();
      }
    } catch (e) {
      console.warn("Lỗi re-render khi đổi ngôn ngữ:", e);
    }
  });

  // Expose global interface for GeminiAdvisor and testing
  window.RetirementApp = {
    getActivePlan,
    openQuickSetupWizard,
    getCurrency: () => state.currency,
    updateAll,
    syncFromPatrimoine,
    reloadPlansFromBackend: async () => {
      // Guests keep their plans in this browser only: never replace them with server defaults
      if (!(window.Auth && window.Auth.isLoggedIn())) {
        await syncFromPatrimoine();
        return;
      }
      try {
        const headers = window.Auth.getAuthHeaders();
        const res = await fetch("/api/plans", { headers });
        if (res.ok) {
          state.plansData = await res.json();
          if (window.AppState && typeof window.AppState.applySavedUserPreferences === 'function') {
            window.AppState.applySavedUserPreferences(state.plansData);
          }
          savePlansToStorage();
          renderPlanSelector();
          renderActivePlanInputs();
          if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
          updateAll();
        }
      } catch (err) {
        console.error("Failed to reload plans from backend:", err);
      }
    }
  };


  // Expose Core Helpers cho các Tab con sử dụng
  Object.assign(window, {
    getVal,
    parseVal,
    setVal,
    ageAxisTicks,
    loadInitialPlans,
    savePlansToStorage,
    debouncedSavePlansToStorage,
    getActivePlan,
    syncSalaryStreamsWithRetireAge,
    bindInput,
    switchTab,
    renderActiveTab,
    renderActivePlanInputs,
    updateAll,
    convertPlanCurrency,
    setCurrency,
    setViewMode,
    setCashflowViewMode,
    updateThemeIcon,
    toggleTheme,
    loadTheme
  });

})();
