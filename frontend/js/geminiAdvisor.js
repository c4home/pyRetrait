/**
 * pyRetrait — Gemini AI Chart Advisor & Real-time Financial Strategist
 * Powered by Google Gemini 3.8 Flash / Built-in Gemini Financial Intelligence
 *
 * Chế độ On-Demand Testing & Compact Layout:
 * - Không tự động gọi API khi refresh trang web hoặc đổi biến.
 * - Nút hành động duy nhất nằm trên Header (chuyển đổi động: Tạo nhận xét AI / Phân tích lại / Cập nhật nhận xét).
 * - Không tạo nút trùng lặp trong phần nội dung.
 * - Nhận xét và cảnh báo hiển thị trực tiếp bên dưới tiêu đề để tiết kiệm tối đa diện tích.
 * - Badges và Timestamp hiển thị nằm ngay cạnh tiêu đề.
 */

window.GeminiAdvisor = (function () {
  const STORAGE_KEY = "pyretrait_gemini_insights_v1";
  const ramCache = {};
  const chartMetaCache = {};

  // Simple, safe Markdown-to-HTML parser for financial insights
  function renderMarkdown(md) {
    if (!md) return "";
    let html = md
      // Escape basic HTML
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="gemini-divider">');

    // Headers (supports #, ##, ###, ####)
    html = html.replace(/^#### (.*$)/gim, '<h4 class="gemini-subheading">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h4 class="gemini-subheading">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="gemini-heading">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="gemini-main-heading">$1</h2>');

    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Unordered lists (supports both - and *)
    html = html.replace(/^\s*[-*•]\s+(.*$)/gim, '<li class="gemini-bullet-item">$1</li>');
    html = html.replace(/(<li class="gemini-bullet-item">.*<\/li>\s*)+/g, '<ul class="gemini-bullet-list">$&</ul>');

    // Numbered lists
    html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li class="gemini-num-item">$2</li>');
    html = html.replace(/(<li class="gemini-num-item">.*<\/li>\s*)+/g, '<ol class="gemini-num-list">$&</ol>');

    // Blockquotes / TL;DR Callouts
    html = html.replace(/^\s*&gt;\s*(.*$)/gim, '<div class="gemini-tldr">$1</div>');

    // Paragraphs
    html = html.replace(/\n\n+/g, '</p><p class="gemini-para">');
    html = '<p class="gemini-para">' + html + '</p>';

    // Cleanup empty paragraphs around lists/headers/dividers/callouts
    html = html.replace(/<p class="gemini-para">\s*(<h\d|<ul|<ol|<hr|<div)/g, '$1');
    html = html.replace(/(<\/h\d>|<\/ul>|<\/ol>|<hr[^>]*>|<\/div>)\s*<\/p>/g, '$1');
    html = html.replace(/<p class="gemini-para">\s*<\/p>/g, '');

    return html;
  }

  // Simple 32-bit FNV-1a string hashing for data fingerprinting
  function hashString(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(36);
  }

  function computeCacheKey(chartId, chartSummary) {
    const plan = window.RetirementApp ? window.RetirementApp.getActivePlan() : {};
    const currency = window.RetirementApp?.getCurrency() || "EUR";

    // Trích xuất các biến tài chính cốt lõi có ảnh hưởng trực tiếp đến kết quả tính toán
    const planCore = {
      id: plan.id,
      curSav: plan.currentSavings,
      annSav: plan.annualSavings,
      retExp: plan.retirementExpenses,
      curAge: plan.currentAge,
      retAge: plan.retirementAge,
      lifeExp: plan.lifeExpectancy,
      retReturn: plan.expectedReturn,
      inf: plan.inflationRate,
      strat: plan.withdrawalStrategy,
      swr: plan.initialWithdrawalRate,
      tax: plan.taxRegime,
      salaries: plan.salaries,
      realEstate: plan.realEstate
    };

    const payload = JSON.stringify({
      planCore,
      chartSummary: chartSummary || {},
      currency
    });

    return `${chartId}_${hashString(payload)}`;
  }

  function getStoredInsights() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn("[GeminiAdvisor] Error reading localStorage:", e);
      return {};
    }
  }

  function setStoredInsight(chartId, entry) {
    try {
      const all = getStoredInsights();
      all[chartId] = entry;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      console.warn("[GeminiAdvisor] Error writing to localStorage:", e);
    }
  }

  function resolveModelLabel(modelStr, source) {
    if (source !== "gemini_api") {
      return modelStr || (window.I18n ? window.I18n.t("gemini_offline_badge", "Ngoại tuyến") : "Ngoại tuyến");
    }
    if (!modelStr) return "gemini-3.5-flash-lite";
    let m = modelStr.trim().replace(/^models\//, "");
    const map = {
      "gemini-flash-lite-latest": "gemini-3.5-flash-lite",
      "gemini-flash-latest": "gemini-2.5-flash",
      "gemini-pro-latest": "gemini-2.5-pro"
    };
    if (map[m]) return map[m];
    if (m.endsWith("-latest")) return m.replace("-latest", "");
    return m;
  }

  /**
   * Đồng bộ trạng thái và nhãn nút bấm hành động duy nhất trên Header
   */
  function updateActionButton(chartId, state) {
    // state: "empty" | "stale" | "fresh" | "loading"
    const t = (k, fallback) => (window.I18n ? window.I18n.t(k, fallback) : fallback);
    const refreshBtns = document.querySelectorAll(`.btn-gemini-refresh[data-chart="${chartId}"]`);

    refreshBtns.forEach(btn => {
      if (state === "loading") {
        btn.classList.add("is-refreshing");
        btn.classList.remove("btn-gemini-cta", "btn-gemini-stale");
        const label = t("gemini_btn_analyzing", "Đang phân tích...");
        btn.innerHTML = `<span class="btn-gemini-icon">⏳</span> <span class="btn-gemini-label">${label}</span>`;
        btn.title = label;
        return;
      }

      btn.classList.remove("is-refreshing");

      if (state === "empty") {
        btn.classList.remove("btn-gemini-stale");
        btn.classList.add("btn-gemini-cta");
        const label = t("gemini_btn_generate", "Tạo nhận xét AI (Gemini)");
        btn.innerHTML = `<span class="btn-gemini-label">${label}</span>`;
        btn.title = label;
      } else if (state === "stale") {
        btn.classList.remove("btn-gemini-cta");
        btn.classList.add("btn-gemini-stale");
        const label = t("gemini_btn_update", "Cập nhật nhận xét AI");
        btn.innerHTML = `<span class="btn-gemini-icon">⚡</span> <span class="btn-gemini-label">${label}</span>`;
        btn.title = label;
      } else { // "fresh"
        btn.classList.remove("btn-gemini-cta", "btn-gemini-stale");
        const label = t("gemini_btn_reanalyze", "Phân tích lại");
        btn.innerHTML = `<span class="btn-gemini-icon">🔄</span> <span class="btn-gemini-label">${label}</span>`;
        btn.title = label;
      }
    });
  }

  /**
   * Request Gemini analysis for a specific chart from backend API
   */
  async function fetchChartInsight(chartId, chartTitle, chartSummary, forceRefresh = false) {
    const plan = window.RetirementApp ? window.RetirementApp.getActivePlan() : {};
    const cacheKey = computeCacheKey(chartId, chartSummary);

    if (!forceRefresh && ramCache[cacheKey]) {
      return ramCache[cacheKey];
    }

    try {
      const resp = await fetch("/api/ai/analyze-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chart_id: chartId,
          chart_title: chartTitle,
          chart_summary: chartSummary || {},
          plan: plan
        })
      });

      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }

      const data = await resp.json();
      ramCache[cacheKey] = data;
      return data;
    } catch (err) {
      console.warn(`[GeminiAdvisor] API call failed for ${chartId}:`, err);
      return {
        success: false,
        source: "fallback",
        model: "Gemini Intelligence",
        analysis: `### Đánh giá Kế hoạch\n- Đang hiển thị dữ liệu mô phỏng dựa trên cấu hình hiện tại của bạn.\n- Hãy đảm bảo các thông số đầu vào được cập nhật đầy đủ để nhận được phân tích tối ưu.`
      };
    }
  }

  /**
   * Render or update the Gemini insight box for a specific chart
   */
  async function updateChartBox(chartId, chartTitle, chartSummary, forceRefresh = false) {
    const contentEl = document.getElementById(`gemini-content-${chartId}`);
    const badgeEl = document.getElementById(`gemini-badge-${chartId}`);
    if (!contentEl) return;

    if (chartTitle && chartTitle !== chartId) {
      chartMetaCache[chartId] = { title: chartTitle, summary: chartSummary || {} };
    } else if (chartMetaCache[chartId]) {
      chartTitle = chartMetaCache[chartId].title;
      chartSummary = chartMetaCache[chartId].summary;
    }

    const currentCacheKey = computeCacheKey(chartId, chartSummary);
    const storedInsights = getStoredInsights();
    const stored = storedInsights[chartId];

    // Tạo hoặc tìm phần tử timestamp trong header (nằm ngay bên cạnh badge)
    let timeEl = document.getElementById(`gemini-time-${chartId}`);
    if (!timeEl && badgeEl && badgeEl.parentElement) {
      timeEl = document.createElement("span");
      timeEl.id = `gemini-time-${chartId}`;
      timeEl.className = "gemini-header-time";
      badgeEl.parentElement.appendChild(timeEl);
    }

    const t = (k, fallback) => (window.I18n ? window.I18n.t(k, fallback) : fallback);

    // TRƯỜNG HỢP 1: KHÔNG PHẢI BẤM NÚT (LOAD TRANG / REFRESH / ĐỔI BIẾN) -> TUYỆT ĐỐI KHÔNG GỌI API!
    if (!forceRefresh) {
      if (stored && stored.data) {
        const isDataChanged = stored.cacheKey !== currentCacheKey;

        if (!isDataChanged) {
          // 1. Thông số khớp hoàn toàn
          if (badgeEl) {
            const modelLabel = resolveModelLabel(stored.data.model, stored.data.source);
            badgeEl.innerHTML = modelLabel;
            badgeEl.className = "gemini-engine-badge " + (stored.data.source === "gemini_api" ? "badge-api" : "badge-engine");
          }
          if (timeEl) {
            timeEl.className = "gemini-header-time";
            timeEl.innerHTML = `${t("gemini_updated_at", "Cập nhật lúc:")} ${stored.data.timeStr || ""}`;
            timeEl.title = stored.data.source === "gemini_api" ? "Phân tích trực tuyến từ Google Gemini AI" : "Phân tích ngoại tuyến";
          }
          contentEl.innerHTML = renderMarkdown(stored.data.analysis || "");
          contentEl.classList.remove("gemini-anim-fade");
          void contentEl.offsetWidth;
          contentEl.classList.add("gemini-anim-fade");

          // Cập nhật nút trên header thành "Phân tích lại"
          updateActionButton(chartId, "fresh");
        } else {
          // 2. Có biến thay đổi -> Badge & Time hiển thị cảnh báo ngay cạnh tiêu đề
          if (badgeEl) {
            const modelLabel = resolveModelLabel(stored.data.model, stored.data.source);
            badgeEl.innerHTML = modelLabel;
            badgeEl.className = "gemini-engine-badge badge-engine";
          }
          if (timeEl) {
            timeEl.className = "gemini-header-time is-fallback";
            timeEl.innerHTML = `<span class="gemini-warning-symbol">⚠️</span> ${t("gemini_stale_time", "Chưa cập nhật")}${stored.data.timeStr ? ` (${stored.data.timeStr})` : ""}`;
            timeEl.title = t("gemini_warning_desc", "Nhận xét bên dưới được tạo từ dữ liệu cũ. Nhấn nút bên trên để phân tích lại theo thông số mới nhất.");
          }

          // Nội dung hiển thị warning inline tinh gọn (không có nút trùng lặp) + nhận xét cũ
          contentEl.innerHTML = `
            <div class="gemini-warning-inline">
              <span class="gemini-warning-icon">⚠️</span>
              <div class="gemini-warning-text">
                <strong>${t("gemini_warning_title", "Thông số kế hoạch đã có thay đổi")}:</strong>
                <span>${t("gemini_warning_desc", "Nhận xét bên dưới được tạo từ dữ liệu cũ. Nhấn nút bên trên để phân tích lại theo thông số mới nhất.")}</span>
              </div>
            </div>
            <div class="gemini-stale-content">
              ${renderMarkdown(stored.data.analysis || "")}
            </div>
          `;
          contentEl.classList.remove("gemini-anim-fade");
          void contentEl.offsetWidth;
          contentEl.classList.add("gemini-anim-fade");

          // Nút trên header chuyển thành "Cập nhật nhận xét"
          updateActionButton(chartId, "stale");
        }
      } else {
        // 3. Chưa từng phân tích -> Hiển thị Empty State inline tinh tế, KHÔNG gọi API
        if (badgeEl) {
          badgeEl.innerHTML = t("gemini_ready_badge", "Sẵn sàng");
          badgeEl.className = "gemini-engine-badge badge-engine";
        }
        if (timeEl) {
          timeEl.innerHTML = "";
          timeEl.className = "gemini-header-time";
        }

        contentEl.innerHTML = `
          <div class="gemini-empty-inline">
            <span>${t("gemini_empty_desc", "Chưa tạo nhận xét AI cho biểu đồ này. Nhấn nút bên trên để Gemini AI phân tích chuyên sâu các chỉ số và đưa ra khuyến nghị chiến lược.")}</span>
          </div>
        `;

        // Nút trên header hiển thị "Tạo nhận xét AI"
        updateActionButton(chartId, "empty");
      }
      return;
    }

    // TRƯỜNG HỢP 2: NGƯỜI DÙNG CHỦ ĐỘNG HIT BUTTON (forceRefresh = true)
    // 1. Cập nhật nút sang trạng thái Loading
    updateActionButton(chartId, "loading");

    // 2. Hiển thị Spinner Loading tinh gọn
    contentEl.innerHTML = `
      <div class="gemini-loading">
        <span class="gemini-spinner"></span>
        <span>${t("gemini_loading", "Đang phân tích dữ liệu chuyên sâu với Gemini AI...")}</span>
      </div>
    `;

    try {
      // 3. Gọi API lấy nhận xét
      const data = await fetchChartInsight(chartId, chartTitle, chartSummary, true);

      // 4. Định dạng và lưu trữ vào localStorage
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date().toLocaleDateString('vi-VN');
      data.timeStr = nowStr;
      data.dateStr = dateStr;

      setStoredInsight(chartId, {
        cacheKey: currentCacheKey,
        data: data
      });

      // 5. Cập nhật Badge & Time cạnh tiêu đề
      const modelLabel = resolveModelLabel(data.model, data.source);
      if (badgeEl) {
        badgeEl.innerHTML = modelLabel;
        badgeEl.className = "gemini-engine-badge " + (data.source === "gemini_api" ? "badge-api" : "badge-engine");
      }

      if (timeEl) {
        if (data.source === "gemini_api") {
          timeEl.className = "gemini-header-time";
          timeEl.innerHTML = `${t("gemini_updated_at", "Cập nhật lúc:")} ${nowStr}`;
          timeEl.title = "Phân tích trực tuyến từ Google Gemini AI";
        } else {
          timeEl.className = "gemini-header-time is-fallback";
          timeEl.innerHTML = `<span class="gemini-warning-symbol">⚠️</span> ${t("gemini_updated_at", "Cập nhật lúc:")} ${nowStr} (${t("gemini_offline_badge", "Ngoại tuyến")})`;
          timeEl.title = "Đang sử dụng bộ phân tích cục bộ do không có kết nối API hoặc hạn ngạch bị gián đoạn";
        }
      }

      // 6. Render nội dung nhận xét hoàn chỉnh
      contentEl.innerHTML = renderMarkdown(data.analysis || "");
      contentEl.classList.remove("gemini-anim-fade");
      void contentEl.offsetWidth;
      contentEl.classList.add("gemini-anim-fade");

      // 7. Cập nhật nút sang trạng thái Fresh (Phân tích lại)
      updateActionButton(chartId, "fresh");
    } catch (err) {
      console.error("[GeminiAdvisor] Error in updateChartBox:", err);
      updateActionButton(chartId, "stale");
    }
  }

  /**
   * Clear cache for all charts (RAM & localStorage)
   */
  function clearCache() {
    for (const k in ramCache) delete ramCache[k];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("[GeminiAdvisor] Error clearing localStorage:", e);
    }

    // Re-render all registered boxes to empty state
    for (const chartId in chartMetaCache) {
      const meta = chartMetaCache[chartId];
      updateChartBox(chartId, meta.title, meta.summary, false);
    }
  }

  // Tự động cập nhật ngôn ngữ khi người dùng chuyển đổi VI / EN / FR
  window.addEventListener("pyretrait:language-changed", () => {
    for (const chartId in chartMetaCache) {
      const meta = chartMetaCache[chartId];
      updateChartBox(chartId, meta.title, meta.summary, false);
    }
  });

  return {
    renderMarkdown,
    fetchChartInsight,
    updateChartBox,
    clearCache
  };
})();
