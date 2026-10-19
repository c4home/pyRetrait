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
  // Sự kiện tương tác của các Tham số, Luồng Thu/Chi & Chiến lược trên Tab 1
  // -------------------------------------------------------------
  function bindTab1StreamEvents() {
    // Live Parameter Bindings
    bindInput("inp-retire-age", "retirementAge", Number);
    bindInput("inp-life-expectancy", "lifeExpectancy", Number);
    bindInput("inp-inflation", "inflationRate", Number);
    bindInput("inp-current-savings", "currentSavings", val => {
      if (typeof val === 'number') return isNaN(val) ? 0 : val;
      const s = String(val).replace(/,/g, '').trim();
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
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
            if (lblCurrentAge) lblCurrentAge.innerText = `${calculatedAge}t`;
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
            if (lblSpouseAge) lblSpouseAge.innerText = `${calculatedAge}t`;
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
            if (lblSpouseAge) lblSpouseAge.innerText = `${age}t`;
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
      hintOptimalAge.title = "Tuổi gợi ý đáp ứng tất cả 4 điều kiện tự do tài chính: Đủ Nest Egg, Tỷ lệ thị trường ≥ 80% & Vượt qua 3 biến cố lớn cuộc đời (Bệnh tật, Khủng hoảng, Lạm phát). Nhấp để áp dụng.";
      hintOptimalAge.addEventListener("click", () => {
        const plan = getActivePlan();
        const proj = window.RetirementEngine.runProjection(plan);
        const optAge = proj.optimalFireAge || proj.fireAge;
        if (optAge) {
          plan.retirementAge = optAge;
          syncSalaryStreamsWithRetireAge(plan);
          const inp = document.getElementById("inp-retire-age");
          if (inp) inp.value = optAge;
          savePlansToStorage();
          updateAll();
          if (window.GeminiAdvisor) {
            window.GeminiAdvisor.updateChartBox("chart-projections", "Kế hoạch Tài chính & Dòng tiền Hưu trí", {}, false);
          }
        }
      });
    }

    const summaryOptimalAge = document.getElementById("summary-optimal-age");
    if (summaryOptimalAge) {
      summaryOptimalAge.style.cursor = "pointer";
      summaryOptimalAge.title = "Tuổi gợi ý đáp ứng tất cả 4 điều kiện tự do tài chính: Đủ Nest Egg, Tỷ lệ thị trường ≥ 80% & Vượt qua 3 biến cố lớn cuộc đời (Bệnh tật, Khủng hoảng, Lạm phát). Nhấp để áp dụng vào kế hoạch.";
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

        const isDomestic = (p.retireMode === 'domestic' || (p.workCountry && p.retireCountry && p.workCountry === p.retireCountry));
        const pppFactors = { 'france': 1.0, 'hybrid': 0.70, 'vietnam': 0.45 };
        const factor = isDomestic ? 1.0 : (pppFactors[newLoc] || 1.0);

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

        updateRetirementLocationUI(newLoc);
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

        const isDomestic = (plan.retireMode === 'domestic' || (plan.workCountry && plan.retireCountry && plan.workCountry === plan.retireCountry));
        const pppFactors = { 'france': 1.0, 'hybrid': 0.70, 'vietnam': 0.45 };
        const factor = isDomestic ? 1.0 : (pppFactors[newLoc] || 1.0);

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

        updateRetirementLocationUI(newLoc);
        updateRetirementLocationRadiosUI(plan);
        updateExpenseSavingsHints(plan);
        savePlansToStorage();
        updateAll();
      });
    }


    // Asset Allocation Sliders (Tự động cân đối tỷ lệ mượt mà, tổng không vượt quá 100%)
    const allocSliderIds = ['inp-alloc-stocks', 'inp-alloc-bonds', 'inp-alloc-re', 'inp-alloc-cash'];
    allocSliderIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        ['input', 'change'].forEach(evt => {
          el.addEventListener(evt, () => {
            let newVal = Math.min(100, Math.max(0, Number(el.value) || 0));
            el.value = newVal;

            const plan = getActivePlan();
            if (!plan.assetAllocation) {
              plan.assetAllocation = { stocks: 60, bonds: 20, realEstate: 20, cash: 0 };
            }

            // Tính tổng các slider khác
            let otherSum = 0;
            allocSliderIds.forEach(otherId => {
              if (otherId !== id) {
                const otherEl = document.getElementById(otherId);
                otherSum += otherEl ? (Number(otherEl.value) || 0) : 0;
              }
            });

            // Nếu tổng vượt quá 100%, tự động giảm các slider khác một cách thông minh
            if (newVal + otherSum > 100) {
              let excess = (newVal + otherSum) - 100;
              // Thứ tự ưu tiên giảm: Stocks -> Cash -> RealEstate -> Bonds (hoặc các slider khác có giá trị > 0)
              const otherSliders = allocSliderIds
                .filter(oId => oId !== id)
                .map(oId => document.getElementById(oId))
                .filter(oEl => oEl && Number(oEl.value) > 0);

              for (const oEl of otherSliders) {
                if (excess <= 0) break;
                const curOther = Number(oEl.value) || 0;
                const deduct = Math.min(curOther, excess);
                oEl.value = curOther - deduct;
                excess -= deduct;
              }

              // Nếu vẫn còn thừa (trường hợp hiếm), giới hạn newVal
              if (excess > 0) {
                newVal = Math.max(0, newVal - excess);
                el.value = newVal;
              }
            }

            // Cập nhật trực tiếp vào data model plan.assetAllocation
            const stocksEl = document.getElementById("inp-alloc-stocks");
            const bondsEl = document.getElementById("inp-alloc-bonds");
            const reEl = document.getElementById("inp-alloc-re");
            const cashEl = document.getElementById("inp-alloc-cash");

            plan.assetAllocation = {
              stocks: stocksEl ? Number(stocksEl.value) : 60,
              bonds: bondsEl ? Number(bondsEl.value) : 20,
              realEstate: reEl ? Number(reEl.value) : 20,
              cash: cashEl ? Number(cashEl.value) : 0
            };

            updateAssetAllocationUI(plan, false);
            if (evt === 'input') {
              debouncedSavePlansToStorage();
            } else {
              savePlansToStorage(true);
            }
            updateAll();
          });
        });
      }
    });

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
        const plan = getActivePlan();
        showConfirmDialog({
          icon: "",
          title: "Xác nhận đặt lại Danh mục đầu tư",
          message: `Bạn có muốn đặt lại tỷ lệ danh mục đầu tư về chuẩn <strong>60% Cổ phiếu, 20% Trái phiếu, 20% BĐS, 0% Tiền mặt</strong>?`,
          confirmText: "Đặt lại tỷ lệ",
          onConfirm: () => {
            plan.assetAllocation = { stocks: 60, bonds: 20, realEstate: 20, cash: 0 };
            setVal("inp-alloc-stocks", 60);
            setVal("inp-alloc-bonds", 20);
            setVal("inp-alloc-re", 20);
            setVal("inp-alloc-cash", 0);
            savePlansToStorage();
            updateAssetAllocationUI(plan);
            updateAll();
          }
        });
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
        updateDualInflationUI();
        savePlansToStorage();
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
        if (isEnabled) {
          showConfirmDialog({
            icon: "",
            title: "Xác nhận tắt Mô hình Lạm phát 2 Chặng",
            message: `Bạn có chắc chắn muốn tắt <strong>Lạm phát 2 Chặng & Trượt giá EUR/VND</strong>?<br><span style="font-size:0.75rem; color:var(--text-faint); margin-top:6px; display:inline-block;">Hệ thống sẽ áp dụng tỷ lệ lạm phát đơn đồng nhất cho toàn bộ chu kỳ cuộc đời.</span>`,
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

  function updateAssetAllocationUI(p, fromInputs = false) {
    if (!p) p = getActivePlan();
    const stocksEl = document.getElementById("inp-alloc-stocks");
    const bondsEl = document.getElementById("inp-alloc-bonds");
    const reEl = document.getElementById("inp-alloc-re");
    const cashEl = document.getElementById("inp-alloc-cash");

    let stocks, bonds, re, cash;
    if (fromInputs) {
      stocks = (stocksEl && stocksEl.value !== "") ? Number(stocksEl.value) : (p.assetAllocation?.stocks ?? 60);
      bonds = (bondsEl && bondsEl.value !== "") ? Number(bondsEl.value) : (p.assetAllocation?.bonds ?? 20);
      re = (reEl && reEl.value !== "") ? Number(reEl.value) : (p.assetAllocation?.realEstate ?? 20);
      cash = (cashEl && cashEl.value !== "") ? Number(cashEl.value) : (p.assetAllocation?.cash ?? 0);
      p.assetAllocation = { stocks, bonds, realEstate: re, cash };
    } else {
      if (!p.assetAllocation) {
        p.assetAllocation = { stocks: 60, bonds: 20, realEstate: 20, cash: 0 };
      }
      stocks = p.assetAllocation.stocks !== undefined ? Number(p.assetAllocation.stocks) : 60;
      bonds = p.assetAllocation.bonds !== undefined ? Number(p.assetAllocation.bonds) : 20;
      re = p.assetAllocation.realEstate !== undefined ? Number(p.assetAllocation.realEstate) : 20;
      cash = p.assetAllocation.cash !== undefined ? Number(p.assetAllocation.cash) : 0;

      if (stocksEl && Number(stocksEl.value) !== stocks) stocksEl.value = stocks;
      if (bondsEl && Number(bondsEl.value) !== bonds) bondsEl.value = bonds;
      if (reEl && Number(reEl.value) !== re) reEl.value = re;
      if (cashEl && Number(cashEl.value) !== cash) cashEl.value = cash;
    }

    const lblStocks = document.getElementById("lbl-alloc-stocks");
    const lblBonds = document.getElementById("lbl-alloc-bonds");
    const lblRE = document.getElementById("lbl-alloc-re");
    const lblCash = document.getElementById("lbl-alloc-cash");
    const badgeWeighted = document.getElementById("badge-weighted-return");
    const lblWeightedCalc = document.getElementById("lbl-weighted-calc");

    // Tính toán số tiền thực tế theo phần trăm tài sản hiện tại (chỉ tính vốn dương >= 0)
    const rawSavings = Number(p.currentSavings) || 0;
    const totalSavings = Math.max(0, rawSavings);
    const cur = p.currency || state.currency || 'EUR';

    const stocksAmt = Math.round(totalSavings * (stocks / 100));
    const bondsAmt = Math.round(totalSavings * (bonds / 100));
    const reAmt = Math.round(totalSavings * (re / 100));
    const cashAmt = Math.round(totalSavings * (cash / 100));

    const stocksAmtFormatted = window.RetirementEngine.formatCurrency(stocksAmt, cur);
    const bondsAmtFormatted = window.RetirementEngine.formatCurrency(bondsAmt, cur);
    const reAmtFormatted = window.RetirementEngine.formatCurrency(reAmt, cur);
    const cashAmtFormatted = window.RetirementEngine.formatCurrency(cashAmt, cur);

    if (lblStocks) lblStocks.innerText = `${stocks}% • ${stocksAmtFormatted} (9.5%/năm)`;
    if (lblBonds) lblBonds.innerText = `${bonds}% • ${bondsAmtFormatted} (3.5%/năm)`;
    if (lblRE) lblRE.innerText = `${re}% • ${reAmtFormatted} (6.5%/năm)`;
    if (lblCash) lblCash.innerText = `${cash}% • ${cashAmtFormatted} (1.5%/năm)`;

    const totalPct = Math.min(100, Math.max(0, stocks + bonds + re + cash));
    const unallocatedPct = Math.max(0, 100 - totalPct);
    const unallocatedAmt = Math.round(totalSavings * (unallocatedPct / 100));
    const unallocatedAmtFormatted = window.RetirementEngine.formatCurrency(unallocatedAmt, cur);

    const returns = p.assetReturns || { stocks: 9.5, bonds: 3.5, realEstate: 6.5, cash: 1.5 };
    const weighted = window.RetirementEngine.calculateWeightedReturn({ stocks, bonds, realEstate: re, cash }, returns, 0.3);

    const activeClassesCount = [stocks, bonds, re, cash].filter(v => v > 0).length;
    const bonusRate = activeClassesCount >= 2 ? (0.3 * (totalPct / 100)) : 0;

    let allocStatusNotice = "";
    if (unallocatedPct > 0) {
      allocStatusNotice = ` <span style="color:var(--text-muted); font-weight:600;">(Đã phân bổ: ${totalPct}% • Còn ${unallocatedPct}% vốn nhàn rỗi ${unallocatedAmtFormatted} chưa đầu tư)</span>`;
    } else {
      allocStatusNotice = ` <span style="color:var(--success); font-weight:600;">(Đã phân bổ trọn vẹn 100% vốn)</span>`;
    }

    if (badgeWeighted) badgeWeighted.innerText = `${weighted}%/năm`;
    if (lblWeightedCalc) {
      let formulaParts = [];
      if (stocks > 0) formulaParts.push(`(${stocks}% × 9.5%)`);
      if (bonds > 0) formulaParts.push(`(${bonds}% × 3.5%)`);
      if (re > 0) formulaParts.push(`(${re}% × 6.5%)`);
      if (cash > 0) formulaParts.push(`(${cash}% × 1.5%)`);
      if (unallocatedPct > 0) formulaParts.push(`(${unallocatedPct}% chưa đầu tư × 0%)`);
      if (formulaParts.length === 0) formulaParts.push(`(100% chưa đầu tư × 0%)`);

      const formulaStr = formulaParts.join(" + ") + (bonusRate > 0 ? ` + ${bonusRate.toFixed(2)}% tái cân bằng` : "");
      lblWeightedCalc.innerHTML = `<strong>${weighted}%/năm</strong>${allocStatusNotice}<div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.25rem; font-family: var(--font-sans);">Công thức: ${formulaStr} = ${weighted}%</div>`;
    }

    // Đảm bảo thẻ Danh mục đầu tư (#card-asset-allocation-stream) luôn nằm trên thẻ Doanh thu BDS (#card-lmnp-income-stream)
    ensureAssetAllocationCardPosition();

    // Cập nhật thẻ Danh mục đầu tư trong Cột Thu nhập
    const lblCardRatio = document.getElementById("lbl-alloc-card-ratio");
    const lblCardBonus = document.getElementById("lbl-alloc-card-bonus");
    const cardEl = document.getElementById("card-asset-allocation-stream");
    const chkEnable = document.getElementById("chk-enable-asset-allocation");

    if (lblCardRatio) {
      let ratioItems = [];
      if (stocks > 0) ratioItems.push(`${stocks}% CP`);
      if (bonds > 0) ratioItems.push(`${bonds}% TP`);
      if (re > 0) ratioItems.push(`${re}% BĐS`);
      if (cash > 0) ratioItems.push(`${cash}% TM`);
      if (unallocatedPct > 0) ratioItems.push(`${unallocatedPct}% Nhàn rỗi`);
      if (ratioItems.length === 0) ratioItems.push(`100% Chưa đầu tư`);
      lblCardRatio.innerText = ratioItems.join(" • ");
    }
    if (lblCardBonus) {
      lblCardBonus.innerText = bonusRate > 0 ? `+${bonusRate.toFixed(2)}% Tái cân bằng` : `0% Tái cân bằng`;
    }

    if (chkEnable) {
      chkEnable.checked = p.enableAssetAllocation !== false;
    }
    if (cardEl) {
      cardEl.style.opacity = p.enableAssetAllocation === false ? "0.55" : "1";
    }

    p.assetAllocation = { stocks, bonds, realEstate: re, cash };
    p.investmentReturnPre = weighted;
    p.investmentReturnPost = weighted;
    setVal("inp-return-pre", weighted);
    setVal("inp-return-post", weighted);
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

    const isEnabled = chk ? chk.checked : (p.dualInflation?.enabled !== false);
    const cardEl = document.getElementById("card-dual-inflation-stream");
    const lblRates = document.getElementById("lbl-inflation-card-rates");
    const lblForexCard = document.getElementById("lbl-inflation-card-forex");
    const lblFuture = document.getElementById("lbl-inflation-card-future");
    const badgeStatus = document.getElementById("badge-dual-inflation-status");

    if (lblRates) {
      lblRates.innerText = `Pháp ${pre}% • VN ${post}%`;
    }
    if (lblForexCard) {
      lblForexCard.innerText = `Tỷ giá gốc: ${baseForex.toLocaleString("vi-VN")} ₫/€ • Trượt giá: +${drift}%/năm`;
    }
    if (lblFuture) {
      lblFuture.innerText = `Ở 60t: ~${forex60.toLocaleString("vi-VN")} ₫/€`;
    }
    if (badgeStatus) {
      badgeStatus.innerText = isEnabled ? "PPP Model" : "Đã tắt";
      badgeStatus.style.background = isEnabled ? "rgba(244, 63, 94, 0.12)" : "rgba(100, 116, 139, 0.15)";
      badgeStatus.style.color = isEnabled ? "#fb7185" : "#94a3b8";
      badgeStatus.style.borderColor = isEnabled ? "rgba(244, 63, 94, 0.25)" : "var(--border-subtle)";
    }
    if (cardEl) {
      cardEl.style.opacity = isEnabled ? "1" : "0.55";
    }

    // Tự động làm mờ và hiển thị chú thích cho ô Lạm phát bình quân (%)
    const inpInflation = document.getElementById("inp-inflation");
    const badgeDualActive = document.getElementById("badge-dual-inflation-active");
    const hintDualActive = document.getElementById("hint-dual-inflation-active");

    if (inpInflation) {
      if (isEnabled) {
        inpInflation.disabled = true;
        inpInflation.style.opacity = "0.6";
        inpInflation.style.cursor = "not-allowed";
        const hintText = window.I18n ? window.I18n.t("hint_dual_inflation_active", "Đang áp dụng mô hình Lạm phát 2 chặng bên dưới") : "Đang áp dụng mô hình Lạm phát 2 chặng bên dưới";
        inpInflation.title = hintText;
        if (badgeDualActive) badgeDualActive.style.display = "inline-flex";
        if (hintDualActive) hintDualActive.style.display = "block";
      } else {
        inpInflation.disabled = false;
        inpInflation.style.opacity = "1";
        inpInflation.style.cursor = "text";
        inpInflation.removeAttribute("title");
        if (badgeDualActive) badgeDualActive.style.display = "none";
        if (hintDualActive) hintDualActive.style.display = "none";
      }
    }

    if (!p.dualInflation) p.dualInflation = {};
    p.dualInflation.enabled = isEnabled;
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
      badge.innerText = "Giảm ~55% chi phí (PPP)";
      badge.style.background = "rgba(16, 185, 129, 0.15)";
      badge.style.color = "#34d399";
      if (hint) hint.innerText = "Sức mua tương đương (PPP): Cùng tiêu chuẩn sống cao, chi phí tại VN chỉ bằng ~45% tại Pháp (+ bảo hiểm CFE).";
    } else if (loc === "hybrid") {
      badge.innerText = "Giảm ~30% chi phí";
      badge.style.background = "rgba(56, 189, 248, 0.15)";
      badge.style.color = "#38bdf8";
      if (hint) hint.innerText = "Song hành Pháp - Việt: 6 tháng sống tại Pháp & 6 tháng tại VN, tối ưu chi phí sinh hoạt kèm quỹ vé máy bay di chuyển.";
    } else {
      badge.innerText = "Chi phí Chuẩn Pháp";
      badge.style.background = "rgba(255, 255, 255, 0.08)";
      badge.style.color = "#94a3b8";
      if (hint) hint.innerText = "100% tại Pháp: Giữ nguyên mức chi phí sinh hoạt tiêu chuẩn Châu Âu.";
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

    const otherIncomes = p.incomes.filter(s => !s.isBhxhVn && !/lmnp|doanh thu bđs|doanh thu bds/i.test(s.name || ''));
    if (otherIncomes.length === 0) {
      container.innerHTML = `<div style="font-size:0.78rem;color:var(--text-faint);padding:0.5rem 0;">Chưa có nguồn thu bổ sung nào khác. Bấm "+ Thêm nguồn thu" để thêm.</div>`;
      updateLmnpUI(p);
      return;
    }

    const isMarried = (p.maritalStatus === 'married');

    p.incomes.forEach((stream, idx) => {
      if (stream.isBhxhVn) return; // Dedicated card #card-bhxh-income-stream is used
      if (/lmnp|doanh thu bđs|doanh thu bds/i.test(stream.name || '')) return; // Dedicated card #card-lmnp-income-stream is used
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

      const item = document.createElement("div");
      item.className = "income-item";
      item.innerHTML = `
        <div class="income-item-header">
          <div style="display: flex; align-items: center; min-width: 0;">
            <span class="income-item-name">${displayName}</span>
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

  // -------------------------------------------------------------
  // Live Cashflow Balance & Expense Streams Management
  // -------------------------------------------------------------
  function ensureDefaultExpenseStreams(plan) {
    if (!plan) return;
    if (Array.isArray(plan.expenses) && plan.expenses.length > 0) return;

    plan.expenses = [];
    const curAge = Number(plan.currentAge) || 29;
    const cur = state.currency || plan.currency || 'EUR';

    // 1. Check if we have mortgage loans from Patrimoine
    let hasPatLoans = false;
    try {
      const patLoans = buildPatrimoineLoans(plan);
      if (patLoans && patLoans.length > 0) {
        hasPatLoans = true;
        const sched = window.RetirementEngine.calculateMortgageSchedule({ source: 'patrimoine', loans: patLoans }, curAge, plan.lifeExpectancy || 85);
        patLoans.forEach((loan, idx) => {
          const part = sched?.parts ? sched.parts[idx] : null;
          const row = part ? part.schedule[curAge] : null;
          const mPmt = (loan.monthlyPaymentEur && loan.monthlyPaymentEur > 0)
            ? loan.monthlyPaymentEur
            : (row && row.active ? row.monthlyPayment : Math.round(loan.loanAmount * 0.055 / 12));
          const endAge = (Number(loan.startAge) || curAge) + (Number(loan.loanTermYears) || 20);
          const loanOnly = loan.monthlyLoanPaymentEur || loan.monthlyPaymentEur || 0;
          const chargesOnly = loan.monthlyChargesEur || 0;
          const noteText = chargesOnly > 0 ? `Crédit ${loanOnly} € + Phí ${chargesOnly} €` : undefined;
          plan.expenses.push({
            name: `Chi phí BĐS & Crédit: ${loan.name || 'Căn hộ LMNP'}`,
            amount: mPmt * 12,
            startAge: Number(loan.startAge) || curAge,
            endAge: endAge,
            growth: 0.0,
            isDebt: true,
            note: noteText,
            enabled: true
          });
        });
      }
    } catch (e) {
      console.warn("Could not load default patrimoine loans for expenses:", e);
    }

    // If no patrimoine loans, add sample crédit if plan had significant expenses
    if (!hasPatLoans) {
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

    // 2. Add base living expenses
    const defaultLiving = cur === 'EUR' ? 1200 : (cur === 'USD' ? 1350 : 25000000);
    plan.expenses.unshift({
      name: 'Chi tiêu sinh hoạt & Tiện ích',
      amount: defaultLiving * 12,
      startAge: curAge,
      endAge: Number(plan.lifeExpectancy) || 85,
      growth: 2.0,
      isDebt: false,
      enabled: true
    });
  }

  function getActiveExpensesAtAge(plan, age) {
    if (!plan) return 0;
    ensureDefaultExpenseStreams(plan);
    if (!Array.isArray(plan.expenses)) return Number(plan.annualExpenses) || 0;
    let total = 0;
    plan.expenses.forEach(e => {
      if (e.enabled === false) return;
      const start = (e.startAge !== undefined && e.startAge !== null && !isNaN(Number(e.startAge))) ? Number(e.startAge) : (plan.currentAge || 29);
      const end = (e.endAge !== undefined && e.endAge !== null && !isNaN(Number(e.endAge))) ? Number(e.endAge) : 85;
      if (age >= start && age <= end) {
        const growth = (Number(e.growth) || 0) / 100.0;
        const years = age - start;
        total += (Number(e.amount) || 0) * Math.pow(1.0 + growth, years);
      }
    });

    // Child lifecycle expense at age
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
      let depCount = 0;
      for (let k = 0; k < Math.min(kCount, 4); k++) {
        const a = simYr - birthYears[k];
        if (a >= 0 && a < 18) childGross += kidCostMonthly * 12;
        else if (a >= 18 && a <= 23) childGross += kidUniMonthly * 12;
        if (a >= 0 && a < 20) depCount++;
      }
      let caf = 0;
      if (depCount === 2) caf = 148 * 12;
      else if (depCount === 3) caf = 338 * 12;
      else if (depCount >= 4) caf = 529 * 12;
      total += Math.max(0, childGross - caf);
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

    const isDomestic = (plan.retireMode === 'domestic' || (plan.workCountry && plan.retireCountry && plan.workCountry === plan.retireCountry));
    const cardDualInf = document.getElementById("card-dual-inflation-stream");
    const locRadios = document.getElementById("retire-location-radios");
    if (cardDualInf) {
      cardDualInf.style.display = isDomestic ? "none" : "";
    }
    if (locRadios) {
      locRadios.style.display = isDomestic ? "none" : "";
    }

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

    // Khối thông báo minh bạch khi quốc gia chưa có mô hình hưu trí tự động
    const isSupportedCountry = ['FR', 'VN', 'DE', 'US'].includes(workC) || ['FR', 'VN', 'DE', 'US'].includes(retireC);
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

    const cardWithdrawal = document.getElementById("card-withdrawal-strategy-controls");
    if (cardWithdrawal) cardWithdrawal.style.display = "";

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

    // Cập nhật giá trị hiển thị cho các thẻ đang bật
    if (hasDe && window.Tab3TaxesUI && typeof window.Tab3TaxesUI.updateGermanPensionUI === 'function') {
      window.Tab3TaxesUI.updateGermanPensionUI(plan);
    }
    if (hasUs && window.Tab3TaxesUI && typeof window.Tab3TaxesUI.updateUsPensionUI === 'function') {
      window.Tab3TaxesUI.updateUsPensionUI(plan);
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

      const pppFactorDisplay = (Number(calc.pppRatio) || 0.45).toFixed(2);
      const totalBudget = calc.monthlyRetireTotal || 1;
      const bFood = Math.round(((calc.breakdown?.food || 0) / totalBudget) * 100);
      const bHousing = Math.round(((calc.breakdown?.housing || 0) / totalBudget) * 100);
      const bHealth = Math.round(((calc.breakdown?.health || 0) / totalBudget) * 100);
      const bUtil = Math.round(((calc.breakdown?.utilities || 0) / totalBudget) * 100);
      const bTrans = Math.round(((calc.breakdown?.transport || 0) / totalBudget) * 100);
      const bApp = Math.round(((calc.breakdown?.household || 0) / totalBudget) * 100);
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
          <div class="retire-callout-total" style="margin-top: 0.4rem;">
            <span>Gợi ý ngân sách hưu:</span>
            <strong class="text-success" style="font-size: 0.88rem;">${fmt(calc.monthlyRetireTotal)}/tháng</strong>
          </div>
        `;
      } else {
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
          <div class="retire-callout-step">
            <span>Quy đổi sang ${targetCityDisplayName} (${pppFactorDisplay}x):</span>
            <strong>${fmt(calc.pppAdjustedLiving)}/th</strong>
          </div>
          <div class="retire-callout-step">
            <span>Phụ phí Y tế tuổi già (${householdSize} ng):</span>
            <strong>+ ${fmt(calc.seniorHealthAddon)}/th</strong>
          </div>
          <div class="retire-callout-total">
            <span>Gợi ý ngân sách hưu:</span>
            <strong class="text-success" style="font-size: 0.88rem;">${fmt(calc.monthlyRetireTotal)}/tháng</strong>
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
          <div class="retire-callout-step">
            <span>1. Cơ bản:</span>
            <strong class="font-mono">~${fmt(calc.referenceBenchmarks?.lean || 0)}</strong>
          </div>
          <div class="retire-callout-step" style="background: rgba(16, 185, 129, 0.08); padding: 0.15rem 0.35rem; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.25);">
            <span style="font-weight: 600; color: #10b981;">2. Thoải mái:</span>
            <strong class="font-mono text-success">~${fmt(calc.referenceBenchmarks?.standard || 0)}</strong>
          </div>
          <div class="retire-callout-step">
            <span>3. Thịnh vượng:</span>
            <strong class="font-mono text-warning">~${fmt(calc.referenceBenchmarks?.fat || 0)}</strong>
          </div>
          <div style="font-size: 0.68rem; font-weight: 700; color: var(--text-muted); margin-top: 0.25rem; border-top: 1px dashed var(--border-subtle); padding-top: 0.2rem;">
            Tỷ lệ 7 nhóm chi tiêu gia đình:
          </div>
          <div style="font-size: 0.68rem; color: var(--text-muted); line-height: 1.35; display: grid; grid-template-columns: 1fr 1fr; gap: 0.1rem 0.35rem;">
            <span>Ăn uống: <strong>${bFood}%</strong></span>
            <span>Nhà ở: <strong>${bHousing}%</strong></span>
            <span>Y tế BHYT: <strong>${bHealth}%</strong></span>
            <span>Điện nước: <strong>${bUtil}%</strong></span>
            <span>Đi lại: <strong>${bTrans}%</strong></span>
            <span>Đồ gia dụng: <strong>${bApp}%</strong></span>
            <span style="grid-column: 1 / -1;">Giải trí, du lịch: <strong>${bLeisure}%</strong></span>
          </div>
        </div>

        <!-- Nguồn gốc dữ liệu & Công thức tính -->
        <div class="formula-inline-box formula-info" style="grid-column: 1 / -1; margin-top: 0.35rem; font-size: 0.68rem; padding: 0.35rem 0.55rem; border-radius: 4px;">
          <div class="formula-tag" style="font-size: 0.65rem; margin-bottom: 0.15rem;">Nguồn dữ liệu &amp; Công thức đối chiếu</div>
          <div style="display: flex; flex-direction: column; gap: 0.12rem; line-height: 1.35;">
            <code>• Chi tiêu hưu trí = (Thu nhập - Tiết kiệm - Nợ nhà) × PPP (${targetCityDisplayName}: ${pppFactorDisplay}x) + Y tế (${calc.seniorHealthAddon} ${cur === 'EUR' ? '€' : cur})</code>
            <code>• Công thức 3 mốc = Mức sống tham chiếu ${isDomestic ? targetCityDisplayName : 'quy đổi PPP (' + targetCityDisplayName + ')'} × ${isMarried ? '1.6 (hộ 2 người)' : '1.0 (cá nhân 1 người)'} × ${pppFactorDisplay}</code>
            <code>• Nguồn dữ liệu: Khảo sát mức sống hộ gia đình OECD, INSEE, World Bank PPP &amp; Numbeo 2024</code>
          </div>
        </div>
      `;
    }
  }

  function updateRetirementLocationRadiosUI(plan) {
    if (!plan) plan = getActivePlan();
    if (!plan) return;
    applyProfileVisibilityRules(plan);
    const inpRetireMonthly = document.getElementById("inp-monthly-retire-expenses");
    const isDomestic = (plan.retireMode === 'domestic' || (plan.workCountry && plan.retireCountry && plan.workCountry === plan.retireCountry));

    const pppProfiles = (window.TaxOptimizer && window.TaxOptimizer.COUNTRY_PPP_PROFILES) ? window.TaxOptimizer.COUNTRY_PPP_PROFILES : {};
    const workKey = plan.workCity || 'fr_paris';
    const retireKey = plan.retireCity || (isDomestic ? workKey : 'vn_hcm_hn');
    const workProfile = pppProfiles[workKey] || { label: 'Nơi làm việc', countryLabel: 'Pháp', flag: '🇫🇷', ppp: 1.0 };
    const retireProfile = pppProfiles[retireKey] || { label: 'Nơi nghỉ hưu', countryLabel: 'Việt Nam', flag: '🇻🇳', ppp: 0.45 };
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

    const loc = plan.retirementLocation || 'vietnam';
    const pppFactors = { 'france': 1.0, 'hybrid': 0.70, 'vietnam': 0.45 };
    const curFactor = isDomestic ? 1.0 : (pppFactors[loc] || 1.0);

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

      const monthlyVietnam = Math.round(baseMonthly * 0.45);
      const annualVietnam = Math.round(baseMonthly * 12 * 0.45);

      const monthlyHybrid = Math.round(baseMonthly * 0.70);
      const annualHybrid = Math.round(baseMonthly * 12 * 0.70);

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
      activeDesc = "chi tiêu tại Việt Nam";
      if (loc === 'france') { activeMonthly = monthlyFrance; activeAnnual = annualFrance; activeDesc = "chi tiêu tại Pháp"; }
      else if (loc === 'hybrid') { activeMonthly = monthlyHybrid; activeAnnual = annualHybrid; activeDesc = "Song hành Pháp - Việt"; }
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
      const isDebtStream = e.isDebt === true || (/crédit|credit|vay|nợ|loan|prêt|pret|ngân hàng/i).test(e.name || '');
      if (isDebtStream) {
        allExpenses.push(e);
        return;
      }
      const sAge = Number(e.startAge) || curAge;
      if (sAge >= retireAgeExp) return;
      const eAge = Number(e.endAge) || maxAge;
      allExpenses.push({ ...e, endAge: Math.min(eAge, retireAgeExp - 1) });
    });

    const retireBase = Number(plan.retirementExpenses) || 0;
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
      const cleanName = (stream.name || '').replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
      const item = document.createElement("div");
      item.className = "expense-item";
      const monthlyAmt = Math.round(Number(stream.amount) / 12);

      item.innerHTML = `
        <div class="expense-item-header">
          <div class="expense-item-name">
            <span>${cleanName}</span>
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
        const p = { ...plan, withdrawalStrategy: s.key };
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
      const chkWithdrawal = document.getElementById("chk-enable-withdrawal-strategy");
      if (chkWithdrawal) chkWithdrawal.checked = isEnabled;

      const topBadge = document.getElementById("badge-chosen-strategy");
      const chosenObj = strategies.find(s => s.key === chosenStrat) || strategies[0];
      if (topBadge) {
        if (isEnabled) {
          topBadge.innerText = chosenObj.name;
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
          lblName.innerText = `${chosenObj.name} • ${chosenStrat === 'guyton_klinger' ? 'Tự điều chỉnh linh hoạt' : chosenStrat === 'bengen_4pct' ? 'Rút cố định trượt giá' : chosenStrat === 'vpw' ? 'Tỷ lệ thay đổi theo tuổi' : 'Cố định theo tài sản'}`;
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
    applyProfileVisibilityRules,
    updateExpenseSavingsHints,
    renderExpensePeriodsSummary,
    renderExpenseStreamsList,
    updateWithdrawalStrategyCards,
    renderWithdrawalComparison
  };

  window.Tab1StreamsUI = Tab1StreamsExports;
  window.Tab1ProjectionsUI = Object.assign(window.Tab1ProjectionsUI || {}, Tab1StreamsExports);
  Object.assign(window, Tab1StreamsExports);

})();
