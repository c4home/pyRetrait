/**
 * pyRetrait — Tầng 3: Giao Diện Tab 3 — Tối Ưu Thuế, Lương Hưu & BĐS LMNP (ui-tab3-taxes.js)
 * Quản lý hiển thị Thuế lũy tiến Pháp / Việt Nam / Mỹ, Thác rút tiền PEA / Assurance-Vie / Livret A,
 * Lương hưu Pháp (CNAV / Agirc-Arrco 172 quý), BHXH Tự nguyện VN và Đồng bộ BĐS Cho thuê LMNP.
 */

(function() {
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


  // -------------------------------------------------------------
  // Sự kiện tương tác của Tab 3 (Thuế, Lương hưu Pháp, BHXH VN, LMNP, Thế chấp)
  // -------------------------------------------------------------
  function bindTab3Events() {
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

    const chkFrench = document.getElementById("chk-enable-french-pension");
    if (chkFrench) {
      chkFrench.addEventListener("change", () => {
        const plan = getActivePlan();
        plan.enableFrenchPension = chkFrench.checked;
        savePlansToStorage();
        updatePensionDecoteUI(plan);
        renderIncomeStreamsList();
        updateCashflowBalanceUI(plan);
        updateAll();
      });
    }

    const btnEditFrench = document.getElementById("btn-edit-french-pension");
    if (btnEditFrench) {
      btnEditFrench.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const body = document.getElementById("french-inputs-body");
        if (body) {
          if (body.style.display === "none") {
            body.style.display = "block";
            btnEditFrench.innerText = "Sửa";
          } else {
            body.style.display = "none";
            btnEditFrench.innerText = "Mở rộng";
          }
        }
      });
    }

    const btnDelFrench = document.getElementById("btn-del-french-pension");
    if (btnDelFrench) {
      btnDelFrench.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const plan = getActivePlan();
        if (plan.enableFrenchPension !== false) {
          showConfirmDialog({
            icon: "",
            title: "Xác nhận xóa Lương hưu Pháp",
            message: `Bạn có chắc chắn muốn tắt <strong>Lương hưu Nhà nước Pháp</strong>?<br><span style="font-size:0.75rem; color:var(--text-faint); margin-top:6px; display:inline-block;">Dòng tiền hưu trí Pháp sẽ bị hủy bỏ và các chỉ số FIRE sẽ được tính toán lại.</span>`,
            confirmText: "Xóa nguồn thu",
            onConfirm: () => {
              plan.enableFrenchPension = false;
              const chk = document.getElementById("chk-enable-french-pension");
              if (chk) chk.checked = false;
              savePlansToStorage();
              updatePensionDecoteUI(plan);
              renderIncomeStreamsList();
              updateCashflowBalanceUI(plan);
              updateAll();
            }
          });
        } else {
          plan.enableFrenchPension = true;
          const chk = document.getElementById("chk-enable-french-pension");
          if (chk) chk.checked = true;
          savePlansToStorage();
          updatePensionDecoteUI(plan);
          renderIncomeStreamsList();
          updateCashflowBalanceUI(plan);
          updateAll();
        }
      });
    }

    // Vietnam BHXH Tự Nguyện Inputs & Checkbox
    const chkBhxhVn = document.getElementById("chk-enable-bhxh-vn");
    if (chkBhxhVn) {
      chkBhxhVn.addEventListener("change", () => {
        const plan = getActivePlan();
        plan.bhxhVnEnabled = chkBhxhVn.checked;
        syncBhxhVnStreams(plan);
        savePlansToStorage();
        updateBhxhVnUI(plan);
        renderIncomeStreamsList();
        renderExpenseStreamsList();
        updateCashflowBalanceUI(plan);
        updateAll();
      });
    }

    ['sel-calc-bhxh-income', 'sel-calc-bhxh-years', 'inp-bhxh-start-age', 'inp-bhxh-retire-age'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        ['input', 'change'].forEach(evt => {
          el.addEventListener(evt, () => {
            const plan = getActivePlan();
            plan.bhxhVnIncome = Number(document.getElementById("sel-calc-bhxh-income")?.value) || 10000000;
            plan.bhxhVnYears = Number(document.getElementById("sel-calc-bhxh-years")?.value) || 15;
            plan.bhxhVnStartAge = Number(document.getElementById("inp-bhxh-start-age")?.value) || 29;
            plan.bhxhVnRetireAge = Number(document.getElementById("inp-bhxh-retire-age")?.value) || 62;
            syncBhxhVnStreams(plan);
            savePlansToStorage();
            updateBhxhVnUI(plan);
            if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
            if (typeof renderExpenseStreamsList === 'function') renderExpenseStreamsList();
            if (typeof updateCashflowBalanceUI === 'function') updateCashflowBalanceUI(plan);
            updateAll();
          });
        });
      }
    });

    // Sự kiện 2 cột BHXH Bạn và Bạn đời
    ['sel-bhxh-spouse1-income', 'sel-bhxh-spouse1-years', 'sel-bhxh-spouse2-income', 'sel-bhxh-spouse2-years'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          const plan = getActivePlan();
          if (!plan.bhxhVnDetails) plan.bhxhVnDetails = {};
          if (!plan.bhxhVnDetails.spouse1) plan.bhxhVnDetails.spouse1 = {};
          if (!plan.bhxhVnDetails.spouse2) plan.bhxhVnDetails.spouse2 = {};

          const s1Inc = Number(document.getElementById("sel-bhxh-spouse1-income")?.value) || 10000000;
          const s1Yrs = Number(document.getElementById("sel-bhxh-spouse1-years")?.value) || 20;
          const s2Inc = Number(document.getElementById("sel-bhxh-spouse2-income")?.value) || 10000000;
          const s2Yrs = Number(document.getElementById("sel-bhxh-spouse2-years")?.value) || 20;

          plan.bhxhVnDetails.spouse1.monthlySalaryVnd = s1Inc;
          plan.bhxhVnDetails.spouse1.yearsContributed = s1Yrs;
          plan.bhxhVnDetails.spouse2.monthlySalaryVnd = s2Inc;
          plan.bhxhVnDetails.spouse2.yearsContributed = s2Yrs;

          plan.bhxhVnIncome = s1Inc;
          plan.bhxhVnYears = s1Yrs;

          syncBhxhVnStreams(plan);
          savePlansToStorage();
          updateBhxhVnUI(plan);
          if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
          if (typeof renderExpenseStreamsList === 'function') renderExpenseStreamsList();
          if (typeof updateCashflowBalanceUI === 'function') updateCashflowBalanceUI(plan);
          updateAll();
        });
      }
    });

    const btnEditBhxh = document.getElementById("btn-edit-bhxh-stream");
    if (btnEditBhxh) {
      btnEditBhxh.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const body = document.getElementById("bhxh-inputs-body");
        if (body) {
          if (body.style.display === "none") {
            body.style.display = "block";
            btnEditBhxh.innerText = "Sửa";
          } else {
            body.style.display = "none";
            btnEditBhxh.innerText = "Mở rộng";
          }
        }
      });
    }

    const btnDelBhxh = document.getElementById("btn-del-bhxh-stream");
    if (btnDelBhxh) {
      btnDelBhxh.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const plan = getActivePlan();
        if (plan.bhxhVnEnabled !== false) {
          showConfirmDialog({
            icon: "",
            title: "Xác nhận xóa Lương hưu BHXH VN",
            message: `Bạn có chắc chắn muốn xóa <strong>Lương hưu BHXH Việt Nam</strong>?<br><span style="font-size:0.75rem; color:var(--text-faint); margin-top:6px; display:inline-block;">Các luồng đóng BHXH và nhận lương hưu sẽ bị hủy bỏ và dòng tiền được tính toán lại.</span>`,
            confirmText: "Xóa nguồn thu",
            onConfirm: () => {
              plan.bhxhVnEnabled = false;
              const chk = document.getElementById("chk-enable-bhxh-vn");
              if (chk) chk.checked = false;
              syncBhxhVnStreams(plan);
              savePlansToStorage();
              updateBhxhVnUI(plan);
              renderIncomeStreamsList();
              renderExpenseStreamsList();
              updateCashflowBalanceUI(plan);
              updateAll();
            }
          });
        } else {
          plan.bhxhVnEnabled = true;
          const chk = document.getElementById("chk-enable-bhxh-vn");
          if (chk) chk.checked = true;
          syncBhxhVnStreams(plan);
          savePlansToStorage();
          updateBhxhVnUI(plan);
          renderIncomeStreamsList();
          renderExpenseStreamsList();
          updateCashflowBalanceUI(plan);
          updateAll();
        }
      });
    }

    // German Pension Card Events
    const chkGerman = document.getElementById("chk-enable-german-pension");
    if (chkGerman) {
      chkGerman.addEventListener("change", () => {
        const plan = getActivePlan();
        plan.enableGermanPension = chkGerman.checked;
        savePlansToStorage();
        updateGermanPensionUI(plan);
        if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
        if (typeof updateCashflowBalanceUI === 'function') updateCashflowBalanceUI(plan);
        updateAll();
      });
    }

    const btnEditGerman = document.getElementById("btn-edit-german-pension");
    if (btnEditGerman) {
      btnEditGerman.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const body = document.getElementById("german-inputs-body");
        if (body) {
          if (body.style.display === "none") {
            body.style.display = "block";
            btnEditGerman.innerText = "Sửa";
          } else {
            body.style.display = "none";
            btnEditGerman.innerText = "Mở rộng";
          }
        }
      });
    }

    const btnDelGerman = document.getElementById("btn-del-german-pension");
    if (btnDelGerman) {
      btnDelGerman.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const plan = getActivePlan();
        if (plan.enableGermanPension !== false) {
          showConfirmDialog({
            icon: "",
            title: "Xác nhận xóa Lương hưu Đức",
            message: `Bạn có chắc chắn muốn tắt <strong>Lương hưu An sinh Đức (GRV)</strong>?<br><span style="font-size:0.75rem; color:var(--text-faint); margin-top:6px; display:inline-block;">Các luồng lương hưu Đức sẽ bị tạm tắt và các chỉ số FIRE được tính toán lại.</span>`,
            confirmText: "Xóa nguồn thu",
            onConfirm: () => {
              plan.enableGermanPension = false;
              const chk = document.getElementById("chk-enable-german-pension");
              if (chk) chk.checked = false;
              savePlansToStorage();
              updateGermanPensionUI(plan);
              if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
              if (typeof updateCashflowBalanceUI === 'function') updateCashflowBalanceUI(plan);
              updateAll();
            }
          });
        } else {
          plan.enableGermanPension = true;
          const chk = document.getElementById("chk-enable-german-pension");
          if (chk) chk.checked = true;
          savePlansToStorage();
          updateGermanPensionUI(plan);
          if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
          if (typeof updateCashflowBalanceUI === 'function') updateCashflowBalanceUI(plan);
          updateAll();
        }
      });
    }

    ['inp-german-spouse1-years', 'inp-german-spouse1-claim-age', 'inp-german-spouse1-salary',
     'inp-german-spouse2-years', 'inp-german-spouse2-claim-age', 'inp-german-spouse2-salary'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        ['input', 'change'].forEach(evt => {
          el.addEventListener(evt, () => {
            const plan = getActivePlan();
            if (!plan.germanPensionDetails) {
              plan.germanPensionDetails = { spouse1: {}, spouse2: {} };
            }
            if (!plan.germanPensionDetails.spouse1) plan.germanPensionDetails.spouse1 = {};
            if (!plan.germanPensionDetails.spouse2) plan.germanPensionDetails.spouse2 = {};

            plan.germanPensionDetails.spouse1.yearsContributed = Number(document.getElementById("inp-german-spouse1-years")?.value) || 35;
            plan.germanPensionDetails.spouse1.claimAge = Number(document.getElementById("inp-german-spouse1-claim-age")?.value) || 67;
            plan.germanPensionDetails.spouse1.grossAnnualSalary = Number(document.getElementById("inp-german-spouse1-salary")?.value) || 45000;

            plan.germanPensionDetails.spouse2.yearsContributed = Number(document.getElementById("inp-german-spouse2-years")?.value) || 35;
            plan.germanPensionDetails.spouse2.claimAge = Number(document.getElementById("inp-german-spouse2-claim-age")?.value) || 67;
            plan.germanPensionDetails.spouse2.grossAnnualSalary = Number(document.getElementById("inp-german-spouse2-salary")?.value) || 38000;

            savePlansToStorage();
            updateGermanPensionUI(plan);
            if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
            if (typeof updateCashflowBalanceUI === 'function') updateCashflowBalanceUI(plan);
            updateAll();
          });
        });
      }
    });

    // US Social Security Card Events
    const chkUs = document.getElementById("chk-enable-us-pension");
    if (chkUs) {
      chkUs.addEventListener("change", () => {
        const plan = getActivePlan();
        plan.enableUsPension = chkUs.checked;
        savePlansToStorage();
        updateUsPensionUI(plan);
        if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
        if (typeof updateCashflowBalanceUI === 'function') updateCashflowBalanceUI(plan);
        updateAll();
      });
    }

    const btnEditUs = document.getElementById("btn-edit-us-pension");
    if (btnEditUs) {
      btnEditUs.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const body = document.getElementById("us-inputs-body");
        if (body) {
          if (body.style.display === "none") {
            body.style.display = "block";
            btnEditUs.innerText = "Sửa";
          } else {
            body.style.display = "none";
            btnEditUs.innerText = "Mở rộng";
          }
        }
      });
    }

    const btnDelUs = document.getElementById("btn-del-us-pension");
    if (btnDelUs) {
      btnDelUs.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const plan = getActivePlan();
        if (plan.enableUsPension !== false) {
          showConfirmDialog({
            icon: "",
            title: "Xác nhận xóa Lương hưu Mỹ",
            message: `Bạn có chắc chắn muốn tắt <strong>Lương hưu An sinh Mỹ (Social Security)</strong>?<br><span style="font-size:0.75rem; color:var(--text-faint); margin-top:6px; display:inline-block;">Các luồng lương hưu Mỹ sẽ bị tạm tắt và các chỉ số FIRE được tính toán lại.</span>`,
            confirmText: "Xóa nguồn thu",
            onConfirm: () => {
              plan.enableUsPension = false;
              const chk = document.getElementById("chk-enable-us-pension");
              if (chk) chk.checked = false;
              savePlansToStorage();
              updateUsPensionUI(plan);
              if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
              if (typeof updateCashflowBalanceUI === 'function') updateCashflowBalanceUI(plan);
              updateAll();
            }
          });
        } else {
          plan.enableUsPension = true;
          const chk = document.getElementById("chk-enable-us-pension");
          if (chk) chk.checked = true;
          savePlansToStorage();
          updateUsPensionUI(plan);
          if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
          if (typeof updateCashflowBalanceUI === 'function') updateCashflowBalanceUI(plan);
          updateAll();
        }
      });
    }

    ['inp-us-spouse1-years', 'inp-us-spouse1-claim-age', 'inp-us-spouse1-salary',
     'inp-us-spouse2-years', 'inp-us-spouse2-claim-age', 'inp-us-spouse2-salary'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        ['input', 'change'].forEach(evt => {
          el.addEventListener(evt, () => {
            const plan = getActivePlan();
            if (!plan.usPensionDetails) {
              plan.usPensionDetails = { spouse1: {}, spouse2: {} };
            }
            if (!plan.usPensionDetails.spouse1) plan.usPensionDetails.spouse1 = {};
            if (!plan.usPensionDetails.spouse2) plan.usPensionDetails.spouse2 = {};

            plan.usPensionDetails.spouse1.yearsWorked = Number(document.getElementById("inp-us-spouse1-years")?.value) || 35;
            plan.usPensionDetails.spouse1.claimAge = Number(document.getElementById("inp-us-spouse1-claim-age")?.value) || 67;
            plan.usPensionDetails.spouse1.grossAnnualSalary = Number(document.getElementById("inp-us-spouse1-salary")?.value) || 65000;

            plan.usPensionDetails.spouse2.yearsWorked = Number(document.getElementById("inp-us-spouse2-years")?.value) || 35;
            plan.usPensionDetails.spouse2.claimAge = Number(document.getElementById("inp-us-spouse2-claim-age")?.value) || 67;
            plan.usPensionDetails.spouse2.grossAnnualSalary = Number(document.getElementById("inp-us-spouse2-salary")?.value) || 55000;

            savePlansToStorage();
            updateUsPensionUI(plan);
            if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
            if (typeof updateCashflowBalanceUI === 'function') updateCashflowBalanceUI(plan);
            updateAll();
          });
        });
      }
    });

    // ----------------------------------------------------
    // International Pensions Event Bindings (JP, CA, AU, KR, TW)
    // ----------------------------------------------------
    const newPensionConfigs = [
      {
        key: 'japan',
        name: 'Nhật Bản (Nenkin)',
        planProp: 'enableJapanPension',
        detailsProp: 'japanPensionDetails',
        updateFn: updateJapanPensionUI,
        inputs: [
          { id: 'inp-japan-spouse1-years', prop: 'yearsContributed', spouse: 'spouse1', def: 25 },
          { id: 'inp-japan-spouse1-claim-age', prop: 'claimAge', spouse: 'spouse1', def: 65 },
          { id: 'inp-japan-spouse1-salary', prop: 'grossAnnualSalary', spouse: 'spouse1', def: 4500000 },
          { id: 'inp-japan-spouse2-years', prop: 'yearsContributed', spouse: 'spouse2', def: 20 },
          { id: 'inp-japan-spouse2-claim-age', prop: 'claimAge', spouse: 'spouse2', def: 65 },
          { id: 'inp-japan-spouse2-salary', prop: 'grossAnnualSalary', spouse: 'spouse2', def: 3500000 }
        ]
      },
      {
        key: 'canada',
        name: 'Canada (CPP & OAS)',
        planProp: 'enableCanadaPension',
        detailsProp: 'canadaPensionDetails',
        updateFn: updateCanadaPensionUI,
        inputs: [
          { id: 'inp-canada-spouse1-years', prop: 'yearsContributed', spouse: 'spouse1', def: 30 },
          { id: 'inp-canada-spouse1-res-years', prop: 'yearsResident', spouse: 'spouse1', def: 30 },
          { id: 'inp-canada-spouse1-claim-age', prop: 'claimAge', spouse: 'spouse1', def: 65 },
          { id: 'inp-canada-spouse1-salary', prop: 'grossAnnualSalary', spouse: 'spouse1', def: 65000 },
          { id: 'inp-canada-spouse2-years', prop: 'yearsContributed', spouse: 'spouse2', def: 25 },
          { id: 'inp-canada-spouse2-res-years', prop: 'yearsResident', spouse: 'spouse2', def: 25 },
          { id: 'inp-canada-spouse2-claim-age', prop: 'claimAge', spouse: 'spouse2', def: 65 },
          { id: 'inp-canada-spouse2-salary', prop: 'grossAnnualSalary', spouse: 'spouse2', def: 50000 }
        ]
      },
      {
        key: 'australia',
        name: 'Úc (Superannuation & Age)',
        planProp: 'enableAustraliaPension',
        detailsProp: 'australiaPensionDetails',
        updateFn: updateAustraliaPensionUI,
        inputs: [
          { id: 'inp-australia-spouse1-years', prop: 'yearsWorked', spouse: 'spouse1', def: 25 },
          { id: 'inp-australia-spouse1-super', prop: 'superBalance', spouse: 'spouse1', def: 250000 },
          { id: 'inp-australia-spouse1-claim-age', prop: 'claimAge', spouse: 'spouse1', def: 67 },
          { id: 'inp-australia-spouse1-salary', prop: 'grossAnnualSalary', spouse: 'spouse1', def: 85000 },
          { id: 'inp-australia-spouse2-years', prop: 'yearsWorked', spouse: 'spouse2', def: 20 },
          { id: 'inp-australia-spouse2-super', prop: 'superBalance', spouse: 'spouse2', def: 180000 },
          { id: 'inp-australia-spouse2-claim-age', prop: 'claimAge', spouse: 'spouse2', def: 67 },
          { id: 'inp-australia-spouse2-salary', prop: 'grossAnnualSalary', spouse: 'spouse2', def: 65000 }
        ]
      },
      {
        key: 'korea',
        name: 'Hàn Quốc (NPS)',
        planProp: 'enableKoreaPension',
        detailsProp: 'koreaPensionDetails',
        updateFn: updateKoreaPensionUI,
        inputs: [
          { id: 'inp-korea-spouse1-years', prop: 'yearsContributed', spouse: 'spouse1', def: 20 },
          { id: 'inp-korea-spouse1-claim-age', prop: 'claimAge', spouse: 'spouse1', def: 65 },
          { id: 'inp-korea-spouse1-salary', prop: 'grossMonthlySalary', spouse: 'spouse1', def: 3500000 },
          { id: 'inp-korea-spouse2-years', prop: 'yearsContributed', spouse: 'spouse2', def: 15 },
          { id: 'inp-korea-spouse2-claim-age', prop: 'claimAge', spouse: 'spouse2', def: 65 },
          { id: 'inp-korea-spouse2-salary', prop: 'grossMonthlySalary', spouse: 'spouse2', def: 2800000 }
        ]
      },
      {
        key: 'taiwan',
        name: 'Đài Loan (勞保 & 勞退)',
        planProp: 'enableTaiwanPension',
        detailsProp: 'taiwanPensionDetails',
        updateFn: updateTaiwanPensionUI,
        inputs: [
          { id: 'inp-taiwan-spouse1-years', prop: 'yearsContributed', spouse: 'spouse1', def: 20 },
          { id: 'inp-taiwan-spouse1-claim-age', prop: 'claimAge', spouse: 'spouse1', def: 65 },
          { id: 'inp-taiwan-spouse1-salary', prop: 'insuredMonthlySalary', spouse: 'spouse1', def: 45800 },
          { id: 'inp-taiwan-spouse2-years', prop: 'yearsContributed', spouse: 'spouse2', def: 15 },
          { id: 'inp-taiwan-spouse2-claim-age', prop: 'claimAge', spouse: 'spouse2', def: 65 },
          { id: 'inp-taiwan-spouse2-salary', prop: 'insuredMonthlySalary', spouse: 'spouse2', def: 36000 }
        ]
      }
    ];

    newPensionConfigs.forEach(cfg => {
      // Checkbox
      const chk = document.getElementById(`chk-enable-${cfg.key}-pension`);
      if (chk) {
        chk.addEventListener("change", () => {
          const plan = getActivePlan();
          plan[cfg.planProp] = chk.checked;
          savePlansToStorage();
          cfg.updateFn(plan);
          if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
          if (typeof updateCashflowBalanceUI === 'function') updateCashflowBalanceUI(plan);
          updateAll();
        });
      }

      // Edit Button
      const btnEdit = document.getElementById(`btn-edit-${cfg.key}-pension`);
      if (btnEdit) {
        btnEdit.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const body = document.getElementById(`${cfg.key}-inputs-body`);
          if (body) {
            if (body.style.display === "none") {
              body.style.display = "block";
              btnEdit.innerText = "Sửa";
            } else {
              body.style.display = "none";
              btnEdit.innerText = "Mở rộng";
            }
          }
        });
      }

      // Delete / Toggle Button
      const btnDel = document.getElementById(`btn-del-${cfg.key}-pension`);
      if (btnDel) {
        btnDel.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const plan = getActivePlan();
          if (plan[cfg.planProp] !== false) {
            showConfirmDialog({
              icon: "",
              title: `Xác nhận xóa Lương hưu ${cfg.name}`,
              message: `Bạn có chắc chắn muốn tắt <strong>Lương hưu ${cfg.name}</strong>?<br><span style="font-size:0.75rem; color:var(--text-faint); margin-top:6px; display:inline-block;">Các luồng lương hưu này sẽ bị tạm tắt và các chỉ số FIRE được tính toán lại.</span>`,
              confirmText: "Xóa nguồn thu",
              onConfirm: () => {
                plan[cfg.planProp] = false;
                const c = document.getElementById(`chk-enable-${cfg.key}-pension`);
                if (c) c.checked = false;
                savePlansToStorage();
                cfg.updateFn(plan);
                if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
                if (typeof updateCashflowBalanceUI === 'function') updateCashflowBalanceUI(plan);
                updateAll();
              }
            });
          } else {
            plan[cfg.planProp] = true;
            const c = document.getElementById(`chk-enable-${cfg.key}-pension`);
            if (c) c.checked = true;
            savePlansToStorage();
            cfg.updateFn(plan);
            if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
            if (typeof updateCashflowBalanceUI === 'function') updateCashflowBalanceUI(plan);
            updateAll();
          }
        });
      }

      // Inputs
      cfg.inputs.forEach(inpDef => {
        const el = document.getElementById(inpDef.id);
        if (el) {
          ['input', 'change'].forEach(evt => {
            el.addEventListener(evt, () => {
              const plan = getActivePlan();
              if (!plan[cfg.detailsProp]) plan[cfg.detailsProp] = { spouse1: {}, spouse2: {} };
              if (!plan[cfg.detailsProp][inpDef.spouse]) plan[cfg.detailsProp][inpDef.spouse] = {};
              plan[cfg.detailsProp][inpDef.spouse][inpDef.prop] = Number(el.value) || inpDef.def;
              savePlansToStorage();
              cfg.updateFn(plan);
              if (typeof renderIncomeStreamsList === 'function') renderIncomeStreamsList();
              if (typeof updateCashflowBalanceUI === 'function') updateCashflowBalanceUI(plan);
              updateAll();
            });
          });
        }
      });
    });

    // LMNP Stream Card Events
    const btnEditLmnp = document.getElementById("btn-edit-lmnp-stream");
    if (btnEditLmnp) {
      btnEditLmnp.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const body = document.getElementById("lmnp-inputs-body");
        if (body) {
          if (body.style.display === "none") {
            body.style.display = "block";
            btnEditLmnp.innerText = "Thu gọn";
          } else {
            body.style.display = "none";
            btnEditLmnp.innerText = "Sửa";
          }
        }
      });
    }

    const btnAddLmnpQuick = document.getElementById("btn-add-lmnp-quick");
    if (btnAddLmnpQuick) {
      btnAddLmnpQuick.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.PatrimoineApp && typeof window.PatrimoineApp.openApartmentModal === "function") {
          window.PatrimoineApp.openApartmentModal(null);
        }
      });
    }

    const btnAddAptFromStream = document.getElementById("btn-add-apartment-from-stream");
    if (btnAddAptFromStream) {
      btnAddAptFromStream.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.PatrimoineApp && typeof window.PatrimoineApp.openApartmentModal === "function") {
          window.PatrimoineApp.openApartmentModal(null);
        }
      });
    }

    const chkLmnp = document.getElementById("chk-enable-lmnp-stream");
    if (chkLmnp) {
      chkLmnp.addEventListener("change", () => {
        const plan = getActivePlan();
        plan.lmnpEnabled = chkLmnp.checked;
        savePlansToStorage();
        updateLmnpUI(plan);
        renderIncomeStreamsList();
        renderExpenseStreamsList();
        updateCashflowBalanceUI(plan);
        updateAll();
      });
    }

    const btnDelLmnp = document.getElementById("btn-del-lmnp-stream");
    if (btnDelLmnp) {
      btnDelLmnp.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const plan = getActivePlan();
        plan.lmnpEnabled = plan.lmnpEnabled === false ? true : false;
        if (chkLmnp) chkLmnp.checked = plan.lmnpEnabled;
        savePlansToStorage();
        updateLmnpUI(plan);
        renderIncomeStreamsList();
        renderExpenseStreamsList();
        updateCashflowBalanceUI(plan);
        updateAll();
      });
    }

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
    // PEA Ticker Copy Chips
    document.querySelectorAll(".pea-ticker-chip").forEach(chip => {
      chip.addEventListener("click", async () => {
        const ticker = chip.getAttribute("data-ticker");
        if (!ticker) return;
        try {
          await navigator.clipboard.writeText(ticker);
          const oldText = chip.innerHTML;
          chip.innerHTML = `${ticker} Đã chép!`;
          chip.style.borderColor = "#10b981";
          chip.style.color = "#34d399";
          setTimeout(() => {
            chip.innerHTML = oldText;
            chip.style.borderColor = "";
            chip.style.color = "";
          }, 1500);
        } catch (err) {
          console.warn("Clipboard copy failed:", err);
        }
      });
    });

    // Quick Jump to PEA Masterclass from other tabs
    document.querySelectorAll(".btn-goto-pea").forEach(btn => {
      btn.addEventListener("click", () => {
        switchTab("tab-taxes");
        setTimeout(() => {
          const card = document.getElementById("card-pea-masterclass");
          if (card) {
            card.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      });
    });
  }

  function updateTaxRegimeUI(regime) {
    const plan = getActivePlan();
    const workC = plan?.workCountry || 'FR';
    const isFrance = (workC === 'FR');

    const frAccountsCard = document.getElementById("card-french-accounts");
    const peaCard = document.getElementById("card-pea-masterclass");
    const avCard = document.getElementById("card-assurance-vie-masterclass");
    const livretCard = document.getElementById("card-livret-masterclass");
    const globalAccountsCard = document.getElementById("card-global-accounts-guide");

    if (frAccountsCard) frAccountsCard.style.display = isFrance ? "block" : "none";
    if (peaCard) peaCard.style.display = isFrance ? "block" : "none";
    if (avCard) avCard.style.display = isFrance ? "block" : "none";
    if (livretCard) livretCard.style.display = isFrance ? "block" : "none";
    if (globalAccountsCard) {
      globalAccountsCard.style.display = isFrance ? "none" : "block";
      renderGlobalAccountsContent(plan, workC);
    }

    // Visual display of family taxParts (Quotient Familial)
    const isSingle = (plan?.maritalStatus !== 'married');
    const kidsCount = (plan?.familyPlan && plan.familyPlan.enabled !== false) ? (Number(plan.familyPlan.kidsCount) || 0) : 0;
    const childParts = kidsCount <= 2 ? (kidsCount * 0.5) : (1.0 + (kidsCount - 2) * 1.0);
    const computedParts = (isSingle ? 1.0 : 2.0) + childParts;
    const taxParts = (plan?.taxParts !== undefined && plan?.taxParts !== null && Number(plan.taxParts) > 0) ? Number(plan.taxParts) : computedParts;

    const elTaxParts = document.getElementById("badge-tax-parts-display");
    if (elTaxParts) {
      elTaxParts.innerText = `${taxParts} suất (${isSingle ? 'Độc thân' : 'Vợ chồng'}${kidsCount > 0 ? ` + ${kidsCount} con` : ''})`;
    }
  }

  function renderGlobalAccountsContent(plan, countryCode) {
    const grid = document.getElementById("global-accounts-grid");
    const titleEl = document.getElementById("lbl-global-accounts-title");
    const descEl = document.getElementById("lbl-global-accounts-desc");
    const badgeEl = document.getElementById("badge-global-tax-highlight");
    if (!grid) return;

    if (countryCode === 'US') {
      if (titleEl) titleEl.innerText = "Cẩm Nang Chiến Lược Tài Khoản Đầu Tư Mỹ (401k, Roth IRA, HSA & Brokerage)";
      if (descEl) descEl.innerText = "Tận dụng tối đa thứ tự ưu tiên dòng tiền: Đóng match 401(k) -> Max HSA -> Max Roth IRA -> Taxable Brokerage.";
      if (badgeEl) badgeEl.innerText = "IRS Code 2024";
      grid.innerHTML = `
        <div class="advisor-card">
          <span class="advisor-card-tag tag-critical">Ưu tiên 1 • Nhận tiền miễn phí</span>
          <h4 class="advisor-card-title">401(k) Employer Match — 100% Lợi Nhuận Tức Thì</h4>
          <p class="advisor-card-text">
            Đóng đủ mức lương để nhận trọn vẹn tiền đóng đối ứng của công ty (Match). Đây là khoản sinh lời 50% - 100% ngay tại nguồn mà không có bất kỳ kênh đầu tư nào vượt qua được.
          </p>
        </div>
        <div class="advisor-card">
          <span class="advisor-card-tag tag-opportunity">Ưu tiên 2 • Miễn thuế 3 lần</span>
          <h4 class="advisor-card-title">HSA (Health Savings Account) — Triple Tax Advantage</h4>
          <p class="advisor-card-text">
            Miễn thuế thu nhập khi nạp tiền, miễn thuế khi tiền sinh lời và miễn thuế 100% khi rút chi trả y tế. Sau tuổi 65, HSA hoạt động tương tự như một tài khoản Traditional IRA.
          </p>
        </div>
        <div class="advisor-card">
          <span class="advisor-card-tag tag-growth">Ưu tiên 3 • Tự do tài chính</span>
          <h4 class="advisor-card-title">Roth IRA ($7.000/năm) — Tăng Trưởng & Rút 0% Thuế</h4>
          <p class="advisor-card-text">
            Đóng tiền sau thuế, toàn bộ cổ tức và lãi vốn tăng trưởng hàng chục năm được miễn thuế vĩnh viễn khi rút sau tuổi 59½. Phần vốn gốc (contributions) có thể rút bất kỳ lúc nào không bị phạt.
          </p>
        </div>
      `;
    } else if (countryCode === 'DE') {
      if (titleEl) titleEl.innerText = "Chiến Lược Đầu Tư & Tối Ưu Thuế Tại Đức (Depot & Sparer-Pauschbetrag)";
      if (descEl) descEl.innerText = "Tối ưu hóa 1.000 € (độc thân) hoặc 2.000 € (vợ chồng) miễn thuế lãi vốn hàng năm và chọn quỹ UCITS ETF phù hợp.";
      if (badgeEl) badgeEl.innerText = "Abgeltungsteuer 25%";
      grid.innerHTML = `
        <div class="advisor-card">
          <span class="advisor-card-tag tag-critical">Mẹo 01 • Miễn thuế vốn</span>
          <h4 class="advisor-card-title">Freistellungsauftrag — Tận Dụng Sparer-Pauschbetrag</h4>
          <p class="advisor-card-text">
            Nộp đơn Freistellungsauftrag cho ngân hàng/broker (Trade Republic, Scalable, ING) để kích hoạt hạn mức miễn thuế lãi vốn 1.000 €/năm (hoặc 2.000 € đối với vợ chồng).
          </p>
        </div>
        <div class="advisor-card">
          <span class="advisor-card-tag tag-opportunity">Mẹo 02 • Danh mục ETF</span>
          <h4 class="advisor-card-title">Thesaurierend (Accumulating) ETF & Vorabpauschale</h4>
          <p class="advisor-card-text">
            Sử dụng các quỹ ETF tích lũy (ví dụ VWCE, FWRA) để tự động tái đầu tư cổ tức. Nắm vững cơ chế thuế trả trước Vorabpauschale hàng năm theo lãi suất cơ bản của Bundesbank.
          </p>
        </div>
        <div class="advisor-card">
          <span class="advisor-card-tag tag-growth">Mẹo 03 • Khấu trừ thuế</span>
          <h4 class="advisor-card-title">Verlustverrechnungstopf — Bù Trừ Lỗ Lãi Khoa Học</h4>
          <p class="advisor-card-text">
            Khoản lỗ từ cổ phiếu được tự động lưu trong 'nồi bù trừ lỗ' (Verlusttopf) để cấn trừ vào các khoản lãi trong tương lai vô thời hạn mà không bị mất đi qua các năm tài chính.
          </p>
        </div>
      `;
    } else {
      if (titleEl) titleEl.innerText = "Cẩm Nang Tài Khoản Đầu Tư Quốc Tế Cho Người Định Cư & Nghỉ Hưu Toàn Cầu";
      if (descEl) descEl.innerText = "Sử dụng sàn giao dịch quốc tế uy tín, đầu tư ETF Ireland (UCITS) để tránh thuế thừa kế Mỹ và tối ưu dòng tiền rút.";
      if (badgeEl) badgeEl.innerText = "Quốc Tế 0% Withholding";
      grid.innerHTML = `
        <div class="advisor-card">
          <span class="advisor-card-tag tag-critical">Chiến lược 01 • Tránh thuế Mỹ</span>
          <h4 class="advisor-card-title">Đầu Tư ETF Domiciled Tại Ireland (IE / UCITS)</h4>
          <p class="advisor-card-text">
            Người không mang quốc tịch Mỹ (Non-US Resident) khi mua ETF tại Ireland (mã bắt đầu bằng IE) chỉ chịu 15% thuế cổ tức nội bộ nhờ hiệp định song phương, và hoàn toàn tránh được thuế di sản Mỹ lên đến 40%.
          </p>
        </div>
        <div class="advisor-card">
          <span class="advisor-card-tag tag-opportunity">Chiến lược 02 • Tái đầu tư</span>
          <h4 class="advisor-card-title">Ưu Tiên Quỹ Tích Lũy Cổ Tức (Accumulating ETF)</h4>
          <p class="advisor-card-text">
            Cổ tức được tự động gom vào giá chứng chỉ quỹ, không sinh ra dòng tiền mặt cổ tức chịu thuế thu nhập hàng năm tại nước cư trú, giúp tối đa hóa hiệu ứng lãi kép dài hạn.
          </p>
        </div>
        <div class="advisor-card">
          <span class="advisor-card-tag tag-growth">Chiến lược 03 • Thanh khoản</span>
          <h4 class="advisor-card-title">Broker Đa Tiền Tệ & Phân Bổ An Toàn (IBKR)</h4>
          <p class="advisor-card-text">
            Duy trì tài khoản tại các sàn uy tín toàn cầu (Interactive Brokers, Saxo Bank) hỗ trợ đa tiền tệ (EUR, USD, SGD) giúp bạn dễ dàng chuyển đổi chi tiêu bất kể nghỉ hưu ở đâu.
          </p>
        </div>
      `;
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
    const salaryStream = plan.incomes.find(s => s.isPrimarySalary || (s.isSalary && !s.isSpouseSalary) || /lương hiện tại của bạn|lương chính/i.test(s.name || ""))
      || plan.incomes.find(s => !s.isBhxhVn && (s.isSalary || /lương|salary|wage/i.test(s.name || "")));
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
    const unitEl = document.getElementById("unit-pension-base");
    if (unitEl) unitEl.innerText = state.currency === 'VND' ? '₫' : state.currency === 'USD' ? '$' : '€';

    if (isAuto) {
      p.pensionBaseAuto = true;
      p.socialSecurityAnnual = estimated;
      setVal("inp-pension-base-annual", estimated);
      if (txtExp) {
        txtExp.innerHTML = `Chuẩn sức mua hiện tại từ lương (<strong>${window.RetirementEngine.formatCurrency(salary, state.currency)}/năm</strong>): ~<strong>${window.RetirementEngine.formatCurrency(estimated, state.currency)}/năm</strong> (CNAV + Agirc-Arrco)`;
      }
    } else {
      if (txtExp) {
        txtExp.innerHTML = `Chuẩn theo lương: ~${window.RetirementEngine.formatCurrency(estimated, state.currency)}/năm • Đang dùng số tự nhập`;
      }
    }
  }

  function updatePensionDecoteUI(p) {
    if (!p) p = getActivePlan();
    const startWork = parseVal("inp-start-work-age", Number(p?.startWorkAge) || 24);
    const pensionAge = parseVal("inp-pension-age", Number(p?.socialSecurityAge) || 64);
    const retireAge = parseVal("inp-retire-age", Number(p?.retirementAge) || 42);
    const baseAnnual = parseVal("inp-pension-base-annual", Number(p?.socialSecurityAnnual) || 18000);

    let effectivePension = 0;
    let quarters = 0;
    let targetQuarters = 172;
    let missing = 0;
    let decotePenalty = 0;
    let prorata = 0;
    let yearsWorked = Math.max(0, Math.min(retireAge, pensionAge) - startWork);

    if (window.TaxOptimizer && window.TaxOptimizer.calculateFrenchPension) {
      if (p?.maritalStatus === 'married' && p?.frenchPensionDetails) {
        const fpRes = window.TaxOptimizer.calculateFrenchPension(p.frenchPensionDetails);
        effectivePension = fpRes.totalAnnualPension;
        const sp1 = fpRes.spouse1 || {};
        quarters = sp1.trimestresAcquis || (yearsWorked * 4);
        targetQuarters = sp1.trimestresRequis || 172;
        yearsWorked = sp1.yearsWorked || yearsWorked;
      } else {
        const fpRes = window.TaxOptimizer.calculateFrenchPension(baseAnnual, startWork, Math.min(retireAge, pensionAge), pensionAge);
        effectivePension = fpRes.totalAnnualPension;
        quarters = fpRes.trimestresAcquis;
        targetQuarters = fpRes.trimestresRequis;
        yearsWorked = fpRes.yearsWorked;
      }
      missing = Math.max(0, targetQuarters - quarters);
      prorata = Math.min(1.0, quarters / targetQuarters);
      decotePenalty = (pensionAge < 67 && missing > 0) ? Math.min(20, missing) * 0.0125 : 0;
    } else {
      quarters = yearsWorked * 4;
      missing = Math.max(0, targetQuarters - quarters);
      prorata = Math.min(1.0, quarters / targetQuarters);
      decotePenalty = (pensionAge < 67 && missing > 0) ? Math.min(20, missing) * 0.0125 : 0;
      effectivePension = Math.round(baseAnnual * prorata * (1.0 - decotePenalty));
    }

    const lblQuarters = document.getElementById("lbl-pension-quarters");
    const lblDecote = document.getElementById("lbl-pension-decote");
    const lblEffective = document.getElementById("lbl-pension-effective");
    const badgeStatus = document.getElementById("badge-pension-status");
    const cardMonthly = document.getElementById("lbl-french-card-monthly");
    const cardAnnual = document.getElementById("lbl-french-card-annual");
    const cardAgeRange = document.getElementById("lbl-french-card-age-range");
    const cardGrowth = document.getElementById("lbl-french-card-growth");
    const cardContainer = document.getElementById("card-french-pension-stream");
    const btnDel = document.getElementById("btn-del-french-pension");
    const chkFrench = document.getElementById("chk-enable-french-pension");
    const isFrenchEnabled = p?.enableFrenchPension !== false;

    if (chkFrench) chkFrench.checked = isFrenchEnabled;
    if (btnDel) {
      btnDel.innerText = isFrenchEnabled ? "Xóa" : "Kích hoạt";
      btnDel.className = isFrenchEnabled ? "income-item-btn income-item-del" : "income-item-btn";
    }

    if (lblQuarters) {
      lblQuarters.innerText = `${quarters} / 172 quý (${yearsWorked} năm đóng)`;
      lblQuarters.className = "font-mono font-semibold";
      lblQuarters.style.color = quarters >= 172 ? "var(--primary)" : "var(--text-main)";
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
      badgeStatus.style.color = "";
    }

    if (cardMonthly) {
      cardMonthly.style.color = "";
      if (isFrenchEnabled) {
        cardMonthly.innerHTML = `${window.RetirementEngine.formatCurrency(Math.round(effectivePension / 12), state.currency)}<small>/tháng</small>`;
      } else {
        cardMonthly.innerHTML = `<span style="color: var(--text-faint);">0<small>/tháng</small></span>`;
      }
    }
    if (cardAnnual) {
      cardAnnual.innerText = isFrenchEnabled ? `≈ ${window.RetirementEngine.formatCurrency(effectivePension, state.currency)}/năm` : "Chưa kích hoạt lương hưu Pháp";
    }
    if (cardAgeRange) {
      cardAgeRange.innerText = `${pensionAge} - ${Number(p?.lifeExpectancy) || 85} tuổi`;
    }
    if (cardGrowth) {
      cardGrowth.innerText = decotePenalty > 0 ? `Décote -${(decotePenalty * 100).toFixed(1)}%` : "Taux Plein (0%)";
    }
    if (cardContainer) {
      cardContainer.style.opacity = isFrenchEnabled ? "1" : "0.75";
    }
  }

  function updateBhxhVnUI(p) {
    if (!p) p = getActivePlan();
    const isEnabled = p.bhxhVnEnabled !== false;
    const chk = document.getElementById("chk-enable-bhxh-vn");
    if (chk) chk.checked = isEnabled;

    const userGender = p.gender || 'male';
    const isFemale = (userGender === 'female');
    const spouseGender = isFemale ? 'male' : 'female';
    const standardAge = isFemale ? 60 : 62;
    const spouseStandardAge = isFemale ? 62 : 60;
    const isMarried = (p.maritalStatus === 'married');

    if (!p.bhxhVnDetails) p.bhxhVnDetails = {};
    if (!p.bhxhVnDetails.spouse1) {
      p.bhxhVnDetails.spouse1 = {
        gender: userGender,
        yearsContributed: isFemale ? 15 : 20,
        monthlySalaryVnd: Number(p.bhxhVnIncome) || 10000000,
        claimAge: standardAge
      };
    }
    if (!p.bhxhVnDetails.spouse2) {
      p.bhxhVnDetails.spouse2 = {
        gender: spouseGender,
        yearsContributed: isFemale ? 20 : 15,
        monthlySalaryVnd: 10000000,
        claimAge: spouseStandardAge
      };
    }
    p.bhxhVnDetails.spouse1.gender = userGender;
    p.bhxhVnDetails.spouse2.gender = spouseGender;

    const s1Income = Number(p.bhxhVnDetails.spouse1.monthlySalaryVnd) || Number(p.bhxhVnIncome) || 10000000;
    const s1Years = Number(p.bhxhVnDetails.spouse1.yearsContributed) || (isFemale ? 15 : 20);
    const s2Income = Number(p.bhxhVnDetails.spouse2.monthlySalaryVnd) || 10000000;
    const s2Years = Number(p.bhxhVnDetails.spouse2.yearsContributed) || (isFemale ? 20 : 15);

    const startAgeVal = Number(p.bhxhVnStartAge) || Number(p.currentAge) || 29;
    const retireAgeVal = Number(p.bhxhVnRetireAge) || standardAge;
    const lifeExp = Number(p.lifeExpectancy) || 85;

    const bodyEl = document.getElementById("bhxh-inputs-body");
    const badgeEl = document.getElementById("badge-bhxh-status");
    const lblPay = document.getElementById("lbl-bhxh-monthly-pay");
    const lblPension = document.getElementById("lbl-bhxh-pension-est");
    const cardMonthly = document.getElementById("lbl-bhxh-card-monthly");
    const cardAnnual = document.getElementById("lbl-bhxh-card-annual");
    const cardAgeRange = document.getElementById("lbl-bhxh-card-age-range");
    const cardGrowth = document.getElementById("lbl-bhxh-card-growth");
    const cardContainer = document.getElementById("card-bhxh-income-stream");
    const btnDel = document.getElementById("btn-del-bhxh-stream");

    // Tiêu đề & nội dung 2 cột Bạn & Bạn đời
    const col1Title = document.getElementById("lbl-bhxh-col-spouse1-title");
    const col2Title = document.getElementById("lbl-bhxh-col-spouse2-title");
    const col1ClaimTitle = document.getElementById("lbl-bhxh-spouse1-claim-title");
    const col2ClaimTitle = document.getElementById("lbl-bhxh-spouse2-claim-title");
    const col1Badge = document.getElementById("lbl-bhxh-col-spouse1-badge");
    const col2Badge = document.getElementById("lbl-bhxh-col-spouse2-badge");
    const selS1Inc = document.getElementById("sel-bhxh-spouse1-income");
    const selS1Yrs = document.getElementById("sel-bhxh-spouse1-years");
    const selS2Inc = document.getElementById("sel-bhxh-spouse2-income");
    const selS2Yrs = document.getElementById("sel-bhxh-spouse2-years");
    const lblS1Pay = document.getElementById("lbl-bhxh-spouse1-pay");
    const lblS2Pay = document.getElementById("lbl-bhxh-spouse2-pay");
    const lblS1Pen = document.getElementById("lbl-bhxh-spouse1-pension");
    const lblS2Pen = document.getElementById("lbl-bhxh-spouse2-pension");

    if (col1Title) col1Title.innerText = isFemale ? "Bạn (Nữ — 60t)" : "Bạn (Nam — 62t)";
    if (col2Title) col2Title.innerText = isFemale ? "Bạn đời (Nam — 62t)" : "Bạn đời (Nữ — 60t)";
    if (col1ClaimTitle) col1ClaimTitle.innerText = isFemale ? "Hưu nhận lúc 60t:" : "Hưu nhận lúc 62t:";
    if (col2ClaimTitle) col2ClaimTitle.innerText = isFemale ? "Hưu nhận lúc 62t:" : "Hưu nhận lúc 60t:";

    if (selS1Inc && selS1Inc.value !== String(s1Income)) selS1Inc.value = String(s1Income);
    if (selS1Yrs && selS1Yrs.value !== String(s1Years)) selS1Yrs.value = String(s1Years);
    if (selS2Inc && selS2Inc.value !== String(s2Income)) selS2Inc.value = String(s2Income);
    if (selS2Yrs && selS2Yrs.value !== String(s2Years)) selS2Yrs.value = String(s2Years);

    const eurRate = Number(p.exchangeRateEurVnd) || 27500;
    const cur = p.currency || state.currency || 'EUR';

    let res1 = { effectiveRatePercent: 45, monthlyPensionVnd: 4500000, annualPensionVnd: 54000000 };
    let res2 = { effectiveRatePercent: 45, monthlyPensionVnd: 4500000, annualPensionVnd: 54000000 };

    if (window.TaxOptimizer && window.TaxOptimizer.calculateVietnamBhxhPension) {
      res1 = window.TaxOptimizer.calculateVietnamBhxhPension(s1Income, s1Years, userGender, standardAge);
      res2 = window.TaxOptimizer.calculateVietnamBhxhPension(s2Income, s2Years, spouseGender, spouseStandardAge);
    }

    if (col1Badge) col1Badge.innerText = `${s1Years} năm (${res1.effectiveRatePercent}%)`;
    if (col2Badge) col2Badge.innerText = `${s2Years} năm (${res2.effectiveRatePercent}%)`;

    const s1PayVnd = Math.round(s1Income * 0.22);
    const s2PayVnd = Math.round(s2Income * 0.22);
    const s1PayEur = Math.round(s1PayVnd / eurRate);
    const s2PayEur = Math.round(s2PayVnd / eurRate);
    const s1PenEur = Math.round(res1.monthlyPensionVnd / eurRate);
    const s2PenEur = Math.round(res2.monthlyPensionVnd / eurRate);

    if (lblS1Pay) lblS1Pay.innerText = `${(s1PayVnd / 1e6).toFixed(1)} tr ₫/th (~${s1PayEur} €)`;
    if (lblS2Pay) lblS2Pay.innerText = `${(s2PayVnd / 1e6).toFixed(1)} tr ₫/th (~${s2PayEur} €)`;
    if (lblS1Pen) lblS1Pen.innerText = `~${(res1.monthlyPensionVnd / 1e6).toFixed(1)} tr ₫/th (~${s1PenEur} €)`;
    if (lblS2Pen) lblS2Pen.innerText = `~${(res2.monthlyPensionVnd / 1e6).toFixed(1)} tr ₫/th (~${s2PenEur} €)`;

    if (bodyEl) {
      bodyEl.style.opacity = isEnabled ? "1" : "0.45";
      bodyEl.style.pointerEvents = isEnabled ? "auto" : "none";
    }

    if (badgeEl) {
      if (isEnabled) {
        badgeEl.innerText = isMarried ? "2 Người (Luật 2024)" : `${s1Years} năm (Luật 2024)`;
        badgeEl.style.background = "rgba(16, 185, 129, 0.15)";
        badgeEl.style.color = "#34d399";
        badgeEl.style.borderColor = "rgba(16, 185, 129, 0.3)";
      } else {
        badgeEl.innerText = "Chưa tham gia";
        badgeEl.style.background = "rgba(148, 163, 184, 0.1)";
        badgeEl.style.color = "var(--text-faint)";
        badgeEl.style.borderColor = "var(--border-subtle)";
      }
    }

    if (btnDel) {
      btnDel.innerText = isEnabled ? "Xóa" : "Kích hoạt";
      btnDel.className = isEnabled ? "income-item-btn income-item-del" : "income-item-btn";
    }

    const totalMonthlyPayVnd = isMarried ? (s1PayVnd + s2PayVnd) : s1PayVnd;
    const monthlyPensionVnd = isMarried ? (res1.monthlyPensionVnd + res2.monthlyPensionVnd) : res1.monthlyPensionVnd;
    const annualPensionVnd = monthlyPensionVnd * 12;

    let payCurStr, pensionCurStr, cardMonthlyStr, cardAnnualStr;
    if (cur === 'VND') {
      payCurStr = `${totalMonthlyPayVnd.toLocaleString('vi-VN')} ₫/tháng`;
      pensionCurStr = `~${monthlyPensionVnd.toLocaleString('vi-VN')} ₫/tháng`;
      cardMonthlyStr = `${monthlyPensionVnd.toLocaleString('vi-VN')} ₫`;
      cardAnnualStr = `≈ ${(annualPensionVnd / 1e6).toFixed(1)} tr ₫/năm`;
    } else {
      const payEur = Math.round(totalMonthlyPayVnd / eurRate);
      const penEur = Math.round(monthlyPensionVnd / eurRate);
      const annualPenEur = penEur * 12;
      if (cur === 'USD') {
        const payUsd = Math.round(payEur * 1.1);
        const penUsd = Math.round(penEur * 1.1);
        payCurStr = `${totalMonthlyPayVnd.toLocaleString('vi-VN')} ₫ (~${payUsd} $/tháng)`;
        pensionCurStr = `~${monthlyPensionVnd.toLocaleString('vi-VN')} ₫ (~${penUsd} $/tháng)`;
        cardMonthlyStr = `$${penUsd.toLocaleString('en-US')}`;
        cardAnnualStr = `≈ $${(penUsd * 12).toLocaleString('en-US')}/năm`;
      } else {
        payCurStr = `${totalMonthlyPayVnd.toLocaleString('vi-VN')} ₫ (~${payEur} €/tháng)`;
        pensionCurStr = `~${monthlyPensionVnd.toLocaleString('vi-VN')} ₫ (~${penEur} €/tháng)`;
        cardMonthlyStr = `€${penEur.toLocaleString('en-US')}`;
        cardAnnualStr = `≈ €${annualPenEur.toLocaleString('en-US')}/năm`;
      }
    }

    if (lblPay) lblPay.innerText = payCurStr;
    if (lblPension) lblPension.innerText = pensionCurStr;

    if (cardMonthly) {
      if (isEnabled) {
        cardMonthly.innerHTML = `${cardMonthlyStr}<small>/tháng</small>`;
      } else {
        cardMonthly.innerHTML = `<span style="color: var(--text-faint);">0<small>/tháng</small></span>`;
      }
    }
    if (cardAnnual) {
      cardAnnual.innerText = isEnabled ? cardAnnualStr : "Chưa tham gia đóng BHXH tự nguyện VN";
    }
    if (cardAgeRange) {
      cardAgeRange.innerText = `${retireAgeVal} - ${lifeExp} tuổi`;
    }
    if (cardGrowth) {
      cardGrowth.innerText = "+2.0%/năm";
    }
    if (cardContainer) {
      cardContainer.style.opacity = isEnabled ? "1" : "0.75";
    }
  }

  function updateGermanPensionUI(p) {
    if (!p) p = getActivePlan();
    const isEnabled = p.enableGermanPension !== false;
    const chk = document.getElementById("chk-enable-german-pension");
    if (chk) chk.checked = isEnabled;

    if (!p.germanPensionDetails) {
      p.germanPensionDetails = {
        spouse1: { grossAnnualSalary: 45000, yearsContributed: 35, claimAge: 67 },
        spouse2: { grossAnnualSalary: 38000, yearsContributed: 35, claimAge: 67 }
      };
    }
    const s1 = p.germanPensionDetails.spouse1 || {};
    const s2 = p.germanPensionDetails.spouse2 || {};
    const isMarried = (p.maritalStatus === 'married');

    const s1Years = Number(s1.yearsContributed) || 35;
    const s1Age = Number(s1.claimAge) || 67;
    const s1Salary = Number(s1.grossAnnualSalary) || 45000;

    const s2Years = Number(s2.yearsContributed) || 35;
    const s2Age = Number(s2.claimAge) || 67;
    const s2Salary = Number(s2.grossAnnualSalary) || 38000;

    // Sync inputs
    const inpS1Years = document.getElementById("inp-german-spouse1-years");
    const inpS1Age = document.getElementById("inp-german-spouse1-claim-age");
    const inpS1Sal = document.getElementById("inp-german-spouse1-salary");
    const inpS2Years = document.getElementById("inp-german-spouse2-years");
    const inpS2Age = document.getElementById("inp-german-spouse2-claim-age");
    const inpS2Sal = document.getElementById("inp-german-spouse2-salary");

    if (inpS1Years && Number(inpS1Years.value) !== s1Years) inpS1Years.value = s1Years;
    if (inpS1Age && Number(inpS1Age.value) !== s1Age) inpS1Age.value = s1Age;
    if (inpS1Sal && Number(inpS1Sal.value) !== s1Salary) inpS1Sal.value = s1Salary;
    if (inpS2Years && Number(inpS2Years.value) !== s2Years) inpS2Years.value = s2Years;
    if (inpS2Age && Number(inpS2Age.value) !== s2Age) inpS2Age.value = s2Age;
    if (inpS2Sal && Number(inpS2Sal.value) !== s2Salary) inpS2Sal.value = s2Salary;

    let res1 = { totalRP: 34.6, monthlyPension: 1361, totalAnnualPension: 16332, adjustmentPercent: 0 };
    let res2 = { totalRP: 29.3, monthlyPension: 1149, totalAnnualPension: 13788, adjustmentPercent: 0 };

    if (window.TaxOptimizer && window.TaxOptimizer.calculateGermanPension) {
      res1 = window.TaxOptimizer.calculateGermanPension(s1Salary, s1Years, s1Age);
      res2 = window.TaxOptimizer.calculateGermanPension(s2Salary, s2Years, s2Age);
    }

    const b1Badge = document.getElementById("lbl-german-spouse1-badge");
    const b2Badge = document.getElementById("lbl-german-spouse2-badge");
    const b1Adj = document.getElementById("lbl-german-spouse1-adj");
    const b2Adj = document.getElementById("lbl-german-spouse2-adj");
    const b1Pen = document.getElementById("lbl-german-spouse1-pension");
    const b2Pen = document.getElementById("lbl-german-spouse2-pension");

    if (b1Badge) b1Badge.innerText = `${s1Years} năm • ${res1.totalRP} RP`;
    if (b2Badge) b2Badge.innerText = `${s2Years} năm • ${res2.totalRP} RP`;
    if (b1Adj) b1Adj.innerText = res1.adjustmentPercent === 0 ? "Chuẩn 67t: 0%" : (res1.adjustmentPercent > 0 ? `+${res1.adjustmentPercent}%` : `${res1.adjustmentPercent}%`);
    if (b2Adj) b2Adj.innerText = res2.adjustmentPercent === 0 ? "Chuẩn 67t: 0%" : (res2.adjustmentPercent > 0 ? `+${res2.adjustmentPercent}%` : `${res2.adjustmentPercent}%`);
    if (b1Pen) b1Pen.innerText = `~${window.RetirementEngine.formatCurrency(res1.monthlyPension, 'EUR')}/tháng (~${window.RetirementEngine.formatCurrency(res1.totalAnnualPension, 'EUR')}/n)`;
    if (b2Pen) b2Pen.innerText = `~${window.RetirementEngine.formatCurrency(res2.monthlyPension, 'EUR')}/tháng (~${window.RetirementEngine.formatCurrency(res2.totalAnnualPension, 'EUR')}/n)`;

    const totalMonthly = res1.monthlyPension + (isMarried ? res2.monthlyPension : 0);
    const totalAnnual = res1.totalAnnualPension + (isMarried ? res2.totalAnnualPension : 0);

    const lblMonthly = document.getElementById("lbl-german-card-monthly");
    const lblAnnual = document.getElementById("lbl-german-card-annual");
    const lblTotal = document.getElementById("lbl-german-pension-effective");
    const badgeStatus = document.getElementById("badge-german-status");
    const btnDel = document.getElementById("btn-del-german-pension");
    const cardAgeRange = document.getElementById("lbl-german-card-age-range");

    if (badgeStatus) badgeStatus.innerText = isMarried ? "2 Người (GRV)" : "1 Người (GRV)";
    if (btnDel) {
      btnDel.innerText = isEnabled ? "Xóa" : "Kích hoạt";
      btnDel.className = isEnabled ? "income-item-btn income-item-del" : "income-item-btn";
    }
    if (lblMonthly) {
      lblMonthly.innerHTML = isEnabled ? `${window.RetirementEngine.formatCurrency(totalMonthly, 'EUR')}<small>/tháng</small>` : `<span style="color: var(--text-faint);">0<small>/tháng</small></span>`;
    }
    if (lblAnnual) {
      lblAnnual.innerText = isEnabled ? `≈ ${window.RetirementEngine.formatCurrency(totalAnnual, 'EUR')}/năm` : "Lương hưu Đức đang tạm tắt";
    }
    if (lblTotal) {
      lblTotal.innerText = `~${window.RetirementEngine.formatCurrency(totalMonthly, 'EUR')}/tháng (~${window.RetirementEngine.formatCurrency(totalAnnual, 'EUR')}/năm)`;
    }
    if (cardAgeRange) {
      cardAgeRange.innerText = `${s1Age} - ${Number(p.lifeExpectancy) || 85} tuổi`;
    }
  }

  function updateUsPensionUI(p) {
    if (!p) p = getActivePlan();
    const isEnabled = p.enableUsPension !== false;
    const chk = document.getElementById("chk-enable-us-pension");
    if (chk) chk.checked = isEnabled;

    if (!p.usPensionDetails) {
      p.usPensionDetails = {
        spouse1: { grossAnnualSalary: 65000, yearsWorked: 35, claimAge: 67 },
        spouse2: { grossAnnualSalary: 55000, yearsWorked: 35, claimAge: 67 }
      };
    }
    const s1 = p.usPensionDetails.spouse1 || {};
    const s2 = p.usPensionDetails.spouse2 || {};
    const isMarried = (p.maritalStatus === 'married');

    const s1Years = Number(s1.yearsWorked) || 35;
    const s1Age = Number(s1.claimAge) || 67;
    const s1Salary = Number(s1.grossAnnualSalary) || 65000;

    const s2Years = Number(s2.yearsWorked) || 35;
    const s2Age = Number(s2.claimAge) || 67;
    const s2Salary = Number(s2.grossAnnualSalary) || 55000;

    // Sync inputs
    const inpS1Years = document.getElementById("inp-us-spouse1-years");
    const inpS1Age = document.getElementById("inp-us-spouse1-claim-age");
    const inpS1Sal = document.getElementById("inp-us-spouse1-salary");
    const inpS2Years = document.getElementById("inp-us-spouse2-years");
    const inpS2Age = document.getElementById("inp-us-spouse2-claim-age");
    const inpS2Sal = document.getElementById("inp-us-spouse2-salary");

    if (inpS1Years && Number(inpS1Years.value) !== s1Years) inpS1Years.value = s1Years;
    if (inpS1Age && Number(inpS1Age.value) !== s1Age) inpS1Age.value = s1Age;
    if (inpS1Sal && Number(inpS1Sal.value) !== s1Salary) inpS1Sal.value = s1Salary;
    if (inpS2Years && Number(inpS2Years.value) !== s2Years) inpS2Years.value = s2Years;
    if (inpS2Age && Number(inpS2Age.value) !== s2Age) inpS2Age.value = s2Age;
    if (inpS2Sal && Number(inpS2Sal.value) !== s2Salary) inpS2Sal.value = s2Salary;

    let res1 = { aime: 5417, pia: 2414, adjustmentFactor: 1.0, monthlyPensionUsd: 2414, totalAnnualPensionUsd: 28968, adjustmentPercent: 0 };
    let res2 = { aime: 4583, pia: 2147, adjustmentFactor: 1.0, monthlyPensionUsd: 2147, totalAnnualPensionUsd: 25764, adjustmentPercent: 0 };

    if (window.TaxOptimizer && window.TaxOptimizer.calculateUsSocialSecurityPension) {
      res1 = window.TaxOptimizer.calculateUsSocialSecurityPension(s1Salary, s1Years, s1Age);
      res2 = window.TaxOptimizer.calculateUsSocialSecurityPension(s2Salary, s2Years, s2Age);
    }

    const b1Badge = document.getElementById("lbl-us-spouse1-badge");
    const b2Badge = document.getElementById("lbl-us-spouse2-badge");
    const b1Adj = document.getElementById("lbl-us-spouse1-adj");
    const b2Adj = document.getElementById("lbl-us-spouse2-adj");
    const b1Pen = document.getElementById("lbl-us-spouse1-pension");
    const b2Pen = document.getElementById("lbl-us-spouse2-pension");

    if (b1Badge) b1Badge.innerText = `${s1Years} năm • AIME $${res1.aime}`;
    if (b2Badge) b2Badge.innerText = `${s2Years} năm • AIME $${res2.aime}`;
    if (b1Adj) b1Adj.innerText = res1.adjustmentPercent === 0 ? "Chuẩn FRA: 100%" : (res1.adjustmentPercent > 0 ? `+${res1.adjustmentPercent}%` : `${res1.adjustmentPercent}%`);
    if (b2Adj) b2Adj.innerText = res2.adjustmentPercent === 0 ? "Chuẩn FRA: 100%" : (res2.adjustmentPercent > 0 ? `+${res2.adjustmentPercent}%` : `${res2.adjustmentPercent}%`);
    if (b1Pen) b1Pen.innerText = `~$${res1.monthlyPensionUsd}/tháng (~$${res1.totalAnnualPensionUsd}/n)`;
    if (b2Pen) b2Pen.innerText = `~$${res2.monthlyPensionUsd}/tháng (~$${res2.totalAnnualPensionUsd}/n)`;

    const totalMonthlyUsd = res1.monthlyPensionUsd + (isMarried ? res2.monthlyPensionUsd : 0);
    const totalAnnualUsd = res1.totalAnnualPensionUsd + (isMarried ? res2.totalAnnualPensionUsd : 0);

    const lblMonthly = document.getElementById("lbl-us-card-monthly");
    const lblAnnual = document.getElementById("lbl-us-card-annual");
    const lblTotal = document.getElementById("lbl-us-pension-effective");
    const badgeStatus = document.getElementById("badge-us-status");
    const btnDel = document.getElementById("btn-del-us-pension");
    const cardAgeRange = document.getElementById("lbl-us-card-age-range");

    if (badgeStatus) badgeStatus.innerText = isMarried ? "2 Người (FRA 67t)" : "1 Người (FRA 67t)";
    if (btnDel) {
      btnDel.innerText = isEnabled ? "Xóa" : "Kích hoạt";
      btnDel.className = isEnabled ? "income-item-btn income-item-del" : "income-item-btn";
    }
    if (lblMonthly) {
      lblMonthly.innerHTML = isEnabled ? `$${totalMonthlyUsd}<small>/tháng</small>` : `<span style="color: var(--text-faint);">$0<small>/tháng</small></span>`;
    }
    if (lblAnnual) {
      lblAnnual.innerText = isEnabled ? `≈ $${totalAnnualUsd}/năm` : "Lương hưu Mỹ đang tạm tắt";
    }
    if (lblTotal) {
      lblTotal.innerText = `~$${totalMonthlyUsd}/tháng (~$${totalAnnualUsd}/năm)`;
    }
    if (cardAgeRange) {
      cardAgeRange.innerText = `${s1Age} - ${Number(p.lifeExpectancy) || 85} tuổi`;
    }
  }

  function updateJapanPensionUI(p) {
    if (!p) p = getActivePlan();
    const isEnabled = p.enableJapanPension !== false;
    const chk = document.getElementById("chk-enable-japan-pension");
    if (chk) chk.checked = isEnabled;

    if (!p.japanPensionDetails) {
      p.japanPensionDetails = {
        spouse1: { grossAnnualSalary: 4500000, yearsContributed: 25, claimAge: 65 },
        spouse2: { grossAnnualSalary: 3500000, yearsContributed: 20, claimAge: 65 }
      };
    }
    const s1 = p.japanPensionDetails.spouse1 || {};
    const s2 = p.japanPensionDetails.spouse2 || {};
    const isMarried = (p.maritalStatus === 'married');

    const s1Years = Number(s1.yearsContributed) || 25;
    const s1Age = Number(s1.claimAge) || 65;
    const s1Salary = Number(s1.grossAnnualSalary) || 4500000;

    const s2Years = Number(s2.yearsContributed) || 20;
    const s2Age = Number(s2.claimAge) || 65;
    const s2Salary = Number(s2.grossAnnualSalary) || 3500000;

    // Sync inputs
    const inpS1Years = document.getElementById("inp-japan-spouse1-years");
    const inpS1Age = document.getElementById("inp-japan-spouse1-claim-age");
    const inpS1Sal = document.getElementById("inp-japan-spouse1-salary");
    const inpS2Years = document.getElementById("inp-japan-spouse2-years");
    const inpS2Age = document.getElementById("inp-japan-spouse2-claim-age");
    const inpS2Sal = document.getElementById("inp-japan-spouse2-salary");

    if (inpS1Years && Number(inpS1Years.value) !== s1Years) inpS1Years.value = s1Years;
    if (inpS1Age && Number(inpS1Age.value) !== s1Age) inpS1Age.value = s1Age;
    if (inpS1Sal && Number(inpS1Sal.value) !== s1Salary) inpS1Sal.value = s1Salary;
    if (inpS2Years && Number(inpS2Years.value) !== s2Years) inpS2Years.value = s2Years;
    if (inpS2Age && Number(inpS2Age.value) !== s2Age) inpS2Age.value = s2Age;
    if (inpS2Sal && Number(inpS2Sal.value) !== s2Salary) inpS2Sal.value = s2Salary;

    let res1 = { monthlyPensionJpy: 93800, totalAnnualPensionJpy: 1125600, monthlyPensionEur: 579, totalAnnualPensionEur: 6948, adjustmentPercent: 0, koseiJpy: 616000 };
    let res2 = { monthlyPensionJpy: 65900, totalAnnualPensionJpy: 790800, monthlyPensionEur: 407, totalAnnualPensionEur: 4884, adjustmentPercent: 0, koseiJpy: 383000 };

    if (window.TaxOptimizer && window.TaxOptimizer.calculateJapanPension) {
      res1 = window.TaxOptimizer.calculateJapanPension(s1Salary, s1Years, s1Age);
      res2 = window.TaxOptimizer.calculateJapanPension(s2Salary, s2Years, s2Age);
    }

    const b1Badge = document.getElementById("lbl-japan-spouse1-badge");
    const b2Badge = document.getElementById("lbl-japan-spouse2-badge");
    const b1Adj = document.getElementById("lbl-japan-spouse1-adj");
    const b2Adj = document.getElementById("lbl-japan-spouse2-adj");
    const b1Pen = document.getElementById("lbl-japan-spouse1-pension");
    const b2Pen = document.getElementById("lbl-japan-spouse2-pension");

    if (b1Badge) b1Badge.innerText = `${s1Years} năm • Nenkin 2 tầng`;
    if (b2Badge) b2Badge.innerText = `${s2Years} năm • Nenkin 2 tầng`;
    if (b1Adj) b1Adj.innerText = res1.adjustmentPercent === 0 ? "Chuẩn 65t: 0%" : (res1.adjustmentPercent > 0 ? `+${res1.adjustmentPercent}%` : `${res1.adjustmentPercent}%`);
    if (b2Adj) b2Adj.innerText = res2.adjustmentPercent === 0 ? "Chuẩn 65t: 0%" : (res2.adjustmentPercent > 0 ? `+${res2.adjustmentPercent}%` : `${res2.adjustmentPercent}%`);
    if (b1Pen) b1Pen.innerText = `~¥${res1.monthlyPensionJpy.toLocaleString()}/th (~${window.RetirementEngine.formatCurrency(res1.monthlyPensionEur, 'EUR')}/th)`;
    if (b2Pen) b2Pen.innerText = `~¥${res2.monthlyPensionJpy.toLocaleString()}/th (~${window.RetirementEngine.formatCurrency(res2.monthlyPensionEur, 'EUR')}/th)`;

    const totalMonthlyJpy = res1.monthlyPensionJpy + (isMarried ? res2.monthlyPensionJpy : 0);
    const totalAnnualJpy = res1.totalAnnualPensionJpy + (isMarried ? res2.totalAnnualPensionJpy : 0);
    const totalMonthlyEur = res1.monthlyPensionEur + (isMarried ? res2.monthlyPensionEur : 0);
    const totalAnnualEur = res1.totalAnnualPensionEur + (isMarried ? res2.totalAnnualPensionEur : 0);

    const lblMonthly = document.getElementById("lbl-japan-card-monthly");
    const lblAnnual = document.getElementById("lbl-japan-card-annual");
    const lblTotal = document.getElementById("lbl-japan-pension-effective");
    const badgeStatus = document.getElementById("badge-japan-status");
    const btnDel = document.getElementById("btn-del-japan-pension");
    const cardAgeRange = document.getElementById("lbl-japan-card-age-range");

    if (badgeStatus) badgeStatus.innerText = isMarried ? "2 Người (Nenkin)" : "1 Người (Nenkin)";
    if (btnDel) {
      btnDel.innerText = isEnabled ? "Xóa" : "Kích hoạt";
      btnDel.className = isEnabled ? "income-item-btn income-item-del" : "income-item-btn";
    }
    if (lblMonthly) {
      lblMonthly.innerHTML = isEnabled ? `¥${totalMonthlyJpy.toLocaleString()}<small>/tháng</small>` : `<span style="color: var(--text-faint);">¥0<small>/tháng</small></span>`;
    }
    if (lblAnnual) {
      lblAnnual.innerText = isEnabled ? `≈ ¥${totalAnnualJpy.toLocaleString()}/năm (~${window.RetirementEngine.formatCurrency(totalAnnualEur, 'EUR')}/n)` : "Lương hưu Nhật Bản đang tạm tắt";
    }
    if (lblTotal) {
      lblTotal.innerText = `~¥${totalMonthlyJpy.toLocaleString()}/tháng (~${window.RetirementEngine.formatCurrency(totalMonthlyEur, 'EUR')}/tháng)`;
    }
    if (cardAgeRange) {
      cardAgeRange.innerText = `${s1Age} - ${Number(p.lifeExpectancy) || 85} tuổi`;
    }
  }

  function updateCanadaPensionUI(p) {
    if (!p) p = getActivePlan();
    const isEnabled = p.enableCanadaPension !== false;
    const chk = document.getElementById("chk-enable-canada-pension");
    if (chk) chk.checked = isEnabled;

    if (!p.canadaPensionDetails) {
      p.canadaPensionDetails = {
        spouse1: { grossAnnualSalary: 65000, yearsContributed: 30, yearsResident: 30, claimAge: 65 },
        spouse2: { grossAnnualSalary: 50000, yearsContributed: 25, yearsResident: 25, claimAge: 65 }
      };
    }
    const s1 = p.canadaPensionDetails.spouse1 || {};
    const s2 = p.canadaPensionDetails.spouse2 || {};
    const isMarried = (p.maritalStatus === 'married');

    const s1Years = Number(s1.yearsContributed) || 30;
    const s1ResYears = Number(s1.yearsResident) || 30;
    const s1Age = Number(s1.claimAge) || 65;
    const s1Salary = Number(s1.grossAnnualSalary) || 65000;

    const s2Years = Number(s2.yearsContributed) || 25;
    const s2ResYears = Number(s2.yearsResident) || 25;
    const s2Age = Number(s2.claimAge) || 65;
    const s2Salary = Number(s2.grossAnnualSalary) || 50000;

    // Sync inputs
    const inpS1Years = document.getElementById("inp-canada-spouse1-years");
    const inpS1Res = document.getElementById("inp-canada-spouse1-res-years");
    const inpS1Age = document.getElementById("inp-canada-spouse1-claim-age");
    const inpS1Sal = document.getElementById("inp-canada-spouse1-salary");
    const inpS2Years = document.getElementById("inp-canada-spouse2-years");
    const inpS2Res = document.getElementById("inp-canada-spouse2-res-years");
    const inpS2Age = document.getElementById("inp-canada-spouse2-claim-age");
    const inpS2Sal = document.getElementById("inp-canada-spouse2-salary");

    if (inpS1Years && Number(inpS1Years.value) !== s1Years) inpS1Years.value = s1Years;
    if (inpS1Res && Number(inpS1Res.value) !== s1ResYears) inpS1Res.value = s1ResYears;
    if (inpS1Age && Number(inpS1Age.value) !== s1Age) inpS1Age.value = s1Age;
    if (inpS1Sal && Number(inpS1Sal.value) !== s1Salary) inpS1Sal.value = s1Salary;
    if (inpS2Years && Number(inpS2Years.value) !== s2Years) inpS2Years.value = s2Years;
    if (inpS2Res && Number(inpS2Res.value) !== s2ResYears) inpS2Res.value = s2ResYears;
    if (inpS2Age && Number(inpS2Age.value) !== s2Age) inpS2Age.value = s2Age;
    if (inpS2Sal && Number(inpS2Sal.value) !== s2Salary) inpS2Sal.value = s2Salary;

    let res1 = { monthlyPensionCad: 1577, totalAnnualPensionCad: 18920, monthlyPensionEur: 1072, totalAnnualPensionEur: 12866, adjustmentPercent: 0 };
    let res2 = { monthlyPensionCad: 1115, totalAnnualPensionCad: 13380, monthlyPensionEur: 758, totalAnnualPensionEur: 9098, adjustmentPercent: 0 };

    if (window.TaxOptimizer && window.TaxOptimizer.calculateCanadaPension) {
      res1 = window.TaxOptimizer.calculateCanadaPension(s1Salary, s1Years, s1ResYears, s1Age);
      res2 = window.TaxOptimizer.calculateCanadaPension(s2Salary, s2Years, s2ResYears, s2Age);
    }

    const b1Badge = document.getElementById("lbl-canada-spouse1-badge");
    const b2Badge = document.getElementById("lbl-canada-spouse2-badge");
    const b1Adj = document.getElementById("lbl-canada-spouse1-adj");
    const b2Adj = document.getElementById("lbl-canada-spouse2-adj");
    const b1Pen = document.getElementById("lbl-canada-spouse1-pension");
    const b2Pen = document.getElementById("lbl-canada-spouse2-pension");

    if (b1Badge) b1Badge.innerText = `${s1Years}n CPP • ${s1ResYears}n OAS`;
    if (b2Badge) b2Badge.innerText = `${s2Years}n CPP • ${s2ResYears}n OAS`;
    if (b1Adj) b1Adj.innerText = res1.adjustmentPercent === 0 ? "Chuẩn 65t: 0%" : (res1.adjustmentPercent > 0 ? `+${res1.adjustmentPercent}%` : `${res1.adjustmentPercent}%`);
    if (b2Adj) b2Adj.innerText = res2.adjustmentPercent === 0 ? "Chuẩn 65t: 0%" : (res2.adjustmentPercent > 0 ? `+${res2.adjustmentPercent}%` : `${res2.adjustmentPercent}%`);
    if (b1Pen) b1Pen.innerText = `~$${res1.monthlyPensionCad.toLocaleString()} CAD/th (~${window.RetirementEngine.formatCurrency(res1.monthlyPensionEur, 'EUR')}/th)`;
    if (b2Pen) b2Pen.innerText = `~$${res2.monthlyPensionCad.toLocaleString()} CAD/th (~${window.RetirementEngine.formatCurrency(res2.monthlyPensionEur, 'EUR')}/th)`;

    const totalMonthlyCad = res1.monthlyPensionCad + (isMarried ? res2.monthlyPensionCad : 0);
    const totalAnnualCad = res1.totalAnnualPensionCad + (isMarried ? res2.totalAnnualPensionCad : 0);
    const totalMonthlyEur = res1.monthlyPensionEur + (isMarried ? res2.monthlyPensionEur : 0);
    const totalAnnualEur = res1.totalAnnualPensionEur + (isMarried ? res2.totalAnnualPensionEur : 0);

    const lblMonthly = document.getElementById("lbl-canada-card-monthly");
    const lblAnnual = document.getElementById("lbl-canada-card-annual");
    const lblTotal = document.getElementById("lbl-canada-pension-effective");
    const badgeStatus = document.getElementById("badge-canada-status");
    const btnDel = document.getElementById("btn-del-canada-pension");
    const cardAgeRange = document.getElementById("lbl-canada-card-age-range");

    if (badgeStatus) badgeStatus.innerText = isMarried ? "2 Người (CPP & OAS)" : "1 Người (CPP & OAS)";
    if (btnDel) {
      btnDel.innerText = isEnabled ? "Xóa" : "Kích hoạt";
      btnDel.className = isEnabled ? "income-item-btn income-item-del" : "income-item-btn";
    }
    if (lblMonthly) {
      lblMonthly.innerHTML = isEnabled ? `$${totalMonthlyCad.toLocaleString()} CAD<small>/tháng</small>` : `<span style="color: var(--text-faint);">$0 CAD<small>/tháng</small></span>`;
    }
    if (lblAnnual) {
      lblAnnual.innerText = isEnabled ? `≈ $${totalAnnualCad.toLocaleString()} CAD/năm (~${window.RetirementEngine.formatCurrency(totalAnnualEur, 'EUR')}/n)` : "Lương hưu Canada đang tạm tắt";
    }
    if (lblTotal) {
      lblTotal.innerText = `~$${totalMonthlyCad.toLocaleString()} CAD/tháng (~${window.RetirementEngine.formatCurrency(totalMonthlyEur, 'EUR')}/tháng)`;
    }
    if (cardAgeRange) {
      cardAgeRange.innerText = `${s1Age} - ${Number(p.lifeExpectancy) || 85} tuổi`;
    }
  }

  function updateAustraliaPensionUI(p) {
    if (!p) p = getActivePlan();
    const isEnabled = p.enableAustraliaPension !== false;
    const chk = document.getElementById("chk-enable-australia-pension");
    if (chk) chk.checked = isEnabled;

    if (!p.australiaPensionDetails) {
      p.australiaPensionDetails = {
        spouse1: { grossAnnualSalary: 85000, yearsWorked: 25, superBalance: 250000, claimAge: 67 },
        spouse2: { grossAnnualSalary: 65000, yearsWorked: 20, superBalance: 180000, claimAge: 67 }
      };
    }
    const s1 = p.australiaPensionDetails.spouse1 || {};
    const s2 = p.australiaPensionDetails.spouse2 || {};
    const isMarried = (p.maritalStatus === 'married');

    const s1Years = Number(s1.yearsWorked) || 25;
    const s1Super = Number(s1.superBalance) || 250000;
    const s1Age = Number(s1.claimAge) || 67;
    const s1Salary = Number(s1.grossAnnualSalary) || 85000;

    const s2Years = Number(s2.yearsWorked) || 20;
    const s2Super = Number(s2.superBalance) || 180000;
    const s2Age = Number(s2.claimAge) || 67;
    const s2Salary = Number(s2.grossAnnualSalary) || 65000;

    // Sync inputs
    const inpS1Years = document.getElementById("inp-australia-spouse1-years");
    const inpS1Super = document.getElementById("inp-australia-spouse1-super");
    const inpS1Age = document.getElementById("inp-australia-spouse1-claim-age");
    const inpS1Sal = document.getElementById("inp-australia-spouse1-salary");
    const inpS2Years = document.getElementById("inp-australia-spouse2-years");
    const inpS2Super = document.getElementById("inp-australia-spouse2-super");
    const inpS2Age = document.getElementById("inp-australia-spouse2-claim-age");
    const inpS2Sal = document.getElementById("inp-australia-spouse2-salary");

    if (inpS1Years && Number(inpS1Years.value) !== s1Years) inpS1Years.value = s1Years;
    if (inpS1Super && Number(inpS1Super.value) !== s1Super) inpS1Super.value = s1Super;
    if (inpS1Age && Number(inpS1Age.value) !== s1Age) inpS1Age.value = s1Age;
    if (inpS1Sal && Number(inpS1Sal.value) !== s1Salary) inpS1Sal.value = s1Salary;
    if (inpS2Years && Number(inpS2Years.value) !== s2Years) inpS2Years.value = s2Years;
    if (inpS2Super && Number(inpS2Super.value) !== s2Super) inpS2Super.value = s2Super;
    if (inpS2Age && Number(inpS2Age.value) !== s2Age) inpS2Age.value = s2Age;
    if (inpS2Sal && Number(inpS2Sal.value) !== s2Salary) inpS2Sal.value = s2Salary;

    let res1 = { monthlyPensionAud: 2225, totalAnnualPensionAud: 26700, monthlyPensionEur: 1357, totalAnnualPensionEur: 16287, superAnnual: 12500, centrelinkAnnual: 14200 };
    let res2 = { monthlyPensionAud: 1933, totalAnnualPensionAud: 23200, monthlyPensionEur: 1179, totalAnnualPensionEur: 14152, superAnnual: 9000, centrelinkAnnual: 14200 };

    if (window.TaxOptimizer && window.TaxOptimizer.calculateAustraliaPension) {
      res1 = window.TaxOptimizer.calculateAustraliaPension(s1Salary, s1Years, s1Super, s1Age);
      res2 = window.TaxOptimizer.calculateAustraliaPension(s2Salary, s2Years, s2Super, s2Age);
    }

    const b1Badge = document.getElementById("lbl-australia-spouse1-badge");
    const b2Badge = document.getElementById("lbl-australia-spouse2-badge");
    const b1Adj = document.getElementById("lbl-australia-spouse1-adj");
    const b2Adj = document.getElementById("lbl-australia-spouse2-adj");
    const b1Pen = document.getElementById("lbl-australia-spouse1-pension");
    const b2Pen = document.getElementById("lbl-australia-spouse2-pension");

    if (b1Badge) b1Badge.innerText = `Super $${Math.round(s1Super/1000)}k • ${s1Years} năm`;
    if (b2Badge) b2Badge.innerText = `Super $${Math.round(s2Super/1000)}k • ${s2Years} năm`;
    if (b1Adj) b1Adj.innerText = s1Age >= 67 ? "Super + Age Pension" : "Chỉ rút Super (<67t)";
    if (b2Adj) b2Adj.innerText = s2Age >= 67 ? "Super + Age Pension" : "Chỉ rút Super (<67t)";
    if (b1Pen) b1Pen.innerText = `~$${res1.monthlyPensionAud.toLocaleString()} AUD/th (~${window.RetirementEngine.formatCurrency(res1.monthlyPensionEur, 'EUR')}/th)`;
    if (b2Pen) b2Pen.innerText = `~$${res2.monthlyPensionAud.toLocaleString()} AUD/th (~${window.RetirementEngine.formatCurrency(res2.monthlyPensionEur, 'EUR')}/th)`;

    const totalMonthlyAud = res1.monthlyPensionAud + (isMarried ? res2.monthlyPensionAud : 0);
    const totalAnnualAud = res1.totalAnnualPensionAud + (isMarried ? res2.totalAnnualPensionAud : 0);
    const totalMonthlyEur = res1.monthlyPensionEur + (isMarried ? res2.monthlyPensionEur : 0);
    const totalAnnualEur = res1.totalAnnualPensionEur + (isMarried ? res2.totalAnnualPensionEur : 0);

    const lblMonthly = document.getElementById("lbl-australia-card-monthly");
    const lblAnnual = document.getElementById("lbl-australia-card-annual");
    const lblTotal = document.getElementById("lbl-australia-pension-effective");
    const badgeStatus = document.getElementById("badge-australia-status");
    const btnDel = document.getElementById("btn-del-australia-pension");
    const cardAgeRange = document.getElementById("lbl-australia-card-age-range");

    if (badgeStatus) badgeStatus.innerText = isMarried ? "2 Người (Super & Age)" : "1 Người (Super & Age)";
    if (btnDel) {
      btnDel.innerText = isEnabled ? "Xóa" : "Kích hoạt";
      btnDel.className = isEnabled ? "income-item-btn income-item-del" : "income-item-btn";
    }
    if (lblMonthly) {
      lblMonthly.innerHTML = isEnabled ? `$${totalMonthlyAud.toLocaleString()} AUD<small>/tháng</small>` : `<span style="color: var(--text-faint);">$0 AUD<small>/tháng</small></span>`;
    }
    if (lblAnnual) {
      lblAnnual.innerText = isEnabled ? `≈ $${totalAnnualAud.toLocaleString()} AUD/năm (~${window.RetirementEngine.formatCurrency(totalAnnualEur, 'EUR')}/n)` : "Lương hưu Úc đang tạm tắt";
    }
    if (lblTotal) {
      lblTotal.innerText = `~$${totalMonthlyAud.toLocaleString()} AUD/tháng (~${window.RetirementEngine.formatCurrency(totalMonthlyEur, 'EUR')}/tháng)`;
    }
    if (cardAgeRange) {
      cardAgeRange.innerText = `${s1Age} - ${Number(p.lifeExpectancy) || 85} tuổi`;
    }
  }

  function updateKoreaPensionUI(p) {
    if (!p) p = getActivePlan();
    const isEnabled = p.enableKoreaPension !== false;
    const chk = document.getElementById("chk-enable-korea-pension");
    if (chk) chk.checked = isEnabled;

    if (!p.koreaPensionDetails) {
      p.koreaPensionDetails = {
        spouse1: { grossMonthlySalary: 3500000, yearsContributed: 20, claimAge: 65 },
        spouse2: { grossMonthlySalary: 2800000, yearsContributed: 15, claimAge: 65 }
      };
    }
    const s1 = p.koreaPensionDetails.spouse1 || {};
    const s2 = p.koreaPensionDetails.spouse2 || {};
    const isMarried = (p.maritalStatus === 'married');

    const s1Years = Number(s1.yearsContributed) || 20;
    const s1Age = Number(s1.claimAge) || 65;
    const s1Salary = Number(s1.grossMonthlySalary) || 3500000;

    const s2Years = Number(s2.yearsContributed) || 15;
    const s2Age = Number(s2.claimAge) || 65;
    const s2Salary = Number(s2.grossMonthlySalary) || 2800000;

    // Sync inputs
    const inpS1Years = document.getElementById("inp-korea-spouse1-years");
    const inpS1Age = document.getElementById("inp-korea-spouse1-claim-age");
    const inpS1Sal = document.getElementById("inp-korea-spouse1-salary");
    const inpS2Years = document.getElementById("inp-korea-spouse2-years");
    const inpS2Age = document.getElementById("inp-korea-spouse2-claim-age");
    const inpS2Sal = document.getElementById("inp-korea-spouse2-salary");

    if (inpS1Years && Number(inpS1Years.value) !== s1Years) inpS1Years.value = s1Years;
    if (inpS1Age && Number(inpS1Age.value) !== s1Age) inpS1Age.value = s1Age;
    if (inpS1Sal && Number(inpS1Sal.value) !== s1Salary) inpS1Sal.value = s1Salary;
    if (inpS2Years && Number(inpS2Years.value) !== s2Years) inpS2Years.value = s2Years;
    if (inpS2Age && Number(inpS2Age.value) !== s2Age) inpS2Age.value = s2Age;
    if (inpS2Sal && Number(inpS2Sal.value) !== s2Salary) inpS2Sal.value = s2Salary;

    let res1 = { monthlyPensionKrw: 648900, totalAnnualPensionKrw: 7786800, monthlyPensionEur: 441, totalAnnualPensionEur: 5295, adjustmentPercent: 0 };
    let res2 = { monthlyPensionKrw: 434200, totalAnnualPensionKrw: 5210400, monthlyPensionEur: 295, totalAnnualPensionEur: 3543, adjustmentPercent: 0 };

    if (window.TaxOptimizer && window.TaxOptimizer.calculateKoreaPension) {
      res1 = window.TaxOptimizer.calculateKoreaPension(s1Salary, s1Years, s1Age);
      res2 = window.TaxOptimizer.calculateKoreaPension(s2Salary, s2Years, s2Age);
    }

    const b1Badge = document.getElementById("lbl-korea-spouse1-badge");
    const b2Badge = document.getElementById("lbl-korea-spouse2-badge");
    const b1Adj = document.getElementById("lbl-korea-spouse1-adj");
    const b2Adj = document.getElementById("lbl-korea-spouse2-adj");
    const b1Pen = document.getElementById("lbl-korea-spouse1-pension");
    const b2Pen = document.getElementById("lbl-korea-spouse2-pension");

    if (b1Badge) b1Badge.innerText = `${s1Years} năm • NPS`;
    if (b2Badge) b2Badge.innerText = `${s2Years} năm • NPS`;
    if (b1Adj) b1Adj.innerText = res1.adjustmentPercent === 0 ? "Chuẩn 65t: 0%" : (res1.adjustmentPercent > 0 ? `+${res1.adjustmentPercent}%` : `${res1.adjustmentPercent}%`);
    if (b2Adj) b2Adj.innerText = res2.adjustmentPercent === 0 ? "Chuẩn 65t: 0%" : (res2.adjustmentPercent > 0 ? `+${res2.adjustmentPercent}%` : `${res2.adjustmentPercent}%`);
    if (b1Pen) b1Pen.innerText = `~₩${res1.monthlyPensionKrw.toLocaleString()}/th (~${window.RetirementEngine.formatCurrency(res1.monthlyPensionEur, 'EUR')}/th)`;
    if (b2Pen) b2Pen.innerText = `~₩${res2.monthlyPensionKrw.toLocaleString()}/th (~${window.RetirementEngine.formatCurrency(res2.monthlyPensionEur, 'EUR')}/th)`;

    const totalMonthlyKrw = res1.monthlyPensionKrw + (isMarried ? res2.monthlyPensionKrw : 0);
    const totalAnnualKrw = res1.totalAnnualPensionKrw + (isMarried ? res2.totalAnnualPensionKrw : 0);
    const totalMonthlyEur = res1.monthlyPensionEur + (isMarried ? res2.monthlyPensionEur : 0);
    const totalAnnualEur = res1.totalAnnualPensionEur + (isMarried ? res2.totalAnnualPensionEur : 0);

    const lblMonthly = document.getElementById("lbl-korea-card-monthly");
    const lblAnnual = document.getElementById("lbl-korea-card-annual");
    const lblTotal = document.getElementById("lbl-korea-pension-effective");
    const badgeStatus = document.getElementById("badge-korea-status");
    const btnDel = document.getElementById("btn-del-korea-pension");
    const cardAgeRange = document.getElementById("lbl-korea-card-age-range");

    if (badgeStatus) badgeStatus.innerText = isMarried ? "2 Người (NPS)" : "1 Người (NPS)";
    if (btnDel) {
      btnDel.innerText = isEnabled ? "Xóa" : "Kích hoạt";
      btnDel.className = isEnabled ? "income-item-btn income-item-del" : "income-item-btn";
    }
    if (lblMonthly) {
      lblMonthly.innerHTML = isEnabled ? `₩${totalMonthlyKrw.toLocaleString()}<small>/tháng</small>` : `<span style="color: var(--text-faint);">₩0<small>/tháng</small></span>`;
    }
    if (lblAnnual) {
      lblAnnual.innerText = isEnabled ? `≈ ₩${totalAnnualKrw.toLocaleString()}/năm (~${window.RetirementEngine.formatCurrency(totalAnnualEur, 'EUR')}/n)` : "Lương hưu Hàn Quốc đang tạm tắt";
    }
    if (lblTotal) {
      lblTotal.innerText = `~₩${totalMonthlyKrw.toLocaleString()}/tháng (~${window.RetirementEngine.formatCurrency(totalMonthlyEur, 'EUR')}/tháng)`;
    }
    if (cardAgeRange) {
      cardAgeRange.innerText = `${s1Age} - ${Number(p.lifeExpectancy) || 85} tuổi`;
    }
  }

  function updateTaiwanPensionUI(p) {
    if (!p) p = getActivePlan();
    const isEnabled = p.enableTaiwanPension !== false;
    const chk = document.getElementById("chk-enable-taiwan-pension");
    if (chk) chk.checked = isEnabled;

    if (!p.taiwanPensionDetails) {
      p.taiwanPensionDetails = {
        spouse1: { insuredMonthlySalary: 45800, yearsContributed: 20, claimAge: 65 },
        spouse2: { insuredMonthlySalary: 36000, yearsContributed: 15, claimAge: 65 }
      };
    }
    const s1 = p.taiwanPensionDetails.spouse1 || {};
    const s2 = p.taiwanPensionDetails.spouse2 || {};
    const isMarried = (p.maritalStatus === 'married');

    const s1Years = Number(s1.yearsContributed) || 20;
    const s1Age = Number(s1.claimAge) || 65;
    const s1Salary = Number(s1.insuredMonthlySalary) || 45800;

    const s2Years = Number(s2.yearsContributed) || 15;
    const s2Age = Number(s2.claimAge) || 65;
    const s2Salary = Number(s2.insuredMonthlySalary) || 36000;

    // Sync inputs
    const inpS1Years = document.getElementById("inp-taiwan-spouse1-years");
    const inpS1Age = document.getElementById("inp-taiwan-spouse1-claim-age");
    const inpS1Sal = document.getElementById("inp-taiwan-spouse1-salary");
    const inpS2Years = document.getElementById("inp-taiwan-spouse2-years");
    const inpS2Age = document.getElementById("inp-taiwan-spouse2-claim-age");
    const inpS2Sal = document.getElementById("inp-taiwan-spouse2-salary");

    if (inpS1Years && Number(inpS1Years.value) !== s1Years) inpS1Years.value = s1Years;
    if (inpS1Age && Number(inpS1Age.value) !== s1Age) inpS1Age.value = s1Age;
    if (inpS1Sal && Number(inpS1Sal.value) !== s1Salary) inpS1Sal.value = s1Salary;
    if (inpS2Years && Number(inpS2Years.value) !== s2Years) inpS2Years.value = s2Years;
    if (inpS2Age && Number(inpS2Age.value) !== s2Age) inpS2Age.value = s2Age;
    if (inpS2Sal && Number(inpS2Sal.value) !== s2Salary) inpS2Sal.value = s2Salary;

    let res1 = { monthlyPensionTwd: 17862, totalAnnualPensionTwd: 214344, monthlyPensionEur: 518, totalAnnualPensionEur: 6216, adjustmentPercent: 0 };
    let res2 = { monthlyPensionTwd: 10530, totalAnnualPensionTwd: 126360, monthlyPensionEur: 305, totalAnnualPensionEur: 3664, adjustmentPercent: 0 };

    if (window.TaxOptimizer && window.TaxOptimizer.calculateTaiwanPension) {
      res1 = window.TaxOptimizer.calculateTaiwanPension(s1Salary, s1Years, s1Age);
      res2 = window.TaxOptimizer.calculateTaiwanPension(s2Salary, s2Years, s2Age);
    }

    const b1Badge = document.getElementById("lbl-taiwan-spouse1-badge");
    const b2Badge = document.getElementById("lbl-taiwan-spouse2-badge");
    const b1Adj = document.getElementById("lbl-taiwan-spouse1-adj");
    const b2Adj = document.getElementById("lbl-taiwan-spouse2-adj");
    const b1Pen = document.getElementById("lbl-taiwan-spouse1-pension");
    const b2Pen = document.getElementById("lbl-taiwan-spouse2-pension");

    if (b1Badge) b1Badge.innerText = `${s1Years} năm • 勞保+勞退`;
    if (b2Badge) b2Badge.innerText = `${s2Years} năm • 勞保+勞退`;
    if (b1Adj) b1Adj.innerText = res1.adjustmentPercent === 0 ? "Chuẩn 65t: 0%" : (res1.adjustmentPercent > 0 ? `+${res1.adjustmentPercent}%` : `${res1.adjustmentPercent}%`);
    if (b2Adj) b2Adj.innerText = res2.adjustmentPercent === 0 ? "Chuẩn 65t: 0%" : (res2.adjustmentPercent > 0 ? `+${res2.adjustmentPercent}%` : `${res2.adjustmentPercent}%`);
    if (b1Pen) b1Pen.innerText = `~NT$${res1.monthlyPensionTwd.toLocaleString()}/th (~${window.RetirementEngine.formatCurrency(res1.monthlyPensionEur, 'EUR')}/th)`;
    if (b2Pen) b2Pen.innerText = `~NT$${res2.monthlyPensionTwd.toLocaleString()}/th (~${window.RetirementEngine.formatCurrency(res2.monthlyPensionEur, 'EUR')}/th)`;

    const totalMonthlyTwd = res1.monthlyPensionTwd + (isMarried ? res2.monthlyPensionTwd : 0);
    const totalAnnualTwd = res1.totalAnnualPensionTwd + (isMarried ? res2.totalAnnualPensionTwd : 0);
    const totalMonthlyEur = res1.monthlyPensionEur + (isMarried ? res2.monthlyPensionEur : 0);
    const totalAnnualEur = res1.totalAnnualPensionEur + (isMarried ? res2.totalAnnualPensionEur : 0);

    const lblMonthly = document.getElementById("lbl-taiwan-card-monthly");
    const lblAnnual = document.getElementById("lbl-taiwan-card-annual");
    const lblTotal = document.getElementById("lbl-taiwan-pension-effective");
    const badgeStatus = document.getElementById("badge-taiwan-status");
    const btnDel = document.getElementById("btn-del-taiwan-pension");
    const cardAgeRange = document.getElementById("lbl-taiwan-card-age-range");

    if (badgeStatus) badgeStatus.innerText = isMarried ? "2 Người (勞保 & 勞退)" : "1 Người (勞保 & 勞退)";
    if (btnDel) {
      btnDel.innerText = isEnabled ? "Xóa" : "Kích hoạt";
      btnDel.className = isEnabled ? "income-item-btn income-item-del" : "income-item-btn";
    }
    if (lblMonthly) {
      lblMonthly.innerHTML = isEnabled ? `NT$${totalMonthlyTwd.toLocaleString()}<small>/tháng</small>` : `<span style="color: var(--text-faint);">NT$0<small>/tháng</small></span>`;
    }
    if (lblAnnual) {
      lblAnnual.innerText = isEnabled ? `≈ NT$${totalAnnualTwd.toLocaleString()}/năm (~${window.RetirementEngine.formatCurrency(totalAnnualEur, 'EUR')}/n)` : "Lương hưu Đài Loan đang tạm tắt";
    }
    if (lblTotal) {
      lblTotal.innerText = `~NT$${totalMonthlyTwd.toLocaleString()}/tháng (~${window.RetirementEngine.formatCurrency(totalMonthlyEur, 'EUR')}/tháng)`;
    }
    if (cardAgeRange) {
      cardAgeRange.innerText = `${s1Age} - ${Number(p.lifeExpectancy) || 85} tuổi`;
    }
  }

  function syncBhxhVnStreams(p) {
    if (!p) p = getActivePlan();
    if (!Array.isArray(p.expenses)) p.expenses = [];
    if (!Array.isArray(p.incomes)) p.incomes = [];

    // Remove previous auto-injected BHXH VN streams
    p.expenses = p.expenses.filter(s => !s.isBhxhVn && s.name !== "Đóng BHXH Tự Nguyện VN (22%)");
    p.incomes = p.incomes.filter(s => !s.isBhxhVn && s.name !== "Lương hưu BHXH Việt Nam");

    const isEnabled = p.bhxhVnEnabled !== false;
    if (!isEnabled) {
      return;
    }

    const userGender = p.gender || 'male';
    const isFemale = (userGender === 'female');
    const spouseGender = isFemale ? 'male' : 'female';
    const standardAge = isFemale ? 60 : 62;
    const isMarried = (p.maritalStatus === 'married');

    const s1Income = Number(p.bhxhVnDetails?.spouse1?.monthlySalaryVnd) || Number(p.bhxhVnIncome) || 10000000;
    const s1Years = Number(p.bhxhVnDetails?.spouse1?.yearsContributed) || (isFemale ? 15 : 20);
    const s2Income = Number(p.bhxhVnDetails?.spouse2?.monthlySalaryVnd) || 10000000;
    const s2Years = Number(p.bhxhVnDetails?.spouse2?.yearsContributed) || (isFemale ? 20 : 15);

    const startAge = Math.max(18, Number(p.bhxhVnStartAge) || Number(p.currentAge) || 29);
    const yearsVal = Math.max(s1Years, isMarried ? s2Years : s1Years);
    const endExpenseAge = startAge + yearsVal - 1;
    const retireAgeVn = Math.max(startAge + (isFemale ? 15 : 20), Number(p.bhxhVnRetireAge) || standardAge);
    const lifeExp = Number(p.lifeExpectancy) || 85;

    let res1 = { monthlyPensionVnd: 4500000, annualPensionVnd: 54000000 };
    let res2 = { monthlyPensionVnd: 4500000, annualPensionVnd: 54000000 };

    if (window.TaxOptimizer && window.TaxOptimizer.calculateVietnamBhxhPension) {
      res1 = window.TaxOptimizer.calculateVietnamBhxhPension(s1Income, s1Years, userGender, standardAge);
      res2 = window.TaxOptimizer.calculateVietnamBhxhPension(s2Income, s2Years, spouseGender, isFemale ? 62 : 60);
    }

    const s1PayVnd = Math.round(s1Income * 0.22);
    const s2PayVnd = Math.round(s2Income * 0.22);
    const monthlyPayVnd = isMarried ? (s1PayVnd + s2PayVnd) : s1PayVnd;
    const annualPayVnd = monthlyPayVnd * 12;

    const monthlyPensionVnd = isMarried ? (res1.monthlyPensionVnd + res2.monthlyPensionVnd) : res1.monthlyPensionVnd;
    const annualPensionVnd = monthlyPensionVnd * 12;

    const eurRate = Number(p.exchangeRateEurVnd) || 27500;
    const cur = p.currency || state.currency || 'EUR';

    let annualPayCur, annualPensionCur;
    if (cur === 'VND') {
      annualPayCur = annualPayVnd;
      annualPensionCur = annualPensionVnd;
    } else if (cur === 'USD') {
      annualPayCur = Math.round((annualPayVnd / eurRate) * 1.10);
      annualPensionCur = Math.round((annualPensionVnd / eurRate) * 1.10);
    } else {
      annualPayCur = Math.round(annualPayVnd / eurRate);
      annualPensionCur = Math.round(annualPensionVnd / eurRate);
    }

    // Luồng chi tiêu đóng BHXH
    p.expenses.push({
      name: "Đóng BHXH Tự Nguyện VN (22%)",
      amount: annualPayCur,
      startAge: startAge,
      endAge: endExpenseAge,
      growth: 0,
      isDebt: false,
      isBhxhVn: true,
      note: `22% mức ${s1Income.toLocaleString('vi-VN')} ₫/tháng (${s1Years} năm)${isMarried ? ` + Bạn đời ${s2Income.toLocaleString('vi-VN')} ₫/tháng (${s2Years} năm)` : ''}`
    });

    // Luồng thu nhập nhận lương hưu VN
    p.incomes.push({
      name: "Lương hưu BHXH Việt Nam",
      amount: annualPensionCur,
      startAge: retireAgeVn,
      endAge: lifeExp,
      growth: 2.0,
      taxable: false,
      isBhxhVn: true
    });
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
      .filter(a => Number(a.loan_amount) > 0 || Number(a.monthly_loan_payment) > 0 || Number(a.monthly_charges) > 0)
      .map(a => {
        const loanPmt = Number(a.monthly_loan_payment) || 0;
        const charges = Number(a.monthly_charges) || 0;
        const totalExpenses = loanPmt + charges;
        const cat = a.property_category || (a.raw?.property_category) || (a.typology && (/maison|villa|nhà/i).test(a.typology) ? 'house' : 'apartment');
        const appr = a.appreciation_rate !== undefined ? Number(a.appreciation_rate) : (a.raw?.appreciation_rate !== undefined ? Number(a.raw.appreciation_rate) : (cat === 'house' ? 2.5 : 0.0));
        return {
          name: a.name || a.address || (cat === 'house' ? 'Nhà mặt đất' : 'Căn hộ'),
          propertyCategory: cat,
          propertyAppreciation: appr,
          loanAmount: Number(a.loan_amount) || 0,
          interestRate: Number(a.annual_interest_rate) || 0,
          insuranceRate: Number(a.annual_insurance_rate) || 0,
          loanTermYears: Number(a.loan_duration) || 20,
          startYear: Number(a.start_year) || curYear,
          startAge: (Number(a.start_year) || curYear) - bYear,
          propertyValue: Number(a.property_price) || 0,
          monthlyPaymentEur: totalExpenses > 0 ? totalExpenses : loanPmt,
          monthlyLoanPaymentEur: loanPmt,
          monthlyChargesEur: charges,
          effectiveRentEur: Number(a.effective_monthly_rent) || (Number(a.monthly_rent) || 0)
        };
      });
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
      propertyCategory: l.propertyCategory || 'apartment',
      propertyAppreciation: l.propertyAppreciation !== undefined ? Number(l.propertyAppreciation) : (l.propertyCategory === 'house' ? 2.5 : 0.0),
      monthlyPaymentEur: l.monthlyPaymentEur ? Math.round(l.monthlyPaymentEur * f) : 0,
      monthlyLoanPaymentEur: l.monthlyLoanPaymentEur ? Math.round(l.monthlyLoanPaymentEur * f) : (l.monthlyPaymentEur ? Math.round(l.monthlyPaymentEur * f) : 0),
      monthlyChargesEur: l.monthlyChargesEur ? Math.round(l.monthlyChargesEur * f) : 0,
      effectiveRentEur: l.effectiveRentEur ? Math.round(l.effectiveRentEur * f) : 0
    }));
  }

  // Apply patrimoine data to a plan: mortgage loans + LMNP / Turo income streams
  function applyPatrimoineToPlan(p, data) {
    if (!p || !data) return;
    const eurLoans = extractPatrimoineLoansEur(p, data);
    p.mortgage = p.mortgage || {};
    p.mortgage.patrimoineLoansEur = Array.isArray(eurLoans) ? eurLoans : [];

    const f = eurToPlanFactor(p);
    const round = (v) => p.currency === 'VND' ? Math.round((v * f) / 100000) * 100000 : Math.round(v * f);
    const summary = data.summary || {};
    const curAge = Number(p.currentAge) || 29;
    const retireAge = Number(p.retirementAge) || 42;
    if (!Array.isArray(p.incomes)) p.incomes = [];

    // LMNP rental income: since expenses now include total outlays (loan + operating charges),
    // income takes the full effective rent so net cashflow remains perfectly accurate.
    const reIdx = p.incomes.findIndex(inc => (inc.name || '').includes('LMNP') || (inc.name || '').includes('BĐS Cho thuê') || (inc.name || '').includes('Doanh thu'));
    if ((summary.total_properties || 0) > 0) {
      const totalEffectiveRent = (data.apartments || []).reduce((acc, a) => {
        const rent = Number(a.effective_monthly_rent) || (Number(a.monthly_rent) * (1 - (Number(a.vacancy_pct) || 0) / 100.0)) || 0;
        return acc + rent;
      }, 0);
      const annualRent = totalEffectiveRent > 0 ? totalEffectiveRent * 12 : (summary.total_annual_post_loan_cashflow || 0);
      const cashflow = (p.lmnpEnabled !== false) ? round(annualRent) : 0;
      if (reIdx >= 0) {
        // Update rental income amount while preserving user-configured startAge, endAge and growth
        p.incomes[reIdx].name = 'Doanh thu BDS';
        p.incomes[reIdx].amount = cashflow;
        if (p.incomes[reIdx].startAge === undefined || p.incomes[reIdx].startAge === null) p.incomes[reIdx].startAge = curAge;
        if (p.incomes[reIdx].endAge === undefined || p.incomes[reIdx].endAge === null) p.incomes[reIdx].endAge = 85;
        if (p.incomes[reIdx].growth === undefined || p.incomes[reIdx].growth === null) p.incomes[reIdx].growth = 1.5;
        p.incomes[reIdx].taxable = false;
      } else {
        p.incomes.push({ name: 'Doanh thu BDS', amount: cashflow, startAge: curAge, endAge: 85, growth: 1.5, taxable: false });
      }
    } else if (reIdx >= 0) {
      p.incomes.splice(reIdx, 1);
    }

    // Turo đã được quản lý trực tiếp như một nguồn thu nhập thông thường (không cần đồng bộ riêng)

    // Synchronize Apartment Purchase Milestones from Patrimoine into plan.milestones
    const apts = Array.isArray(data.apartments) ? data.apartments : [];
    if (!Array.isArray(p.milestones)) p.milestones = [];
    // Luôn dọn sạch các mốc mua căn hộ cũ của patrimoine trước
    p.milestones = p.milestones.filter(m => m.source !== 'patrimoine' && m.id !== 'ms_home');

    if (apts.length > 0) {
      const curYear = new Date().getFullYear();
      const bYear = Number(p.birthYear) || (curYear - curAge);

      apts.forEach((apt, idx) => {
        const startYr = Number(apt.start_year) || curYear;
        const buyAge = startYr - bYear;
        const aptName = apt.name || apt.address || `Căn hộ ${idx + 1}`;
        const downPaymentEur = Number(apt.down_payment) || Number(apt.down_payment_input) || 0;
        const downPaymentAmt = round(downPaymentEur);
        const isFuture = buyAge >= curAge;

        p.milestones.push({
          id: `ms_patrimoine_${idx}_${startYr}`,
          name: `Mua ${aptName}`,
          age: buyAge,
          startYear: startYr,
          icon: '',
          type: 'expense',
          amount: isFuture ? downPaymentAmt : 0,
          note: isFuture
            ? `Vốn tự có: ${window.RetirementEngine.formatCurrency(downPaymentAmt, p.currency || 'EUR')} (Năm ${startYr})`
            : `Đã mua năm ${startYr} (Vốn tự có ban đầu: ${window.RetirementEngine.formatCurrency(downPaymentAmt, p.currency || 'EUR')})`,
          enabled: true,
          color: '#ec4899',
          source: 'patrimoine',
          isCustom: true
        });
      });
    }

    // Auto-sync mortgage loans into Expense Streams
    if (typeof syncMortgageToExpenseStreams === 'function') {
      syncMortgageToExpenseStreams(p, false);
    }
  }

  async function fetchPatrimoineData() {
    try {
      if (window.PatrimoineApp && typeof window.PatrimoineApp.loadData === "function") {
        const d = await window.PatrimoineApp.loadData();
        if (d && (d.apartments || d.summary)) {
          state.patrimoineData = d;
          return d;
        }
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

  function updateLmnpUI(p) {
    if (!p) p = getActivePlan();
    const isEnabled = p.lmnpEnabled !== false;
    const chk = document.getElementById("chk-enable-lmnp-stream");
    if (chk) chk.checked = isEnabled;

    const pData = state.patrimoineData || (window.patrimoineData) || null;
    let apts = [];
    if (pData && Array.isArray(pData.apartments)) {
      apts = pData.apartments;
    } else if (!pData && window.PatrimoineApp && typeof window.PatrimoineApp.computeFullPatrimoine === "function") {
      // Chỉ đọc từ guest storage khi pData chưa từng được khởi tạo
      try {
        const guest = JSON.parse(localStorage.getItem("pyRetrait_guest_patrimoine_v2") || "{}");
        if (guest && guest.apartments && Object.keys(guest.apartments).length > 0) {
          const comp = window.PatrimoineApp.computeFullPatrimoine(guest.apartments, guest.turo, guest.wealth);
          if (comp && Array.isArray(comp.apartments)) apts = comp.apartments;
        }
      } catch (e) {
        console.warn("Lỗi đọc dữ liệu căn hộ:", e);
      }
    }

    const cur = p.currency || state.currency || 'EUR';
    const fmt = (v) => window.RetirementEngine.formatCurrency(v, cur);
    const f = eurToPlanFactor(p);

    const badgeStatus = document.getElementById("badge-lmnp-status");
    const btnDel = document.getElementById("btn-del-lmnp-stream");
    const cardContainer = document.getElementById("card-lmnp-income-stream");
    const bodyEl = document.getElementById("lmnp-inputs-body");

    if (badgeStatus) {
      if (isEnabled) {
        badgeStatus.innerText = apts.length > 0 ? `${apts.length} căn LMNP` : "0 căn hộ";
        badgeStatus.style.background = "rgba(16, 185, 129, 0.15)";
        badgeStatus.style.color = "#34d399";
        badgeStatus.style.borderColor = "rgba(16, 185, 129, 0.3)";
      } else {
        badgeStatus.innerText = "Đã tạm tắt";
        badgeStatus.style.background = "rgba(148, 163, 184, 0.1)";
        badgeStatus.style.color = "var(--text-faint)";
        badgeStatus.style.borderColor = "var(--border-subtle)";
      }
    }

    if (btnDel) {
      btnDel.innerText = isEnabled ? "Tắt" : "Bật";
      btnDel.className = isEnabled ? "income-item-btn income-item-del" : "income-item-btn";
    }

    if (cardContainer) {
      cardContainer.style.opacity = isEnabled ? "1" : "0.75";
    }
    if (bodyEl) {
      bodyEl.style.opacity = isEnabled ? "1" : "0.5";
      bodyEl.style.pointerEvents = isEnabled ? "auto" : "none";
    }

    // Amounts calculation
    const lmnpStream = (p.incomes || []).find(inc => /lmnp|doanh thu bđs|doanh thu bds/i.test(inc.name || ''));
    const totalEffectiveRentEur = apts.reduce((acc, a) => {
      const eff = Number(a.effective_monthly_rent) || (Number(a.monthly_rent) * (1 - (Number(a.vacancy_pct !== undefined ? a.vacancy_pct : 5.0) / 100.0))) || 0;
      return acc + eff;
    }, 0);
    const totalAnnualRentEur = totalEffectiveRentEur * 12;
    const annualRent = apts.length === 0 ? 0 : (lmnpStream ? Number(lmnpStream.amount) : Math.round(totalAnnualRentEur * f));
    const monthlyRent = Math.round(annualRent / 12);

    const lblMonthly = document.getElementById("lbl-lmnp-card-monthly");
    const lblAnnual = document.getElementById("lbl-lmnp-card-annual");
    const lblAgeRange = document.getElementById("lbl-lmnp-card-age-range");
    const lblGrowth = document.getElementById("lbl-lmnp-card-growth");

    if (lblMonthly) {
      if (isEnabled && apts.length > 0) {
        lblMonthly.innerHTML = `${fmt(monthlyRent)}<small>/tháng</small>`;
      } else {
        lblMonthly.innerHTML = `<span style="color: var(--text-faint);">0<small>/tháng</small></span>`;
      }
    }
    if (lblAnnual) {
      lblAnnual.innerText = isEnabled ? (apts.length > 0 ? `≈ ${fmt(annualRent)}/năm` : "Chưa có căn hộ cho thuê nào") : "Đã tạm tắt nguồn thu BĐS";
    }
    if (lblAgeRange) {
      const startAge = lmnpStream?.startAge !== undefined ? lmnpStream.startAge : (p.currentAge || 29);
      const endAge = lmnpStream?.endAge !== undefined ? lmnpStream.endAge : 85;
      lblAgeRange.innerText = `${startAge} - ${endAge} tuổi`;
    }
    if (lblGrowth) {
      const gr = lmnpStream?.growth !== undefined ? lmnpStream.growth : 1.5;
      lblGrowth.innerText = `+${gr}%/năm`;
    }

    // Mini KPIs inside drawer
    const totalPropValEur = apts.reduce((acc, a) => acc + (Number(a.property_price) || 0), 0);
    const totalLoanValEur = apts.reduce((acc, a) => acc + (Number(a.loan_amount) || 0), 0);
    const totalNetMonthlyEur = apts.reduce((acc, a) => acc + (Number(a.monthly_cashflow) || 0), 0);

    const lblPropVal = document.getElementById("lbl-lmnp-total-prop-val");
    const lblLoanVal = document.getElementById("lbl-lmnp-total-loan-val");
    const lblNetCf = document.getElementById("lbl-lmnp-net-cashflow-val");

    if (lblPropVal) lblPropVal.innerText = fmt(Math.round(totalPropValEur * f));
    if (lblLoanVal) lblLoanVal.innerText = fmt(Math.round(totalLoanValEur * f));
    if (lblNetCf) {
      const netPlan = Math.round(totalNetMonthlyEur * f);
      const sign = netPlan >= 0 ? "+" : "";
      lblNetCf.innerText = `${sign}${fmt(netPlan)}/tháng`;
      lblNetCf.style.color = netPlan >= 0 ? "#10b981" : "#f59e0b";
    }

    // Render apartments list
    const listContainer = document.getElementById("lmnp-apartments-container");
    if (listContainer) {
      if (apts.length === 0) {
        listContainer.innerHTML = `<div style="font-size:0.76rem; color:var(--text-faint); padding:0.6rem; text-align:center; background:var(--bg-card); border:1px dashed var(--border-subtle); border-radius:6px;">Chưa có căn hộ nào được lưu. Bấm <strong>"+ Thêm Căn Hộ Cho Thuê Mới"</strong> để bắt đầu quản lý BĐS!</div>`;
      } else {
        listContainer.innerHTML = apts.map(apt => {
          const effRentEur = Number(apt.effective_monthly_rent) || (Number(apt.monthly_rent) * (1 - (Number(apt.vacancy_pct !== undefined ? apt.vacancy_pct : 5.0) / 100.0))) || 0;
          const loanPmtEur = Number(apt.monthly_loan_payment) || 0;
          const netCfEur = apt.monthly_cashflow !== undefined ? Number(apt.monthly_cashflow) : (effRentEur - loanPmtEur);
          const isNeg = netCfEur < 0;

          const effRent = Math.round(effRentEur * f);
          const loanPmt = Math.round(loanPmtEur * f);
          const netCf = Math.round(netCfEur * f);

          return `
            <div class="lmnp-apt-row" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.55rem 0.75rem; display: flex; flex-direction: column; gap: 0.35rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                  <strong style="color: var(--text-main); font-size: 0.82rem;">${apt.name}</strong>
                  <span style="font-size: 0.68rem; padding: 1px 5px; border-radius: 4px; background: rgba(16, 185, 129, 0.12); color: #059669; border: 1px solid rgba(16, 185, 129, 0.25); font-weight: 500;">
                    ${apt.typology || 'T2'} • ${apt.surface || 0}m²
                  </span>
                  <span style="font-size: 0.68rem; padding: 1px 5px; border-radius: 4px; background: rgba(148, 163, 184, 0.12); color: var(--text-muted); border: 1px solid var(--border-subtle);">
                    DPE ${apt.dpe_rating || 'C'} • Mua ${apt.start_year || 2023}
                  </span>
                </div>
                <div style="display: flex; gap: 0.35rem;">
                  <button type="button" class="btn btn-xs btn-outline btn-edit-sub-apt" data-name="${encodeURIComponent(apt.name)}" style="font-size: 0.72rem; padding: 2px 8px; color: #10b981; border-color: rgba(16, 185, 129, 0.4); cursor: pointer;" title="Chỉnh sửa mọi thông số căn hộ này">Sửa</button>
                  <button type="button" class="btn btn-xs btn-outline btn-del-sub-apt" data-name="${encodeURIComponent(apt.name)}" style="font-size: 0.72rem; padding: 2px 8px; color: #f43f5e; border-color: rgba(244, 63, 94, 0.4); cursor: pointer;" title="Xóa căn hộ này">Xóa</button>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.74rem; color: var(--text-muted); border-top: 1px dashed var(--border-subtle); padding-top: 0.35rem;">
                <span>Thuê: <strong style="color: #10b981;">+${fmt(effRent)}/th</strong></span>
                <span>Trả nợ: <strong style="color: #f43f5e;">-${fmt(loanPmt)}/th</strong></span>
                <span>Dòng tiền: <strong style="color: ${isNeg ? '#f59e0b' : '#10b981'};">${isNeg ? '' : '+'}${fmt(netCf)}/th</strong></span>
              </div>
            </div>
          `;
        }).join("");

        listContainer.querySelectorAll(".btn-edit-sub-apt").forEach(btn => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const name = decodeURIComponent(btn.getAttribute("data-name"));
            if (window.PatrimoineApp && typeof window.PatrimoineApp.openApartmentModal === "function") {
              window.PatrimoineApp.openApartmentModal(name);
            }
          });
        });

        listContainer.querySelectorAll(".btn-del-sub-apt").forEach(btn => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const name = decodeURIComponent(btn.getAttribute("data-name"));
            if (window.PatrimoineApp && typeof window.PatrimoineApp.deleteApartment === "function") {
              window.PatrimoineApp.deleteApartment(name);
            }
          });
        });
      }
    }
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
        : (curAge < l.startAge ? `Bắt đầu năm ${l.startYear}` : `Đã tất toán`);
      return `
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.65rem; font-size: 0.76rem; line-height: 1.45;">
          <div style="font-weight: 700; color: var(--text-main);">${l.name}</div>
          <div style="color: var(--text-muted);">Vay gốc ${fmt(l.loanAmount)} • ${l.interestRate}% + BH ${l.insuranceRate}% • ${l.loanTermYears} năm (${l.startYear} → ${l.startYear + l.loanTermYears}, tuổi ${l.startAge} → ${payoffAge})</div>
          <div style="color: var(--text-muted);">${status}</div>
        </div>`;
    }).join("");
  }

  function updateMortgageUI(p) {
    if (!p) p = getActivePlan();
    const chk = document.getElementById("chk-mortgage-enabled");
    const chkPat = document.getElementById("chk-mortgage-from-patrimoine");
    const usePat = chkPat ? chkPat.checked : true;
    p.mortgageFromPatrimoine = usePat;

    const propVal = Number(document.getElementById("inp-mortgage-prop-val")?.value) || (p.mortgage?.propertyValue || 200000);
    const loanAmt = Number(document.getElementById("inp-mortgage-loan")?.value) || (p.mortgage?.loanAmount || 160000);
    const rate = Number(document.getElementById("inp-mortgage-rate")?.value) || (p.mortgage?.interestRate || 2.2);
    const term = Number(document.getElementById("inp-mortgage-term")?.value) || (p.mortgage?.loanTermYears || 20);
    const startAge = Number(document.getElementById("inp-mortgage-start")?.value) || (p.mortgage?.startAge || p.currentAge || 29);

    const curSymbol = window.RetirementEngine.getCurrencySymbol(state.currency);
    const unitProp = document.getElementById("unit-mortgage-prop");
    const unitLoan = document.getElementById("unit-mortgage-loan");
    if (unitProp) unitProp.innerText = curSymbol;
    if (unitLoan) unitLoan.innerText = curSymbol;

    const patLoans = usePat ? buildPatrimoineLoans(p) : [];
    const fromPat = patLoans.length > 0;

    const patrimoineLoansEur = p.mortgage?.patrimoineLoansEur || [];
    const mortConfig = {
      enabled: chk ? chk.checked : (fromPat || p.mortgage?.enabled !== false),
      propertyValue: propVal,
      loanAmount: loanAmt,
      interestRate: rate,
      loanTermYears: term,
      startAge: startAge,
      propertyAppreciation: 2.5,
      patrimoineLoansEur
    };

    if (fromPat) {
      mortConfig.source = 'patrimoine';
      mortConfig.loans = patLoans;
    }
    p.mortgage = mortConfig;

    // Toggle manual inputs vs. synced list
    const manualBox = document.getElementById("mortgage-manual-fields");
    const listBox = document.getElementById("mortgage-patrimoine-loans");
    const hintSrc = document.getElementById("hint-mortgage-source");
    if (manualBox) manualBox.style.display = fromPat ? "none" : "block";
    if (listBox) listBox.style.display = fromPat ? "flex" : "none";
    if (hintSrc) {
      if (fromPat) {
        const totalLoan = patLoans.reduce((s, l) => s + l.loanAmount, 0);
        hintSrc.innerHTML = `Đã lấy <strong>${patLoans.length} khoản vay</strong> từ Quản Lý Tài Sản (tổng vay gốc ${window.RetirementEngine.formatCurrency(totalLoan, state.currency)}). Sửa khoản vay ở tab Quản Lý Tài Sản.`;
      } else if (usePat) {
        hintSrc.innerText = "Chưa có căn hộ nào có khoản vay trong Quản Lý Tài Sản — đang dùng số liệu nhập tay bên dưới.";
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

  function syncMortgageToExpenseStreams(plan, showToastMsg = true) {
    if (!plan) plan = getActivePlan();
    if (!Array.isArray(plan.expenses)) plan.expenses = [];
    const patLoans = buildPatrimoineLoans(plan) || [];

    // Danh sách tên chuẩn và tên gốc của các căn hộ/khoản vay BĐS còn hiệu lực
    const validCleanNames = new Set(patLoans.map(loan => `Chi phí BĐS & Crédit: ${loan.name || 'BĐS'}`));
    const validApartmentNames = new Set(patLoans.map(loan => (loan.name || '').trim()).filter(Boolean));

    // Tự động xóa các khoản Chi phí BĐS & Crédit không còn tồn tại trong Quản Lý BĐS
    plan.expenses = plan.expenses.filter(e => {
      const expName = e.name || '';
      const isPatrimoineExpense = (e.source === 'patrimoine') || expName.startsWith('Chi phí BĐS & Crédit:');

      // Nếu không phải khoản chi BĐS, giữ nguyên tuyệt đối
      if (!isPatrimoineExpense) return true;

      // Nếu không còn khoản vay BĐS nào (đã xóa hết căn hộ), xóa sạch
      if (patLoans.length === 0) return false;

      // Nếu còn BĐS, kiểm tra xem khoản chi này có thuộc căn hộ còn tồn tại không
      if (validCleanNames.has(expName)) return true;
      for (const aptName of validApartmentNames) {
        if (expName.includes(aptName)) return true;
      }
      return false; // Căn hộ này đã bị xóa => tự động xóa khoản chi tương ứng
    });

    if (patLoans.length === 0) {
      savePlansToStorage();
      renderExpenseStreamsList();
      updateCashflowBalanceUI(plan);
      updateAll();
      if (showToastMsg) {
        alert("Đã tự động dọn dẹp các khoản Chi phí BĐS & Crédit do không còn căn hộ nào trong Quản Lý BĐS.");
      }
      return;
    }

    const curAge = Number(plan.currentAge) || 29;
    const sched = window.RetirementEngine.calculateMortgageSchedule({ source: 'patrimoine', loans: patLoans }, curAge, plan.lifeExpectancy || 85);

    let addedCount = 0;
    patLoans.forEach((loan, idx) => {
      const part = sched?.parts ? sched.parts[idx] : null;
      const row = part ? part.schedule[curAge] : null;
      const monthlyPmt = (loan.monthlyPaymentEur && loan.monthlyPaymentEur > 0)
        ? loan.monthlyPaymentEur
        : (row && row.active ? row.monthlyPayment : Math.round(loan.loanAmount * 0.055 / 12));
      const endAge = (Number(loan.startAge) || curAge) + (Number(loan.loanTermYears) || 20);
      const cleanName = `Chi phí BĐS & Crédit: ${loan.name || 'BĐS'}`;

      const existingIdx = plan.expenses.findIndex(e => e.name === cleanName || (loan.name && e.name.includes(loan.name)));
      const loanOnly = loan.monthlyLoanPaymentEur || loan.monthlyPaymentEur || 0;
      const chargesOnly = loan.monthlyChargesEur || 0;
      const noteText = chargesOnly > 0 ? `Crédit ${loanOnly} € + Phí ${chargesOnly} €` : undefined;

      const expItem = {
        name: cleanName,
        amount: monthlyPmt * 12,
        startAge: Number(loan.startAge) || curAge,
        endAge: endAge,
        growth: 0.0,
        isDebt: true,
        source: 'patrimoine',
        note: noteText,
        enabled: true
      };

      if (existingIdx >= 0) {
        plan.expenses[existingIdx] = expItem;
      } else {
        plan.expenses.push(expItem);
        addedCount++;
      }
    });

    savePlansToStorage();
    renderExpenseStreamsList();
    updateCashflowBalanceUI(plan);
    updateAll();

    if (showToastMsg) {
      alert(`Đã đồng bộ thành công ${patLoans.length} khoản nợ vay BĐS vào danh mục Các Luồng Chi Tiêu!`);
    }
  }

  // -------------------------------------------------------------
  // TAB 3: Tax & Roth Optimization
  // -------------------------------------------------------------
  function renderTaxTab() {
    const plan = getActivePlan();
    const taxRegime = plan.taxRegime || "france_vietnam";
    const isUS = (taxRegime === "us");
    updateTaxRegimeUI(taxRegime);

    const proj = window.RetirementEngine.runProjection(plan);
    const currentAge = Number(plan.currentAge) || 29;
    const grossIncome = getActiveIncomeAtAge(plan, currentAge);

    // 1. Calculate live tax breakdown
    let taxDetailed = {
      grossIncome,
      abattement: 0,
      netTaxable: grossIncome,
      totalTax: 0,
      effectiveRate: 0,
      marginalRate: 0,
      bracketDetails: [],
      pfuComparisonTax: 0,
      taxSavedVsPFU: 0
    };
    const isSingle = (plan?.maritalStatus !== 'married');
    const kidsCount = (plan?.familyPlan && plan.familyPlan.enabled !== false) ? (Number(plan.familyPlan.kidsCount) || 0) : 0;
    const childParts = kidsCount <= 2 ? (kidsCount * 0.5) : (1.0 + (kidsCount - 2) * 1.0);
    const computedParts = (isSingle ? 1.0 : 2.0) + childParts;
    const taxParts = (plan?.taxParts !== undefined && plan?.taxParts !== null && Number(plan.taxParts) > 0) ? Number(plan.taxParts) : computedParts;

    if (window.TaxOptimizer && window.TaxOptimizer.calculateTaxDetailed) {
      taxDetailed = window.TaxOptimizer.calculateTaxDetailed(grossIncome, taxRegime, {
        customTaxRate: plan.taxRate,
        currency: plan.currency || state.currency,
        exchangeRateEurVnd: 27500,
        maritalStatus: plan.maritalStatus || (isSingle ? 'single' : 'married'),
        kidsCount: kidsCount,
        taxParts: taxParts
      });
    }

    // Render Live Breakdown Card Elements
    const valGross = document.getElementById("val-tax-gross");
    const valAbattement = document.getElementById("val-tax-abattement");
    const rowAbattement = document.getElementById("row-tax-abattement");
    const valNetBase = document.getElementById("val-tax-net-base");
    const valTotalTax = document.getElementById("val-tax-total-amount");
    const valEffRate = document.getElementById("val-tax-effective-rate");
    const valMargRate = document.getElementById("val-tax-marginal-rate");
    const rowMargRate = document.getElementById("row-tax-marginal-rate");
    const valSavedPfu = document.getElementById("val-tax-saved-pfu");
    const rowSavedPfu = document.getElementById("row-tax-saving-pfu");
    const bracketsContainer = document.getElementById("container-tax-brackets-list");

    if (valGross) valGross.innerText = window.RetirementEngine.formatCurrency(taxDetailed.grossIncome, state.currency);
    if (rowAbattement) {
      if (taxRegime === 'france_vietnam') {
        rowAbattement.style.display = "flex";
        if (valAbattement) valAbattement.innerText = "-" + window.RetirementEngine.formatCurrency(taxDetailed.abattement, state.currency);
      } else {
        rowAbattement.style.display = "none";
      }
    }
    if (valNetBase) valNetBase.innerText = window.RetirementEngine.formatCurrency(taxDetailed.netTaxable, state.currency);
    if (valTotalTax) valTotalTax.innerText = window.RetirementEngine.formatCurrency(taxDetailed.totalTax, state.currency);
    if (valEffRate) valEffRate.innerText = `${taxDetailed.effectiveRate.toFixed(1)}%`;
    if (rowMargRate) {
      if (taxRegime !== 'international') {
        rowMargRate.style.display = "flex";
        if (valMargRate) valMargRate.innerText = `${taxDetailed.marginalRate}%`;
      } else {
        rowMargRate.style.display = "none";
      }
    }
    if (rowSavedPfu) {
      if (taxRegime === 'france_vietnam') {
        rowSavedPfu.style.display = "flex";
        if (valSavedPfu) valSavedPfu.innerText = window.RetirementEngine.formatCurrency(taxDetailed.taxSavedVsPFU, state.currency);
      } else {
        rowSavedPfu.style.display = "none";
      }
    }

    if (bracketsContainer) {
      if (taxDetailed.bracketDetails && taxDetailed.bracketDetails.length > 0) {
        bracketsContainer.innerHTML = taxDetailed.bracketDetails.map(b => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.2rem 0; border-bottom: 1px dashed var(--border-subtle);">
            <span style="color: var(--text-muted);">${b.rangeLabel} (${b.ratePercent}%):</span>
            <span class="font-mono font-bold" style="color: var(--text-main);">${window.RetirementEngine.formatCurrency(b.taxAmount, state.currency)}</span>
          </div>
        `).join('');
      } else {
        bracketsContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.75rem;">Không phát sinh nghĩa vụ thuế trong năm.</span>`;
      }
    }

    // 2. Render French Accounts Inputs & Waterfall Savings
    setVal("inp-acc-pea", plan.frenchAccounts?.peaBalance ?? 35000);
    setVal("inp-acc-av", plan.frenchAccounts?.assuranceVieBalance ?? 10000);
    setVal("inp-acc-livreta", plan.frenchAccounts?.livretABalance ?? 5000);

    const waterfallBadge = document.getElementById("badge-waterfall-saved");
    if (window.TaxOptimizer && window.TaxOptimizer.simulateWithdrawalWaterfall) {
      const remainingNeed = plan.annualExpenses || 25000;
      const wf = window.TaxOptimizer.simulateWithdrawalWaterfall(remainingNeed, {
        peaBalance: plan.frenchAccounts?.peaBalance ?? 35000,
        assuranceVieBalance: plan.frenchAccounts?.assuranceVieBalance ?? 10000,
        livretABalance: plan.frenchAccounts?.livretABalance ?? 5000
      });
      if (waterfallBadge) {
        waterfallBadge.innerText = `Tiết kiệm: ${window.RetirementEngine.formatCurrency(wf.taxSavedVsPFU, state.currency)} thuế/năm`;
      }
    }

    // 3. Destroy chart if existed
    if (state.charts.tax) {
      state.charts.tax.destroy();
      state.charts.tax = null;
    }
  }

  const Tab3Exports = {
    bindEvents: bindTab3Events,
    initFrancoVietGuideInteractions,
    updateTaxRegimeUI,
    estimateFrenchFullPension,
    getPrimarySalaryIncome,
    syncPensionBaseAuto,
    updatePensionDecoteUI,
    updateBhxhVnUI,
    updateGermanPensionUI,
    updateUsPensionUI,
    updateJapanPensionUI,
    updateCanadaPensionUI,
    updateAustraliaPensionUI,
    updateKoreaPensionUI,
    updateTaiwanPensionUI,
    syncBhxhVnStreams,
    eurToPlanFactor,
    extractPatrimoineLoansEur,
    buildPatrimoineLoans,
    applyPatrimoineToPlan,
    fetchPatrimoineData,
    syncFromPatrimoine,
    updateLmnpUI,
    renderPatrimoineLoansList,
    updateMortgageUI,
    syncMortgageToExpenseStreams,
    renderTaxTab
  };

  window.Tab3TaxesUI = Tab3Exports;
  Object.assign(window, Tab3Exports);

})();
