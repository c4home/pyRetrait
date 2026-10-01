/**
 * pyRetrait — Main UI Controller, Chart.js Visualizations, and User Interaction Layer
 */

(function() {
  'use strict';

  // Global App State
  let state = {
    plansData: {
      activePlanId: "plan_franco_viet",
      plans: {}
    },
    currency: "EUR", // Default to EUR
    viewMode: "nominal", // "nominal" or "real"
    activeTab: "tab-projections",
    activeScenario: "baseline",
    compareMode: false,
    charts: {}
  };

  // Local Storage Key
  const STORAGE_KEY = "pyRetrait_plans_v2";

  // Document Ready
  document.addEventListener("DOMContentLoaded", () => {
    initApp();
  });

  async function initApp() {
    loadTheme();
    await loadInitialPlans();
    bindEvents();
    renderPlanSelector();
    renderActivePlanInputs();
    updateAll();
  }

  // -------------------------------------------------------------
  // Data Loading & Persistence
  // -------------------------------------------------------------
  async function loadInitialPlans() {
    // 1. Try local storage first
    const savedLocal = localStorage.getItem(STORAGE_KEY);
    if (savedLocal) {
      try {
        state.plansData = JSON.parse(savedLocal);
        state.currency = getActivePlan()?.currency || 'EUR';
        return;
      } catch (e) {
        console.error("Failed to parse localStorage:", e);
      }
    }

    // 2. Try fetching from backend API
    try {
      const res = await fetch("/api/plans");
      if (res.ok) {
        state.plansData = await res.json();
        state.currency = getActivePlan()?.currency || 'EUR';
        savePlansToStorage();
        return;
      }
    } catch (e) {
      console.log("Backend API not reachable, using default state");
    }

    // 3. Fallback default
    state.plansData = {
      activePlanId: "plan_baseline",
      plans: {
        plan_baseline: {
          id: "plan_baseline",
          name: "Kế hoạch Tiêu chuẩn (Baseline FIRE)",
          currency: "VND",
          currentAge: 32,
          retirementAge: 45,
          lifeExpectancy: 85,
          currentSavings: 1500000000,
          annualSavings: 360000000,
          annualExpenses: 240000000,
          retirementExpenses: 300000000,
          inflationRate: 4.0,
          investmentReturnPre: 10.0,
          investmentReturnPost: 8.0,
          withdrawalStrategy: "guyton_klinger",
          initialWithdrawalRate: 4.0,
          targetLegacy: 1000000000,
          taxRegime: "international",
          taxRate: 10.0,
          socialSecurityAge: 62,
          socialSecurityAnnual: 72000000,
          incomes: [
            { name: "Lương chính & Thưởng", amount: 600000000, startAge: 32, endAge: 45, growth: 5.0 },
            { name: "BĐS Cho thuê / Cổ tức", amount: 120000000, startAge: 42, endAge: 85, growth: 4.0 }
          ],
          spendingPhases: {
            enabled: true,
            gogoAge: 60,
            gogoFactor: 1.15,
            slowgoAge: 75,
            slowgoFactor: 0.90,
            nogoFactor: 0.80
          },
          rothConversion: {
            enabled: true,
            targetBracket: 12.0,
            maxAnnualConversion: 200000000
          },
          healthcare: {
            enabled: true,
            annualPreMedicare: 30000000,
            annualPostMedicare: 15000000,
            acaOptimization: true
          }
        },
        plan_aggressive: {
          id: "plan_aggressive",
          name: "Nghỉ hưu Cực sớm (Fat FIRE 40 tuổi)",
          currency: "VND",
          currentAge: 32,
          retirementAge: 40,
          lifeExpectancy: 85,
          currentSavings: 2500000000,
          annualSavings: 500000000,
          annualExpenses: 240000000,
          retirementExpenses: 360000000,
          inflationRate: 4.0,
          investmentReturnPre: 12.0,
          investmentReturnPost: 8.5,
          withdrawalStrategy: "vpw",
          initialWithdrawalRate: 3.8,
          targetLegacy: 2000000000,
          taxRegime: "international",
          taxRate: 10.0,
          socialSecurityAge: 62,
          socialSecurityAnnual: 72000000,
          incomes: [
            { name: "Kinh doanh & Tư vấn", amount: 800000000, startAge: 32, endAge: 40, growth: 7.0 },
            { name: "Thu nhập Thụ động BĐS", amount: 200000000, startAge: 40, endAge: 85, growth: 4.5 }
          ],
          spendingPhases: {
            enabled: true,
            gogoAge: 55,
            gogoFactor: 1.20,
            slowgoAge: 70,
            slowgoFactor: 0.85,
            nogoFactor: 0.75
          },
          rothConversion: { enabled: false, targetBracket: 12.0, maxAnnualConversion: 0 },
          healthcare: { enabled: true, annualPreMedicare: 40000000, annualPostMedicare: 20000000, acaOptimization: false }
        }
      }
    };
    savePlansToStorage();
  }

  function savePlansToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plansData));
    // Also sync to backend API in background if possible
    fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.plansData)
    }).catch(() => {});
  }

  function getActivePlan() {
    const plan = state.plansData.plans[state.plansData.activePlanId];
    return plan || Object.values(state.plansData.plans)[0];
  }

  // -------------------------------------------------------------
  // Event Binding
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

    // Compare Mode Toggle
    document.getElementById("btn-toggle-compare").addEventListener("click", () => {
      toggleCompareMode();
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
    exportBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      exportDropdown.classList.toggle("show");
    });
    document.addEventListener("click", () => exportDropdown.classList.remove("show"));

    document.getElementById("export-csv-btn").addEventListener("click", (e) => {
      e.preventDefault();
      const plan = getActivePlan();
      const proj = window.RetirementEngine.runProjection(plan);
      window.ReportExporter.exportScheduleToCSV(plan, proj);
    });

    document.getElementById("export-pdf-btn").addEventListener("click", (e) => {
      e.preventDefault();
      window.ReportExporter.printExecutiveSummary();
    });

    document.getElementById("export-json-btn").addEventListener("click", (e) => {
      e.preventDefault();
      window.ReportExporter.exportPlansToJSON(state.plansData);
    });

    document.getElementById("import-json-btn").addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("json-file-input").click();
    });

    document.getElementById("json-file-input").addEventListener("change", handleJSONImport);

    // Nominal vs Real View Toggle
    document.getElementById("btn-view-nominal").addEventListener("click", () => setViewMode("nominal"));
    document.getElementById("btn-view-real").addEventListener("click", () => setViewMode("real"));

    // Toggle Detailed Table
    document.getElementById("btn-toggle-table").addEventListener("click", () => {
      const container = document.getElementById("schedule-table-container");
      const btn = document.getElementById("btn-toggle-table");
      const isHidden = container.style.display === "none";
      container.style.display = isHidden ? "block" : "none";
      btn.innerText = isHidden ? "Thu gọn Bảng ▲" : "Mở rộng Bảng ▼";
    });

    // Add / Edit Income Stream
    document.getElementById("btn-add-income").addEventListener("click", () => openIncomeModal(-1));
    document.getElementById("btn-close-income-modal").addEventListener("click", closeIncomeModal);
    document.getElementById("btn-cancel-income-modal").addEventListener("click", closeIncomeModal);
    document.getElementById("btn-save-income-modal").addEventListener("click", saveIncomeFromModal);

    // Plan Modal Events
    document.getElementById("btn-close-modal").addEventListener("click", closeModal);
    document.getElementById("btn-cancel-modal").addEventListener("click", closeModal);
    document.getElementById("btn-save-new-plan").addEventListener("click", saveNewPlanFromModal);

    // Live Parameter Bindings
    bindInput("inp-current-age", "currentAge", Number);
    bindInput("inp-retire-age", "retirementAge", Number);
    bindInput("inp-life-expectancy", "lifeExpectancy", Number);
    bindInput("inp-inflation", "inflationRate", Number);
    bindInput("inp-current-savings", "currentSavings", Number);
    bindInput("inp-savings-rate", "savingsRate", Number);

    const sliderSavingsRate = document.getElementById("inp-savings-rate");
    if (sliderSavingsRate) {
      sliderSavingsRate.addEventListener("input", (e) => {
        const val = Number(e.target.value);
        getActivePlan().savingsRate = val;
        syncSavingsAndExpensesFromRate(getActivePlan());
        savePlansToStorage();
        updateAll();
      });
    }

    document.querySelectorAll(".btn-ratio").forEach(btn => {
      btn.addEventListener("click", () => {
        const ratio = Number(btn.getAttribute("data-ratio"));
        getActivePlan().savingsRate = ratio;
        syncSavingsAndExpensesFromRate(getActivePlan());
        savePlansToStorage();
        updateAll();
      });
    });

    const inpSavings = document.getElementById("inp-annual-savings");
    if (inpSavings) {
      inpSavings.addEventListener("change", () => {
        const p = getActivePlan();
        p.annualSavings = Number(inpSavings.value) || 0;
        const total = p.annualSavings + (Number(p.annualExpenses) || 0);
        if (total > 0) {
          p.savingsRate = Math.round((p.annualSavings / total) * 1000) / 10;
        }
        updateSavingsRateUI(p.savingsRate || 33.33);
        savePlansToStorage();
        updateAll();
      });
    }

    const inpExp = document.getElementById("inp-annual-expenses");
    if (inpExp) {
      inpExp.addEventListener("change", () => {
        const p = getActivePlan();
        p.annualExpenses = Number(inpExp.value) || 0;
        const total = (Number(p.annualSavings) || 0) + p.annualExpenses;
        if (total > 0) {
          p.savingsRate = Math.round(((Number(p.annualSavings) || 0) / total) * 1000) / 10;
        }
        updateSavingsRateUI(p.savingsRate || 33.33);
        savePlansToStorage();
        updateAll();
      });
    }
    bindInput("inp-return-pre", "investmentReturnPre", Number);
    bindInput("inp-return-post", "investmentReturnPost", Number);
    bindInput("inp-target-legacy", "targetLegacy", Number);
    bindInput("inp-effective-tax", "taxRate", Number);
    bindInput("inp-tax-regime", "taxRegime", String);
    bindInput("inp-roth-bracket", "rothConversion.targetBracket", Number);
    bindInput("inp-roth-max-annual", "rothConversion.maxAnnualConversion", Number);
    bindInput("inp-gogo-age", "spendingPhases.gogoAge", Number);
    bindInput("inp-gogo-factor", "spendingPhases.gogoFactor", Number);
    bindInput("inp-slowgo-age", "spendingPhases.slowgoAge", Number);
    bindInput("inp-slowgo-factor", "spendingPhases.slowgoFactor", Number);
    bindInput("inp-nogo-factor", "spendingPhases.nogoFactor", Number);

    // Checkboxes
    const chkRoth = document.getElementById("chk-roth-enabled");
    chkRoth.addEventListener("change", (e) => {
      getActivePlan().rothConversion.enabled = e.target.checked;
      savePlansToStorage();
      updateAll();
    });

    const chkSmile = document.getElementById("chk-smile-enabled");
    chkSmile.addEventListener("change", (e) => {
      getActivePlan().spendingPhases.enabled = e.target.checked;
      savePlansToStorage();
      updateAll();
    });

    // Withdrawal Strategy Radio Buttons
    document.querySelectorAll("input[name='withdrawal-strategy']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        getActivePlan().withdrawalStrategy = e.target.value;
        savePlansToStorage();
        updateAll();
      });
    });

    // Initial SWR Range Slider
    const swrSlider = document.getElementById("inp-initial-swr");
    swrSlider.addEventListener("input", (e) => {
      document.getElementById("val-initial-swr").innerText = e.target.value;
      getActivePlan().initialWithdrawalRate = Number(e.target.value);
      savePlansToStorage();
      updateAll();
    });

    // Scenario Stress Test Buttons
    document.querySelectorAll(".scenario-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".scenario-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeScenario = btn.getAttribute("data-scenario");
        renderScenarioTab();
      });
    });

    // Run Monte Carlo Button
    document.getElementById("btn-run-monte-carlo").addEventListener("click", () => {
      renderMonteCarloTab();
    });

    // Compare Plan B Selector
    const compareB = document.getElementById("compare-plan-b-selector");
    compareB.addEventListener("change", () => renderCompareSection());
  }

  function bindInput(id, fieldPath, typeConverter) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", (e) => {
      const val = typeConverter(e.target.value);
      const plan = getActivePlan();
      
      if (fieldPath.includes('.')) {
        const parts = fieldPath.split('.');
        if (!plan[parts[0]]) plan[parts[0]] = {};
        plan[parts[0]][parts[1]] = val;
      } else {
        plan[fieldPath] = val;
      }
      
      savePlansToStorage();
      updateAll();
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
    if (tabId === "tab-withdrawals") renderWithdrawalComparison();
    else if (tabId === "tab-taxes") renderTaxTab();
    else if (tabId === "tab-insights") renderMonteCarloTab();
    else if (tabId === "tab-scenarios") renderScenarioTab();
    else if (tabId === "tab-estate") renderEstateTab();
    else if (tabId === "tab-advisor") renderAdvisorTab();
  }

  // -------------------------------------------------------------
  // Render Inputs to Match Active Plan
  // -------------------------------------------------------------
  function renderActivePlanInputs() {
    const p = getActivePlan();
    if (!p) return;

    setVal("inp-current-age", p.currentAge);
    setVal("inp-retire-age", p.retirementAge);
    setVal("inp-life-expectancy", p.lifeExpectancy);
    setVal("inp-inflation", p.inflationRate);
    setVal("inp-current-savings", p.currentSavings);
    setVal("inp-annual-expenses", p.annualExpenses !== undefined ? p.annualExpenses : (state.currency === 'EUR' ? 15000 : state.currency === 'USD' ? 18000 : 240000000));
    setVal("inp-annual-savings", p.annualSavings);
    setVal("inp-retire-expenses", p.retirementExpenses);
    setVal("inp-return-pre", p.investmentReturnPre);
    setVal("inp-return-post", p.investmentReturnPost);
    setVal("inp-target-legacy", p.targetLegacy);
    setVal("inp-effective-tax", p.taxRate || 10);
    setVal("inp-tax-regime", p.taxRegime || "international");

    // Sync currency badge & buttons
    const cur = p.currency || state.currency || 'EUR';
    state.currency = cur;
    const curSymbol = cur === 'VND' ? '₫' : cur === 'EUR' ? '€' : '$';
    const unitEl = document.getElementById("unit-savings");
    if (unitEl) unitEl.innerText = curSymbol;
    const modalUnit = document.getElementById("modal-income-unit");
    if (modalUnit) modalUnit.innerText = curSymbol;

    document.getElementById("cur-eur")?.classList.toggle("active", cur === "EUR");
    document.getElementById("cur-vnd")?.classList.toggle("active", cur === "VND");
    document.getElementById("cur-usd")?.classList.toggle("active", cur === "USD");

    // Sync Savings Rate slider & badges
    const savingsRate = Number(p.savingsRate) > 0 ? Number(p.savingsRate) : 33.33;
    p.savingsRate = savingsRate;
    updateSavingsRateUI(savingsRate);

    // SWR Slider
    setVal("inp-initial-swr", p.initialWithdrawalRate || 4.0);
    const swrDisplay = document.getElementById("val-initial-swr");
    if (swrDisplay) swrDisplay.innerText = p.initialWithdrawalRate || 4.0;

    // Radio button
    const radio = document.querySelector(`input[name='withdrawal-strategy'][value='${p.withdrawalStrategy || "guyton_klinger"}']`);
    if (radio) radio.checked = true;

    // Roth
    if (p.rothConversion) {
      document.getElementById("chk-roth-enabled").checked = p.rothConversion.enabled !== false;
      setVal("inp-roth-bracket", p.rothConversion.targetBracket || 12);
      setVal("inp-roth-max-annual", p.rothConversion.maxAnnualConversion || 200000000);
    }

    // Spending Smile
    if (p.spendingPhases) {
      document.getElementById("chk-smile-enabled").checked = p.spendingPhases.enabled !== false;
      setVal("inp-gogo-age", p.spendingPhases.gogoAge || 60);
      setVal("inp-gogo-factor", p.spendingPhases.gogoFactor || 1.15);
      setVal("inp-slowgo-age", p.spendingPhases.slowgoAge || 75);
      setVal("inp-slowgo-factor", p.spendingPhases.slowgoFactor || 0.90);
      setVal("inp-nogo-factor", p.spendingPhases.nogoFactor || 0.80);
    }

    renderIncomeStreamsList();
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  }

  function renderIncomeStreamsList() {
    const container = document.getElementById("income-streams-container");
    container.innerHTML = "";
    const p = getActivePlan();
    if (!Array.isArray(p.incomes)) p.incomes = [];

    if (p.incomes.length === 0) {
      container.innerHTML = `<div style="font-size:0.78rem;color:var(--text-faint);padding:0.5rem 0;">Chưa có nguồn thu nào. Bấm "+ Thêm nguồn thu" để thêm.</div>`;
      return;
    }

    p.incomes.forEach((stream, idx) => {
      const item = document.createElement("div");
      item.className = "income-item";
      item.innerHTML = `
        <div class="income-item-header">
          <span class="income-item-name">${stream.name}</span>
          <div class="income-item-actions">
            <button class="income-item-btn income-item-edit" data-idx="${idx}" title="Chỉnh sửa nguồn thu">✏️ Sửa</button>
            <button class="income-item-btn income-item-del" data-idx="${idx}" title="Xóa nguồn thu">🗑️</button>
          </div>
        </div>
        <div class="income-item-meta">
          <span class="text-accent font-mono"><strong>${window.RetirementEngine.formatCurrency(stream.amount, state.currency)}</strong>/năm</span>
          <span>${stream.startAge} - ${stream.endAge} tuổi (+${stream.growth}%/năm)</span>
        </div>
      `;
      container.appendChild(item);
    });

    container.querySelectorAll(".income-item-edit").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = Number(btn.getAttribute("data-idx"));
        openIncomeModal(idx);
      });
    });

    container.querySelectorAll(".income-item-del").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = Number(btn.getAttribute("data-idx"));
        const streamName = getActivePlan().incomes[idx]?.name || "nguồn thu này";
        if (confirm(`Bạn có chắc chắn muốn xóa "${streamName}"?`)) {
          getActivePlan().incomes.splice(idx, 1);
          syncSavingsAndExpensesFromRate(getActivePlan());
          savePlansToStorage();
          renderIncomeStreamsList();
          updateAll();
        }
      });
    });
  }

  function getActiveIncomeAtAge(plan, age) {
    if (!plan || !Array.isArray(plan.incomes)) return 0;
    let total = 0;
    plan.incomes.forEach(s => {
      if (age >= s.startAge && age <= s.endAge) {
        const streamGrowth = (Number(s.growth) || 4.0) / 100.0;
        const years = age - s.startAge;
        total += (Number(s.amount) || 0) * Math.pow(1.0 + streamGrowth, years);
      }
    });
    return total;
  }

  function syncSavingsAndExpensesFromRate(plan) {
    if (!plan) return;
    const currentAge = Number(plan.currentAge) || 29;
    const grossIncome = getActiveIncomeAtAge(plan, currentAge);
    const rate = Number(plan.savingsRate) > 0 ? Number(plan.savingsRate) : 33.33;
    plan.savingsRate = rate;

    let availableIncome = grossIncome;
    if (grossIncome > 0) {
      let estTax = 0;
      if (window.TaxOptimizer && window.TaxOptimizer.calculateProgressiveTax) {
        estTax = window.TaxOptimizer.calculateProgressiveTax(grossIncome, plan.taxRegime || 'france_vietnam');
      } else {
        estTax = grossIncome * ((Number(plan.taxRate) || 12) / 100.0) * 0.7;
      }
      availableIncome = Math.max(0, grossIncome - estTax);
      
      const newSavings = Math.round(availableIncome * (rate / 100.0));
      const newExpenses = Math.round(availableIncome * (1.0 - (rate / 100.0)));
      plan.annualSavings = newSavings;
      plan.annualExpenses = newExpenses;

      setVal("inp-annual-savings", newSavings);
      setVal("inp-annual-expenses", newExpenses);
    }

    updateSavingsRateUI(rate);
  }

  function updateSavingsRateUI(rate) {
    const slider = document.getElementById("inp-savings-rate");
    const lbl = document.getElementById("lbl-savings-rate");
    const hintExp = document.getElementById("hint-annual-expenses");
    const hintSav = document.getElementById("hint-annual-savings");
    const kpiRate = document.getElementById("kpi-savings-rate");

    if (slider) slider.value = rate;

    let fracText = "";
    let expFracText = "";
    if (Math.abs(rate - 33.33) < 1 || Math.abs(rate - 33) < 1) {
      fracText = "1/3 Thu nhập";
      expFracText = "2/3 Thu nhập";
    } else if (Math.abs(rate - 25) < 1) {
      fracText = "1/4 Thu nhập";
      expFracText = "3/4 Thu nhập";
    } else if (Math.abs(rate - 50) < 1) {
      fracText = "1/2 Thu nhập";
      expFracText = "1/2 Thu nhập";
    } else if (Math.abs(rate - 66.67) < 1 || Math.abs(rate - 67) < 1) {
      fracText = "2/3 Thu nhập";
      expFracText = "1/3 Thu nhập";
    }

    if (lbl) {
      lbl.innerText = `${rate.toFixed(1)}%` + (fracText ? ` (${fracText})` : "");
    }
    if (hintSav) {
      hintSav.innerText = fracText ? `≈ ${fracText}` : `≈ ${rate.toFixed(1)}% thu nhập`;
    }
    if (hintExp) {
      hintExp.innerText = expFracText ? `≈ ${expFracText}` : `≈ ${(100 - rate).toFixed(1)}% thu nhập`;
    }
    if (kpiRate) {
      kpiRate.innerHTML = `Tỷ lệ tiết kiệm: <strong>${rate.toFixed(1)}%</strong>`;
    }

    document.querySelectorAll(".btn-ratio").forEach(btn => {
      const btnRatio = Number(btn.getAttribute("data-ratio"));
      btn.classList.toggle("active", Math.abs(btnRatio - rate) < 1);
    });
  }

  function openIncomeModal(idx = -1) {
    const plan = getActivePlan();
    const modal = document.getElementById("income-modal");
    const title = document.getElementById("income-modal-title");
    const unit = document.getElementById("modal-income-unit");
    if (unit) unit.innerText = state.currency === 'VND' ? '₫' : state.currency === 'EUR' ? '€' : '$';

    document.getElementById("inp-income-idx").value = idx;

    if (idx >= 0 && plan.incomes && plan.incomes[idx]) {
      const stream = plan.incomes[idx];
      title.innerText = `Chỉnh Sửa: ${stream.name}`;
      document.getElementById("inp-income-name").value = stream.name;
      document.getElementById("inp-income-amount").value = stream.amount;
      document.getElementById("inp-income-start").value = stream.startAge;
      document.getElementById("inp-income-end").value = stream.endAge;
      document.getElementById("inp-income-growth").value = stream.growth !== undefined ? stream.growth : 3.5;
    } else {
      title.innerText = "Thêm Nguồn Thu Nhập Mới";
      document.getElementById("inp-income-name").value = "";
      document.getElementById("inp-income-amount").value = state.currency === 'EUR' ? 12000 : state.currency === 'USD' ? 12000 : 120000000;
      document.getElementById("inp-income-start").value = plan.currentAge || 29;
      document.getElementById("inp-income-end").value = plan.retirementAge || 42;
      document.getElementById("inp-income-growth").value = 3.5;
    }

    modal.style.display = "flex";
  }

  function closeIncomeModal() {
    document.getElementById("income-modal").style.display = "none";
  }

  function saveIncomeFromModal() {
    const idx = Number(document.getElementById("inp-income-idx").value);
    const name = document.getElementById("inp-income-name").value.trim();
    if (!name) {
      alert("Vui lòng nhập tên nguồn thu nhập!");
      return;
    }

    const amount = Number(document.getElementById("inp-income-amount").value) || 0;
    const startAge = Number(document.getElementById("inp-income-start").value) || 29;
    const endAge = Number(document.getElementById("inp-income-end").value) || 85;
    const growth = Number(document.getElementById("inp-income-growth").value) || 0;

    const plan = getActivePlan();
    if (!Array.isArray(plan.incomes)) plan.incomes = [];

    const streamData = {
      name,
      amount,
      startAge,
      endAge,
      growth,
      taxable: true
    };

    if (idx >= 0 && idx < plan.incomes.length) {
      plan.incomes[idx] = streamData;
    } else {
      plan.incomes.push(streamData);
    }

    syncSavingsAndExpensesFromRate(plan);
    savePlansToStorage();
    closeIncomeModal();
    renderIncomeStreamsList();
    updateAll();
  }

  // -------------------------------------------------------------
  // Core Update Routine (Renders KPIs, Charts, Table)
  // -------------------------------------------------------------
  function updateAll() {
    const plan = getActivePlan();
    const proj = window.RetirementEngine.runProjection(plan);

    // Update Top KPIs
    document.getElementById("kpi-current-networth").innerText = window.RetirementEngine.formatCurrency(plan.currentSavings, state.currency);
    document.getElementById("kpi-peak-networth").innerText = window.RetirementEngine.formatCurrency(proj.peakNetWorth, state.currency);
    document.getElementById("kpi-peak-age").innerText = proj.peakAge;
    document.getElementById("kpi-safe-annual-spend").innerText = window.RetirementEngine.formatCurrency(proj.safeAnnualSpend, state.currency);
    document.getElementById("kpi-estate-end").innerText = window.RetirementEngine.formatCurrency(proj.finalPortfolio, state.currency);
    document.getElementById("kpi-fire-score").innerText = proj.readinessScore + "%";

    const kpiRate = document.getElementById("kpi-savings-rate");
    if (kpiRate) {
      const rate = Number(plan.savingsRate) > 0 ? Number(plan.savingsRate) : 33.33;
      kpiRate.innerHTML = `Tỷ lệ tiết kiệm: <strong>${rate.toFixed(1)}%</strong>`;
    }

    // Update Sidebar
    document.getElementById("summary-retire-age").innerText = plan.retirementAge + " tuổi";
    document.getElementById("summary-years-to-fire").innerText = proj.yearsToFIRE + " năm nữa";
    document.getElementById("summary-target-nest-egg").innerText = window.RetirementEngine.formatCurrency(proj.fireTargetNestEgg, state.currency);
    document.getElementById("summary-success-prob").innerText = proj.survived ? "95.4%" : "Nguy cơ";
    document.getElementById("summary-fire-status").innerText = proj.survived ? "FIRE Vững chắc" : "Cần Điều chỉnh";

    // Render Charts
    renderNetWorthChart(proj);
    renderCashFlowChart(proj);
    renderProjectionsTable(proj);

    // Also re-render current active tab if different from projections
    if (state.activeTab && state.activeTab !== "tab-projections") {
      renderActiveTab(state.activeTab);
    }

    // If Compare Mode is active, update comparison
    if (state.compareMode) {
      renderCompareSection();
    }
  }

  // -------------------------------------------------------------
  // Chart.js Visualizations
  // -------------------------------------------------------------
  function renderNetWorthChart(proj) {
    const ctx = document.getElementById("chart-networth").getContext("2d");
    const labels = proj.timeline.map(p => `Tuổi ${p.age}`);
    const data = proj.timeline.map(p => state.viewMode === "nominal" ? p.portfolioEnd : p.realPortfolioEnd);

    if (state.charts.networth) {
      state.charts.networth.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');

    state.charts.networth = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `Tài sản Ròng (${window.RetirementEngine.getCurrencySymbol(state.currency)})`,
          data,
          borderColor: '#10b981',
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointRadius: 2,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => ` ${window.RetirementEngine.formatCurrency(item.raw, state.currency, false)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              font: { size: 10 },
              callback: (val) => window.RetirementEngine.formatCurrency(val, state.currency, true)
            }
          }
        }
      }
    });
  }

  function renderCashFlowChart(proj) {
    const ctx = document.getElementById("chart-cashflow").getContext("2d");
    const labels = proj.timeline.map(p => p.age);
    const incomes = proj.timeline.map(p => p.income);
    const expenses = proj.timeline.map(p => p.expenses);

    if (state.charts.cashflow) {
      state.charts.cashflow.destroy();
    }

    state.charts.cashflow = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Thu nhập Hàng năm',
            data: incomes,
            backgroundColor: 'rgba(59, 130, 246, 0.85)',
            borderRadius: 4
          },
          {
            label: 'Chi tiêu Sinh hoạt',
            data: expenses,
            backgroundColor: 'rgba(239, 68, 68, 0.85)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${window.RetirementEngine.formatCurrency(item.raw, state.currency, false)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              font: { size: 10 },
              callback: (val) => window.RetirementEngine.formatCurrency(val, state.currency, true)
            }
          }
        }
      }
    });
  }

  function renderProjectionsTable(proj) {
    const tbody = document.getElementById("projections-table-body");
    tbody.innerHTML = "";

    proj.timeline.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${row.age} tuổi</strong> ${row.isRetired ? '<span class="summary-status">Hưu</span>' : ''}</td>
        <td>${window.RetirementEngine.formatCurrency(row.income, state.currency)}</td>
        <td class="text-danger">${window.RetirementEngine.formatCurrency(row.expenses, state.currency)}</td>
        <td class="${row.netCashFlow >= 0 ? 'text-success' : 'text-warning'} font-mono">${window.RetirementEngine.formatCurrency(row.netCashFlow, state.currency)}</td>
        <td class="text-accent">+${(row.isRetired ? getActivePlan().investmentReturnPost : getActivePlan().investmentReturnPre)}%</td>
        <td class="text-faint">${window.RetirementEngine.formatCurrency(row.tax, state.currency)}</td>
        <td class="font-mono"><strong>${window.RetirementEngine.formatCurrency(row.portfolioEnd, state.currency)}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // -------------------------------------------------------------
  // TAB 2: Withdrawal Strategy Comparison
  // -------------------------------------------------------------
  function renderWithdrawalComparison() {
    try {
      const plan = getActivePlan();
      const canvas = document.getElementById("chart-withdrawal-comparison");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      const strategies = [
        { key: "bengen_4pct", name: "Quy tắc 4% Cố định (Bengen)", color: "#3b82f6" },
        { key: "guyton_klinger", name: "Lan can Guyton-Klinger", color: "#10b981" },
        { key: "vpw", name: "Tỷ lệ Thay đổi (VPW)", color: "#8b5cf6" },
        { key: "fixed_pct", name: "Tỷ lệ Cố định (Fixed 4%)", color: "#f59e0b" }
      ];

      const datasets = strategies.map(strat => {
        const tempPlan = { ...plan, withdrawalStrategy: strat.key };
        const res = window.RetirementEngine.runProjection(tempPlan);
        return {
          label: strat.name,
          data: res.timeline.map(p => p.portfolioEnd),
          borderColor: strat.color,
          borderWidth: 2.5,
          fill: false,
          pointRadius: 0,
          tension: 0.2
        };
      });

      if (state.charts.withdrawals) {
        state.charts.withdrawals.destroy();
        state.charts.withdrawals = null;
      }

      const currentAge = Number(plan.currentAge) || 29;
      const labels = (datasets[0] && datasets[0].data) 
        ? datasets[0].data.map((_, i) => `Tuổi ${currentAge + i}`)
        : [];

      state.charts.withdrawals = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              display: true,
              position: 'top',
              labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 16 } 
            },
            tooltip: {
              callbacks: {
                label: (item) => ` ${item.dataset.label}: ${window.RetirementEngine.formatCurrency(item.raw, state.currency, false)}`
              }
            }
          },
          scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', maxTicksLimit: 12 } },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: {
                color: '#94a3b8',
                callback: (val) => window.RetirementEngine.formatCurrency(val, state.currency, true)
              }
            }
          }
        }
      });

      // Populate Matrix Cards
      const matrix = document.getElementById("withdrawal-strategy-matrix");
      if (matrix) {
        matrix.innerHTML = strategies.map(s => {
          const p = { ...plan, withdrawalStrategy: s.key };
          const r = window.RetirementEngine.runProjection(p);
          return `
            <div class="strategy-matrix-card">
              <div class="matrix-title" style="color: ${s.color}">${s.name}</div>
              <div class="matrix-stat">Số dư tuổi ${plan.lifeExpectancy || 85}: <strong>${window.RetirementEngine.formatCurrency(r.finalPortfolio, state.currency)}</strong></div>
              <div class="matrix-stat">Độ ổn định dòng tiền: <strong>${s.key === 'bengen_4pct' ? 'Cao' : s.key === 'guyton_klinger' ? 'Rất Cao' : 'Linh hoạt'}</strong></div>
              <div class="matrix-stat">Tỷ lệ sống sót: <strong class="text-success">${r.survived ? '100%' : 'Có rủi ro'}</strong></div>
            </div>
          `;
        }).join("");
      }
    } catch (err) {
      console.error("Lỗi vẽ biểu đồ chiến lược rút tiền:", err);
    }
  }

  // -------------------------------------------------------------
  // TAB 3: Tax & Roth Optimization
  // -------------------------------------------------------------
  function renderTaxTab() {
    const plan = getActivePlan();
    const proj = window.RetirementEngine.runProjection(plan);
    const rothRes = window.TaxOptimizer.planRothConversions(plan, proj);
    const acaRes = window.TaxOptimizer.estimateAcaSubsidies(plan, proj);

    document.getElementById("kpi-tax-savings").innerText = window.RetirementEngine.formatCurrency(rothRes.cumulativeTaxSavings, state.currency);
    document.getElementById("kpi-aca-savings").innerText = window.RetirementEngine.formatCurrency(acaRes.totalSubsidySaved, state.currency);

    const ctx = document.getElementById("chart-tax-optimization").getContext("2d");
    if (state.charts.tax) {
      state.charts.tax.destroy();
    }

    const labels = rothRes.schedule.map(s => `Tuổi ${s.age}`);
    const conversionAmounts = rothRes.schedule.map(s => s.conversionAmount);
    const taxSaved = rothRes.schedule.map(s => s.cumulativeSavings);

    state.charts.tax = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Số tiền Chuyển đổi Roth Hàng năm',
            data: conversionAmounts,
            backgroundColor: 'rgba(99, 102, 241, 0.75)',
            borderRadius: 4
          },
          {
            type: 'line',
            label: 'Thuế Tiết kiệm Tích lũy (Cumulative Saved)',
            data: taxSaved,
            borderColor: '#10b981',
            borderWidth: 3,
            fill: false,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8' } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              callback: (val) => window.RetirementEngine.formatCurrency(val, state.currency, true)
            }
          }
        }
      }
    });
  }

  // -------------------------------------------------------------
  // TAB 4: Monte Carlo Simulation
  // -------------------------------------------------------------
  function renderMonteCarloTab() {
    const plan = getActivePlan();
    const vol = Number(document.getElementById("inp-mc-volatility").value) || 15.0;
    const iters = Number(document.getElementById("inp-mc-iterations").value) || 1000;

    const res = window.MonteCarloSimulator.runSimulation(plan, iters, vol);

    document.getElementById("mc-display-success").innerText = res.successRate + "%";
    document.getElementById("mc-stat-p10").innerText = window.RetirementEngine.formatCurrency(res.p10[res.p10.length - 1], state.currency);
    document.getElementById("mc-stat-p50").innerText = window.RetirementEngine.formatCurrency(res.p50[res.p50.length - 1], state.currency);
    document.getElementById("mc-stat-p90").innerText = window.RetirementEngine.formatCurrency(res.p90[res.p90.length - 1], state.currency);

    const ctx = document.getElementById("chart-monte-carlo").getContext("2d");
    if (state.charts.mc) {
      state.charts.mc.destroy();
    }

    state.charts.mc = new Chart(ctx, {
      type: 'line',
      data: {
        labels: res.ageAxis.map(a => `Tuổi ${a}`),
        datasets: [
          {
            label: '90th Percentile (Thị trường Bùng nổ)',
            data: res.p90,
            borderColor: 'rgba(16, 185, 129, 0.4)',
            borderWidth: 1,
            pointRadius: 0
          },
          {
            label: '75th Percentile',
            data: res.p75,
            borderColor: 'rgba(59, 130, 246, 0.4)',
            borderWidth: 1,
            pointRadius: 0
          },
          {
            label: '50th Percentile (Trung vị Kỳ vọng)',
            data: res.p50,
            borderColor: '#10b981',
            borderWidth: 3,
            pointRadius: 0
          },
          {
            label: '25th Percentile',
            data: res.p25,
            borderColor: 'rgba(245, 158, 11, 0.4)',
            borderWidth: 1,
            pointRadius: 0
          },
          {
            label: '10th Percentile (Thị trường Gấu / Khủng hoảng)',
            data: res.p10,
            borderColor: '#ef4444',
            borderWidth: 2,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8' } }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              callback: (val) => window.RetirementEngine.formatCurrency(val, state.currency, true)
            }
          }
        }
      }
    });
  }

  // -------------------------------------------------------------
  // TAB 5: What-If Scenarios
  // -------------------------------------------------------------
  function renderScenarioTab() {
    const plan = getActivePlan();
    const evaluation = window.ScenarioManager.evaluateScenario(plan, state.activeScenario);

    document.getElementById("scenario-chart-title").innerText = evaluation.meta.title;
    document.getElementById("scenario-chart-desc").innerText = evaluation.meta.desc;
    document.getElementById("scenario-report-content").innerHTML = `
      <div style="margin-bottom: 0.75rem;">${evaluation.meta.assessment}</div>
      <div style="font-size: 0.82rem; color: #94a3b8;">
        Chênh lệch tài sản cuối kỳ so với cơ sở: 
        <strong class="${evaluation.netWorthDiff >= 0 ? 'text-success' : 'text-danger'} font-mono">
          ${evaluation.netWorthDiff >= 0 ? '+' : ''}${window.RetirementEngine.formatCurrency(evaluation.netWorthDiff, state.currency)}
        </strong>
      </div>
    `;

    const ctx = document.getElementById("chart-scenarios").getContext("2d");
    if (state.charts.scenarios) {
      state.charts.scenarios.destroy();
    }

    state.charts.scenarios = new Chart(ctx, {
      type: 'line',
      data: {
        labels: evaluation.baselineProjection.timeline.map(p => `Tuổi ${p.age}`),
        datasets: [
          {
            label: 'Kịch bản Cơ sở (Baseline)',
            data: evaluation.baselineProjection.timeline.map(p => p.portfolioEnd),
            borderColor: '#94a3b8',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0
          },
          {
            label: evaluation.meta.title,
            data: evaluation.stressProjection.timeline.map(p => p.portfolioEnd),
            borderColor: evaluation.netWorthDiff >= 0 ? '#10b981' : '#f43f5e',
            borderWidth: 3,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              callback: (val) => window.RetirementEngine.formatCurrency(val, state.currency, true)
            }
          }
        }
      }
    });
  }

  // -------------------------------------------------------------
  // TAB 6: Estate & Spending Smile
  // -------------------------------------------------------------
  function renderEstateTab() {
    const plan = getActivePlan();
    const proj = window.RetirementEngine.runProjection(plan);

    const ctx = document.getElementById("chart-spending-smile").getContext("2d");
    if (state.charts.smile) {
      state.charts.smile.destroy();
    }

    const retireAges = proj.timeline.filter(p => p.isRetired);
    state.charts.smile = new Chart(ctx, {
      type: 'line',
      data: {
        labels: retireAges.map(p => `Tuổi ${p.age}`),
        datasets: [{
          label: `Chi tiêu Thực tế Điều chỉnh (Spending Smile - ${window.RetirementEngine.getCurrencySymbol(state.currency)})`,
          data: retireAges.map(p => p.expenses),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              callback: (val) => window.RetirementEngine.formatCurrency(val, state.currency, true)
            }
          }
        }
      }
    });

    const milestoneBox = document.getElementById("estate-milestone-box");
    const target = plan.targetLegacy || 1000000000;
    const finalVal = proj.finalPortfolio;
    const pct = Math.round((finalVal / target) * 100);

    milestoneBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span>Tiến độ Di sản / Thừa kế:</span>
        <strong class="${pct >= 100 ? 'text-success' : 'text-warning'} font-mono">${pct}% Mục tiêu</strong>
      </div>
      <div style="background: rgba(255,255,255,0.06); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 0.75rem;">
        <div style="width: ${Math.min(100, pct)}%; height: 100%; background: var(--primary);"></div>
      </div>
      <p style="font-size: 0.8rem; color: #94a3b8;">
        Dự kiến tài sản để lại ở tuổi ${plan.lifeExpectancy}: <strong>${window.RetirementEngine.formatCurrency(finalVal, state.currency)}</strong> (Mục tiêu: ${window.RetirementEngine.formatCurrency(target, state.currency)}).
      </p>
    `;
  }

  // -------------------------------------------------------------
  // TAB 7: AI Advisor & Recommendations
  // -------------------------------------------------------------
  function renderAdvisorTab() {
    const plan = getActivePlan();
    const proj = window.RetirementEngine.runProjection(plan);
    const roth = window.TaxOptimizer.planRothConversions(plan, proj);

    document.getElementById("advisor-score-num").innerText = proj.readinessScore;
    document.getElementById("advisor-score-verdict").innerText = 
      proj.readinessScore >= 90 ? "Sẵn sàng Tuyệt vời" :
      proj.readinessScore >= 75 ? "Kế hoạch Khả thi" : "Cần Tối ưu thêm";

    const recommendationsContainer = document.getElementById("advisor-recommendations");

    let recs = [];
    const isFrancoViet = plan.taxRegime === 'france_vietnam' || plan.currency === 'EUR' || plan.id === 'plan_franco_viet';

    if (isFrancoViet) {
      recs = [
        {
          tag: "tag-opportunity",
          title: "🌍 Geo-arbitrage: Nghỉ hưu sớm hơn 12 năm nhờ Chênh lệch Sức mua",
          text: `Bạn tích lũy thu nhập bằng EUR (€) tại Pháp nhưng sẽ chi tiêu bằng VND (₫) tại Việt Nam. Chi phí sống sung túc tại VN (~30 triệu ₫/tháng ≈ 1,100 €) chỉ bằng 1/3 chi phí tại Pháp. Nhờ đó, số tiền cần để đạt FIRE giảm ngoạn mục từ 800,000 € xuống chỉ còn khoảng 300,000 € - 330,000 €! Bạn hoàn toàn có thể FIRE ở tuổi 40-42.`,
          action: "Xem dự báo Dòng tiền →",
          targetTab: "tab-projections"
        },
        {
          tag: "tag-strategy",
          title: "🇫🇷 Tối ưu Tài khoản PEA (Plan d'Épargne en Actions - Trần 150k€)",
          text: `Tận dụng tối đa hạn mức PEA 150,000 € vào các quỹ ETF tích lũy toàn cầu (MSCI World CW8 / S&P 500). Theo luật thuế Pháp từ 2012, khi chuyển cư trú thuế về Việt Nam, bạn vẫn ĐƯỢC PHÉP GIỮ NGUYÊN tài khoản PEA tại ngân hàng/broker Pháp (BoursoBank, Fortuneo) mà không bị ép đóng tài khoản!`,
          action: "Xem tab Tối ưu Thuế →",
          targetTab: "tab-taxes"
        },
        {
          tag: "tag-opportunity",
          title: "💶 Lương hưu Pháp (Agirc-Arrco & CNAV) không hề bị mất",
          text: `Số quý (trimestres) bạn đóng góp tại Pháp từ 23 đến 42 tuổi (~76 quý) sẽ được bảo lưu. Khi bạn bước sang tuổi 65, quỹ hưu trí Pháp sẽ chi trả lương hưu quốc tế hàng tháng (ước tính 500 - 800 €/tháng), gửi trực tiếp vào tài khoản ngân hàng của bạn tại Việt Nam.`,
          action: "Xem Dòng tiền Hưu trí →",
          targetTab: "tab-projections"
        },
        {
          tag: "tag-critical",
          title: "📜 Hiệp định Tránh Đánh thuế Hai lần (France-Vietnam Tax Treaty)",
          text: `Khi về Việt Nam sinh sống trên 183 ngày/năm, bạn trở thành cư dân thuế Việt Nam. Nhờ Hiệp định Tránh đánh thuế 2 lần (Convention Fiscale 1992), bạn không bị Pháp đánh thuế kép trên các khoản thu nhập đầu tư quốc tế.`,
          action: "Xem tab Tối ưu Thuế →",
          targetTab: "tab-taxes"
        }
      ];
    } else {
      recs = [
        {
          tag: "tag-opportunity",
          title: "Cửa sổ Vàng Chuyển đổi Roth (Roth Conversion Window)",
          text: `Từ năm ${plan.retirementAge} đến 65 tuổi, thu nhập chịu thuế của bạn giảm mạnh. Chuyển đổi mỗi năm ${window.RetirementEngine.formatCurrency(plan.rothConversion?.maxAnnualConversion || 200000000, state.currency)} sẽ tiết kiệm được ${window.RetirementEngine.formatCurrency(roth.cumulativeTaxSavings, state.currency)} tiền thuế trọn đời.`,
          action: "Xem tab Tối ưu Thuế →",
          targetTab: "tab-taxes"
        },
        {
          tag: "tag-strategy",
          title: "Áp dụng Lan can Guyton-Klinger để chống Lạm phát",
          text: `Thay vì rút cố định 4% cứng nhắc, chiến lược Guyton-Klinger giúp bạn rút tiền nhiều hơn khi thị trường thăng hoa và tự động phòng vệ khi thị trường điều chỉnh.`,
          action: "Xem tab Chiến lược Rút tiền →",
          targetTab: "tab-withdrawals"
        },
        {
          tag: "tag-critical",
          title: "Quỹ Dự phòng 2 Năm Tiền mặt (Cash Buffer)",
          text: `Để vô hiệu hóa rủi ro Sequence of Returns Risk, bạn nên duy trì 2 năm chi tiêu (${window.RetirementEngine.formatCurrency(plan.retirementExpenses * 2, state.currency)}) ở dạng tiền gửi linh hoạt hoặc trái phiếu ngắn hạn.`,
          action: "Xem mô phỏng Monte Carlo →",
          targetTab: "tab-insights"
        },
        {
          tag: "tag-opportunity",
          title: "Mô hình Chi tiêu Spending Smile Giảm áp lực",
          text: `Nhu cầu chi tiêu ở độ tuổi 70-80 thường giảm 15-20% so với độ tuổi 45-60. Điều này giúp hạ thấp số tiền mục tiêu cần tích lũy đi đáng kể.`,
          action: "Xem Chi tiêu Smile →",
          targetTab: "tab-estate"
        }
      ];
    }

    recommendationsContainer.innerHTML = recs.map(r => `
      <div class="advisor-card" data-tab="${r.targetTab}" role="button" tabindex="0" title="Nhấp để ${r.action}">
        <span class="advisor-card-tag ${r.tag}">${r.tag.replace('tag-', '').toUpperCase()}</span>
        <h4 class="advisor-card-title">${r.title}</h4>
        <p class="advisor-card-text">${r.text}</p>
        <button type="button" class="advisor-card-action btn-advisor-action" data-tab="${r.targetTab}">${r.action}</button>
      </div>
    `).join("");

    recommendationsContainer.querySelectorAll(".advisor-card").forEach(card => {
      card.addEventListener("click", () => {
        const tab = card.getAttribute("data-tab");
        if (tab) switchTab(tab);
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const tab = card.getAttribute("data-tab");
          if (tab) switchTab(tab);
        }
      });
    });
  }

  // -------------------------------------------------------------
  // Compare Mode
  // -------------------------------------------------------------
  function toggleCompareMode() {
    state.compareMode = !state.compareMode;
    const section = document.getElementById("compare-section");
    const btn = document.getElementById("btn-toggle-compare");

    section.style.display = state.compareMode ? "block" : "none";
    btn.classList.toggle("active", state.compareMode);

    if (state.compareMode) {
      renderCompareSection();
    }
  }

  function renderCompareSection() {
    const selectorB = document.getElementById("compare-plan-b-selector");
    const planKeys = Object.keys(state.plansData.plans);

    // Populate compare dropdown if not already populated
    if (selectorB.options.length !== planKeys.length) {
      selectorB.innerHTML = planKeys.map(k => `
        <option value="${k}" ${k !== state.plansData.activePlanId ? 'selected' : ''}>${state.plansData.plans[k].name}</option>
      `).join("");
    }

    const planA = getActivePlan();
    const planBKey = selectorB.value || planKeys.find(k => k !== state.plansData.activePlanId) || planKeys[0];
    const planB = state.plansData.plans[planBKey];

    document.getElementById("compare-title-a").innerText = `Kế hoạch A: ${planA.name}`;
    const comp = window.ScenarioManager.compareTwoPlans(planA, planB);

    function formatStats(p) {
      return `
        <div class="compare-row"><span>Tuổi nghỉ hưu:</span> <strong>${p.retireAge} tuổi</strong></div>
        <div class="compare-row"><span>Thời gian tích lũy:</span> <strong>${p.yearsToFIRE} năm</strong></div>
        <div class="compare-row"><span>Tài sản lúc nghỉ hưu:</span> <strong>${window.RetirementEngine.formatCurrency(p.peakNetWorth, state.currency)}</strong></div>
        <div class="compare-row"><span>Chi tiêu an toàn/năm:</span> <strong>${window.RetirementEngine.formatCurrency(p.safeAnnualSpend, state.currency)}</strong></div>
        <div class="compare-row"><span>Tài sản cuối đời (85t):</span> <strong>${window.RetirementEngine.formatCurrency(p.finalPortfolio, state.currency)}</strong></div>
        <div class="compare-row"><span>Điểm sẵn sàng FIRE:</span> <strong class="text-accent">${p.fireScore}%</strong></div>
      `;
    }

    document.getElementById("compare-stats-a").innerHTML = formatStats(comp.planA);
    document.getElementById("compare-stats-b").innerHTML = formatStats(comp.planB);
  }

  // -------------------------------------------------------------
  // Plan Management & Modal
  // -------------------------------------------------------------
  function renderPlanSelector() {
    const sel = document.getElementById("plan-selector");
    sel.innerHTML = Object.entries(state.plansData.plans).map(([id, p]) => `
      <option value="${id}" ${id === state.plansData.activePlanId ? 'selected' : ''}>${p.name}</option>
    `).join("");
  }

  function openModal(title) {
    document.getElementById("plan-modal-title").innerText = title;
    document.getElementById("inp-new-plan-name").value = "";
    document.getElementById("plan-modal").style.display = "flex";
  }

  function closeModal() {
    document.getElementById("plan-modal").style.display = "none";
  }

  function saveNewPlanFromModal() {
    const nameInput = document.getElementById("inp-new-plan-name").value.trim();
    if (!nameInput) {
      alert("Vui lòng nhập tên kế hoạch!");
      return;
    }

    const templateType = document.getElementById("inp-new-plan-template").value;
    const newId = "plan_" + Date.now();
    let newPlan = JSON.parse(JSON.stringify(getActivePlan()));
    newPlan.id = newId;
    newPlan.name = nameInput;

    if (templateType === "lean") {
      newPlan.retirementExpenses *= 0.65;
      newPlan.initialWithdrawalRate = 3.5;
    } else if (templateType === "fat") {
      newPlan.retirementExpenses *= 1.5;
      newPlan.annualSavings *= 1.3;
    }

    state.plansData.plans[newId] = newPlan;
    state.plansData.activePlanId = newId;
    savePlansToStorage();
    closeModal();
    renderPlanSelector();
    renderActivePlanInputs();
    updateAll();
  }

  function duplicateCurrentPlan() {
    const cur = getActivePlan();
    const newId = "plan_" + Date.now();
    const clone = JSON.parse(JSON.stringify(cur));
    clone.id = newId;
    clone.name = cur.name + " (Bản sao)";

    state.plansData.plans[newId] = clone;
    state.plansData.activePlanId = newId;
    savePlansToStorage();
    renderPlanSelector();
    renderActivePlanInputs();
    updateAll();
  }

  function deleteCurrentPlan() {
    const planKeys = Object.keys(state.plansData.plans);
    if (planKeys.length <= 1) {
      alert("Bạn phải giữ lại ít nhất một kế hoạch hưu trí, không thể xóa tất cả!");
      return;
    }

    const cur = getActivePlan();
    if (!confirm(`Bạn có chắc chắn muốn xóa kế hoạch "${cur.name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    delete state.plansData.plans[cur.id];
    const remainingKeys = Object.keys(state.plansData.plans);
    state.plansData.activePlanId = remainingKeys[0];
    state.currency = getActivePlan().currency || 'EUR';

    savePlansToStorage();
    renderPlanSelector();
    renderActivePlanInputs();
    updateAll();
  }

  function handleJSONImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData && importedData.plans) {
          state.plansData = importedData;
          savePlansToStorage();
          renderPlanSelector();
          renderActivePlanInputs();
          updateAll();
          alert("Nhập kế hoạch thành công!");
        } else {
          alert("File JSON không đúng cấu trúc của pyRetrait.");
        }
      } catch (err) {
        alert("Lỗi đọc file JSON: " + err.message);
      }
    };
    reader.readAsText(file);
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

    if (plan.rothConversion && plan.rothConversion.maxAnnualConversion) {
      plan.rothConversion.maxAnnualConversion = roundAmt(plan.rothConversion.maxAnnualConversion);
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
    document.getElementById("btn-view-nominal").classList.toggle("active", mode === "nominal");
    document.getElementById("btn-view-real").classList.toggle("active", mode === "real");
    updateAll();
  }

  function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    const nextTheme = isDark ? "light" : "dark";
    html.setAttribute("data-theme", nextTheme);
    document.getElementById("theme-icon").innerText = nextTheme === "dark" ? "🌙" : "☀️";
    localStorage.setItem("pyRetrait_theme", nextTheme);
  }

  function loadTheme() {
    const saved = localStorage.getItem("pyRetrait_theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    const icon = document.getElementById("theme-icon");
    if (icon) icon.innerText = saved === "dark" ? "🌙" : "☀️";
  }

})();
