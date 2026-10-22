/**
 * pyRetrait — Tầng 3: UI Module Quản lý Modal, Hộp Thoại & Thiết Lập Nhanh (ui-modals.js)
 * Tập trung toàn bộ logic popup: Confirm Dialog, Formula Guide, Feature Intro,
 * Modal Nguồn thu / Khoản chi / Cột mốc / Số dư thực tế / Kế hoạch & Quick Setup Wizard 4 bước.
 */

(function () {
  'use strict';

  // Shared State & Helpers Bridge (Tầng 2 & Tầng 3)
  const state = (window.AppState && window.AppState.state) || window.__pyRetraitFallbackState;
  const STORAGE_KEY = (window.AppState && window.AppState.STORAGE_KEY) || "pyRetrait_plans_v2";

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

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

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

  function getActivePlan() {
    if (window.AppState && typeof window.AppState.getActivePlan === 'function') {
      return window.AppState.getActivePlan();
    }
    const plan = state.plansData.plans[state.plansData.activePlanId];
    return plan || Object.values(state.plansData.plans)[0];
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


  let confirmCallback = null;

  /**
   * Hiển thị hộp thoại xác nhận toàn cục (Confirm Dialog)
   */
  function showConfirmDialog({
    icon = "",
    title = "Xác nhận thao tác",
    message = "Bạn có chắc chắn muốn thực hiện?",
    confirmText = "Xác nhận",
    onConfirm
  }) {
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

  /**
   * Đóng hộp thoại xác nhận
   */
  function closeConfirmDialog() {
    const modal = document.getElementById("confirm-modal");
    if (modal) modal.style.display = "none";
    confirmCallback = null;
  }

  /**
   * Mở modal tra cứu công thức tài chính
   */
  function openFormulaModal(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const modal = document.getElementById("modal-formula-guide");
    if (modal) modal.style.display = "flex";
  }

  /**
   * Đóng modal tra cứu công thức tài chính
   */
  function closeFormulaModal() {
    const modal = document.getElementById("modal-formula-guide");
    if (modal) modal.style.display = "none";
  }

  /**
   * Mở modal giới thiệu năng lực & tính năng nổi bật (Intro Tour)
   */
  function openFeatureIntroModal() {
    const modal = document.getElementById("feature-intro-modal");
    if (modal) modal.style.display = "flex";
  }

  /**
   * Đóng modal giới thiệu
   */
  function closeFeatureIntroModal() {
    const modal = document.getElementById("feature-intro-modal");
    if (modal) {
      modal.style.display = "none";
      try {
        localStorage.setItem("pyretrait_intro_seen", "true");
      } catch (e) {
        console.warn("Could not write to localStorage:", e);
      }
    }
  }

  /**
   * Đăng ký sự kiện cho tất cả modal
   */
  function initModals() {
    // 1. Confirm Dialog Listeners
    const btnConfirmCancel = document.getElementById("btn-confirm-cancel");
    const btnConfirmOk = document.getElementById("btn-confirm-ok");
    const confirmModal = document.getElementById("confirm-modal");

    if (btnConfirmCancel) btnConfirmCancel.addEventListener("click", closeConfirmDialog);
    if (btnConfirmOk) {
      btnConfirmOk.addEventListener("click", () => {
        const cb = confirmCallback;
        closeConfirmDialog();
        if (cb) cb();
      });
    }
    if (confirmModal) {
      confirmModal.addEventListener("click", (e) => {
        if (e.target.id === "confirm-modal") closeConfirmDialog();
      });
    }

    // 2. Formula Modal Listeners
    const btnShowFormula = document.getElementById("btn-show-formula-guide");
    const btnCloseFormula = document.getElementById("btn-close-formula-modal");
    const btnCloseFormulaFooter = document.getElementById("btn-close-formula-modal-footer");
    const linkOpenFormulaAlloc = document.getElementById("link-open-formula-alloc");
    const btnHeaderFormula = document.getElementById("btn-header-formula-guide");
    const modalFormula = document.getElementById("modal-formula-guide");

    if (btnShowFormula) btnShowFormula.addEventListener("click", openFormulaModal);
    if (linkOpenFormulaAlloc) linkOpenFormulaAlloc.addEventListener("click", openFormulaModal);
    if (btnHeaderFormula) btnHeaderFormula.addEventListener("click", openFormulaModal);
    document.querySelectorAll(".btn-open-formula-modal").forEach(el => {
      el.addEventListener("click", openFormulaModal);
    });
    if (btnCloseFormula) btnCloseFormula.addEventListener("click", closeFormulaModal);
    if (btnCloseFormulaFooter) btnCloseFormulaFooter.addEventListener("click", closeFormulaModal);
    if (modalFormula) {
      modalFormula.addEventListener("click", (e) => {
        if (e.target === modalFormula) closeFormulaModal();
      });
    }

    // 3. Feature Discovery Intro Modal Listeners
    const modalFeatureIntro = document.getElementById("feature-intro-modal");
    const btnOpenFeatureIntro = document.getElementById("btn-header-feature-intro");
    const btnCloseFeatureIntro = document.getElementById("btn-close-feature-intro");
    const btnIntroStart = document.getElementById("btn-intro-start");

    if (btnOpenFeatureIntro) btnOpenFeatureIntro.addEventListener("click", openFeatureIntroModal);
    if (btnCloseFeatureIntro) btnCloseFeatureIntro.addEventListener("click", closeFeatureIntroModal);
    if (btnIntroStart) btnIntroStart.addEventListener("click", closeFeatureIntroModal);
    if (modalFeatureIntro) {
      modalFeatureIntro.addEventListener("click", (e) => {
        if (e.target === modalFeatureIntro) closeFeatureIntroModal();
      });
    }

    // Tự động mở modal giới thiệu cho người dùng mới lần đầu
    try {
      if (!localStorage.getItem("pyretrait_intro_seen")) {
        setTimeout(() => {
          openFeatureIntroModal();
        }, 600);
      }
    } catch (e) { }
  }

  // -------------------------------------------------------------
  // Sự kiện tương tác của các Modal & Cửa sổ Thiết lập nhanh
  // -------------------------------------------------------------
  function bindModalEvents() {
    try {
      initQuickSetupWizard();
    } catch (e) {
      console.warn("initQuickSetupWizard error:", e);
    }

    // Add / Edit Income Stream
    const btnAddInc = document.getElementById("btn-add-income");
    if (btnAddInc) {
      btnAddInc.addEventListener("click", (e) => {
        e.preventDefault();
        openIncomeModal(-1);
      });
    }
    const btnCloseInc = document.getElementById("btn-close-income-modal");
    if (btnCloseInc) btnCloseInc.addEventListener("click", closeIncomeModal);
    const btnCancelInc = document.getElementById("btn-cancel-income-modal");
    if (btnCancelInc) btnCancelInc.addEventListener("click", closeIncomeModal);
    const btnSaveInc = document.getElementById("btn-save-income-modal");
    if (btnSaveInc) btnSaveInc.addEventListener("click", saveIncomeFromModal);

    const incModalEl = document.getElementById("income-modal");
    if (incModalEl) {
      incModalEl.addEventListener("click", (e) => {
        if (e.target === incModalEl) closeIncomeModal();
      });
    }

    // Add / Edit Expense Stream & Crédits
    const btnAddExp = document.getElementById("btn-add-expense");
    if (btnAddExp) {
      btnAddExp.addEventListener("click", (e) => {
        e.preventDefault();
        openExpenseModal(-1);
      });
    }
    const btnSyncMortExp = document.getElementById("btn-sync-mortgage-expenses");
    if (btnSyncMortExp) btnSyncMortExp.addEventListener("click", () => {
      const plan = getActivePlan();
      syncMortgageToExpenseStreams(plan, true);
    });
    const btnCloseExpModal = document.getElementById("btn-close-expense-modal");
    if (btnCloseExpModal) btnCloseExpModal.addEventListener("click", closeExpenseModal);
    const btnCancelExpModal = document.getElementById("btn-cancel-expense-modal");
    if (btnCancelExpModal) btnCancelExpModal.addEventListener("click", closeExpenseModal);
    const btnSaveExpModal = document.getElementById("btn-save-expense-modal");
    if (btnSaveExpModal) btnSaveExpModal.addEventListener("click", saveExpenseFromModal);

    const expModalEl = document.getElementById("expense-modal");
    if (expModalEl) {
      expModalEl.addEventListener("click", (e) => {
        if (e.target === expModalEl) closeExpenseModal();
      });
    }

    // Global Event Delegation phòng thủ: đảm bảo click luôn mở dù DOM có re-render
    document.addEventListener("click", (e) => {
      const targetInc = e.target.closest("#btn-add-income, .btn-add-income-stream");
      if (targetInc) {
        e.preventDefault();
        openIncomeModal(-1);
        return;
      }
      const targetExp = e.target.closest("#btn-add-expense, .btn-add-expense-stream");
      if (targetExp) {
        e.preventDefault();
        openExpenseModal(-1);
        return;
      }
    });

    // 2-Way Sync between Monthly and Yearly Expense in modal
    const inpModalExpMonthly = document.getElementById("inp-expense-amount-monthly");
    const inpModalExpAnnual = document.getElementById("inp-expense-amount");
    if (inpModalExpMonthly && inpModalExpAnnual) {
      inpModalExpMonthly.addEventListener("input", () => {
        const m = Number(inpModalExpMonthly.value) || 0;
        inpModalExpAnnual.value = m * 12;
      });
      inpModalExpAnnual.addEventListener("input", () => {
        const a = Number(inpModalExpAnnual.value) || 0;
        inpModalExpMonthly.value = Math.round(a / 12);
      });
    }

    // Plan Modal Events
    document.getElementById("btn-plan-gender-male")?.addEventListener("click", () => setPlanGender('male'));
    document.getElementById("btn-plan-gender-female")?.addEventListener("click", () => setPlanGender('female'));
    document.getElementById("btn-plan-fam-single")?.addEventListener("click", () => setPlanFamily('single'));
    document.getElementById("btn-plan-fam-married")?.addEventListener("click", () => setPlanFamily('married'));
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

    const modalMs = document.getElementById("milestone-modal");
    if (modalMs) {
      modalMs.addEventListener("click", (e) => {
        if (e.target === modalMs) closeMilestoneModal();
      });
    }

    // Actual Net Worth Modal Events
    const btnManageActual = document.getElementById("btn-manage-actual-networth");
    if (btnManageActual) btnManageActual.addEventListener("click", openActualNetWorthModal);
    const btnCloseActual = document.getElementById("btn-close-actual-modal");
    if (btnCloseActual) btnCloseActual.addEventListener("click", closeActualNetWorthModal);
    const btnCloseActualFooter = document.getElementById("btn-close-actual-modal-footer");
    if (btnCloseActualFooter) btnCloseActualFooter.addEventListener("click", closeActualNetWorthModal);
    const btnAddActual = document.getElementById("btn-add-actual-record");
    if (btnAddActual) btnAddActual.addEventListener("click", addActualRecordFromForm);
    const btnFetchPatrimoine = document.getElementById("btn-fetch-patrimoine-balance");
    if (btnFetchPatrimoine) btnFetchPatrimoine.addEventListener("click", fetchPatrimoineBalanceForActual);

    const modalActual = document.getElementById("actual-networth-modal");
    if (modalActual) {
      modalActual.addEventListener("click", (e) => {
        if (e.target === modalActual) closeActualNetWorthModal();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (modalMs && modalMs.style.display === "flex") {
          closeMilestoneModal();
        }
        if (modalActual && modalActual.style.display === "flex") {
          closeActualNetWorthModal();
        }
      }
    });

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
        btnFetchModels.innerText = "Đang dò tìm...";
        try {
          const res = await fetch(`/api/ai/models?api_key=${encodeURIComponent(key)}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.models) && data.models.length > 0 && selGeminiModel) {
              const currentVal = selGeminiModel.value;
              selGeminiModel.innerHTML = data.models.map(m => `
                <option value="${m}">${m} ${m.includes('3.8') ? '(Mới nhất)' : ''}</option>
              `).join("") + '<option value="custom">Nhập model tùy chỉnh (Future Model)...</option>';
              if (data.models.includes(currentVal)) {
                selGeminiModel.value = currentVal;
              }
              btnFetchModels.innerText = `Đã tìm thấy ${data.models.length} model`;
            }
          }
        } catch (err) {
          btnFetchModels.innerText = "Lỗi dò tìm";
        }
        setTimeout(() => { if (btnFetchModels) btnFetchModels.innerText = "Dò tìm model mới từ Google"; }, 2500);
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
        } catch (e) { }
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

    // Khởi tạo các Modal & Hộp thoại tập trung qua Tầng 3: ui-modals.js
    if (window.ModalsUI && typeof window.ModalsUI.init === 'function') {
      window.ModalsUI.init();
    }
  }

  function openExpenseModal(idx = -1) {
    const plan = getActivePlan();
    const modal = document.getElementById("expense-modal");
    const title = document.getElementById("expense-modal-title");
    const curSymbol = window.RetirementEngine.getCurrencySymbol(state.currency);
    const unit = document.getElementById("modal-expense-unit");
    const unitMonthly = document.getElementById("modal-expense-unit-monthly");
    if (unit) unit.innerText = curSymbol;
    if (unitMonthly) unitMonthly.innerText = curSymbol;

    document.getElementById("inp-expense-idx").value = idx;

    if (idx >= 0 && plan.expenses && plan.expenses[idx]) {
      const exp = plan.expenses[idx];
      title.innerHTML = `Chỉnh Sửa: ${exp.name}`;
      document.getElementById("inp-expense-name").value = exp.name;
      document.getElementById("inp-expense-amount").value = exp.amount;
      document.getElementById("inp-expense-amount-monthly").value = Math.round(Number(exp.amount) / 12);
      document.getElementById("inp-expense-start").value = exp.startAge;
      document.getElementById("inp-expense-end").value = exp.endAge;
      document.getElementById("inp-expense-growth").value = exp.growth !== undefined ? exp.growth : 0;
    } else {
      title.innerHTML = `Thêm Khoản Chi / Nợ Vay Mới`;
      document.getElementById("inp-expense-name").value = "";
      const defaultMonthly = state.currency === 'EUR' ? 600 : (state.currency === 'USD' ? 700 : 15000000);
      document.getElementById("inp-expense-amount-monthly").value = defaultMonthly;
      document.getElementById("inp-expense-amount").value = defaultMonthly * 12;
      document.getElementById("inp-expense-start").value = plan.currentAge || 29;
      document.getElementById("inp-expense-end").value = (plan.currentAge || 29) + 20;
      document.getElementById("inp-expense-growth").value = 0.0;
    }

    modal.style.display = "flex";
  }

  function syncExpenseGrowthVisibility() {
    // Không ẩn ô tăng trưởng, để người dùng tự do cấu hình
  }

  function closeExpenseModal() {
    const modal = document.getElementById("expense-modal");
    if (modal) modal.style.display = "none";
  }

  function saveExpenseFromModal() {
    const idx = Number(document.getElementById("inp-expense-idx").value);
    const name = document.getElementById("inp-expense-name").value.trim();
    if (!name) {
      alert("Vui lòng nhập tên khoản chi hoặc nợ vay!");
      return;
    }

    const annualVal = Number(document.getElementById("inp-expense-amount").value);
    const monthlyVal = Number(document.getElementById("inp-expense-amount-monthly").value);
    const amount = annualVal || (monthlyVal * 12) || 0;
    const plan = getActivePlan();
    const rawStart = document.getElementById("inp-expense-start").value;
    const startAge = (rawStart !== "" && !isNaN(Number(rawStart))) ? Number(rawStart) : (plan.currentAge || 29);
    const endAge = Number(document.getElementById("inp-expense-end").value) || 85;
    const isDebt = (/crédit|credit|vay|nợ|loan|prêt|pret|ngân hàng|trả góp|tra gop|leasing/i).test(name);
    const growth = Number(document.getElementById("inp-expense-growth")?.value) || 0;

    if (!Array.isArray(plan.expenses)) plan.expenses = [];

    const expData = {
      name,
      amount,
      startAge,
      endAge,
      growth,
      isDebt,
      enabled: true
    };

    if (idx >= 0 && idx < plan.expenses.length) {
      plan.expenses[idx] = expData;
    } else {
      plan.expenses.push(expData);
    }

    savePlansToStorage();
    closeExpenseModal();
    renderExpenseStreamsList();
    updateCashflowBalanceUI(plan);
    updateAll();
  }

  function openIncomeModal(idx = -1) {
    try {
      const plan = getActivePlan() || {};
      const modal = document.getElementById("income-modal");
      if (!modal) return;
      const title = document.getElementById("income-modal-title");
      const cur = (window.AppState && window.AppState.getCurrency ? window.AppState.getCurrency() : null) || state?.currency || plan.currency || 'EUR';
      const curSymbol = window.RetirementEngine?.getCurrencySymbol ? window.RetirementEngine.getCurrencySymbol(cur) : (cur === 'VND' ? '₫' : cur === 'USD' ? '$' : '€');
      const unit = document.getElementById("modal-income-unit");
      const unitMonthly = document.getElementById("modal-income-unit-monthly");
      if (unit) unit.innerText = curSymbol;
      if (unitMonthly) unitMonthly.innerText = curSymbol;

      const inpIdx = document.getElementById("inp-income-idx");
      if (inpIdx) inpIdx.value = idx;

      if (idx >= 0 && Array.isArray(plan.incomes) && plan.incomes[idx]) {
        const stream = plan.incomes[idx];
        if (title) title.innerText = `Chỉnh Sửa: ${stream.name || ''}`;
        setVal("inp-income-name", stream.name || "");
        setVal("inp-income-amount", stream.amount || 0);
        setVal("inp-income-amount-monthly", Math.round(Number(stream.amount || 0) / 12));
        setVal("inp-income-start", stream.startAge ?? (plan.currentAge || 29));
        setVal("inp-income-end", stream.endAge ?? (plan.retirementAge || 42));
        setVal("inp-income-growth", stream.growth !== undefined ? stream.growth : 3.5);
      } else {
        if (title) title.innerText = "Thêm Nguồn Thu Nhập Mới";
        setVal("inp-income-name", "");
        const defaultAnnual = cur === 'VND' ? 120000000 : 12000;
        setVal("inp-income-amount", defaultAnnual);
        setVal("inp-income-amount-monthly", Math.round(defaultAnnual / 12));
        setVal("inp-income-start", plan.currentAge || 29);
        setVal("inp-income-end", plan.retirementAge || 42);
        setVal("inp-income-growth", 3.5);
      }

      modal.style.display = "flex";
    } catch (err) {
      console.error("openIncomeModal error:", err);
    }
  }

  function closeIncomeModal() {
    const modal = document.getElementById("income-modal");
    if (modal) modal.style.display = "none";
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
    const plan = getActivePlan();
    const rawStart = document.getElementById("inp-income-start").value;
    const startAge = (rawStart !== "" && !isNaN(Number(rawStart))) ? Number(rawStart) : (plan.currentAge || 29);
    const endAge = Number(document.getElementById("inp-income-end").value) || 85;
    const growth = Number(document.getElementById("inp-income-growth").value) || 0;
    if (!Array.isArray(plan.incomes)) plan.incomes = [];

    const isSpouseSalary = (/bạn đời|vợ|chồng|spouse|conjoint/i).test(name);
    const isSalary = (/lương|salary|impôt|impot/i).test(name);
    const isPrimarySalary = isSalary && !isSpouseSalary;

    const streamData = {
      name,
      amount,
      startAge,
      endAge,
      growth,
      taxable: true,
      isSalary,
      isPrimarySalary,
      isSpouseSalary
    };

    if (idx >= 0 && idx < plan.incomes.length) {
      plan.incomes[idx] = streamData;
    } else {
      plan.incomes.push(streamData);
    }

    if (isPrimarySalary) {
      plan.primarySalaryRemoved = false;
    }
    if (isSpouseSalary) {
      plan.spouseSalaryRemoved = false;
    }

    if (isSalary) {
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
    hideMilestoneForm();
    const modal = document.getElementById("milestone-modal");
    if (modal) modal.style.display = "none";
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

          const patBadge = ms.source === 'patrimoine' ? `<span class="badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 4px; margin-left: 0.4rem;">Đồng bộ BĐS</span>` : '';
          item.innerHTML = `
            <div class="custom-ms-left">
              <span class="custom-ms-icon"></span>
              <div class="custom-ms-details">
                <span class="custom-ms-title">${ms.age} tuổi • ${ms.name}${patBadge}</span>
                <span class="custom-ms-sub">${amtStr}${ms.note ? ' • ' + ms.note : ''}</span>
              </div>
            </div>
            <div class="custom-ms-actions">
              <button type="button" class="income-item-btn btn-edit-ms" data-idx="${idx}" title="Chỉnh sửa sự kiện" style="padding: 0.25rem 0.6rem; font-weight: 600;">Sửa</button>
              <button type="button" class="income-item-btn income-item-del btn-del-ms" data-idx="${idx}" title="Xóa sự kiện" style="padding: 0.25rem 0.6rem;">Xóa</button>
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
              icon: "",
              title: "Xác nhận xóa cột mốc",
              message: `Bạn có chắc chắn muốn xóa cột mốc <strong>"${msName}"</strong>?`,
              confirmText: "Xóa cột mốc",
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
      document.getElementById("inp-ms-icon").value = "";
      document.getElementById("inp-ms-type").value = ms.type || "expense";
      document.getElementById("inp-ms-amount").value = ms.amount || 30000;
      document.getElementById("inp-ms-note").value = ms.note || "";
    } else {
      title.innerText = "Thêm Sự Kiện Cột Mốc Mới";
      document.getElementById("inp-ms-id").value = -1;
      document.getElementById("inp-ms-name").value = "";
      document.getElementById("inp-ms-age").value = 35;
      document.getElementById("inp-ms-icon").value = "";
      document.getElementById("inp-ms-type").value = "expense";
      const defaultAmt = state.currency === 'VND' ? 500000000 : 30000;
      document.getElementById("inp-ms-amount").value = defaultAmt;
      document.getElementById("inp-ms-note").value = "";
    }
    setTimeout(() => {
      form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const nameInp = document.getElementById("inp-ms-name");
      if (nameInp) nameInp.focus();
    }, 60);
  }

  function hideMilestoneForm() {
    const form = document.getElementById("milestone-edit-form");
    if (form) form.style.display = "none";
  }

  function saveMilestoneFromForm() {
    const name = document.getElementById("inp-ms-name").value.trim();
    if (!name) {
      alert("Vui lòng nhập tên sự kiện!");
      return;
    }
    const idx = Number(document.getElementById("inp-ms-id").value);
    const age = Number(document.getElementById("inp-ms-age").value) || 35;
    const icon = "";
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

  function openActualNetWorthModal() {
    const modal = document.getElementById("actual-networth-modal");
    if (!modal) return;

    // Update currency units in modal
    const curSymbol = window.RetirementEngine.getCurrencySymbol(state.currency);
    document.querySelectorAll(".unit-actual-currency").forEach(el => el.innerText = curSymbol);

    // Default date to today (YYYY-MM-DD) if empty
    const inpDate = document.getElementById("inp-actual-date");
    if (inpDate && !inpDate.value) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      inpDate.value = `${yyyy}-${mm}-${dd}`;
    }

    renderActualRecordsTable();
    modal.style.display = "flex";
  }

  function closeActualNetWorthModal() {
    const modal = document.getElementById("actual-networth-modal");
    if (modal) modal.style.display = "none";
  }

  function renderActualRecordsTable() {
    const tbody = document.getElementById("actual-records-table-body");
    const countEl = document.getElementById("actual-records-count");
    if (!tbody) return;

    tbody.innerHTML = "";
    const plan = getActivePlan();
    if (!plan) return;

    if (!Array.isArray(plan.actualRecords)) {
      plan.actualRecords = [];
    }

    if (countEl) countEl.innerText = `${plan.actualRecords.length} mốc`;

    if (plan.actualRecords.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:1.5rem 0;">Chưa có mốc số dư nào. Hãy thêm mốc mới bên trên hoặc bấm lấy nhanh từ Patrimoine!</td></tr>`;
      return;
    }

    // Sort descending by date
    const sorted = [...plan.actualRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    const curBirthYear = Number(plan.birthYear) || (new Date().getFullYear() - (Number(plan.currentAge) || 29));

    sorted.forEach(rec => {
      const tr = document.createElement("tr");
      const d = new Date(rec.date);
      const yr = !isNaN(d.getFullYear()) ? d.getFullYear() : '—';
      const ageVal = !isNaN(d.getFullYear()) ? (yr - curBirthYear) : '—';
      const formattedDate = rec.date ? rec.date.split("-").reverse().join("/") : "—";
      const formattedAmt = window.RetirementEngine.formatCurrency(rec.amount, state.currency);

      tr.innerHTML = `
        <td style="font-weight:600; color:var(--text-main);">${formattedDate}</td>
        <td><span class="badge" style="background:rgba(245,158,11,0.15); color:#f59e0b; font-size:0.75rem;">Năm ${yr} (${ageVal}t)</span></td>
        <td class="font-mono" style="color:#f59e0b; font-weight:700;">${formattedAmt}</td>
        <td style="color:var(--text-muted); font-size:0.78rem;">${rec.note ? escapeHtml(rec.note) : '<em>Không có</em>'}</td>
        <td style="text-align:right;">
          <button type="button" class="btn btn-xs btn-ghost btn-delete-actual-rec" data-id="${rec.id}" style="color:#ef4444;" title="Xóa mốc này">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach delete listeners
    tbody.querySelectorAll(".btn-delete-actual-rec").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        if (id) deleteActualRecord(id);
      });
    });
  }

  function addActualRecordFromForm() {
    const plan = getActivePlan();
    if (!plan) return;

    const inpDate = document.getElementById("inp-actual-date");
    const inpAmount = document.getElementById("inp-actual-amount");
    const inpNote = document.getElementById("inp-actual-note");

    const date = inpDate ? inpDate.value : "";
    const amountStr = inpAmount ? inpAmount.value.trim() : "";
    const note = inpNote ? inpNote.value.trim() : "";

    if (!date) {
      alert("Vui lòng chọn ngày ghi nhận số dư!");
      return;
    }

    const amount = Number(amountStr);
    if (isNaN(amount) || amountStr === "") {
      alert("Vui lòng nhập số tiền thực tế hợp lệ!");
      return;
    }

    if (!Array.isArray(plan.actualRecords)) {
      plan.actualRecords = [];
    }

    // Check if an entry with exact same date exists, ask or replace
    const existingIdx = plan.actualRecords.findIndex(r => r.date === date);
    if (existingIdx !== -1) {
      if (confirm(`Đã có bản ghi cho ngày ${date}. Bạn có muốn cập nhật lại số tiền không?`)) {
        plan.actualRecords[existingIdx].amount = amount;
        plan.actualRecords[existingIdx].note = note;
      } else {
        return;
      }
    } else {
      plan.actualRecords.push({
        id: "act_" + Date.now(),
        date,
        amount,
        note
      });
    }

    savePlansToStorage();
    renderActualRecordsTable();
    updateAll();

    // Clear amount & note input
    if (inpAmount) inpAmount.value = "";
    if (inpNote) inpNote.value = "";
  }

  function deleteActualRecord(id) {
    const plan = getActivePlan();
    if (!plan || !Array.isArray(plan.actualRecords)) return;

    if (!confirm("Bạn có chắc chắn muốn xóa mốc số dư thực tế này?")) return;

    plan.actualRecords = plan.actualRecords.filter(r => r.id !== id);
    savePlansToStorage();
    renderActualRecordsTable();
    updateAll();
  }

  async function fetchPatrimoineBalanceForActual() {
    const btn = document.getElementById("btn-fetch-patrimoine-balance");
    if (btn) btn.innerText = "Đang tính toán...";

    try {
      const data = await fetchPatrimoineData();
      const plan = getActivePlan();
      if (!plan) throw new Error("Không tìm thấy kế hoạch đang kích hoạt");

      let totalVal = 0;
      if (data && data.summary) {
        // Equity = Property Value - Loan Amount
        const equity = Math.max(0, (data.summary.total_property_value || 0) - (data.summary.total_loan_amount || 0));
        // Liquid savings from plan
        const savingsEur = Number(plan.currentSavings) || 0;
        const factor = eurToPlanFactor(plan);
        totalVal = Math.round((equity + savingsEur) * factor);
      } else {
        totalVal = Number(plan.currentSavings) || 0;
      }

      const inpDate = document.getElementById("inp-actual-date");
      const inpAmount = document.getElementById("inp-actual-amount");
      const inpNote = document.getElementById("inp-actual-note");

      const today = new Date().toISOString().split("T")[0];
      if (inpDate) inpDate.value = today;
      if (inpAmount) inpAmount.value = totalVal;
      if (inpNote && !inpNote.value) inpNote.value = "Chốt từ Quản lý Tài sản (Patrimoine)";

      if (btn) btn.innerText = "Đã lấy thành công";
      setTimeout(() => {
        if (btn) btn.innerText = "Lấy số dư hiện tại từ Patrimoine";
      }, 1800);
    } catch (err) {
      console.warn("Lỗi lấy số dư từ Patrimoine:", err);
      alert("Không thể lấy số dư tự động: " + err.message);
      if (btn) btn.innerText = "Lấy số dư hiện tại từ Patrimoine";
    }
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

  function openModal(title, mode = 'create') {
    const modal = document.getElementById("plan-modal");
    if (!modal) return;
    modal.dataset.mode = mode;
    const titleEl = document.getElementById("plan-modal-title");
    if (titleEl) {
      titleEl.innerText = title || (mode === 'edit' ? "Chỉnh sửa Kế hoạch & Thiết Lập Hồ Sơ" : "Tạo Kế hoạch Mới & Thiết Lập Hồ Sơ");
    }

    const curPlan = (typeof getActivePlan === 'function') ? getActivePlan() : null;
    const nameInp = document.getElementById("inp-new-plan-name");
    const famSingle = document.getElementById("btn-plan-fam-single");
    const famMarried = document.getElementById("btn-plan-fam-married");
    const modeDomestic = document.getElementById("btn-plan-mode-domestic");
    const modeRelocate = document.getElementById("btn-plan-mode-relocate");
    const modeHybrid = document.getElementById("btn-plan-mode-hybrid");
    const workSelect = document.getElementById("inp-plan-work-city");
    const retireSelect = document.getElementById("inp-plan-retire-city");
    const arrowTransition = document.getElementById("arrow-plan-transition");
    const tagRetirePpp = document.getElementById("tag-plan-retire-ppp");

    if (mode === 'edit' && curPlan) {
      if (nameInp) nameInp.value = curPlan.name || "";
      const userGender = curPlan.gender || 'male';
      setPlanGender(userGender);

      const isMarried = curPlan.maritalStatus === 'married';
      if (famSingle) famSingle.classList.toggle("active", !isMarried);
      if (famMarried) famMarried.classList.toggle("active", isMarried);

      const rMode = curPlan.retireMode || (curPlan.workCountry === curPlan.retireCountry ? 'domestic' : 'relocate');
      const isDomestic = (rMode === 'domestic');
      if (modeDomestic) modeDomestic.classList.toggle("active", isDomestic);
      if (modeRelocate) modeRelocate.classList.toggle("active", !isDomestic);
      if (modeHybrid) modeHybrid.classList.remove("active");

      if (workSelect) workSelect.value = curPlan.workCity || 'fr_paris';
      if (retireSelect) {
        if (isDomestic) {
          retireSelect.value = workSelect ? workSelect.value : (curPlan.workCity || 'fr_paris');
          retireSelect.disabled = true;
          retireSelect.style.opacity = '0.7';
          if (arrowTransition) arrowTransition.textContent = '=';
        } else {
          retireSelect.value = curPlan.retireCity || 'vn_hcm_hn';
          retireSelect.disabled = false;
          retireSelect.style.opacity = '1';
          if (arrowTransition) arrowTransition.textContent = '➔';
        }
      }
    } else {
      if (nameInp) nameInp.value = "";
      setPlanGender('male');
      if (famSingle) famSingle.classList.add("active");
      if (famMarried) famMarried.classList.remove("active");
      if (modeDomestic) modeDomestic.classList.remove("active");
      if (modeRelocate) modeRelocate.classList.add("active");
      if (modeHybrid) modeHybrid.classList.remove("active");
      if (workSelect) workSelect.value = 'fr_paris';
      if (retireSelect) {
        retireSelect.value = 'vn_hcm_hn';
        retireSelect.disabled = false;
        retireSelect.style.opacity = '1';
      }
      if (arrowTransition) arrowTransition.textContent = '➔';
    }

    updatePlanModalPppTags();
    modal.style.display = "flex";
  }

  function updatePlanModalPppTags() {
    const workSelect = document.getElementById("inp-plan-work-city");
    const retireSelect = document.getElementById("inp-plan-retire-city");
    const flagWork = document.getElementById("flag-plan-work");
    const flagRetire = document.getElementById("flag-plan-retire");
    const tagRetirePpp = document.getElementById("tag-plan-retire-ppp");
    const arrowTransition = document.getElementById("arrow-plan-transition");
    const isDomestic = document.getElementById("btn-plan-mode-domestic")?.classList.contains("active");

    const pppProfiles = (window.TaxOptimizer && window.TaxOptimizer.COUNTRY_PPP_PROFILES) ? window.TaxOptimizer.COUNTRY_PPP_PROFILES : {};
    const workKey = workSelect ? workSelect.value : 'fr_paris';
    const retireKey = (isDomestic) ? workKey : (retireSelect ? retireSelect.value : 'vn_hcm_hn');

    const workProfile = pppProfiles[workKey] || { ppp: 1.0, flag: '🇫🇷', countryLabel: 'Pháp' };
    const retireProfile = pppProfiles[retireKey] || { ppp: 0.45, flag: '🇻🇳', countryLabel: 'Việt Nam' };

    if (flagWork) {
      flagWork.textContent = workProfile.flag || '📍';
    }
    if (flagRetire) {
      flagRetire.textContent = retireProfile.flag || '📍';
    }

    if (tagRetirePpp) {
      if (isDomestic || workKey === retireKey) {
        tagRetirePpp.textContent = '100% Cùng chi phí';
        if (arrowTransition) arrowTransition.textContent = '=';
      } else {
        if (arrowTransition) arrowTransition.textContent = '➔';
        const ratio = (retireProfile.ppp / workProfile.ppp) - 1;
        const pct = Math.round(Math.abs(ratio) * 100);
        if (ratio < 0) {
          tagRetirePpp.textContent = `Giảm ~${pct}% chi phí`;
        } else if (ratio > 0) {
          tagRetirePpp.textContent = `Tăng ~${pct}% chi phí`;
        } else {
          tagRetirePpp.textContent = 'Cùng mức chi phí';
        }
      }
    }

    // Cập nhật % chi phí (+% / -%) ở bên phải từng vùng trong danh sách Nơi bạn có thể đến
    updateRetireCityOptionsDiff(workKey);
  }

  /**
   * Cập nhật nhãn hiển thị % chi phí (+% hoặc -%) ở bên phải từng vùng trong danh sách 'Nơi bạn có thể đến'
   */
  function updateRetireCityOptionsDiff(workKey) {
    const retireSelect = document.getElementById("inp-plan-retire-city");
    if (!retireSelect) return;

    const currentWorkKey = workKey || document.getElementById("inp-plan-work-city")?.value || 'fr_paris';
    const pppProfiles = (window.TaxOptimizer && window.TaxOptimizer.COUNTRY_PPP_PROFILES) ? window.TaxOptimizer.COUNTRY_PPP_PROFILES : {};
    const workProfile = pppProfiles[currentWorkKey] || { ppp: 1.0 };
    const workPpp = Number(workProfile.ppp) || 1.0;

    const options = retireSelect.querySelectorAll("option");
    options.forEach(opt => {
      if (!opt.dataset.baseText) {
        opt.dataset.baseText = opt.textContent.trim().replace(/\s*\([+-]?\d+%\)$/, '').trim();
      }
      const base = opt.dataset.baseText;
      const optVal = opt.value;

      if (optVal === 'custom' || !pppProfiles[optVal] || typeof pppProfiles[optVal].ppp !== 'number') {
        opt.textContent = base;
        return;
      }

      const destPpp = pppProfiles[optVal].ppp;
      const ratio = (destPpp / workPpp) - 1;
      const pct = Math.round(ratio * 100);

      let pctBadge = '';
      if (pct > 0) {
        pctBadge = `(+${pct}%)`;
      } else if (pct < 0) {
        pctBadge = `(-${Math.abs(pct)}%)`;
      } else {
        pctBadge = `(0%)`;
      }

      opt.textContent = `${base} ${pctBadge}`;
    });
  }

  /**
   * Chuyển đổi giới tính người lập kế hoạch (male: Nam, female: Nữ)
   */
  function setPlanGender(gender) {
    const btnMale = document.getElementById("btn-plan-gender-male");
    const btnFemale = document.getElementById("btn-plan-gender-female");
    if (gender === 'female') {
      if (btnFemale) btnFemale.classList.add("active");
      if (btnMale) btnMale.classList.remove("active");
    } else {
      if (btnMale) btnMale.classList.add("active");
      if (btnFemale) btnFemale.classList.remove("active");
    }
  }

  /**
   * Chuyển đổi đối tượng kế hoạch (single: Cá nhân, married: Cặp đôi)
   */
  function setPlanFamily(family) {
    const famSingle = document.getElementById("btn-plan-fam-single");
    const famMarried = document.getElementById("btn-plan-fam-married");
    if (family === 'married') {
      if (famMarried) famMarried.classList.add("active");
      if (famSingle) famSingle.classList.remove("active");
    } else {
      if (famSingle) famSingle.classList.add("active");
      if (famMarried) famMarried.classList.remove("active");
    }
  }

  /**
   * Chuyển đổi chế độ nơi sinh sống (domestic: chỉ 1 nơi, relocate: nhiều nơi)
   */
  function setPlanRetireMode(mode) {
    const btnDomestic = document.getElementById('btn-plan-mode-domestic');
    const btnRelocate = document.getElementById('btn-plan-mode-relocate');
    const retireSelect = document.getElementById('inp-plan-retire-city');
    const workSelect = document.getElementById('inp-plan-work-city');
    const arrowTransition = document.getElementById('arrow-plan-transition');

    if (mode === 'domestic') {
      if (btnDomestic) btnDomestic.classList.add('active');
      if (btnRelocate) btnRelocate.classList.remove('active');
      if (arrowTransition) arrowTransition.textContent = '=';
      if (retireSelect) {
        if (workSelect) retireSelect.value = workSelect.value;
        retireSelect.disabled = true;
        retireSelect.style.opacity = '0.7';
      }
    } else {
      if (btnDomestic) btnDomestic.classList.remove('active');
      if (btnRelocate) btnRelocate.classList.add('active');
      if (arrowTransition) arrowTransition.textContent = '➔';
      if (retireSelect) {
        retireSelect.disabled = false;
        retireSelect.style.opacity = '1';
      }
    }
    updatePlanModalPppTags();
  }

  /**
   * Xử lý khi thay đổi địa điểm làm việc trong modal kế hoạch
   */
  function handlePlanWorkCityChange(val) {
    const btnDomestic = document.getElementById('btn-plan-mode-domestic');
    const btnRelocate = document.getElementById('btn-plan-mode-relocate');
    const retireSelect = document.getElementById('inp-plan-retire-city');
    const arrowTransition = document.getElementById('arrow-plan-transition');

    const pppProfiles = (window.TaxOptimizer && window.TaxOptimizer.COUNTRY_PPP_PROFILES) ? window.TaxOptimizer.COUNTRY_PPP_PROFILES : {};
    const workCountry = pppProfiles[val]?.countryCode || 'FR';
    const retireCountry = pppProfiles[retireSelect?.value]?.countryCode || 'VN';

    if (btnDomestic && btnDomestic.classList.contains('active')) {
      if (retireSelect) retireSelect.value = val;
    } else if (retireSelect && (retireSelect.value === val || workCountry === retireCountry)) {
      // Khi chọn nơi làm việc cùng quốc gia với nơi nghỉ hưu
      if (btnDomestic) btnDomestic.classList.add('active');
      if (btnRelocate) btnRelocate.classList.remove('active');
      if (retireSelect) {
        retireSelect.value = val;
        retireSelect.disabled = true;
        retireSelect.style.opacity = '0.7';
      }
      if (arrowTransition) arrowTransition.textContent = '=';
    }
    updatePlanModalPppTags();
  }

  function closeModal() {
    const modal = document.getElementById("plan-modal");
    if (modal) modal.style.display = "none";
  }

  function saveNewPlanFromModal() {
    const nameInp = document.getElementById("inp-new-plan-name");
    const nameInput = nameInp ? nameInp.value.trim() : "";
    if (!nameInput) {
      if (typeof alert === 'function') alert("Vui lòng nhập tên kế hoạch!");
      return;
    }

    const modal = document.getElementById("plan-modal");
    const mode = modal?.dataset?.mode || 'create';

    const isFemale = document.getElementById("btn-plan-gender-female")?.classList.contains("active") || false;
    const userGender = isFemale ? 'female' : 'male';

    const isMarried = document.getElementById("btn-plan-fam-married")?.classList.contains("active") || false;
    const maritalStatus = isMarried ? 'married' : 'single';
    const taxParts = isMarried ? 2.0 : 1.0;

    const workCity = document.getElementById("inp-plan-work-city")?.value || 'fr_paris';
    const pppProfiles = (window.TaxOptimizer && window.TaxOptimizer.COUNTRY_PPP_PROFILES) ? window.TaxOptimizer.COUNTRY_PPP_PROFILES : {};
    const rawRetireCity = document.getElementById("inp-plan-retire-city")?.value || 'vn_hcm_hn';

    const workCountry = pppProfiles[workCity]?.countryCode || 'FR';
    const retireCountry = pppProfiles[rawRetireCity]?.countryCode || 'VN';

    let retireMode = 'relocate';
    if (document.getElementById("btn-plan-mode-domestic")?.classList.contains("active") || workCountry === retireCountry || workCity === rawRetireCity) {
      retireMode = 'domestic';
    }

    const retireCity = (retireMode === 'domestic') ? workCity : rawRetireCity;

    let targetPlan;
    if (mode === 'edit') {
      targetPlan = (typeof getActivePlan === 'function') ? getActivePlan() : null;
      if (!targetPlan) return;
      targetPlan.name = nameInput;
      targetPlan.gender = userGender;
      targetPlan.maritalStatus = maritalStatus;
      targetPlan.taxParts = taxParts;
      targetPlan.retireMode = retireMode;
      targetPlan.workCity = workCity;
      targetPlan.workCountry = workCountry;
      targetPlan.retireCity = retireCity;
      targetPlan.retireCountry = retireCountry;
    } else {
      const templateType = document.getElementById("inp-new-plan-template")?.value;
      const newId = "plan_" + Date.now();
      const basePlan = (typeof getActivePlan === 'function') ? getActivePlan() : null;
      targetPlan = basePlan ? JSON.parse(JSON.stringify(basePlan)) : {};
      targetPlan.id = newId;
      targetPlan.name = nameInput;
      targetPlan.gender = userGender;
      targetPlan.maritalStatus = maritalStatus;
      targetPlan.taxParts = taxParts;
      targetPlan.retireMode = retireMode;
      targetPlan.workCity = workCity;
      targetPlan.workCountry = workCountry;
      targetPlan.retireCity = retireCity;
      targetPlan.retireCountry = retireCountry;

      // Khởi tạo sạch sẽ khi người dùng lập kế hoạch làm việc tại Việt Nam
      if (workCountry === 'VN') {
        targetPlan.taxRegime = 'vietnam_standard';
        targetPlan.socialSecurityAnnual = 0;
        targetPlan.socialSecurityAge = isFemale ? 60 : 62;
        targetPlan.frenchAccounts = { peaBalance: 0, assuranceVieBalance: 0, livretABalance: 0, perBalance: 0 };

        // Loại bỏ các luồng thu nhập đặc thù Pháp từ template mẫu
        if (Array.isArray(targetPlan.incomes)) {
          targetPlan.incomes = targetPlan.incomes.filter(s => {
            if (!s) return false;
            const name = (s.name || "").toLowerCase();
            return !name.includes("lmnp") && !name.includes("turo") && !name.includes("pháp");
          });
        }

        const cur = targetPlan.currency || state.currency || 'EUR';
        const isVnd = (cur === 'VND');
        const defaultSalary = isVnd ? 360000000 : 14400; // ~30tr/tháng hoặc ~1.200€/tháng
        const defaultMonthlyRetire = isVnd ? 15000000 : 600; // ~15tr/tháng hoặc ~600€/tháng

        targetPlan.baseRetireMonthly = defaultMonthlyRetire;
        targetPlan.retirementExpenses = defaultMonthlyRetire * 12;
        targetPlan.annualExpenses = Math.round(defaultSalary * 0.65);
        targetPlan.annualSavings = Math.round(defaultSalary * 0.35);
        targetPlan.currentSavings = isVnd ? 100000000 : 5000;

        let primarySalary = targetPlan.incomes.find(s => s && (s.isPrimarySalary || /lương/i.test(s.name || "")));
        if (primarySalary) {
          primarySalary.name = "Lương hiện tại của bạn";
          primarySalary.amount = defaultSalary;
          primarySalary.growth = 3.5;
          primarySalary.isPrimarySalary = true;
          primarySalary.isSalary = true;
        } else {
          targetPlan.incomes.unshift({
            name: "Lương hiện tại của bạn",
            amount: defaultSalary,
            startAge: Number(targetPlan.currentAge) || 29,
            endAge: Number(targetPlan.retirementAge) || 60,
            growth: 3.5,
            taxable: true,
            isSalary: true,
            isPrimarySalary: true
          });
        }
      }

      // Khi Tạo Kế hoạch Hưu trí Mới:
      if (isMarried) {
        targetPlan.primarySalaryRemoved = false;
        targetPlan.spouseSalaryRemoved = false;
        if (!Array.isArray(targetPlan.incomes)) targetPlan.incomes = [];

        const cur = targetPlan.currency || state.currency || 'EUR';
        const curAge = Number(targetPlan.currentAge) || 29;
        const rAge = Number(targetPlan.retirementAge) || 43;
        const curYear = new Date().getFullYear();
        const spouseBYear = Number(targetPlan.spouseBirthYear) || (curYear - (Number(targetPlan.spouseAge) || curAge));
        const spouseAge = curYear - spouseBYear;

        // 1. Đảm bảo có thẻ "Lương hiện tại của bạn"
        let primarySalary = targetPlan.incomes.find(s => s && (s.isPrimarySalary || /lương hiện tại của bạn|lương chính/i.test(s.name || "")));
        if (!primarySalary) {
          primarySalary = targetPlan.incomes.find(s => s && !s.isBhxhVn && !s.isSpouseSalary && (/lương|salary/i.test(s.name || "")));
        }

        if (!primarySalary) {
          const defaultAmt = cur === 'VND' ? 250000000 : (cur === 'USD' ? 30000 : 25000);
          primarySalary = {
            name: "Lương hiện tại của bạn",
            amount: defaultAmt,
            startAge: curAge,
            endAge: rAge,
            growth: 2.5,
            taxable: true,
            isSalary: true,
            isPrimarySalary: true
          };
          targetPlan.incomes.unshift(primarySalary);
        } else {
          primarySalary.name = "Lương hiện tại của bạn";
          primarySalary.isSalary = true;
          primarySalary.isPrimarySalary = true;
        }

        // 2. Đảm bảo có thẻ "Lương hiện tại của bạn đời"
        let spouseSalary = targetPlan.incomes.find(s => s && (s.isSpouseSalary || /lương.*(bạn đời|vợ|chồng)|salaire.*conjoint|spouse.*salary/i.test(s.name || "")));
        if (!spouseSalary) {
          const primaryAmt = Number(primarySalary ? primarySalary.amount : 0) || (cur === 'VND' ? 250000000 : 25000);
          const spouseAmt = Math.round((primaryAmt * 0.8) / 100) * 100;
          spouseSalary = {
            name: "Lương hiện tại của bạn đời",
            amount: spouseAmt,
            startAge: spouseAge,
            endAge: rAge,
            growth: (primarySalary && primarySalary.growth !== undefined && primarySalary.growth !== null) ? primarySalary.growth : 2.5,
            taxable: true,
            isSalary: true,
            isSpouseSalary: true
          };
          const pIdx = targetPlan.incomes.indexOf(primarySalary);
          if (pIdx >= 0) {
            targetPlan.incomes.splice(pIdx + 1, 0, spouseSalary);
          } else {
            targetPlan.incomes.push(spouseSalary);
          }
        } else {
          spouseSalary.name = "Lương hiện tại của bạn đời";
          spouseSalary.isSalary = true;
          spouseSalary.isSpouseSalary = true;
        }
      } else {
        // Hồ sơ 1 người (Cá nhân): loại bỏ thẻ bạn đời nếu có sao chép từ basePlan
        targetPlan.primarySalaryRemoved = false;
        if (Array.isArray(targetPlan.incomes)) {
          targetPlan.incomes = targetPlan.incomes.filter(s => {
            if (!s || typeof s !== 'object') return false;
            const isSpouse = s.isSpouseSalary || /lương.*(bạn đời|vợ|chồng)|salaire.*conjoint|spouse.*salary/i.test(s.name || "");
            return !isSpouse;
          });
        }
      }

      state.plansData.plans[newId] = targetPlan;
      state.plansData.activePlanId = newId;
    }

    if (isMarried) {
      targetPlan.spouseSalaryRemoved = false;
    }
    if (window.AppState && typeof window.AppState.ensurePlanDefaults === 'function') {
      window.AppState.ensurePlanDefaults(targetPlan);
    }

    // Tự động tính lại chi tiêu hưu trí từ dòng tiền hiện tại nếu có
    if (window.TaxOptimizer && typeof window.TaxOptimizer.calculateRetireBudgetFromCashflow === 'function') {
      const monthlySavings = (Number(targetPlan.annualSavings) || 0) / 12;
      let monthlyIncome = 0;
      if (Array.isArray(targetPlan.incomes)) {
        targetPlan.incomes.forEach(inc => {
          if (inc.enabled !== false && (inc.isSalary || !inc.isBhxhVn)) {
            monthlyIncome += (Number(inc.amount) || 0) / 12;
          }
        });
      }
      if (monthlyIncome > 0 && monthlyIncome > monthlySavings) {
        const budgetRes = window.TaxOptimizer.calculateRetireBudgetFromCashflow({
          monthlyNetIncome: monthlyIncome,
          monthlySavings: monthlySavings,
          monthlyMortgagePaidOff: Number(targetPlan.monthlyMortgagePaidOff) || 0,
          workCityKey: targetPlan.workCity,
          retireCityKey: targetPlan.retireCity,
          retireMode: targetPlan.retireMode,
          householdSize: isMarried ? 2 : 1
        });
        if (budgetRes && budgetRes.annualRetireTotal > 0) {
          targetPlan.retirementExpenses = budgetRes.annualRetireTotal;
        }
      }
    }

    if (typeof savePlansToStorage === 'function') savePlansToStorage();
    closeModal();
    if (typeof renderPlanSelector === 'function') renderPlanSelector();
    if (typeof renderActivePlanInputs === 'function') renderActivePlanInputs();
    if (typeof updateAll === 'function') updateAll();
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
      icon: "",
      title: "Xác nhận xóa kế hoạch",
      message: `Bạn có chắc chắn muốn xóa kế hoạch <strong>"${cur.name}"</strong>?<br><span style="font-size:0.75rem; color:#f87171; margin-top:6px; display:inline-block;">Hành động này không thể hoàn tác.</span>`,
      confirmText: "Xóa kế hoạch",
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

  /* ==========================================================================
     Onboarding Quick Setup Wizard (Thiết Lập Nhanh 4 Bước)
     ========================================================================== */
  let wizardCurrentStep = 1;

  function initQuickSetupWizard() {
    const modal = document.getElementById("quick-setup-modal");
    if (!modal) return;

    // Trigger buttons (header, sidebar, callout banner)
    document.querySelectorAll(".btn-trigger-quick-setup").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openQuickSetupWizard();
      });
    });
    const headerQuickBtn = document.getElementById("btn-quick-setup");
    if (headerQuickBtn) {
      headerQuickBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openQuickSetupWizard();
      });
    }

    // Close / Skip buttons
    document.getElementById("btn-close-quick-setup")?.addEventListener("click", closeQuickSetupWizard);
    document.getElementById("btn-wz-skip")?.addEventListener("click", () => {
      localStorage.setItem("pyretrait_quick_setup_done", "true");
      closeQuickSetupWizard();
    });

    // Modal background click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeQuickSetupWizard();
    });

    // Step indicators click
    document.querySelectorAll(".wizard-step-indicator").forEach(ind => {
      ind.addEventListener("click", () => {
        const step = Number(ind.getAttribute("data-step"));
        if (step) showWizardStep(step);
      });
    });

    // Navigation buttons
    document.getElementById("btn-wz-prev")?.addEventListener("click", () => {
      if (wizardCurrentStep > 1) {
        showWizardStep(wizardCurrentStep - 1);
      }
    });

    document.getElementById("btn-wz-next")?.addEventListener("click", () => {
      if (wizardCurrentStep < 4) {
        showWizardStep(wizardCurrentStep + 1);
      } else {
        applyWizardAndCalculate();
      }
    });

    // Step 1: 2-way sync birth year and current age
    const wzBirthYear = document.getElementById("wz-birth-year");
    const wzCurAge = document.getElementById("wz-cur-age");
    if (wzBirthYear && wzCurAge) {
      wzBirthYear.addEventListener("input", () => {
        const curYear = new Date().getFullYear();
        const by = Number(wzBirthYear.value);
        if (by >= 1940 && by <= curYear) {
          wzCurAge.value = Math.max(18, curYear - by);
        }
      });
      wzCurAge.addEventListener("input", () => {
        const curYear = new Date().getFullYear();
        const age = Number(wzCurAge.value);
        if (age >= 18 && age <= 100) {
          wzBirthYear.value = curYear - age;
        }
      });
    }

    // Quick pill buttons (for wz-retire-age and wz-savings)
    document.querySelectorAll(".btn-quick-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const targetId = pill.getAttribute("data-target");
        const val = pill.getAttribute("data-val");
        const input = document.getElementById(targetId);
        if (input && val !== null) {
          input.value = val;
          input.dispatchEvent(new Event("input"));
          pill.parentElement.querySelectorAll(".btn-quick-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
        }
      });
    });

    // Step 2: Annual savings to monthly calculation text
    const wzAnnualSav = document.getElementById("wz-annual-savings");
    const wzMonthlySavCalc = document.getElementById("wz-monthly-savings-calc");
    if (wzAnnualSav && wzMonthlySavCalc) {
      wzAnnualSav.addEventListener("input", () => {
        const annual = Number(wzAnnualSav.value) || 0;
        const cur = state.currency || 'EUR';
        const monthly = Math.round(annual / 12);
        wzMonthlySavCalc.textContent = `${window.RetirementEngine.formatCurrency(monthly, cur)}/tháng`;
      });
    }

    // Step 3: Preset cards for monthly spend
    const wzMonthlySpend = document.getElementById("wz-monthly-spend");
    const wzAnnualSpendCalc = document.getElementById("wz-annual-spend-calc");
    document.querySelectorAll("#wizard-step-3 .wizard-preset-card").forEach(card => {
      card.addEventListener("click", () => {
        document.querySelectorAll("#wizard-step-3 .wizard-preset-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        const spend = card.getAttribute("data-spend");
        if (spend && wzMonthlySpend) {
          wzMonthlySpend.value = spend;
          updateSpendCalcText();
        }
      });
    });
    if (wzMonthlySpend) {
      wzMonthlySpend.addEventListener("input", () => {
        updateSpendCalcText();
        const curVal = wzMonthlySpend.value;
        document.querySelectorAll("#wizard-step-3 .wizard-preset-card").forEach(c => {
          if (c.getAttribute("data-spend") === curVal) {
            c.classList.add("active");
          } else {
            c.classList.remove("active");
          }
        });
      });
    }

    function updateSpendCalcText() {
      if (!wzMonthlySpend || !wzAnnualSpendCalc) return;
      const m = Number(wzMonthlySpend.value) || 0;
      const cur = state.currency || 'EUR';
      wzAnnualSpendCalc.textContent = `${window.RetirementEngine.formatCurrency(m * 12, cur)}/năm`;
    }

    // Step 4: Preset cards for investment return & risk
    document.querySelectorAll("#wizard-step-4 .wizard-preset-card").forEach(card => {
      card.addEventListener("click", () => {
        document.querySelectorAll("#wizard-step-4 .wizard-preset-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
      });
    });
  }

  function openQuickSetupWizard() {
    const modal = document.getElementById("quick-setup-modal");
    if (!modal) return;

    const plan = getActivePlan();
    const cur = state.currency || plan?.currency || 'EUR';
    const sym = cur === 'VND' ? '₫' : (cur === 'USD' ? '$' : '€');

    // Update symbols in wizard modal
    document.querySelectorAll(".wz-currency-sym").forEach(el => el.textContent = sym);

    if (plan) {
      const curYear = new Date().getFullYear();
      const bYear = Number(plan.birthYear) || (curYear - (Number(plan.currentAge) || 29));
      const curAge = Number(plan.currentAge) || (curYear - bYear);

      const wzCurAge = document.getElementById("wz-cur-age");
      if (wzCurAge) wzCurAge.value = curAge;

      const wzBirthYear = document.getElementById("wz-birth-year");
      if (wzBirthYear) wzBirthYear.value = bYear;

      const wzRetireAge = document.getElementById("wz-retire-age");
      if (wzRetireAge) wzRetireAge.value = plan.retirementAge || 45;

      const wzLifeExp = document.getElementById("wz-life-exp");
      if (wzLifeExp) wzLifeExp.value = plan.lifeExpectancy || 85;

      const wzPlanName = document.getElementById("wz-plan-name");
      if (wzPlanName) wzPlanName.value = plan.name || "Kế hoạch Cá nhân Mới";

      const wzSavings = document.getElementById("wz-savings");
      if (wzSavings) wzSavings.value = plan.currentSavings !== undefined ? plan.currentSavings : 50000;

      const wzAnnualSav = document.getElementById("wz-annual-savings");
      if (wzAnnualSav) {
        wzAnnualSav.value = plan.annualSavings !== undefined ? plan.annualSavings : 12000;
        const monthly = Math.round(Number(wzAnnualSav.value) / 12);
        const monthlyCalc = document.getElementById("wz-monthly-savings-calc");
        if (monthlyCalc) monthlyCalc.textContent = `${window.RetirementEngine.formatCurrency(monthly, cur)}/tháng`;
      }

      const wzMonthlySpend = document.getElementById("wz-monthly-spend");
      const wzAnnualSpendCalc = document.getElementById("wz-annual-spend-calc");
      const monthlySpend = plan.baseRetireMonthly || (plan.retirementExpenses ? Math.round(plan.retirementExpenses / 12) : 2500);
      if (wzMonthlySpend) {
        wzMonthlySpend.value = monthlySpend;
        if (wzAnnualSpendCalc) {
          wzAnnualSpendCalc.textContent = `${window.RetirementEngine.formatCurrency(monthlySpend * 12, cur)}/năm`;
        }
      }
    }

    showWizardStep(1);
    modal.style.display = "flex";
  }

  function closeQuickSetupWizard() {
    const modal = document.getElementById("quick-setup-modal");
    if (modal) modal.style.display = "none";
  }

  function showWizardStep(step) {
    wizardCurrentStep = step;

    for (let i = 1; i <= 4; i++) {
      const pane = document.getElementById(`wizard-step-${i}`);
      if (pane) pane.classList.toggle("active", i === step);
    }

    document.querySelectorAll(".wizard-step-indicator").forEach(ind => {
      const s = Number(ind.getAttribute("data-step"));
      ind.classList.toggle("active", s === step);
      ind.classList.toggle("completed", s < step);
    });

    const prevBtn = document.getElementById("btn-wz-prev");
    if (prevBtn) prevBtn.style.visibility = step === 1 ? "hidden" : "visible";

    const nextBtn = document.getElementById("btn-wz-next");
    if (nextBtn) {
      if (step === 4) {
        nextBtn.textContent = "Hoàn tất & Tính toán";
      } else {
        nextBtn.textContent = "Tiếp tục ➔";
      }
    }
  }

  function applyWizardAndCalculate() {
    const plan = getActivePlan();
    if (!plan) return;

    // Step 1
    const curYear = new Date().getFullYear();
    const birthYear = Number(document.getElementById("wz-birth-year")?.value) || 1997;
    const currentAge = curYear - birthYear;
    const retirementAge = Number(document.getElementById("wz-retire-age")?.value) || 45;
    const lifeExpectancy = Number(document.getElementById("wz-life-exp")?.value) || 85;
    const planName = document.getElementById("wz-plan-name")?.value.trim() || plan.name;

    // Step 2
    const currentSavings = Number(document.getElementById("wz-savings")?.value) || 0;
    const annualSavings = Number(document.getElementById("wz-annual-savings")?.value) || 0;

    // Step 3
    const monthlySpend = Number(document.getElementById("wz-monthly-spend")?.value) || 2500;
    const retirementExpenses = monthlySpend * 12;

    // Step 4
    const activeRisk = document.querySelector("#wizard-step-4 .wizard-preset-card.active");
    const invReturn = Number(activeRisk?.getAttribute("data-return")) || 6.5;
    const inflation = Number(activeRisk?.getAttribute("data-inf")) || 2.2;

    // Apply to plan
    plan.name = planName;
    plan.birthYear = birthYear;
    plan.currentAge = currentAge;
    plan.retirementAge = retirementAge;
    plan.lifeExpectancy = lifeExpectancy;
    plan.currentSavings = currentSavings;
    plan.annualSavings = annualSavings;
    plan.annualExpenses = Math.round(annualSavings > 0 ? (annualSavings * 1.5) : (monthlySpend * 12));
    plan.retirementExpenses = retirementExpenses;
    plan.baseRetireMonthly = monthlySpend;
    plan.investmentReturnPre = invReturn;
    plan.investmentReturnPost = Math.max(3.0, +(invReturn - 1.5).toFixed(1));
    plan.inflation = inflation;

    // Save and re-render
    savePlansToStorage();
    renderPlanSelector();
    renderActivePlanInputs();
    updateAll();

    localStorage.setItem("pyretrait_quick_setup_done", "true");
    closeQuickSetupWizard();
  }

  const ModalsExports = {
    init: initModals,
    bindEvents: bindModalEvents,
    showConfirmDialog,
    closeConfirmDialog,
    openFormulaModal,
    closeFormulaModal,
    openFeatureIntroModal,
    closeFeatureIntroModal,
    openExpenseModal,
    syncExpenseGrowthVisibility,
    closeExpenseModal,
    saveExpenseFromModal,
    openIncomeModal,
    closeIncomeModal,
    saveIncomeFromModal,
    openMilestoneModal,
    closeMilestoneModal,
    renderModalMilestonesContent,
    showMilestoneForm,
    hideMilestoneForm,
    saveMilestoneFromForm,
    openActualNetWorthModal,
    closeActualNetWorthModal,
    renderActualRecordsTable,
    addActualRecordFromForm,
    deleteActualRecord,
    fetchPatrimoineBalanceForActual,
    renderPlanSelector,
    openModal,
    closeModal,
    saveNewPlanFromModal,
    duplicateCurrentPlan,
    deleteCurrentPlan,
    handleJSONImport,
    initQuickSetupWizard,
    openQuickSetupWizard,
    closeQuickSetupWizard,
    showWizardStep,
    applyWizardAndCalculate,
    updatePlanModalPppTags,
    updateRetireCityOptionsDiff,
    setPlanGender,
    setPlanFamily,
    setPlanRetireMode,
    handlePlanWorkCityChange
  };

  window.ModalsUI = ModalsExports;
  Object.assign(window, ModalsExports);

})();
