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
    // Compare 4 Withdrawal Strategies Toggle on Net Worth Chart
    const btnToggleCompare = document.getElementById("btn-toggle-compare-withdrawals");
    if (btnToggleCompare) {
      btnToggleCompare.addEventListener("click", () => {
        state.compareWithdrawals = !state.compareWithdrawals;
        btnToggleCompare.classList.toggle("active", state.compareWithdrawals);
        if (state.compareWithdrawals) {
          if (state.compareStressScenarios) {
            state.compareStressScenarios = false;
            const btnStress = document.getElementById("btn-toggle-compare-stress");
            if (btnStress) btnStress.classList.remove("active");
          }
          if (state.showMonteCarloFan) {
            state.showMonteCarloFan = false;
            const btnMcFan = document.getElementById("btn-toggle-mc-fan");
            if (btnMcFan) btnMcFan.classList.remove("active");
          }
        }
        const plan = getActivePlan();
        const proj = window.RetirementEngine.runProjection(plan);
        renderNetWorthChart(proj);
      });
    }

    // Compare 3 Worst Stress Scenarios Toggle on Net Worth Chart
    const btnToggleStress = document.getElementById("btn-toggle-compare-stress");
    if (btnToggleStress) {
      btnToggleStress.addEventListener("click", () => {
        state.compareStressScenarios = !state.compareStressScenarios;
        btnToggleStress.classList.toggle("active", state.compareStressScenarios);
        if (state.compareStressScenarios) {
          if (state.compareWithdrawals) {
            state.compareWithdrawals = false;
            const btnWithdrawals = document.getElementById("btn-toggle-compare-withdrawals");
            if (btnWithdrawals) btnWithdrawals.classList.remove("active");
          }
          if (state.showMonteCarloFan) {
            state.showMonteCarloFan = false;
            const btnMcFan = document.getElementById("btn-toggle-mc-fan");
            if (btnMcFan) btnMcFan.classList.remove("active");
          }
        }
        const plan = getActivePlan();
        const proj = window.RetirementEngine.runProjection(plan);
        renderNetWorthChart(proj);
      });
    }

    // Toggle Monte Carlo Fan Chart on Net Worth Chart
    const btnToggleMcFan = document.getElementById("btn-toggle-mc-fan");
    if (btnToggleMcFan) {
      btnToggleMcFan.addEventListener("click", () => {
        state.showMonteCarloFan = !state.showMonteCarloFan;
        btnToggleMcFan.classList.toggle("active", state.showMonteCarloFan);
        if (state.showMonteCarloFan) {
          if (state.compareWithdrawals) {
            state.compareWithdrawals = false;
            const btnWithdrawals = document.getElementById("btn-toggle-compare-withdrawals");
            if (btnWithdrawals) btnWithdrawals.classList.remove("active");
          }
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

    if (state.compareWithdrawals) {
      chartSummary.compareWithdrawalsActive = true;
      const stratKeys = [
        { key: "bengen", name: "Bengen 4% Rule" },
        { key: "guyton_klinger", name: "Guyton-Klinger" },
        { key: "vpw", name: "VPW" },
        { key: "fixed", name: "Fixed %" }
      ];
      chartSummary.strategiesComparison = stratKeys.map(s => {
        const p = { ...plan, withdrawalStrategy: s.key };
        const r = window.RetirementEngine.runProjection(p);
        return {
          name: s.name,
          finalPortfolio: window.RetirementEngine.formatCurrency(r.finalPortfolio, state.currency),
          survived: r.survived ? "100% Đạt mục tiêu" : "Có rủi ro cạn vốn"
        };
      });
    }

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
      chip.className = "milestone-chip";
      chip.title = m.desc || `${m.name} (Tuổi ${m.age}${yearStr})`;
      
      let amtHtml = "";
      if (m.amount) {
        const sign = m.type === "income" ? "+" : "-";
        amtHtml = `<span class="milestone-chip-amount">${sign}${window.RetirementEngine.formatCurrency(m.amount, state.currency, true)}</span>`;
      }

      chip.innerHTML = `
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

    // Cập nhật trạng thái hiển thị trên Sidebar: 4. Chịu được các biến cố lớn cuộc đời
    const sidebarStatus = document.getElementById("sidebar-stress-status");
    if (sidebarStatus) {
      const medText = lang === 'en' ? 'Medical Shock' : (lang === 'fr' ? 'Choc Médical' : 'Bệnh tật');
      const crashText = lang === 'en' ? 'Market Crash' : (lang === 'fr' ? 'Krach Boursier' : 'Khủng hoảng');
      const infText = lang === 'en' ? 'High Inflation' : (lang === 'fr' ? 'Inflation' : 'Lạm phát');

      const floorLabel = lang === 'en' ? 'Asset Floor' : (lang === 'fr' ? 'Plancher de capital' : 'Sàn tài sản');
      const floorVal = lang === 'en' ? 'Need <strong>≥ 5 yrs</strong> expenses' : (lang === 'fr' ? 'Nécessite <strong>≥ 5 ans</strong> dépenses' : 'Cần <strong>≥ 5 năm</strong> chi tiêu');
      const spendLabel = lang === 'en' ? 'Spending & Living Standard' : (lang === 'fr' ? 'Dépenses & Niveau de vie' : 'Chi tiêu & Mức sống');
      const spendVal = lang === 'en' ? 'Maintain <strong>≥ 80%</strong>' : (lang === 'fr' ? 'Maintenir <strong>≥ 80%</strong>' : 'Đảm bảo <strong>≥ 80%</strong>');

      sidebarStatus.innerHTML = `
        <div>${medText}, ${crashText}, ${infText}</div>
        <div style="color: var(--text-muted); font-size: 0.67rem; border-top: 1px dashed var(--border-subtle); padding-top: 0.25rem; margin-top: 0.1rem; line-height: 1.4;">
          • <strong>${floorLabel}:</strong> ${floorVal}<br>
          • <strong>${spendLabel}:</strong> ${spendVal}
        </div>
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
      const scDesc = (lang === 'en' ? sc.descEn : (lang === 'fr' ? sc.descFr : sc.descVi)) || sc.descVi;
      const scAdvice = (lang === 'en' ? sc.adviceEn : (lang === 'fr' ? sc.adviceFr : sc.adviceVi)) || sc.adviceVi;

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

          <div class="stress-box-drawer">
            <div class="stress-drawer-section">
              <span class="stress-drawer-label">📖 ${t('stress_mechanism_label', 'Bản chất rủi ro:')}</span>
              <p class="stress-drawer-content">${scDesc}</p>
            </div>
            <div class="stress-drawer-section advice-section">
              <span class="stress-drawer-label">💡 ${t('stress_advice_label', 'Mẹo phòng thủ chiến thuật:')}</span>
              <p class="stress-drawer-content">${scAdvice}</p>
            </div>
            ${gapDetailsHtml}
          </div>
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
      state.compareWithdrawals = false;
      const btnStress = document.getElementById("btn-toggle-compare-stress");
      if (btnStress) btnStress.classList.add("active");
      const btnWithdrawals = document.getElementById("btn-toggle-compare-withdrawals");
      if (btnWithdrawals) btnWithdrawals.classList.remove("active");

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

    // 1. Nhóm các mốc theo độ tuổi để triệt tiêu việc vẽ đè các mốc trùng tuổi (như 3 căn hộ tất toán cùng tuổi 46)
    const milestonesByAge = new Map();
    proj.milestones.forEach(m => {
      if (!milestonesByAge.has(m.age)) {
        milestonesByAge.set(m.age, []);
      }
      milestonesByAge.get(m.age).push(m);
    });

    const uniqueAges = Array.from(milestonesByAge.keys()).sort((a, b) => a - b);
    const pillH = 18;
    const tierGapY = 21;
    // Hỗ trợ 3 tầng hàng thẻ ghim (Tier 0, 1, 2) so le để các mốc ở các năm liền kề không bao giờ bị đè ngang
    const tierLastRight = [-Infinity, -Infinity, -Infinity];

    ctx.save();

    uniqueAges.forEach((age) => {
      const idx = proj.timeline.findIndex(p => p.age === age);
      if (idx === -1) return;
      const xPos = x.getPixelForValue(idx);
      if (xPos < chartArea.left - 5 || xPos > chartArea.right + 5) return;

      const p = proj.timeline[idx];
      const yearBadge = p ? ` (${p.year})` : '';
      const labelText = `${age}t${yearBadge}`;

      ctx.font = '600 10px Inter, sans-serif';
      const textMetrics = ctx.measureText(labelText);
      const pillW = Math.max(62, Math.ceil(textMetrics.width + 14));

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

      // 1. Đường gióng nét đứt thẳng đứng từ chân thẻ ghim xuống đáy biểu đồ
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = unifiedMilestoneLine;
      ctx.lineWidth = 1.3;
      ctx.globalAlpha = 1.0;
      ctx.moveTo(xPos, pillY + pillH);
      ctx.lineTo(xPos, chartArea.bottom);
      ctx.stroke();

      // Nếu thẻ ghim bị dịch chuyển ngang nhẹ để né đè chữ, vẽ nét nối nhỏ từ tâm thẻ đến trục xPos
      if (Math.abs((pillX + pillW / 2) - xPos) > 2) {
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = unifiedMilestoneLine;
        ctx.lineWidth = 1;
        ctx.moveTo(pillX + pillW / 2, pillY + pillH);
        ctx.lineTo(xPos, pillY + pillH + 4);
        ctx.stroke();
      }

      // 2. Vẽ hình thẻ ghim (Badge pill)
      ctx.fillStyle = unifiedMilestoneBg;
      ctx.strokeStyle = unifiedMilestoneBorder;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([]);
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(pillX, pillY, pillW, pillH, 4);
      } else {
        ctx.rect(pillX, pillY, pillW, pillH);
      }
      ctx.fill();
      ctx.stroke();

      // 3. Viết chữ vào trong thẻ ghim
      ctx.fillStyle = unifiedMilestoneText;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, pillX + pillW / 2, pillY + pillH / 2);
    });

    ctx.restore();
  }

  function renderNetWorthChart(proj) {
    const ctx = document.getElementById("chart-networth").getContext("2d");
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

    const pointRadii = proj.timeline.map(p => milestoneMap.has(p.age) ? 5.5 : 0);
    const pointHoverRadii = proj.timeline.map(p => milestoneMap.has(p.age) ? 8.5 : 5);
    const pointBgColors = proj.timeline.map(p => {
      return milestoneMap.has(p.age) ? unifiedMilestoneColor : coolNetWorthColor;
    });
    const pointBorderColors = proj.timeline.map(p => {
      return milestoneMap.has(p.age) ? '#ffffff' : coolNetWorthColor;
    });
    const pointBorderWidths = proj.timeline.map(p => milestoneMap.has(p.age) ? 2 : 0);

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

    const chosenStrat = activePlan.withdrawalStrategy || 'guyton_klinger';
    const hasRealEstate = proj.timeline.some(p => (p.homeEquity || 0) > 0);
    const sym = window.RetirementEngine.getCurrencySymbol(state.currency);

    const strategies = [
      { key: "guyton_klinger", name: "Lan can Guyton-Klinger", color: isLight ? "#047857" : "#10b981", borderDash: [] },
      { key: "bengen_4pct", name: "Quy tắc 4% Cố định (Bengen)", color: isLight ? "#0284c7" : "#38bdf8", borderDash: [] },
      { key: "vpw", name: "Tỷ lệ Thay đổi (VPW)", color: isLight ? "#7c3aed" : "#c084fc", borderDash: [6, 3] },
      { key: "fixed_pct", name: "Tỷ lệ Cố định (Fixed %)", color: isLight ? "#ea580c" : "#fb923c", borderDash: [4, 4] }
    ];

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
    } else if (!state.compareWithdrawals && !state.showMonteCarloFan) {
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
      const isComparing = (state.compareWithdrawals || state.compareStressScenarios || state.showMonteCarloFan);
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
    } else if (state.compareWithdrawals) {
      // 4 Nhánh Chiến Lược Rút Tiền:
      strategies.forEach(strat => {
        const isChosen = (strat.key === chosenStrat);
        const tempPlan = { ...activePlan, withdrawalStrategy: strat.key, enableWithdrawalStrategy: true };
        const res = window.RetirementEngine.runProjection(tempPlan);

        const stratData = proj.timeline.map(p => {
          if (p.age < proj.retireAge) {
            return state.viewMode === "nominal" ? p.portfolioEnd : p.realPortfolioEnd;
          }
          const matchRow = res.timeline.find(r => r.age === p.age);
          if (!matchRow) return null;
          return state.viewMode === "nominal" ? matchRow.portfolioEnd : matchRow.realPortfolioEnd;
        });

        datasets.push({
          label: isChosen ? `${strat.name} (Đang chọn)` : strat.name,
          data: stratData,
          borderColor: strat.color,
          borderWidth: isChosen ? 3.2 : 2.0,
          borderDash: strat.borderDash || [],
          backgroundColor: isChosen ? (isLight ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.12)') : 'transparent',
          fill: false,
          tension: 0.35,
          pointRadius: proj.timeline.map(p => (p.age === proj.retireAge && isChosen) ? 4.5 : 0),
          pointHoverRadius: isChosen ? 6 : 5,
          pointBackgroundColor: strat.color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHitRadius: 15,
          order: isChosen ? 1 : 3
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
          intersect: false
        },
        plugins: {
          legend: {
            display: state.compareWithdrawals || state.compareStressScenarios || state.showMonteCarloFan || hasRealEstate || hasActualData,
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

  function renderCashFlowChart(proj) {
    const ctx = document.getElementById("chart-cashflow").getContext("2d");
    const activePlan = getActivePlan();
    const stratKey = activePlan.withdrawalStrategy || 'guyton_klinger';
    const stratMap = {
      'guyton_klinger': 'Guyton-Klinger',
      'bengen_4pct': 'Bengen 4%',
      'vpw': 'VPW',
      'fixed_pct': 'Fixed %'
    };
    const stratName = stratMap[stratKey] || 'Guyton-Klinger';

    const labels = proj.timeline.map(p => [`${p.age}t`, `${p.year}`]);
    const incomes = proj.timeline.map(p => p.income);
    const expenses = proj.timeline.map(p => p.expenses);
    const withdrawals = proj.timeline.map(p => p.isRetired ? (p.withdrawal || 0) : null);

    if (state.charts.cashflow) {
      state.charts.cashflow.destroy();
    }

    const milestoneMap = new Map();
    (proj.milestones || []).forEach(m => {
      if (!milestoneMap.has(m.age)) {
        milestoneMap.set(m.age, m);
      }
    });

    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const sym = window.RetirementEngine.getCurrencySymbol(state.currency);

    const incomeColor = isLight ? '#059669' : '#10b981';
    const expenseColor = isLight ? '#e11d48' : '#f43f5e';
    const withdrawalColor = isLight ? '#7c3aed' : '#a855f7';

    const pointRadii = proj.timeline.map(p => milestoneMap.has(p.age) ? 4.5 : 0);
    const pointHoverRadii = proj.timeline.map(p => milestoneMap.has(p.age) ? 7.5 : 6);

    const gradientIncome = ctx.createLinearGradient(0, 0, 0, 320);
    gradientIncome.addColorStop(0, isLight ? 'rgba(5, 150, 105, 0.32)' : 'rgba(16, 185, 129, 0.35)');
    gradientIncome.addColorStop(1, isLight ? 'rgba(5, 150, 105, 0.02)' : 'rgba(16, 185, 129, 0.02)');

    const gradientExpense = ctx.createLinearGradient(0, 0, 0, 320);
    gradientExpense.addColorStop(0, isLight ? 'rgba(225, 29, 72, 0.25)' : 'rgba(244, 63, 94, 0.28)');
    gradientExpense.addColorStop(1, isLight ? 'rgba(225, 29, 72, 0.02)' : 'rgba(244, 63, 94, 0.02)');

    const gradientWithdrawal = ctx.createLinearGradient(0, 0, 0, 320);
    gradientWithdrawal.addColorStop(0, isLight ? 'rgba(124, 58, 237, 0.22)' : 'rgba(168, 85, 247, 0.25)');
    gradientWithdrawal.addColorStop(1, isLight ? 'rgba(124, 58, 237, 0.02)' : 'rgba(168, 85, 247, 0.02)');

    // Custom Plugin to Draw Milestone Vertical Guidelines & Floating Pins on Cash Flow Chart
    const milestoneMarkersCashFlowPlugin = {
      id: 'milestoneMarkersCashFlowPlugin',
      afterDatasetsDraw(chart) {
        drawMilestoneMarkers(chart, proj, isLight);
      }
    };

    const isStrategyActive = activePlan.enableWithdrawalStrategy !== false;

    const datasets = [
      {
        label: `Thu nhập Hàng năm (${sym})`,
        data: incomes,
        borderColor: incomeColor,
        backgroundColor: gradientIncome,
        borderWidth: 2.8,
        fill: true,
        tension: 0.35,
        pointRadius: pointRadii,
        pointHoverRadius: pointHoverRadii,
        pointBackgroundColor: incomeColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      },
      {
        label: `Chi tiêu Sinh hoạt (${sym})`,
        data: expenses,
        borderColor: expenseColor,
        backgroundColor: gradientExpense,
        borderWidth: 2.8,
        fill: true,
        tension: 0.35,
        pointRadius: pointRadii,
        pointHoverRadius: pointHoverRadii,
        pointBackgroundColor: expenseColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }
    ];

    if (isStrategyActive) {
      datasets.push({
        label: `Dòng tiền Rút vốn [${stratName}] (${sym})`,
        data: withdrawals,
        borderColor: withdrawalColor,
        backgroundColor: gradientWithdrawal,
        borderWidth: 2.8,
        borderDash: [5, 4],
        fill: false,
        tension: 0.35,
        pointRadius: pointRadii,
        pointHoverRadius: pointHoverRadii,
        pointBackgroundColor: withdrawalColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      });
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
          intersect: false
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
                let name = 'Thu nhập ngoài';
                if (item.datasetIndex === 1) name = 'Chi tiêu sinh hoạt';
                else if (item.datasetIndex === 2) name = `Rút vốn (${stratName})`;
                return ` ${name}: ${formattedAnnual}/năm (${formattedMonthly}/tháng)`;
              },
              afterBody: (items) => {
                const idx = items[0].dataIndex;
                const p = proj.timeline[idx];
                if (!p) return [];
                const currSym = state.currency;
                const lines = [];

                if (!p.isRetired) {
                  // Giai đoạn tích lũy: Tiết kiệm
                  const income = p.income || 0;
                  const expenses = p.expenses || 0;
                  const savingsAnnual = income - expenses;
                  const savingsMonthly = savingsAnnual / 12;
                  const sign = savingsAnnual > 0 ? '+' : '';
                  const formattedAnnual = window.RetirementEngine.formatCurrency(savingsAnnual, currSym, false);
                  const formattedMonthly = window.RetirementEngine.formatCurrency(savingsMonthly, currSym, false);
                  const rate = income > 0 ? ((savingsAnnual / income) * 100).toFixed(1) : '0';
                  lines.push(` Tiết kiệm: ${sign}${formattedAnnual}/năm (${sign}${formattedMonthly}/tháng), Tỷ lệ: ${rate}%`);
                } else {
                  // Giai đoạn hưu trí: Tổng khả dụng & Cân đối dòng tiền
                  const income = p.income || 0;
                  const withdrawal = p.withdrawal || 0;
                  const totalCash = income + withdrawal;
                  const expenses = p.expenses || 0;
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
                }

                const m = milestoneMap.get(p.age);
                if (m && m.desc) {
                  lines.push(` Mốc sự kiện: ${m.desc}`);
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

    proj.timeline.forEach(row => {
      const tr = document.createElement("tr");
      let statusTag = '';
      if (row.isPast) {
        statusTag = '<span style="font-size:0.68rem; padding:1px 5px; border-radius:4px; background:var(--bg-input); color:var(--text-muted); border:1px solid var(--border-subtle);">Quá khứ</span>';
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
      srrBox.innerHTML = `
        <div class="srr-level">Mức độ an toàn: <strong class="${lvlClass}">${lvlText} (${res.successRate}%)</strong></div>
        <p>${isHigh 
          ? "Danh mục có sức chống chịu tuyệt vời trước các đợt suy thoái nhờ đệm tài sản vững và dòng tiền hưu trí trợ lực." 
          : "Khuyến nghị tăng thêm mức tiết kiệm hàng tháng hoặc lùi tuổi nghỉ hưu 1–2 năm để tăng tỷ lệ sống sót qua các đợt suy thoái."}</p>
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
      const optAge = proj.optimalFireAge || proj.fireAge;
      const userRetireAge = Number(plan.retirementAge) || 42;
      const isOptimalReached = optAge ? (userRetireAge >= optAge) : true;
      const sRate = parseFloat(res.successRate);
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
    triggerPlanProjectionsInsight,
    renderMilestonesRibbon,
    renderStressResilienceCard,
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
