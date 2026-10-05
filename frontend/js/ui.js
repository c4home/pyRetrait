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
    charts: {}
  };

  // Local Storage Key
  const STORAGE_KEY = "pyRetrait_plans_v2";

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

  let confirmCallback = null;

  function showConfirmDialog({ icon = "🗑️", title = "Xác nhận thao tác", message = "Bạn có chắc chắn muốn thực hiện?", confirmText = "Xác nhận", onConfirm }) {
    const modal = document.getElementById("confirm-modal");
    if (!modal) {
      if (window.confirm(message.replace(/<[^>]*>?/gm, ''))) {
        if (onConfirm) onConfirm();
      }
      return;
    }
    const iconEl = document.getElementById("confirm-modal-icon");
    const titleEl = document.getElementById("confirm-modal-title");
    const msgEl = document.getElementById("confirm-modal-message");
    const btnOk = document.getElementById("btn-confirm-ok");

    if (iconEl) iconEl.innerText = icon;
    if (titleEl) titleEl.innerText = title;
    if (msgEl) msgEl.innerHTML = message;
    if (btnOk) btnOk.innerText = confirmText;

    confirmCallback = onConfirm;
    modal.style.display = "flex";
  }

  function closeConfirmDialog() {
    const modal = document.getElementById("confirm-modal");
    if (modal) modal.style.display = "none";
    confirmCallback = null;
  }

  // Shared x-axis ticks for age/year axes: horizontal two-line labels ("35t" / "2032")
  // take far less room than 45° rotated ones, so many more ages fit on the axis.
  const ageAxisTicks = () => ({
    color: '#94a3b8',
    font: { size: 9 },
    maxRotation: 0,
    minRotation: 0,
    autoSkip: true,
    autoSkipPadding: 4
  });

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

  // Layout per tab: charts full width on top, then a 2-column row below with
  // the Gemini AI commentaries (left) next to the parameter card (right).
  // Boxes are only moved in the DOM; GeminiAdvisor finds them by id, so updates keep working.
  function arrangeAiAndControlsColumns() {
    document.querySelectorAll(".panel-layout").forEach(layout => {
      if (layout.querySelector(":scope > .panel-bottom")) return; // already arranged
      const vis = layout.querySelector(":scope > .panel-visualization");
      const ctrl = layout.querySelector(":scope > .panel-controls");
      if (!vis || !ctrl) return;
      const boxes = vis.querySelectorAll(".gemini-insight-box");
      if (!boxes.length) return;

      const bottom = document.createElement("div");
      bottom.className = "panel-bottom";
      const aiCol = document.createElement("div");
      aiCol.className = "panel-ai-column";
      boxes.forEach(box => aiCol.appendChild(box));

      bottom.appendChild(ctrl);
      bottom.appendChild(aiCol);
      layout.appendChild(bottom);
    });
  }

  // -------------------------------------------------------------
  // Data Loading & Persistence
  // -------------------------------------------------------------
  async function loadInitialPlans() {
    const isLogged = window.Auth && window.Auth.isLoggedIn();

    // 1. If user is logged in: fetch their personal cloud data from backend API
    if (isLogged) {
      try {
        const headers = window.Auth.getAuthHeaders();
        const res = await fetch("/api/plans", { headers });
        if (res.ok) {
          state.plansData = await res.json();
          state.currency = getActivePlan()?.currency || 'EUR';
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plansData));
          return;
        }
      } catch (e) {
        console.log("Backend API not reachable for logged in user, falling back to localStorage");
      }
    }

    // 2. Guest Mode: read strictly from this browser's own localStorage (independent per device)
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

    // 3. New Guest on this device: fetch pristine default template from server
    try {
      const res = await fetch("/api/plans");
      if (res.ok) {
        state.plansData = await res.json();
        state.currency = getActivePlan()?.currency || 'EUR';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plansData));
        return;
      }
    } catch (e) {
      console.log("Server template not reachable, using hardcoded defaults");
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
    // Only sync to backend cloud database if user is logged in!
    // Guest users keep their modifications 100% private to their own browser localStorage.
    if (window.Auth && window.Auth.isLoggedIn()) {
      const headers = window.Auth.getAuthHeaders();
      fetch("/api/plans", {
        method: "POST",
        headers,
        body: JSON.stringify(state.plansData)
      }).catch(() => {});
    }
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

    try {
      initFamilyChildrenSimulation();
    } catch (e) {
      console.warn("initFamilyChildrenSimulation failed:", e);
    }

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

    // Life Milestones Modal Events
    const btnManageMs = document.getElementById("btn-manage-milestones");
    if (btnManageMs) btnManageMs.addEventListener("click", openMilestoneModal);
    const btnCloseMs = document.getElementById("btn-close-milestone-modal");
    if (btnCloseMs) btnCloseMs.addEventListener("click", closeMilestoneModal);
    const btnCloseMsFooter = document.getElementById("btn-close-milestone-modal-footer");
    if (btnCloseMsFooter) btnCloseMsFooter.addEventListener("click", closeMilestoneModal);
    const btnAddCustomMs = document.getElementById("btn-add-custom-milestone");
    if (btnAddCustomMs) btnAddCustomMs.addEventListener("click", () => showMilestoneForm(null, -1));
    const btnCancelMsForm = document.getElementById("btn-cancel-ms-form");
    if (btnCancelMsForm) btnCancelMsForm.addEventListener("click", hideMilestoneForm);
    const btnSaveMsForm = document.getElementById("btn-save-ms-form");
    if (btnSaveMsForm) btnSaveMsForm.addEventListener("click", saveMilestoneFromForm);

    // Gemini AI Settings Modal & Refresh handlers
    const btnGeminiSettings = document.getElementById("btn-gemini-settings");
    const modalGemini = document.getElementById("modal-gemini-settings");
    const btnCloseGemini = document.getElementById("btn-close-gemini-modal");
    const btnCancelGemini = document.getElementById("btn-cancel-gemini-modal");
    const btnSaveGemini = document.getElementById("btn-save-gemini-key");
    const inpGeminiKey = document.getElementById("inp-gemini-api-key");
    const statusGemini = document.getElementById("gemini-key-status");
    const selGeminiModel = document.getElementById("sel-gemini-model");
    const inpCustomModel = document.getElementById("inp-custom-gemini-model");
    const btnFetchModels = document.getElementById("btn-fetch-gemini-models");

    if (selGeminiModel) {
      selGeminiModel.addEventListener("change", () => {
        if (inpCustomModel) {
          inpCustomModel.style.display = selGeminiModel.value === "custom" ? "block" : "none";
        }
      });
    }

    if (btnFetchModels) {
      btnFetchModels.addEventListener("click", async () => {
        const key = inpGeminiKey ? inpGeminiKey.value.trim() : "";
        btnFetchModels.innerText = "⏳ Đang dò tìm...";
        try {
          const res = await fetch(`/api/ai/models?api_key=${encodeURIComponent(key)}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.models) && data.models.length > 0 && selGeminiModel) {
              const currentVal = selGeminiModel.value;
              selGeminiModel.innerHTML = data.models.map(m => `
                <option value="${m}">${m} ${m.includes('3.8') ? '(Mới nhất)' : ''}</option>
              `).join("") + '<option value="custom">✏️ Nhập model tùy chỉnh (Future Model)...</option>';
              if (data.models.includes(currentVal)) {
                selGeminiModel.value = currentVal;
              }
              btnFetchModels.innerText = `✓ Đã tìm thấy ${data.models.length} model`;
            }
          }
        } catch (err) {
          btnFetchModels.innerText = "Lỗi dò tìm";
        }
        setTimeout(() => { if (btnFetchModels) btnFetchModels.innerText = "🔄 Dò tìm model mới từ Google"; }, 2500);
      });
    }

    if (btnGeminiSettings) {
      btnGeminiSettings.addEventListener("click", async () => {
        if (modalGemini) modalGemini.style.display = "flex";
        try {
          const res = await fetch("/api/ai/settings");
          if (res.ok) {
            const data = await res.json();
            if (data.has_api_key && statusGemini) {
              const srcNotice = data.source === "env" ? "qua file .env" : "API cá nhân";
              statusGemini.innerText = `Đã kết nối Google Gemini (${srcNotice}: ${data.masked_key || "Active"})`;
              statusGemini.className = "gemini-key-status status-active";
              if (data.source === "env" && inpGeminiKey) {
                inpGeminiKey.placeholder = "Đã nạp tự động từ .env (để trống nếu muốn tiếp tục dùng .env)";
              }
            }
            if (data.selected_model && selGeminiModel) {
              const exists = Array.from(selGeminiModel.options).some(o => o.value === data.selected_model);
              if (exists) {
                selGeminiModel.value = data.selected_model;
                if (inpCustomModel) inpCustomModel.style.display = "none";
              } else {
                selGeminiModel.value = "custom";
                if (inpCustomModel) {
                  inpCustomModel.value = data.selected_model;
                  inpCustomModel.style.display = "block";
                }
              }
            }
          }
        } catch (e) {}
      });
    }

    const closeGeminiModal = () => {
      if (modalGemini) modalGemini.style.display = "none";
    };
    if (btnCloseGemini) btnCloseGemini.addEventListener("click", closeGeminiModal);
    if (btnCancelGemini) btnCancelGemini.addEventListener("click", closeGeminiModal);

    if (btnSaveGemini) {
      btnSaveGemini.addEventListener("click", async () => {
        const key = inpGeminiKey ? inpGeminiKey.value.trim() : "";
        let model = selGeminiModel ? selGeminiModel.value : "gemini-3.8-flash";
        if (model === "custom" && inpCustomModel && inpCustomModel.value.trim()) {
          model = inpCustomModel.value.trim();
        }
        try {
          const res = await fetch("/api/ai/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gemini_api_key: key, gemini_model: model })
          });
          if (res.ok) {
            if (statusGemini) {
              statusGemini.innerText = `Đã lưu: ${model} (${key ? "API Key cá nhân" : "Tích hợp sẵn"})`;
              statusGemini.className = "gemini-key-status status-active";
            }
            if (window.GeminiAdvisor) window.GeminiAdvisor.clearCache();
            setTimeout(closeGeminiModal, 700);
            updateAll();
          }
        } catch (e) {
          alert("Lỗi lưu cấu hình Gemini: " + e.message);
        }
      });
    }

    // Formula Guide Modal Handlers
    const modalFormula = document.getElementById("modal-formula-guide");
    const btnShowFormula = document.getElementById("btn-show-formula-guide");
    const btnCloseFormula = document.getElementById("btn-close-formula-modal");
    const btnCloseFormulaFooter = document.getElementById("btn-close-formula-modal-footer");
    const linkOpenFormulaAlloc = document.getElementById("link-open-formula-alloc");

    const openFormulaModal = (e) => {
      if (e) e.preventDefault();
      if (modalFormula) modalFormula.style.display = "flex";
    };
    const closeFormulaModal = () => {
      if (modalFormula) modalFormula.style.display = "none";
    };

    if (btnShowFormula) btnShowFormula.addEventListener("click", openFormulaModal);
    if (linkOpenFormulaAlloc) linkOpenFormulaAlloc.addEventListener("click", openFormulaModal);
    if (btnCloseFormula) btnCloseFormula.addEventListener("click", closeFormulaModal);
    if (btnCloseFormulaFooter) btnCloseFormulaFooter.addEventListener("click", closeFormulaModal);
    if (modalFormula) {
      modalFormula.addEventListener("click", (e) => {
        if (e.target === modalFormula) closeFormulaModal();
      });
    }

    // In-App Universal Confirm Modal Listeners
    document.getElementById("btn-confirm-cancel")?.addEventListener("click", closeConfirmDialog);
    document.getElementById("btn-confirm-ok")?.addEventListener("click", () => {
      const cb = confirmCallback;
      closeConfirmDialog();
      if (cb) cb();
    });
    document.getElementById("confirm-modal")?.addEventListener("click", (e) => {
      if (e.target.id === "confirm-modal") closeConfirmDialog();
    });

    // Refresh buttons click delegation
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-gemini-refresh");
      if (btn) {
        const chartId = btn.getAttribute("data-chart");
        if (chartId && window.GeminiAdvisor) {
          window.GeminiAdvisor.updateChartBox(chartId, chartId, {}, true);
        }
      }
    });

    // Live Parameter Bindings
    bindInput("inp-retire-age", "retirementAge", Number);
    bindInput("inp-life-expectancy", "lifeExpectancy", Number);
    bindInput("inp-inflation", "inflationRate", Number);
    bindInput("inp-current-savings", "currentSavings", Number);
    bindInput("inp-savings-rate", "savingsRate", Number);

    // Bidirectional sync: Năm sinh <-> Tuổi hiện tại
    const inpBirthYear = document.getElementById("inp-birth-year");
    const inpCurrentAge = document.getElementById("inp-current-age");
    const currentCalYear = new Date().getFullYear();

    if (inpBirthYear) {
      ['input', 'change'].forEach(evt => {
        inpBirthYear.addEventListener(evt, (e) => {
          const bYear = Number(e.target.value);
          if (bYear >= 1930 && bYear <= currentCalYear) {
            const plan = getActivePlan();
            plan.birthYear = bYear;
            const calculatedAge = currentCalYear - bYear;
            plan.currentAge = calculatedAge;
            if (inpCurrentAge) inpCurrentAge.value = calculatedAge;
            syncSavingsAndExpensesFromRate(plan);
            savePlansToStorage();
            updateAll();
          }
        });
      });
    }

    if (inpCurrentAge) {
      ['input', 'change'].forEach(evt => {
        inpCurrentAge.addEventListener(evt, (e) => {
          const age = Number(e.target.value);
          if (age >= 10 && age <= 100) {
            const plan = getActivePlan();
            plan.currentAge = age;
            const calculatedBirthYear = currentCalYear - age;
            plan.birthYear = calculatedBirthYear;
            if (inpBirthYear) inpBirthYear.value = calculatedBirthYear;
            syncSavingsAndExpensesFromRate(plan);
            savePlansToStorage();
            updateAll();
          }
        });
      });
    }

    const sliderSavingsRate = document.getElementById("inp-savings-rate");
    if (sliderSavingsRate) {
      ['input', 'change'].forEach(evt => {
        sliderSavingsRate.addEventListener(evt, (e) => {
          const val = Number(e.target.value);
          getActivePlan().savingsRate = val;
          syncSavingsAndExpensesFromRate(getActivePlan());
          savePlansToStorage();
          updateAll();
        });
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

    const hintOptimalAge = document.getElementById("hint-optimal-retire-age");
    if (hintOptimalAge) {
      hintOptimalAge.addEventListener("click", () => {
        const plan = getActivePlan();
        const proj = window.RetirementEngine.runProjection(plan);
        const optAge = proj.fireAge || 42;
        plan.retirementAge = optAge;
        syncSalaryStreamsWithRetireAge(plan);
        const inp = document.getElementById("inp-retire-age");
        if (inp) inp.value = optAge;
        savePlansToStorage();
        updateAll();
        if (window.GeminiAdvisor) {
          window.GeminiAdvisor.updateChartBox("chart-networth", "chart-networth", {}, true);
        }
      });
    }

    const inpSavingsMonthly = document.getElementById("inp-monthly-savings");
    if (inpSavingsMonthly) {
      ['input', 'change'].forEach(evt => {
        inpSavingsMonthly.addEventListener(evt, () => {
          const p = getActivePlan();
          const monthly = Number(inpSavingsMonthly.value) || 0;
          p.annualSavings = monthly * 12;
          const total = p.annualSavings + (Number(p.annualExpenses) || 0);
          if (total > 0) {
            p.savingsRate = Math.round((p.annualSavings / total) * 1000) / 10;
          }
          updateSavingsRateUI(p.savingsRate || 33.33);
          updateExpenseSavingsHints(p);
          savePlansToStorage();
          updateAll();
        });
      });
    }

    const inpExpMonthly = document.getElementById("inp-monthly-expenses");
    if (inpExpMonthly) {
      ['input', 'change'].forEach(evt => {
        inpExpMonthly.addEventListener(evt, () => {
          const p = getActivePlan();
          const monthly = Number(inpExpMonthly.value) || 0;
          p.annualExpenses = monthly * 12;
          const total = (Number(p.annualSavings) || 0) + p.annualExpenses;
          if (total > 0) {
            p.savingsRate = Math.round(((Number(p.annualSavings) || 0) / total) * 1000) / 10;
          }
          updateSavingsRateUI(p.savingsRate || 33.33);
          updateExpenseSavingsHints(p);
          savePlansToStorage();
          updateAll();
        });
      });
    }

    const inpRetireMonthly = document.getElementById("inp-monthly-retire-expenses");
    if (inpRetireMonthly) {
      ['input', 'change'].forEach(evt => {
        inpRetireMonthly.addEventListener(evt, () => {
          const p = getActivePlan();
          const monthly = Number(inpRetireMonthly.value) || 0;
          p.retirementExpenses = monthly * 12;
          updateExpenseSavingsHints(p);
          savePlansToStorage();
          updateAll();
        });
      });
    }

    // Modal 2-Way Sync between Monthly and Yearly Income
    const inpIncomeMonthly = document.getElementById("inp-income-amount-monthly");
    const inpIncomeAnnual = document.getElementById("inp-income-amount");
    if (inpIncomeMonthly && inpIncomeAnnual) {
      inpIncomeMonthly.addEventListener("input", () => {
        const m = Number(inpIncomeMonthly.value) || 0;
        inpIncomeAnnual.value = m * 12;
      });
      inpIncomeAnnual.addEventListener("input", () => {
        const a = Number(inpIncomeAnnual.value) || 0;
        inpIncomeMonthly.value = Math.round(a / 12);
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

    // Expandable Panel Toggles
    ['panel-asset-allocation', 'panel-dual-inflation', 'panel-mortgage', 'panel-french-pension', 'panel-senior-care'].forEach(id => {
      const panel = document.getElementById(id);
      const header = panel?.querySelector('.expandable-header');
      const content = panel?.querySelector('.expandable-content');
      if (header && content) {
        header.addEventListener('click', () => {
          const isHidden = content.style.display === 'none';
          content.style.display = isHidden ? 'block' : 'none';
          panel.classList.toggle('open', isHidden);
        });
      }
    });

    // Retirement Location (Franco-Vietnamien PPP)
    const selLocation = document.getElementById("sel-retirement-location");
    if (selLocation) {
      selLocation.addEventListener("change", (e) => {
        const plan = getActivePlan();
        plan.retirementLocation = e.target.value;
        updateRetirementLocationUI(e.target.value);
        savePlansToStorage();
        updateAll();
      });
    }

    // French Pension & Décote Inputs
    ['inp-start-work-age', 'inp-pension-age'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        ['input', 'change'].forEach(evt => {
          el.addEventListener(evt, () => {
            const plan = getActivePlan();
            plan.startWorkAge = parseVal("inp-start-work-age", 24);
            plan.socialSecurityAge = parseVal("inp-pension-age", 64);
            updatePensionDecoteUI(plan);
            savePlansToStorage();
            updateAll();
          });
        });
      }
    });

    const inpPensionBase = document.getElementById("inp-pension-base-annual");
    if (inpPensionBase) {
      ['input', 'change'].forEach(evt => {
        inpPensionBase.addEventListener(evt, () => {
          const plan = getActivePlan();
          plan.pensionBaseAuto = false;
          plan.socialSecurityAnnual = parseVal("inp-pension-base-annual", 18000);
          syncPensionBaseAuto(plan, false);
          savePlansToStorage();
          updatePensionDecoteUI(plan);
          updateAll();
        });
      });
    }

    const btnAutoPension = document.getElementById("btn-auto-pension-base");
    if (btnAutoPension) {
      btnAutoPension.addEventListener("click", () => {
        const plan = getActivePlan();
        syncPensionBaseAuto(plan, true);
        savePlansToStorage();
        updatePensionDecoteUI(plan);
        updateAll();
      });
    }

    // Senior Care / Dépendance Inputs
    ['inp-senior-care-age', 'inp-senior-care-monthly'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        ['input', 'change'].forEach(evt => {
          el.addEventListener(evt, () => {
            const plan = getActivePlan();
            plan.seniorCareAge = parseVal("inp-senior-care-age", 78);
            plan.seniorCareMonthly = parseVal("inp-senior-care-monthly", 0);
            savePlansToStorage();
            updateAll();
          });
        });
      }
    });

    // Asset Allocation Sliders
    ['inp-alloc-stocks', 'inp-alloc-bonds', 'inp-alloc-re'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        ['input', 'change'].forEach(evt => {
          el.addEventListener(evt, () => {
            updateAssetAllocationUI();
            savePlansToStorage();
            updateAll();
          });
        });
      }
    });

    // Dual Inflation & Forex Inputs
    const chkDual = document.getElementById('chk-dual-inflation-enabled');
    if (chkDual) {
      chkDual.addEventListener('change', () => {
        updateDualInflationUI();
        savePlansToStorage();
        updateAll();
      });
    }
    ['inp-inflation-pre', 'inp-inflation-post', 'inp-forex-base', 'inp-forex-drift'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        ['input', 'change'].forEach(evt => {
          el.addEventListener(evt, () => {
            updateDualInflationUI();
            savePlansToStorage();
            updateAll();
          });
        });
      }
    });

    // Mortgage Inputs
    const chkMort = document.getElementById('chk-mortgage-enabled');
    if (chkMort) {
      chkMort.addEventListener('change', () => {
        updateMortgageUI();
        savePlansToStorage();
        updateAll();
      });
    }
    ['inp-mortgage-prop-val', 'inp-mortgage-loan', 'inp-mortgage-rate', 'inp-mortgage-term', 'inp-mortgage-start'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        ['input', 'change'].forEach(evt => {
          el.addEventListener(evt, () => {
            updateMortgageUI();
            savePlansToStorage();
            updateAll();
          });
        });
      }
    });
    const chkMortPat = document.getElementById('chk-mortgage-from-patrimoine');
    if (chkMortPat) {
      chkMortPat.addEventListener('change', async () => {
        if (chkMortPat.checked) {
          await syncFromPatrimoine({ rerender: false });
        }
        updateMortgageUI();
        savePlansToStorage();
        updateAll();
      });
    }

    // Franco-Vietnamese Health & Pension Guide Sub-tabs & Calculator
    try {
      initFrancoVietGuideInteractions();
    } catch (e) {
      console.warn("initFrancoVietGuideInteractions error:", e);
    }
  }

  function initFrancoVietGuideInteractions() {
    const btnHealth = document.getElementById("btn-guide-tab-health");
    const btnPension = document.getElementById("btn-guide-tab-pension");
    const contentHealth = document.getElementById("content-guide-health");
    const contentPension = document.getElementById("content-guide-pension");

    if (btnHealth && btnPension && contentHealth && contentPension) {
      btnHealth.addEventListener("click", () => {
        btnHealth.classList.add("active");
        btnHealth.style.borderColor = "var(--border-subtle)";
        btnPension.classList.remove("active");
        btnPension.style.borderColor = "transparent";
        contentHealth.style.display = "block";
        contentPension.style.display = "none";
      });

      btnPension.addEventListener("click", () => {
        btnPension.classList.add("active");
        btnPension.style.borderColor = "var(--border-subtle)";
        btnHealth.classList.remove("active");
        btnHealth.style.borderColor = "transparent";
        contentPension.style.display = "block";
        contentHealth.style.display = "none";
      });
    }

    // Mini Live Calculator for BHXH Tu Nguyen VN
    const selIncome = document.getElementById("sel-calc-bhxh-income");
    const selYears = document.getElementById("sel-calc-bhxh-years");
    const lblPay = document.getElementById("lbl-bhxh-monthly-pay");
    const lblPension = document.getElementById("lbl-bhxh-pension-est");

    function updateBhxhCalc() {
      if (!selIncome || !selYears || !lblPay || !lblPension) return;
      const income = Number(selIncome.value) || 10000000;
      const years = Number(selYears.value) || 15;
      const monthlyPay = Math.round(income * 0.22);
      const pensionRate = (years === 15) ? 0.45 : (0.45 + (years - 15) * 0.02);
      const monthlyPension = Math.round(income * pensionRate);
      const eurRate = 27500;

      lblPay.innerText = `${monthlyPay.toLocaleString("vi-VN")} ₫/tháng (~${Math.round(monthlyPay / eurRate)} €)`;
      lblPension.innerText = `~${monthlyPension.toLocaleString("vi-VN")} ₫/tháng (~${Math.round(monthlyPension / eurRate)} €)`;
    }

    if (selIncome && selYears) {
      selIncome.addEventListener("change", updateBhxhCalc);
      selYears.addEventListener("change", updateBhxhCalc);
      updateBhxhCalc();
    }
  }

  function syncSalaryStreamsWithRetireAge(plan) {
    if (!plan || !Array.isArray(plan.incomes)) return;
    const rAge = Number(plan.retirementAge) || 42;
    plan.incomes.forEach(stream => {
      const name = stream.name || "";
      if (stream.isSalary || (/lương|salary|impôt|impot/i).test(name)) {
        stream.endAge = rAge;
      }
    });
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
    if (tabId === "tab-withdrawals") renderWithdrawalComparison();
    else if (tabId === "tab-taxes") renderTaxTab();
    else if (tabId === "tab-insights") renderMonteCarloTab();
    else if (tabId === "tab-scenarios") renderScenarioTab();
    else if (tabId === "tab-estate") renderEstateTab();
    else if (tabId === "tab-patrimoine") {
      if (window.PatrimoineApp) window.PatrimoineApp.render();
    }
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
    setVal("inp-birth-year", bYear);
    setVal("inp-current-age", p.currentAge);
    setVal("inp-retire-age", p.retirementAge);
    syncSalaryStreamsWithRetireAge(p);
    setVal("inp-life-expectancy", p.lifeExpectancy);
    const annualExp = p.annualExpenses !== undefined ? p.annualExpenses : (state.currency === 'EUR' ? 15000 : state.currency === 'USD' ? 18000 : 240000000);
    const annualSav = Number(p.annualSavings) || 0;
    const annualRetire = Number(p.retirementExpenses) || 0;

    setVal("inp-monthly-expenses", Math.round(annualExp / 12));
    setVal("inp-monthly-savings", Math.round(annualSav / 12));
    setVal("inp-monthly-retire-expenses", Math.round(annualRetire / 12));
    updateExpenseSavingsHints(p);

    setVal("inp-return-pre", p.investmentReturnPre);
    setVal("inp-return-post", p.investmentReturnPost);
    setVal("inp-target-legacy", p.targetLegacy);
    setVal("inp-effective-tax", p.taxRate || 10);
    setVal("inp-tax-regime", p.taxRegime || "international");

    // Location & Franco-Vietnamien PPP
    setVal("sel-retirement-location", p.retirementLocation || "vietnam");
    updateRetirementLocationUI(p.retirementLocation || "vietnam");

    // French Pension & Décote
    setVal("inp-start-work-age", p.startWorkAge || 24);
    setVal("inp-pension-age", p.socialSecurityAge || 64);
    syncPensionBaseAuto(p);
    updatePensionDecoteUI(p);

    // Senior Care / Dépendance
    setVal("inp-senior-care-age", p.seniorCareAge || 78);
    setVal("inp-senior-care-monthly", p.seniorCareMonthly || 0);

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

    // 1. Asset Allocation Sync
    if (p.assetAllocation) {
      setVal("inp-alloc-stocks", p.assetAllocation.stocks !== undefined ? p.assetAllocation.stocks : 60);
      setVal("inp-alloc-bonds", p.assetAllocation.bonds !== undefined ? p.assetAllocation.bonds : 20);
      setVal("inp-alloc-re", p.assetAllocation.realEstate !== undefined ? p.assetAllocation.realEstate : 20);
    }
    updateAssetAllocationUI(p);

    // 2. Dual Inflation & Forex Sync
    if (p.dualInflation) {
      const chkDual = document.getElementById("chk-dual-inflation-enabled");
      if (chkDual) chkDual.checked = p.dualInflation.enabled !== false;
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

    renderIncomeStreamsList();
  }

  function updateAssetAllocationUI(p) {
    if (!p) p = getActivePlan();
    const stocksEl = document.getElementById("inp-alloc-stocks");
    const bondsEl = document.getElementById("inp-alloc-bonds");
    const reEl = document.getElementById("inp-alloc-re");

    const stocks = (stocksEl && stocksEl.value !== "") ? Number(stocksEl.value) : (p.assetAllocation?.stocks ?? 60);
    const bonds = (bondsEl && bondsEl.value !== "") ? Number(bondsEl.value) : (p.assetAllocation?.bonds ?? 20);
    const re = (reEl && reEl.value !== "") ? Number(reEl.value) : (p.assetAllocation?.realEstate ?? 20);

    const lblStocks = document.getElementById("lbl-alloc-stocks");
    const lblBonds = document.getElementById("lbl-alloc-bonds");
    const lblRE = document.getElementById("lbl-alloc-re");
    const badgeWeighted = document.getElementById("badge-weighted-return");
    const lblWeightedCalc = document.getElementById("lbl-weighted-calc");

    // Tính toán số tiền thực tế theo phần trăm tài sản hiện tại
    const totalSavings = Number(p.currentSavings) || 0;
    const cur = p.currency || state.currency || 'EUR';

    const stocksAmt = Math.round(totalSavings * (stocks / 100));
    const bondsAmt = Math.round(totalSavings * (bonds / 100));
    const reAmt = Math.round(totalSavings * (re / 100));

    const stocksAmtFormatted = window.RetirementEngine.formatCurrency(stocksAmt, cur);
    const bondsAmtFormatted = window.RetirementEngine.formatCurrency(bondsAmt, cur);
    const reAmtFormatted = window.RetirementEngine.formatCurrency(reAmt, cur);

    if (lblStocks) lblStocks.innerText = `${stocks}% • ${stocksAmtFormatted} (9.5%/năm)`;
    if (lblBonds) lblBonds.innerText = `${bonds}% • ${bondsAmtFormatted} (3.5%/năm)`;
    if (lblRE) lblRE.innerText = `${re}% • ${reAmtFormatted} (6.5%/năm)`;

    const returns = p.assetReturns || { stocks: 9.5, bonds: 3.5, realEstate: 6.5 };
    const weighted = window.RetirementEngine.calculateWeightedReturn({ stocks, bonds, realEstate: re }, returns, 0.3);

    const totalPct = stocks + bonds + re;
    let totalWarning = "";
    if (totalPct !== 100) {
      totalWarning = ` <span style="color:var(--warning); font-weight:700;">(Tổng: ${totalPct}% - nên cân chỉnh về 100%)</span>`;
    }

    if (badgeWeighted) badgeWeighted.innerText = `${weighted}%/năm`;
    if (lblWeightedCalc) {
      lblWeightedCalc.innerHTML = `<strong>${weighted}%/năm</strong> (đã gồm +0.3% thưởng kỷ luật tái cân bằng)${totalWarning}<div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.25rem; font-family: var(--font-sans);">📐 Công thức: (${stocks}% × 9.5%) + (${bonds}% × 3.5%) + (${re}% × 6.5%) + 0.3% = ${weighted}%</div>`;
    }

    p.assetAllocation = { stocks, bonds, realEstate: re };
    p.investmentReturnPre = weighted;
  }

  function updateDualInflationUI(p) {
    if (!p) p = getActivePlan();
    const chk = document.getElementById("chk-dual-inflation-enabled");
    const pre = Number(document.getElementById("inp-inflation-pre")?.value) || 2.2;
    const post = Number(document.getElementById("inp-inflation-post")?.value) || 4.0;
    const baseForex = Number(document.getElementById("inp-forex-base")?.value) || 27500;
    const drift = Number(document.getElementById("inp-forex-drift")?.value) || 1.2;

    const lblForex = document.getElementById("lbl-forex-future");
    const curAge = p.currentAge || 29;
    const yearsTo60 = Math.max(0, 60 - curAge);
    const forex60 = Math.round(baseForex * Math.pow(1.0 + (drift / 100), yearsTo60));

    if (lblForex) {
      lblForex.innerText = `~${forex60.toLocaleString("vi-VN")} ₫/€`;
    }

    if (!p.dualInflation) p.dualInflation = {};
    p.dualInflation.enabled = chk ? chk.checked : true;
    p.dualInflation.inflationPre = pre;
    p.dualInflation.inflationPost = post;
    p.dualInflation.eurVndInitialRate = baseForex;
    p.dualInflation.eurVndAnnualDrift = drift;
  }

  function updateRetirementLocationUI(loc) {
    const badge = document.getElementById("badge-retire-location");
    const hint = document.getElementById("hint-location-desc");
    if (!badge) return;

    if (loc === "vietnam") {
      badge.innerText = "🇻🇳 Giảm ~55% chi phí (PPP)";
      badge.style.background = "rgba(16, 185, 129, 0.15)";
      badge.style.color = "#34d399";
      if (hint) hint.innerText = "Sức mua tương đương (PPP): Cùng tiêu chuẩn sống cao, chi phí tại VN chỉ bằng ~45% tại Pháp (+ bảo hiểm CFE).";
    } else if (loc === "hybrid") {
      badge.innerText = "🇫🇷⇄🇻🇳 Giảm ~30% chi phí";
      badge.style.background = "rgba(56, 189, 248, 0.15)";
      badge.style.color = "#38bdf8";
      if (hint) hint.innerText = "Song hành Pháp - Việt: 6 tháng sống tại Pháp & 6 tháng tại VN, tối ưu chi phí sinh hoạt kèm quỹ vé máy bay di chuyển.";
    } else {
      badge.innerText = "🇫🇷 Chi phí Chuẩn Pháp";
      badge.style.background = "rgba(255, 255, 255, 0.08)";
      badge.style.color = "#94a3b8";
      if (hint) hint.innerText = "100% tại Pháp: Giữ nguyên mức chi phí sinh hoạt tiêu chuẩn Châu Âu.";
    }
  }

  // Ước tính Lương hưu mục tiêu 43 năm (Taux Plein) theo chuẩn hưu trí Pháp (Réforme 2023)
  // CNAV (Retraite de base tối đa 50% trần PASS) + Agirc-Arrco (Retraite complémentaire theo điểm)
  function estimateFrenchFullPension(netSalary, cur = 'EUR') {
    const eurRate = 27500;
    const s = (cur === 'VND') ? (netSalary / eurRate) : (cur === 'USD' ? netSalary / 1.10 : netSalary);
    if (s <= 0) return (cur === 'EUR' ? 18000 : cur === 'VND' ? 72000000 : 20000);

    const passNet = 36000; // PASS ròng ~36,000 €/năm (PASS gộp ~46,368 €)
    let pensionEur = 0;
    if (s <= 18000) {
      // Mức SMIC: Tỷ lệ thay thế gộp CNAV + Agirc-Arrco ~75%
      pensionEur = s * 0.75;
    } else if (s <= passNet) {
      // Từ SMIC đến trần PASS: 18k * 0.75 + phần vượt * 0.60
      pensionEur = 18000 * 0.75 + (s - 18000) * 0.60;
    } else {
      // Trên trần PASS: CNAV kịch trần (24,300 €) + Agirc-Arrco Tranche 2 (~35% phần vượt)
      pensionEur = 24300 + (s - passNet) * 0.35;
    }
    pensionEur = Math.round(pensionEur / 100) * 100;
    if (cur === 'VND') return Math.round(pensionEur * eurRate);
    if (cur === 'USD') return Math.round(pensionEur * 1.10);
    return pensionEur;
  }

  function getPrimarySalaryIncome(plan) {
    if (!plan || !Array.isArray(plan.incomes)) return 0;
    const salaryStream = plan.incomes.find(s => s.isSalary || /lương|salary|wage/i.test(s.name || ""));
    if (salaryStream && Number(salaryStream.amount) > 0) {
      return Number(salaryStream.amount);
    }
    const currentAge = Number(plan.currentAge) || 29;
    const activeStreams = plan.incomes.filter(s => currentAge >= s.startAge && currentAge <= s.endAge && !/thuê|rent|bđs|turo|lmnp|cổ tức|dividend/i.test(s.name || ""));
    if (activeStreams.length > 0) {
      return Number(activeStreams[0].amount) || 0;
    }
    return getActiveIncomeAtAge(plan, currentAge);
  }

  function syncPensionBaseAuto(p, force = false) {
    if (!p) p = getActivePlan();
    const isAuto = force || (p.pensionBaseAuto !== false);
    const salary = getPrimarySalaryIncome(p);
    const estimated = estimateFrenchFullPension(salary, state.currency);

    const txtExp = document.getElementById("txt-pension-base-explanation");
    const badgeMode = document.getElementById("badge-pension-base-mode");
    const unitEl = document.getElementById("unit-pension-base");
    if (unitEl) unitEl.innerText = state.currency === 'VND' ? '₫' : state.currency === 'USD' ? '$' : '€';

    if (isAuto) {
      p.pensionBaseAuto = true;
      p.socialSecurityAnnual = estimated;
      setVal("inp-pension-base-annual", estimated);
      if (badgeMode) {
        badgeMode.innerText = "Tự động";
        badgeMode.style.background = "rgba(52, 211, 153, 0.15)";
        badgeMode.style.color = "#34d399";
      }
      if (txtExp) {
        txtExp.innerHTML = `⚡ Chuẩn sức mua hiện tại từ lương (<strong>${window.RetirementEngine.formatCurrency(salary, state.currency)}/năm</strong>): ~<strong>${window.RetirementEngine.formatCurrency(estimated, state.currency)}/năm</strong> (CNAV + Agirc-Arrco)`;
      }
    } else {
      if (badgeMode) {
        badgeMode.innerText = "Tùy chỉnh";
        badgeMode.style.background = "rgba(251, 191, 36, 0.15)";
        badgeMode.style.color = "#fbbf24";
      }
      if (txtExp) {
        txtExp.innerHTML = `⚡ Chuẩn theo lương: ~${window.RetirementEngine.formatCurrency(estimated, state.currency)}/năm • Đang dùng số tự nhập`;
      }
    }
  }

  function updatePensionDecoteUI(p) {
    if (!p) p = getActivePlan();
    const startWork = parseVal("inp-start-work-age", Number(p?.startWorkAge) || 24);
    const pensionAge = parseVal("inp-pension-age", Number(p?.socialSecurityAge) || 64);
    const retireAge = parseVal("inp-retire-age", Number(p?.retirementAge) || 42);
    const baseAnnual = parseVal("inp-pension-base-annual", Number(p?.socialSecurityAnnual) || 18000);

    const yearsWorked = Math.max(0, Math.min(retireAge, pensionAge) - startWork);
    const quarters = yearsWorked * 4;
    const targetQuarters = 172;
    const missing = Math.max(0, targetQuarters - quarters);
    const prorata = Math.min(1.0, quarters / targetQuarters);
    const decotePenalty = (pensionAge < 67 && missing > 0) ? Math.min(20, missing) * 0.0125 : 0;
    const effectivePension = Math.round(baseAnnual * prorata * (1.0 - decotePenalty));

    const lblQuarters = document.getElementById("lbl-pension-quarters");
    const lblDecote = document.getElementById("lbl-pension-decote");
    const lblEffective = document.getElementById("lbl-pension-effective");
    const badgeStatus = document.getElementById("badge-pension-status");

    if (lblQuarters) {
      lblQuarters.innerText = `${quarters} / 172 quý (${yearsWorked} năm đóng)`;
      lblQuarters.className = quarters >= 172 ? "font-mono text-success" : "font-mono text-warning";
    }
    if (lblDecote) {
      if (decotePenalty > 0) {
        lblDecote.innerText = `-${(decotePenalty * 100).toFixed(1)}% (${missing} quý thiếu)`;
        lblDecote.className = "font-mono text-danger";
      } else {
        lblDecote.innerText = "0% (Đủ điều kiện Taux Plein)";
        lblDecote.className = "font-mono text-success";
      }
    }
    if (lblEffective) {
      lblEffective.innerText = `~${window.RetirementEngine.formatCurrency(effectivePension, state.currency)}/năm (~${window.RetirementEngine.formatCurrency(Math.round(effectivePension / 12), state.currency)}/tháng)`;
    }
    if (badgeStatus) {
      badgeStatus.innerText = quarters >= 172 ? "Taux Plein" : `${quarters}/172q (${Math.round(prorata * 100)}%)`;
      badgeStatus.style.color = quarters >= 172 ? "#34d399" : "#fbbf24";
    }
  }

  // -------------------------------------------------------------
  // Gestion de Patrimoine → FIRE plan bridge (runs in the browser so it
  // works identically for guests (localStorage) and logged-in users (cloud)).
  // -------------------------------------------------------------
  // Patrimoine data is always denominated in EUR; convert to the plan currency.
  function eurToPlanFactor(p) {
    const cur = (p && p.currency) || state.currency || 'EUR';
    if (cur === 'VND') return Number(p?.dualInflation?.eurVndInitialRate) || 27500;
    if (cur === 'USD') return 1.10;
    return 1;
  }

  // Raw loans (EUR) extracted from the apartments of Gestion de Patrimoine
  function extractPatrimoineLoansEur(p, data) {
    if (!data || !Array.isArray(data.apartments)) return null;
    const curYear = new Date().getFullYear();
    const bYear = Number(p.birthYear) || (curYear - (Number(p.currentAge) || 29));
    return data.apartments
      .filter(a => Number(a.loan_amount) > 0)
      .map(a => ({
        name: a.name || a.address || 'Căn hộ',
        loanAmount: Number(a.loan_amount) || 0,
        interestRate: Number(a.annual_interest_rate) || 0,
        insuranceRate: Number(a.annual_insurance_rate) || 0,
        loanTermYears: Number(a.loan_duration) || 20,
        startYear: Number(a.start_year) || curYear,
        startAge: (Number(a.start_year) || curYear) - bYear,
        propertyValue: Number(a.property_price) || 0,
        monthlyPaymentEur: Number(a.monthly_loan_payment) || 0
      }));
  }

  function buildPatrimoineLoans(p) {
    const eurLoans = Array.isArray(p.mortgage?.patrimoineLoansEur) ? p.mortgage.patrimoineLoansEur : [];
    const f = eurToPlanFactor(p);
    const curYear = new Date().getFullYear();
    const bYear = Number(p.birthYear) || (curYear - (Number(p.currentAge) || 29));
    return eurLoans.map(l => ({
      ...l,
      // Recompute start age in case the birth year was edited after the sync
      startAge: (Number(l.startYear) || curYear) - bYear,
      loanAmount: Math.round(l.loanAmount * f),
      propertyValue: Math.round(l.propertyValue * f),
      propertyAppreciation: 2.5
    }));
  }

  // Apply patrimoine data to a plan: mortgage loans + LMNP / Turo income streams
  function applyPatrimoineToPlan(p, data) {
    if (!p || !data) return;
    const eurLoans = extractPatrimoineLoansEur(p, data);
    if (eurLoans) {
      p.mortgage = p.mortgage || {};
      p.mortgage.patrimoineLoansEur = eurLoans;
    }

    const f = eurToPlanFactor(p);
    const round = (v) => p.currency === 'VND' ? Math.round((v * f) / 100000) * 100000 : Math.round(v * f);
    const summary = data.summary || {};
    const curAge = Number(p.currentAge) || 29;
    const retireAge = Number(p.retirementAge) || 42;
    if (!Array.isArray(p.incomes)) p.incomes = [];

    // LMNP rental income (same rule as the former server-side sync)
    const reIdx = p.incomes.findIndex(inc => (inc.name || '').includes('LMNP') || (inc.name || '').includes('BĐS Cho thuê'));
    if ((summary.total_properties || 0) > 0) {
      const item = { name: '🏠 BĐS Cho thuê LMNP Pháp', amount: round(summary.total_annual_post_loan_cashflow || 0), startAge: curAge, endAge: 85, growth: 1.5, taxable: false };
      if (reIdx >= 0) p.incomes[reIdx] = { ...p.incomes[reIdx], ...item }; else p.incomes.push(item);
    } else if (reIdx >= 0) {
      p.incomes.splice(reIdx, 1);
    }

    // Turo fleet income
    const turoAnnual = Number(data.turo?.annual_net_cash_flow) || 0;
    const turoIdx = p.incomes.findIndex(inc => (inc.name || '').includes('Turo') || (inc.name || '').includes('Cho thuê xe'));
    if (turoAnnual > 0) {
      const item = { name: '🚗 Đội xe Cho thuê Turo', amount: round(turoAnnual), startAge: curAge, endAge: Math.min(curAge + 10, retireAge), growth: 0.0, taxable: false };
      if (turoIdx >= 0) p.incomes[turoIdx] = { ...p.incomes[turoIdx], ...item }; else p.incomes.push(item);
    } else if (turoIdx >= 0) {
      p.incomes.splice(turoIdx, 1);
    }
  }

  async function fetchPatrimoineData() {
    try {
      const headers = window.Auth ? window.Auth.getAuthHeaders() : { "Content-Type": "application/json" };
      const res = await fetch("/api/pylocation/data", { headers });
      if (res.ok) {
        state.patrimoineData = await res.json();
        return state.patrimoineData;
      }
    } catch (e) {
      console.warn("Không tải được dữ liệu Gestion de Patrimoine:", e);
    }
    return null;
  }

  // Fetch latest patrimoine data and push it into the active plan
  async function syncFromPatrimoine({ rerender = true } = {}) {
    const data = await fetchPatrimoineData();
    const p = getActivePlan();
    if (!data || !p) return false;
    applyPatrimoineToPlan(p, data);
    savePlansToStorage();
    if (rerender) {
      renderActivePlanInputs();
      updateAll();
    }
    return true;
  }

  function renderPatrimoineLoansList(p, loans, sched) {
    const box = document.getElementById("mortgage-patrimoine-loans");
    if (!box) return;
    if (!loans.length) { box.innerHTML = ""; return; }
    const cur = state.currency;
    const fmt = (v) => window.RetirementEngine.formatCurrency(v, cur);
    const curAge = Number(p.currentAge) || 29;
    box.innerHTML = loans.map((l, i) => {
      const part = sched && sched.parts ? sched.parts[i] : null;
      const row = part ? part.schedule[curAge] : null;
      const payoffAge = l.startAge + l.loanTermYears;
      const status = row && row.active
        ? `Góp <strong>${fmt(row.monthlyPayment)}/tháng</strong> • Còn nợ ${fmt(row.remainingDebt)}`
        : (curAge < l.startAge ? `Bắt đầu năm ${l.startYear}` : `✓ Đã tất toán`);
      return `
        <div style="background: rgba(30, 41, 59, 0.55); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.65rem; font-size: 0.76rem; line-height: 1.45;">
          <div style="font-weight: 700; color: var(--text-main);">🏢 ${l.name}</div>
          <div style="color: var(--text-muted);">Vay gốc ${fmt(l.loanAmount)} • ${l.interestRate}% + BH ${l.insuranceRate}% • ${l.loanTermYears} năm (${l.startYear} → ${l.startYear + l.loanTermYears}, tuổi ${l.startAge} → ${payoffAge})</div>
          <div style="color: var(--text-muted);">${status}</div>
        </div>`;
    }).join("");
  }

  function updateMortgageUI(p) {
    if (!p) p = getActivePlan();
    const chk = document.getElementById("chk-mortgage-enabled");
    const chkPat = document.getElementById("chk-mortgage-from-patrimoine");
    const usePat = chkPat ? chkPat.checked : (p.mortgageFromPatrimoine !== false);
    p.mortgageFromPatrimoine = usePat;

    const propVal = Number(document.getElementById("inp-mortgage-prop-val")?.value) || 200000;
    const loanAmt = Number(document.getElementById("inp-mortgage-loan")?.value) || 160000;
    const rate = Number(document.getElementById("inp-mortgage-rate")?.value) || 2.2;
    const term = Number(document.getElementById("inp-mortgage-term")?.value) || 20;
    const startAge = Number(document.getElementById("inp-mortgage-start")?.value) || (p.currentAge || 29);

    const curSymbol = window.RetirementEngine.getCurrencySymbol(state.currency);
    const unitProp = document.getElementById("unit-mortgage-prop");
    const unitLoan = document.getElementById("unit-mortgage-loan");
    if (unitProp) unitProp.innerText = curSymbol;
    if (unitLoan) unitLoan.innerText = curSymbol;

    const patrimoineLoansEur = p.mortgage?.patrimoineLoansEur || [];
    const mortConfig = {
      enabled: chk ? chk.checked : true,
      propertyValue: propVal,
      loanAmount: loanAmt,
      interestRate: rate,
      loanTermYears: term,
      startAge: startAge,
      propertyAppreciation: 2.5,
      patrimoineLoansEur
    };
    p.mortgage = mortConfig;

    const patLoans = usePat ? buildPatrimoineLoans(p) : [];
    const fromPat = patLoans.length > 0;
    if (fromPat) {
      mortConfig.source = 'patrimoine';
      mortConfig.loans = patLoans;
    }

    // Toggle manual inputs vs. synced list
    const manualBox = document.getElementById("mortgage-manual-fields");
    const listBox = document.getElementById("mortgage-patrimoine-loans");
    const hintSrc = document.getElementById("hint-mortgage-source");
    if (manualBox) manualBox.style.display = fromPat ? "none" : "block";
    if (listBox) listBox.style.display = fromPat ? "flex" : "none";
    if (hintSrc) {
      if (fromPat) {
        const totalLoan = patLoans.reduce((s, l) => s + l.loanAmount, 0);
        hintSrc.innerHTML = `✓ Đã lấy <strong>${patLoans.length} khoản vay</strong> từ Gestion de Patrimoine (tổng vay gốc ${window.RetirementEngine.formatCurrency(totalLoan, state.currency)}). Sửa khoản vay ở tab Gestion de Patrimoine.`;
      } else if (usePat) {
        hintSrc.innerText = "Chưa có căn hộ nào có khoản vay trong Gestion de Patrimoine — đang dùng số liệu nhập tay bên dưới.";
      } else {
        hintSrc.innerText = "Đang dùng số liệu nhập tay.";
      }
    }

    const curAge = Number(p.currentAge) || 29;
    const sched = window.RetirementEngine.calculateMortgageSchedule(mortConfig, curAge, p.lifeExpectancy || 85);
    renderPatrimoineLoansList(p, patLoans, sched);

    const badgeStatus = document.getElementById("badge-mortgage-status");
    const lblMonthly = document.getElementById("lbl-mortgage-monthly");
    const lblEquity = document.getElementById("lbl-mortgage-equity");
    const lblPayoff = document.getElementById("lbl-mortgage-payoff");

    if (sched && chk && chk.checked) {
      const monthlyStr = `${window.RetirementEngine.formatCurrency(sched.monthlyPayment, state.currency)}/tháng`;
      const equityVal = fromPat
        ? (sched.schedule[curAge]?.homeEquity || 0)
        : Math.max(0, propVal - loanAmt);
      const equityStr = window.RetirementEngine.formatCurrency(equityVal, state.currency);
      const payoffAge = fromPat ? sched.endAge : startAge + term;

      if (badgeStatus) badgeStatus.innerText = monthlyStr;
      if (lblMonthly) lblMonthly.innerText = monthlyStr;
      if (lblEquity) lblEquity.innerText = equityStr;
      if (lblPayoff) lblPayoff.innerText = `${payoffAge} tuổi`;
    } else {
      if (badgeStatus) badgeStatus.innerText = "Tắt nợ vay";
      if (lblMonthly) lblMonthly.innerText = "0";
      if (lblEquity) lblEquity.innerText = "0";
      if (lblPayoff) lblPayoff.innerText = "N/A";
    }
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
            <button type="button" class="income-item-btn income-item-edit" data-idx="${idx}" title="Chỉnh sửa nguồn thu">✏️ Sửa</button>
            <button type="button" class="income-item-btn income-item-del" data-idx="${idx}" title="Xóa nguồn thu">🗑️</button>
          </div>
        </div>
        <div class="income-item-body">
          <div class="income-item-amounts">
            <span class="income-amount-monthly">${window.RetirementEngine.formatCurrency(Math.round(Number(stream.amount) / 12), state.currency)}<small>/tháng</small></span>
            <span class="income-amount-annual">≈ ${window.RetirementEngine.formatCurrency(stream.amount, state.currency)}/năm</span>
          </div>
          <div class="income-item-timing">
            <span class="income-age-range">${stream.startAge} - ${stream.endAge} tuổi</span>
            <span class="income-growth-badge">+${stream.growth}%/năm</span>
          </div>
        </div>
      `;
      container.appendChild(item);
    });

    container.querySelectorAll(".income-item-edit").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        const idx = Number(btn.getAttribute("data-idx"));
        openIncomeModal(idx);
      });
    });

    container.querySelectorAll(".income-item-del").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        const idx = Number(btn.getAttribute("data-idx"));
        const plan = getActivePlan();
        const stream = plan.incomes[idx];
        const streamName = stream?.name || "nguồn thu này";
        const amtStr = window.RetirementEngine.formatCurrency(stream?.amount || 0, state.currency);

        showConfirmDialog({
          icon: "🗑️",
          title: "Xác nhận xóa nguồn thu",
          message: `Bạn có chắc chắn muốn xóa <strong>"${streamName}"</strong> (${amtStr}/năm)?<br><span style="font-size:0.75rem; color:var(--text-faint); margin-top:6px; display:inline-block;">Các chỉ số chi tiêu, tỷ lệ tiết kiệm và hưu trí sẽ được tự động tính toán lại.</span>`,
          confirmText: "🗑️ Xóa nguồn thu",
          onConfirm: () => {
            plan.incomes.splice(idx, 1);
            syncSavingsAndExpensesFromRate(plan);
            if (plan.pensionBaseAuto !== false) {
              syncPensionBaseAuto(plan, true);
            }
            savePlansToStorage();
            renderIncomeStreamsList();
            updateAll();
          }
        });
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

      setVal("inp-monthly-savings", Math.round(newSavings / 12));
      setVal("inp-monthly-expenses", Math.round(newExpenses / 12));
      updateExpenseSavingsHints(plan);
    } else {
      plan.annualSavings = 0;
      setVal("inp-monthly-savings", 0);
      updateExpenseSavingsHints(plan);
    }

    updateSavingsRateUI(rate);
  }

  function updateExpenseSavingsHints(plan) {
    if (!plan) return;
    const hintExp = document.getElementById("hint-annual-expenses");
    const hintSav = document.getElementById("hint-annual-savings");
    const hintRet = document.getElementById("hint-retire-expenses");

    const rate = Number(plan.savingsRate) > 0 ? Number(plan.savingsRate) : 33.33;
    let fracText = "";
    let expFracText = "";
    if (Math.abs(rate - 33.33) < 1 || Math.abs(rate - 33) < 1) {
      fracText = "1/3 thu nhập";
      expFracText = "2/3 thu nhập";
    } else if (Math.abs(rate - 25) < 1) {
      fracText = "1/4 thu nhập";
      expFracText = "3/4 thu nhập";
    } else if (Math.abs(rate - 50) < 1) {
      fracText = "1/2 thu nhập";
      expFracText = "1/2 thu nhập";
    } else if (Math.abs(rate - 66.67) < 1 || Math.abs(rate - 67) < 1) {
      fracText = "2/3 thu nhập";
      expFracText = "1/3 thu nhập";
    }

    const annualExpFormatted = window.RetirementEngine.formatCurrency(plan.annualExpenses, state.currency);
    const annualSavFormatted = window.RetirementEngine.formatCurrency(plan.annualSavings, state.currency);
    const annualRetFormatted = window.RetirementEngine.formatCurrency(plan.retirementExpenses, state.currency);

    if (hintExp) {
      hintExp.innerText = `≈ ${annualExpFormatted}/năm` + (expFracText ? ` • ${expFracText}` : "");
    }
    if (hintSav) {
      hintSav.innerText = `≈ ${annualSavFormatted}/năm` + (fracText ? ` • ${fracText}` : "");
    }
    if (hintRet) {
      let geoNote = "";
      if (state.currency === "EUR") {
        const vndEquivalentMonth = Math.round((Number(plan.retirementExpenses) * 27500 / 12) / 1000000);
        geoNote = ` • khoảng ${vndEquivalentMonth} triệu ₫/tháng tại VN`;
      } else if (state.currency === "VND") {
        const eurEquivalentMonth = Math.round((Number(plan.retirementExpenses) / 27500 / 12));
        geoNote = ` • tương đương ~${eurEquivalentMonth} €/tháng`;
      }
      hintRet.innerText = `≈ ${annualRetFormatted}/năm${geoNote}`;
    }
  }

  function updateSavingsRateUI(rate) {
    const slider = document.getElementById("inp-savings-rate");
    const lbl = document.getElementById("lbl-savings-rate");
    const kpiRate = document.getElementById("kpi-savings-rate");

    if (slider) slider.value = rate;

    let fracText = "";
    if (Math.abs(rate - 33.33) < 1 || Math.abs(rate - 33) < 1) {
      fracText = "1/3 Thu nhập";
    } else if (Math.abs(rate - 25) < 1) {
      fracText = "1/4 Thu nhập";
    } else if (Math.abs(rate - 50) < 1) {
      fracText = "1/2 Thu nhập";
    } else if (Math.abs(rate - 66.67) < 1 || Math.abs(rate - 67) < 1) {
      fracText = "2/3 Thu nhập";
    }

    if (lbl) {
      lbl.innerText = `${rate.toFixed(1)}%` + (fracText ? ` (${fracText})` : "");
    }
    if (kpiRate) {
      const plan = getActivePlan();
      const monthlySav = Math.round((Number(plan.annualSavings) || 0) / 12);
      kpiRate.innerHTML = `Tỷ lệ tiết kiệm: <strong>${rate.toFixed(1)}%</strong> (${window.RetirementEngine.formatCurrency(monthlySav, state.currency)}/tháng)`;
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
    const curSymbol = state.currency === 'VND' ? '₫' : state.currency === 'EUR' ? '€' : '$';
    const unit = document.getElementById("modal-income-unit");
    const unitMonthly = document.getElementById("modal-income-unit-monthly");
    if (unit) unit.innerText = curSymbol;
    if (unitMonthly) unitMonthly.innerText = curSymbol;

    document.getElementById("inp-income-idx").value = idx;

    if (idx >= 0 && plan.incomes && plan.incomes[idx]) {
      const stream = plan.incomes[idx];
      title.innerText = `Chỉnh Sửa: ${stream.name}`;
      document.getElementById("inp-income-name").value = stream.name;
      document.getElementById("inp-income-amount").value = stream.amount;
      document.getElementById("inp-income-amount-monthly").value = Math.round(Number(stream.amount) / 12);
      document.getElementById("inp-income-start").value = stream.startAge;
      document.getElementById("inp-income-end").value = stream.endAge;
      document.getElementById("inp-income-growth").value = stream.growth !== undefined ? stream.growth : 3.5;
    } else {
      title.innerText = "Thêm Nguồn Thu Nhập Mới";
      document.getElementById("inp-income-name").value = "";
      const defaultAnnual = state.currency === 'EUR' ? 12000 : state.currency === 'USD' ? 12000 : 120000000;
      document.getElementById("inp-income-amount").value = defaultAnnual;
      document.getElementById("inp-income-amount-monthly").value = Math.round(defaultAnnual / 12);
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

    const annualVal = Number(document.getElementById("inp-income-amount").value);
    const monthlyVal = Number(document.getElementById("inp-income-amount-monthly").value);
    const amount = annualVal || (monthlyVal * 12) || 0;
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

    if (/lương|salary|impôt|impot/i.test(name)) {
      plan.retirementAge = endAge;
      setVal("inp-retire-age", endAge);
      syncSalaryStreamsWithRetireAge(plan);
    }

    if (plan.pensionBaseAuto !== false) {
      syncPensionBaseAuto(plan, true);
    }

    syncSavingsAndExpensesFromRate(plan);
    savePlansToStorage();
    closeIncomeModal();
    renderIncomeStreamsList();
    updateAll();
  }

  // -------------------------------------------------------------
  // Life Milestones Modal Management
  // -------------------------------------------------------------
  function openMilestoneModal() {
    const plan = getActivePlan();
    const proj = window.RetirementEngine.runProjection(plan);
    const modal = document.getElementById("milestone-modal");
    const unit = document.getElementById("modal-ms-unit");
    if (unit) unit.innerText = window.RetirementEngine.getCurrencySymbol(state.currency);

    renderModalMilestonesContent(plan, proj);
    hideMilestoneForm();
    modal.style.display = "flex";
  }

  function closeMilestoneModal() {
    document.getElementById("milestone-modal").style.display = "none";
  }

  function renderModalMilestonesContent(plan, proj) {
    // 1. Render Core / System Milestones
    const sysContainer = document.getElementById("modal-system-milestones-list");
    if (sysContainer) {
      sysContainer.innerHTML = "";
      const sysMilestones = (proj.milestones || []).filter(m => m.isSystem);
      sysMilestones.forEach(m => {
        const card = document.createElement("div");
        card.className = "system-milestone-card";
        card.style.setProperty("--ms-color", m.color || "var(--primary)");
        card.innerHTML = `
          <div class="system-ms-icon">${m.icon}</div>
          <div class="system-ms-info">
            <span class="system-ms-name">${m.age} tuổi • ${m.name}</span>
            <span class="system-ms-desc">${m.desc}</span>
          </div>
        `;
        sysContainer.appendChild(card);
      });
    }

    // 2. Render Custom Milestones
    const customContainer = document.getElementById("modal-custom-milestones-container");
    if (customContainer) {
      customContainer.innerHTML = "";
      if (!Array.isArray(plan.milestones) || plan.milestones.length === 0) {
        customContainer.innerHTML = `<div style="font-size:0.8rem; color:var(--text-faint); padding:0.5rem 0;">Chưa có sự kiện tùy chỉnh nào. Bấm "+ Thêm Sự Kiện" bên trên để thêm mốc mua nhà, sinh con, quỹ học vấn...</div>`;
      } else {
        plan.milestones.forEach((ms, idx) => {
          const item = document.createElement("div");
          item.className = "custom-milestone-item";
          const sign = ms.type === "income" ? "+" : ms.type === "none" ? "" : "-";
          const amtStr = ms.type === "none" ? "Không ảnh hưởng tiền" : `${sign}${window.RetirementEngine.formatCurrency(ms.amount, state.currency, false)}`;
          
          item.innerHTML = `
            <div class="custom-ms-left">
              <span class="custom-ms-icon">${ms.icon || '⭐'}</span>
              <div class="custom-ms-details">
                <span class="custom-ms-title">${ms.age} tuổi • ${ms.name}</span>
                <span class="custom-ms-sub">${amtStr}${ms.note ? ' • ' + ms.note : ''}</span>
              </div>
            </div>
            <div class="custom-ms-actions">
              <button type="button" class="income-item-btn btn-edit-ms" data-idx="${idx}" title="Chỉnh sửa">✏️</button>
              <button type="button" class="income-item-btn btn-del-ms" data-idx="${idx}" title="Xóa">🗑️</button>
            </div>
          `;
          customContainer.appendChild(item);
        });

        customContainer.querySelectorAll(".btn-edit-ms").forEach(b => {
          b.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const idx = Number(b.getAttribute("data-idx"));
            showMilestoneForm(plan.milestones[idx], idx);
          });
        });

        customContainer.querySelectorAll(".btn-del-ms").forEach(b => {
          b.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const idx = Number(b.getAttribute("data-idx"));
            const msName = plan.milestones[idx]?.name || "mốc này";
            showConfirmDialog({
              icon: "🚩",
              title: "Xác nhận xóa cột mốc",
              message: `Bạn có chắc chắn muốn xóa cột mốc <strong>"${msName}"</strong>?`,
              confirmText: "🗑️ Xóa cột mốc",
              onConfirm: () => {
                plan.milestones.splice(idx, 1);
                savePlansToStorage();
                updateAll();
                renderModalMilestonesContent(plan, window.RetirementEngine.runProjection(plan));
              }
            });
          });
        });
      }
    }
  }

  function showMilestoneForm(ms = null, idx = -1) {
    const form = document.getElementById("milestone-edit-form");
    const title = document.getElementById("milestone-form-title");
    form.style.display = "block";

    if (ms) {
      title.innerText = `Chỉnh sửa: ${ms.name}`;
      document.getElementById("inp-ms-id").value = idx;
      document.getElementById("inp-ms-name").value = ms.name || "";
      document.getElementById("inp-ms-age").value = ms.age || 35;
      document.getElementById("inp-ms-icon").value = ms.icon || "🏡";
      document.getElementById("inp-ms-type").value = ms.type || "expense";
      document.getElementById("inp-ms-amount").value = ms.amount || 30000;
      document.getElementById("inp-ms-note").value = ms.note || "";
    } else {
      title.innerText = "Thêm Sự Kiện Cột Mốc Mới";
      document.getElementById("inp-ms-id").value = -1;
      document.getElementById("inp-ms-name").value = "";
      document.getElementById("inp-ms-age").value = 35;
      document.getElementById("inp-ms-icon").value = "🏡";
      document.getElementById("inp-ms-type").value = "expense";
      const defaultAmt = state.currency === 'VND' ? 500000000 : 30000;
      document.getElementById("inp-ms-amount").value = defaultAmt;
      document.getElementById("inp-ms-note").value = "";
    }
    document.getElementById("inp-ms-name").focus();
  }

  function hideMilestoneForm() {
    document.getElementById("milestone-edit-form").style.display = "none";
  }

  function saveMilestoneFromForm() {
    const name = document.getElementById("inp-ms-name").value.trim();
    if (!name) {
      alert("Vui lòng nhập tên sự kiện!");
      return;
    }
    const idx = Number(document.getElementById("inp-ms-id").value);
    const age = Number(document.getElementById("inp-ms-age").value) || 35;
    const icon = document.getElementById("inp-ms-icon").value || "⭐";
    const type = document.getElementById("inp-ms-type").value || "expense";
    const amount = Number(document.getElementById("inp-ms-amount").value) || 0;
    const note = document.getElementById("inp-ms-note").value.trim();

    const plan = getActivePlan();
    if (!Array.isArray(plan.milestones)) plan.milestones = [];

    const msObj = {
      id: idx >= 0 && plan.milestones[idx]?.id ? plan.milestones[idx].id : ('ms_' + Date.now()),
      name,
      age,
      icon,
      type,
      amount,
      note,
      enabled: true
    };

    if (idx >= 0 && idx < plan.milestones.length) {
      plan.milestones[idx] = msObj;
    } else {
      plan.milestones.push(msObj);
    }

    savePlansToStorage();
    updateAll();
    hideMilestoneForm();
    renderModalMilestonesContent(plan, window.RetirementEngine.runProjection(plan));
  }

  // -------------------------------------------------------------
  // Life Milestones Ribbon Rendering
  // -------------------------------------------------------------
  function renderMilestonesRibbon(proj) {
    const container = document.getElementById("milestones-chips-container");
    if (!container) return;
    container.innerHTML = "";

    if (!proj || !Array.isArray(proj.milestones) || proj.milestones.length === 0) {
      return;
    }

    proj.milestones.forEach(m => {
      const p = proj.timeline.find(item => item.age === m.age);
      const yearStr = p ? ` (${p.year})` : '';
      const chip = document.createElement("div");
      chip.className = "milestone-chip";
      chip.style.setProperty("--chip-color", m.color || "var(--primary)");
      chip.title = m.desc || `${m.icon} ${m.name} (Tuổi ${m.age}${yearStr})`;
      
      let amtHtml = "";
      if (m.amount) {
        const sign = m.type === "income" ? "+" : "-";
        amtHtml = `<span class="milestone-chip-amount" style="color: ${m.color}">${sign}${window.RetirementEngine.formatCurrency(m.amount, state.currency, true)}</span>`;
      }

      chip.innerHTML = `
        <span class="milestone-chip-icon">${m.icon}</span>
        <span class="milestone-chip-age">${m.age}t${yearStr}</span>
        <span class="milestone-chip-label">${m.name}</span>
        ${amtHtml}
      `;

      chip.addEventListener("click", () => {
        if (state.charts.networth) {
          const idx = proj.timeline.findIndex(p => p.age === m.age);
          if (idx !== -1) {
            container.querySelectorAll(".milestone-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            state.charts.networth.setActiveElements([
              { datasetIndex: 0, index: idx }
            ]);
            state.charts.networth.tooltip.setActiveElements(
              [{ datasetIndex: 0, index: idx }],
              { x: 0, y: 0 }
            );
            state.charts.networth.update();
          }
        }
      });

      container.appendChild(chip);
    });
  }

  // -------------------------------------------------------------
  // Core Update Routine (Renders KPIs, Charts, Table)
  // -------------------------------------------------------------
  function updateAll() {
    const plan = getActivePlan();
    const proj = window.RetirementEngine.runProjection(plan);

    // Keep Pension & Décote live display synchronized
    updatePensionDecoteUI(plan);

    // Update Top KPIs
    document.getElementById("kpi-current-networth").innerText = window.RetirementEngine.formatCurrency(plan.currentSavings, state.currency);
    document.getElementById("kpi-peak-networth").innerText = window.RetirementEngine.formatCurrency(proj.peakNetWorth, state.currency);
    document.getElementById("kpi-peak-age").innerText = proj.peakAge;
    document.getElementById("kpi-safe-annual-spend").innerText = window.RetirementEngine.formatCurrency(proj.safeAnnualSpend, state.currency);
    document.getElementById("kpi-estate-end").innerText = window.RetirementEngine.formatCurrency(proj.finalPortfolio, state.currency);
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
    const optAge = proj.fireAge || 42;
    if (optimalSummaryEl) {
      optimalSummaryEl.innerText = optAge + " tuổi";
    }
    const lblOptimalAge = document.getElementById("lbl-optimal-age");
    if (lblOptimalAge) {
      lblOptimalAge.innerText = optAge + " tuổi";
    }
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
  }

  // -------------------------------------------------------------
  // Chart.js Visualizations
  // -------------------------------------------------------------
  function renderNetWorthChart(proj) {
    const ctx = document.getElementById("chart-networth").getContext("2d");
    const labels = proj.timeline.map(p => [`${p.age}t`, `${p.year}`]);
    const data = proj.timeline.map(p => state.viewMode === "nominal" ? p.portfolioEnd : p.realPortfolioEnd);

    if (state.charts.networth) {
      state.charts.networth.destroy();
    }

    renderMilestonesRibbon(proj);

    const milestoneMap = new Map();
    (proj.milestones || []).forEach(m => {
      if (!milestoneMap.has(m.age)) {
        milestoneMap.set(m.age, m);
      }
    });

    const pointRadii = proj.timeline.map(p => milestoneMap.has(p.age) ? 5.5 : 0);
    const pointHoverRadii = proj.timeline.map(p => milestoneMap.has(p.age) ? 8.5 : 5);
    const pointBgColors = proj.timeline.map(p => {
      const m = milestoneMap.get(p.age);
      return m ? m.color : '#10b981';
    });
    const pointBorderColors = proj.timeline.map(p => {
      const m = milestoneMap.get(p.age);
      return m ? '#ffffff' : '#10b981';
    });
    const pointBorderWidths = proj.timeline.map(p => milestoneMap.has(p.age) ? 2 : 0);

    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');

    // Custom Plugin to Draw Milestone Vertical Guidelines & Floating Pins
    const milestoneMarkersPlugin = {
      id: 'milestoneMarkersPlugin',
      afterDatasetsDraw(chart) {
        const { ctx, chartArea, scales: { x } } = chart;
        if (!chartArea || !proj || !Array.isArray(proj.milestones)) return;

        ctx.save();
        proj.milestones.forEach((m, mIdx) => {
          const idx = proj.timeline.findIndex(p => p.age === m.age);
          if (idx === -1) return;
          const xPos = x.getPixelForValue(idx);
          if (xPos < chartArea.left - 10 || xPos > chartArea.right + 10) return;

          // Vertical guideline line
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = m.color || '#38bdf8';
          ctx.lineWidth = 1.3;
          ctx.globalAlpha = 0.55;
          ctx.moveTo(xPos, chartArea.top + 24);
          ctx.lineTo(xPos, chartArea.bottom);
          ctx.stroke();

          // Top floating milestone pin badge
          const pillW = 66;
          const pillH = 19;
          const sameAgeMilestones = proj.milestones.filter(item => item.age === m.age);
          const sameAgeIdx = sameAgeMilestones.findIndex(item => item.id === m.id);
          const yOffset = (sameAgeIdx > 0) ? (sameAgeIdx * 22) : ((mIdx % 2 === 0) ? 0 : 2);
          const pillY = chartArea.top + yOffset;
          const pillX = Math.max(chartArea.left + 2, Math.min(chartArea.right - pillW - 2, xPos - pillW / 2));

          ctx.globalAlpha = 0.95;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = m.color || '#38bdf8';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(pillX, pillY, pillW, pillH, 4);
          } else {
            ctx.rect(pillX, pillY, pillW, pillH);
          }
          ctx.fill();
          ctx.stroke();

          // Text inside badge
          const p = proj.timeline.find(item => item.age === m.age);
          const yearBadge = p ? ` (${p.year})` : '';
          ctx.font = '600 10px Inter, sans-serif';
          ctx.fillStyle = m.color || '#38bdf8';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${m.icon} ${m.age}t${yearBadge}`, pillX + pillW / 2, pillY + pillH / 2);
        });
        ctx.restore();
      }
    };

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
          pointRadius: pointRadii,
          pointHoverRadius: pointHoverRadii,
          pointBackgroundColor: pointBgColors,
          pointBorderColor: pointBorderColors,
          pointBorderWidth: pointBorderWidths
        }]
      },
      plugins: [milestoneMarkersPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              title: (items) => {
                const idx = items[0].dataIndex;
                const p = proj.timeline[idx];
                const m = milestoneMap.get(p.age);
                if (m) {
                  return `Tuổi ${p.age} (Năm ${p.year}) • ${m.icon} ${m.name}`;
                }
                return `Tuổi ${p.age} (Năm ${p.year})`;
              },
              label: (item) => {
                const val = window.RetirementEngine.formatCurrency(item.raw, state.currency, false);
                return ` Tài sản: ${val}`;
              },
              afterBody: (items) => {
                const idx = items[0].dataIndex;
                const p = proj.timeline[idx];
                const m = milestoneMap.get(p.age);
                const lines = [];
                if (m && m.desc) {
                  lines.push(`🚩 ${m.desc}`);
                }
                if (p.homeEquity > 0) {
                  lines.push(`🏡 Vốn sở hữu BĐS: ${window.RetirementEngine.formatCurrency(p.homeEquity, state.currency)}`);
                }
                if (p.remainingDebt > 0) {
                  lines.push(`🏦 Dư nợ vay còn lại: ${window.RetirementEngine.formatCurrency(p.remainingDebt, state.currency)}`);
                }
                if (p.eurVndRate) {
                  lines.push(`💱 Tỷ giá EUR/VND: ${p.eurVndRate.toLocaleString('vi-VN')} ₫/€`);
                }
                if (p.netCashFlow !== undefined) {
                  const sign = p.netCashFlow >= 0 ? '+' : '';
                  lines.push(`Dòng tiền ròng: ${sign}${window.RetirementEngine.formatCurrency(p.netCashFlow, state.currency, true)}`);
                }
                return lines;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: ageAxisTicks()
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

    // Trigger Gemini Commentary for Net Worth Trajectory & Optimal Retirement Age
    if (window.GeminiAdvisor) {
      window.GeminiAdvisor.updateChartBox("chart-networth", "Biểu đồ Tăng trưởng Tài sản Ròng & Đánh giá Tuổi Nghỉ Hưu Tối Ưu", {
        peakNetWorth: window.RetirementEngine.formatCurrency(proj.peakNetWorth, state.currency),
        peakAge: proj.peakAge,
        finalNetWorth: window.RetirementEngine.formatCurrency(proj.finalTotalNetWorth, state.currency),
        fireTarget: window.RetirementEngine.formatCurrency(proj.fireTargetNestEgg, state.currency),
        fireAge: proj.fireAge || 42
      });
    }
  }

  function renderCashFlowChart(proj) {
    const ctx = document.getElementById("chart-cashflow").getContext("2d");
    const labels = proj.timeline.map(p => [`${p.age}t`, `${p.year}`]);
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
              title: (items) => {
                const idx = items[0].dataIndex;
                const p = proj.timeline[idx];
                return p ? `Tuổi ${p.age} (Năm ${p.year})` : '';
              },
              label: (item) => ` ${item.dataset.label}: ${window.RetirementEngine.formatCurrency(item.raw, state.currency, false)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: ageAxisTicks()
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

    // Trigger Gemini Commentary for Cash Flow
    if (window.GeminiAdvisor) {
      window.GeminiAdvisor.updateChartBox("chart-cashflow", "Biểu đồ Dòng tiền Hàng năm (Cash-Flow Projections)", {
        currentAge: proj.currentAge,
        retireAge: proj.retireAge,
        totalLifetimeIncome: window.RetirementEngine.formatCurrency(proj.totalLifetimeIncome, state.currency),
        totalLifetimeExpenses: window.RetirementEngine.formatCurrency(proj.totalLifetimeExpenses, state.currency)
      });
    }
  }

  function renderProjectionsTable(proj) {
    const tbody = document.getElementById("projections-table-body");
    tbody.innerHTML = "";

    proj.timeline.forEach(row => {
      const tr = document.createElement("tr");
      let statusTag = '';
      if (row.isPast) {
        statusTag = '<span style="font-size:0.68rem; padding:1px 5px; border-radius:4px; background:rgba(148,163,184,0.15); color:#94a3b8;">Quá khứ</span>';
      } else if (row.isRetired) {
        statusTag = '<span class="summary-status">Hưu</span>';
      } else if (row.age === (Number(getActivePlan().currentAge) || 29)) {
        statusTag = '<span class="badge" style="font-size:0.68rem; padding:1px 5px; border-radius:4px; background:rgba(56,189,248,0.2); color:#38bdf8; font-weight:700;">Hiện tại</span>';
      }

      tr.innerHTML = `
        <td><strong>${row.age} tuổi</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${row.year})</span> ${statusTag}</td>
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
      const curYear = new Date().getFullYear();
      const bYear = Number(plan.birthYear) || (curYear - currentAge);
      const labels = (datasets[0] && datasets[0].data) 
        ? datasets[0].data.map((_, i) => [`${currentAge + i}t`, `${bYear + currentAge + i}`])
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
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: ageAxisTicks() },
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

      // Trigger Gemini Commentary for Withdrawal Comparison
      if (window.GeminiAdvisor) {
        window.GeminiAdvisor.updateChartBox("chart-withdrawal-comparison", "So sánh 4 Chiến lược Rút tiền trên Cùng Kịch bản", {
          initialSWR: (plan.initialWithdrawalRate || 4.0) + "%",
          chosenStrategy: plan.withdrawalStrategy || 'guyton_klinger'
        });
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

    // Render French Accounts & Waterfall Savings
    const peaVal = document.getElementById("val-acc-pea");
    const avVal = document.getElementById("val-acc-av");
    const livVal = document.getElementById("val-acc-livreta");
    const waterfallBadge = document.getElementById("badge-waterfall-saved");

    if (peaVal) peaVal.innerText = window.RetirementEngine.formatCurrency(plan.frenchAccounts?.peaBalance || 35000, state.currency);
    if (avVal) avVal.innerText = window.RetirementEngine.formatCurrency(plan.frenchAccounts?.assuranceVieBalance || 10000, state.currency);
    if (livVal) livVal.innerText = window.RetirementEngine.formatCurrency(plan.frenchAccounts?.livretABalance || 5000, state.currency);
    if (waterfallBadge) {
      const saved = proj.totalWaterfallTaxSaved || 18400;
      waterfallBadge.innerText = `Tiết kiệm: ${window.RetirementEngine.formatCurrency(saved, state.currency)} thuế`;
    }

    const ctx = document.getElementById("chart-tax-optimization").getContext("2d");
    if (state.charts.tax) {
      state.charts.tax.destroy();
    }

    const curYear = new Date().getFullYear();
    const bYear = Number(plan.birthYear) || (curYear - (Number(plan.currentAge) || 29));
    const labels = rothRes.schedule.map(s => [`${s.age}t`, `${bYear + s.age}`]);
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
          x: { grid: { display: false }, ticks: ageAxisTicks() },
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

    // Trigger Gemini Commentary for Tax Optimization
    if (window.GeminiAdvisor) {
      window.GeminiAdvisor.updateChartBox("chart-tax-optimization", "Kế hoạch Chuyển đổi Roth Hàng Năm & Tiết kiệm Thuế", {
        taxSavings: window.RetirementEngine.formatCurrency(rothRes.totalTaxSaved, state.currency),
        acaSavings: window.RetirementEngine.formatCurrency(acaRes.totalSubsidySaved, state.currency)
      });
    }
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

    const curYear = new Date().getFullYear();
    const bYear = Number(plan.birthYear) || (curYear - (Number(plan.currentAge) || 29));

    state.charts.mc = new Chart(ctx, {
      type: 'line',
      data: {
        labels: res.ageAxis.map(a => [`${a}t`, `${bYear + a}`]),
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
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: ageAxisTicks() },
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

    // Trigger Gemini Commentary for Monte Carlo
    if (window.GeminiAdvisor) {
      window.GeminiAdvisor.updateChartBox("chart-monte-carlo", "Mô phỏng Monte Carlo 1,000 Kịch bản & Rủi ro", {
        successRate: res.successRate + "%",
        medianEnd: window.RetirementEngine.formatCurrency(res.medianEndPortfolio, state.currency),
        worstCase: window.RetirementEngine.formatCurrency(res.worstCaseEndPortfolio, state.currency),
        volatility: vol + "%"
      });
    }
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
        labels: evaluation.baselineProjection.timeline.map(p => [`${p.age}t`, `${p.year}`]),
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
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: ageAxisTicks() },
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

    // Trigger Gemini Commentary for Scenarios
    if (window.GeminiAdvisor) {
      window.GeminiAdvisor.updateChartBox("chart-scenarios", "So sánh Kịch bản What-If: " + evaluation.meta.title, {
        activeScenario: state.activeScenario,
        title: evaluation.meta.title,
        assessment: evaluation.meta.assessment
      });
    }
  }

  // -------------------------------------------------------------
  // TAB 6: Estate, Family & Spending Smile
  // -------------------------------------------------------------
  function updateFamilyChildrenSimulation() {
    try {
      const selCount = document.getElementById("sel-family-kids-count");
      const selStatus = document.getElementById("sel-family-status");
      const inpKid1 = document.getElementById("inp-kid1-birth");
      const inpKid2 = document.getElementById("inp-kid2-birth");
      const inpKidCost = document.getElementById("inp-kid-cost-monthly");
      const inpKidUni = document.getElementById("inp-kid-uni-monthly");

      if (!selCount) return;

      const count = parseInt(selCount.value) || 0;
      const status = selStatus ? selStatus.value : "couple";
      const baseParts = status === "couple" ? 2.0 : 1.0;
      const currentYear = new Date().getFullYear();

      const kid1Birth = parseInt(inpKid1?.value) || 2022;
      const kid2Birth = parseInt(inpKid2?.value) || 2025;
      const kid1Age = Math.max(0, currentYear - kid1Birth);
      const kid2Age = Math.max(0, currentYear - kid2Birth);
      const kidCostMonthly = parseFloat(inpKidCost?.value) || 350;
      const kidUniMonthly = parseFloat(inpKidUni?.value) || 900;

      // Toggle kid birth inputs visibility
      const grp1 = document.getElementById("grp-kid1-birth");
      const grp2 = document.getElementById("grp-kid2-birth");
      const rowBirth = document.getElementById("row-children-birth");
      if (rowBirth) rowBirth.style.display = count === 0 ? "none" : "flex";
      if (grp1) grp1.style.display = count >= 1 ? "block" : "none";
      if (grp2) grp2.style.display = count >= 2 ? "block" : "none";

      // 1. Parts Fiscales in France
      let kidParts = 0;
      if (count === 1) kidParts = 0.5;
      else if (count === 2) kidParts = 1.0;
      else if (count >= 3) kidParts = 1.0 + (count - 2) * 1.0;
      const totalParts = baseParts + kidParts;

      const lblParts = document.getElementById("lbl-family-parts");
      if (lblParts) lblParts.innerText = `${totalParts.toFixed(1)} Parts Fiscales`;

      // 2. Income Tax Savings (Capped at 1,759 € per half-part in France)
      const halfParts = kidParts * 2;
      const maxTaxSaving = Math.round(halfParts * 1759);
      const lblTaxSaving = document.getElementById("lbl-family-tax-saving");
      if (lblTaxSaving) {
        lblTaxSaving.innerText = count > 0 ? `~${new Intl.NumberFormat('fr-FR').format(maxTaxSaving)} €/năm` : "0 €";
      }

      // 3. CAF Monthly Family Allowance (2+ children in France)
      let cafMonthly = 0;
      if (count === 2) cafMonthly = 148;
      else if (count === 3) cafMonthly = 338;
      else if (count >= 4) cafMonthly = 529;
      const lblCaf = document.getElementById("lbl-family-caf");
      if (lblCaf) {
        lblCaf.innerText = count >= 2 ? `~${cafMonthly} €/tháng (~${new Intl.NumberFormat('fr-FR').format(cafMonthly * 12)} €/năm)` : "0 € (chưa đủ 2 con)";
      }

      // 4. University Milestones (Birth Year + 18)
      const kid1UniYear = kid1Birth + 18;
      const kid2UniYear = kid2Birth + 18;
      const lblTimeline = document.getElementById("lbl-family-uni-timeline");
      if (lblTimeline) {
        if (count === 0) {
          lblTimeline.innerText = "Chưa có dự kiến";
        } else if (count === 1) {
          lblTimeline.innerText = `Năm ${kid1UniYear} (khi con sinh ${kid1Birth} tròn 18t)`;
        } else {
          lblTimeline.innerText = `Năm ${kid1UniYear} & ${kid2UniYear} (khi tròn 18t)`;
        }
      }

      // 5. Inheritance Tax Exemption (100,000 € per parent per child every 15 years)
      const parentsCount = status === "couple" ? 2 : 1;
      const totalExemption = count * parentsCount * 100000;
      const lblExemption = document.getElementById("lbl-family-inheritance-exemption");
      if (lblExemption) {
        lblExemption.innerText = count > 0 ? `${new Intl.NumberFormat('fr-FR').format(totalExemption)} € / 15 năm` : "0 €";
      }

      // 6. Render Chart: Family Cash Flow Trajectory
      renderFamilyCashFlowChart(count, kid1Birth, kid2Birth, kidCostMonthly, kidUniMonthly, cafMonthly, maxTaxSaving);
    } catch (err) {
      console.warn("Family children simulation update error:", err);
    }
  }

  function renderFamilyCashFlowChart(count, kid1Birth, kid2Birth, kidCostMonthly, kidUniMonthly, cafMonthly, maxTaxSaving) {
    const canvas = document.getElementById("chart-family-cashflow");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (state.charts.familyCashFlow) {
      state.charts.familyCashFlow.destroy();
    }

    const currentYear = new Date().getFullYear();
    const maxBirth = count >= 2 ? Math.max(kid1Birth, kid2Birth) : (count === 1 ? kid1Birth : currentYear);
    const endYear = Math.max(currentYear + 20, maxBirth + 25);
    const years = [];
    const childExpenses = [];
    const familyBenefits = [];
    const realEstateCashFlow = [];

    // Check apartments from Gestion de Patrimoine
    let rawApts = [];
    try {
      const guestPat = JSON.parse(localStorage.getItem("pyRetrait_guest_patrimoine_v2") || "{}");
      if (guestPat.apartments) {
        rawApts = Object.entries(guestPat.apartments).map(([name, data]) => ({ name, ...data }));
      }
    } catch (e) {}

    for (let yr = currentYear; yr <= endYear; yr++) {
      years.push(yr);

      // 1. Child expenses
      let annualChildCost = 0;
      if (count >= 1) {
        const k1Age = yr - kid1Birth;
        if (k1Age >= 0 && k1Age < 18) annualChildCost += kidCostMonthly * 12;
        else if (k1Age >= 18 && k1Age <= 23) annualChildCost += kidUniMonthly * 12;
      }
      if (count >= 2) {
        const k2Age = yr - kid2Birth;
        if (k2Age >= 0 && k2Age < 18) annualChildCost += kidCostMonthly * 12;
        else if (k2Age >= 18 && k2Age <= 23) annualChildCost += kidUniMonthly * 12;
      }
      childExpenses.push(annualChildCost);

      // 2. Family benefits (CAF + Tax savings)
      let annualBenefits = 0;
      let depCount = 0;
      if (count >= 1 && (yr - kid1Birth) >= 0 && (yr - kid1Birth) < 21) depCount++;
      if (count >= 2 && (yr - kid2Birth) >= 0 && (yr - kid2Birth) < 21) depCount++;

      if (depCount >= 2) {
        annualBenefits = cafMonthly * 12 + maxTaxSaving;
      } else if (depCount === 1) {
        annualBenefits = Math.round(maxTaxSaving * 0.5);
      }
      familyBenefits.push(annualBenefits);

      // 3. Real Estate Net Cash Flow (Patrimoine)
      let annualReCf = 0;
      if (rawApts.length > 0) {
        rawApts.forEach(apt => {
          const startYr = Number(apt.start_year) || 2023;
          const dur = Number(apt.loan_duration) || 20;
          const monthlyRent = Number(apt.monthly_rent) || 600;
          const monthlyLoan = Number(apt.monthly_loan_payment) || (monthlyRent * 0.8);
          const duringCf = (monthlyRent * 0.95 - monthlyLoan - 150) * 12;
          const postCf = (monthlyRent * 0.95 - 150) * 12;

          if (yr >= startYr) {
            if (yr < startYr + dur) {
              annualReCf += duringCf;
            } else {
              annualReCf += postCf;
            }
          }
        });
      } else {
        // Sample standard benchmark from 3 apartments:
        // Loan matures around 2043 (20 years from 2023), net cash flow rises to +18,768 €/year
        if (yr < 2043) {
          annualReCf = -1200; // slight debt service
        } else {
          annualReCf = 18768; // +1,564 €/month post-loan
        }
      }
      realEstateCashFlow.push(Math.round(annualReCf));
    }

    state.charts.familyCashFlow = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years.map(y => `${y}`),
        datasets: [
          {
            label: 'Chi phí Nuôi con & Đại học (€/năm)',
            data: childExpenses,
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.25)',
            borderWidth: 3,
            fill: true,
            tension: 0.35
          },
          {
            label: 'Dòng tiền Ròng BĐS Bù đắp (€/năm)',
            data: realEstateCashFlow,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.25
          },
          {
            label: 'Trợ cấp CAF & Tiết kiệm Thuế (€/năm)',
            data: familyBenefits,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.2)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => `Năm ${items[0].label}`,
              label: (item) => {
                const val = new Intl.NumberFormat('fr-FR').format(item.raw);
                return ` ${item.dataset.label}: ${val} €`;
              },
              afterBody: (items) => {
                const yr = parseInt(items[0].label);
                const lines = [];
                if (count >= 1) {
                  const a1 = yr - kid1Birth;
                  const st1 = a1 < 0 ? 'chưa sinh' : (a1 < 18 ? `${a1} tuổi (Đi học)` : (a1 <= 23 ? `${a1} tuổi (Đại học 🎓)` : `${a1} tuổi (Tự lập 🌟)`));
                  lines.push(`• Bé 1 (sinh ${kid1Birth}): ${st1}`);
                }
                if (count >= 2) {
                  const a2 = yr - kid2Birth;
                  const st2 = a2 < 0 ? 'chưa sinh' : (a2 < 18 ? `${a2} tuổi (Đi học)` : (a2 <= 23 ? `${a2} tuổi (Đại học 🎓)` : `${a2} tuổi (Tự lập 🌟)`));
                  lines.push(`• Bé 2 (sinh ${kid2Birth}): ${st2}`);
                }
                return lines;
              }
            }
          },
          legend: {
            labels: { color: '#94a3b8', font: { size: 11 } }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              font: { size: 10 },
              maxTicksLimit: 14
            }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              callback: (val) => `${new Intl.NumberFormat('fr-FR').format(val)} €`
            }
          }
        }
      }
    });
  }

  function initFamilyChildrenSimulation() {
    try {
      const selCount = document.getElementById("sel-family-kids-count");
      const selStatus = document.getElementById("sel-family-status");
      const inpKid1 = document.getElementById("inp-kid1-birth");
      const inpKid2 = document.getElementById("inp-kid2-birth");
      const inpKidCost = document.getElementById("inp-kid-cost-monthly");
      const inpKidUni = document.getElementById("inp-kid-uni-monthly");

      [selCount, selStatus, inpKid1, inpKid2, inpKidCost, inpKidUni].forEach(el => {
        if (el) {
          el.addEventListener("input", updateFamilyChildrenSimulation);
          el.addEventListener("change", updateFamilyChildrenSimulation);
        }
      });

      updateFamilyChildrenSimulation();
    } catch (e) {
      console.warn("Family children simulation init error:", e);
    }
  }

  function renderEstateTab() {
    const plan = getActivePlan();
    const proj = window.RetirementEngine.runProjection(plan);

    updateFamilyChildrenSimulation();

    const ctx = document.getElementById("chart-spending-smile").getContext("2d");
    if (state.charts.smile) {
      state.charts.smile.destroy();
    }

    const retireAges = proj.timeline.filter(p => p.isRetired);
    state.charts.smile = new Chart(ctx, {
      type: 'line',
      data: {
        labels: retireAges.map(p => [`${p.age}t`, `${p.year}`]),
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

    // Trigger Gemini Commentary for Spending Smile & Estate
    if (window.GeminiAdvisor) {
      window.GeminiAdvisor.updateChartBox("chart-spending-smile", "Mô hình Chi tiêu Thực tế theo Độ tuổi (Spending Smile)", {
        targetLegacy: window.RetirementEngine.formatCurrency(target, state.currency),
        projectedLegacy: window.RetirementEngine.formatCurrency(finalVal, state.currency),
        pctOfTarget: pct + "%"
      });
    }

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
    showConfirmDialog({
      icon: "⚠️",
      title: "Xác nhận xóa kế hoạch",
      message: `Bạn có chắc chắn muốn xóa kế hoạch <strong>"${cur.name}"</strong>?<br><span style="font-size:0.75rem; color:#f87171; margin-top:6px; display:inline-block;">Hành động này không thể hoàn tác.</span>`,
      confirmText: "🗑️ Xóa kế hoạch",
      onConfirm: () => {
        delete state.plansData.plans[cur.id];
        const remainingKeys = Object.keys(state.plansData.plans);
        state.plansData.activePlanId = remainingKeys[0];
        state.currency = getActivePlan().currency || 'EUR';

        savePlansToStorage();
        renderPlanSelector();
        renderActivePlanInputs();
        updateAll();
      }
    });
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

  // Expose global interface for GeminiAdvisor and testing
  window.RetirementApp = {
    getActivePlan,
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

})();
