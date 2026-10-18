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
            renderIncomeStreamsList();
            renderExpenseStreamsList();
            updateCashflowBalanceUI(plan);
            updateAll();
          });
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
    // Masterclass and Waterfall cards are always visible
    const frAccountsCard = document.getElementById("card-french-accounts");
    const peaCard = document.getElementById("card-pea-masterclass");
    const avCard = document.getElementById("card-assurance-vie-masterclass");
    const livretCard = document.getElementById("card-livret-masterclass");
    if (frAccountsCard) frAccountsCard.style.display = "block";
    if (peaCard) peaCard.style.display = "block";
    if (avCard) avCard.style.display = "block";
    if (livretCard) livretCard.style.display = "block";

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

    const incomeVal = Number(p.bhxhVnIncome) || 10000000;
    const yearsVal = Number(p.bhxhVnYears) || 15;
    const startAgeVal = Number(p.bhxhVnStartAge) || Number(p.currentAge) || 29;
    const retireAgeVal = Number(p.bhxhVnRetireAge) || 62;
    const lifeExp = Number(p.lifeExpectancy) || 85;

    const selIncome = document.getElementById("sel-calc-bhxh-income");
    const selYears = document.getElementById("sel-calc-bhxh-years");
    const inpStart = document.getElementById("inp-bhxh-start-age");
    const inpRetire = document.getElementById("inp-bhxh-retire-age");
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

    if (selIncome && selIncome.value !== String(incomeVal)) selIncome.value = String(incomeVal);
    if (selYears && selYears.value !== String(yearsVal)) selYears.value = String(yearsVal);
    if (inpStart && inpStart.value !== String(startAgeVal)) inpStart.value = String(startAgeVal);
    if (inpRetire && inpRetire.value !== String(retireAgeVal)) inpRetire.value = String(retireAgeVal);

    if (bodyEl) {
      bodyEl.style.opacity = isEnabled ? "1" : "0.45";
      bodyEl.style.pointerEvents = isEnabled ? "auto" : "none";
    }

    if (badgeEl) {
      if (isEnabled) {
        badgeEl.innerText = `${yearsVal} năm (Luật 2024)`;
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

    const monthlyPayVnd = Math.round(incomeVal * 0.22);
    const pensionRate = (yearsVal === 15) ? 0.45 : (0.45 + (yearsVal - 15) * 0.02);
    let monthlyPensionVnd = Math.round(incomeVal * pensionRate);
    let annualPensionVnd = monthlyPensionVnd * 12;

    if (window.TaxOptimizer && window.TaxOptimizer.calculateVietnamBhxhPension) {
      if (p?.maritalStatus === 'married' && p?.bhxhVnDetails) {
        const bhxhRes = window.TaxOptimizer.calculateVietnamBhxhPension(p.bhxhVnDetails);
        monthlyPensionVnd = Number(bhxhRes.totalMonthlyPensionVnd ?? bhxhRes.monthlyPensionVnd) || 0;
        annualPensionVnd = Number(bhxhRes.totalAnnualPensionVnd ?? bhxhRes.annualPensionVnd) || (monthlyPensionVnd * 12);
      } else {
        const bhxhRes = window.TaxOptimizer.calculateVietnamBhxhPension(incomeVal, yearsVal, 'male', retireAgeVal);
        monthlyPensionVnd = Number(bhxhRes.monthlyPensionVnd) || 0;
        annualPensionVnd = Number(bhxhRes.annualPensionVnd) || (monthlyPensionVnd * 12);
      }
    }
    monthlyPensionVnd = Number(monthlyPensionVnd) || 0;
    annualPensionVnd = Number(annualPensionVnd) || (monthlyPensionVnd * 12);
    const eurRate = Number(p.exchangeRateEurVnd) || 27500;
    const cur = p.currency || state.currency || 'EUR';

    let payCurStr, pensionCurStr, cardMonthlyStr, cardAnnualStr;
    if (cur === 'VND') {
      payCurStr = `${monthlyPayVnd.toLocaleString('vi-VN')} ₫/tháng`;
      pensionCurStr = `~${monthlyPensionVnd.toLocaleString('vi-VN')} ₫/tháng`;
      cardMonthlyStr = `${monthlyPensionVnd.toLocaleString('vi-VN')} ₫`;
      cardAnnualStr = `≈ ${(annualPensionVnd / 1e6).toFixed(1)} tr ₫/năm`;
    } else {
      const payEur = Math.round(monthlyPayVnd / eurRate);
      const penEur = Math.round(monthlyPensionVnd / eurRate);
      const annualPenEur = penEur * 12;
      if (cur === 'USD') {
        const payUsd = Math.round(payEur * 1.1);
        const penUsd = Math.round(penEur * 1.1);
        payCurStr = `${monthlyPayVnd.toLocaleString('vi-VN')} ₫ (~${payUsd} $/tháng)`;
        pensionCurStr = `~${monthlyPensionVnd.toLocaleString('vi-VN')} ₫ (~${penUsd} $/tháng)`;
        cardMonthlyStr = `$${penUsd.toLocaleString('en-US')}`;
        cardAnnualStr = `≈ $${(penUsd * 12).toLocaleString('en-US')}/năm`;
      } else {
        payCurStr = `${monthlyPayVnd.toLocaleString('vi-VN')} ₫ (~${payEur} €/tháng)`;
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

    const incomeVal = Number(p.bhxhVnIncome) || 10000000;
    const yearsVal = Number(p.bhxhVnYears) || 15;
    const startAge = Math.max(18, Number(p.bhxhVnStartAge) || Number(p.currentAge) || 29);
    const endExpenseAge = startAge + yearsVal - 1;
    const retireAgeVn = Math.max(startAge + yearsVal, Number(p.bhxhVnRetireAge) || 62);
    const lifeExp = Number(p.lifeExpectancy) || 85;

    const monthlyPayVnd = Math.round(incomeVal * 0.22);
    const annualPayVnd = monthlyPayVnd * 12;
    const pensionRate = (yearsVal === 15) ? 0.45 : (0.45 + (yearsVal - 15) * 0.02);
    const monthlyPensionVnd = Math.round(incomeVal * pensionRate);
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
      note: `22% mức ${incomeVal.toLocaleString('vi-VN')} ₫/tháng (${yearsVal} năm)`
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

    // Turo fleet income
    const turoAnnual = Number(data.turo?.annual_net_cash_flow) || 0;
    const turoIdx = p.incomes.findIndex(inc => (inc.name || '').includes('Turo') || (inc.name || '').includes('Cho thuê xe'));
    if (turoAnnual > 0) {
      const cashflow = round(turoAnnual);
      if (turoIdx >= 0) {
        // Update cashflow amount while strictly preserving user-configured startAge, endAge and growth
        p.incomes[turoIdx].amount = cashflow;
        if (p.incomes[turoIdx].startAge === undefined || p.incomes[turoIdx].startAge === null) p.incomes[turoIdx].startAge = curAge;
        if (p.incomes[turoIdx].endAge === undefined || p.incomes[turoIdx].endAge === null) p.incomes[turoIdx].endAge = Math.min(curAge + 10, retireAge);
        if (p.incomes[turoIdx].growth === undefined || p.incomes[turoIdx].growth === null) p.incomes[turoIdx].growth = 0.0;
        p.incomes[turoIdx].taxable = false;
      } else {
        p.incomes.push({ name: 'Đội xe Cho thuê Turo', amount: cashflow, startAge: curAge, endAge: Math.min(curAge + 10, retireAge), growth: 0.0, taxable: false });
      }
    } else if (turoIdx >= 0) {
      p.incomes.splice(turoIdx, 1);
    }

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
    let apts = (pData && Array.isArray(pData.apartments)) ? pData.apartments : [];
    if (apts.length === 0 && window.PatrimoineApp && typeof window.PatrimoineApp.computeFullPatrimoine === "function") {
      try {
        const guest = JSON.parse(localStorage.getItem("pyretrait_patrimoine_guest") || "{}");
        if (guest && guest.apartments) {
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
    const annualRent = lmnpStream ? Number(lmnpStream.amount) : Math.round(totalAnnualRentEur * f);
    const monthlyRent = Math.round(annualRent / 12);

    const lblMonthly = document.getElementById("lbl-lmnp-card-monthly");
    const lblAnnual = document.getElementById("lbl-lmnp-card-annual");
    const lblAgeRange = document.getElementById("lbl-lmnp-card-age-range");
    const lblGrowth = document.getElementById("lbl-lmnp-card-growth");

    if (lblMonthly) {
      if (isEnabled) {
        lblMonthly.innerHTML = `${fmt(monthlyRent)}<small>/tháng</small>`;
      } else {
        lblMonthly.innerHTML = `<span style="color: var(--text-faint);">0<small>/tháng</small></span>`;
      }
    }
    if (lblAnnual) {
      lblAnnual.innerText = isEnabled ? `≈ ${fmt(annualRent)}/năm` : "Đã tạm tắt nguồn thu BĐS";
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
