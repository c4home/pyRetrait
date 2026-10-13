/**
 * pyRetrait — Gemini AI Chart Advisor & Real-time Financial Strategist
 * Powered by Google Gemini 3.8 Flash / Built-in Gemini Financial Intelligence
 */

window.GeminiAdvisor = (function () {
  const cache = {};

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

  /**
   * Request Gemini analysis for a specific chart
   */
  async function fetchChartInsight(chartId, chartTitle, chartSummary, forceRefresh = false) {
    const plan = window.RetirementApp ? window.RetirementApp.getActivePlan() : {};
    const cacheKey = computeCacheKey(chartId, chartSummary);

    if (!forceRefresh && cache[cacheKey]) {
      return cache[cacheKey];
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
      cache[cacheKey] = data;
      return data;
    } catch (err) {
      console.warn(`[GeminiAdvisor] API call failed for ${chartId}:`, err);
      return {
        success: false,
        source: "fallback",
        model: "Gemini Intelligence",
        analysis: `### Đánh giá từ Gemini AI\n- Đang hiển thị dữ liệu mô phỏng dựa trên cấu hình hiện tại của bạn.\n- Hãy đảm bảo các thông số đầu vào được cập nhật đầy đủ để nhận được phân tích tối ưu.`
      };
    }
  }

  const chartMetaCache = {};

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

    const cacheKey = computeCacheKey(chartId, chartSummary);
    const isCached = !forceRefresh && !!cache[cacheKey];

    // Chỉ hiển thị hiệu ứng tải khi bắt buộc làm mới hoặc khi có biến thay đổi chưa có trong cache
    if (!isCached) {
      contentEl.innerHTML = `
        <div class="gemini-loading">
          <span class="gemini-spinner"></span>
          <span>Gemini AI đang phân tích dữ liệu chuyên sâu...</span>
        </div>
      `;
    }

    const data = await fetchChartInsight(chartId, chartTitle, chartSummary, forceRefresh);

    function resolveModelLabel(modelStr, source) {
      if (source !== "gemini_api") {
        return modelStr || "Ngoại tuyến";
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

    const modelLabel = resolveModelLabel(data.model, data.source);

    if (badgeEl) {
      if (data.source === "gemini_api") {
        badgeEl.innerHTML = `${modelLabel}`;
        badgeEl.className = "gemini-engine-badge badge-api";
      } else {
        badgeEl.innerHTML = `${modelLabel}`;
        badgeEl.className = "gemini-engine-badge badge-engine";
      }
    }

    // Place timestamp right next to title / badge in header
    let timeEl = document.getElementById(`gemini-time-${chartId}`);
    if (!timeEl && badgeEl && badgeEl.parentElement) {
      timeEl = document.createElement("span");
      timeEl.id = `gemini-time-${chartId}`;
      timeEl.className = "gemini-header-time";
      badgeEl.parentElement.appendChild(timeEl);
    }
    if (timeEl) {
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const isFallback = (data.source !== "gemini_api");
      if (isFallback) {
        timeEl.className = "gemini-header-time is-fallback";
        timeEl.innerHTML = `<span class="gemini-warning-symbol">⚠</span> Cập nhật lúc: ${nowStr} (Ngoại tuyến)`;
        timeEl.title = "Đang sử dụng bộ phân tích cục bộ do không có kết nối API hoặc hạn ngạch bị gián đoạn";
      } else {
        timeEl.className = "gemini-header-time";
        timeEl.innerHTML = `Cập nhật lúc: ${nowStr}`;
        timeEl.title = "Phân tích trực tuyến từ Google Gemini AI";
      }
    }

    if (contentEl) {
      contentEl.innerHTML = renderMarkdown(data.analysis || "");
      contentEl.classList.remove("gemini-anim-fade");
      void contentEl.offsetWidth; // trigger reflow
      contentEl.classList.add("gemini-anim-fade");
    }
  }

  /**
   * Clear cache for a plan or all charts
   */
  function clearCache() {
    for (const k in cache) delete cache[k];
  }

  return {
    renderMarkdown,
    fetchChartInsight,
    updateChartBox,
    clearCache
  };
})();
