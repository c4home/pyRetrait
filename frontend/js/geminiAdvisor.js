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
    html = html.replace(/^---$/gim, '<hr class="gemini-divider" style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0.8rem 0;">');

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

  /**
   * Request Gemini analysis for a specific chart
   */
  async function fetchChartInsight(chartId, chartTitle, chartSummary, forceRefresh = false) {
    const plan = window.RetirementApp ? window.RetirementApp.getActivePlan() : {};
    const cacheKey = `${chartId}_${plan.id || "default"}_${window.RetirementApp?.getCurrency() || "EUR"}`;

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
        analysis: `### 💡 Đánh giá từ Gemini AI\n- Đang hiển thị dữ liệu mô phỏng dựa trên cấu hình hiện tại của bạn.\n- Hãy đảm bảo các thông số đầu vào được cập nhật đầy đủ để nhận được phân tích tối ưu.`
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

    if (forceRefresh) {
      contentEl.innerHTML = `
        <div class="gemini-loading">
          <span class="gemini-spinner"></span>
          <span>Gemini AI đang phân tích dữ liệu chuyên sâu...</span>
        </div>
      `;
    }

    const data = await fetchChartInsight(chartId, chartTitle, chartSummary, forceRefresh);

    if (badgeEl) {
      if (data.source === "gemini_api") {
        badgeEl.innerHTML = `✨ ${data.model || "gemini-2.5-flash"}`;
        badgeEl.className = "gemini-engine-badge badge-api";
      } else {
        badgeEl.innerHTML = `ℹ️ ${data.model || "Ngoại tuyến"}`;
        badgeEl.className = "gemini-engine-badge badge-engine";
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
