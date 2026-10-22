/**
 * pyRetrait — Tầng 3: Giao Diện Tab 1A — Biểu Đồ, Monte Carlo, Biến Cố & Bảng Dự Phóng (ui-tab1-charts.js)
 * Quản lý toàn bộ trực quan hóa dữ liệu trên Tab 1 (#tab-projections):
 * Biểu đồ Tài sản ròng (Net Worth), Ghim Cột mốc cuộc đời, Biểu đồ Dòng tiền (Cash Flow),
 * Quạt phân vị Monte Carlo, Lưới an toàn 3 biến cố, Kịch bản What-If và Bảng dự phóng từng năm.
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
  // Sự kiện tương tác của các Biểu đồ & Bảng dự phóng trên Tab 1
  // -------------------------------------------------------------
  function bindTab1ChartEvents() {
    // Compare 3 Worst Stress Scenarios Toggle (Dùng chung cho cả Net Worth Chart & Cash Flow Chart)
    const btnToggleStress = document.getElementById("btn-toggle-compare-stress");
    if (btnToggleStress) {
      btnToggleStress.addEventListener("click", () => {
        state.compareStressScenarios = !state.compareStressScenarios;
        btnToggleStress.classList.toggle("active", state.compareStressScenarios);
        if (state.compareStressScenarios) {
          if (state.showMonteCarloFan) {
            state.showMonteCarloFan = false;
            const btnMcFan = document.getElementById("btn-toggle-mc-fan");
            if (btnMcFan) btnMcFan.classList.remove("active");
          }
          // Khi bật Ba biến cố tồi tệ nhất, xóa chip đơn lẻ nếu có
          state.cashflowStressScenario = null;
          document.querySelectorAll(".cashflow-stress-chip").forEach(c => c.classList.remove("active"));
        }
        const plan = getActivePlan();
        if (!plan || !window.RetirementEngine) return;
        const proj = window.RetirementEngine.runProjection(plan);
        if (state.mainChartTab === 'cashflow') {
          renderCashFlowChart(proj, true);
        } else {
          renderNetWorthChart(proj, true);
        }
      });
    }

    // Sự kiện bấm chọn trực tiếp 3 chip biến cố trên biểu đồ dòng tiền (bấm bật / bấm lại để tắt)
    document.querySelectorAll(".cashflow-stress-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const scKey = chip.getAttribute("data-scenario");
        const wasActive = chip.classList.contains("active");

        // Bỏ active của tất cả chip
        document.querySelectorAll(".cashflow-stress-chip").forEach(c => c.classList.remove("active"));

        if (wasActive) {
          state.cashflowStressScenario = null;
        } else {
          chip.classList.add("active");
          state.cashflowStressScenario = scKey;
          // Tắt chế độ so sánh gộp Ba biến cố tồi tệ nhất nếu đang bật
          if (state.compareStressScenarios) {
            state.compareStressScenarios = false;
            const btnStress = document.getElementById("btn-toggle-compare-stress");
            if (btnStress) btnStress.classList.remove("active");
          }
        }

        const plan = getActivePlan();
        if (!plan || !window.RetirementEngine) return;
        const proj = window.RetirementEngine.runProjection(plan);
        renderCashFlowChart(proj, true);
      });
    });

    // Toggle Monte Carlo Fan Chart on Net Worth Chart
    const btnToggleMcFan = document.getElementById("btn-toggle-mc-fan");
    if (btnToggleMcFan) {
      btnToggleMcFan.addEventListener("click", () => {
        state.showMonteCarloFan = !state.showMonteCarloFan;
        btnToggleMcFan.classList.toggle("active", state.showMonteCarloFan);
        if (state.showMonteCarloFan) {
          if (state.compareStressScenarios) {
            state.compareStressScenarios = false;
            const btnStress = document.getElementById("btn-toggle-compare-stress");
            if (btnStress) btnStress.classList.remove("active");
          }
        }
        const plan = getActivePlan();
        const proj = window.RetirementEngine.runProjection(plan);
        renderNetWorthChart(proj);
      });
    }

    // Toggle Detailed Table (if present)
    const btnToggleTable = document.getElementById("btn-toggle-table");
    if (btnToggleTable) {
      btnToggleTable.addEventListener("click", () => {
        const container = document.getElementById("schedule-table-container");
        if (!container) return;
        const isHidden = container.style.display === "none";
        container.style.display = isHidden ? "block" : "none";
        btnToggleTable.innerText = isHidden ? "Thu gọn Bảng ▲" : "Mở rộng Bảng ▼";
      });
    }

    // Toggle Sức mua Hiện tại (Real) vs Giá trị Tương lai (Nominal) cho Biểu đồ Dòng tiền
    const btnCfReal = document.getElementById("btn-cashflow-real");
    const btnCfNominal = document.getElementById("btn-cashflow-nominal");
    if (btnCfReal) {
      btnCfReal.addEventListener("click", () => {
        if (typeof window.setCashflowViewMode === 'function') {
          window.setCashflowViewMode("real");
        } else {
          state.cashflowViewMode = "real";
          if (window.AppState && typeof window.AppState.setCashflowViewMode === 'function') {
            window.AppState.setCashflowViewMode("real");
          }
          const plan = getActivePlan();
          const proj = window.RetirementEngine.runProjection(plan);
          renderCashFlowChart(proj);
        }
      });
    }
    if (btnCfNominal) {
      btnCfNominal.addEventListener("click", () => {
        if (typeof window.setCashflowViewMode === 'function') {
          window.setCashflowViewMode("nominal");
        } else {
          state.cashflowViewMode = "nominal";
          if (window.AppState && typeof window.AppState.setCashflowViewMode === 'function') {
            window.AppState.setCashflowViewMode("nominal");
          }
          const plan = getActivePlan();
          const proj = window.RetirementEngine.runProjection(plan);
          renderCashFlowChart(proj);
        }
      });
    }

    // Toggle chuyển đổi giữa Biểu đồ Tăng trưởng Tài sản Ròng và Dòng tiền Hàng năm
    const btnTabNetWorth = document.getElementById("btn-chart-tab-networth");
    const btnTabCashFlow = document.getElementById("btn-chart-tab-cashflow");
    if (btnTabNetWorth) {
      btnTabNetWorth.addEventListener("click", () => switchMainChartTab("networth"));
    }
    if (btnTabCashFlow) {
      btnTabCashFlow.addEventListener("click", () => switchMainChartTab("cashflow"));
    }

    // Khởi tạo hiển thị ban đầu dựa trên trạng thái đã lưu (mặc định: cashflow - Dòng tiền Hàng năm)
    const initialChartTab = (window.AppState && typeof window.AppState.getMainChartTab === 'function')
      ? window.AppState.getMainChartTab()
      : (state.mainChartTab || 'cashflow');
    switchMainChartTab(initialChartTab, false);




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
    const btnRunMc = document.getElementById("btn-run-monte-carlo");
    if (btnRunMc) {
      btnRunMc.addEventListener("click", () => {
        renderMonteCarloTab();
      });
    }

  }

  function triggerPlanProjectionsInsight(proj) {
    if (!window.GeminiAdvisor) return;
    const plan = getActivePlan();
    if (!plan || !proj) return;

    let actualTrackingStr = "Chưa có dữ liệu theo dõi thực tế";
    const actualRecords = Array.isArray(plan.actualRecords) ? plan.actualRecords : [];
    if (actualRecords.length > 0 && proj.timeline && proj.timeline.length > 0) {
      const sortedActual = [...actualRecords].sort((a, b) => (a.year || 0) - (b.year || 0));
      const latestRec = sortedActual[sortedActual.length - 1];
      const maxActualYear = latestRec.year || new Date(latestRec.date).getFullYear();
      const latestTimelineRow = proj.timeline.find(row => row.year === maxActualYear);
      if (latestTimelineRow) {
        const forecastVal = (plan.assetClassBreakdown && plan.assetClassBreakdown.length > 0)
          ? (state.viewMode === "nominal" ? latestTimelineRow.totalNetWorth : latestTimelineRow.realTotalNetWorth)
          : (state.viewMode === "nominal" ? latestTimelineRow.portfolioEnd : latestTimelineRow.realPortfolioEnd);
        const diff = latestRec.amount - forecastVal;
        const diffPct = forecastVal !== 0 ? ((diff / Math.abs(forecastVal)) * 100).toFixed(1) : '0';
        const sign = diff >= 0 ? '+' : '';
        actualTrackingStr = `Năm ${maxActualYear} (tuổi ${latestTimelineRow.age}): Thực tế ${window.RetirementEngine.formatCurrency(latestRec.amount, state.currency)}, Dự báo ${window.RetirementEngine.formatCurrency(forecastVal, state.currency)} (Chênh lệch ${sign}${window.RetirementEngine.formatCurrency(diff, state.currency)} / ${sign}${diffPct}%)`;
      }
    }

    const optFireAge = proj.optimalFireAge || proj.fireAge || (Number(plan.retirementAge) || 42);

    const chartSummary = {
      currentAge: Number(plan.currentAge) || 29,
      targetRetireAge: Number(plan.retirementAge) || 42,
      optimalFireAge: optFireAge,
      lifeExpectancy: Number(plan.lifeExpectancy) || 85,
      currentNetWorth: window.RetirementEngine.formatCurrency(proj.initialPortfolio, state.currency),
      currentSavings: window.RetirementEngine.formatCurrency(plan.currentSavings || 0, state.currency),
      annualSavings: window.RetirementEngine.formatCurrency(plan.annualSavings || 0, state.currency),
      retirementExpenses: window.RetirementEngine.formatCurrency(plan.retirementExpenses || 0, state.currency),
      peakNetWorth: window.RetirementEngine.formatCurrency(proj.peakNetWorth, state.currency),
      peakAge: proj.peakAge,
      finalNetWorth: window.RetirementEngine.formatCurrency(proj.finalTotalNetWorth, state.currency),
      finalPortfolio: window.RetirementEngine.formatCurrency(proj.finalPortfolio, state.currency),
      fireTarget: window.RetirementEngine.formatCurrency(proj.fireTargetNestEgg, state.currency),
      survived: proj.survived ? "100% An toàn vốn" : "Có nguy cơ cạn vốn",
      withdrawalStrategy: plan.withdrawalStrategy,
      initialWithdrawalRate: `${plan.initialWithdrawalRate || 3.5}%`,
      totalLifetimeIncome: window.RetirementEngine.formatCurrency(proj.totalLifetimeIncome, state.currency),
      totalLifetimeExpenses: window.RetirementEngine.formatCurrency(proj.totalLifetimeExpenses, state.currency),
      actualTracking: actualTrackingStr
    };


    const periods = (typeof computeIncomePeriods === 'function') ? computeIncomePeriods(plan) : [];
    if (periods && periods.length > 0) {
      chartSummary.incomePeriods = periods.map(p => `${p.startAge}–${p.endAge}t (${p.phaseLabel}): +${window.RetirementEngine.formatCurrency(p.totalMonthly, state.currency)}/tháng [${p.streams.map(str => str.name).join(', ')}]`).join(" | ");
    }

    window.GeminiAdvisor.updateChartBox(
      "chart-projections",
      "Kế hoạch Tài chính & Dòng tiền Hưu trí",
      chartSummary
    );
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
      // Chỉ đổi màu duy nhất sự kiện Nghỉ Hưu, không nhận vơ sự kiện khác cùng tuổi
      const isRetire = (m.id === 'ms_retire' || m.name === 'Nghỉ hưu');
      chip.className = isRetire ? "milestone-chip milestone-chip-retire" : "milestone-chip";
      chip.title = m.desc || `${m.name} (Tuổi ${m.age}${yearStr})`;
      
      let amtHtml = "";
      if (m.amount) {
        const sign = m.type === "income" ? "+" : "-";
        amtHtml = `<span class="milestone-chip-amount">${sign}${window.RetirementEngine.formatCurrency(m.amount, state.currency, true)}</span>`;
      }

      // Tuyệt đối không để icon ở phía trước text
      chip.innerHTML = `
        <span class="milestone-chip-age">${m.age}t${yearStr}</span>
        <span class="milestone-chip-label">${m.name}</span>
        ${amtHtml}
      `;

      chip.addEventListener("click", () => {
        const idx = proj.timeline.findIndex(p => p.age === m.age);
        if (idx !== -1) {
          container.querySelectorAll(".milestone-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          if (state.charts.networth) {
            state.charts.networth.setActiveElements([
              { datasetIndex: 0, index: idx }
            ]);
            state.charts.networth.tooltip.setActiveElements(
              [{ datasetIndex: 0, index: idx }],
              { x: 0, y: 0 }
            );
            state.charts.networth.update();
          }
          if (state.charts.cashflow) {
            state.charts.cashflow.setActiveElements([
              { datasetIndex: 0, index: idx }
            ]);
            state.charts.cashflow.tooltip.setActiveElements(
              [{ datasetIndex: 0, index: idx }],
              { x: 0, y: 0 }
            );
            state.charts.cashflow.update();
          }
        }
      });

      if (!m.isSystem) {
        chip.title += " • Nhấn đúp để chỉnh sửa";
        chip.addEventListener("dblclick", () => {
          openMilestoneModal();
          const p = getActivePlan();
          if (Array.isArray(p.milestones)) {
            const cIdx = p.milestones.findIndex(item => item.id === m.id || (item.name === m.name && item.age === m.age));
            if (cIdx !== -1) {
              showMilestoneForm(p.milestones[cIdx], cIdx);
            }
          }
        });
      }

      container.appendChild(chip);
    });
  }

  // -------------------------------------------------------------
  // Lưới An Toàn 3 Biến Cố & FIRE Bền Bỉ (Stress Resilience)
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // Trạng thái đạt/chưa đạt của 3 trụ cột Tiêu chuẩn Tự do Tài chính (Sidebar)
  // -------------------------------------------------------------
  /**
   * Cập nhật màu + dòng giải thích cho từng trụ cột trên thẻ "Mục tiêu Độc lập".
   * @param {Object} plan - Kế hoạch hiện tại
   * @param {Object} proj - Kết quả runProjection(plan)
   * @param {number|string|null} mcRate - Tỷ lệ thành công Monte Carlo (%), null nếu chưa có
   */
  function updateFireCriteriaStatus(plan, proj, mcRate) {
    if (!plan || !proj) return false;
    const t = (k, fb) => (window.I18n ? window.I18n.t(k, fb) : fb);
    const fmt = (v) => window.RetirementEngine.formatCurrency(v, state.currency);
    const fill = (s, map) => s.replace(/\{(\w+)\}/g, (_, k) => (map[k] !== undefined ? map[k] : ''));

    const setPillar = (n, ok, text) => {
      const title = document.getElementById(`fire-pillar${n}-title`);
      const status = document.getElementById(`fire-pillar${n}-status`);
      if (title) {
        title.classList.toggle('fire-criteria-title', ok !== null);
        title.classList.toggle('is-ok', ok === true);
        title.classList.toggle('is-fail', ok === false);
      }
      if (status) {
        status.textContent = text || '';
        status.classList.toggle('is-ok', ok === true);
        status.classList.toggle('is-fail', ok === false);
      }
    };

    // Trụ cột 1: Vốn tại thời điểm nghỉ hưu so với tài sản mục tiêu
    const retireAge = Number(plan.retirementAge) || 42;
    const timeline = proj.timeline || [];
    const prevRow = timeline.find(r => r.age === retireAge - 1);
    const currRow = timeline.find(r => r.age === retireAge);
    const portAtRetire = prevRow ? prevRow.portfolioEnd : (currRow ? (currRow.portfolioEnd + (currRow.withdrawal || 0)) : 0);
    const target = Number(proj.fireTargetNestEgg) || 0;
    if (portAtRetire >= target) {
      setPillar(1, true, fill(t('fire_p1_ok', '✓ Đạt: có {have} / cần {need}'), { have: fmt(portAtRetire), need: fmt(target) }));
    } else {
      setPillar(1, false, fill(t('fire_p1_fail', '✗ Chưa đạt: lúc nghỉ hưu có {have}, cần {need} (thiếu {gap}). Hãy lùi tuổi nghỉ hưu hoặc tăng tiết kiệm.'),
        { have: fmt(portAtRetire), need: fmt(target), gap: fmt(target - portAtRetire) }));
    }

    // Trụ cột 2: Monte Carlo
    const rate = mcRate === null || mcRate === undefined ? null : parseFloat(mcRate);
    if (rate === null || isNaN(rate)) {
      setPillar(2, null, '');
    } else if (rate >= 80) {
      setPillar(2, true, fill(t('fire_p2_ok', '✓ Đạt: tỷ lệ thành công {rate}%'), { rate }));
    } else {
      setPillar(2, false, fill(t('fire_p2_fail', '✗ Chưa đạt: tỷ lệ thành công {rate}% (cần ≥ 80%)'), { rate }));
    }

    // Trụ cột 3: Biến cố bệnh tật, khủng hoảng
    const stress = proj.stressResilience;
    if (stress && Array.isArray(stress.scenarios)) {
      const vals = { n: stress.passedCount, m: stress.totalCount };
      if (stress.isBulletproof) {
        setPillar(3, true, fill(t('fire_p3_ok', '✓ Đạt: vượt qua {n}/{m} biến cố'), vals));
      } else {
        const failed = stress.scenarios.filter(s => !s.passed).map(s => {
          const lang = (window.I18n && window.I18n.getLanguage) ? window.I18n.getLanguage() : 'vi';
          return lang === 'en' ? (s.nameEn || s.nameVi) : (lang === 'fr' ? (s.nameFr || s.nameVi) : s.nameVi);
        });
        vals.list = failed.join('; ');
        setPillar(3, false, fill(t('fire_p3_fail', '✗ Chưa đạt: vượt {n}/{m} biến cố. Chưa qua: {list}'), vals));
      }
    } else {
      setPillar(3, null, '');
    }

    const stressOk = !!(stress && stress.isBulletproof);
    return portAtRetire >= target && rate !== null && !isNaN(rate) && rate >= 80 && stressOk;
  }

  function renderStressResilienceCard(proj) {
    const container = document.getElementById("stress-resilience-container");
    if (!container) return;

    const stress = proj && proj.stressResilience;
    if (!stress || !Array.isArray(stress.scenarios)) {
      container.innerHTML = "";
      return;
    }

    const t = (k, fb) => (window.I18n ? window.I18n.t(k, fb) : (fb || k));
    const lang = (window.I18n && typeof window.I18n.getLanguage === 'function') ? window.I18n.getLanguage() : 'vi';
    const plan = getActivePlan();
    const endAge = Number(plan.lifeExpectancy) || 85;

    // Cập nhật trạng thái hiển thị trên Sidebar: 3. Chịu được biến cố bệnh tật, khủng hoảng
    const sidebarStatus = document.getElementById("sidebar-stress-status");
    if (sidebarStatus) {
      const floorText = lang === 'en'
        ? 'Liquid assets at all times <strong>≥ 5 yrs net deficit</strong>'
        : (lang === 'fr'
            ? 'Actifs liquides en tout temps <strong>≥ 5 ans de déficit net</strong>'
            : 'Tài sản thanh khoản tại mọi thời điểm luôn <strong>≥ 5 năm khoản tiền thiếu</strong>');

      const spendText = lang === 'en'
        ? 'Living standard firmly maintained <strong>≥ 80%</strong>'
        : (lang === 'fr'
            ? 'Niveau de vie maintenu <strong>≥ 80%</strong>'
            : 'Chi tiêu thực tế luôn giữ vững <strong>≥ 80%</strong> kế hoạch ban đầu (không bị bóp nghẹt chi tiêu thiết yếu)');

      sidebarStatus.innerHTML = `
        • ${floorText}<br>
        • ${spendText}
      `;
    }

    // Xác định huy hiệu tổng thể
    let badgeClass = 'badge-standard';
    let badgeIcon = '🛡️';
    let badgeTitle = t('stress_badge_standard', 'FIRE Tiêu Chuẩn');
    let badgeDesc = t('stress_badge_standard_desc', 'Kế hoạch khả thi trong điều kiện bình thường nhưng có nguy cơ thâm hụt khi gặp biến cố lớn.');

    if (stress.isBulletproof) {
      badgeClass = 'badge-bulletproof';
      badgeIcon = '🏆';
      badgeTitle = t('stress_badge_bulletproof', 'FIRE Thép Đúc');
      badgeDesc = t('stress_badge_bulletproof_desc', 'Xuất sắc! Kế hoạch sống sót trọn vẹn qua cả 3 biến cố khắc nghiệt mà không bao giờ cạn tiền.');
    } else if (stress.passedCount === 0) {
      badgeClass = 'badge-fragile';
      badgeIcon = '⚠️';
      badgeTitle = t('stress_badge_fragile', 'FIRE Dễ Tổn Thương');
      badgeDesc = t('stress_badge_fragile_desc', 'Cần bổ sung thêm đệm tiền mặt hoặc lùi tuổi hưu để hấp thụ các cú sốc tài chính.');
    }

    const cardsHtml = stress.scenarios.map(sc => {
      const isPassed = sc.passed;
      const statusBoxClass = isPassed ? 'stat-box-passed' : 'stat-box-failed';
      const dotClass = isPassed ? 'dot-success' : 'dot-danger';
      const badgeInlineClass = isPassed ? 'badge-pass' : 'badge-fail';
      const badgeInlineText = isPassed ? t('stress_pass_tag', 'Vượt qua') : t('stress_fail_tag', 'Nguy cơ');
      
      const scName = (lang === 'en' ? sc.nameEn : (lang === 'fr' ? sc.nameFr : sc.nameVi)) || sc.nameVi;

      let valueText = '';
      let descText = '';
      let valueColorClass = isPassed ? 'text-success' : 'text-danger';

      if (isPassed) {
        valueText = window.RetirementEngine.formatCurrency(sc.finalPortfolio, state.currency);
        descText = lang === 'en' ? `Capital remains at age ${endAge}` : (lang === 'fr' ? `Capital préservé à ${endAge} ans` : `Vẫn còn tài sản ở tuổi ${endAge}`);
      } else {
        const failAge = sc.failureAge || 60;
        valueText = lang === 'en' ? `Depleted at age ${failAge}` : (lang === 'fr' ? `Épuisé à ${failAge} ans` : `Cạn ở tuổi ${failAge}`);
        const deficitYears = Math.max(1, endAge - failAge);
        descText = lang === 'en' ? `Deficit of ${deficitYears} years` : (lang === 'fr' ? `Déficit de ${deficitYears} ans` : `Hụt ${deficitYears} năm chi tiêu`);
      }

      let gapDetailsHtml = '';
      if (!isPassed && (sc.capitalGap > 0 || sc.delayYearsGap > 0)) {
        const fmtGap = window.RetirementEngine.formatCurrency(sc.capitalGap, state.currency);
        gapDetailsHtml = `
          <div class="stress-gap-mini">
            ${sc.capitalGap > 0 ? `
              <div class="stress-gap-row">
                <span>${t('stress_gap_capital', 'Cần tích lũy thêm khoảng')}:</span>
                <span class="stress-gap-val font-mono">+${fmtGap}</span>
              </div>
            ` : ''}
            ${sc.delayYearsGap > 0 ? `
              <div class="stress-gap-row">
                <span>${t('stress_gap_delay', 'Hoặc lùi tuổi nghỉ hưu thêm')}:</span>
                <span class="stress-gap-val">+${sc.delayYearsGap} ${t('stress_gap_years', 'năm')}</span>
              </div>
            ` : ''}
          </div>
        `;
      }

      return `
        <div class="stress-stat-box ${statusBoxClass}" data-stress-key="${sc.key}">
          <div class="stat-header">
            <div class="stat-title-group">
              <span class="stat-dot ${dotClass}"></span>
              <span class="stat-label" title="${scName}">${scName}</span>
            </div>
          </div>

          <div class="stat-value font-mono ${valueColorClass}">
            ${valueText}
          </div>

          <div class="stat-desc-row">
            <span class="stat-desc">${descText}</span>
            <span class="stress-badge-inline ${badgeInlineClass}">${badgeInlineText}</span>
          </div>

          ${gapDetailsHtml}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="stress-stats-grid">
        ${cardsHtml}
      </div>
    `;

    // Sự kiện kích hoạt xem kịch bản trên biểu đồ
    const triggerChart = () => {
      state.compareStressScenarios = true;
      const btnStress = document.getElementById("btn-toggle-compare-stress");
      if (btnStress) btnStress.classList.add("active");

      const p = window.RetirementEngine.runProjection(plan);
      renderNetWorthChart(p);

      const chartCard = document.getElementById("chart-networth");
      if (chartCard) {
        chartCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    container.querySelectorAll(".stress-stat-box").forEach(box => {
      box.addEventListener("click", () => {
        triggerChart();
      });
    });
  }

  // -------------------------------------------------------------
  // Chart.js Visualizations: Collision-Free Milestone Markers
  // -------------------------------------------------------------
  function drawMilestoneMarkers(chart, proj, isLight) {
    const { ctx, chartArea, scales: { x } } = chart;
    if (!chartArea || !proj || !Array.isArray(proj.milestones) || proj.milestones.length === 0) return;

    const unifiedMilestoneBg = isLight ? "#ffffff" : "rgba(15, 23, 42, 0.95)";
    const unifiedMilestoneBorder = isLight ? "#cbd5e1" : "rgba(56, 189, 248, 0.45)";
    const unifiedMilestoneLine = isLight ? "rgba(2, 132, 199, 0.35)" : "rgba(56, 189, 248, 0.35)";
    const unifiedMilestoneText = isLight ? "#0284c7" : "#38bdf8";

    // Phân tách danh sách thẻ ghim (Marker Items):
    // Tách riêng sự kiện Nghỉ Hưu và các sự kiện khác để trong trường hợp trùng hoặc gần trùng tuổi,
    // CHỈ CÓ duy nhất sự kiện nghỉ hưu đổi màu vàng cam hổ phách, các sự kiện khác giữ nguyên màu xanh chuẩn.
    const markerItems = [];
    const regularAgesSeen = new Set();

    proj.milestones.forEach(m => {
      // Chỉ duy nhất mốc Nghỉ Hưu mới nhận isRetire = true
      const isRetire = (m.id === 'ms_retire' || m.name === 'Nghỉ hưu');
      if (isRetire) {
        markerItems.push({
          age: m.age,
          isRetire: true,
          id: m.id,
          name: m.name
        });
      } else {
        // Với các sự kiện thông thường, mỗi độ tuổi tạo 1 thẻ ghim chuẩn (tránh trùng lặp nếu có nhiều mốc cùng tuổi)
        if (!regularAgesSeen.has(m.age)) {
          regularAgesSeen.add(m.age);
          markerItems.push({
            age: m.age,
            isRetire: false,
            id: m.id,
            name: m.name
          });
        }
      }
    });

    // Sắp xếp theo tuổi, nếu cùng tuổi thì mốc nghỉ hưu ưu tiên xếp trước để hiển thị tầng trên
    markerItems.sort((a, b) => {
      if (a.age !== b.age) return a.age - b.age;
      return a.isRetire ? -1 : 1;
    });

    const pillH = 18;
    const tierGapY = 21;
    // Hỗ trợ 3 tầng hàng thẻ ghim (Tier 0, 1, 2) so le để các mốc ở các năm liền kề không bao giờ bị đè ngang
    const tierLastRight = [-Infinity, -Infinity, -Infinity];
    const drawnGuidelines = new Set();

    ctx.save();

    markerItems.forEach((item) => {
      const age = item.age;
      const isRetire = item.isRetire;
      const idx = proj.timeline.findIndex(p => p.age === age);
      if (idx === -1) return;
      const xPos = x.getPixelForValue(idx);
      if (xPos < chartArea.left - 5 || xPos > chartArea.right + 5) return;

      const p = proj.timeline[idx];
      const yearBadge = p ? ` (${p.year})` : '';
      // Tuyệt đối không để icon ở phía trước text
      const labelText = `${age}t${yearBadge}`;

      ctx.font = isRetire ? '700 10.5px Inter, sans-serif' : '600 10px Inter, sans-serif';
      const textMetrics = ctx.measureText(labelText);
      const pillW = Math.max(isRetire ? 66 : 62, Math.ceil(textMetrics.width + 14));

      // Tính tọa độ X căn giữa xPos, không tràn ra ngoài chartArea
      let pillX = Math.max(chartArea.left + 2, Math.min(chartArea.right - pillW - 2, xPos - pillW / 2));

      // Thuật toán tìm tầng (Tier 0, 1, 2) thấp nhất chưa bị chiếm dụng ngang (cách mép thẻ trước >= 4px)
      let chosenTier = -1;
      for (let r = 0; r < 3; r++) {
        if (pillX >= tierLastRight[r] + 4) {
          chosenTier = r;
          break;
        }
      }

      // Nếu cả 3 tầng đều đang bị giao cắt ngang, chọn tầng có độ chồng lấn nhỏ nhất và đẩy nhẹ pillX sang phải
      if (chosenTier === -1) {
        let bestTier = 0;
        let minOver = Infinity;
        for (let r = 0; r < 3; r++) {
          const overlap = (tierLastRight[r] + 4) - pillX;
          if (overlap < minOver) {
            minOver = overlap;
            bestTier = r;
          }
        }
        chosenTier = bestTier;
        const nudgedX = tierLastRight[chosenTier] + 4;
        if (nudgedX + pillW <= chartArea.right - 2) {
          pillX = nudgedX;
        }
      }

      tierLastRight[chosenTier] = pillX + pillW;
      const pillY = chartArea.top + (chosenTier * tierGapY) + 2;

      // Màu sắc: CHỈ CÓ sự kiện Nghỉ Hưu mang màu Vàng Hổ Phách (Amber Gold), sự kiện khác mang màu chuẩn
      const lineStroke = isRetire
        ? (isLight ? "rgba(217, 119, 6, 0.85)" : "rgba(245, 158, 11, 0.9)")
        : unifiedMilestoneLine;
      const lineDash = isRetire ? [5, 3] : [4, 4];
      const lineWidth = isRetire ? 2.0 : 1.3;

      const badgeBg = isRetire
        ? (isLight ? "#fef3c7" : "rgba(120, 53, 15, 0.95)")
        : unifiedMilestoneBg;
      const badgeBorder = isRetire
        ? (isLight ? "#d97706" : "#f59e0b")
        : unifiedMilestoneBorder;
      const badgeBorderWidth = isRetire ? 1.6 : 1.2;
      const badgeTextColor = isRetire
        ? (isLight ? "#9a3412" : "#fef08a")
        : unifiedMilestoneText;

      // 1. Đường gióng nét đứt thẳng đứng từ chân thẻ ghim xuống đáy biểu đồ (mốc nghỉ hưu luôn có đường gióng nổi bật riêng)
      if (!drawnGuidelines.has(age) || isRetire) {
        drawnGuidelines.add(age);
        ctx.beginPath();
        ctx.setLineDash(lineDash);
        ctx.strokeStyle = lineStroke;
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = 1.0;
        ctx.moveTo(xPos, pillY + pillH);
        ctx.lineTo(xPos, chartArea.bottom);
        ctx.stroke();
      }

      // Nếu thẻ ghim bị dịch chuyển ngang nhẹ để né đè chữ, vẽ nét nối nhỏ từ tâm thẻ đến trục xPos
      if (Math.abs((pillX + pillW / 2) - xPos) > 2) {
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = lineStroke;
        ctx.lineWidth = isRetire ? 1.4 : 1;
        ctx.moveTo(pillX + pillW / 2, pillY + pillH);
        ctx.lineTo(xPos, pillY + pillH + 4);
        ctx.stroke();
      }

      // 2. Vẽ hình thẻ ghim (Badge pill)
      ctx.fillStyle = badgeBg;
      ctx.strokeStyle = badgeBorder;
      ctx.lineWidth = badgeBorderWidth;
      ctx.setLineDash([]);
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(pillX, pillY, pillW, pillH, 4);
      } else {
        ctx.rect(pillX, pillY, pillW, pillH);
      }
      ctx.fill();
      ctx.stroke();

      // 3. Viết chữ vào trong thẻ ghim (hoàn toàn không có icon ở phía trước text)
      ctx.fillStyle = badgeTextColor;
      ctx.font = isRetire ? '700 10.5px Inter, sans-serif' : '600 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, pillX + pillW / 2, pillY + pillH / 2);
    });

    ctx.restore();
  }

  // Vẽ vùng nền đỏ nhạt cho các khoảng tuổi không cân đối được chi tiêu
  function drawDeficitIntervalsBackground(chart, intervals, isLight) {
    if (!intervals || intervals.length === 0) return;
    const { ctx, chartArea, scales: { x } } = chart;
    if (!chartArea || !x) return;

    ctx.save();
    const colStep = (x.getPixelForValue(1) - x.getPixelForValue(0)) || 18;

    intervals.forEach(interval => {
      const xStart = x.getPixelForValue(interval.startIdx);
      const xEnd = x.getPixelForValue(interval.endIdx);
      const zoneLeft = Math.max(chartArea.left, xStart - colStep / 2);
      const zoneRight = Math.min(chartArea.right, xEnd + colStep / 2);
      const zoneWidth = Math.max(8, zoneRight - zoneLeft);

      // Phủ vùng đỏ nhạt cảnh báo không cân đối chi tiêu
      ctx.fillStyle = isLight ? "rgba(239, 68, 68, 0.08)" : "rgba(239, 68, 68, 0.16)";
      ctx.fillRect(zoneLeft, chartArea.top, zoneWidth, chartArea.bottom - chartArea.top);
    });
    ctx.restore();
  }

  // Vẽ đường biên gióng nét đứt cho khoảng tuổi không cân đối ngay trên graph (không viết text pill che đồ thị)
  function drawDeficitIntervalsLines(chart, intervals, isLight) {
    if (!intervals || intervals.length === 0) return;
    const { ctx, chartArea, scales: { x } } = chart;
    if (!chartArea || !x) return;

    ctx.save();
    const colStep = (x.getPixelForValue(1) - x.getPixelForValue(0)) || 18;

    intervals.forEach((interval) => {
      const xStart = x.getPixelForValue(interval.startIdx);
      const xEnd = x.getPixelForValue(interval.endIdx);
      const zoneLeft = Math.max(chartArea.left, xStart - colStep / 2);
      const zoneRight = Math.min(chartArea.right, xEnd + colStep / 2);

      // Hai đường biên nét đứt đỏ mỏng định vị khoảng thâm hụt
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = isLight ? "rgba(220, 38, 38, 0.65)" : "rgba(248, 113, 113, 0.75)";
      ctx.lineWidth = 1.3;
      ctx.moveTo(zoneLeft, chartArea.top);
      ctx.lineTo(zoneLeft, chartArea.bottom);
      ctx.moveTo(zoneRight, chartArea.top);
      ctx.lineTo(zoneRight, chartArea.bottom);
      ctx.stroke();
    });

    ctx.restore();
  }

  /**
   * Chuyển đổi linh hoạt giữa Biểu đồ Tài sản Ròng và Dòng tiền Hàng năm qua Toggle
   * @param {'networth'|'cashflow'} tabKey - Khóa biểu đồ cần kích hoạt
   * @param {boolean} [doSave=true] - Lưu preferences vào storage hay không
   */
  function switchMainChartTab(tabKey, doSave = true) {
    const validTab = (tabKey === 'cashflow') ? 'cashflow' : 'networth';
    state.mainChartTab = validTab;
    if (window.AppState && typeof window.AppState.setMainChartTab === 'function') {
      window.AppState.setMainChartTab(validTab);
    }

    const btnNetWorth = document.getElementById("btn-chart-tab-networth");
    const btnCashFlow = document.getElementById("btn-chart-tab-cashflow");
    if (btnNetWorth) {
      btnNetWorth.classList.toggle("active", validTab === 'networth');
      btnNetWorth.setAttribute("aria-selected", validTab === 'networth' ? 'true' : 'false');
    }
    if (btnCashFlow) {
      btnCashFlow.classList.toggle("active", validTab === 'cashflow');
      btnCashFlow.setAttribute("aria-selected", validTab === 'cashflow' ? 'true' : 'false');
    }

    const headerNw = document.getElementById("chart-header-networth");
    const headerCf = document.getElementById("chart-header-cashflow");
    if (headerNw) headerNw.style.display = (validTab === 'networth') ? 'block' : 'none';
    if (headerCf) headerCf.style.display = (validTab === 'cashflow') ? 'block' : 'none';

    // Điều khiển hiển thị trực tiếp 2 wrapper độc lập cùng chiều cao 420px
    const wrapNw = document.getElementById("wrapper-chart-networth");
    const wrapCf = document.getElementById("wrapper-chart-cashflow");
    if (wrapNw) wrapNw.style.display = (validTab === 'networth') ? 'block' : 'none';
    if (wrapCf) wrapCf.style.display = (validTab === 'cashflow') ? 'block' : 'none';

    // Điều khiển hiển thị thanh điều khiển biến cố của Biểu đồ Tài sản Ròng (Net Worth):
    // Ẩn hoàn toàn nút "Ba biến cố tồi tệ nhất" và các điều khiển tài sản khi ở biểu đồ Dòng tiền hằng năm
    const extraControls = document.getElementById("chart-networth-extra-controls");
    if (extraControls) extraControls.style.display = (validTab === 'networth') ? 'block' : 'none';

    const btnCompareStress = document.getElementById("btn-toggle-compare-stress");
    if (btnCompareStress) btnCompareStress.style.display = (validTab === 'networth') ? 'inline-block' : 'none';

    const btnMcFan = document.getElementById("btn-toggle-mc-fan");
    if (btnMcFan) btnMcFan.style.display = (validTab === 'networth') ? 'inline-block' : 'none';

    const liquidCard = document.getElementById("liquid-explainer-card");
    if (liquidCard) liquidCard.style.display = (validTab === 'networth') ? 'flex' : 'none';

    // Hiển thị cụm 3 chip biến cố trực tiếp khi ở biểu đồ Dòng tiền
    const cfStressBar = document.getElementById("cashflow-stress-chips-bar");
    if (cfStressBar) cfStressBar.style.display = (validTab === 'cashflow') ? 'flex' : 'none';

    const noticeEl = document.getElementById("cashflow-inflation-notice");
    if (noticeEl) {
      const isNominal = (state.viewMode === 'nominal' || state.cashflowViewMode === 'nominal');
      noticeEl.style.display = (validTab === 'cashflow' && isNominal) ? 'flex' : 'none';
    }

    const deficitStrip = document.getElementById("cashflow-deficit-alert-strip");
    if (deficitStrip && validTab !== 'cashflow') {
      deficitStrip.style.display = 'none';
    }

    if (doSave) {
      debouncedSavePlansToStorage();
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        const plan = getActivePlan();
        if (!plan || !window.RetirementEngine) return;
        const proj = window.RetirementEngine.runProjection(plan);
        if (!proj) return;

        // Đảm bảo Cột mốc cuộc đời dùng chung luôn được cập nhật
        renderMilestonesRibbon(proj);

        if (validTab === 'cashflow') {
          renderCashFlowChart(proj, true);
        } else {
          renderNetWorthChart(proj, true);
        }
      }, 40);
    });
  }

  function renderNetWorthChart(proj, force = false) {
    const canvas = document.getElementById("chart-networth");
    if (!canvas) return;

    // Tránh render khi wrapper đang bị ẩn (để không tạo Chart instance kích thước 0x0)
    const wrapNw = document.getElementById("wrapper-chart-networth");
    if (!force && wrapNw && wrapNw.style.display === 'none') {
      return;
    }

    const ctx = canvas.getContext("2d");
    const labels = proj.timeline.map(p => [`${p.age}t`, `${p.year}`]);

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

    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const unifiedMilestoneColor = isLight ? "#0284c7" : "#38bdf8";

    // Hệ màu mát độ tương phản cao (High-Contrast Cool Tone Palette) cho các đường tài sản cốt lõi
    const coolActualColor = isLight ? '#047857' : '#10b981';       // Xanh ngọc lục bảo (Emerald đậm)
    const coolLiquidColor = isLight ? '#0284c7' : '#38bdf8';       // Xanh biển sâu / Sky Blue tươi
    const coolNetWorthColor = isLight ? '#7c3aed' : '#c084fc';     // Tím hoàng gia / Tím hoa cà sáng rực (Pure Violet)

    const isRetireAge = (age) => age === proj.retireAge;
    const retireColor = isLight ? '#d97706' : '#fbbf24';

    const pointRadii = proj.timeline.map(p => {
      if (isRetireAge(p.age)) return 8.0;
      return milestoneMap.has(p.age) ? 5.5 : 0;
    });
    const pointHoverRadii = proj.timeline.map(p => {
      if (isRetireAge(p.age)) return 11.0;
      return milestoneMap.has(p.age) ? 8.5 : 5;
    });
    const pointBgColors = proj.timeline.map(p => {
      if (isRetireAge(p.age)) return retireColor;
      return milestoneMap.has(p.age) ? unifiedMilestoneColor : coolNetWorthColor;
    });
    const pointBorderColors = proj.timeline.map(p => {
      if (isRetireAge(p.age)) return '#ffffff';
      return milestoneMap.has(p.age) ? '#ffffff' : coolNetWorthColor;
    });
    const pointBorderWidths = proj.timeline.map(p => {
      if (isRetireAge(p.age)) return 3.0;
      return milestoneMap.has(p.age) ? 2 : 0;
    });

    const gradientPortfolio = ctx.createLinearGradient(0, 0, 0, 350);
    gradientPortfolio.addColorStop(0, isLight ? 'rgba(2, 132, 199, 0.25)' : 'rgba(56, 189, 248, 0.30)');
    gradientPortfolio.addColorStop(1, isLight ? 'rgba(2, 132, 199, 0.02)' : 'rgba(56, 189, 248, 0.02)');

    const gradientNetWorth = ctx.createLinearGradient(0, 0, 0, 350);
    gradientNetWorth.addColorStop(0, isLight ? 'rgba(124, 58, 237, 0.22)' : 'rgba(192, 132, 252, 0.25)');
    gradientNetWorth.addColorStop(1, isLight ? 'rgba(124, 58, 237, 0.01)' : 'rgba(192, 132, 252, 0.01)');

    // Custom Plugin to Draw Milestone Vertical Guidelines & Floating Pins
    const milestoneMarkersPlugin = {
      id: 'milestoneMarkersPlugin',
      afterDatasetsDraw(chart) {
        drawMilestoneMarkers(chart, proj, isLight);
      }
    };

    const activePlan = getActivePlan();
    const actualRecords = (activePlan && Array.isArray(activePlan.actualRecords)) ? activePlan.actualRecords : [];
    
    // Group actual records by calendar year, taking the latest record for each year
    const actualMapByYear = new Map();
    const sortedActuals = [...actualRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
    sortedActuals.forEach(rec => {
      if (!rec.date) return;
      const yr = new Date(rec.date).getFullYear();
      if (!isNaN(yr)) {
        actualMapByYear.set(yr, rec);
      }
    });

    let maxActualYear = -Infinity;
    actualMapByYear.forEach((_, yr) => {
      if (yr > maxActualYear) maxActualYear = yr;
    });

    const hasActualData = actualMapByYear.size > 0;
    const actualData = proj.timeline.map(p => {
      if (p.year > maxActualYear) return null; // do not draw future years
      const rec = actualMapByYear.get(p.year);
      return rec ? Number(rec.amount) : null;
    });

    const hasRealEstate = proj.timeline.some(p => (p.homeEquity || 0) > 0);
    const sym = window.RetirementEngine.getCurrencySymbol(state.currency);

    const datasets = [];

    // =========================================================================
    // NHÓM 1: CÁC ĐƯỜNG MÀU MÁT, NÉT LIỀN, ĐỨNG LIỀN KỀ NHAU (COOL TONE SOLID)
    // Thực tế (Xanh lục) • Danh mục Thanh khoản (Xanh biển) • Tổng Tài sản Ròng (Tím đậm)
    // =========================================================================

    // 1. Đường Thực tế (nếu có dữ liệu thực tế) - Nét liền, Emerald xanh lục đậm
    if (hasActualData) {
      const actualLabel = window.I18n ? window.I18n.t('legend_actual', 'Thực tế') : 'Thực tế';
      datasets.push({
        label: `${actualLabel} (${sym})`,
        data: actualData,
        borderColor: coolActualColor,
        borderWidth: 3.4,
        borderDash: [],
        backgroundColor: isLight ? 'rgba(4, 120, 87, 0.12)' : 'rgba(16, 185, 129, 0.15)',
        fill: false,
        tension: 0.25,
        spanGaps: true,
        pointRadius: proj.timeline.map(p => actualMapByYear.has(p.year) ? 7.5 : 0),
        pointHoverRadius: 10.5,
        pointBackgroundColor: coolActualColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2.5,
        order: 0
      });
    }

    // 2. Đường Danh mục Thanh khoản (hoặc Cơ sở khi ở chế độ kịch bản biến cố) - Nét liền, Sky/Ocean Blue tươi
    if (state.compareStressScenarios) {
      // Khi so sánh biến cố: đường Baseline đại diện cho Danh mục Thanh khoản chuẩn
      const baselineLabel = window.I18n ? window.I18n.t('scenario_baseline_label', 'Cơ sở') : 'Cơ sở';
      const baselineData = proj.timeline.map(p => state.viewMode === "nominal" ? p.portfolioEnd : p.realPortfolioEnd);

      datasets.push({
        label: `${baselineLabel} (${sym})`,
        data: baselineData,
        borderColor: coolLiquidColor,
        borderWidth: 3.4,
        borderDash: [],
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.35,
        pointRadius: proj.timeline.map(p => (p.age === proj.retireAge) ? 5.5 : 0),
        pointHoverRadius: 8,
        pointBackgroundColor: coolLiquidColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHitRadius: 15,
        order: 1
      });
    } else if (!state.showMonteCarloFan) {
      // Chế độ mặc định: Tiền Mặt & Quỹ Đầu Tư (Tài sản thanh khoản rút sinh hoạt)
      const dataLiquid = proj.timeline.map(p => state.viewMode === "nominal" ? p.portfolioEnd : p.realPortfolioEnd);
      const liquidLabel = hasRealEstate
        ? (window.I18n ? window.I18n.t('legend_liquid_portfolio', 'Tiền Mặt & Quỹ Đầu Tư') : 'Tiền Mặt & Quỹ Đầu Tư')
        : (window.I18n ? window.I18n.t('legend_forecast_assets', 'Dự báo Tài sản') : 'Dự báo Tài sản');

      datasets.push({
        label: `${liquidLabel} (${sym})`,
        data: dataLiquid,
        borderColor: coolLiquidColor,
        borderWidth: 3.2,
        borderDash: [],
        backgroundColor: gradientPortfolio,
        fill: !hasActualData,
        tension: 0.35,
        pointRadius: hasRealEstate ? proj.timeline.map(p => (p.age === proj.retireAge) ? 4.5 : 0) : pointRadii,
        pointHoverRadius: hasRealEstate ? 6 : pointHoverRadii,
        pointBackgroundColor: hasRealEstate ? coolLiquidColor : pointBgColors,
        pointBorderColor: hasRealEstate ? '#ffffff' : pointBorderColors,
        pointBorderWidth: hasRealEstate ? 2 : pointBorderWidths,
        order: 1
      });
    }

    // 3. Đường Tổng Tài sản Ròng (gồm BĐS) - Luôn là NÉT LIỀN, Tím Hoàng Gia sắc nét 100% không bị mờ
    if (hasRealEstate) {
      const dataNetWorth = proj.timeline.map(p => state.viewMode === "nominal" ? p.totalNetWorth : p.realTotalNetWorth);
      const isComparing = (state.compareStressScenarios || state.showMonteCarloFan);
      const netWorthLabel = isComparing
        ? (window.I18n ? window.I18n.t('legend_networth_realestate', 'Tổng Tài sản Ròng (gồm BĐS)') : 'Tổng Tài sản Ròng (gồm BĐS)')
        : (window.I18n ? window.I18n.t('legend_total_networth', 'Tổng Tài sản Ròng') : 'Tổng Tài sản Ròng');

      datasets.push({
        label: `${netWorthLabel} (${sym})`,
        data: dataNetWorth,
        borderColor: coolNetWorthColor,
        borderWidth: isComparing ? 2.8 : 3.0,
        borderDash: [], // Luôn là nét liền theo quy chuẩn
        backgroundColor: isComparing ? 'transparent' : gradientNetWorth,
        fill: !isComparing,
        tension: 0.35,
        pointRadius: isComparing ? 0 : pointRadii,
        pointHoverRadius: isComparing ? 5 : pointHoverRadii,
        pointBackgroundColor: pointBgColors,
        pointBorderColor: pointBorderColors,
        pointBorderWidth: pointBorderWidths,
        order: 2
      });
    }

    // =========================================================================
    // NHÓM 2: CÁC ĐƯỜNG KỊCH BẢN BIẾN CỐ / SO SÁNH KHÁC
    // =========================================================================

    if (state.compareStressScenarios) {
      // 3 Kịch bản Biến cố Tệ nhất: LUÔN LÀ NÉT ĐỨT CÙNG HỆ MÀU NÓNG CÓ ĐỘ TƯƠNG PHẢN CỰC CAO
      // Phân tách 3 màu nóng tương phản tối đa (Đỏ tươi - Cam rực - Vàng hổ phách) kèm nhịp nét đứt khác biệt hoàn toàn:
      const worstStressScenarios = [
        {
          key: 'market_crash',
          label: window.I18n ? window.I18n.t('scenario_crash_label', 'Khủng hoảng Sớm (-35%)') : 'Khủng hoảng Sớm (-35%)',
          color: isLight ? '#dc2626' : '#f87171', // Đỏ thuần rực rỡ
          borderDash: [12, 5], // Nét gạch dài thưa
          borderWidth: 3.2
        },
        {
          key: 'high_inflation',
          label: window.I18n ? window.I18n.t('scenario_inflation_label', 'Lạm phát Phi mã (7%/năm)') : 'Lạm phát Phi mã (7%/năm)',
          color: isLight ? '#ea580c' : '#fb923c', // Cam lửa đậm rực rỡ
          borderDash: [6, 4], // Nét gạch vừa
          borderWidth: 2.8
        },
        {
          key: 'medical_shock',
          label: window.I18n ? window.I18n.t('scenario_medical_label', 'Cú sốc Y tế (Tuổi 65)') : 'Cú sốc Y tế (Tuổi 65)',
          color: isLight ? '#d97706' : '#facc15', // Vàng hổ phách mật ong sáng (tương phản hoàn toàn với Cam & Đỏ)
          borderDash: [2, 3], // Nét chấm tròn / chấm nhặt
          borderWidth: 3.4
        }
      ];

      worstStressScenarios.forEach((sc, idx) => {
        const scProj = window.RetirementEngine.runProjection(activePlan, sc.key);
        const scData = proj.timeline.map(p => {
          // Chỉ rẽ nhánh từ tuổi nghỉ hưu trở đi để không đè nét đứt lên đường Cơ sở thời kỳ tích lũy
          if (p.age < proj.retireAge) return null;
          const matchRow = scProj.timeline.find(r => r.age === p.age);
          if (!matchRow) return null;
          return state.viewMode === "nominal" ? matchRow.portfolioEnd : matchRow.realPortfolioEnd;
        });

        datasets.push({
          label: `${sc.label} (${sym})`,
          data: scData,
          borderColor: sc.color,
          borderWidth: sc.borderWidth || 3.0,
          borderDash: sc.borderDash || [6, 4],
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.35,
          spanGaps: false,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: sc.color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHitRadius: 15,
          order: idx + 3
        });
      });
    } else if (state.showMonteCarloFan && window.MonteCarloSimulator && typeof window.MonteCarloSimulator.runSimulation === "function") {
      // Quạt Phân vị Monte Carlo (Fan Chart P10 - P90)
      const vol = parseVal("inp-mc-volatility", 15.0);
      const iters = 500;
      const mcRes = window.MonteCarloSimulator.runSimulation(activePlan, iters, vol);

      const mcMap = new Map();
      for (let i = 0; i < mcRes.ageAxis.length; i++) {
        mcMap.set(mcRes.ageAxis[i], {
          p90: mcRes.p90[i],
          p50: mcRes.p50[i],
          p10: mcRes.p10[i]
        });
      }

      const p90Data = proj.timeline.map(p => {
        const mc = mcMap.get(p.age);
        if (!mc) return null;
        return state.viewMode === "nominal" ? mc.p90 : (mc.p90 / p.cumInflation);
      });

      const p50Data = proj.timeline.map(p => {
        const mc = mcMap.get(p.age);
        if (!mc) return null;
        return state.viewMode === "nominal" ? mc.p50 : (mc.p50 / p.cumInflation);
      });

      const p10Data = proj.timeline.map(p => {
        const mc = mcMap.get(p.age);
        if (!mc) return null;
        return state.viewMode === "nominal" ? mc.p10 : (mc.p10 / p.cumInflation);
      });

      const lblP90 = window.I18n ? window.I18n.t('mc_p90_label', '90th Percentile (Thị trường Bùng nổ)') : '90th Percentile (Thị trường Bùng nổ)';
      const lblP50 = window.I18n ? window.I18n.t('mc_p50_label', '50th Percentile (Trung vị Kỳ vọng)') : '50th Percentile (Trung vị Kỳ vọng)';
      const lblP10 = window.I18n ? window.I18n.t('mc_p10_label', '10th Percentile (Thị trường Gấu / Khủng hoảng)') : '10th Percentile (Thị trường Gấu / Khủng hoảng)';

      // 1. P90 (Biên trên - Xanh dương/Cyan nét đứt)
      datasets.push({
        label: `${lblP90} (${sym})`,
        data: p90Data,
        borderColor: isLight ? '#0284c7' : '#38bdf8',
        borderWidth: 2.2,
        borderDash: [5, 4],
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: isLight ? '#0284c7' : '#38bdf8',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHitRadius: 15,
        order: 3
      });

      // 2. P10 (Biên dưới - Đỏ/Cam nét đứt với dải quạt tô phủ ngược lên P90)
      datasets.push({
        label: `${lblP10} (${sym})`,
        data: p10Data,
        borderColor: isLight ? '#dc2626' : '#ef4444',
        borderWidth: 2.2,
        borderDash: [5, 4],
        backgroundColor: isLight ? 'rgba(2, 132, 199, 0.09)' : 'rgba(56, 189, 248, 0.12)',
        fill: '-1',
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: isLight ? '#dc2626' : '#ef4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHitRadius: 15,
        order: 4
      });

      // 3. P50 (Trung vị - Xanh ngọc nổi bật ở giữa)
      datasets.push({
        label: `${lblP50} (${sym})`,
        data: p50Data,
        borderColor: isLight ? '#047857' : '#10b981',
        borderWidth: 3.2,
        borderDash: [],
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.35,
        pointRadius: proj.timeline.map(p => (p.age === proj.retireAge) ? 4.5 : 0),
        pointHoverRadius: 7,
        pointBackgroundColor: isLight ? '#047857' : '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHitRadius: 15,
        order: 1
      });
    }

    state.charts.networth = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets
      },
      plugins: [milestoneMarkersPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
          axis: 'x'
        },
        elements: {
          point: {
            hitRadius: 15
          }
        },
        onClick: (evt, activeElements) => {
          if (activeElements && activeElements.length > 0) {
            const idx = activeElements[0].index;
            if (state.charts.cashflow) {
              state.charts.cashflow.setActiveElements([{ datasetIndex: 0, index: idx }]);
              state.charts.cashflow.tooltip.setActiveElements([{ datasetIndex: 0, index: idx }], { x: 0, y: 0 });
              state.charts.cashflow.update();
            }
          }
        },
        plugins: {
          legend: {
            display: state.compareStressScenarios || state.showMonteCarloFan || hasRealEstate || hasActualData,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              color: isLight ? '#334155' : '#94a3b8',
              font: { family: 'Inter, sans-serif', size: 11, weight: '600' }
            }
          },
          tooltip: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.95)',
            titleColor: isLight ? '#0f172a' : '#f8fafc',
            bodyColor: isLight ? '#334155' : '#cbd5e1',
            borderColor: isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.15)',
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
                const val = item.raw;
                if (val === null || val === undefined) return '';
                const dsLabel = item.dataset.label || 'Tài sản';
                const formattedVal = window.RetirementEngine.formatCurrency(val, state.currency, false);
                return ` ${dsLabel}: ${formattedVal}`;
              },
              afterBody: (items) => {
                const idx = items[0].dataIndex;
                const p = proj.timeline[idx];
                const m = milestoneMap.get(p.age);
                const lines = [];

                const actRec = actualMapByYear.get(p.year);
                if (actRec) {
                  const forecastVal = hasRealEstate
                    ? (state.viewMode === "nominal" ? p.totalNetWorth : p.realTotalNetWorth)
                    : (state.viewMode === "nominal" ? p.portfolioEnd : p.realPortfolioEnd);
                  const diff = actRec.amount - forecastVal;
                  const diffPct = forecastVal !== 0 ? ((diff / Math.abs(forecastVal)) * 100).toFixed(1) : '0';
                  const sign = diff >= 0 ? '+' : '';
                  lines.push(`Chênh lệch (Thực tế vs Dự báo): ${sign}${window.RetirementEngine.formatCurrency(diff, state.currency)} (${sign}${diffPct}%)`);
                  if (actRec.note) {
                    lines.push(`Ghi chú: ${actRec.note}`);
                  }
                }

                if (m && m.desc) {
                  lines.push(`${m.desc}`);
                }
                if (p.homeEquity > 0) {
                  lines.push(`Vốn sở hữu BĐS: ${window.RetirementEngine.formatCurrency(p.homeEquity, state.currency)}`);
                }
                if (p.remainingDebt > 0) {
                  lines.push(`Dư nợ vay còn lại: ${window.RetirementEngine.formatCurrency(p.remainingDebt, state.currency)}`);
                }
                if (p.eurVndRate) {
                  lines.push(`Tỷ giá EUR/VND: ${p.eurVndRate.toLocaleString('vi-VN')} ₫/€`);
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
            grid: { color: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)' },
            ticks: ageAxisTicks()
          },
          y: {
            grid: { color: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: isLight ? '#475569' : '#94a3b8',
              font: { size: 10 },
              maxTicksLimit: 9,
              callback: (val) => window.RetirementEngine.formatCurrency(val, state.currency, true)
            }
          }
        }
      }
    });
  }

  function renderCashFlowChart(proj, force = false) {
    const canvas = document.getElementById("chart-cashflow");
    if (!canvas) return;

    // Tránh render khi wrapper đang bị ẩn (để không tạo Chart instance kích thước 0x0)
    const wrapCf = document.getElementById("wrapper-chart-cashflow");
    if (!force && wrapCf && wrapCf.style.display === 'none') {
      return;
    }

    const ctx = canvas.getContext("2d");
    const activePlan = getActivePlan();
    const isStrategyActive = activePlan.enableWithdrawalStrategy !== false;
    const stratKey = activePlan.withdrawalStrategy || 'guyton_klinger';
    const stratMap = {
      'guyton_klinger': 'Guyton-Klinger',
      'bengen_4pct': 'Bengen 4%',
      'vpw': 'VPW',
      'fixed_pct': 'Fixed %'
    };
    const stratName = stratMap[stratKey] || 'Guyton-Klinger';

    // Chế độ hiển thị: Dùng chung chế độ Nominal/Real với biểu đồ Tài sản Ròng
    const viewMode = state.viewMode || (window.AppState && typeof window.AppState.getViewMode === 'function' ? window.AppState.getViewMode() : 'nominal') || 'nominal';
    const isNominal = viewMode === 'nominal';

    const activeChartTab = (window.AppState && typeof window.AppState.getMainChartTab === 'function')
      ? window.AppState.getMainChartTab()
      : (state.mainChartTab || 'cashflow');

    const noticeEl = document.getElementById("cashflow-inflation-notice");
    if (noticeEl) {
      noticeEl.style.display = (isNominal && activeChartTab === 'cashflow') ? "flex" : "none";
    }

    // Kiểm tra xem người dùng có đang chọn kích hoạt mô phỏng biến cố nào không
    const isStressActive = Boolean(state.cashflowStressScenario);
    const scKey = state.cashflowStressScenario;
    const scProj = (isStressActive && window.RetirementEngine && typeof window.RetirementEngine.runProjection === 'function')
      ? window.RetirementEngine.runProjection(activePlan, scKey)
      : null;
    const activeProj = (isStressActive && scProj) ? scProj : proj;

    // Cập nhật Cột mốc cuộc đời dùng chung
    renderMilestonesRibbon(activeProj);

    // Dữ liệu đường cơ sở (Baseline Projection) - Luôn dùng từ proj chuẩn
    const baseTimeline = proj.timeline || [];
    const labels = baseTimeline.map(p => [`${p.age}t`, `${p.year}`]);

    const baseIncomes = baseTimeline.map(p => {
      const val = isNominal ? (p.income || 0) : ((p.cumInflation > 0) ? ((p.income || 0) / p.cumInflation) : (p.income || 0));
      return Math.round(val);
    });
    const baseExpenses = baseTimeline.map(p => {
      const val = isNominal ? (p.expenses || 0) : ((p.cumInflation > 0) ? ((p.expenses || 0) / p.cumInflation) : (p.expenses || 0));
      return Math.round(val);
    });
    const baseWithdrawals = baseTimeline.map(p => {
      if (!p.isRetired || !(p.withdrawal > 0)) return null;
      const val = isNominal ? p.withdrawal : ((p.cumInflation > 0) ? (p.withdrawal / p.cumInflation) : p.withdrawal);
      return Math.round(val);
    });

    if (state.charts.cashflow) {
      state.charts.cashflow.destroy();
    }

    const milestoneMap = new Map();
    (activeProj.milestones || []).forEach(m => {
      if (!milestoneMap.has(m.age)) {
        milestoneMap.set(m.age, m);
      }
    });

    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const sym = window.RetirementEngine.getCurrencySymbol(state.currency);

    // 3 MÀU CƠ SỞ BẤT BIẾN: Thu nhập XANH LÁ CÂY, Chi tiêu MÀU ĐỎ, Rút vốn MÀU TÍM
    const incomeColor = isLight ? '#059669' : '#10b981';     // Xanh lá cây chuẩn
    const expenseColor = isLight ? '#e11d48' : '#f43f5e';    // Màu đỏ chuẩn
    const withdrawalColor = isLight ? '#7c3aed' : '#a855f7'; // Màu tím chuẩn

    // Điểm mốc trên đường cơ sở (không vẽ chấm cam)
    const pointRadii = baseTimeline.map(p => {
      return milestoneMap.has(p.age) ? 4.5 : 0;
    });
    const pointHoverRadii = baseTimeline.map(p => {
      return milestoneMap.has(p.age) ? 7.5 : 5;
    });

    const incomePointBgs = baseTimeline.map(() => incomeColor);
    const expensePointBgs = baseTimeline.map(() => expenseColor);

    // Điểm đầu và cuối đoạn rút vốn cơ sở
    const withdrawalRadii = baseTimeline.map((p, idx) => {
      const val = baseWithdrawals[idx];
      if (val === null || val === undefined) return 0;
      const isStart = (idx === 0 || baseWithdrawals[idx - 1] === null || baseWithdrawals[idx - 1] === undefined);
      const isEnd = (idx === baseWithdrawals.length - 1 || baseWithdrawals[idx + 1] === null || baseWithdrawals[idx + 1] === undefined);
      if (isStart || isEnd) {
        return 6.0;
      }
      if (milestoneMap.has(p.age)) {
        return 4.5;
      }
      return 0;
    });

    const withdrawalHoverRadii = baseTimeline.map((p, idx) => {
      return (baseWithdrawals[idx] !== null && baseWithdrawals[idx] !== undefined) ? 8.0 : 0;
    });

    const withdrawalPointBgs = baseTimeline.map(() => withdrawalColor);

    const gradientIncome = ctx.createLinearGradient(0, 0, 0, 320);
    gradientIncome.addColorStop(0, isLight ? 'rgba(5, 150, 105, 0.32)' : 'rgba(16, 185, 129, 0.35)');
    gradientIncome.addColorStop(1, isLight ? 'rgba(5, 150, 105, 0.02)' : 'rgba(16, 185, 129, 0.02)');

    const gradientExpense = ctx.createLinearGradient(0, 0, 0, 320);
    gradientExpense.addColorStop(0, isLight ? 'rgba(225, 29, 72, 0.25)' : 'rgba(244, 63, 94, 0.28)');
    gradientExpense.addColorStop(1, isLight ? 'rgba(225, 29, 72, 0.02)' : 'rgba(244, 63, 94, 0.02)');

    const gradientWithdrawal = ctx.createLinearGradient(0, 0, 0, 320);
    gradientWithdrawal.addColorStop(0, isLight ? 'rgba(124, 58, 237, 0.22)' : 'rgba(168, 85, 247, 0.25)');
    gradientWithdrawal.addColorStop(1, isLight ? 'rgba(124, 58, 237, 0.02)' : 'rgba(168, 85, 247, 0.02)');

    // Tự động xác định các khoảng tuổi không cân đối được chi tiêu trong kịch bản đang xem
    const deficitIntervals = [];
    let curDeficitInterval = null;

    activeProj.timeline.forEach((p, idx) => {
      const inc = isNominal ? (p.income || 0) : ((p.cumInflation > 0) ? ((p.income || 0) / p.cumInflation) : (p.income || 0));
      const exp = isNominal ? (p.expenses || 0) : ((p.cumInflation > 0) ? ((p.expenses || 0) / p.cumInflation) : (p.expenses || 0));
      const wd = (p.isRetired && p.withdrawal > 0)
        ? (isNominal ? p.withdrawal : ((p.cumInflation > 0) ? (p.withdrawal / p.cumInflation) : p.withdrawal))
        : 0;

      const hasDeficit = p.isRetired && (exp - (inc + wd) > 50);

      if (hasDeficit) {
        const gap = exp - (inc + wd);
        if (!curDeficitInterval) {
          curDeficitInterval = {
            startIdx: idx,
            endIdx: idx,
            startAge: p.age,
            endAge: p.age,
            startYear: p.year,
            endYear: p.year,
            maxDeficit: gap
          };
        } else {
          curDeficitInterval.endIdx = idx;
          curDeficitInterval.endAge = p.age;
          curDeficitInterval.endYear = p.year;
          curDeficitInterval.maxDeficit = Math.max(curDeficitInterval.maxDeficit, gap);
        }
      } else {
        if (curDeficitInterval) {
          deficitIntervals.push(curDeficitInterval);
          curDeficitInterval = null;
        }
      }
    });
    if (curDeficitInterval) {
      deficitIntervals.push(curDeficitInterval);
    }

    // Cập nhật dải cảnh báo (alert strip) phía trên đồ thị
    const alertStrip = document.getElementById("cashflow-deficit-alert-strip");
    const alertText = document.getElementById("cashflow-deficit-alert-text");
    if (alertStrip && alertText) {
      if (deficitIntervals.length > 0 && activeChartTab === 'cashflow') {
        const intervalStrs = deficitIntervals.map(it => {
          if (it.startAge === it.endAge) {
            return `từ <strong>${it.startAge} tuổi</strong> (năm ${it.startYear})`;
          }
          return `từ <strong>${it.startAge} đến ${it.endAge} tuổi</strong> (năm ${it.startYear} – ${it.endYear})`;
        });
        alertText.innerHTML = `Cảnh báo: Dòng tiền không đủ bù đắp chi tiêu ở các khoảng tuổi: ${intervalStrs.join(', ')}. Hãy cân nhắc tăng vốn tích lũy, giảm chi tiêu hoặc điều chỉnh tỷ lệ rút vốn.`;
        alertStrip.style.display = "flex";
      } else {
        alertStrip.style.display = "none";
      }
    }

    // Plugin vẽ interval (vùng nền đỏ nhạt + đường gióng biên nét đứt, không viết text pill) và mốc cuộc đời
    const milestoneMarkersCashFlowPlugin = {
      id: 'milestoneMarkersCashFlowPlugin',
      beforeDatasetsDraw(chart) {
        drawDeficitIntervalsBackground(chart, deficitIntervals, isLight);
      },
      afterDatasetsDraw(chart) {
        drawDeficitIntervalsLines(chart, deficitIntervals, isLight);
        drawMilestoneMarkers(chart, activeProj, isLight);
      }
    };

    const incomeLabel = (window.I18n && window.I18n.t) ? window.I18n.t('chart_income_label', 'Thu nhập') : 'Thu nhập';
    const expenseLabel = (window.I18n && window.I18n.t) ? window.I18n.t('chart_expense_label', 'Chi tiêu') : 'Chi tiêu';
    const withdrawalLabel = (window.I18n && window.I18n.t) ? window.I18n.t('chart_withdrawal_flow', 'Dòng tiền Rút vốn') : 'Dòng tiền Rút vốn';

    // 1. CÁC ĐƯỜNG CƠ SỞ (BASELINE): LUÔN LÀ NÉT LIỀN (borderDash: []) VỚI 3 MÀU CHUẨN XANH LÁ, ĐỎ, TÍM
    const datasets = [
      {
        label: `${incomeLabel} (${sym})`,
        data: baseIncomes,
        borderColor: incomeColor,
        backgroundColor: gradientIncome,
        borderWidth: 2.8,
        borderDash: [], // LUÔN LÀ NÉT LIỀN
        fill: true,
        tension: 0.35,
        pointRadius: pointRadii,
        pointHoverRadius: pointHoverRadii,
        pointHitRadius: 15,
        pointBackgroundColor: incomePointBgs,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        order: 3
      },
      {
        label: `${expenseLabel} (${sym})`,
        data: baseExpenses,
        borderColor: expenseColor,
        backgroundColor: gradientExpense,
        borderWidth: 2.8,
        borderDash: [], // LUÔN LÀ NÉT LIỀN
        fill: true,
        tension: 0.35,
        pointRadius: pointRadii,
        pointHoverRadius: pointHoverRadii,
        pointHitRadius: 15,
        pointBackgroundColor: expensePointBgs,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        order: 2
      },
      {
        label: `${withdrawalLabel} (${sym})`,
        data: baseWithdrawals,
        borderColor: withdrawalColor,
        backgroundColor: gradientWithdrawal,
        borderWidth: 3.0,
        borderDash: [], // LUÔN LÀ NÉT LIỀN
        fill: false,
        tension: 0.35,
        spanGaps: false,
        pointRadius: withdrawalRadii,
        pointHoverRadius: withdrawalHoverRadii,
        pointHitRadius: 15,
        pointBackgroundColor: withdrawalPointBgs,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2.5,
        order: 1
      }
    ];

    // 2. CÁC ĐƯỜNG KỊCH BẢN BIẾN CỐ: LUÔN LÀ NÉT ĐỨT (borderDash) VỚI MÀU TƯƠNG PHẢN RÕ NÉT
    if (isStressActive && scProj) {
      if (scKey === 'market_crash') {
        // Biến cố 1: Khủng hoảng thị trường sớm (-35%) -> Tác động rút vốn, màu CAM RỰC RỠ nét đứt
        const crashWithdrawals = scProj.timeline.map(p => {
          if (!p.isRetired || !(p.withdrawal > 0)) return null;
          const val = isNominal ? p.withdrawal : ((p.cumInflation > 0) ? (p.withdrawal / p.cumInflation) : p.withdrawal);
          return Math.round(val);
        });
        datasets.push({
          label: `Rút vốn khi Khủng hoảng (-35% • Nét đứt) (${sym})`,
          data: crashWithdrawals,
          borderColor: isLight ? '#ea580c' : '#fb923c', // Cam rực rỡ (tương phản mạnh với Tím, Đỏ, Xanh)
          borderWidth: 2.8,
          borderDash: [7, 4], // NÉT ĐỨT
          fill: false,
          tension: 0.35,
          spanGaps: false,
          pointRadius: 0,
          pointHoverRadius: 6,
          order: 0
        });
      } else if (scKey === 'high_inflation') {
        // Biến cố 2: Lạm phát phi mã (+4.5%/năm) -> Tác động chi tiêu, màu VÀNG HỔ PHÁCH nét đứt
        const inflExpenses = scProj.timeline.map(p => {
          const val = isNominal ? (p.expenses || 0) : ((p.cumInflation > 0) ? ((p.expenses || 0) / p.cumInflation) : (p.expenses || 0));
          return Math.round(val);
        });
        datasets.push({
          label: `Chi tiêu khi Bão giá (+4.5%/năm • Nét đứt) (${sym})`,
          data: inflExpenses,
          borderColor: isLight ? '#d97706' : '#f59e0b', // Vàng hổ phách (tương phản rõ rệt với Đỏ cơ bản)
          borderWidth: 2.8,
          borderDash: [6, 4], // NÉT ĐỨT
          fill: false,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 6,
          order: 0
        });
      } else if (scKey === 'medical_shock') {
        // Biến cố 3: Sốc chi phí y tế tuổi 65 (+500Tr) -> Tác động chi tiêu, màu XANH LAM BIỂN TƯƠI nét đứt
        const medExpenses = scProj.timeline.map(p => {
          const val = isNominal ? (p.expenses || 0) : ((p.cumInflation > 0) ? ((p.expenses || 0) / p.cumInflation) : (p.expenses || 0));
          return Math.round(val);
        });
        datasets.push({
          label: `Chi tiêu khi Sốc y tế Tuổi 65 (Nét đứt) (${sym})`,
          data: medExpenses,
          borderColor: isLight ? '#0284c7' : '#38bdf8', // Xanh lam biển tươi (tương phản hoàn toàn với Đỏ)
          borderWidth: 2.8,
          borderDash: [5, 4], // NÉT ĐỨT
          fill: false,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 6,
          order: 0
        });
      }
    }

    state.charts.cashflow = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets
      },
      plugins: [milestoneMarkersCashFlowPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
          axis: 'x'
        },
        elements: {
          point: {
            hitRadius: 15
          }
        },
        onClick: (evt, activeElements) => {
          if (activeElements && activeElements.length > 0) {
            const idx = activeElements[0].index;
            if (state.charts.networth) {
              state.charts.networth.setActiveElements([{ datasetIndex: 0, index: idx }]);
              state.charts.networth.tooltip.setActiveElements([{ datasetIndex: 0, index: idx }], { x: 0, y: 0 });
              state.charts.networth.update();
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              color: isLight ? '#334155' : '#94a3b8',
              font: { family: 'Inter, sans-serif', size: 11, weight: '600' }
            }
          },
          tooltip: {
            animation: { duration: 100 },
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.95)',
            titleColor: isLight ? '#0f172a' : '#f8fafc',
            bodyColor: isLight ? '#334155' : '#cbd5e1',
            borderColor: isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              title: (items) => {
                const idx = items[0].dataIndex;
                const p = activeProj.timeline[idx];
                const phaseStr = p ? (p.isRetired ? ' • Hưu trí' : ' • Tích lũy') : '';
                const m = p ? milestoneMap.get(p.age) : null;
                if (m) {
                  return `Tuổi ${p.age} (Năm ${p.year})${phaseStr} • ${m.name}`;
                }
                return p ? `Tuổi ${p.age} (Năm ${p.year})${phaseStr}` : '';
              },
              label: (item) => {
                const valAnnual = item.raw;
                if (valAnnual === null || valAnnual === undefined) return null;
                const valMonthly = valAnnual / 12;
                const currSym = state.currency;
                const formattedAnnual = window.RetirementEngine.formatCurrency(valAnnual, currSym, false);
                const formattedMonthly = window.RetirementEngine.formatCurrency(valMonthly, currSym, false);
                const idx = item.dataIndex;
                const p = activeProj.timeline[idx];
                const factor = isNominal ? 1 : ((p && p.cumInflation > 0) ? p.cumInflation : 1);

                if (item.datasetIndex === 0) {
                  const name = (window.I18n && window.I18n.t) ? window.I18n.t('chart_income_label', 'Thu nhập') : 'Thu nhập';
                  const mainLine = ` ${name}: ${formattedAnnual}/năm (${formattedMonthly}/tháng)`;
                  const subLines = [];
                  if (p && Array.isArray(p.incomeBreakdown) && p.incomeBreakdown.length > 0) {
                    p.incomeBreakdown.forEach(inc => {
                      if (inc.amount !== 0 && inc.monthly !== undefined) {
                        const isNeg = inc.monthly < 0;
                        const dispMonthly = inc.monthly / factor;
                        const mFmt = window.RetirementEngine.formatCurrency(dispMonthly, currSym, false);
                        const prefix = isNeg ? '   - ' : '   + ';
                        const signPrefix = (!isNeg && !mFmt.startsWith('+')) ? '+' : '';
                        subLines.push(`${prefix}${inc.name}: ${signPrefix}${mFmt}/tháng`);
                      }
                    });
                  }
                  return subLines.length > 0 ? [mainLine, ...subLines] : mainLine;
                }

                if (item.datasetIndex === 1) {
                  const name = (window.I18n && window.I18n.t) ? window.I18n.t('chart_expense_label', 'Chi tiêu') : 'Chi tiêu';
                  const mainLine = ` ${name}: ${formattedAnnual}/năm (${formattedMonthly}/tháng)`;
                  const subLines = [];
                  if (p && Array.isArray(p.expenseBreakdown) && p.expenseBreakdown.length > 0) {
                    p.expenseBreakdown.forEach(exp => {
                      const dispMonthly = Math.abs(exp.monthly) / factor;
                      const mFmt = window.RetirementEngine.formatCurrency(dispMonthly, currSym, false);
                      if (exp.isAllowance) {
                        subLines.push(`   + ${exp.name}: -${mFmt}/tháng`);
                      } else if (exp.amount !== 0) {
                        subLines.push(`   - ${exp.name}: ${mFmt}/tháng`);
                      }
                    });
                  }
                  return subLines.length > 0 ? [mainLine, ...subLines] : mainLine;
                }

                if (item.datasetIndex === 2) {
                  const name = withdrawalLabel;
                  return ` ${name}: ${formattedAnnual}/năm (${formattedMonthly}/tháng)`;
                }

                return ` ${formattedAnnual}/năm (${formattedMonthly}/tháng)`;
              },
              afterBody: (items) => {
                const idx = items[0].dataIndex;
                const p = activeProj.timeline[idx];
                if (!p) return [];
                const currSym = state.currency;
                const factor = isNominal ? 1 : ((p.cumInflation > 0) ? p.cumInflation : 1);
                const lines = [];

                if (!p.isRetired) {
                  // Giai đoạn tích lũy: Tiết kiệm
                  const income = (p.income || 0) / factor;
                  const expenses = (p.expenses || 0) / factor;
                  const savingsAnnual = income - expenses;
                  const savingsMonthly = savingsAnnual / 12;
                  const sign = savingsAnnual > 0 ? '+' : '';
                  const formattedAnnual = window.RetirementEngine.formatCurrency(savingsAnnual, currSym, false);
                  const formattedMonthly = window.RetirementEngine.formatCurrency(savingsMonthly, currSym, false);
                  const rate = income > 0 ? ((savingsAnnual / income) * 100).toFixed(1) : '0';
                  lines.push(` Tiết kiệm: ${sign}${formattedAnnual}/năm (${sign}${formattedMonthly}/tháng), Tỷ lệ: ${rate}%`);
                } else {
                  // Giai đoạn hưu trí: Tổng khả dụng & Cân đối dòng tiền
                  const income = (p.income || 0) / factor;
                  const withdrawal = (p.withdrawal || 0) / factor;
                  const totalCash = income + withdrawal;
                  const expenses = (p.expenses || 0) / factor;
                  const diff = totalCash - expenses;
                  const sign = diff >= 0 ? '+' : '';
                  const totalFormatted = window.RetirementEngine.formatCurrency(totalCash, currSym, false);
                  const totalMonthly = window.RetirementEngine.formatCurrency(totalCash / 12, currSym, false);
                  const diffFormatted = window.RetirementEngine.formatCurrency(Math.abs(diff), currSym, false);

                  lines.push(` Tổng tiền khả dụng: ${totalFormatted}/năm (${totalMonthly}/tháng)`);
                  if (diff >= 0) {
                    lines.push(` Cân đối chi tiêu: Đảm bảo 100% (Dư ${sign}${diffFormatted}/năm)`);
                  } else {
                    lines.push(` Cân đối chi tiêu: Thiếu hụt -${diffFormatted}/năm`);
                  }

                  if (isStrategyActive && withdrawal === 0 && (p.portfolioEnd || 0) <= 0) {
                    lines.push(` ⚠️ Quỹ đầu tư cạn kiệt (0€) do nghỉ hưu sớm thiếu thanh khoản`);
                  }
                }

                const m = milestoneMap.get(p.age);
                if (m && m.desc) {
                  lines.push(` Mốc sự kiện: ${m.desc}`);
                }

                // Ghi chú chi tiết lạm phát & trượt giá theo yêu cầu người dùng
                if (isNominal) {
                  const cumInfl = p.cumInflation || 1;
                  const inflPct = Math.round((cumInfl - 1) * 100);
                  const inflStr = inflPct >= 0 ? `+${inflPct}%` : `${inflPct}%`;
                  const tNotice = (window.I18n && window.I18n.t)
                    ? window.I18n.t('cashflow_tooltip_nominal_tag', 'Đã tính lạm phát & trượt giá')
                    : 'Đã tính lạm phát & trượt giá';
                  lines.push(` 📌 Lưu ý: Số liệu năm ${p.year} ${tNotice} (${inflStr}, hệ số x${cumInfl.toFixed(2)})`);
                } else {
                  const tRealNotice = (window.I18n && window.I18n.t)
                    ? window.I18n.t('cashflow_tooltip_real_tag', 'Sức mua hiện tại (Real)')
                    : 'Sức mua hiện tại (Real)';
                  lines.push(` 💡 Chế độ: ${tRealNotice} • Đã chiết khấu lạm phát`);
                }

                return lines;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)' },
            ticks: ageAxisTicks()
          },
          y: {
            grid: { color: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: isLight ? '#475569' : '#94a3b8',
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
    if (!tbody) return;
    tbody.innerHTML = "";

    const activePlan = getActivePlan();
    const actualRecords = (activePlan && Array.isArray(activePlan.actualRecords)) ? activePlan.actualRecords : [];
    const actualMapByYear = new Map();
    [...actualRecords].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(rec => {
      if (!rec.date) return;
      const yr = new Date(rec.date).getFullYear();
      if (!isNaN(yr)) {
        actualMapByYear.set(yr, rec);
      }
    });

    const planRetireAge = proj.retireAge || Number(getActivePlan().retireAge) || 60;
    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    proj.timeline.forEach(row => {
      const tr = document.createElement("tr");
      let statusTag = '';
      if (row.isPast) {
        statusTag = '<span style="font-size:0.68rem; padding:1px 5px; border-radius:4px; background:var(--bg-input); color:var(--text-muted); border:1px solid var(--border-subtle);">Quá khứ</span>';
      } else if (row.age === planRetireAge) {
        statusTag = `<span class="badge" style="font-size:0.68rem; padding:2px 7px; border-radius:4px; background:${isLight ? 'rgba(254, 243, 199, 0.9)' : 'rgba(245, 158, 11, 0.25)'}; color:${isLight ? '#b45309' : '#fef08a'}; border:1px solid ${isLight ? '#d97706' : '#f59e0b'}; font-weight:700;">Bắt đầu Hưu</span>`;
        tr.style.background = isLight ? "rgba(254, 243, 199, 0.35)" : "rgba(245, 158, 11, 0.12)";
      } else if (row.isRetired) {
        statusTag = '<span class="summary-status">Hưu</span>';
      } else if (row.age === (Number(getActivePlan().currentAge) || 29)) {
        statusTag = '<span class="badge" style="font-size:0.68rem; padding:1px 5px; border-radius:4px; background:var(--bg-accent-subtle); color:var(--primary); font-weight:700;">Hiện tại</span>';
      }

      const forecastVal = state.viewMode === "nominal" ? row.portfolioEnd : row.realPortfolioEnd;
      const actRec = actualMapByYear.get(row.year);
      let actTd = `<td style="color:var(--text-muted); text-align:center;">—</td>`;
      let diffTd = `<td style="color:var(--text-muted); text-align:center;">—</td>`;

      if (actRec) {
        const diff = actRec.amount - forecastVal;
        const diffPct = forecastVal !== 0 ? ((diff / Math.abs(forecastVal)) * 100).toFixed(1) : '0';
        const sign = diff >= 0 ? '+' : '';
        const colorClass = diff >= 0 ? 'text-success' : 'text-danger';
        actTd = `<td class="font-mono" style="color:#f59e0b; font-weight:700;" title="${actRec.date}${actRec.note ? ' - ' + actRec.note : ''}">${window.RetirementEngine.formatCurrency(actRec.amount, state.currency)}</td>`;
        diffTd = `<td class="font-mono ${colorClass}" style="font-weight:600;">${sign}${window.RetirementEngine.formatCurrency(diff, state.currency)} <span style="font-size:0.72rem;">(${sign}${diffPct}%)</span></td>`;
      }

      tr.innerHTML = `
        <td><strong>${row.age} tuổi</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${row.year})</span> ${statusTag}</td>
        <td>${window.RetirementEngine.formatCurrency(row.income, state.currency)}</td>
        <td class="text-danger">${window.RetirementEngine.formatCurrency(row.expenses, state.currency)}</td>
        <td class="${row.netCashFlow >= 0 ? 'text-success' : 'text-warning'} font-mono">${window.RetirementEngine.formatCurrency(row.netCashFlow, state.currency)}</td>
        <td class="text-accent">+${(row.isRetired ? getActivePlan().investmentReturnPost : getActivePlan().investmentReturnPre)}%</td>
        <td class="text-faint">${window.RetirementEngine.formatCurrency(row.tax, state.currency)}</td>
        <td class="font-mono"><strong>${window.RetirementEngine.formatCurrency(forecastVal, state.currency)}</strong></td>
        ${actTd}
        ${diffTd}
      `;
      tbody.appendChild(tr);
    });
  }


  // -------------------------------------------------------------
  // TAB 4: Monte Carlo Simulation
  // -------------------------------------------------------------
  function renderMonteCarloTab() {
    const plan = getActivePlan();
    const vol = parseVal("inp-mc-volatility", 15.0);
    const iters = parseVal("inp-mc-iterations", 1000);

    const res = window.MonteCarloSimulator.runSimulation(plan, iters, vol);

    const elSuccess = document.getElementById("mc-display-success");
    if (elSuccess) elSuccess.innerText = res.successRate + "%";
    const elP10 = document.getElementById("mc-stat-p10");
    if (elP10) elP10.innerText = window.RetirementEngine.formatCurrency(res.p10[res.p10.length - 1], state.currency);
    const elP50 = document.getElementById("mc-stat-p50");
    if (elP50) elP50.innerText = window.RetirementEngine.formatCurrency(res.p50[res.p50.length - 1], state.currency);
    const elP90 = document.getElementById("mc-stat-p90");
    if (elP90) elP90.innerText = window.RetirementEngine.formatCurrency(res.p90[res.p90.length - 1], state.currency);

    const srrBox = document.getElementById("srr-status-box");
    if (srrBox) {
      const sRate = parseFloat(res.successRate);
      const isHigh = sRate >= 80;
      const isMed = sRate >= 50;
      const lvlText = isHigh ? "Rất cao" : (isMed ? "Trung bình" : "Thấp (Cần điều chỉnh)");
      const lvlClass = isHigh ? "text-success" : (isMed ? "text-warning" : "text-danger");
      const isExcessWithdrawal = (plan.enableWithdrawalStrategy !== false && plan.smartWithdrawalCap === false);
      const excessTipHtml = isExcessWithdrawal
        ? `<div style="margin-top: 0.35rem; font-size: 0.72rem; color: #d97706; line-height: 1.4;">
             ⚠️ <strong>Gợi ý:</strong> Tỷ lệ thành công đang bị kéo giảm do bạn đang rút cố định theo tỷ lệ SWR vượt nhu cầu thực tế sau lương hưu. Khuyến nghị chỉ rút bù đắp phần thiếu hụt để bảo toàn danh mục.
           </div>`
        : "";

      srrBox.innerHTML = `
        <div class="srr-level">Mức độ an toàn: <strong class="${lvlClass}">${lvlText} (${res.successRate}%)</strong></div>
        <p>${isHigh 
          ? "Danh mục có sức chống chịu tuyệt vời trước các đợt suy thoái nhờ đệm tài sản vững và dòng tiền hưu trí trợ lực." 
          : "Khuyến nghị tăng thêm mức tiết kiệm hàng tháng hoặc lùi tuổi nghỉ hưu 1–2 năm để tăng tỷ lệ sống sót qua các đợt suy thoái."}</p>
        ${excessTipHtml}
      `;
    }

    // Keep sidebar in sync
    const probEl = document.getElementById("summary-success-prob");
    const statusEl = document.getElementById("summary-fire-status");
    if (probEl) {
      probEl.innerText = res.successRate + "%";
      probEl.className = "metric-value " + (parseFloat(res.successRate) >= 80 ? "text-success font-semibold" : (parseFloat(res.successRate) >= 50 ? "text-warning font-semibold" : "text-danger font-semibold"));
    }
    if (statusEl) {
      const proj = window.RetirementEngine.runProjection(plan);
      const optAge = proj.optimalFireAge;
      const userRetireAge = Number(plan.retirementAge) || 42;
      const sRate = parseFloat(res.successRate);
      const allCriteriaOk = updateFireCriteriaStatus(plan, proj, sRate);
      const isOptimalReached = allCriteriaOk || (optAge ? (userRetireAge >= optAge) : false);
      const t = (k, fb) => (window.I18n ? window.I18n.t(k, fb) : fb);

      if (sRate >= 80) {
        if (isOptimalReached) {
          statusEl.innerText = t('status_solid', 'Vững chắc');
          statusEl.className = "summary-status status-success";
        } else {
          statusEl.innerText = t('status_suboptimal', 'Chưa tối ưu');
          statusEl.className = "summary-status status-warning";
        }
      } else if (sRate >= 50) {
        statusEl.innerText = t('status_risky', 'Khá Rủi ro');
        statusEl.className = "summary-status status-warning";
      } else {
        statusEl.innerText = t('status_needs_adjust', 'Cần Điều chỉnh');
        statusEl.className = "summary-status status-danger";
      }
    }

    const canvas = document.getElementById("chart-monte-carlo");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (state.charts.mc) {
      state.charts.mc.destroy();
    }

    const curYear = new Date().getFullYear();
    const bYear = Number(plan.birthYear) || (curYear - (Number(plan.currentAge) || 29));

    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    // Gradient fill mượt mà cho đường trung vị (P50) đồng bộ với biểu đồ Net Worth
    const gradientMedian = ctx.createLinearGradient(0, 0, 0, 320);
    gradientMedian.addColorStop(0, isLight ? 'rgba(5, 150, 105, 0.18)' : 'rgba(16, 185, 129, 0.22)');
    gradientMedian.addColorStop(1, 'rgba(16, 185, 129, 0.01)');

    const labels = res.ageAxis.map(a => [`${a}t`, `${bYear + a}`]);

    state.charts.mc = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '90th Percentile (Thị trường Bùng nổ)',
            data: res.p90,
            borderColor: isLight ? '#0284c7' : '#38bdf8',
            borderWidth: 2.2,
            borderDash: [5, 4],
            fill: false,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: isLight ? '#0284c7' : '#38bdf8',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHitRadius: 15
          },
          {
            label: '75th Percentile',
            data: res.p75,
            borderColor: isLight ? '#2563eb' : '#60a5fa',
            borderWidth: 2.2,
            fill: false,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: isLight ? '#2563eb' : '#60a5fa',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHitRadius: 15
          },
          {
            label: '50th Percentile (Trung vị Kỳ vọng)',
            data: res.p50,
            borderColor: isLight ? '#059669' : '#10b981',
            backgroundColor: gradientMedian,
            borderWidth: 3.5,
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 7,
            pointBackgroundColor: isLight ? '#059669' : '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2.5,
            pointHitRadius: 15
          },
          {
            label: '25th Percentile',
            data: res.p25,
            borderColor: isLight ? '#d97706' : '#f59e0b',
            borderWidth: 2.2,
            fill: false,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: isLight ? '#d97706' : '#f59e0b',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHitRadius: 15
          },
          {
            label: '10th Percentile (Thị trường Gấu / Khủng hoảng)',
            data: res.p10,
            borderColor: isLight ? '#dc2626' : '#ef4444',
            borderWidth: 2.8,
            fill: false,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: isLight ? '#dc2626' : '#ef4444',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHitRadius: 15
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
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 14,
              boxHeight: 14,
              color: isLight ? '#334155' : '#94a3b8',
              font: { family: 'Inter, sans-serif', size: 11, weight: '600' }
            }
          },
          tooltip: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.95)',
            titleColor: isLight ? '#0f172a' : '#f8fafc',
            bodyColor: isLight ? '#334155' : '#cbd5e1',
            borderColor: isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              title: (items) => {
                const idx = items[0].dataIndex;
                if (labels[idx] && Array.isArray(labels[idx])) {
                  return `Tuổi ${labels[idx][0].replace('t', '')} (Năm ${labels[idx][1]})`;
                }
                return '';
              },
              label: (item) => ` ${item.dataset.label}: ${window.RetirementEngine.formatCurrency(item.raw, state.currency, false)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)' },
            ticks: ageAxisTicks()
          },
          y: {
            grid: { color: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: isLight ? '#475569' : '#94a3b8',
              font: { size: 10 },
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
        bestCase: window.RetirementEngine.formatCurrency(res.p90 ? res.p90[res.p90.length - 1] : 0, state.currency),
        volatility: vol + "%",
        iterations: iters,
        averageFailureAge: res.averageFailureAge || null
      });
    }
  }

  // -------------------------------------------------------------
  // TAB 5: What-If Scenarios
  // -------------------------------------------------------------
  function renderScenarioTab() {
    const plan = getActivePlan();
    const lifeExp = Number(plan.lifeExpectancy) || 85;

    const titleEl = document.getElementById("scenario-chart-title");
    const descEl = document.getElementById("scenario-chart-desc");
    if (titleEl) titleEl.innerText = "So sánh Tất cả Kịch bản Thử thách & Biến cố Tài chính";
    if (descEl) descEl.innerText = "Đánh giá sức chịu đựng của danh mục trước 5 kịch bản biến cố kinh tế và cuộc đời (tất cả đường nét liền so sánh trực quan).";

    const canvas = document.getElementById("chart-scenarios");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (state.charts.scenarios) {
      state.charts.scenarios.destroy();
      state.charts.scenarios = null;
    }

    const scenariosList = [
      { 
        key: "baseline", 
        name: "1. Cơ sở", 
        color: "#38bdf8", 
        desc: "Điều kiện kinh tế bình thường, lạm phát và lợi nhuận ổn định." 
      },
      { 
        key: "market_crash", 
        name: "2. Khủng hoảng Sớm (-35%)", 
        color: "#ef4444", 
        desc: "Thị trường sụt giảm -35% ngay 2 năm đầu nghỉ hưu (Rủi ro Sequence of Returns)." 
      },
      { 
        key: "high_inflation", 
        name: "3. Lạm phát Phi mã (7%/năm)", 
        color: "#f59e0b", 
        desc: "Bão giá đẩy chi phí sinh hoạt tăng vọt 30% liên tục trong 5 năm đầu." 
      },
      { 
        key: "medical_shock", 
        name: "4. Cú sốc Y tế (Tuổi 65)", 
        color: "#ec4899", 
        desc: "Chi phí y tế phát sinh đột xuất 500 triệu (~18k €) ngoài bảo hiểm cơ bản." 
      },
      { 
        key: "downsizing", 
        name: "5. Bán bớt Nhà (Tuổi 60)", 
        color: "#10b981", 
        desc: "Bán nhà lớn đổi căn hộ nhỏ, giải phóng 2 tỷ VND (~73k €) tái đầu tư sinh lời." 
      }
    ];

    const baselineProj = window.RetirementEngine.runProjection(plan, null);
    const baseFinalNW = baselineProj.finalPortfolio;

    // Run projections for all 5 scenarios and collect summary metrics
    const scenarioSummaries = scenariosList.map(sc => {
      const proj = window.RetirementEngine.runProjection(plan, sc.key === 'baseline' ? null : sc.key);
      const finalNW = proj.finalPortfolio;
      const diff = finalNW - baseFinalNW;
      return {
        key: sc.key,
        name: sc.name,
        color: sc.color,
        desc: sc.desc,
        timeline: proj.timeline,
        finalPortfolio: finalNW,
        finalPortfolioFormatted: window.RetirementEngine.formatCurrency(finalNW, state.currency),
        netWorthDiff: diff,
        netWorthDiffFormatted: (diff === 0 ? '±€0' : (diff > 0 ? '+' : '') + window.RetirementEngine.formatCurrency(diff, state.currency)),
        survived: proj.survived
      };
    });

    // Populate the scenario lines explanation matching Tab 2 strategy-card UI
    const explanationContainer = document.getElementById("scenario-lines-explanation");
    if (explanationContainer) {
      explanationContainer.innerHTML = scenarioSummaries.map(sc => {
        const statusBadge = sc.survived 
          ? `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 0.72rem; padding: 2px 8px; border-radius: 4px; font-weight: 600;">100% Sống sót</span>`
          : `<span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 0.72rem; padding: 2px 8px; border-radius: 4px; font-weight: 600;">Có rủi ro cạn vốn</span>`;
        
        const diffColor = sc.netWorthDiff > 0 ? '#34d399' : (sc.netWorthDiff < 0 ? '#f87171' : '#94a3b8');

        return `
          <div class="strategy-card" style="border-left: 3px solid ${sc.color}; cursor: default; margin-bottom: 0;">
            <div class="strategy-content">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; flex-wrap: wrap; gap: 0.4rem;">
                <div class="strategy-name" style="color: ${sc.color}; display: flex; align-items: center; gap: 6px; margin: 0; font-size: 0.88rem;">
                  <span class="scenario-color-dot" style="background: ${sc.color}; width: 9px; height: 9px; border-radius: 50%; display: inline-block; flex-shrink: 0;"></span>
                  <span>${sc.name}</span>
                </div>
                ${statusBadge}
              </div>
              <div class="strategy-detail" style="font-size: 0.76rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 0.45rem;">
                ${sc.desc}
              </div>
              <div class="strategy-kpis-mini" style="margin: 0;">
                <div class="kpi-mini-item">Số dư tuổi ${lifeExp}: <strong class="font-mono" style="color: var(--text-main);">${sc.finalPortfolioFormatted}</strong></div>
                <div class="kpi-mini-item">Độ lệch: <strong class="font-mono" style="color: ${diffColor};">${sc.netWorthDiffFormatted}</strong></div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    const datasets = scenarioSummaries.map(sc => ({
      label: sc.name,
      data: sc.timeline.map(p => p.portfolioEnd),
      borderColor: sc.color,
      borderWidth: 2.5,
      borderDash: [],
      fill: false,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointBackgroundColor: sc.color,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointHitRadius: 15
    }));

    state.charts.scenarios = new Chart(ctx, {
      type: 'line',
      data: {
        labels: baselineProj.timeline.map(p => [`${p.age}t`, `${p.year}`]),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { 
            display: true,
            position: 'top',
            labels: { 
              color: isLight ? '#334155' : '#94a3b8', 
              font: { family: 'Inter, sans-serif', size: 11, weight: '600' }, 
              boxWidth: 14,
              boxHeight: 14,
              usePointStyle: false
            } 
          },
          tooltip: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.95)',
            titleColor: isLight ? '#0f172a' : '#f8fafc',
            bodyColor: isLight ? '#334155' : '#cbd5e1',
            borderColor: isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              title: (items) => {
                const idx = items[0].dataIndex;
                const p = baselineProj.timeline[idx];
                return p ? `Tuổi ${p.age} (Năm ${p.year})` : '';
              },
              label: (item) => ` ${item.dataset.label}: ${window.RetirementEngine.formatCurrency(item.raw, state.currency, false)}`
            }
          }
        },
        scales: {
          x: { 
            grid: { color: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)' }, 
            ticks: ageAxisTicks() 
          },
          y: {
            grid: { color: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: isLight ? '#475569' : '#94a3b8',
              font: { size: 10 },
              callback: (val) => window.RetirementEngine.formatCurrency(val, state.currency, true)
            }
          }
        }
      }
    });

    // Trigger Gemini Commentary analyzing ALL scenarios simultaneously
    if (window.GeminiAdvisor) {
      window.GeminiAdvisor.updateChartBox("chart-scenarios", "So sánh Tổng thể Cả 5 Kịch bản Thử thách & Biến cố", {
        mode: "all_scenarios",
        lifeExpectancy: lifeExp,
        retireAge: Number(plan.retirementAge) || 42,
        baseFinalNW: window.RetirementEngine.formatCurrency(baseFinalNW, state.currency),
        scenarios: scenarioSummaries.map(s => ({
          key: s.key,
          name: s.name,
          finalPortfolio: s.finalPortfolioFormatted,
          netWorthDiff: s.netWorthDiffFormatted,
          survived: s.survived ? "100% Sống sót" : "Có rủi ro cạn vốn"
        }))
      });
    }
  }

  const Tab1ChartsExports = {
    bindEvents: bindTab1ChartEvents,
    switchMainChartTab,
    triggerPlanProjectionsInsight,
    renderMilestonesRibbon,
    renderStressResilienceCard,
    updateFireCriteriaStatus,
    drawMilestoneMarkers,
    renderNetWorthChart,
    renderCashFlowChart,
    renderProjectionsTable,
    renderMonteCarloTab,
    renderScenarioTab
  };

  window.Tab1ChartsUI = Tab1ChartsExports;
  window.Tab1ProjectionsUI = Object.assign(window.Tab1ProjectionsUI || {}, Tab1ChartsExports);
  Object.assign(window, Tab1ChartsExports);

})();
