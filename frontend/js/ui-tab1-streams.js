/**
 * pyRetrait — Tầng 3: Giao Diện Tab 1B — Luồng Thu Chi, Phân Bổ Tài Sản & 4 Chiến Lược Rút Tiền (ui-tab1-streams.js)
 * Quản lý toàn bộ form tham số và các thẻ dòng tiền trên Tab 1 (#tab-projections):
 * Các luồng Thu nhập & Chi tiêu theo giai đoạn tuổi, Cân đối dòng tiền & Tỷ lệ tiết kiệm,
 * Phân bổ danh mục đầu tư, Lạm phát 2 chặng (PPP Pháp - Việt) và 4 Chiến lược rút tiền SWR.
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

  function getRetirementPppRatios(plan) {
    if (!plan && typeof getActivePlan === 'function') plan = getActivePlan();
    const pppProfiles = (window.TaxOptimizer && window.TaxOptimizer.COUNTRY_PPP_PROFILES) ? window.TaxOptimizer.COUNTRY_PPP_PROFILES : {};
    const workKey = plan?.workCity || 'fr_paris';
    const isDomestic = (plan?.retireMode === 'domestic' || (plan?.workCountry && plan?.retireCountry && plan.workCountry === plan.retireCountry) || (plan?.workCity && plan?.retireCity && plan.workCity === plan.retireCity));
    const retireKey = plan?.retireCity || (isDomestic ? workKey : 'vn_hcm_hn');
    const workProfile = pppProfiles[workKey] || { label: 'Nơi làm việc', countryLabel: 'Pháp', flag: '🇫🇷', ppp: 1.0 };
    const retireProfile = pppProfiles[retireKey] || { label: 'Nơi nghỉ hưu', countryLabel: 'Việt Nam', flag: '🇻🇳', ppp: 0.45 };

    const pppWork = Number(workProfile.ppp) || 1.0;
    const pppRetire = Number(retireProfile.ppp) || 0.45;

    const retireRatio = isDomestic ? 1.0 : (pppRetire / pppWork);
    const hybridRatio = isDomestic ? 1.0 : ((0.5 * pppWork + 0.5 * pppRetire) / pppWork);

    const discountRetire = Math.max(0, Math.round((1 - retireRatio) * 100));
    const discountHybrid = Math.max(0, Math.round((1 - hybridRatio) * 100));

    return {
      isDomestic,
      workProfile,
      retireProfile,
      pppWork,
      pppRetire,
      retireRatio,
      hybridRatio,
      discountRetire,
      discountHybrid,
      factors: {
        'france': 1.0,
        'vietnam': retireRatio,
        'hybrid': hybridRatio
      }
    };
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

  /**
   * Định dạng nhãn Giới tính & Tuổi (VD: "Nam (32 tuổi)", "Nữ (29 tuổi)")
   */
  function formatGenderAgeText(gender, age) {
    const isFemale = (gender === 'female');
    const t = (k, fb) => (window.I18n ? window.I18n.t(k, fb) : fb);
    const gLabel = isFemale ? t('gender_female', 'Nữ') : t('gender_male', 'Nam');
    const ageUnit = t('unit_age', 'tuổi');
    return `${gLabel} (${age} ${ageUnit})`;
  }

  // -------------------------------------------------------------
  // Sự kiện tương tác của các Tham số, Luồng Thu/Chi & Chiến lược trên Tab 1
  // -------------------------------------------------------------
  function bindTab1StreamEvents() {
    // Live Parameter Bindings
    bindInput("inp-retire-age", "retirementAge", Number);
    bindInput("inp-life-expectancy", "lifeExpectancy", Number);
    bindInput("inp-inflation", "inflationRate", val => {
      const n = Number(val) || 0;
      const plan = getActivePlan();
      plan.inflationRate = n;
      if (plan.dualInflation) {
        plan.dualInflation.inflationPre = n;
        plan.dualInflation.inflationPost = n;
      }
      updateDualInflationUI(plan);
      return n;
    });
    bindInput("inp-current-savings", "currentSavings", val => {
      let n = 0;
      if (typeof val === 'number') n = isNaN(val) ? 0 : val;
      else {
        const s = String(val).replace(/,/g, '').trim();
        n = parseFloat(s);
        if (isNaN(n)) n = 0;
      }
      const plan = getActivePlan();
      plan.currentSavings = n;
      updateAssetAllocationUI(plan, false);
      return n;
    });
    bindInput("inp-savings-rate", "savingsRate", Number);

    // Bidirectional sync: Năm sinh <-> Tuổi hiện tại
    const inpBirthYear = document.getElementById("inp-birth-year");
    const inpCurrentAge = document.getElementById("inp-current-age");
    const currentCalYear = new Date().getFullYear();

    if (inpBirthYear) {
      ['input', 'change', 'keyup'].forEach(evt => {
        inpBirthYear.addEventListener(evt, (e) => {
          const bYear = Number(e.target.value);
          if (bYear >= 1930 && bYear <= currentCalYear) {
            const plan = getActivePlan();
            plan.birthYear = bYear;
            const calculatedAge = currentCalYear - bYear;
            plan.currentAge = calculatedAge;
            if (Array.isArray(plan.milestones)) {
              plan.milestones.forEach(m => {
                if (m.source === 'patrimoine' && m.startYear) {
                  m.age = m.startYear - bYear;
                }
              });
            }
            if (inpCurrentAge) inpCurrentAge.value = calculatedAge;
            const lblCurrentAge = document.getElementById("lbl-current-age");
            if (lblCurrentAge) lblCurrentAge.innerText = formatGenderAgeText(plan.gender || 'male', calculatedAge);
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
            if (Array.isArray(plan.milestones)) {
              plan.milestones.forEach(m => {
                if (m.source === 'patrimoine' && m.startYear) {
                  m.age = m.startYear - calculatedBirthYear;
                }
              });
            }
            if (inpBirthYear) inpBirthYear.value = calculatedBirthYear;
            syncSavingsAndExpensesFromRate(plan);
            savePlansToStorage();
            updateAll();
          }
        });
      });
    }

    // Bidirectional sync: Năm sinh Bạn đời <-> Tuổi Bạn đời
    const inpSpouseBirthYear = document.getElementById("inp-spouse-birth-year");
    const inpSpouseCurrentAge = document.getElementById("inp-spouse-current-age");

    if (inpSpouseBirthYear) {
      ['input', 'change', 'keyup'].forEach(evt => {
        inpSpouseBirthYear.addEventListener(evt, (e) => {
          const bYear = Number(e.target.value);
          if (bYear >= 1930 && bYear <= currentCalYear) {
            const plan = getActivePlan();
            plan.spouseBirthYear = bYear;
            const calculatedAge = currentCalYear - bYear;
            plan.spouseAge = calculatedAge;
            if (inpSpouseCurrentAge) inpSpouseCurrentAge.value = calculatedAge;
            const lblSpouseAge = document.getElementById("lbl-spouse-age");
            if (lblSpouseAge) {
              const spouseGender = (plan.gender === 'female' ? 'male' : 'female');
              lblSpouseAge.innerText = formatGenderAgeText(spouseGender, calculatedAge);
            }
            savePlansToStorage();
            updateAll();
          }
        });
      });
    }

    if (inpSpouseCurrentAge) {
      ['input', 'change'].forEach(evt => {
        inpSpouseCurrentAge.addEventListener(evt, (e) => {
          const age = Number(e.target.value);
          if (age >= 10 && age <= 100) {
            const plan = getActivePlan();
            plan.spouseAge = age;
            const calculatedBirthYear = currentCalYear - age;
            plan.spouseBirthYear = calculatedBirthYear;
            if (inpSpouseBirthYear) inpSpouseBirthYear.value = calculatedBirthYear;
            const lblSpouseAge = document.getElementById("lbl-spouse-age");
            if (lblSpouseAge) {
              const spouseGender = (plan.gender === 'female' ? 'male' : 'female');
              lblSpouseAge.innerText = formatGenderAgeText(spouseGender, age);
            }
            savePlansToStorage();
            updateAll();
          }
        });
      });
    }

    // Toggle nhanh giới tính khi nhấp vào badge tuổi / giới tính
    const togglePlanGender = () => {
      const plan = getActivePlan();
      if (!plan) return;
      plan.gender = (plan.gender === 'female') ? 'male' : 'female';
      if (plan.bhxhVnDetails) {
        if (plan.bhxhVnDetails.spouse1) plan.bhxhVnDetails.spouse1.gender = plan.gender;
        if (plan.bhxhVnDetails.spouse2) plan.bhxhVnDetails.spouse2.gender = (plan.gender === 'female' ? 'male' : 'female');
      }
      savePlansToStorage();
      updateAll();
    };

    const badgeCurrentAge = document.getElementById("hint-current-age-badge");
    if (badgeCurrentAge) {
      badgeCurrentAge.addEventListener("click", togglePlanGender);
    }

    const badgeSpouseAge = document.getElementById("hint-spouse-age-badge");
    if (badgeSpouseAge) {
      badgeSpouseAge.addEventListener("click", togglePlanGender);
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
      hintOptimalAge.title = "Tuổi gợi ý đáp ứng tất cả 3 trụ cột tự do tài chính: Vốn trước khi về hưu (25–30x), Chịu được biến động thị trường ≥ 80% & Chịu được biến cố bệnh tật, khủng hoảng. Nhấp để áp dụng.";
      hintOptimalAge.addEventListener("click", () => {
        const plan = getActivePlan();
        const proj = window.RetirementEngine.runProjection(plan);
        const optAge = proj.optimalFireAge;
        const inp = document.getElementById("inp-retire-age");
        if (optAge) {
          plan.retirementAge = optAge;
          syncSalaryStreamsWithRetireAge(plan);
          if (inp) {
            inp.value = optAge;
            inp.classList.add("input-highlight-pulse");
            inp.style.transition = "box-shadow 0.3s ease, border-color 0.3s ease";
            inp.style.borderColor = "#10b981";
            inp.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.25)";
            setTimeout(() => {
              inp.style.borderColor = "";
              inp.style.boxShadow = "";
            }, 1200);
          }
          renderIncomeStreamsList();
          savePlansToStorage();
          updateAll();
          if (window.GeminiAdvisor) {
            window.GeminiAdvisor.updateChartBox("chart-projections", "Kế hoạch Tài chính & Dòng tiền Hưu trí", {}, false);
          }
        } else if (inp) {
          inp.style.transition = "box-shadow 0.3s ease, border-color 0.3s ease";
          inp.style.borderColor = "#f59e0b";
          inp.style.boxShadow = "0 0 0 3px rgba(245, 158, 11, 0.25)";
          setTimeout(() => {
            inp.style.borderColor = "";
            inp.style.boxShadow = "";
          }, 1200);
        }
      });
    }

    // Toggle Checkbox cho Thẻ Chi tiêu/tháng khi về hưu
    const chkRetireExp = document.getElementById("chk-enable-retire-expense");
    if (chkRetireExp) {
      chkRetireExp.addEventListener("change", (e) => {
        const plan = getActivePlan();
        plan.enableRetirementExpense = e.target.checked;
        savePlansToStorage();
        updateRetirementLocationUI(plan);
        updateAll();
      });
    }

    const summaryOptimalAge = document.getElementById("summary-optimal-age");
    if (summaryOptimalAge) {
      summaryOptimalAge.style.cursor = "pointer";
      summaryOptimalAge.title = "Tuổi gợi ý đáp ứng tất cả 3 trụ cột tự do tài chính: Vốn trước khi về hưu (25–30x), Chịu được biến động thị trường ≥ 80% & Chịu được biến cố bệnh tật, khủng hoảng. Nhấp để áp dụng vào kế hoạch.";
      summaryOptimalAge.addEventListener("click", () => {
        if (hintOptimalAge) hintOptimalAge.click();
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
          const rawVal = inpRetireMonthly.value;
          if (rawVal === "" || rawVal === undefined) return;
          const baseMonthly = Number(rawVal);
          if (isNaN(baseMonthly) || baseMonthly < 0) return;
          p.baseRetireMonthly = baseMonthly;
          const isDomestic = (p.retireMode === 'domestic' || (p.workCountry && p.retireCountry && p.workCountry === p.retireCountry));
          const loc = p.retirementLocation || 'vietnam';
          const pppFactors = { 'france': 1.0, 'hybrid': 0.70, 'vietnam': 0.45 };
          const factor = isDomestic ? 1.0 : (pppFactors[loc] || 1.0);
          p.retirementExpenses = Math.round(baseMonthly * 12 * factor);
          updateRetirementLocationRadiosUI(p);
          updateExpenseSavingsHints(p);
          savePlansToStorage();
          updateAll();
        });
      });
    }

    // Radio Buttons: Lựa chọn địa điểm hưu trí & quy đổi trực tiếp theo PPP
    document.querySelectorAll("input[name='rad-retire-location']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        const p = getActivePlan();
        const newLoc = e.target.value;
        p.retirementLocation = newLoc;

        const selLocation = document.getElementById("sel-retirement-location");
        if (selLocation) selLocation.value = newLoc;

        const ratios = getRetirementPppRatios(p);
        const factor = ratios.factors[newLoc] || 1.0;

        const inp = document.getElementById("inp-monthly-retire-expenses");
        let baseMonthly = Number(p.baseRetireMonthly);
        if ((!baseMonthly || isNaN(baseMonthly) || baseMonthly <= 0) && inp && Number(inp.value) > 0) {
          baseMonthly = Number(inp.value);
        }
        if (!baseMonthly || isNaN(baseMonthly) || baseMonthly <= 0) {
          const ann = Number(p.retirementExpenses);
          baseMonthly = ann > 0 ? Math.round((ann / factor) / 12) : 1000;
        }
        p.baseRetireMonthly = baseMonthly;
        p.retirementExpenses = Math.round(baseMonthly * 12 * factor);
        if (inp) inp.value = baseMonthly;

        updateRetirementLocationUI(newLoc, p);
        updateRetirementLocationRadiosUI(p);
        updateExpenseSavingsHints(p);
        savePlansToStorage();
        updateAll();
      });
    });

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
    const inpRetPre = document.getElementById("inp-return-pre");
    if (inpRetPre) {
      ['input', 'change'].forEach(evt => {
        inpRetPre.addEventListener(evt, () => {
          const val = Number(inpRetPre.value) || 0;
          const plan = getActivePlan();
          plan.investmentReturnPre = val;
          plan.investmentReturnPost = val;
          setVal("inp-return-post", val);
          savePlansToStorage();
          updateAll();
        });
      });
    }
    bindInput("inp-target-legacy", "targetLegacy", Number);
    bindInput("inp-effective-tax", "taxRate", Number);
    bindInput("inp-tax-regime", "taxRegime", String);
    document.getElementById("inp-tax-regime")?.addEventListener("change", (e) => {
      updateTaxRegimeUI(e.target.value);
    });
    bindInput("inp-acc-pea", "frenchAccounts.peaBalance", Number);
    bindInput("inp-acc-av", "frenchAccounts.assuranceVieBalance", Number);
    bindInput("inp-acc-livreta", "frenchAccounts.livretABalance", Number);
    bindInput("inp-card-gogo-age", "spendingPhases.gogoAge", Number);
    bindInput("inp-card-gogo-factor", "spendingPhases.gogoFactor", Number);
    bindInput("inp-card-slowgo-age", "spendingPhases.slowgoAge", Number);
    bindInput("inp-card-slowgo-factor", "spendingPhases.slowgoFactor", Number);
    bindInput("inp-card-nogo-factor", "spendingPhases.nogoFactor", Number);

    document.getElementById("chk-card-smile-enabled")?.addEventListener("change", (e) => {
      const p = getActivePlan();
      if (!p.spendingPhases) p.spendingPhases = {};
      p.spendingPhases.enabled = e.target.checked;
      const cont = document.getElementById("container-card-smile-phases");
      if (cont) cont.style.display = e.target.checked ? "grid" : "none";
      savePlansToStorage();
      updateAll();
    });

    // Withdrawal Strategy Radio Buttons
    document.querySelectorAll("input[name='withdrawal-strategy']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        const newStrat = e.target.value;
        const p = getActivePlan();
        p.withdrawalStrategy = newStrat;
        savePlansToStorage();
        updateAll();
        renderWithdrawalComparison();
      });
    });

    // Initial SWR Range Slider
    const swrSlider = document.getElementById("inp-initial-swr");
    if (swrSlider) {
      swrSlider.addEventListener("input", (e) => {
        document.getElementById("val-initial-swr").innerText = e.target.value;
        const p = getActivePlan();
        p.initialWithdrawalRate = Number(e.target.value);
        savePlansToStorage();
        updateAll();
        renderWithdrawalComparison();
      });
    }


    // Expandable Panel Toggles
    ['panel-mortgage'].forEach(id => {
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
        const newLoc = e.target.value;
        plan.retirementLocation = newLoc;

        // Đồng bộ với radio buttons
        const rad = document.querySelector(`input[name='rad-retire-location'][value='${newLoc}']`);
        if (rad) rad.checked = true;

        const ratios = getRetirementPppRatios(plan);
        const factor = ratios.factors[newLoc] || 1.0;

        const inpRetireMonthly = document.getElementById("inp-monthly-retire-expenses");
        let baseMonthly = Number(plan.baseRetireMonthly);
        if ((!baseMonthly || isNaN(baseMonthly) || baseMonthly <= 0) && inpRetireMonthly && Number(inpRetireMonthly.value) > 0) {
          baseMonthly = Number(inpRetireMonthly.value);
        }
        if (!baseMonthly || isNaN(baseMonthly) || baseMonthly <= 0) {
          const ann = Number(plan.retirementExpenses);
          baseMonthly = ann > 0 ? Math.round((ann / factor) / 12) : 1000;
        }
        plan.baseRetireMonthly = baseMonthly;
        plan.retirementExpenses = Math.round(baseMonthly * 12 * factor);
        if (inpRetireMonthly) inpRetireMonthly.value = baseMonthly;

        updateRetirementLocationUI(newLoc, plan);
        updateRetirementLocationRadiosUI(plan);
        updateExpenseSavingsHints(plan);
        savePlansToStorage();
        updateAll();
      });
    }


    // Dynamic Investment Allocation Actions
    const btnAddInv = document.getElementById("btn-add-investment");
    if (btnAddInv) {
      btnAddInv.addEventListener("click", (e) => {
        e.preventDefault();
        handleInvestmentAdd();
      });
    }

    const btnResetInv = document.getElementById("btn-reset-investments");
    if (btnResetInv) {
      btnResetInv.addEventListener("click", (e) => {
        e.preventDefault();
        handleInvestmentReset();
      });
    }

    // Toggle / Edit Asset Allocation Stream Card
    const btnEditAlloc = document.getElementById("btn-edit-asset-allocation");
    if (btnEditAlloc) {
      btnEditAlloc.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const body = document.getElementById("allocation-inputs-body");
        if (body) {
          if (body.style.display === "none") {
            body.style.display = "block";
            btnEditAlloc.innerText = "Sửa";
          } else {
            body.style.display = "none";
            btnEditAlloc.innerText = "Mở rộng";
          }
        }
      });
    }

    const btnDelAlloc = document.getElementById("btn-del-asset-allocation");
    if (btnDelAlloc) {
      btnDelAlloc.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleInvestmentReset();
      });
    }

    const chkEnableAlloc = document.getElementById("chk-enable-asset-allocation");
    if (chkEnableAlloc) {
      chkEnableAlloc.addEventListener("change", () => {
        const plan = getActivePlan();
        plan.enableAssetAllocation = chkEnableAlloc.checked;
        savePlansToStorage();
        updateAssetAllocationUI(plan);
        updateAll();
      });
    }

    // Dual Inflation & Forex Inputs
    const chkDual = document.getElementById('chk-dual-inflation-enabled');
    if (chkDual) {
      chkDual.addEventListener('change', () => {
        const plan = getActivePlan();
        if (!plan.dualInflation) plan.dualInflation = {};
        plan.dualInflation.enabled = chkDual.checked;
        savePlansToStorage();
        updateDualInflationUI(plan);
        updateAll();
      });
    }

    const btnEditDual = document.getElementById("btn-edit-dual-inflation");
    if (btnEditDual) {
      btnEditDual.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const body = document.getElementById("dual-inflation-inputs-body");
        if (body) {
          if (body.style.display === "none") {
            body.style.display = "block";
            btnEditDual.innerText = "Sửa";
          } else {
            body.style.display = "none";
            btnEditDual.innerText = "Mở rộng";
          }
        }
      });
    }

    const chkWithdrawal = document.getElementById("chk-enable-withdrawal-strategy");
    if (chkWithdrawal) {
      chkWithdrawal.addEventListener("change", () => {
        const plan = getActivePlan();
        plan.enableWithdrawalStrategy = chkWithdrawal.checked;
        savePlansToStorage();
        updateWithdrawalStrategyCards(plan);
        updateAll();
        renderWithdrawalComparison();
      });
    }

    const chkSmartCap = document.getElementById("chk-smart-withdrawal-cap");
    if (chkSmartCap) {
      chkSmartCap.addEventListener("change", () => {
        const plan = getActivePlan();
        plan.smartWithdrawalCap = chkSmartCap.checked;
        savePlansToStorage();
        updateWithdrawalStrategyCards(plan);
        updateAll();
        renderWithdrawalComparison();
      });
    }

    const btnEditStrat = document.getElementById("btn-edit-withdrawal-strategy");
    if (btnEditStrat) {
      btnEditStrat.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const body = document.getElementById("strategy-inputs-body");
        if (body) {
          if (body.style.display === "none") {
            body.style.display = "block";
            btnEditStrat.innerText = "Sửa";
          } else {
            body.style.display = "none";
            btnEditStrat.innerText = "Mở rộng";
          }
        }
      });
    }

    const btnToggleMatrix = document.getElementById("btn-toggle-strat-matrix");
    if (btnToggleMatrix) {
      btnToggleMatrix.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const container = document.getElementById("container-strat-matrix");
        if (container) {
          const isHidden = container.style.display === "none";
          container.style.display = isHidden ? "block" : "none";
          btnToggleMatrix.innerText = isHidden
            ? "📊 Ẩn Bảng So Sánh 4 Chiến Lược ▲"
            : "📊 Bảng So Sánh 4 Chiến Lược (Điểm mạnh / Nhược điểm / Phù hợp) ▾";
        }
      });
    }

    const btnDelDual = document.getElementById("btn-del-dual-inflation");
    if (btnDelDual) {
      btnDelDual.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const plan = getActivePlan();
        const isEnabled = plan.dualInflation?.enabled !== false;
        const isDomestic = (plan.retireMode === 'domestic' || (plan.workCountry && plan.retireCountry && plan.workCountry === plan.retireCountry) || (plan.workCity && plan.retireCity && plan.workCity === plan.retireCity));
        if (isEnabled) {
          showConfirmDialog({
            icon: "",
            title: isDomestic ? "Xác nhận tắt Lạm phát chi tiêu" : "Xác nhận tắt Mô hình Lạm phát 2 Chặng",
            message: isDomestic
              ? `Bạn có chắc chắn muốn tắt <strong>Lạm phát chi tiêu</strong>?<br><span style="font-size:0.75rem; color:var(--text-faint); margin-top:6px; display:inline-block;">Hệ thống sẽ giữ nguyên chi phí sinh hoạt danh nghĩa (lạm phát 0%/năm).</span>`
              : `Bạn có chắc chắn muốn tắt <strong>Lạm phát 2 Chặng & Trượt giá EUR/VND</strong>?<br><span style="font-size:0.75rem; color:var(--text-faint); margin-top:6px; display:inline-block;">Hệ thống sẽ áp dụng tỷ lệ lạm phát đơn đồng nhất cho toàn bộ chu kỳ cuộc đời.</span>`,
            confirmText: "Tắt mô hình",
            onConfirm: () => {
              if (!plan.dualInflation) plan.dualInflation = {};
              plan.dualInflation.enabled = false;
              const chk = document.getElementById("chk-dual-inflation-enabled");
              if (chk) chk.checked = false;
              savePlansToStorage();
              updateDualInflationUI(plan);
              updateAll();
            }
          });
        } else {
          if (!plan.dualInflation) plan.dualInflation = {};
          plan.dualInflation.enabled = true;
          const chk = document.getElementById("chk-dual-inflation-enabled");
          if (chk) chk.checked = true;
          savePlansToStorage();
          updateDualInflationUI(plan);
          updateAll();
        }
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

    // Đặt thẻ Danh mục đầu tư lên trên thẻ Doanh thu BDS
    ensureAssetAllocationCardPosition();
    // Đặt thẻ Lạm phát nằm ngay dưới thẻ Chi tiêu hưu trí
    ensureDualInflationCardPosition();
  }

  /**
   * Đảm bảo vị trí thẻ Danh mục đầu tư (#card-asset-allocation-stream) luôn nằm ngay trên thẻ Doanh thu BDS (#card-lmnp-income-stream)
   */
  function ensureAssetAllocationCardPosition() {
    const cardAlloc = document.getElementById("card-asset-allocation-stream");
    const cardLmnp = document.getElementById("card-lmnp-income-stream");
    if (cardAlloc && cardLmnp && cardAlloc.nextElementSibling !== cardLmnp && cardLmnp.parentNode) {
      cardLmnp.parentNode.insertBefore(cardAlloc, cardLmnp);
    }
  }

  /**
   * Đảm bảo vị trí thẻ Lạm phát (#card-dual-inflation-stream) luôn nằm ngay dưới thẻ Chi tiêu/tháng khi về hưu (#card-retire-expense-stream)
   */
  function ensureDualInflationCardPosition() {
    const cardRetire = document.getElementById("card-retire-expense-stream");
    const cardDualInf = document.getElementById("card-dual-inflation-stream");
    if (cardRetire && cardDualInf && cardRetire.nextElementSibling !== cardDualInf && cardRetire.parentNode) {
      cardRetire.parentNode.insertBefore(cardDualInf, cardRetire.nextSibling);
    }
  }

  const ALLOC_SEGMENT_COLORS = [
    '#10b981', '#0284c7', '#d97706', '#7c3aed', '#e11d48', '#0d9488', '#4f46e5', '#ea580c', '#06b6d4', '#84cc16'
  ];

  function ensurePlanInvestments(p) {
    if (!p) return [];
    if (!Array.isArray(p.investments) || p.investments.length === 0) {
      if (p.assetAllocation) {
        const s = p.assetAllocation.stocks !== undefined ? Number(p.assetAllocation.stocks) : 60;
        const b = p.assetAllocation.bonds !== undefined ? Number(p.assetAllocation.bonds) : 20;
        const c = p.assetAllocation.cash !== undefined ? Number(p.assetAllocation.cash) : 0;
        const rs = p.assetReturns?.stocks !== undefined ? Number(p.assetReturns.stocks) : 9.5;
        const rb = p.assetReturns?.bonds !== undefined ? Number(p.assetReturns.bonds) : 3.5;
        const rc = p.assetReturns?.cash !== undefined ? Number(p.assetReturns.cash) : 1.5;
        p.investments = [
          { id: 'inv_stocks', name: window.I18n.t('lbl_alloc_stocks', 'Cổ phiếu & Quỹ ETF'), ratio: s, annualReturn: rs },
          { id: 'inv_bonds', name: window.I18n.t('lbl_alloc_bonds', 'Trái phiếu & Tiết kiệm'), ratio: b, annualReturn: rb },
          { id: 'inv_cash', name: window.I18n.t('lbl_alloc_cash', 'Tiền mặt & Thanh khoản'), ratio: c, annualReturn: rc }
        ];
      } else {
        p.investments = [
          { id: 'inv_stocks', name: window.I18n.t('lbl_alloc_stocks', 'Cổ phiếu & Quỹ ETF'), ratio: 60, annualReturn: 9.5 },
          { id: 'inv_bonds', name: window.I18n.t('lbl_alloc_bonds', 'Trái phiếu & Tiết kiệm'), ratio: 20, annualReturn: 3.5 },
          { id: 'inv_cash', name: window.I18n.t('lbl_alloc_cash', 'Tiền mặt & Thanh khoản'), ratio: 0, annualReturn: 1.5 }
        ];
      }
    }
    return p.investments;
  }

  function handleInvestmentRatioChange(itemId, requestedVal, source = 'slider') {
    const plan = getActivePlan();
    if (!plan || !Array.isArray(plan.investments)) return;
    const item = plan.investments.find(x => x.id === itemId);
    if (!item) return;

    // Tính tổng % của tất cả các khoản khác
    const otherSum = plan.investments
      .filter(x => x.id !== itemId)
      .reduce((sum, x) => sum + (Math.max(0, Number(x.ratio) || 0)), 0);

    const maxAllowed = Math.max(0, 100 - otherSum);
    let parsed = parseFloat(requestedVal);
    if (isNaN(parsed) || parsed < 0) parsed = 0;

    let wasClamped = false;
    if (parsed > maxAllowed) {
      parsed = maxAllowed;
      wasClamped = true;
    }
    parsed = Math.min(100, Math.max(0, Math.round(parsed)));
    item.ratio = parsed;

    // Đồng bộ DOM cục bộ của khoản đó mà không re-render toàn bộ danh sách để giữ focus
    const rowEl = document.querySelector(`.investment-row-card[data-id="${itemId}"]`);
    if (rowEl) {
      const inputRatio = rowEl.querySelector('.inv-ratio-input');
      if (inputRatio && Number(inputRatio.value) !== parsed) inputRatio.value = parsed;
    }

    updateAssetAllocationUI(plan, false, true, wasClamped);
    debouncedSavePlansToStorage();
    updateAll();
  }

  function handleInvestmentReturnChange(itemId, requestedReturn) {
    const plan = getActivePlan();
    if (!plan || !Array.isArray(plan.investments)) return;
    const item = plan.investments.find(x => x.id === itemId);
    if (!item) return;

    let parsed = parseFloat(requestedReturn);
    if (isNaN(parsed) || parsed < 0) parsed = 0;
    parsed = Math.min(100, Math.max(0, Math.round(parsed * 10) / 10));
    item.annualReturn = parsed;

    const rowEl = document.querySelector(`.investment-row-card[data-id="${itemId}"]`);
    if (rowEl) {
      const inputReturn = rowEl.querySelector('.inv-return-input');
      if (inputReturn && Number(inputReturn.value) !== parsed) inputReturn.value = parsed;
    }

    updateAssetAllocationUI(plan, false, true);
    debouncedSavePlansToStorage();
    updateAll();
  }

  function handleInvestmentNameChange(itemId, requestedName) {
    const plan = getActivePlan();
    if (!plan || !Array.isArray(plan.investments)) return;
    const item = plan.investments.find(x => x.id === itemId);
    if (!item) return;

    item.name = requestedName.trim() || window.I18n.t('lbl_new_investment_default', 'Khoản đầu tư');
    updateAssetAllocationUI(plan, false, true);
    debouncedSavePlansToStorage();
  }

  function handleInvestmentAdd() {
    const plan = getActivePlan();
    if (!plan) return;
    if (!Array.isArray(plan.investments)) plan.investments = [];

    const newId = 'inv_' + Date.now();
    const count = plan.investments.length + 1;
    const newName = `${window.I18n.t('lbl_new_investment_default', 'Khoản đầu tư')} #${count}`;
    const newRatio = 0;
    const newReturn = 7.0;

    plan.investments.push({
      id: newId,
      name: newName,
      ratio: newRatio,
      annualReturn: newReturn
    });

    savePlansToStorage();
    renderInvestmentsList(plan);
    updateAssetAllocationUI(plan, false, true);
    updateAll();

    setTimeout(() => {
      const newRow = document.querySelector(`.investment-row-card[data-id="${newId}"]`);
      if (newRow) {
        const nameInput = newRow.querySelector('.inv-name-input');
        if (nameInput) {
          nameInput.focus();
          nameInput.select();
        }
      }
    }, 60);
  }

  function handleInvestmentDelete(itemId) {
    const plan = getActivePlan();
    if (!plan || !Array.isArray(plan.investments)) return;
    const idx = plan.investments.findIndex(x => x.id === itemId);
    if (idx === -1) return;

    if (plan.investments.length <= 1) {
      plan.investments[0].ratio = 0;
    } else {
      plan.investments.splice(idx, 1);
    }

    savePlansToStorage();
    renderInvestmentsList(plan);
    updateAssetAllocationUI(plan, false, true);
    updateAll();
  }

  function handleInvestmentReset() {
    const plan = getActivePlan();
    if (!plan) return;
    showConfirmDialog({
      icon: "💼",
      title: window.I18n.t('title_reset_investments', 'Đặt lại Danh mục đầu tư'),
      message: window.I18n.t('msg_confirm_reset_alloc', 'Bạn có muốn đặt lại danh mục đầu tư về chuẩn mặc định 3 lớp tài sản: Cổ phiếu & Quỹ ETF (60%), Trái phiếu & Tiết kiệm (20%), Tiền mặt (0%)?'),
      confirmText: window.I18n.t('btn_reset_investments', 'Khôi phục mặc định'),
      onConfirm: () => {
        plan.investments = [
          { id: 'inv_stocks', name: window.I18n.t('lbl_alloc_stocks', 'Cổ phiếu & Quỹ ETF'), ratio: 60, annualReturn: 9.5 },
          { id: 'inv_bonds', name: window.I18n.t('lbl_alloc_bonds', 'Trái phiếu & Tiết kiệm'), ratio: 20, annualReturn: 3.5 },
          { id: 'inv_cash', name: window.I18n.t('lbl_alloc_cash', 'Tiền mặt & Thanh khoản'), ratio: 0, annualReturn: 1.5 }
        ];
        plan.assetAllocation = { stocks: 60, bonds: 20, realEstate: 0, cash: 0 };
        savePlansToStorage();
        renderInvestmentsList(plan);
        updateAssetAllocationUI(plan, false, true);
        updateAll();
      }
    });
  }

  function renderInvestmentsList(p) {
    if (!p) p = getActivePlan();
    const container = document.getElementById("investments-list-container");
    if (!container) return;

    const items = ensurePlanInvestments(p);
    const rawSavings = Number(p.currentSavings) || 0;
    const totalSavings = Math.max(0, rawSavings);
    const cur = p.currency || state.currency || 'EUR';

    let html = "";
    items.forEach((inv, idx) => {
      const color = ALLOC_SEGMENT_COLORS[idx % ALLOC_SEGMENT_COLORS.length];
      const ratio = Math.max(0, Number(inv.ratio) || 0);
      const ret = Number(inv.annualReturn) || 0;
      const amt = Math.round(totalSavings * (ratio / 100));
      const amtFormatted = window.RetirementEngine.formatCurrency(amt, cur);
      const safeName = (inv.name || '').replace(/"/g, '&quot;');

      html += `
        <div class="investment-row-card" data-id="${inv.id}">
          <div class="inv-row-header">
            <div class="inv-name-group">
              <span style="font-size: 0.95rem; color: ${color}; line-height: 1;">●</span>
              <input type="text" class="form-input inv-name-input" value="${safeName}"
                placeholder="${window.I18n.t('placeholder_investment_name', 'Tên khoản đầu tư (VD: Cổ phiếu, Vàng, BĐS...)')}"
                data-id="${inv.id}">
            </div>
            <button type="button" class="income-item-btn income-item-del inv-delete-btn"
              title="Xóa khoản đầu tư này" data-id="${inv.id}">✕</button>
          </div>
          <div class="inv-inputs-grid">
            <div class="inv-param-col">
              <label class="inv-param-label" data-i18n="lbl_investment_ratio">Tỷ lệ:</label>
              <div class="input-with-unit inv-unit-compact-ratio">
                <input type="number" class="form-input inv-ratio-input" min="0" max="100" step="1"
                  value="${ratio}" data-id="${inv.id}">
                <span class="unit-badge font-mono">%</span>
              </div>
            </div>
            <div class="inv-param-col">
              <label class="inv-param-label" data-i18n="lbl_investment_return">Lãi suất:</label>
              <div class="input-with-unit inv-unit-compact-return">
                <input type="number" class="form-input inv-return-input" min="0" max="100" step="0.1"
                  value="${ret}" data-id="${inv.id}">
                <span class="unit-badge font-mono">%/năm</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Gán sự kiện cho từng phần tử vừa render
    container.querySelectorAll('.inv-ratio-input').forEach(input => {
      const id = input.getAttribute('data-id');
      ['input', 'change'].forEach(evtName => {
        input.addEventListener(evtName, () => {
          handleInvestmentRatioChange(id, input.value, 'input');
        });
      });
    });

    container.querySelectorAll('.inv-return-input').forEach(input => {
      const id = input.getAttribute('data-id');
      ['input', 'change'].forEach(evtName => {
        input.addEventListener(evtName, () => {
          handleInvestmentReturnChange(id, input.value);
        });
      });
    });

    container.querySelectorAll('.inv-name-input').forEach(input => {
      const id = input.getAttribute('data-id');
      input.addEventListener('change', () => {
        handleInvestmentNameChange(id, input.value);
      });
      input.addEventListener('input', () => {
        const item = p.investments.find(x => x.id === id);
        if (item) {
          item.name = input.value;
          debouncedSavePlansToStorage();
        }
      });
    });

    container.querySelectorAll('.inv-delete-btn').forEach(btn => {
      const id = btn.getAttribute('data-id');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleInvestmentDelete(id);
      });
    });
  }

  function renderAllocationSummaryBar(plan, totalPct, unallocatedPct, cur, totalSavings, wasClamped = false) {
    const wrapper = document.getElementById("allocation-summary-bar-wrapper");
    if (!wrapper) return;

    const items = plan.investments || [];
    let segmentsHtml = "";
    items.forEach((inv, idx) => {
      const ratio = Math.max(0, Number(inv.ratio) || 0);
      if (ratio > 0) {
        const color = ALLOC_SEGMENT_COLORS[idx % ALLOC_SEGMENT_COLORS.length];
        const safeName = (inv.name || '').replace(/"/g, '&quot;');
        segmentsHtml += `<div class="inv-progress-segment" style="width: ${ratio}%; background: ${color};" title="${safeName}: ${ratio}%"></div>`;
      }
    });

    wrapper.innerHTML = `
      <div class="inv-progress-bar-container" style="margin: 0.15rem 0 0.15rem 0;">
        ${segmentsHtml}
      </div>
    `;
  }

  function updateAssetAllocationUI(p, fromInputs = false, skipReRenderList = false, wasClamped = false) {
    if (!p) p = getActivePlan();
    const items = ensurePlanInvestments(p);

    if (!skipReRenderList) {
      renderInvestmentsList(p);
    }

    const rawSavings = Number(p.currentSavings) || 0;
    const totalSavings = Math.max(0, rawSavings);
    const cur = p.currency || state.currency || 'EUR';

    let totalPct = 0;
    let activeClassesCount = 0;

    items.forEach(it => {
      const ratio = Math.max(0, Number(it.ratio) || 0);
      totalPct += ratio;
      if (ratio > 0) {
        activeClassesCount++;
      }
    });

    totalPct = Math.min(100, totalPct);
    const unallocatedPct = Math.max(0, 100 - totalPct);

    const weighted = window.RetirementEngine.calculateWeightedReturn(items, p.assetReturns, 0.3);

    renderAllocationSummaryBar(p, totalPct, unallocatedPct, cur, totalSavings, wasClamped);

    const badgeWeighted = document.getElementById("badge-weighted-return");
    const isAllocEnabled = (p.enableAssetAllocation !== false);

    if (badgeWeighted) {
      if (isAllocEnabled) {
        badgeWeighted.innerText = `${weighted}%/năm`;
        badgeWeighted.style.background = "rgba(16, 185, 129, 0.15)";
        badgeWeighted.style.color = "#34d399";
        badgeWeighted.style.borderColor = "rgba(16, 185, 129, 0.3)";
      } else {
        badgeWeighted.innerText = "0.0%/năm";
        badgeWeighted.style.background = "rgba(148, 163, 184, 0.15)";
        badgeWeighted.style.color = "var(--text-muted)";
        badgeWeighted.style.borderColor = "rgba(148, 163, 184, 0.3)";
      }
    }

    // Đảm bảo vị trí thẻ
    ensureAssetAllocationCardPosition();

    // Cập nhật thẻ tóm tắt trong Cột Thu nhập
    const lblCardRatio = document.getElementById("lbl-alloc-card-ratio");
    const lblCardBonus = document.getElementById("lbl-alloc-card-bonus");
    const cardEl = document.getElementById("card-asset-allocation-stream");
    const chkEnable = document.getElementById("chk-enable-asset-allocation");

    if (lblCardRatio) {
      if (isAllocEnabled) {
        let ratioItems = [];
        items.forEach(it => {
          const r = Math.max(0, Number(it.ratio) || 0);
          if (r > 0) {
            const shortName = (it.name || '').split(' ')[0] || 'Đầu tư';
            ratioItems.push(`${r}% ${shortName}`);
          }
        });
        if (unallocatedPct > 0) {
          ratioItems.push(`${unallocatedPct}% Nhàn rỗi`);
        }
        if (ratioItems.length === 0) {
          ratioItems.push(`100% Chưa đầu tư`);
        }
        lblCardRatio.innerText = ratioItems.join(" • ");
      } else {
        lblCardRatio.innerText = `Tắt đầu tư (0% sinh lời • Giữ tiền mặt)`;
      }
    }

    if (lblCardBonus) {
      if (isAllocEnabled) {
        lblCardBonus.innerText = `Lãi suất chung: ${weighted}%/năm`;
      } else {
        lblCardBonus.innerText = `Lãi suất chung: 0.0%/năm`;
      }
    }

    if (chkEnable) chkEnable.checked = isAllocEnabled;
    if (cardEl) cardEl.style.opacity = isAllocEnabled ? "1" : "0.55";

    // Đồng bộ ngược vào assetAllocation để tương thích
    const sItem = items.find(x => x.id === 'inv_stocks' || /cổ phiếu|stock/i.test(x.name));
    const bItem = items.find(x => x.id === 'inv_bonds' || /trái phiếu|bond/i.test(x.name));
    const cItem = items.find(x => x.id === 'inv_cash' || /tiền mặt|cash/i.test(x.name));
    p.assetAllocation = {
      stocks: sItem ? Number(sItem.ratio) : 0,
      bonds: bItem ? Number(bItem.ratio) : 0,
      realEstate: 0,
      cash: cItem ? Number(cItem.ratio) : 0
    };

    if (isAllocEnabled) {
      p.investmentReturnPre = weighted;
      p.investmentReturnPost = weighted;
      setVal("inp-return-pre", weighted);
      setVal("inp-return-post", weighted);
    } else {
      p.investmentReturnPre = 0;
      p.investmentReturnPost = 0;
      setVal("inp-return-pre", 0);
      setVal("inp-return-post", 0);
    }
  }

  const FOREX_RATES_TO_USD = {
    'USD': 1.0,
    'EUR': 0.92,
    'VND': 25400,
    'GBP': 0.78,
    'CHF': 0.89,
    'CAD': 1.38,
    'AUD': 1.54,
    'JPY': 154,
    'SGD': 1.34,
    'THB': 36.5,
    'TWD': 32.5,
    'CNY': 7.25,
    'KRW': 1380
  };

  function getCrossBorderForexInfo(workProfile, retireProfile) {
    const workCur = workProfile?.currency || 'EUR';
    const retireCur = retireProfile?.currency || 'VND';
    const workSymbol = workProfile?.currencySymbol || (workCur === 'EUR' ? '€' : (workCur === 'USD' ? '$' : workCur));
    const retireSymbol = retireProfile?.currencySymbol || (retireCur === 'VND' ? '₫' : (retireCur === 'EUR' ? '€' : retireCur));
    const isSameCurrency = (workCur === retireCur);

    let defaultRate = 1.0;
    let defaultDrift = 0.0;

    if (!isSameCurrency) {
      if (workCur === 'EUR' && retireCur === 'VND') {
        defaultRate = 27500;
        defaultDrift = 1.2;
      } else if (workCur === 'USD' && retireCur === 'VND') {
        defaultRate = 25400;
        defaultDrift = 1.5;
      } else if (workCur === 'USD' && retireCur === 'EUR') {
        defaultRate = 0.92;
        defaultDrift = -0.3;
      } else if (workCur === 'EUR' && retireCur === 'USD') {
        defaultRate = 1.08;
        defaultDrift = 0.3;
      } else {
        const rWork = FOREX_RATES_TO_USD[workCur] || 1.0;
        const rRetire = FOREX_RATES_TO_USD[retireCur] || 1.0;
        const rawRate = rRetire / rWork;
        defaultRate = Number(rawRate >= 100 ? Math.round(rawRate) : rawRate.toFixed(2));
        const infWork = (workProfile?.inflation || 0.02) * 100;
        const infRetire = (retireProfile?.inflation || 0.04) * 100;
        defaultDrift = Number((infRetire - infWork).toFixed(1));
      }
    }

    return {
      workCur,
      retireCur,
      workSymbol,
      retireSymbol,
      pairLabel: `${workCur}/${retireCur}`,
      pairUnit: `${retireSymbol}/${workSymbol}`,
      isSameCurrency,
      defaultRate,
      defaultDrift
    };
  }

  function updateDualInflationUI(p) {
    if (!p) p = getActivePlan();
    if (!p) return;

    const ratios = getRetirementPppRatios(p);
    const workProfile = ratios.workProfile;
    const retireProfile = ratios.retireProfile;
    const workName = workProfile.countryLabel || 'nơi làm việc';
    const retireName = retireProfile.countryLabel || 'nơi nghỉ hưu';
    const forexInfo = getCrossBorderForexInfo(workProfile, retireProfile);
    const isSameCurrency = forexInfo.isSameCurrency;
    const isDomestic = ratios.isDomestic;

    const chk = document.getElementById("chk-dual-inflation-enabled");
    const cardEl = document.getElementById("card-dual-inflation-stream");
    const lblTitle = document.getElementById("lbl-inflation-card-title");
    const boxDomestic = document.getElementById("box-domestic-inflation");
    const boxCrossBorder = document.getElementById("box-crossborder-inflation");
    const boxTiming = document.getElementById("box-inflation-card-timing");
    const lblRates = document.getElementById("lbl-inflation-card-rates");
    const lblForexCard = document.getElementById("lbl-inflation-card-forex");
    const lblFuture = document.getElementById("lbl-inflation-card-future");
    const badgeStatus = document.getElementById("badge-dual-inflation-status");

    // Thẻ lạm phát luôn active by default (dualInflation.enabled !== false)
    const isEnabled = chk ? chk.checked : (p.dualInflation?.enabled !== false);
    if (chk) chk.checked = isEnabled;

    if (cardEl) {
      cardEl.style.opacity = isEnabled ? "1" : "0.55";
    }

    if (isDomestic) {
      // 1. Chế độ Lạm phát Nội địa (1 Quốc gia)
      if (lblTitle) {
        lblTitle.innerText = window.I18n ? window.I18n.t("card_inflation_domestic", "Lạm phát chi tiêu") : "Lạm phát chi tiêu";
      }
      if (boxDomestic) boxDomestic.style.display = "block";
      if (boxCrossBorder) boxCrossBorder.style.display = "none";
      if (boxTiming) boxTiming.style.display = "none";

      const defaultInf = (retireProfile.inflation ? retireProfile.inflation * 100 : (p.workCountry === 'VN' ? 4.0 : 2.0));
      const infRate = (p.inflationRate !== undefined && p.inflationRate !== null) ? Number(p.inflationRate) : defaultInf;
      const inpInf = document.getElementById("inp-inflation");
      if (inpInf && Number(inpInf.value) !== infRate) {
        inpInf.value = infRate;
      }

      if (lblRates) {
        lblRates.innerText = `Lạm phát dự phóng: ${infRate}%/năm`;
      }
      if (lblForexCard) {
        lblForexCard.innerText = `Áp dụng cho toàn bộ chi tiêu sinh hoạt`;
      }
      if (badgeStatus) {
        badgeStatus.innerText = isEnabled ? `Nội địa • ${infRate}%` : "Đã tắt";
        badgeStatus.style.background = isEnabled ? "rgba(16, 185, 129, 0.12)" : "rgba(100, 116, 139, 0.15)";
        badgeStatus.style.color = isEnabled ? "#10b981" : "#94a3b8";
        badgeStatus.style.borderColor = isEnabled ? "rgba(16, 185, 129, 0.25)" : "var(--border-subtle)";
      }

      p.inflationRate = infRate;
      if (!p.dualInflation) p.dualInflation = {};
      p.dualInflation.enabled = isEnabled;
      p.dualInflation.inflationPre = infRate;
      p.dualInflation.inflationPost = infRate;
    } else {
      // 2. Chế độ Lạm phát 2 Chặng & Tỷ Giá (Xuyên Biên Giới)
      if (boxDomestic) boxDomestic.style.display = "none";
      if (boxCrossBorder) boxCrossBorder.style.display = "block";
      if (boxTiming) boxTiming.style.display = "flex";

      // Kiểm tra xem cặp quốc gia vừa thay đổi để gán tỷ giá mặc định phù hợp
      const pairKey = `${workProfile.countryCode || 'FR'}_${retireProfile.countryCode || 'VN'}`;
      if (!p.dualInflation) p.dualInflation = {};
      if (p.dualInflation._lastPairKey !== pairKey) {
        p.dualInflation._lastPairKey = pairKey;
        p.dualInflation.inflationPre = Number(((workProfile.inflation || 0.02) * 100).toFixed(1));
        p.dualInflation.inflationPost = Number(((retireProfile.inflation || 0.04) * 100).toFixed(1));
        p.dualInflation.eurVndInitialRate = forexInfo.defaultRate;
        p.dualInflation.eurVndAnnualDrift = forexInfo.defaultDrift;
      }

      const inpPre = document.getElementById("inp-inflation-pre");
      const inpPost = document.getElementById("inp-inflation-post");
      const inpBase = document.getElementById("inp-forex-base");
      const inpDrift = document.getElementById("inp-forex-drift");

      if (inpPre && (document.activeElement !== inpPre || isNaN(Number(inpPre.value)))) {
        inpPre.value = (p.dualInflation.inflationPre ?? Number(((workProfile.inflation || 0.02) * 100).toFixed(1)));
      }
      if (inpPost && (document.activeElement !== inpPost || isNaN(Number(inpPost.value)))) {
        inpPost.value = (p.dualInflation.inflationPost ?? Number(((retireProfile.inflation || 0.04) * 100).toFixed(1)));
      }
      if (inpBase && (document.activeElement !== inpBase || isNaN(Number(inpBase.value)))) {
        inpBase.value = (p.dualInflation.eurVndInitialRate ?? forexInfo.defaultRate);
      }
      if (inpDrift && (document.activeElement !== inpDrift || isNaN(Number(inpDrift.value)))) {
        inpDrift.value = (p.dualInflation.eurVndAnnualDrift ?? forexInfo.defaultDrift);
      }

      const pre = Number(inpPre?.value) || (p.dualInflation?.inflationPre ?? 2.2);
      const post = Number(inpPost?.value) || (p.dualInflation?.inflationPost ?? 4.0);
      const baseForex = Number(inpBase?.value) || (p.dualInflation?.eurVndInitialRate ?? forexInfo.defaultRate);
      const drift = Number(inpDrift?.value) || (p.dualInflation?.eurVndAnnualDrift ?? forexInfo.defaultDrift);

      // Cập nhật tiêu đề thẻ
      if (lblTitle) {
        if (isSameCurrency) {
          lblTitle.innerText = `Lạm phát 2 Chặng (${workName} • ${retireName})`;
        } else {
          lblTitle.innerText = `Lạm phát 2 Chặng & Tỷ giá ${forexInfo.pairLabel}`;
        }
      }

      // Cập nhật nhãn input
      const lblInpPre = document.getElementById("lbl-inp-inflation-pre");
      const lblInpPost = document.getElementById("lbl-inp-inflation-post");
      const lblInpBase = document.getElementById("lbl-inp-forex-base");
      const lblInpDrift = document.getElementById("lbl-inp-forex-drift");
      const rowForexInputs = document.getElementById("row-forex-inputs");

      if (lblInpPre) lblInpPre.innerText = `Lạm phát ${workName} (Tích lũy %)`;
      if (lblInpPost) lblInpPost.innerText = `Lạm phát ${retireName} (Hưu trí %)`;
      if (lblInpBase) lblInpBase.innerText = `Tỷ giá ban đầu (${forexInfo.pairUnit})`;
      if (lblInpDrift) lblInpDrift.innerText = `Trượt giá ${forexInfo.pairLabel} (%/năm)`;

      if (rowForexInputs) {
        rowForexInputs.style.display = isSameCurrency ? "none" : "";
      }

      // Tính toán dự phóng tỷ giá ở tuổi nghỉ hưu hoặc 60t
      const curAge = Number(p.currentAge) || 29;
      const targetAge = Number(p.retirementAge) || 60;
      const yearsToTarget = Math.max(0, targetAge - curAge);
      const futureForex = isSameCurrency ? 1.0 : (baseForex * Math.pow(1.0 + (drift / 100), yearsToTarget));

      const fmtForex = (v) => {
        if (v >= 100) return Math.round(v).toLocaleString("vi-VN");
        return Number(v).toFixed(2);
      };

      if (lblRates) {
        lblRates.innerText = `${workName} ${pre}% • ${retireName} ${post}%`;
      }
      if (lblForexCard) {
        if (isSameCurrency) {
          lblForexCard.innerText = `Cùng khu vực tiền tệ ${forexInfo.workCur} (${forexInfo.workSymbol}) • Không rủi ro tỷ giá`;
        } else {
          lblForexCard.innerText = `Tỷ giá gốc: ${fmtForex(baseForex)} ${forexInfo.pairUnit} • Trượt giá: ${drift >= 0 ? '+' : ''}${drift}%/năm`;
        }
      }
      if (lblFuture) {
        if (isSameCurrency) {
          lblFuture.innerText = `Tỷ giá 1:1 cố định`;
        } else {
          lblFuture.innerText = `Ở ${targetAge}t: ~${fmtForex(futureForex)} ${forexInfo.pairUnit}`;
        }
      }

      const badgeGrowth = document.getElementById("lbl-inflation-card-badge");
      if (badgeGrowth) {
        if (isSameCurrency) {
          badgeGrowth.innerText = `Đồng tiền ${forexInfo.workCur}`;
        } else {
          const diffInf = post - pre;
          const driftEffect = diffInf >= 0 ? `+${diffInf.toFixed(1)}%` : `${diffInf.toFixed(1)}%`;
          badgeGrowth.innerText = `Sức mua ${forexInfo.workCur} ${driftEffect} tại ${retireName}`;
        }
      }

      if (badgeStatus) {
        badgeStatus.innerText = isEnabled ? "PPP Model" : "Đã tắt";
        badgeStatus.style.background = isEnabled ? "rgba(244, 63, 94, 0.12)" : "rgba(100, 116, 139, 0.15)";
        badgeStatus.style.color = isEnabled ? "#fb7185" : "#94a3b8";
        badgeStatus.style.borderColor = isEnabled ? "rgba(244, 63, 94, 0.25)" : "var(--border-subtle)";
      }

      const hintForex = document.getElementById("hint-forex-projection");
      if (hintForex) {
        if (isSameCurrency) {
          hintForex.innerHTML = `Hai quốc gia cùng sử dụng <strong>${forexInfo.workCur} (${forexInfo.workSymbol})</strong>, không chịu rủi ro tỷ giá. Chi phí được tính riêng theo lạm phát tích lũy tại ${workName} và lạm phát hưu trí tại ${retireName}.`;
        } else {
          hintForex.innerHTML = `Dự báo tỷ giá ở tuổi ${targetAge}: <strong id="lbl-forex-future" style="color: #fb7185;">~${fmtForex(futureForex)} ${forexInfo.pairUnit}</strong> • Sức mua ${forexInfo.workCur} bù trừ theo chênh lệch lạm phát tại ${retireName}.`;
        }
      }

      // Cập nhật công thức đa quốc gia
      const formulaText = document.getElementById("formula-dual-inflation-text");
      const formulaTag = document.getElementById("lbl-formula-inflation-tag");
      if (formulaTag) {
        formulaTag.innerText = isSameCurrency
          ? `Công thức Lạm Phát 2 Chặng (${workName} • ${retireName})`
          : `Công thức Lạm Phát 2 Chặng & Trượt Giá Tỷ Giá (${forexInfo.pairLabel})`;
      }
      if (formulaText) {
        if (isSameCurrency) {
          formulaText.innerHTML = `
            <code>• Giai đoạn ${workName} (tích lũy): Chi_phí(t) = Chi_phí₀ × (1 + i_${workName})^t</code>
            <code>• Giai đoạn ${retireName} (hưu trí): Chi_phí(t) = Chi_phí_hưu × (1 + i_${retireName})^(t - Tuổi_hưu)</code>
            <span style="font-size: 0.71rem; color: var(--text-muted); margin-top: 0.2rem;">
              Cả 2 quốc gia cùng sử dụng đồng tiền <strong>${forexInfo.workCur} (${forexInfo.workSymbol})</strong>, dòng tiền không chịu rủi ro trượt giá hối đoái.
            </span>
          `;
        } else {
          formulaText.innerHTML = `
            <code>• Giai đoạn ${workName} (tích lũy): Chi_phí(t) = Chi_phí₀ × (1 + i_${workName})^t</code>
            <code>• Giai đoạn ${retireName} (hưu trí): Chi_phí(t) = Chi_phí_hưu × (1 + i_${retireName})^(t - Tuổi_hưu)</code>
            <code>• Tỷ giá ${forexInfo.pairLabel}(t) = Tỷ giá ban đầu × (1 + Trượt_giá)^t</code>
            <span style="font-size: 0.71rem; color: var(--text-muted); margin-top: 0.2rem;">
              <em>Hiệu ứng Fisher & PPP (Purchasing Power Parity):</em> Chênh lệch lạm phát giữa ${retireName} (~${post}%) và ${workName} (~${pre}%) được bù trừ qua mức biến động giá trị của ${forexInfo.workCur} theo thời gian.
            </span>
          `;
        }
      }

      if (!p.dualInflation) p.dualInflation = {};
      p.dualInflation.enabled = isEnabled;
      p.dualInflation.inflationPre = pre;
      p.dualInflation.inflationPost = post;
      p.dualInflation.eurVndInitialRate = baseForex;
      p.dualInflation.eurVndAnnualDrift = drift;
      p.dualInflation.forexInitialRate = baseForex;
      p.dualInflation.forexAnnualDrift = drift;
      p.dualInflation.forexPair = forexInfo.pairLabel;
    }

    // Đảm bảo thẻ Lạm phát luôn nằm ngay dưới thẻ Chi tiêu/tháng khi về hưu
    ensureDualInflationCardPosition();
  }

  function updateRetirementLocationUI(loc, plan) {
    if (!plan && typeof getActivePlan === 'function') plan = getActivePlan();
    const badge = document.getElementById("badge-retire-location");
    const hint = document.getElementById("hint-location-desc");
    if (!badge) return;

    const ratios = getRetirementPppRatios(plan);
    const workName = ratios.workProfile?.countryLabel || 'nơi làm việc';
    const retireName = ratios.retireProfile?.countryLabel || 'nơi nghỉ hưu';
    const retirePct = Math.round(ratios.retireRatio * 100);

    if (loc === "vietnam") {
      badge.innerText = `Giảm ~${ratios.discountRetire}% chi phí (PPP)`;
      badge.style.background = "rgba(16, 185, 129, 0.15)";
      badge.style.color = "#34d399";
      if (hint) hint.innerText = `Sức mua tương đương (PPP): Cùng tiêu chuẩn sống cao, chi phí tại ${retireName} chỉ bằng ~${retirePct}% tại ${workName}.`;
    } else if (loc === "hybrid") {
      badge.innerText = `Giảm ~${ratios.discountHybrid}% chi phí`;
      badge.style.background = "rgba(56, 189, 248, 0.15)";
      badge.style.color = "#38bdf8";
      if (hint) hint.innerText = `Song hành ${workName} - ${retireName}: 6 tháng sống tại ${workName} & 6 tháng tại ${retireName}, tối ưu chi phí sinh hoạt kèm quỹ vé máy bay di chuyển.`;
    } else {
      badge.innerText = `Chi phí Chuẩn ${workName}`;
      badge.style.background = "rgba(255, 255, 255, 0.08)";
      badge.style.color = "#94a3b8";
      if (hint) hint.innerText = `100% tại ${workName}: Giữ nguyên mức chi phí sinh hoạt tiêu chuẩn nơi làm việc.`;
    }
  }

  // -------------------------------------------------------------
  // Income Streams By Age Periods (Multiple Streams Breakdown)
  // -------------------------------------------------------------
  function computeIncomePeriods(plan) {
    if (!plan) return [];
    const curAge = Number(plan.currentAge) || 29;
    const retireAge = Number(plan.retirementAge) || 42;
    const lifeExp = Number(plan.lifeExpectancy) || 85;
    const curYear = new Date().getFullYear();
    const bYear = Number(plan.birthYear) || (curYear - curAge);

    // Filter active streams
    const streams = [];
    (plan.incomes || []).forEach(s => {
      if (s.enabled === false) return;
      const amt = Number(s.amount) || 0;
      if (amt <= 0) return;
      const sAge = Number(s.startAge) || curAge;
      const isSalary = !s.isBhxhVn && (s.isSalary || (s.name && (/lương|salary|impôt|impot/i).test(s.name)));
      const rawEndAge = isSalary ? (retireAge - 1) : (Number(s.endAge) || retireAge);
      const eAge = Math.min(lifeExp, rawEndAge);
      if (sAge <= lifeExp && eAge >= curAge) {
        streams.push({
          name: s.name || "Nguồn thu",
          amount: amt,
          growth: (s.growth !== undefined && s.growth !== null && !isNaN(Number(s.growth))) ? Number(s.growth) : 0,
          startAge: Math.max(curAge, sAge),
          endAge: eAge,
          isPension: false
        });
      }
    });

    // French Pension / BHXH if configured (matching engine.js Décote & Prorata)
    const ssAge = Number(plan.socialSecurityAge) || 64;
    const rawSS = Number(plan.socialSecurityAnnual) || 0;
    if (rawSS > 0 && ssAge <= lifeExp && plan.enableFrenchPension !== false) {
      let ssAmt = rawSS;
      if (plan.enableFrenchDecote !== false) {
        const startWorkAge = Number(plan.startWorkAge) || 24;
        const yearsWorked = Math.max(0, Math.min(retireAge, ssAge) - startWorkAge);
        const quarters = yearsWorked * 4;
        const targetQuarters = 172; // Standard 43 years in France (Taux Plein)
        const missingQuarters = Math.max(0, targetQuarters - quarters);
        const prorata = Math.min(1.0, quarters / targetQuarters);
        const decotePenalty = (ssAge < 67 && missingQuarters > 0) ? Math.min(20, missingQuarters) * 0.0125 : 0;
        ssAmt = Math.round(rawSS * prorata * (1.0 - decotePenalty));
      }
      streams.push({
        name: "Lương hưu Pháp",
        amount: ssAmt,
        growth: 0,
        startAge: Math.max(curAge, ssAge),
        endAge: lifeExp,
        isPension: true
      });
    }

    if (streams.length === 0) return [];

    // Collect all boundary ages
    const boundaries = new Set();
    boundaries.add(curAge);
    boundaries.add(lifeExp + 1);

    streams.forEach(s => {
      if (s.startAge >= curAge && s.startAge <= lifeExp) boundaries.add(s.startAge);
      if (s.endAge + 1 >= curAge && s.endAge + 1 <= lifeExp + 1) boundaries.add(s.endAge + 1);
    });

    if (retireAge > curAge && retireAge <= lifeExp) {
      boundaries.add(retireAge);
    }

    const sortedAges = Array.from(boundaries).sort((a, b) => a - b);
    const rawPeriods = [];

    for (let i = 0; i < sortedAges.length - 1; i++) {
      const pStart = sortedAges[i];
      const pEnd = sortedAges[i + 1] - 1;
      if (pStart > pEnd) continue;

      const activeStreams = streams.filter(s => s.startAge <= pStart && s.endAge >= pEnd);

      let totalAnnualStart = 0;
      let totalAnnualEnd = 0;
      const streamBreakdown = [];

      activeStreams.forEach(s => {
        const streamGrowth = (s.growth || 0) / 100.0;
        const yearsActiveStart = Math.max(0, pStart - s.startAge);
        const yearsActiveEnd = Math.max(0, pEnd - s.startAge);
        const annualValStart = Math.round(s.amount * Math.pow(1.0 + streamGrowth, yearsActiveStart));
        const annualValEnd = Math.round(s.amount * Math.pow(1.0 + streamGrowth, yearsActiveEnd));
        totalAnnualStart += annualValStart;
        totalAnnualEnd += annualValEnd;
        streamBreakdown.push({
          name: s.name,
          annual: annualValStart,
          annualEnd: annualValEnd,
          monthly: Math.round(annualValStart / 12),
          monthlyEnd: Math.round(annualValEnd / 12)
        });
      });

      const isRetirePeriod = pStart >= retireAge;
      const phaseLabel = isRetirePeriod ? "Hưu trí (FIRE)" : "Tích lũy";

      rawPeriods.push({
        startAge: pStart,
        endAge: pEnd,
        startYear: bYear + pStart,
        endYear: bYear + pEnd,
        phaseLabel,
        isRetirePeriod,
        totalAnnual: totalAnnualStart,
        totalAnnualEnd: totalAnnualEnd,
        totalMonthly: Math.round(totalAnnualStart / 12),
        totalMonthlyEnd: Math.round(totalAnnualEnd / 12),
        streams: streamBreakdown
      });
    }

    // Merge adjacent periods if identical streams and amounts
    const merged = [];
    rawPeriods.forEach(p => {
      if (merged.length > 0) {
        const prev = merged[merged.length - 1];
        const prevStreamsKey = prev.streams.map(s => s.name).sort().join("|");
        const currStreamsKey = p.streams.map(s => s.name).sort().join("|");
        if (prevStreamsKey === currStreamsKey && prev.isRetirePeriod === p.isRetirePeriod && prev.totalMonthly === p.totalMonthly && prev.totalMonthlyEnd === p.totalMonthlyEnd) {
          prev.endAge = p.endAge;
          prev.endYear = p.endYear;
          return;
        }
      }
      merged.push(p);
    });

    return merged;
  }

  function renderIncomePeriodsSummary(plan) {
    const container = document.getElementById("income-periods-container");
    const countEl = document.getElementById("income-periods-count");
    if (!container) return;

    if (!plan) plan = getActivePlan();
    const periods = computeIncomePeriods(plan);

    if (countEl) countEl.innerText = `${periods.length} giai đoạn`;

    if (periods.length === 0) {
      container.innerHTML = `
        <div style="font-size:0.75rem; color:var(--text-faint); padding:0.35rem 0; text-align:center;">
          Chưa có nguồn thu nào để tổng hợp giai đoạn tuổi.
        </div>`;
      return;
    }

    const cur = state.currency;
    const fmt = (v) => window.RetirementEngine.formatCurrency(v, cur);

    const chosenStrat = plan.withdrawalStrategy || 'guyton_klinger';
    const swrVal = (plan.initialWithdrawalRate || plan.swr || 4.0).toFixed(1);
    const stratNames = {
      bengen_4pct: { full: "Quy tắc 4% Cố định (Bengen)", short: "Bengen 4%" },
      guyton_klinger: { full: "Lan can Guyton-Klinger", short: "Guyton-Klinger" },
      vpw: { full: "Tỷ lệ Thay đổi VPW", short: "VPW" },
      fixed_pct: { full: "Tỷ lệ Cố định (Fixed %)", short: "Fixed %" }
    };
    const curStratInfo = stratNames[chosenStrat] || { full: "Lan can Guyton-Klinger", short: "Guyton-Klinger" };

    let proj = null;
    try {
      if (window.RetirementEngine && typeof window.RetirementEngine.runProjection === "function") {
        proj = window.RetirementEngine.runProjection(plan);
      }
    } catch (err) {
      console.warn("Lỗi tính projection trong income periods summary:", err);
    }

    const isStrategyActive = plan.enableWithdrawalStrategy !== false;

    container.innerHTML = periods.map(p => {
      let withMoStart = 0, withMoEnd = 0, withAnnStart = 0, withAnnEnd = 0;
      let withdrawalChipHtml = "";

      if (isStrategyActive && p.isRetirePeriod && proj && Array.isArray(proj.timeline)) {
        const pRows = proj.timeline.filter(r => r.age >= p.startAge && r.age <= p.endAge && r.isRetired);
        if (pRows.length > 0) {
          const firstR = pRows[0];
          const lastR = pRows[pRows.length - 1];
          withAnnStart = (firstR.netCashFlow < 0) ? Math.round(-firstR.netCashFlow) : 0;
          withAnnEnd = (lastR.netCashFlow < 0) ? Math.round(-lastR.netCashFlow) : 0;
          withMoStart = Math.round(withAnnStart / 12);
          withMoEnd = Math.round(withAnnEnd / 12);

          if (withAnnStart > 0 || withAnnEnd > 0) {
            const hasWithGrowth = (withAnnStart !== withAnnEnd);
            const withMonthlyStr = hasWithGrowth
              ? `${fmt(withMoStart)} - ${fmt(withMoEnd)}/tháng`
              : `${fmt(withMoStart)}/tháng`;
            const withAnnualStr = hasWithGrowth
              ? `≈ ${fmt(withAnnStart)} - ${fmt(withAnnEnd)}/năm`
              : `≈ ${fmt(withAnnStart)}/năm`;

            withdrawalChipHtml = `
              <span class="period-chip chip-withdrawal-period" title="Số tiền dự kiến rút từ danh mục đầu tư theo quy tắc ${escapeHtml(curStratInfo.full)} (SWR ${swrVal}%) • Quy đổi năm: ${withAnnualStr}">
                Rút vốn (${escapeHtml(curStratInfo.short)}): <strong>${withMonthlyStr}</strong>
              </span>
            `;
          }
        }
      }

      // Trong kỳ hưu trí: tổng dòng tiền chi tiêu khả dụng về tài khoản = Thu nhập định kỳ + Tiền rút vốn (chỉ cộng nếu bật chiến lược)
      const effMoStart = (isStrategyActive && p.isRetirePeriod) ? (p.totalMonthly + withMoStart) : p.totalMonthly;
      const effMoEnd = (isStrategyActive && p.isRetirePeriod) ? (p.totalMonthlyEnd + withMoEnd) : p.totalMonthlyEnd;
      const effAnnStart = (isStrategyActive && p.isRetirePeriod) ? (p.totalAnnual + withAnnStart) : p.totalAnnual;
      const effAnnEnd = (isStrategyActive && p.isRetirePeriod) ? (p.totalAnnualEnd + withAnnEnd) : p.totalAnnualEnd;

      const isZero = effMoStart === 0 && effMoEnd === 0;
      const borderColor = p.isRetirePeriod ? '#34d399' : '#10b981';
      const badgeColor = p.isRetirePeriod ? '#6ee7b7' : '#34d399';

      const hasGrowth = effAnnStart !== effAnnEnd;
      const monthlyStr = hasGrowth
        ? `+${window.RetirementEngine.formatCurrency(effMoStart, state.currency)} - ${window.RetirementEngine.formatCurrency(effMoEnd, state.currency)}/tháng`
        : `+${window.RetirementEngine.formatCurrency(effMoStart, state.currency)}/tháng`;

      let annualLabelSuffix = "";
      if (isStrategyActive && p.isRetirePeriod) {
        if (p.totalMonthly === 0 && withMoStart > 0) {
          annualLabelSuffix = " • Từ rút vốn";
        } else if (p.totalMonthly > 0 && withMoStart > 0) {
          annualLabelSuffix = " • Thu nhập + Rút vốn";
        }
      }

      const annualStr = hasGrowth
        ? `≈ ${window.RetirementEngine.formatCurrency(effAnnStart, state.currency)} - ${window.RetirementEngine.formatCurrency(effAnnEnd, state.currency)}/năm${annualLabelSuffix}`
        : `≈ ${window.RetirementEngine.formatCurrency(effAnnStart, state.currency)}/năm${annualLabelSuffix}`;

      const streamsHtml = p.streams.length > 0
        ? p.streams.map(s => {
            const cleanStreamName = (s.name || '').replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
            const sGrowth = s.annual !== s.annualEnd;
            const sText = sGrowth
              ? `+${window.RetirementEngine.formatCurrency(s.monthly, state.currency)} - ${window.RetirementEngine.formatCurrency(s.monthlyEnd, state.currency)}/tháng`
              : `+${window.RetirementEngine.formatCurrency(s.monthly, state.currency)}/tháng`;
            return `
              <span class="period-chip income-period-chip">
                ${escapeHtml(cleanStreamName)}: <strong>${sText}</strong>
              </span>
            `;
          }).join("")
        : (withdrawalChipHtml ? '' : `<span style="font-size: 0.72rem; color: var(--text-faint); font-style: italic;">Chỉ chi tiêu từ tài sản tích lũy (Không có thu nhập chủ động)</span>`);

      return `
        <div class="income-period-card" style="border-left-color: ${borderColor};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
              <span class="badge income-period-age-badge" style="background: transparent; color: ${badgeColor}; font-weight: 700; font-size: 0.76rem; padding: 0.15rem 0;">
                ${p.startAge} – ${p.endAge} tuổi
              </span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">
                (${p.startYear} – ${p.endYear})
              </span>
              <span class="badge period-phase-badge income-phase-badge">
                ${p.phaseLabel}
              </span>
            </div>
            <div style="text-align: right; margin-left: auto;">
              <span class="font-mono income-period-monthly" style="font-size: 0.95rem; font-weight: 800; color: ${isZero ? 'var(--text-faint)' : '#10b981'};">
                ${isZero ? '0' : monthlyStr}
              </span>
              <span style="font-size: 0.72rem; color: var(--text-faint); display: block;">
                ${annualStr}
              </span>
            </div>
          </div>
          <div class="period-card-streams">
            ${streamsHtml}
            ${withdrawalChipHtml}
          </div>
        </div>
      `;
    }).join("");
  }


  /**
   * Nhận diện luồng thu nhập thuộc BĐS / LMNP (dùng chung cho nhiều hàm).
   * @param {Object} s - luồng thu nhập
   * @returns {boolean}
   */
  function isRealEstateStream(s) {
    if (!s) return false;
    return Boolean(s.isRealEstate) ||
      Boolean(s.isLmnp) ||
      (/lmnp|doanh thu bđs|doanh thu bds|doanh thu bất động sản|dòng tiền bđs|dòng tiền bds|dòng tiền bất động sản|bất động sản|bat dong san/i).test(s.name || '');
  }

  function renderIncomeStreamsList() {
    ensureAssetAllocationCardPosition();
    const container = document.getElementById("income-streams-container");
    container.innerHTML = "";
    const p = getActivePlan();
    if (!p) return;
    if (!Array.isArray(p.incomes)) p.incomes = [];

    // Tự động đồng bộ nguồn thu lương theo Profil: 1 người (Cá nhân) vs 2 người (Vợ chồng)
    if (window.AppState && typeof window.AppState.syncSalaryStreamsWithMaritalStatus === 'function') {
      window.AppState.syncSalaryStreamsWithMaritalStatus(p);
    }

    renderIncomePeriodsSummary(p);

    const otherIncomes = p.incomes.filter(s => !s.isBhxhVn && !isRealEstateStream(s));
    if (otherIncomes.length === 0) {
      container.innerHTML = `<div style="font-size:0.78rem;color:var(--text-faint);padding:0.5rem 0;">Chưa có nguồn thu bổ sung nào khác. Bấm "+ Thêm nguồn thu" để thêm.</div>`;
      updateLmnpUI(p);
      return;
    }

    const isMarried = (p.maritalStatus === 'married');

    p.incomes.forEach((stream, idx) => {
      if (stream.isBhxhVn) return; // Dedicated card #card-bhxh-income-stream is used
      if (isRealEstateStream(stream)) return; // Dedicated card #card-lmnp-income-stream is used
      const rawName = (stream.name || '').replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();

      const isSpouseSalary = stream.isSpouseSalary || /lương.*(bạn đời|vợ|chồng)|salaire.*conjoint|spouse.*salary/i.test(rawName);
      const isPrimarySalary = stream.isPrimarySalary || (!isSpouseSalary && (/lương hiện tại của bạn|lương tại|lương chính/i.test(rawName) || stream.isSalary));

      let displayName = rawName;
      let badgeHtml = '';

      if (isSpouseSalary) {
        displayName = (window.I18n && window.I18n.t) ? window.I18n.t("income_salary_spouse", "Lương hiện tại của bạn đời") : "Lương hiện tại của bạn đời";
        if (isMarried) {
          const badgeText = (window.I18n && window.I18n.t) ? window.I18n.t("badge_spouse_salary", "Bạn đời") : "Bạn đời";
          badgeHtml = `<span class="field-badge font-mono" style="background: rgba(236, 72, 153, 0.15); color: #ec4899; border: 1px solid rgba(236, 72, 153, 0.3); font-size: 0.65rem; padding: 1px 6px; margin-left: 0.4rem; border-radius: 4px;">${badgeText}</span>`;
        }
      } else if (isPrimarySalary) {
        displayName = (window.I18n && window.I18n.t) ? window.I18n.t("income_salary_primary", "Lương hiện tại của bạn") : "Lương hiện tại của bạn";
        if (isMarried) {
          const badgeText = (window.I18n && window.I18n.t) ? window.I18n.t("badge_primary_salary", "Bạn") : "Bạn";
          badgeHtml = `<span class="field-badge font-mono" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); font-size: 0.65rem; padding: 1px 6px; margin-left: 0.4rem; border-radius: 4px;">${badgeText}</span>`;
        }
      }

      const isEnabled = (stream.enabled !== false);
      const isSalaryCard = isPrimarySalary || isSpouseSalary || stream.isSalary || (/lương|salary/i.test(rawName));

      const item = document.createElement("div");
      item.className = "income-item" + (isSalaryCard ? " income-item-salary" : "") + (!isEnabled ? " stream-disabled" : "");
      item.innerHTML = `
        <div class="income-item-header">
          <div style="display: flex; align-items: center; min-width: 0; gap: 0.45rem;">
            <input type="checkbox" class="stream-toggle-chk income-stream-chk" data-idx="${idx}" ${isEnabled ? 'checked' : ''}
              title="${isEnabled ? 'Đang bật • Bấm để tạm tắt nguồn thu này' : 'Đang tắt • Bấm để kích hoạt lại'}"
              style="accent-color: #10b981;">
            <span class="income-item-name" style="${!isEnabled ? 'text-decoration: line-through; opacity: 0.75;' : ''}">${displayName}</span>
            ${badgeHtml}
          </div>
          <div class="income-item-actions">
            <button type="button" class="income-item-btn income-item-edit" data-idx="${idx}" title="Chỉnh sửa nguồn thu">Sửa</button>
            <button type="button" class="income-item-btn income-item-del" data-idx="${idx}" title="Xóa nguồn thu">Xóa</button>
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

    container.querySelectorAll(".income-stream-chk").forEach(chk => {
      chk.addEventListener("change", (e) => {
        e.stopPropagation();
        const idx = Number(chk.getAttribute("data-idx"));
        const plan = getActivePlan();
        if (plan && plan.incomes && plan.incomes[idx]) {
          plan.incomes[idx].enabled = chk.checked;
          savePlansToStorage();
          syncSavingsAndExpensesFromRate(plan);
          if (plan.pensionBaseAuto !== false) {
            syncPensionBaseAuto(plan, true);
          }
          renderIncomeStreamsList();
          renderExpenseStreamsList();
          updateAll();
        }
      });
    });

    container.querySelectorAll(".income-item-edit").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        const idx = Number(btn.getAttribute("data-idx"));
        const plan = getActivePlan();
        const stream = plan.incomes[idx];
        if (stream && stream.isBhxhVn) {
          const panel = document.getElementById("panel-vietnam-bhxh");
          if (panel) {
            panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            panel.style.transition = 'box-shadow 0.3s ease';
            panel.style.boxShadow = '0 0 0 2px #10b981';
            setTimeout(() => { panel.style.boxShadow = ''; }, 1500);
          }
          return;
        }
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
          icon: "",
          title: "Xác nhận xóa nguồn thu",
          message: `Bạn có chắc chắn muốn xóa <strong>"${streamName}"</strong> (${amtStr}/năm)?<br><span style="font-size:0.75rem; color:var(--text-faint); margin-top:6px; display:inline-block;">Các chỉ số chi tiêu, tỷ lệ tiết kiệm và hưu trí sẽ được tự động tính toán lại.</span>`,
          confirmText: "Xóa nguồn thu",
          onConfirm: () => {
            if (stream && stream.isBhxhVn) {
              plan.bhxhVnEnabled = false;
              const chk = document.getElementById("chk-enable-bhxh-vn");
              if (chk) chk.checked = false;
              syncBhxhVnStreams(plan);
              updateBhxhVnUI(plan);
            } else {
              if (stream && (stream.isSpouseSalary || /lương.*(bạn đời|vợ|chồng)/i.test(stream.name || ''))) {
                plan.spouseSalaryRemoved = true;
              } else if (stream && (stream.isPrimarySalary || /lương hiện tại của bạn|lương chính/i.test(stream.name || '') || stream.isSalary)) {
                plan.primarySalaryRemoved = true;
              }
              plan.incomes.splice(idx, 1);
            }
            syncSavingsAndExpensesFromRate(plan);
            if (plan.pensionBaseAuto !== false) {
              syncPensionBaseAuto(plan, true);
            }
            savePlansToStorage();
            renderIncomeStreamsList();
            renderExpenseStreamsList();
            updateAll();
          }
        });
      });
    });
    updateLmnpUI(p);
  }

  function getActiveIncomeAtAge(plan, age) {
    if (!plan) return 0;
    let total = 0;
    if (Array.isArray(plan.incomes)) {
      plan.incomes.forEach(s => {
        if (s.enabled === false) return;
        if (isRealEstateStream(s) && plan.lmnpEnabled === false) return;
        if (age >= s.startAge && age <= s.endAge) {
          const streamGrowth = (Number(s.growth) || 4.0) / 100.0;
          const years = age - s.startAge;
          const val = (Number(s.amount) || 0) * Math.pow(1.0 + streamGrowth, years);
          if (val > 0) {
            total += val;
          }
        }
      });
    }

    // Các khoản chi tiêu âm (hoàn tiền, giảm trừ...) tự động chuyển sang Thu nhập
    if (Array.isArray(plan.expenses)) {
      plan.expenses.forEach(e => {
        if (e.enabled === false) return;
        if (age >= e.startAge && age <= e.endAge) {
          const val = Number(e.amount) || 0;
          if (val < 0) total += Math.abs(val);
        }
      });
    }

    // Trợ cấp gia đình (CAF / Kindergeld / Allocations) chuyển vào Thu nhập
    if (plan.familyPlan && plan.familyPlan.enabled !== false && Number(plan.familyPlan.kidsCount) > 0) {
      const kCount = Number(plan.familyPlan.kidsCount) || 0;
      const curYear = new Date().getFullYear();
      const parentBirth = Number(plan.birthYear) || (curYear - (plan.currentAge || 29));
      const simYr = parentBirth + age;
      const birthYears = [
        Number(plan.familyPlan.kid1Birth) || 2022,
        Number(plan.familyPlan.kid2Birth) || 2025,
        Number(plan.familyPlan.kid3Birth) || 2027,
        Number(plan.familyPlan.kid4Birth) || 2029
      ];
      let depCount = 0;
      for (let k = 0; k < Math.min(kCount, 4); k++) {
        const a = simYr - birthYears[k];
        if (a >= 0 && a < 20) depCount++;
      }
      let cafMonthly = 0;
      if (plan.workCountry === 'FR') {
        if (depCount === 2) cafMonthly = 148;
        else if (depCount === 3) cafMonthly = 338;
        else if (depCount >= 4) cafMonthly = 529;
      } else if (plan.workCountry === 'DE') {
        cafMonthly = depCount * 250;
      } else if (plan.workCountry === 'BE') {
        cafMonthly = depCount * 190;
      }
      total += (cafMonthly * 12);
    }

    // Lương hưu BHXH Việt Nam khi đạt tuổi hưởng
    const isBhxhEnabled = (plan.enableBhxhVn !== false && plan.bhxhVnEnabled !== false);
    if (isBhxhEnabled && plan.bhxhVnDetails && window.TaxOptimizer && window.TaxOptimizer.calculateVietnamBhxhPension) {
      const b1 = plan.bhxhVnDetails.spouse1 || {};
      const userGender = plan.gender || b1.gender || 'male';
      const b1Claim = Number(b1.claimAge) || (userGender === 'female' ? 60 : 62);
      const eurRate = Number(plan.exchangeRateEurVnd) || 27500;
      const conv = (plan.currency === 'VND') ? 1 : eurRate;
      if (age >= b1Claim) {
        const res1 = window.TaxOptimizer.calculateVietnamBhxhPension(b1.monthlySalaryVnd || 0, b1.yearsContributed || 0, userGender, b1Claim);
        total += (res1.annualPensionVnd / conv);
      }
      if (plan.maritalStatus === 'married') {
        const b2 = plan.bhxhVnDetails.spouse2 || {};
        const spouseGender = b2.gender || (userGender === 'female' ? 'male' : 'female');
        const b2Claim = Number(b2.claimAge) || (spouseGender === 'female' ? 60 : 62);
        if (age >= b2Claim) {
          const res2 = window.TaxOptimizer.calculateVietnamBhxhPension(b2.monthlySalaryVnd || 0, b2.yearsContributed || 0, spouseGender, b2Claim);
          total += (res2.annualPensionVnd / conv);
        }
      }
    }

    return total;
  }

  // -------------------------------------------------------------
  // Live Cashflow Balance & Expense Streams Management
  // -------------------------------------------------------------
  function ensureDefaultExpenseStreams(plan) {
    if (!plan) return;

    // Quản lý trọn gói BĐS: Luôn dọn sạch các khoản chi phí nợ vay BĐS khỏi danh mục Chi tiêu
    if (Array.isArray(plan.expenses)) {
      plan.expenses = plan.expenses.filter(e => {
        if (!e || typeof e !== 'object') return false;
        const name = e.name || '';
        if (e.source === 'patrimoine') return false;
        if (name.startsWith('Chi phí BĐS & Crédit:')) return false;
        if (name.startsWith('Trả nợ Crédit: BĐS')) return false;
        if (name.startsWith('Crédit BĐS:')) return false;
        if (name.includes('BĐS Cho thuê LMNP')) return false;
        if (name.includes('Chi tiêu sinh hoạt & Tiện ích')) return false;
        return true;
      });
      return;
    }

    if (plan.expensesInitialized) {
      plan.expenses = [];
      return;
    }

    plan.expenses = [];
    plan.expensesInitialized = true;
    const curAge = Number(plan.currentAge) || 29;
    const cur = state.currency || plan.currency || 'EUR';

    // 1. Thêm khoản trả góp tín dụng mẫu nếu chưa có
    const defaultLoanAmt = cur === 'EUR' ? 570 : (cur === 'USD' ? 650 : 12000000);
    plan.expenses.push({
      name: 'Trả góp Crédit Ngân Hàng',
      amount: defaultLoanAmt * 12,
      startAge: curAge,
      endAge: curAge + 17, // 17 years left
      growth: 0.0,
      isDebt: true,
      enabled: true
    });
  }

  function getActiveExpensesAtAge(plan, age) {
    if (!plan) return 0;
    ensureDefaultExpenseStreams(plan);
    let total = 0;
    if (Array.isArray(plan.expenses)) {
      plan.expenses.forEach(e => {
        if (e.enabled === false) return;
        const start = (e.startAge !== undefined && e.startAge !== null && !isNaN(Number(e.startAge))) ? Number(e.startAge) : (plan.currentAge || 29);
        const end = (e.endAge !== undefined && e.endAge !== null && !isNaN(Number(e.endAge))) ? Number(e.endAge) : 85;
        if (age >= start && age <= end) {
          const growth = (Number(e.growth) || 0) / 100.0;
          const years = age - start;
          const val = (Number(e.amount) || 0) * Math.pow(1.0 + growth, years);
          if (val > 0) {
            total += val;
          }
        }
      });
    } else {
      total += Number(plan.annualExpenses) || 0;
    }

    // Dòng tiền BĐS âm: đưa vào mục chi tiêu
    if (Array.isArray(plan.incomes)) {
      plan.incomes.forEach(s => {
        if (s.enabled === false) return;
        if (isRealEstateStream(s) && plan.lmnpEnabled === false) return;
        if (age >= s.startAge && age <= s.endAge) {
          const streamGrowth = (Number(s.growth) || 0) / 100.0;
          const years = age - s.startAge;
          const val = (Number(s.amount) || 0) * Math.pow(1.0 + streamGrowth, years);
          if (val < 0) {
            total += Math.abs(val);
          }
        }
      });
    }

    // Đóng phí BHXH Việt Nam: đưa vào mục chi tiêu trong giai đoạn đóng
    const isBhxhEnabled = (plan.enableBhxhVn !== false && plan.bhxhVnEnabled !== false);
    if (isBhxhEnabled && plan.bhxhVnDetails) {
      const b1 = plan.bhxhVnDetails.spouse1 || {};
      const userGender = plan.gender || b1.gender || 'male';
      const b1Claim = Number(b1.claimAge) || (userGender === 'female' ? 60 : 62);
      const b1Years = Math.max(0, Number(b1.yearsContributed) || 20);
      const curAge = Number(plan.currentAge) || 29;
      const eurRate = Number(plan.exchangeRateEurVnd) || 27500;
      const conv = (plan.currency === 'VND') ? 1 : eurRate;
      if (age >= curAge && age < (curAge + b1Years) && age < b1Claim) {
        const s1PayVnd = Math.round((Number(b1.monthlySalaryVnd) || 10000000) * 0.22);
        total += ((s1PayVnd * 12) / conv);
      }
      if (plan.maritalStatus === 'married') {
        const b2 = plan.bhxhVnDetails.spouse2 || {};
        const spouseGender = b2.gender || (userGender === 'female' ? 'male' : 'female');
        const b2Claim = Number(b2.claimAge) || (spouseGender === 'female' ? 60 : 62);
        const b2Years = Math.max(0, Number(b2.yearsContributed) || 20);
        if (age >= curAge && age < (curAge + b2Years) && age < b2Claim) {
          const s2PayVnd = Math.round((Number(b2.monthlySalaryVnd) || 10000000) * 0.22);
          total += ((s2PayVnd * 12) / conv);
        }
      }
    }

    // Child lifecycle expense at age (Chi phí nuôi con thực tế)
    if (plan.familyPlan && plan.familyPlan.enabled !== false && Number(plan.familyPlan.kidsCount) > 0) {
      const kCount = Number(plan.familyPlan.kidsCount) || 0;
      const curYear = new Date().getFullYear();
      const parentBirth = Number(plan.birthYear) || (curYear - (plan.currentAge || 29));
      const simYr = parentBirth + age;
      const birthYears = [
        Number(plan.familyPlan.kid1Birth) || 2022,
        Number(plan.familyPlan.kid2Birth) || 2025,
        Number(plan.familyPlan.kid3Birth) || 2027,
        Number(plan.familyPlan.kid4Birth) || 2029
      ];
      const kidCostMonthly = Number(plan.familyPlan.kidCostMonthly) || 350;
      const kidUniMonthly = Number(plan.familyPlan.kidUniMonthly) || 900;

      let childGross = 0;
      for (let k = 0; k < Math.min(kCount, 4); k++) {
        const a = simYr - birthYears[k];
        if (a >= 0 && a < 18) childGross += kidCostMonthly * 12;
        else if (a >= 18 && a <= 23) childGross += kidUniMonthly * 12;
      }
      total += childGross;
    }

    return total;
  }

  function updateCashflowBalanceUI(plan) {
    if (!plan) plan = getActivePlan();
    if (!plan) return;
    const currentAge = Number(plan.currentAge) || 29;
    const grossIncome = getActiveIncomeAtAge(plan, currentAge);

    // Tax estimation
    let estTax = 0;
    if (grossIncome > 0) {
      if (window.TaxOptimizer && window.TaxOptimizer.calculateProgressiveTax) {
        estTax = window.TaxOptimizer.calculateProgressiveTax(grossIncome, plan.taxRegime || 'france_vietnam', {
          customTaxRate: plan.taxRate,
          currency: plan.currency || state.currency,
          exchangeRateEurVnd: 27500
        });
      } else {
        estTax = grossIncome * ((Number(plan.taxRate) || 12) / 100.0) * 0.7;
      }
    }
    const netIncome = Math.max(0, grossIncome - estTax);

    ensureDefaultExpenseStreams(plan);
    const activeExpenses = getActiveExpensesAtAge(plan, currentAge);
    const netSavings = netIncome - activeExpenses;
    const actualSavingsRate = netIncome > 0 ? Math.max(0, Math.min(100, (netSavings / netIncome) * 100)) : 0;
    const expenseRate = netIncome > 0 ? Math.max(0, Math.min(100, (activeExpenses / netIncome) * 100)) : 100;

    plan.annualExpenses = Math.round(activeExpenses);
    plan.annualSavings = Math.round(Math.max(0, netSavings));
    plan.savingsRate = Math.round(actualSavingsRate * 10) / 10;

    // Format helper
    const cur = state.currency;
    const fmt = (v) => window.RetirementEngine.formatCurrency(v, cur);
    const monthlyNetIncome = Math.round(netIncome / 12);
    const monthlyExp = Math.round(activeExpenses / 12);
    const monthlySav = Math.round(netSavings / 12);

    // Update DOM
    const valIncome = document.getElementById("cf-val-income");
    const subIncome = document.getElementById("cf-sub-income");
    const valExp = document.getElementById("cf-val-expense");
    const subExp = document.getElementById("cf-sub-expense");
    const valSav = document.getElementById("cf-val-savings");
    const subSav = document.getElementById("cf-sub-savings");
    const barExp = document.getElementById("cf-bar-expense");
    const barSav = document.getElementById("cf-bar-savings");
    const lblExpPct = document.getElementById("cf-lbl-expense-pct");
    const lblSavPct = document.getElementById("cf-lbl-savings-pct");
    const lblSavingsRate = document.getElementById("lbl-savings-rate");

    if (valIncome) valIncome.innerText = fmt(monthlyNetIncome);
    if (subIncome) subIncome.innerText = `≈ ${fmt(netIncome)}/năm`;
    if (valExp) valExp.innerText = fmt(monthlyExp);
    if (subExp) subExp.innerText = `≈ ${fmt(activeExpenses)}/năm`;

    if (valSav) {
      if (monthlySav >= 0) {
        valSav.innerText = fmt(monthlySav);
        valSav.style.color = "#10b981";
      } else {
        valSav.innerText = `-${fmt(Math.abs(monthlySav))}`;
        valSav.style.color = "#ef4444";
      }
    }
    if (subSav) {
      subSav.innerText = monthlySav >= 0 
        ? `≈ ${fmt(netSavings)}/năm • Tỷ lệ ${plan.savingsRate}%` 
        : `Thâm hụt • -${fmt(Math.abs(netSavings))}/năm`;
    }

    if (barExp) barExp.style.width = `${Math.min(100, Math.max(0, expenseRate))}%`;
    if (barSav) barSav.style.width = `${Math.min(100, Math.max(0, actualSavingsRate))}%`;
    if (lblExpPct) lblExpPct.innerText = `Chi tiêu & Nợ: ${expenseRate.toFixed(1)}%`;
    if (lblSavPct) lblSavPct.innerText = `Tiết kiệm ròng: ${actualSavingsRate.toFixed(1)}%`;

    if (lblSavingsRate) {
      if (monthlySav >= 0) {
        lblSavingsRate.innerText = `Tích lũy: ${plan.savingsRate}%`;
        lblSavingsRate.style.background = "rgba(16, 185, 129, 0.18)";
        lblSavingsRate.style.color = "#34d399";
      } else {
        lblSavingsRate.innerText = `Thâm hụt: -${Math.abs(plan.savingsRate)}%`;
        lblSavingsRate.style.background = "rgba(239, 68, 68, 0.18)";
        lblSavingsRate.style.color = "#f87171";
      }
    }

    // Sync hidden elements for legacy compat
    setVal("inp-savings-rate", plan.savingsRate);
    setVal("inp-monthly-expenses", monthlyExp);
    setVal("inp-monthly-savings", Math.max(0, monthlySav));

    // Update KPI Header Badge
    const kpiRate = document.getElementById("kpi-savings-rate");
    if (kpiRate) {
      kpiRate.innerHTML = `Tỷ lệ tiết kiệm: <strong>${plan.savingsRate}%</strong> (${fmt(Math.max(0, monthlySav))}/tháng)`;
    }
  }

  // Alias for backward compatibility
  function syncSavingsAndExpensesFromRate(plan) {
    updateCashflowBalanceUI(plan);
  }

  function updateSavingsRateUI(rate) {
    const plan = getActivePlan();
    if (plan) updateCashflowBalanceUI(plan);
  }

  function applyProfileVisibilityRules(plan) {
    if (!plan) plan = getActivePlan();
    if (!plan) return;

    const isDomestic = (plan.retireMode === 'domestic' || (plan.workCountry && plan.retireCountry && plan.workCountry === plan.retireCountry) || (plan.workCity && plan.retireCity && plan.workCity === plan.retireCity));
    const cardDualInf = document.getElementById("card-dual-inflation-stream");
    const locRadios = document.getElementById("retire-location-radios");
    const badgeRetirePpp = document.getElementById("badge-retire-ppp");
    if (cardDualInf) {
      cardDualInf.style.display = ""; // Luôn hiển thị thẻ lạm phát trong Cột Chi Tiêu
    }
    if (locRadios) {
      locRadios.style.display = isDomestic ? "none" : "";
    }
    if (badgeRetirePpp) {
      badgeRetirePpp.style.display = isDomestic ? "none" : "";
    }
    updateDualInflationUI(plan);

    // 1. Nhóm Thẻ Đặc thù theo Nơi làm việc & Nơi nghỉ hưu:
    // - Đi làm ở đâu thì hiện thẻ lương hưu của nơi đó.
    // - Nếu nơi làm việc KHÁC nơi nghỉ hưu thì bật cả 2 thẻ lương hưu ở 2 nơi (mỗi thẻ thiết kế riêng cho mỗi nơi).
    const workC = plan.workCountry || 'FR';
    const retireC = plan.retireCountry || plan.workCountry || 'FR';
    const hasFr = (workC === 'FR' || retireC === 'FR');
    const cardFrench = document.getElementById("card-french-pension-stream");
    if (cardFrench) {
      cardFrench.style.display = hasFr ? "" : "none";
    }

    const hasVn = (workC === 'VN' || retireC === 'VN');
    const cardBhxh = document.getElementById("card-bhxh-income-stream");
    if (cardBhxh) {
      cardBhxh.style.display = hasVn ? "" : "none";
    }

    const hasDe = (workC === 'DE' || retireC === 'DE');
    const cardGerman = document.getElementById("card-german-pension-stream");
    if (cardGerman) {
      cardGerman.style.display = hasDe ? "" : "none";
    }

    const hasUs = (workC === 'US' || retireC === 'US');
    const cardUs = document.getElementById("card-us-pension-stream");
    if (cardUs) {
      cardUs.style.display = hasUs ? "" : "none";
    }

    const hasJp = (workC === 'JP' || retireC === 'JP');
    const cardJapan = document.getElementById("card-japan-pension-stream");
    if (cardJapan) {
      cardJapan.style.display = hasJp ? "" : "none";
    }

    const hasCa = (workC === 'CA' || retireC === 'CA');
    const cardCanada = document.getElementById("card-canada-pension-stream");
    if (cardCanada) {
      cardCanada.style.display = hasCa ? "" : "none";
    }

    const hasAu = (workC === 'AU' || retireC === 'AU');
    const cardAustralia = document.getElementById("card-australia-pension-stream");
    if (cardAustralia) {
      cardAustralia.style.display = hasAu ? "" : "none";
    }

    const hasKr = (workC === 'KR' || retireC === 'KR');
    const cardKorea = document.getElementById("card-korea-pension-stream");
    if (cardKorea) {
      cardKorea.style.display = hasKr ? "" : "none";
    }

    const hasTw = (workC === 'TW' || retireC === 'TW');
    const cardTaiwan = document.getElementById("card-taiwan-pension-stream");
    if (cardTaiwan) {
      cardTaiwan.style.display = hasTw ? "" : "none";
    }

    // Khối thông báo minh bạch khi quốc gia chưa có mô hình hưu trí tự động
    const supportedCountryCodes = ['FR', 'VN', 'DE', 'US', 'JP', 'CA', 'AU', 'KR', 'TW'];
    const isSupportedCountry = supportedCountryCodes.includes(workC) || supportedCountryCodes.includes(retireC);
    const calloutUnsupported = document.getElementById("callout-pension-unsupported");
    if (calloutUnsupported) {
      calloutUnsupported.style.display = !isSupportedCountry ? "block" : "none";
      if (!isSupportedCountry) {
        const countryProfile = (window.TaxOptimizer && window.TaxOptimizer.COUNTRY_PPP_PROFILES)
          ? (window.TaxOptimizer.COUNTRY_PPP_PROFILES[plan.workCity || ''] || {})
          : {};
        const countryName = countryProfile.countryLabel || workC;
        const descEl = document.getElementById("lbl-unsupported-pension-desc");
        if (descEl) {
          descEl.innerHTML = `pyRetrait hiện chưa có mô hình tính toán lương hưu tự động theo luật của <strong>${countryName}</strong>. Bạn có thể ước tính riêng và bổ sung trực tiếp khoản lương hưu này vào danh sách Luồng Thu Nhập tùy chỉnh bằng nút <strong>[+ Thêm Thu Nhập]</strong> bên dưới.`;
        }
      }
    }

    // 2. Nhóm Thẻ Chung Toàn Cầu — Luôn Luôn Hiển Thị Cho Mọi Quốc Gia:
    // Con cái, Chi tiêu/tháng khi về hưu, Dự phòng chăm sóc tuổi già (78t+), Kế hoạch thừa kế, Danh mục đầu tư, Chiến lược rút tiền
    const cardLmnp = document.getElementById("card-lmnp-income-stream");
    if (cardLmnp) cardLmnp.style.display = "";

    const cardAssetAlloc = document.getElementById("card-asset-allocation-stream");
    if (cardAssetAlloc) cardAssetAlloc.style.display = "";

    const cardRetireExpense = document.getElementById("card-retire-expense-stream");
    if (cardRetireExpense) cardRetireExpense.style.display = "";

    const cardChildren = document.getElementById("card-children-family-stream");
    if (cardChildren) cardChildren.style.display = "";

    const hintFamily = document.getElementById("hint-stream-family");
    if (hintFamily) {
      hintFamily.style.display = (workC === 'FR') ? "block" : "none";
    }

    const cardSeniorCare = document.getElementById("card-senior-care-stream");
    if (cardSeniorCare) cardSeniorCare.style.display = "";

    const cardEstateLegacy = document.getElementById("card-estate-legacy-combined");
    if (cardEstateLegacy) cardEstateLegacy.style.display = "";

    // Couple vs Single layout for all pension cards
    const isMarried = (plan.maritalStatus === 'married');

    // Hide / Show Spouse birth year in Baseline Parameters Card
    const boxSpouseBirth = document.getElementById("box-spouse-birth-year");
    if (boxSpouseBirth) {
      boxSpouseBirth.style.display = isMarried ? "" : "none";
    }

    // French Pension card: show/hide spouse 2 & full-width single column
    const frenchInputsBody = document.getElementById("french-inputs-body");
    if (frenchInputsBody) {
      const grid = frenchInputsBody.querySelector(".spouse-pension-grid");
      if (grid) {
        if (isMarried) grid.classList.remove("is-single");
        else grid.classList.add("is-single");
      }
      const cols = frenchInputsBody.querySelectorAll(".spouse-col-card");
      if (cols && cols.length >= 2) {
        cols[1].style.display = isMarried ? "" : "none";
      }
    }
    const badgeFrench = document.getElementById("badge-pension-status");
    if (badgeFrench) {
      badgeFrench.innerText = isMarried ? "2 Người (172 Quý)" : "1 Người (172 Quý)";
    }
    const lblFrenchTitle = document.getElementById("lbl-french-pension-total-title");
    if (lblFrenchTitle) {
      lblFrenchTitle.innerText = isMarried ? "Tổng lương hưu Pháp cả hai người:" : "Tổng lương hưu Pháp cá nhân:";
    }

    // BHXH VN card: show/hide spouse 2 & full-width single column
    const bhxhInputsBody = document.getElementById("bhxh-inputs-body");
    if (bhxhInputsBody) {
      const grid = bhxhInputsBody.querySelector(".spouse-pension-grid");
      if (grid) {
        if (isMarried) grid.classList.remove("is-single");
        else grid.classList.add("is-single");
      }
      const cols = bhxhInputsBody.querySelectorAll(".spouse-col-card");
      if (cols && cols.length >= 2) {
        cols[1].style.display = isMarried ? "" : "none";
      }
    }
    const userGender = plan.gender || 'male';
    const isFemale = (userGender === 'female');
    const col1Title = document.getElementById("lbl-bhxh-col-spouse1-title");
    const col2Title = document.getElementById("lbl-bhxh-col-spouse2-title");
    const col1ClaimTitle = document.getElementById("lbl-bhxh-spouse1-claim-title");
    const col2ClaimTitle = document.getElementById("lbl-bhxh-spouse2-claim-title");

    if (col1Title) col1Title.innerText = isFemale ? "Bạn (Nữ — 60t)" : "Bạn (Nam — 62t)";
    if (col2Title) col2Title.innerText = isFemale ? "Bạn đời (Nam — 62t)" : "Bạn đời (Nữ — 60t)";
    if (col1ClaimTitle) col1ClaimTitle.innerText = isFemale ? "Hưu nhận lúc 60t:" : "Hưu nhận lúc 62t:";
    if (col2ClaimTitle) col2ClaimTitle.innerText = isFemale ? "Hưu nhận lúc 62t:" : "Hưu nhận lúc 60t:";

    const badgeBhxh = document.getElementById("badge-bhxh-status");
    if (badgeBhxh) {
      badgeBhxh.innerText = isMarried ? "2 Người (Luật 2024)" : "1 Người (Luật 2024)";
    }
    const lblBhxhTitle = document.getElementById("lbl-bhxh-pension-total-title");
    if (lblBhxhTitle) {
      lblBhxhTitle.innerText = isMarried ? "Tổng lương hưu BHXH cả hai người:" : "Tổng lương hưu BHXH cá nhân:";
    }
    const lblBhxhBenefit = document.getElementById("lbl-bhxh-medical-benefit");
    if (lblBhxhBenefit) {
      lblBhxhBenefit.innerText = isMarried ? "2 Thẻ BHYT miễn phí 95% trọn đời" : "1 Thẻ BHYT miễn phí 95% trọn đời";
    }

    // German Pension card: show/hide spouse 2 & full-width single column
    const germanInputsBody = document.getElementById("german-inputs-body");
    if (germanInputsBody) {
      const grid = germanInputsBody.querySelector(".spouse-pension-grid");
      if (grid) {
        if (isMarried) grid.classList.remove("is-single");
        else grid.classList.add("is-single");
      }
      const cols = germanInputsBody.querySelectorAll(".spouse-col-card");
      if (cols && cols.length >= 2) {
        cols[1].style.display = isMarried ? "" : "none";
      }
    }
    const badgeGerman = document.getElementById("badge-german-status");
    if (badgeGerman) {
      badgeGerman.innerText = isMarried ? "2 Người (GRV)" : "1 Người (GRV)";
    }
    const lblGermanTitle = document.getElementById("lbl-german-pension-total-title");
    if (lblGermanTitle) {
      lblGermanTitle.innerText = isMarried ? "Tổng lương hưu Đức cả hai người:" : "Tổng lương hưu Đức cá nhân:";
    }

    // US Pension card: show/hide spouse 2 & full-width single column
    const usInputsBody = document.getElementById("us-inputs-body");
    if (usInputsBody) {
      const grid = usInputsBody.querySelector(".spouse-pension-grid");
      if (grid) {
        if (isMarried) grid.classList.remove("is-single");
        else grid.classList.add("is-single");
      }
      const cols = usInputsBody.querySelectorAll(".spouse-col-card");
      if (cols && cols.length >= 2) {
        cols[1].style.display = isMarried ? "" : "none";
      }
    }
    const badgeUs = document.getElementById("badge-us-status");
    if (badgeUs) {
      badgeUs.innerText = isMarried ? "2 Người (FRA 67t)" : "1 Người (FRA 67t)";
    }
    const lblUsTitle = document.getElementById("lbl-us-pension-total-title");
    if (lblUsTitle) {
      lblUsTitle.innerText = isMarried ? "Tổng lương hưu Mỹ cả hai người:" : "Tổng lương hưu Mỹ cá nhân:";
    }

    // Japan Pension card: show/hide spouse 2 & full-width single column
    const japanInputsBody = document.getElementById("japan-inputs-body");
    if (japanInputsBody) {
      const grid = japanInputsBody.querySelector(".spouse-pension-grid");
      if (grid) {
        if (isMarried) grid.classList.remove("is-single");
        else grid.classList.add("is-single");
      }
      const cols = japanInputsBody.querySelectorAll(".spouse-col-card");
      if (cols && cols.length >= 2) {
        cols[1].style.display = isMarried ? "" : "none";
      }
    }
    const badgeJapan = document.getElementById("badge-japan-status");
    if (badgeJapan) {
      badgeJapan.innerText = isMarried ? "2 Người (Nenkin)" : "1 Người (Nenkin)";
    }
    const lblJapanTitle = document.getElementById("lbl-japan-pension-total-title");
    if (lblJapanTitle) {
      lblJapanTitle.innerText = isMarried ? "Tổng lương hưu Nhật Bản cả hai người:" : "Tổng lương hưu Nhật Bản cá nhân:";
    }

    // Canada Pension card
    const canadaInputsBody = document.getElementById("canada-inputs-body");
    if (canadaInputsBody) {
      const grid = canadaInputsBody.querySelector(".spouse-pension-grid");
      if (grid) {
        if (isMarried) grid.classList.remove("is-single");
        else grid.classList.add("is-single");
      }
      const cols = canadaInputsBody.querySelectorAll(".spouse-col-card");
      if (cols && cols.length >= 2) {
        cols[1].style.display = isMarried ? "" : "none";
      }
    }
    const badgeCanada = document.getElementById("badge-canada-status");
    if (badgeCanada) {
      badgeCanada.innerText = isMarried ? "2 Người (CPP & OAS)" : "1 Người (CPP & OAS)";
    }
    const lblCanadaTitle = document.getElementById("lbl-canada-pension-total-title");
    if (lblCanadaTitle) {
      lblCanadaTitle.innerText = isMarried ? "Tổng lương hưu Canada cả hai người:" : "Tổng lương hưu Canada cá nhân:";
    }

    // Australia Pension card
    const australiaInputsBody = document.getElementById("australia-inputs-body");
    if (australiaInputsBody) {
      const grid = australiaInputsBody.querySelector(".spouse-pension-grid");
      if (grid) {
        if (isMarried) grid.classList.remove("is-single");
        else grid.classList.add("is-single");
      }
      const cols = australiaInputsBody.querySelectorAll(".spouse-col-card");
      if (cols && cols.length >= 2) {
        cols[1].style.display = isMarried ? "" : "none";
      }
    }
    const badgeAustralia = document.getElementById("badge-australia-status");
    if (badgeAustralia) {
      badgeAustralia.innerText = isMarried ? "2 Người (Super & Age)" : "1 Người (Super & Age)";
    }
    const lblAustraliaTitle = document.getElementById("lbl-australia-pension-total-title");
    if (lblAustraliaTitle) {
      lblAustraliaTitle.innerText = isMarried ? "Tổng lương hưu Úc cả hai người:" : "Tổng lương hưu Úc cá nhân:";
    }

    // South Korea Pension card
    const koreaInputsBody = document.getElementById("korea-inputs-body");
    if (koreaInputsBody) {
      const grid = koreaInputsBody.querySelector(".spouse-pension-grid");
      if (grid) {
        if (isMarried) grid.classList.remove("is-single");
        else grid.classList.add("is-single");
      }
      const cols = koreaInputsBody.querySelectorAll(".spouse-col-card");
      if (cols && cols.length >= 2) {
        cols[1].style.display = isMarried ? "" : "none";
      }
    }
    const badgeKorea = document.getElementById("badge-korea-status");
    if (badgeKorea) {
      badgeKorea.innerText = isMarried ? "2 Người (NPS)" : "1 Người (NPS)";
    }
    const lblKoreaTitle = document.getElementById("lbl-korea-pension-total-title");
    if (lblKoreaTitle) {
      lblKoreaTitle.innerText = isMarried ? "Tổng lương hưu Hàn Quốc cả hai người:" : "Tổng lương hưu Hàn Quốc cá nhân:";
    }

    // Taiwan Pension card
    const taiwanInputsBody = document.getElementById("taiwan-inputs-body");
    if (taiwanInputsBody) {
      const grid = taiwanInputsBody.querySelector(".spouse-pension-grid");
      if (grid) {
        if (isMarried) grid.classList.remove("is-single");
        else grid.classList.add("is-single");
      }
      const cols = taiwanInputsBody.querySelectorAll(".spouse-col-card");
      if (cols && cols.length >= 2) {
        cols[1].style.display = isMarried ? "" : "none";
      }
    }
    const badgeTaiwan = document.getElementById("badge-taiwan-status");
    if (badgeTaiwan) {
      badgeTaiwan.innerText = isMarried ? "2 Người (勞保 & 勞退)" : "1 Người (勞保 & 勞退)";
    }
    const lblTaiwanTitle = document.getElementById("lbl-taiwan-pension-total-title");
    if (lblTaiwanTitle) {
      lblTaiwanTitle.innerText = isMarried ? "Tổng lương hưu Đài Loan cả hai người:" : "Tổng lương hưu Đài Loan cá nhân:";
    }

    // Cập nhật giá trị hiển thị cho các thẻ lương hưu quốc tế qua Event Bus (Loose Coupling)
    if (typeof window !== 'undefined') {
      if (window.AppState && typeof window.AppState.emit === 'function') {
        window.AppState.emit('pension-sync', { plan });
      }
      window.dispatchEvent(new CustomEvent('pyretrait:pension-sync', { detail: { plan } }));
      if (window.Tab3TaxesUI && typeof window.Tab3TaxesUI.updateAllInternationalPensionsUI === 'function') {
        window.Tab3TaxesUI.updateAllInternationalPensionsUI(plan);
      }
    }

    // Callout & Breakdown 7 items calculation
    const derivedBox = document.getElementById("box-cashflow-derived-retire");
    if (derivedBox && window.TaxOptimizer && typeof window.TaxOptimizer.calculateRetireBudgetFromCashflow === 'function') {
      let monthlyIncome = 0;
      let hasCustomIncome = false;
      if (plan.incomes && Array.isArray(plan.incomes)) {
        const preIncomes = plan.incomes.filter(s => s.enabled !== false && !s.isBhxhVn && (!s.toAge || s.toAge <= Number(plan.retirementAge || 60)));
        if (preIncomes.length > 0) {
          monthlyIncome = preIncomes.reduce((sum, s) => sum + (Number(s.amount) || 0) / 12, 0);
          hasCustomIncome = true;
        }
      }

      const monthlySavings = Math.round((Number(plan.annualSavings) || 0) / 12);
      const monthlyMortgage = Number(plan.monthlyMortgagePaidOff) || 0;
      const workCityKey = plan.workCity || 'fr_paris';
      const retireCityKey = plan.retireCity || (plan.retireMode === 'domestic' ? workCityKey : 'vn_hcm_hn');
      const retireMode = plan.retireMode || 'relocate';
      const householdSize = isMarried ? 2 : 1;
      const isDomestic = (plan.retireMode === 'domestic' || workCityKey === retireCityKey || (plan.workCountry && plan.retireCountry && plan.workCountry === plan.retireCountry));

      // Nếu người dùng chưa nhập luồng thu nhập nào, nhưng có nhập chi tiêu hiện tại:
      if (!hasCustomIncome || monthlyIncome <= 0) {
        const annExp = Number(plan.annualExpenses) || 0;
        if (annExp > 0) {
          monthlyIncome = Math.round(annExp / 12) + monthlySavings + monthlyMortgage;
          hasCustomIncome = true;
        }
      }

      const calc = window.TaxOptimizer.calculateRetireBudgetFromCashflow({
        monthlyNetIncome: monthlyIncome,
        monthlySavings: monthlySavings,
        monthlyMortgagePaidOff: monthlyMortgage,
        currentMonthlyLivingFallback: isMarried ? 2700 : 1800,
        workCityKey: workCityKey,
        retireCityKey: retireCityKey,
        retireMode: retireMode,
        householdSize: householdSize
      });

      const cur = state.currency || 'EUR';
      const fmt = (v) => window.RetirementEngine.formatCurrency(v, cur);

      const targetCityProfile = (window.TaxOptimizer.COUNTRY_PPP_PROFILES && window.TaxOptimizer.COUNTRY_PPP_PROFILES[retireCityKey])
        ? window.TaxOptimizer.COUNTRY_PPP_PROFILES[retireCityKey]
        : { label: "Điểm đến", flag: "📍", ppp: 0.45 };
      const targetCityDisplayName = `${targetCityProfile.flag ? targetCityProfile.flag + ' ' : ''}${targetCityProfile.label || targetCityProfile.countryLabel || 'Điểm đến'}`;

      const pppFactor = Number(calc.pppRatio) || 0.45;
      const pppPercentDisplay = Math.round(pppFactor * 100);
      const totalBudget = calc.monthlyRetireTotal || 1;
      const valFood = calc.breakdown?.food || 0;
      const valHousing = calc.breakdown?.housing || 0;
      const valHealth = calc.breakdown?.health || 0;
      const valUtil = calc.breakdown?.utilities || 0;
      const valTrans = calc.breakdown?.transport || 0;
      const valApp = calc.breakdown?.household || 0;
      const valLeisure = Math.max(0, totalBudget - (valFood + valHousing + valHealth + valUtil + valTrans + valApp));

      const bFood = Math.round((valFood / totalBudget) * 100);
      const bHousing = Math.round((valHousing / totalBudget) * 100);
      const bHealth = Math.round((valHealth / totalBudget) * 100);
      const bUtil = Math.round((valUtil / totalBudget) * 100);
      const bTrans = Math.round((valTrans / totalBudget) * 100);
      const bApp = Math.round((valApp / totalBudget) * 100);
      const bLeisure = Math.max(0, 100 - (bFood + bHousing + bHealth + bUtil + bTrans + bApp));

      let leftColHtml = '';
      if (!hasCustomIncome || monthlyIncome <= 0) {
        leftColHtml = `
          <div class="retire-callout-title">
            <span>Gợi ý từ mức sống thực tế (${isMarried ? 'Vợ chồng' : 'Cá nhân'})</span>
          </div>
          <div class="retire-callout-step" style="color: var(--text-muted); font-size: 0.72rem; line-height: 1.4; padding: 0.2rem 0;">
            Chưa có thu nhập trước hưu. pyRetrait áp dụng mức sống tham chiếu tiêu chuẩn tại <strong>${targetCityDisplayName}</strong>:
          </div>
          <div class="retire-callout-step">
            <span>Chi tiêu sinh hoạt ước tính:</span>
            <strong>${fmt(calc.pppAdjustedLiving)}/th</strong>
          </div>
          <div class="retire-callout-step">
            <span>Phụ phí Y tế tuổi già (${householdSize} ng):</span>
            <strong>+ ${fmt(calc.seniorHealthAddon)}/th</strong>
          </div>
          <div class="retire-callout-total clickable" style="margin-top: 0.4rem; cursor: pointer;" title="Nhấp để áp dụng số tiền này vào ngân sách hưu trí" data-apply-retire-budget="${calc.monthlyRetireTotal}">
            <span>Gợi ý ngân sách hưu:</span>
            <strong class="text-success" style="font-size: 0.88rem; text-decoration: underline dotted;">${fmt(calc.monthlyRetireTotal)}/tháng ↵</strong>
          </div>
        `;
      } else {
        const pppStepHtml = isDomestic ? '' : `
          <div class="retire-callout-step">
            <span>Quy đổi sang ${targetCityDisplayName} (${pppPercentDisplay}%):</span>
            <strong>${fmt(calc.pppAdjustedLiving)}/th</strong>
          </div>
        `;
        leftColHtml = `
          <div class="retire-callout-title">
            <span>Gợi ý từ mức sống thực tế (${isMarried ? 'Vợ chồng' : 'Cá nhân'})</span>
          </div>
          <div class="retire-callout-step">
            <span>Thu nhập sau thuế hiện tại:</span>
            <strong>${fmt(monthlyIncome)}/th</strong>
          </div>
          <div class="retire-callout-step">
            <span>Tiết kiệm đầu tư tích lũy:</span>
            <strong class="text-info">- ${fmt(monthlySavings)}/th</strong>
          </div>
          <div class="retire-callout-step">
            <span>Nợ nhà (trả xong trước hưu):</span>
            <strong class="text-warning">- ${fmt(monthlyMortgage)}/th</strong>
          </div>
          <div class="retire-callout-step" style="border-top: 1px dashed var(--border-subtle); padding-top: 0.15rem; margin-top: 0.1rem;">
            <span>Chi tiêu sinh hoạt thực tế:</span>
            <strong>${fmt(calc.currentLivingMonthly)}/th</strong>
          </div>
          ${pppStepHtml}
          <div class="retire-callout-step">
            <span>Phụ phí Y tế tuổi già (${householdSize} ng):</span>
            <strong>+ ${fmt(calc.seniorHealthAddon)}/th</strong>
          </div>
          <div class="retire-callout-total clickable" style="cursor: pointer;" title="Nhấp để áp dụng số tiền này vào ngân sách hưu trí" data-apply-retire-budget="${calc.monthlyRetireTotal}">
            <span>Gợi ý ngân sách hưu:</span>
            <strong class="text-success" style="font-size: 0.88rem; text-decoration: underline dotted;">${fmt(calc.monthlyRetireTotal)}/tháng ↵</strong>
          </div>
        `;
      }

      // Render derivedBox HTML dynamically with accurate figures
      derivedBox.innerHTML = `
        <!-- Cột Trái: Căn Cứ Dòng Tiền Thực Tế -->
        <div class="retire-callout-col">
          ${leftColHtml}
        </div>

        <!-- Cột Phải: Đối Chiếu 3 Mốc & Tỷ Lệ 7 Nhóm -->
        <div class="retire-callout-col retire-callout-col-divider">
          <div class="retire-callout-step clickable" style="cursor: pointer;" title="Nhấp để áp dụng mức Cơ bản vào ngân sách hưu" data-apply-retire-budget="${calc.referenceBenchmarks?.lean || 0}">
            <span>1. Cơ bản:</span>
            <strong class="font-mono" style="text-decoration: underline dotted;">~${fmt(calc.referenceBenchmarks?.lean || 0)} ↵</strong>
          </div>
          <div class="retire-callout-step clickable" style="background: rgba(16, 185, 129, 0.08); padding: 0.15rem 0.35rem; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.25); cursor: pointer;" title="Nhấp để áp dụng mức Thoải mái vào ngân sách hưu" data-apply-retire-budget="${calc.referenceBenchmarks?.standard || 0}">
            <span style="font-weight: 600; color: #10b981;">2. Thoải mái:</span>
            <strong class="font-mono text-success" style="text-decoration: underline dotted;">~${fmt(calc.referenceBenchmarks?.standard || 0)} ↵</strong>
          </div>
          <div class="retire-callout-step clickable" style="cursor: pointer;" title="Nhấp để áp dụng mức Thịnh vượng vào ngân sách hưu" data-apply-retire-budget="${calc.referenceBenchmarks?.fat || 0}">
            <span>3. Thịnh vượng:</span>
            <strong class="font-mono text-warning" style="text-decoration: underline dotted;">~${fmt(calc.referenceBenchmarks?.fat || 0)} ↵</strong>
          </div>
          <div style="font-size: 0.68rem; font-weight: 700; color: var(--text-muted); margin-top: 0.25rem; border-top: 1px dashed var(--border-subtle); padding-top: 0.2rem;">
            Tỷ lệ 7 nhóm chi tiêu gia đình:
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.08rem; font-size: 0.7rem;">
            <div class="retire-callout-step" style="padding: 0.06rem 0;">
              <span>Ăn uống (${bFood}%):</span>
              <strong class="font-mono">~${fmt(valFood)}</strong>
            </div>
            <div class="retire-callout-step" style="padding: 0.06rem 0;">
              <span>Nhà ở (${bHousing}%):</span>
              <strong class="font-mono">~${fmt(valHousing)}</strong>
            </div>
            <div class="retire-callout-step" style="padding: 0.06rem 0;">
              <span>Y tế BHYT (${bHealth}%):</span>
              <strong class="font-mono">~${fmt(valHealth)}</strong>
            </div>
            <div class="retire-callout-step" style="padding: 0.06rem 0;">
              <span>Điện nước (${bUtil}%):</span>
              <strong class="font-mono">~${fmt(valUtil)}</strong>
            </div>
            <div class="retire-callout-step" style="padding: 0.06rem 0;">
              <span>Đi lại (${bTrans}%):</span>
              <strong class="font-mono">~${fmt(valTrans)}</strong>
            </div>
            <div class="retire-callout-step" style="padding: 0.06rem 0;">
              <span>Đồ gia dụng (${bApp}%):</span>
              <strong class="font-mono">~${fmt(valApp)}</strong>
            </div>
            <div class="retire-callout-step" style="padding: 0.06rem 0;">
              <span>Giải trí, du lịch (${bLeisure}%):</span>
              <strong class="font-mono">~${fmt(valLeisure)}</strong>
            </div>
          </div>
        </div>
      `;

      // Gắn sự kiện click để áp dụng số tiền gợi ý ngay lập tức
      derivedBox.querySelectorAll("[data-apply-retire-budget]").forEach(el => {
        el.addEventListener("click", () => {
          const val = Number(el.getAttribute("data-apply-retire-budget"));
          if (!val || isNaN(val) || val <= 0) return;
          const p = getActivePlan();
          p.baseRetireMonthly = Math.round(val);
          const inp = document.getElementById("inp-monthly-retire-expenses");
          if (inp) {
            inp.value = p.baseRetireMonthly;
            inp.style.transition = "box-shadow 0.3s ease, border-color 0.3s ease";
            inp.style.borderColor = "#10b981";
            inp.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.25)";
            setTimeout(() => {
              inp.style.borderColor = "";
              inp.style.boxShadow = "";
            }, 1200);
          }
          updateRetirementLocationUI(p);
          savePlansToStorage();
          updateAll();
        });
      });

      // Cập nhật công thức đối chiếu PPP nằm ở dưới section 3 Giai đoạn
      const pppFormulaContent = document.getElementById("content-retire-ppp-formula");
      if (pppFormulaContent) {
        pppFormulaContent.innerHTML = `
          <div class="formula-tag" style="font-size: 0.65rem; margin-bottom: 0.15rem;">Nguồn dữ liệu &amp; Công thức đối chiếu</div>
          <div style="display: flex; flex-direction: column; gap: 0.12rem; line-height: 1.35;">
            <code>• Chi tiêu hưu trí = ${(!hasCustomIncome || monthlyIncome <= 0)
              ? `Mức sống tham chiếu ${targetCityDisplayName}`
              : (isDomestic ? '(Thu nhập - Tiết kiệm - Nợ nhà)' : `(Thu nhập - Tiết kiệm - Nợ nhà) × PPP (${targetCityDisplayName}: ${pppPercentDisplay}%)`)} + Y tế (${calc.seniorHealthAddon} ${cur === 'EUR' ? '€' : cur})</code>
            <code>• Công thức 3 mốc = Mức sống tham chiếu ${isDomestic ? targetCityDisplayName : 'quy đổi PPP (' + targetCityDisplayName + ')'} × ${isMarried ? '1.6 (hộ 2 người)' : '1.0 (cá nhân 1 người)'}${isDomestic ? '' : ` × ${pppPercentDisplay}%`}</code>
            <code>• Nguồn dữ liệu: Khảo sát mức sống hộ gia đình OECD, INSEE, World Bank${isDomestic ? '' : ' PPP'} &amp; Numbeo 2024</code>
          </div>
        `;
      }
    }
  }

  function updateRetirementLocationRadiosUI(plan) {
    if (!plan) plan = getActivePlan();
    if (!plan) return;
    applyProfileVisibilityRules(plan);
    const inpRetireMonthly = document.getElementById("inp-monthly-retire-expenses");
    const ratios = getRetirementPppRatios(plan);
    const isDomestic = ratios.isDomestic;
    const badgeRetirePpp = document.getElementById("badge-retire-ppp");
    if (badgeRetirePpp) {
      badgeRetirePpp.style.display = isDomestic ? "none" : "";
    }

    const workProfile = ratios.workProfile;
    const retireProfile = ratios.retireProfile;
    const targetCityDisplayName = `${retireProfile.flag ? retireProfile.flag + ' ' : ''}${retireProfile.label || retireProfile.countryLabel || 'Điểm đến'}`;

    const cur = state.currency || 'EUR';
    const curSymbol = cur === 'EUR' ? '€' : (cur === 'USD' ? '$' : '₫');
    const fmt = (v) => window.RetirementEngine.formatCurrency(v, cur);

    // Cập nhật nhãn và phụ đề ô nhập chi phí hưu trí cơ sở
    const lblTitle = document.getElementById("lbl-retire-base-title");
    const lblSub = document.getElementById("lbl-retire-base-subtitle");
    if (lblTitle) {
      if (isDomestic) {
        lblTitle.innerHTML = `Mức chi tiêu khi về hưu (<span id="unit-retire-expenses">${curSymbol}</span>/tháng)`;
      } else {
        lblTitle.innerHTML = `Mức chi cơ sở chuẩn ${workProfile.countryLabel || 'nơi làm việc'} (<span id="unit-retire-expenses">${curSymbol}</span>/tháng)`;
      }
    }
    if (lblSub) {
      if (isDomestic) {
        lblSub.innerText = `Chi tiêu thực tế tại ${retireProfile.label || retireProfile.countryLabel}`;
      } else {
        lblSub.innerText = `Chuẩn nơi chi phí cao nhất`;
      }
    }

    // Cập nhật tiêu đề và badges của 3 nút radio
    const titleFrance = document.getElementById("title-loc-france");
    const titleVietnam = document.getElementById("title-loc-vietnam");
    const titleHybrid = document.getElementById("title-loc-hybrid");
    const badgeFrance = document.getElementById("badge-loc-france");
    const badgeVietnam = document.getElementById("badge-loc-vietnam");
    const badgeHybrid = document.getElementById("badge-loc-hybrid");

    if (titleFrance) titleFrance.innerText = `Nếu ở ${workProfile.countryLabel || 'nơi làm việc'}`;
    if (titleVietnam) titleVietnam.innerText = `Nếu ở ${retireProfile.countryLabel || 'nơi nghỉ hưu'}`;
    if (titleHybrid) titleHybrid.innerText = `Nếu ở song hành ${workProfile.countryLabel || 'Nơi 1'} - ${retireProfile.countryLabel || 'Nơi 2'}`;

    // Xoá 45% và 70% hardcode, chỉ hiển thị tỷ lệ giảm chi phí thực tế
    if (badgeFrance) badgeFrance.innerText = `100% (chuẩn)`;
    if (badgeVietnam) badgeVietnam.innerText = `Giảm ~${ratios.discountRetire}%`;
    if (badgeHybrid) badgeHybrid.innerText = `Giảm ~${ratios.discountHybrid}%`;

    const loc = plan.retirementLocation || 'vietnam';
    const curFactor = ratios.factors[loc] || 1.0;

    let baseMonthly = Number(plan.baseRetireMonthly);
    if (!baseMonthly || isNaN(baseMonthly) || baseMonthly <= 0) {
      const ann = Number(plan.retirementExpenses);
      if (ann > 0) {
        baseMonthly = Math.round((ann / curFactor) / 12);
      } else {
        baseMonthly = isDomestic && (plan.workCountry === 'VN' || plan.retireCountry === 'VN') ? (cur === 'VND' ? 15000000 : 600) : 1000;
      }
      plan.baseRetireMonthly = baseMonthly;
    }
    if (inpRetireMonthly && document.activeElement !== inpRetireMonthly) {
      inpRetireMonthly.value = baseMonthly;
    }

    let activeMonthly, activeAnnual, activeDesc;

    if (isDomestic) {
      activeMonthly = baseMonthly;
      activeAnnual = baseMonthly * 12;
      activeDesc = `chi tiêu tại ${retireProfile.label || retireProfile.countryLabel}`;
      plan.retirementExpenses = activeAnnual;
    } else {
      const monthlyFrance = Math.round(baseMonthly * 1.0);
      const annualFrance = Math.round(baseMonthly * 12 * 1.0);

      const monthlyVietnam = Math.round(baseMonthly * ratios.retireRatio);
      const annualVietnam = Math.round(baseMonthly * 12 * ratios.retireRatio);

      const monthlyHybrid = Math.round(baseMonthly * ratios.hybridRatio);
      const annualHybrid = Math.round(baseMonthly * 12 * ratios.hybridRatio);

      const lblFrance = document.getElementById("label-loc-france");
      const lblVietnam = document.getElementById("label-loc-vietnam");
      const lblHybrid = document.getElementById("label-loc-hybrid");

      if (lblFrance) lblFrance.innerText = `≈ ${fmt(monthlyFrance)}/tháng ≈ ${fmt(annualFrance)}/năm`;
      if (lblVietnam) lblVietnam.innerText = `≈ ${fmt(monthlyVietnam)}/tháng ≈ ${fmt(annualVietnam)}/năm`;
      if (lblHybrid) lblHybrid.innerText = `≈ ${fmt(monthlyHybrid)}/tháng ≈ ${fmt(annualHybrid)}/năm`;

      document.querySelectorAll(".location-radio-item").forEach(item => {
        const radio = item.querySelector("input[type='radio']");
        if (radio && radio.value === loc) {
          radio.checked = true;
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });

      activeMonthly = monthlyVietnam;
      activeAnnual = annualVietnam;
      activeDesc = `chi tiêu tại ${retireProfile.countryLabel || 'nơi nghỉ hưu'}`;
      if (loc === 'france') {
        activeMonthly = monthlyFrance;
        activeAnnual = annualFrance;
        activeDesc = `chi tiêu tại ${workProfile.countryLabel || 'nơi làm việc'}`;
      } else if (loc === 'hybrid') {
        activeMonthly = monthlyHybrid;
        activeAnnual = annualHybrid;
        activeDesc = `Song hành ${workProfile.countryLabel || 'Nơi 1'} - ${retireProfile.countryLabel || 'Nơi 2'}`;
      }
      plan.retirementExpenses = activeAnnual;
    }

    const cardMonthly = document.getElementById("lbl-retire-card-monthly");
    const cardAge = document.getElementById("lbl-retire-card-age-range");
    const cardGrowth = document.getElementById("lbl-retire-card-growth");
    if (cardMonthly) cardMonthly.innerHTML = `${fmt(activeMonthly)}<small>/tháng</small>`;
    if (cardAge) cardAge.innerText = `${plan.retirementAge || 43} – ${plan.lifeExpectancy || 85} tuổi`;
    if (cardGrowth) {
      const infPost = (plan.dualInflation && plan.dualInflation.enabled)
        ? (Number(plan.dualInflation.inflationPost) || 4.0)
        : (Number(plan.inflationRate) || 4.0);
      cardGrowth.innerText = `+${infPost.toFixed(1)}%/năm (Lạm phát)`;
    }

    const hint = document.getElementById("hint-retire-expenses");
    if (hint) {
      const isMarried = (plan.maritalStatus === 'married');
      const householdLabel = isMarried ? "Cặp đôi" : "Cá nhân";
      hint.innerText = `≈ ${fmt(activeAnnual)}/năm • ${householdLabel} ${activeDesc}`;
    }

    // Đồng bộ nút tick checkbox và hiệu ứng làm mờ thẻ Chi tiêu/tháng khi về hưu
    const chkRetireExp = document.getElementById("chk-enable-retire-expense");
    const isRetireExpEnabled = (plan.enableRetirementExpense !== false);
    if (chkRetireExp) {
      chkRetireExp.checked = isRetireExpEnabled;
    }
    const cardRetireExpenseEl = document.getElementById("card-retire-expense-stream");
    if (cardRetireExpenseEl) {
      cardRetireExpenseEl.classList.toggle("stream-disabled", !isRetireExpEnabled);
      if (!isRetireExpEnabled) {
        cardRetireExpenseEl.style.opacity = "0.55";
        cardRetireExpenseEl.style.filter = "grayscale(0.35)";
      } else {
        cardRetireExpenseEl.style.opacity = "";
        cardRetireExpenseEl.style.filter = "";
      }
    }

    // Live calculations for 3-Phase Spending Smile
    const isSmile = plan.spendingPhases && plan.spendingPhases.enabled !== false;
    const gFactor = Number(plan.spendingPhases?.gogoFactor) || 1.15;
    const sFactor = Number(plan.spendingPhases?.slowgoFactor) || 0.90;
    const nFactor = Number(plan.spendingPhases?.nogoFactor) || 0.80;

    const gogoMonthly = Math.round(activeMonthly * gFactor);
    const slowgoMonthly = Math.round(activeMonthly * sFactor);
    const nogoMonthly = Math.round(activeMonthly * nFactor);

    const lblGogo = document.getElementById("lbl-calc-gogo-monthly");
    const lblSlowgo = document.getElementById("lbl-calc-slowgo-monthly");
    const lblNogo = document.getElementById("lbl-calc-nogo-monthly");
    const badgeSmile = document.getElementById("badge-card-smile-status");
    const badgeGogo = document.getElementById("badge-calc-gogo");
    const badgeSlowgo = document.getElementById("badge-calc-slowgo");
    const badgeNogo = document.getElementById("badge-calc-nogo");
    const lblGogoAge = document.getElementById("lbl-calc-gogo-age");
    const lblSlowgoAge = document.getElementById("lbl-calc-slowgo-age");
    const lblNogoAge = document.getElementById("lbl-calc-nogo-age");

    const formatDiff = (f) => {
      const pct = Math.round((f - 1.0) * 100);
      return pct >= 0 ? `+${pct}%` : `${pct}%`;
    };

    if (lblGogo) lblGogo.innerText = `~${fmt(gogoMonthly)}/th`;
    if (lblSlowgo) lblSlowgo.innerText = `~${fmt(slowgoMonthly)}/th`;
    if (lblNogo) lblNogo.innerText = `~${fmt(nogoMonthly)}/th`;

    const gAgeVal = Number(plan.spendingPhases?.gogoAge) || 60;
    const sAgeVal = Number(plan.spendingPhases?.slowgoAge) || 75;
    if (lblGogoAge) lblGogoAge.innerText = `Đến ${gAgeVal} tuổi:`;
    if (lblSlowgoAge) lblSlowgoAge.innerText = `${gAgeVal + 1} - ${sAgeVal} tuổi:`;
    if (lblNogoAge) lblNogoAge.innerText = `Từ ${sAgeVal + 1} tuổi+:`;

    if (badgeGogo) badgeGogo.innerText = formatDiff(gFactor);
    if (badgeSlowgo) badgeSlowgo.innerText = formatDiff(sFactor);
    if (badgeNogo) badgeNogo.innerText = formatDiff(nFactor);

    if (badgeSmile) {
      if (isSmile) {
        badgeSmile.innerText = `Bật: Go-Go (${formatDiff(gFactor)}) • Slow-Go (${formatDiff(sFactor)}) • No-Go (${formatDiff(nFactor)})`;
        badgeSmile.className = "field-badge text-success";
      } else {
        badgeSmile.innerText = "Đang tắt (Chi tiêu phẳng)";
        badgeSmile.className = "field-badge text-muted";
      }
    }
  }

  function updateExpenseSavingsHints(plan) {
    if (!plan) plan = getActivePlan();
    updateRetirementLocationRadiosUI(plan);
  }

  function renderExpensePeriodsSummary(plan) {
    const box = document.getElementById("expense-periods-box");
    const container = document.getElementById("expense-periods-container");
    const countEl = document.getElementById("expense-periods-count");
    if (!container || !box) return;

    if (!Array.isArray(plan.expenses) || plan.expenses.length === 0) {
      box.style.display = "none";
      return;
    }

    const curAge = Number(plan.currentAge) || 29;
    const maxAge = Number(plan.lifeExpectancy) || 85;
    const curYear = new Date().getFullYear();
    const bYear = Number(plan.birthYear) || (curYear - curAge);

    // Chi tiêu sinh hoạt khi về hưu (retirementExpenses, đã quy đổi lạm phát tới tuổi nghỉ hưu)
    const retireAgeExp = Number(plan.retirementAge) || 42;
    // Từ tuổi nghỉ hưu, engine chỉ tính: Chi tiêu khi về hưu + các khoản nợ.
    // Các luồng chi tiêu thường (không phải nợ) chỉ áp dụng đến (tuổi nghỉ hưu - 1).
    const allExpenses = [];
    plan.expenses.forEach(e => {
      if (e.enabled === false) return;
      allExpenses.push(e);
    });

    const retireBase = (plan.enableRetirementExpense !== false) ? (Number(plan.retirementExpenses) || 0) : 0;
    const isSmile = plan.spendingPhases && plan.spendingPhases.enabled !== false;
    const gAge = Number(plan.spendingPhases?.gogoAge) || 60;
    const gFactor = Number(plan.spendingPhases?.gogoFactor) || 1.15;
    const sAge = Number(plan.spendingPhases?.slowgoAge) || 75;
    const sFactor = Number(plan.spendingPhases?.slowgoFactor) || 0.90;
    const nFactor = Number(plan.spendingPhases?.nogoFactor) || 0.80;

    if (retireBase > 0 && retireAgeExp <= maxAge) {
      const infPre = (plan.dualInflation && plan.dualInflation.enabled)
        ? (Number(plan.dualInflation.inflationPre) || 2.2)
        : (Number(plan.inflationRate) || 4.0);
      const infPost = (plan.dualInflation && plan.dualInflation.enabled)
        ? (Number(plan.dualInflation.inflationPost) || 4.0)
        : (Number(plan.inflationRate) || 4.0);

      const yearsToRetire = Math.max(0, retireAgeExp - curAge);
      const inflatedBaseAtRetire = retireBase * Math.pow(1.0 + infPre / 100.0, yearsToRetire);

      if (isSmile) {
        // Phân rã thành 3 giai đoạn: Go-Go, Slow-Go, No-Go
        // 1. Giai đoạn Go-Go: từ retireAgeExp đến gAge
        if (retireAgeExp <= gAge) {
          const diffPct = Math.round((gFactor - 1.0) * 100);
          const diffStr = diffPct >= 0 ? `+${diffPct}%` : `${diffPct}%`;
          allExpenses.push({
            name: `Chi tiêu Hưu trí • Go-Go (${diffStr})`,
            amount: inflatedBaseAtRetire * gFactor,
            startAge: retireAgeExp,
            endAge: Math.min(gAge, maxAge),
            growth: infPost
          });
        }
        // 2. Giai đoạn Slow-Go: từ max(retireAgeExp, gAge + 1) đến sAge
        const startSlow = Math.max(retireAgeExp, gAge + 1);
        if (startSlow <= Math.min(sAge, maxAge)) {
          const yearsFromRetireToSlow = Math.max(0, startSlow - retireAgeExp);
          const inflatedAtSlow = inflatedBaseAtRetire * Math.pow(1.0 + infPost / 100.0, yearsFromRetireToSlow);
          const diffPct = Math.round((sFactor - 1.0) * 100);
          const diffStr = diffPct >= 0 ? `+${diffPct}%` : `${diffPct}%`;
          allExpenses.push({
            name: `Chi tiêu Hưu trí • Slow-Go (${diffStr})`,
            amount: inflatedAtSlow * sFactor,
            startAge: startSlow,
            endAge: Math.min(sAge, maxAge),
            growth: infPost
          });
        }
        // 3. Giai đoạn No-Go: từ max(retireAgeExp, sAge + 1) đến maxAge
        const startNo = Math.max(retireAgeExp, sAge + 1);
        if (startNo <= maxAge) {
          const yearsFromRetireToNo = Math.max(0, startNo - retireAgeExp);
          const inflatedAtNo = inflatedBaseAtRetire * Math.pow(1.0 + infPost / 100.0, yearsFromRetireToNo);
          const diffPct = Math.round((nFactor - 1.0) * 100);
          const diffStr = diffPct >= 0 ? `+${diffPct}%` : `${diffPct}%`;
          allExpenses.push({
            name: `Chi tiêu Hưu trí • No-Go (${diffStr})`,
            amount: inflatedAtNo * nFactor,
            startAge: startNo,
            endAge: maxAge,
            growth: infPost
          });
        }
      } else {
        allExpenses.push({
          name: "Chi tiêu/tháng khi về hưu",
          amount: inflatedBaseAtRetire,
          startAge: retireAgeExp,
          endAge: maxAge,
          growth: infPost
        });
      }
    }

    const seniorCareMonthly = Number(plan.seniorCareMonthly) || 0;
    const seniorCareAge = Number(plan.seniorCareAge) || 78;
    if (seniorCareMonthly > 0 && plan.enableSeniorCare !== false && seniorCareAge <= maxAge) {
      const infPre = (plan.dualInflation && plan.dualInflation.enabled) ? (Number(plan.dualInflation.inflationPre) || 2.2) : (Number(plan.inflationRate) || 4.0);
      const infPost = (plan.dualInflation && plan.dualInflation.enabled) ? (Number(plan.dualInflation.inflationPost) || 4.0) : (Number(plan.inflationRate) || 4.0);
      const yearsToCare = Math.max(0, seniorCareAge - curAge);
      allExpenses.push({
        name: "Dự phòng Chăm sóc Tuổi Già (78t+)",
        amount: seniorCareMonthly * 12 * Math.pow(1.0 + infPre / 100.0, yearsToCare),
        startAge: seniorCareAge,
        endAge: maxAge,
        growth: infPost
      });
    }

    // Kế Hoạch Con Cái & Gia Đình (0 - 18t nuôi con, 18 - 23t đại học)
    if (plan.familyPlan && plan.familyPlan.enabled !== false && Number(plan.familyPlan.kidsCount) > 0) {
      const kCount = Number(plan.familyPlan.kidsCount) || 0;
      const birthYears = [
        Number(plan.familyPlan.kid1Birth) || 2022,
        Number(plan.familyPlan.kid2Birth) || 2025,
        Number(plan.familyPlan.kid3Birth) || 2027,
        Number(plan.familyPlan.kid4Birth) || 2029
      ];
      const kidCostMonthly = Number(plan.familyPlan.kidCostMonthly) || 350;
      const kidUniMonthly = Number(plan.familyPlan.kidUniMonthly) || 900;
      const parentBirth = Number(plan.birthYear) || (curYear - curAge);

      for (let k = 1; k <= Math.min(kCount, 4); k++) {
        const kBirth = birthYears[k - 1];
        const parentAgeAtStart = Math.max(curAge, kBirth - parentBirth);
        const parentAgeAtUni = Math.max(curAge, (kBirth + 18) - parentBirth);
        const parentAgeAtEnd = (kBirth + 23) - parentBirth;

        if (parentAgeAtStart < parentAgeAtUni && parentAgeAtStart <= maxAge) {
          allExpenses.push({
            name: `Nuôi con thứ ${k} (0–18 tuổi)`,
            amount: kidCostMonthly * 12,
            startAge: parentAgeAtStart,
            endAge: Math.min(parentAgeAtUni - 1, maxAge),
            growth: 0
          });
        }
        if (parentAgeAtUni <= parentAgeAtEnd && parentAgeAtUni <= maxAge) {
          allExpenses.push({
            name: `Đại học con thứ ${k} (18–23 tuổi)`,
            amount: kidUniMonthly * 12,
            startAge: parentAgeAtUni,
            endAge: Math.min(parentAgeAtEnd, maxAge),
            growth: 0
          });
        }
      }
    }

    // Collect all transition ages
    const ageSet = new Set([curAge, maxAge]);
    allExpenses.forEach(e => {
      if (e.enabled === false) return;
      const s = Number(e.startAge) || curAge;
      const end = Number(e.endAge) || maxAge;
      if (s >= curAge && s <= maxAge) ageSet.add(s);
      if (end >= curAge && end < maxAge) ageSet.add(end + 1);
    });

    const ages = Array.from(ageSet).sort((a, b) => a - b);
    if (ages.length <= 1) {
      box.style.display = "none";
      return;
    }

    box.style.display = "block";
    container.innerHTML = "";
    const cur = state.currency;
    const fmt = (v) => window.RetirementEngine.formatCurrency(v, cur);

    const periodsData = [];
    for (let i = 0; i < ages.length - 1; i++) {
      const fromAge = ages[i];
      const toAge = ages[i + 1] - 1;
      if (fromAge > toAge) continue;

      let totalAnnualStart = 0;
      let totalAnnualEnd = 0;
      const expenseBreakdown = [];

      allExpenses.forEach(e => {
        if (e.enabled === false) return;
        const s = Number(e.startAge) || curAge;
        const end = Number(e.endAge) || maxAge;
        if (fromAge <= end && toAge >= s) {
          const g = (Number(e.growth) || 0) / 100.0;
          const yearsStart = Math.max(0, fromAge - s);
          const yearsEnd = Math.max(0, toAge - s);
          const annualStart = Math.round((Number(e.amount) || 0) * Math.pow(1.0 + g, yearsStart));
          const annualEnd = Math.round((Number(e.amount) || 0) * Math.pow(1.0 + g, yearsEnd));

          totalAnnualStart += annualStart;
          totalAnnualEnd += annualEnd;

          expenseBreakdown.push({
            name: e.name,
            annualStart,
            annualEnd,
            monthlyStart: Math.round(annualStart / 12),
            monthlyEnd: Math.round(annualEnd / 12)
          });
        }
      });

      const isCurrent = (curAge >= fromAge && curAge <= toAge);

      periodsData.push({
        fromAge,
        toAge,
        startYear: bYear + fromAge,
        endYear: bYear + toAge,
        isCurrent,
        totalAnnualStart,
        totalAnnualEnd,
        totalMonthlyStart: Math.round(totalAnnualStart / 12),
        totalMonthlyEnd: Math.round(totalAnnualEnd / 12),
        expenses: expenseBreakdown
      });
    }

    if (countEl) countEl.innerText = `${periodsData.length} giai đoạn`;

    container.innerHTML = periodsData.map(p => {
      const isZero = p.totalMonthlyStart === 0;
      const borderColor = p.isCurrent ? '#f43f5e' : 'rgba(244, 63, 94, 0.4)';
      const badgeBg = p.isCurrent ? 'rgba(244, 63, 94, 0.18)' : 'rgba(255, 255, 255, 0.05)';
      const badgeColor = p.isCurrent ? '#fb7185' : 'var(--text-main)';

      const hasGrowth = p.totalAnnualStart !== p.totalAnnualEnd;
      const monthlyStr = hasGrowth
        ? `${fmt(p.totalMonthlyStart)} - ${fmt(p.totalMonthlyEnd)}/tháng`
        : `${fmt(p.totalMonthlyStart)}/tháng`;
      const annualStr = hasGrowth
        ? `≈ ${fmt(p.totalAnnualStart)} - ${fmt(p.totalAnnualEnd)}/năm`
        : `≈ ${fmt(p.totalAnnualStart)}/năm`;

      const expensesHtml = p.expenses.length > 0
        ? p.expenses.map(e => {
            const eGrowth = e.annualStart !== e.annualEnd;
            const eText = eGrowth
              ? `${fmt(e.monthlyStart)} - ${fmt(e.monthlyEnd)}/tháng`
              : `${fmt(e.monthlyStart)}/tháng`;
            return `
              <span class="period-chip expense-period-chip">
                ${escapeHtml(e.name)}: <strong>${eText}</strong>
              </span>
            `;
          }).join("")
        : `<span style="font-size: 0.72rem; color: var(--text-faint); font-style: italic;">Không có khoản chi phát sinh</span>`;

      return `
        <div class="expense-period-card" style="border-left-color: ${borderColor};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
              <span class="badge" style="background: transparent; color: ${badgeColor}; font-weight: 700; font-size: 0.76rem; padding: 0.15rem 0;">
                ${p.fromAge} – ${p.toAge} tuổi
              </span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">
                (${p.startYear} – ${p.endYear})
              </span>
              ${p.isCurrent ? '<span class="badge current-phase-badge">Hiện tại</span>' : ''}
            </div>
            <div style="text-align: right; margin-left: auto;">
              <span class="font-mono" style="font-size: 0.95rem; font-weight: 800; color: ${isZero ? 'var(--text-faint)' : '#f43f5e'};">
                ${isZero ? '0' : monthlyStr}
              </span>
              <span style="font-size: 0.72rem; color: var(--text-faint); display: block;">
                ${annualStr}
              </span>
            </div>
          </div>
          <div class="period-card-streams">
            ${expensesHtml}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderExpenseStreamsList() {
    const container = document.getElementById("expense-streams-container");
    if (!container) return;
    container.innerHTML = "";
    const p = getActivePlan();
    ensureDefaultExpenseStreams(p);

    renderExpensePeriodsSummary(p);

    if (!Array.isArray(p.expenses) || p.expenses.length === 0) {
      container.innerHTML = `<div style="font-size:0.78rem;color:var(--text-faint);padding:0.5rem 0;">Chưa có khoản chi nào. Bấm "+ Thêm khoản chi" hoặc "Lấy Nợ BĐS" để thêm.</div>`;
      return;
    }

    const cur = state.currency;
    const fmt = (v) => window.RetirementEngine.formatCurrency(v, cur);

    p.expenses.forEach((stream, idx) => {
      const isEnabled = (stream.enabled !== false);
      const cleanName = (stream.name || '').replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
      const item = document.createElement("div");
      item.className = "expense-item" + (!isEnabled ? " stream-disabled" : "");
      const monthlyAmt = Math.round(Number(stream.amount) / 12);

      item.innerHTML = `
        <div class="expense-item-header">
          <div class="expense-item-name" style="display: flex; align-items: center; min-width: 0; gap: 0.45rem;">
            <input type="checkbox" class="stream-toggle-chk expense-stream-chk" data-idx="${idx}" ${isEnabled ? 'checked' : ''}
              title="${isEnabled ? 'Đang bật • Bấm để tạm tắt khoản chi này' : 'Đang tắt • Bấm để kích hoạt lại'}"
              style="accent-color: #f43f5e;">
            <span style="${!isEnabled ? 'text-decoration: line-through; opacity: 0.75;' : ''}">${cleanName}</span>
          </div>
          <div class="income-item-actions">
            <button type="button" class="income-item-btn expense-item-edit" data-idx="${idx}" title="Chỉnh sửa khoản chi">Sửa</button>
            <button type="button" class="income-item-btn income-item-del expense-item-del" data-idx="${idx}" title="Xóa khoản chi">Xóa</button>
          </div>
        </div>
        <div class="expense-item-body">
          <div class="income-item-amounts">
            <span class="expense-amount-monthly">${fmt(monthlyAmt)}<small>/tháng</small></span>
            <span class="expense-amount-annual">≈ ${fmt(stream.amount)}/năm</span>
            ${stream.note ? `<span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 0.2rem; font-weight: 500;">(${stream.note})</span>` : ''}
          </div>
          <div class="expense-item-timing" style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem;">
            <span class="income-age-range">${stream.startAge} - ${stream.endAge} tuổi</span>
            ${Number(stream.growth) !== 0 ? `<span class="expense-growth-badge">+${stream.growth}%/năm</span>` : ''}
          </div>
        </div>
      `;
      container.appendChild(item);
    });

    container.querySelectorAll(".expense-stream-chk").forEach(chk => {
      chk.addEventListener("change", (e) => {
        e.stopPropagation();
        const idx = Number(chk.getAttribute("data-idx"));
        const plan = getActivePlan();
        if (plan && plan.expenses && plan.expenses[idx]) {
          plan.expenses[idx].enabled = chk.checked;
          savePlansToStorage();
          renderExpenseStreamsList();
          renderIncomeStreamsList();
          updateCashflowBalanceUI(plan);
          updateAll();
        }
      });
    });

    container.querySelectorAll(".expense-item-edit").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        const idx = Number(btn.getAttribute("data-idx"));
        const plan = getActivePlan();
        const stream = plan.expenses[idx];
        if (stream && stream.isBhxhVn) {
          const panel = document.getElementById("card-bhxh-income-stream");
          if (panel) {
            panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            panel.style.transition = 'box-shadow 0.3s ease';
            panel.style.boxShadow = '0 0 0 2px #10b981';
            setTimeout(() => { panel.style.boxShadow = ''; }, 1500);
            const body = document.getElementById("bhxh-inputs-body");
            if (body && body.style.display === "none") {
              body.style.display = "block";
              const btn = document.getElementById("btn-edit-bhxh-stream");
              if (btn) btn.innerText = "Sửa";
            }
          }
          return;
        }
        openExpenseModal(idx);
      });
    });

    container.querySelectorAll(".expense-item-del").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        const idx = Number(btn.getAttribute("data-idx"));
        const plan = getActivePlan();
        const stream = plan.expenses[idx];
        const streamName = stream?.name || "khoản chi này";
        const amtStr = fmt(stream?.amount || 0);

        showConfirmDialog({
          icon: "",
          title: "Xác nhận xóa khoản chi",
          message: `Bạn có chắc chắn muốn xóa <strong>"${streamName}"</strong> (${amtStr}/năm)?<br><span style="font-size:0.75rem; color:var(--text-faint); margin-top:6px; display:inline-block;">Các chỉ số chi tiêu, tiết kiệm ròng và FIRE sẽ được cập nhật tự động.</span>`,
          confirmText: "Xóa khoản chi",
          onConfirm: () => {
            if (stream && stream.isBhxhVn) {
              plan.bhxhVnEnabled = false;
              const chk = document.getElementById("chk-enable-bhxh-vn");
              if (chk) chk.checked = false;
              syncBhxhVnStreams(plan);
              updateBhxhVnUI(plan);
            } else {
              plan.expenses.splice(idx, 1);
              plan.expensesInitialized = true;
            }
            savePlansToStorage();
            renderExpenseStreamsList();
            renderIncomeStreamsList();
            updateCashflowBalanceUI(plan);
            updateAll();
          }
        });
      });
    });
  }


  // -------------------------------------------------------------
  // TAB 1 / Global: Update Withdrawal Strategy Cards & SWR
  // -------------------------------------------------------------
  function updateWithdrawalStrategyCards(plan) {
    const cardWithdrawal = document.getElementById("card-withdrawal-strategy-controls");
    if (!cardWithdrawal) return;
    try {
      if (!plan) plan = getActivePlan();
      const chosenStrat = plan.withdrawalStrategy || 'guyton_klinger';

      const strategies = [
        { key: "guyton_klinger", name: "Lan can Guyton-Klinger (Khuyên dùng)", color: "#10b981" },
        { key: "bengen_4pct", name: "Quy tắc 4% Cố định (Bengen)", color: "#3b82f6" },
        { key: "vpw", name: "Tỷ lệ Thay đổi (VPW)", color: "#8b5cf6" },
        { key: "fixed_pct", name: "Tỷ lệ Cố định (Fixed %)", color: "#f59e0b" }
      ];

      function hexToRgba(hex, alpha) {
        const h = hex.replace('#', '');
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }

      // Update embedded KPIs in each Strategy Card directly
      const lifeExp = plan.lifeExpectancy || 85;
      document.querySelectorAll(".lbl-life-exp-target").forEach(el => el.innerText = lifeExp);

      strategies.forEach(s => {
        // Khi so sánh các trường phái rút tiền, tính theo công thức thuần túy của từng chiến lược để thấy rõ sự khác biệt
        const p = { ...plan, withdrawalStrategy: s.key, smartWithdrawalCap: false };
        const r = window.RetirementEngine.runProjection(p);
        const isChosen = (s.key === chosenStrat);

        // Update KPIs
        const balEl = document.getElementById(`stat-bal-${s.key}`);
        const survEl = document.getElementById(`stat-surv-${s.key}`);
        const stabEl = document.getElementById(`stat-stab-${s.key}`);
        if (balEl) balEl.innerText = window.RetirementEngine.formatCurrency(r.finalPortfolio, state.currency);
        if (survEl) {
          survEl.innerText = r.survived ? "100% Sống sót" : "Có rủi ro cạn vốn";
          survEl.className = r.survived ? "text-success font-semibold" : "text-danger font-semibold";
        }
        if (stabEl) {
          stabEl.innerText = s.key === 'bengen_4pct' ? 'Cao' : s.key === 'guyton_klinger' ? 'Rất Cao' : s.key === 'vpw' ? 'Linh hoạt' : 'Biến động';
        }

        // Active state on card
        const cardEl = document.getElementById(`card-strat-${s.key}`);
        if (cardEl) {
          cardEl.classList.toggle('selected', isChosen);
        }
        const badgeEl = document.getElementById(`status-strat-${s.key}`);
        if (badgeEl) {
          if (isChosen) {
            badgeEl.innerText = "Đang chọn";
            badgeEl.style.background = "rgba(16, 185, 129, 0.15)";
            badgeEl.style.color = "#10b981";
            badgeEl.style.borderColor = "rgba(16, 185, 129, 0.3)";
          } else {
            badgeEl.innerText = s.key === "guyton_klinger" ? "Khuyên dùng" : s.key === "bengen_4pct" ? "Cố định" : s.key === "vpw" ? "Linh hoạt" : "Bảo toàn";
            badgeEl.style.background = "";
            badgeEl.style.color = "";
            badgeEl.style.borderColor = "";
          }
        }
      });

      // Update Radio Checked state
      const targetRadio = document.querySelector(`input[name='withdrawal-strategy'][value='${chosenStrat}']`);
      if (targetRadio) targetRadio.checked = true;

      // Update Top Badge & Active Status
      const isEnabled = plan.enableWithdrawalStrategy !== false;
      const isSmartCap = plan.smartWithdrawalCap !== false;
      const chkWithdrawal = document.getElementById("chk-enable-withdrawal-strategy");
      if (chkWithdrawal) chkWithdrawal.checked = isEnabled;
      const chkSmartCap = document.getElementById("chk-smart-withdrawal-cap");
      if (chkSmartCap) chkSmartCap.checked = isSmartCap;

      const topBadge = document.getElementById("badge-chosen-strategy");
      const chosenObj = strategies.find(s => s.key === chosenStrat) || strategies[0];
      if (topBadge) {
        if (isEnabled) {
          topBadge.innerText = isSmartCap ? `${chosenObj.name} • Smart Cap` : chosenObj.name;
          topBadge.style.color = chosenObj.color;
          topBadge.style.borderColor = hexToRgba(chosenObj.color, 0.4);
          topBadge.style.background = hexToRgba(chosenObj.color, 0.15);
        } else {
          topBadge.innerText = "Rút theo thực tế";
          topBadge.style.color = "var(--text-faint)";
          topBadge.style.borderColor = "var(--border-subtle)";
          topBadge.style.background = "rgba(148, 163, 184, 0.1)";
        }
      }

      // Update SWR slider
      const swrVal = (plan.initialWithdrawalRate || 4.0).toFixed(1);
      const swrSlider = document.getElementById("inp-initial-swr");
      if (swrSlider) swrSlider.value = swrVal;
      const swrDisp = document.getElementById("val-initial-swr");
      if (swrDisp) swrDisp.innerText = swrVal;

      // Update Card Header & Summary indicators
      const lblSwr = document.getElementById("lbl-strategy-card-swr");
      if (lblSwr) {
        if (isEnabled) {
          lblSwr.innerHTML = `${swrVal}% SWR<small id="lbl-strategy-card-annual"> • ≈ ${window.RetirementEngine.formatCurrency(plan.retirementExpenses || 0, state.currency)}/năm</small>`;
          lblSwr.style.color = chosenObj.color;
        } else {
          lblSwr.innerHTML = `<span style="color: var(--text-faint);">Tắt chiến lược</span><small id="lbl-strategy-card-annual"> • Rút theo chi tiêu</small>`;
          lblSwr.style.color = "var(--text-faint)";
        }
      }
      const lblName = document.getElementById("lbl-strategy-card-name");
      if (lblName) {
        if (isEnabled) {
          const capText = isSmartCap ? ' • Có Smart Cap bảo vệ' : ' • Cố định';
          lblName.innerText = `${chosenObj.name}${capText}`;
        } else {
          lblName.innerText = `Chưa kích hoạt chiến lược rút tiền • Danh mục chỉ bù đắp chi tiêu sinh hoạt`;
        }
      }
      const lblAge = document.getElementById("lbl-strategy-card-age");
      if (lblAge) {
        lblAge.innerText = `Từ ${plan.retirementAge || 43} tuổi trở đi`;
      }
      const lblSurv = document.getElementById("lbl-strategy-card-survival");
      if (lblSurv) {
        const pChosen = { ...plan, withdrawalStrategy: chosenStrat };
        const rChosen = window.RetirementEngine.runProjection(pChosen);
        lblSurv.innerText = rChosen.survived ? "100% Sống sót" : "Có rủi ro cạn vốn";
        lblSurv.style.background = rChosen.survived ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)";
        lblSurv.style.color = rChosen.survived ? "#34d399" : "#fb7185";
      }

      // Kiểm tra và hiển thị Cảnh báo Rút dư thừa (Smart Warning Callout)
      const calloutExcess = document.getElementById("callout-excess-withdrawal-warning");
      const lblExcessText = document.getElementById("lbl-excess-warning-text");
      if (calloutExcess && lblExcessText) {
        if (isEnabled && !isSmartCap) {
          try {
            const pNoCap = { ...plan, enableWithdrawalStrategy: true, smartWithdrawalCap: false };
            const rNoCap = window.RetirementEngine.runProjection(pNoCap);
            const retAge = Number(plan.retirementAge) || 43;
            const firstRetYear = rNoCap.timeline ? rNoCap.timeline.find(row => row.age === retAge && row.isRetired) : null;
            if (firstRetYear) {
              const actualWith = firstRetYear.withdrawal || 0;
              const curExp = firstRetYear.expenses || 0;
              const incTax = Math.max(0, (firstRetYear.income || 0) - (firstRetYear.tax || 0));
              const deficit = Math.max(0, curExp - incTax);
              const excess = actualWith - deficit;
              if (excess > 500) {
                calloutExcess.style.display = "block";
                const fmt = window.RetirementEngine.formatCurrency;
                const cur = state.currency;
                lblExcessText.innerHTML = `Chiến lược SWR đang rút <strong>${fmt(actualWith, cur)}/năm</strong>, trong khi nhờ có lương hưu và thu nhập khác, bạn thực tế chỉ cần bù đắp <strong>${fmt(deficit, cur)}/năm</strong>. Khoản rút thừa <strong>${fmt(excess, cur)}/năm</strong> làm danh mục vơi đi nhanh chóng và khiến <strong>Tỷ lệ thành công Monte Carlo sụt giảm</strong>. Hãy bật lại <em>"Rút Thông Minh (Smart Cap)"</em> bên dưới để tối ưu.`;
              } else {
                calloutExcess.style.display = "none";
              }
            } else {
              calloutExcess.style.display = "none";
            }
          } catch (e) {
            calloutExcess.style.display = "none";
          }
        } else {
          calloutExcess.style.display = "none";
        }
      }
    } catch (err) {
      console.error("Lỗi cập nhật thẻ chiến lược rút tiền:", err);
    }
  }

  function renderWithdrawalComparison() {
    updateWithdrawalStrategyCards(getActivePlan());
  }


  const Tab1StreamsExports = {
    bindEvents: bindTab1StreamEvents,
    ensureAssetAllocationCardPosition,
    updateAssetAllocationUI,
    updateDualInflationUI,
    updateRetirementLocationUI,
    computeIncomePeriods,
    renderIncomePeriodsSummary,
    renderIncomeStreamsList,
    getActiveIncomeAtAge,
    ensureDefaultExpenseStreams,
    getActiveExpensesAtAge,
    updateCashflowBalanceUI,
    syncSavingsAndExpensesFromRate,
    updateSavingsRateUI,
    updateRetirementLocationRadiosUI,
    getRetirementPppRatios,
    applyProfileVisibilityRules,
    updateExpenseSavingsHints,
    renderExpensePeriodsSummary,
    renderExpenseStreamsList,
    updateWithdrawalStrategyCards,
    renderWithdrawalComparison,
    formatGenderAgeText
  };

  window.Tab1StreamsUI = Tab1StreamsExports;
  window.Tab1ProjectionsUI = Object.assign(window.Tab1ProjectionsUI || {}, Tab1StreamsExports);
  Object.assign(window, Tab1StreamsExports);

})();
