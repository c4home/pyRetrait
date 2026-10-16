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
    const plan = state.plansData.plans[state.plansData.activePlanId];
    return plan || Object.values(state.plansData.plans)[0] || null;
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

  let saveCloudTimeout = null;
  function savePlansToStorage(immediateCloud = true) {
    if (state.plansData) {
      state.plansData.updatedAt = Date.now();
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

    // 1. If user is logged in: fetch their personal cloud data from backend API
    if (isLogged) {
      try {
        const headers = window.Auth.getAuthHeaders();
        const res = await fetch("/api/plans", { headers });
        if (res.ok) {
          const cloudPlans = await res.json();
          const localSaved = localStorage.getItem(STORAGE_KEY);
          let useCloud = true;
          if (localSaved) {
            try {
              const localParsed = JSON.parse(localSaved);
              if (localParsed && localParsed.updatedAt && (!cloudPlans || !cloudPlans.updatedAt || localParsed.updatedAt >= cloudPlans.updatedAt)) {
                state.plansData = localParsed;
                useCloud = false;
                fetch("/api/plans", {
                  method: "POST",
                  headers,
                  body: JSON.stringify(localParsed),
                  keepalive: true
                }).catch(() => {});
              }
            } catch (err) {}
          }
          if (useCloud) {
            state.plansData = cloudPlans;
          }
          state.currency = getActivePlan()?.currency || 'EUR';
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plansData));
          emit('plans-loaded', state.plansData);
          return state.plansData;
        }
      } catch (e) {
        console.log("Backend API not reachable for logged in user, falling back to localStorage");
      }
    }

    // 2. Guest Mode: read strictly from this browser's own localStorage
    const savedLocal = localStorage.getItem(STORAGE_KEY);
    if (savedLocal) {
      try {
        state.plansData = JSON.parse(savedLocal);
        state.currency = getActivePlan()?.currency || 'EUR';
        emit('plans-loaded', state.plansData);
        return state.plansData;
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
        emit('plans-loaded', state.plansData);
        return state.plansData;
      }
    } catch (e) {
      console.log("Server template not reachable, using hardcoded defaults");
    }

    // 4. Fallback hardcoded default
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
          healthcare: { enabled: true }
        }
      }
    };
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
    savePlansToStorage,
    debouncedSavePlansToStorage,
    loadInitialPlans,
    on,
    off,
    emit
  };

})();
