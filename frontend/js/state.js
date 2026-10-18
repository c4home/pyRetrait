/**
 * pyRetrait — Tầng 2: State Management & Data Persistence
 * Quản lý trạng thái ứng dụng, localStorage, đồng bộ API Cloud và Event Bus
 */

(function() {
  'use strict';

  const STORAGE_KEY = "pyRetrait_plans_v2";

  // Global Central State
  const state = {
    plansData: {
      activePlanId: "plan_franco_viet",
      plans: {}
    },
    currency: "EUR", // 'EUR', 'VND', 'USD'
    viewMode: "nominal", // 'nominal' | 'real'
    compareWithdrawals: false,
    compareStressScenarios: false,
    showMonteCarloFan: false,
    activeTab: "tab-projections",
    activeScenario: "baseline",
    charts: {}
  };

  // Event Listeners for Pub/Sub
  const listeners = {};

  function on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    return () => off(event, callback);
  }

  function off(event, callback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  }

  function emit(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(cb => {
        try { cb(data); } catch (err) { console.error(`Error in event listener for ${event}:`, err); }
      });
    }
  }

  function getState() {
    return state;
  }

  function getActivePlan() {
    if (!state.plansData || !state.plansData.plans) return null;
    const plan = state.plansData.plans[state.plansData.activePlanId] || Object.values(state.plansData.plans)[0] || null;
    if (plan) ensurePlanDefaults(plan);
    return plan;
  }

  function setActivePlanId(planId) {
    if (state.plansData && state.plansData.plans && state.plansData.plans[planId]) {
      state.plansData.activePlanId = planId;
      const plan = state.plansData.plans[planId];
      if (plan && plan.currency) {
        state.currency = plan.currency;
      }
      savePlansToStorage(false);
      emit('plan-changed', { planId, plan });
    }
  }

  function getCurrency() {
    return state.currency;
  }

  function setCurrency(curr) {
    state.currency = curr;
    emit('currency-changed', curr);
  }

  function getViewMode() {
    return state.viewMode;
  }

  function setViewMode(mode) {
    state.viewMode = mode;
    emit('viewmode-changed', mode);
  }

  function getActiveTab() {
    return state.activeTab;
  }

  function setActiveTab(tabId) {
    state.activeTab = tabId;
    emit('tab-changed', tabId);
  }

  function ensurePlanDefaults(plan) {
    if (!plan || typeof plan !== 'object') return plan;
    if (!plan.workCountry) plan.workCountry = 'FR';
    if (!plan.workCity) plan.workCity = 'fr_paris';
    if (!plan.retireCountry) plan.retireCountry = 'VN';
    if (!plan.retireCity) plan.retireCity = 'vn_hcm_hn';
    if (!plan.retireMode) {
      plan.retireMode = (plan.workCountry === plan.retireCountry ? 'domestic' : 'relocate');
    }
    if (!plan.maritalStatus) plan.maritalStatus = 'single';
    if (plan.taxParts === undefined || plan.taxParts === null) {
      plan.taxParts = (plan.maritalStatus === 'married' ? 2.0 : 1.0);
    }
    if (plan.monthlyMortgagePaidOff === undefined) plan.monthlyMortgagePaidOff = 0;
    if (!plan.frenchPensionDetails) {
      plan.frenchPensionDetails = {
        spouse1: { startWorkAge: 24, claimAge: 64, targetAnnualPension: 18000 },
        spouse2: { startWorkAge: 24, claimAge: 64, targetAnnualPension: 16000 }
      };
    }
    if (!plan.bhxhVnDetails) {
      plan.bhxhVnDetails = {
        spouse1: { gender: 'male', yearsContributed: 20, monthlySalaryVnd: 10000000, claimAge: 62 },
        spouse2: { gender: 'female', yearsContributed: 20, monthlySalaryVnd: 10000000, claimAge: 60 }
      };
    }
    syncSalaryStreamsWithMaritalStatus(plan);
    return plan;
  }

  function syncSalaryStreamsWithMaritalStatus(plan) {
    if (!plan || typeof plan !== 'object') return plan;
    if (!Array.isArray(plan.incomes)) plan.incomes = [];

    const isMarried = (plan.maritalStatus === 'married');
    const curAge = Number(plan.currentAge) || 29;
    const rAge = Number(plan.retirementAge) || 43;
    const curYear = new Date().getFullYear();
    const spouseBYear = Number(plan.spouseBirthYear) || (curYear - (Number(plan.spouseAge) || curAge));
    const spouseAge = curYear - spouseBYear;
    const cur = plan.currency || state.currency || 'EUR';

    // 1. Chuẩn hóa tên các luồng cũ: "Lương tại Pháp..." -> "Lương hiện tại của bạn"
    plan.incomes.forEach(stream => {
      if (!stream || typeof stream !== 'object') return;
      const name = (stream.name || "").trim();
      if (/lương tại pháp|luong tai phap|lương tại/i.test(name)) {
        stream.name = "Lương hiện tại của bạn";
        stream.isSalary = true;
        stream.isPrimarySalary = true;
      } else if (stream.isSpouseSalary || /lương.*(bạn đời|vợ|chồng)|salaire.*conjoint|spouse.*salary/i.test(name)) {
        stream.name = "Lương hiện tại của bạn đời";
        stream.isSalary = true;
        stream.isSpouseSalary = true;
      } else if (stream.isSalary && !stream.isSpouseSalary) {
        stream.isPrimarySalary = true;
      }
    });

    // 2. Tìm thẻ lương của bạn (Primary salary)
    let primarySalary = plan.incomes.find(s => s && (s.isPrimarySalary || /lương hiện tại của bạn|lương chính/i.test(s.name || "")));
    if (!primarySalary) {
      primarySalary = plan.incomes.find(s => s && !s.isBhxhVn && !s.isSpouseSalary && (/lương|salary/i.test(s.name || "")));
    }

    if (!primarySalary && !plan.primarySalaryRemoved) {
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
      plan.incomes.unshift(primarySalary);
    } else if (primarySalary) {
      primarySalary.isSalary = true;
      primarySalary.isPrimarySalary = true;
      if (!primarySalary.name || /lương tại/i.test(primarySalary.name)) {
        primarySalary.name = "Lương hiện tại của bạn";
      }
    }

    // 3. Phân nhánh theo Profil: 1 người (Cá nhân) vs 2 người (Vợ chồng)
    if (!isMarried) {
      // Hồ sơ 1 người: loại bỏ thẻ lương bạn đời
      plan.incomes = plan.incomes.filter(s => {
        if (!s || typeof s !== 'object') return false;
        const isSpouse = s.isSpouseSalary || /lương.*(bạn đời|vợ|chồng)|salaire.*conjoint|spouse.*salary/i.test(s.name || "");
        return !isSpouse;
      });
    } else {
      // Hồ sơ 2 người (Vợ chồng): Tự động thêm thẻ "Lương hiện tại của bạn đời" nếu chưa có
      let spouseSalary = plan.incomes.find(s => s && (s.isSpouseSalary || /lương.*(bạn đời|vợ|chồng)|salaire.*conjoint|spouse.*salary/i.test(s.name || "")));
      if (!spouseSalary && !plan.spouseSalaryRemoved) {
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
        const pIdx = primarySalary ? plan.incomes.indexOf(primarySalary) : -1;
        if (pIdx >= 0) {
          plan.incomes.splice(pIdx + 1, 0, spouseSalary);
        } else {
          plan.incomes.push(spouseSalary);
        }
      } else if (spouseSalary) {
        spouseSalary.isSalary = true;
        spouseSalary.isSpouseSalary = true;
        if (!spouseSalary.name || /lương.*(bạn đời|vợ|chồng)/i.test(spouseSalary.name)) {
          spouseSalary.name = "Lương hiện tại của bạn đời";
        }
      }
    }

    return plan;
  }

  function applySavedUserPreferences(plansData) {
    if (!plansData || !plansData.preferences) return;
    const pref = plansData.preferences;
    if (pref.theme && typeof document !== 'undefined') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pyRetrait_theme', pref.theme);
        }
        if (document.documentElement) {
          document.documentElement.setAttribute('data-theme', pref.theme);
        }
        if (typeof window !== 'undefined' && window.updateThemeIcon) {
          window.updateThemeIcon(pref.theme);
        }
      } catch (e) {}
    }
    if (pref.lang && typeof window !== 'undefined' && window.I18n && typeof window.I18n.setLanguage === 'function') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pyretrait_lang', pref.lang);
        }
        window.I18n.setLanguage(pref.lang);
      } catch (e) {}
    }
    if (pref.currency) {
      state.currency = pref.currency;
    }
    if (pref.viewMode) {
      state.viewMode = pref.viewMode;
    }
  }

  let saveCloudTimeout = null;
  function savePlansToStorage(immediateCloud = true) {
    if (state.plansData) {
      state.plansData.updatedAt = Date.now();
      state.plansData.preferences = {
        lang: (typeof localStorage !== 'undefined' ? localStorage.getItem('pyretrait_lang') : null) || 'vi',
        theme: (typeof localStorage !== 'undefined' ? localStorage.getItem('pyRetrait_theme') : null) || (typeof document !== 'undefined' && document.documentElement ? document.documentElement.getAttribute('data-theme') : 'dark') || 'dark',
        currency: state.currency || 'EUR',
        viewMode: state.viewMode || 'nominal'
      };
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plansData));
    } catch (e) {
      console.warn("Failed to write plans to localStorage:", e);
    }

    emit('plans-saved', state.plansData);

    // Only sync to backend cloud database if user is logged in
    if (window.Auth && window.Auth.isLoggedIn()) {
      if (immediateCloud) {
        if (saveCloudTimeout) clearTimeout(saveCloudTimeout);
        const headers = window.Auth.getAuthHeaders();
        fetch("/api/plans", {
          method: "POST",
          headers,
          body: JSON.stringify(state.plansData),
          keepalive: true
        }).catch(() => {});
      } else {
        if (saveCloudTimeout) clearTimeout(saveCloudTimeout);
        saveCloudTimeout = setTimeout(() => {
          const headers = window.Auth.getAuthHeaders();
          fetch("/api/plans", {
            method: "POST",
            headers,
            body: JSON.stringify(state.plansData),
            keepalive: true
          }).catch(() => {});
        }, 350);
      }
    }
  }

  function debouncedSavePlansToStorage() {
    savePlansToStorage(false);
  }

  async function loadInitialPlans() {
    const isLogged = window.Auth && window.Auth.isLoggedIn();

    // 1. Khi ĐÃ ĐĂNG NHẬP: tải hồ sơ / kế hoạch cá nhân của người dùng từ API Cloud
    if (isLogged) {
      try {
        const headers = window.Auth.getAuthHeaders();
        const res = await fetch("/api/plans", { headers });
        if (res.ok) {
          const cloudPlans = await res.json();
          if (cloudPlans && cloudPlans.plans && Object.keys(cloudPlans.plans).length > 0) {
            state.plansData = cloudPlans;
            Object.values(state.plansData.plans).forEach(p => ensurePlanDefaults(p));
            applySavedUserPreferences(state.plansData);
            state.currency = getActivePlan()?.currency || 'EUR';
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plansData));
            emit('plans-loaded', state.plansData);
            return state.plansData;
          }
        }
      } catch (e) {
        console.log("Backend API not reachable for logged in user, checking local cache:", e);
      }

      // Fallback cache nội bộ của user nếu mất mạng tạm thời
      const localSaved = localStorage.getItem(STORAGE_KEY);
      if (localSaved) {
        try {
          state.plansData = JSON.parse(localSaved);
          if (state.plansData && state.plansData.plans) {
            Object.values(state.plansData.plans).forEach(p => ensurePlanDefaults(p));
          }
          applySavedUserPreferences(state.plansData);
          state.currency = getActivePlan()?.currency || 'EUR';
          emit('plans-loaded', state.plansData);
          return state.plansData;
        } catch (e) {}
      }
    }

    // 2. Khi CHƯA ĐĂNG NHẬP (Chế độ Khách): LUÔN chỉ nạp duy nhất 1 Profil Mẫu từ Server
    try {
      const res = await fetch("/api/plans");
      if (res.ok) {
        state.plansData = await res.json();
        if (state.plansData && state.plansData.plans) {
          // Bảo đảm tuyệt đối: chế độ khách chỉ có duy nhất 1 profil mẫu
          const planIds = Object.keys(state.plansData.plans);
          if (planIds.length > 1) {
            const sampleId = state.plansData.activePlanId && state.plansData.plans[state.plansData.activePlanId]
              ? state.plansData.activePlanId
              : planIds[0];
            state.plansData.plans = { [sampleId]: state.plansData.plans[sampleId] };
            state.plansData.activePlanId = sampleId;
          }
          Object.values(state.plansData.plans).forEach(p => ensurePlanDefaults(p));
        }
        applySavedUserPreferences(state.plansData);
        state.currency = getActivePlan()?.currency || 'EUR';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plansData));
        emit('plans-loaded', state.plansData);
        return state.plansData;
      }
    } catch (e) {
      console.log("Server template not reachable for guest, using pristine hardcoded sample");
    }

    // 3. Fallback nguyên bản offline: duy nhất 1 profil mẫu chuẩn Franco-Viet
    state.plansData = {
      activePlanId: "plan_franco_viet",
      plans: {
        plan_franco_viet: {
          id: "plan_franco_viet",
          name: "📋 Kế hoạch Mẫu: Franco-Viet FIRE (Pháp — Việt Nam)",
          currency: "EUR",
          currentAge: 29,
          birthYear: 1997,
          retirementAge: 43,
          lifeExpectancy: 85,
          currentSavings: 10000,
          annualSavings: 10685,
          annualExpenses: 21373,
          retirementExpenses: 5400,
          baseRetireMonthly: 1000,
          inflationRate: 2.5,
          investmentReturnPre: 5.8,
          investmentReturnPost: 7.5,
          withdrawalStrategy: "fixed_pct",
          initialWithdrawalRate: 4.0,
          targetLegacy: 100000,
          taxRegime: "france_vietnam",
          taxRate: 12.0,
          socialSecurityAge: 65,
          socialSecurityAnnual: 7200,
          frenchAccounts: { peaBalance: 35000, assuranceVieBalance: 10000, livretABalance: 5000, perBalance: 0 },
          incomes: [
            { name: "Lương hiện tại của bạn", amount: 25000, startAge: 29, endAge: 43, growth: 2.5, taxable: true, isSalary: true, isPrimarySalary: true },
            { name: "Cổ tức / Thu nhập thụ động", amount: 2400, startAge: 38, endAge: 85, growth: 4.0, taxable: false },
            { name: " BĐS Cho thuê LMNP Pháp", amount: 6912, startAge: 29, endAge: 85, growth: 1.5, taxable: false },
            { name: " Đội xe Cho thuê Turo", amount: 2805, startAge: 29, endAge: 39, growth: 0, taxable: false }
          ],
          spendingPhases: { enabled: true, gogoAge: 55, gogoFactor: 1.15, slowgoAge: 70, slowgoFactor: 0.90, nogoFactor: 0.80 },
          healthcare: { enabled: true },
          assetAllocation: { stocks: 60, bonds: 20, realEstate: 20, cash: 0 }
        }
      }
    };
    ensurePlanDefaults(state.plansData.plans.plan_franco_viet);
    savePlansToStorage();
    emit('plans-loaded', state.plansData);
    return state.plansData;
  }

  // Expose to window.AppState
  window.AppState = {
    STORAGE_KEY,
    state,
    getState,
    getActivePlan,
    setActivePlanId,
    getCurrency,
    setCurrency,
    getViewMode,
    setViewMode,
    getActiveTab,
    setActiveTab,
    ensurePlanDefaults,
    syncSalaryStreamsWithMaritalStatus,
    applySavedUserPreferences,
    savePlansToStorage,
    debouncedSavePlansToStorage,
    loadInitialPlans,
    on,
    off,
    emit
  };

})();
