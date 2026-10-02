/**
 * pyRetrait — pyLocation Core Integration Module (Patrimoine, LMNP & Turo Fleet)
 * Handles France Real Estate (LMNP), Turo car fleet calculations, chart visualization,
 * and 1-Click Sync to FIRE retirement cash flow.
 */

(function () {
  "use strict";

  let patrimoineData = null;
  let chartInstance = null;

  // Format utility
  function formatMoneyEUR(val) {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(num);
  }

  function formatMoneyVND(val) {
    const num = Number(val) || 0;
    if (Math.abs(num) >= 1e9) {
      return (num / 1e9).toFixed(2) + " Tỷ ₫";
    }
    return (num / 1e6).toFixed(1) + " Tr ₫";
  }

  async function loadData() {
    try {
      const headers = window.Auth ? window.Auth.getAuthHeaders() : { "Content-Type": "application/json" };
      const res = await fetch("/api/pylocation/data", { headers });
      if (res.ok) {
        patrimoineData = await res.json();
        return patrimoineData;
      }
    } catch (e) {
      console.error("Failed to fetch /api/pylocation/data:", e);
    }
    return null;
  }

  async function render() {
    const data = await loadData();
    if (!data) return;

    renderKPIs(data);
    renderApartmentsList(data.apartments || []);
    renderTuroSection(data.turo || {});
    renderChart(data);
    renderGeminiAIBox(data);
  }

  function renderKPIs(data) {
    const sm = data.summary || {};
    const totalProp = sm.total_property_value || 0;
    const totalLoan = sm.total_loan_amount || 0;
    const duringCf = sm.total_monthly_cashflow || 0;
    const postloanCf = sm.total_monthly_post_loan_cashflow || 0;
    const turoCf = sm.total_turo_monthly_cashflow || 0;
    const totalPassive = postloanCf + turoCf;
    const vndRate = 27500; // EUR/VND approx

    const elProp = document.getElementById("patrimoine-kpi-property-val");
    if (elProp) elProp.innerText = `${formatMoneyEUR(totalProp)}`;
    const elPropSub = document.getElementById("patrimoine-kpi-property-sub");
    if (elPropSub) elPropSub.innerText = `≈ ${formatMoneyVND(totalProp * vndRate)}`;

    const elLoan = document.getElementById("patrimoine-kpi-total-loan");
    if (elLoan) elLoan.innerText = `${formatMoneyEUR(totalLoan)}`;
    const elLoanSub = document.getElementById("patrimoine-kpi-loan-sub");
    if (elLoanSub) elLoanSub.innerText = `${data.apartments?.length || 0} căn hộ có vay thế chấp`;

    const elDuring = document.getElementById("patrimoine-kpi-during-cashflow");
    if (elDuring) {
      elDuring.innerText = (duringCf >= 0 ? "+" : "") + `${formatMoneyEUR(duringCf)}/tháng`;
      elDuring.style.color = duringCf >= 0 ? "var(--success, #10b981)" : "var(--warning, #f59e0b)";
    }

    const elPost = document.getElementById("patrimoine-kpi-postloan-cashflow");
    if (elPost) {
      elPost.innerText = `+${formatMoneyEUR(postloanCf)}/tháng`;
    }
    const elPostSub = document.getElementById("patrimoine-kpi-postloan-sub");
    if (elPostSub) elPostSub.innerText = `≈ ${formatMoneyVND(postloanCf * vndRate)}/tháng (Hết nợ 20 năm)`;

    const elTuro = document.getElementById("patrimoine-kpi-turo-cashflow");
    if (elTuro) {
      elTuro.innerText = `+${formatMoneyEUR(turoCf)}/tháng`;
    }
    const elTuroSub = document.getElementById("patrimoine-kpi-turo-sub");
    if (elTuroSub) elTuroSub.innerText = `Đội xe ${data.turo?.num_cars || 3} chiếc (ROI ${data.turo?.roi_pct || 0}%)`;

    const elTotalPassive = document.getElementById("patrimoine-kpi-total-passive");
    if (elTotalPassive) {
      elTotalPassive.innerText = `+${formatMoneyEUR(totalPassive)}/tháng`;
    }
    const elTotalPassiveSub = document.getElementById("patrimoine-kpi-total-passive-sub");
    if (elTotalPassiveSub) {
      elTotalPassiveSub.innerText = `≈ ${formatMoneyVND(totalPassive * vndRate)}/tháng (Bao phủ chi phí VN)`;
    }
  }

  function renderApartmentsList(apts) {
    const container = document.getElementById("patrimoine-apartments-grid");
    if (!container) return;

    if (!apts || apts.length === 0) {
      container.innerHTML = `<div class="card" style="text-align: center; padding: 2rem; color: var(--text-muted); grid-column: 1 / -1;">
        Chưa có căn hộ nào được lưu. Bấm <strong>"+ Thêm Căn hộ Mới"</strong> để bắt đầu quản lý BĐS!
      </div>`;
      return;
    }

    container.innerHTML = apts.map(apt => {
      const netMonthly = apt.monthly_cashflow !== undefined ? apt.monthly_cashflow : 0;
      const postMonthly = apt.monthly_post_loan_cashflow !== undefined ? apt.monthly_post_loan_cashflow : 0;
      const isNegative = netMonthly < 0;

      return `
        <div class="card apartment-card" style="display: flex; flex-direction: column; gap: 0.75rem; border-left: 4px solid var(--primary, #6366f1); position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700;">🏠 ${apt.name}</h4>
                <span class="badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px;">
                  ${apt.typology || 'T2'} • ${apt.surface || 0} m²
                </span>
                <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px;">
                  DPE ${apt.dpe_rating || 'C'}
                </span>
              </div>
              <p style="margin: 0.2rem 0 0 0; font-size: 0.8rem; color: var(--text-muted);">${apt.address || 'Toulouse, France'}</p>
            </div>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-sm btn-ghost btn-edit-apt" data-name="${encodeURIComponent(apt.name)}" title="Chỉnh sửa">✏️</button>
              <button class="btn btn-sm btn-ghost btn-delete-apt" data-name="${encodeURIComponent(apt.name)}" style="color: #ef4444;" title="Xóa">🗑️</button>
            </div>
          </div>

          <!-- Financial Snapshot Grid -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem; background: var(--bg-hover, rgba(255,255,255,0.03)); padding: 0.75rem; border-radius: 8px;">
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Giá mua + Phí công chứng</span>
              <div style="font-weight: 700; font-size: 0.95rem;">${formatMoneyEUR(apt.property_price)} <span style="font-size: 0.75rem; font-weight: 400; color: var(--text-muted);">(+${formatMoneyEUR(apt.notary_fees)})</span></div>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Giá thuê thu về</span>
              <div style="font-weight: 700; font-size: 0.95rem; color: #34d399;">${formatMoneyEUR(apt.monthly_rent)}/tháng</div>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Gói vay thế chấp (${apt.loan_duration || 20} năm @ ${apt.annual_interest_rate || 3.6}%)</span>
              <div style="font-weight: 600; font-size: 0.85rem;">Trả nợ: ${formatMoneyEUR(apt.monthly_loan_payment)}/tháng</div>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Tỷ suất lợi nhuận (Gross / Net)</span>
              <div style="font-weight: 700; font-size: 0.85rem; color: var(--accent, #38bdf8);">${apt.gross_yield || 0}% / ${apt.net_yield || 0}%</div>
            </div>
          </div>

          <!-- Cashflow Badges -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.25rem; border-top: 1px solid var(--border-subtle, rgba(255,255,255,0.08)); font-size: 0.85rem;">
            <div>
              <span style="color: var(--text-muted); font-size: 0.75rem;">Hiện tại (Có vay):</span>
              <strong style="color: ${isNegative ? '#f59e0b' : '#34d399'}; margin-left: 0.25rem;">
                ${isNegative ? '' : '+'}${formatMoneyEUR(netMonthly)}/tháng
              </strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.75rem;">Hết nợ (FIRE):</span>
              <strong style="color: #34d399; margin-left: 0.25rem;">
                +${formatMoneyEUR(postMonthly)}/tháng
              </strong>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Attach listeners for Edit and Delete
    container.querySelectorAll(".btn-edit-apt").forEach(btn => {
      btn.addEventListener("click", () => {
        const name = decodeURIComponent(btn.getAttribute("data-name"));
        openApartmentModal(name);
      });
    });

    container.querySelectorAll(".btn-delete-apt").forEach(btn => {
      btn.addEventListener("click", () => {
        const name = decodeURIComponent(btn.getAttribute("data-name"));
        deleteApartment(name);
      });
    });
  }

  function renderTuroSection(turoData) {
    const raw = turoData.raw || {};

    const inpNum = document.getElementById("inp-turo-num-cars");
    if (inpNum && (raw.num_cars !== undefined || turoData.num_cars !== undefined)) {
      inpNum.value = raw.num_cars !== undefined ? raw.num_cars : turoData.num_cars;
    }

    const inpPrice = document.getElementById("inp-turo-price");
    if (inpPrice && raw.price !== undefined) inpPrice.value = raw.price;

    const inpGross = document.getElementById("inp-turo-gross");
    if (inpGross && raw.gross_gain !== undefined) inpGross.value = raw.gross_gain;

    const inpIns = document.getElementById("inp-turo-insurance");
    if (inpIns && raw.insurance !== undefined) inpIns.value = raw.insurance;

    const inpRepairs = document.getElementById("inp-turo-repairs");
    if (inpRepairs && raw.repairs !== undefined) inpRepairs.value = raw.repairs;

    const elProfitMonthly = document.getElementById("turo-metric-profit-monthly");
    if (elProfitMonthly) elProfitMonthly.innerText = `+${formatMoneyEUR(turoData.monthly_net_cash_flow || 0)}/tháng`;

    const elRoi = document.getElementById("turo-metric-roi");
    if (elRoi) elRoi.innerText = `${turoData.roi_pct || 0}%`;

    const elTotalVal = document.getElementById("turo-metric-total-invest");
    if (elTotalVal) elTotalVal.innerText = formatMoneyEUR(turoData.initial_investment || 0);
  }

  function renderChart(data) {
    const ctx = document.getElementById("chart-patrimoine");
    if (!ctx) return;

    const apts = data.apartments || [];
    const labels = apts.map(a => a.name.length > 18 ? a.name.substring(0, 18) + '...' : a.name);
    labels.push("🚗 Đội xe Turo");

    const grossRents = apts.map(a => a.monthly_rent || 0);
    grossRents.push(Math.round((data.turo?.annual_gross_gain || 5400) / 12));

    const loanPayments = apts.map(a => a.monthly_loan_payment || 0);
    loanPayments.push(0);

    const duringNetCashflow = apts.map(a => a.monthly_cashflow || 0);
    duringNetCashflow.push(data.turo?.monthly_net_cash_flow || 234);

    const postLoanNetCashflow = apts.map(a => a.monthly_post_loan_cashflow || 0);
    postLoanNetCashflow.push(data.turo?.monthly_net_cash_flow || 234);

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Thu nhập cho thuê gộp (€/tháng)",
            data: grossRents,
            backgroundColor: "rgba(56, 189, 248, 0.75)",
            borderColor: "#38bdf8",
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: "Tiền trả góp ngân hàng (€/tháng)",
            data: loanPayments,
            backgroundColor: "rgba(244, 63, 94, 0.75)",
            borderColor: "#f43f5e",
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: "Dòng tiền ròng hiện tại (€/tháng)",
            data: duringNetCashflow,
            backgroundColor: "rgba(245, 158, 11, 0.75)",
            borderColor: "#f59e0b",
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: "Dòng tiền ròng sau khi trả hết nợ (€/tháng)",
            data: postLoanNetCashflow,
            backgroundColor: "rgba(16, 185, 129, 0.85)",
            borderColor: "#10b981",
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 12,
              padding: 12,
              color: "#94a3b8",
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return `${ctx.dataset.label}: ${formatMoneyEUR(ctx.raw)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94a3b8", font: { size: 11 } }
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: {
              color: "#94a3b8",
              callback: function (val) {
                return val + " €";
              }
            }
          }
        }
      }
    });
  }

  function renderGeminiAIBox(data) {
    if (!window.GeminiAdvisor || typeof window.GeminiAdvisor.updateChartBox !== "function") return;

    const sm = data.summary || {};
    const summary = {
      total_apartments: data.apartments?.length || 3,
      total_property_value: sm.total_property_value || 293000,
      total_loan_amount: sm.total_loan_amount || 304491,
      total_during_cashflow_monthly: sm.total_monthly_cashflow || -369,
      total_postloan_cashflow_monthly: sm.total_monthly_post_loan_cashflow || 1401,
      turo_cashflow_monthly: sm.total_turo_monthly_cashflow || 234,
      total_passive_monthly: (sm.total_monthly_post_loan_cashflow || 1401) + (sm.total_turo_monthly_cashflow || 234)
    };

    window.GeminiAdvisor.updateChartBox(
      "chart-patrimoine",
      "Phân tích Đòn bẩy BĐS Pháp (LMNP) & Đội xe Turo",
      summary
    );
  }

  // Sync to FIRE Handler
  async function syncToFire() {
    const btn = document.getElementById("btn-sync-to-fire");
    const badge = document.getElementById("patrimoine-sync-badge");
    const originalText = btn ? btn.innerHTML : "";

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `⏳ Đang đồng bộ vào Kế hoạch Hưu trí...`;
    }

    try {
      const headers = window.Auth ? window.Auth.getAuthHeaders() : { "Content-Type": "application/json" };
      const res = await fetch("/api/pylocation/sync-to-fire", {
        method: "POST",
        headers
      });

      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }

      const result = await res.json();

      // Show success toast and update badge
      if (badge) {
        badge.style.display = "inline-flex";
        badge.innerHTML = `✅ Đã đồng bộ +${formatMoneyEUR(result.total_synced_monthly_passive)}/tháng vào Kế hoạch Hưu trí FIRE!`;
        badge.className = "badge badge-success";
      }

      if (btn) {
        btn.innerHTML = `✅ Đồng Bộ Thành Công!`;
        btn.classList.add("btn-success");
      }

      // Reload RetirementApp to reflect the new passive income streams immediately
      if (window.RetirementApp && typeof window.RetirementApp.reloadPlansFromBackend === "function") {
        await window.RetirementApp.reloadPlansFromBackend();
      }

      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalText;
          btn.classList.remove("btn-success");
        }
      }, 3500);

    } catch (err) {
      console.error("Sync error:", err);
      alert("Không thể đồng bộ: " + err.message);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }
  }

  // Apartment Modal Handling
  function openApartmentModal(aptName = null) {
    const modal = document.getElementById("apartment-modal");
    if (!modal) return;

    const titleEl = document.getElementById("apartment-modal-title");
    const nameInp = document.getElementById("inp-apt-name");
    const origNameInp = document.getElementById("inp-apt-original-name");

    let aptData = null;
    if (aptName && patrimoineData?.apartments) {
      const found = patrimoineData.apartments.find(a => a.name === aptName);
      if (found) aptData = found;
    }

    if (aptData) {
      const r = aptData.raw || {};
      if (titleEl) titleEl.innerText = `Chỉnh sửa Căn hộ: ${aptData.name}`;
      if (nameInp) nameInp.value = aptData.name;
      if (origNameInp) origNameInp.value = aptData.name;

      setVal("inp-apt-address", aptData.address || r.address || "");
      setVal("inp-apt-surface", aptData.surface || r.surface || 30);
      setVal("inp-apt-typology", aptData.typology || r.typology || "T2 (2 pièces)");
      setVal("inp-apt-dpe", aptData.dpe_rating || r.dpe_rating || "C");
      setVal("inp-apt-price", aptData.property_price || r.property_price || 90000);
      setVal("inp-apt-notary", aptData.notary_fees || r.notary_fees || 6750);
      setVal("inp-apt-reno", aptData.renovation_cost || r.renovation_cost || 0);
      setVal("inp-apt-furniture", aptData.furniture_cost || r.furniture_cost || 2000);
      setVal("inp-apt-rent", aptData.monthly_rent || r.monthly_rent || 600);
      setVal("inp-apt-coop", r.annual_coop || 900);
      setVal("inp-apt-tf", r.annual_tf || 800);
      setVal("inp-apt-pno", r.annual_pno || 150);
      setVal("inp-apt-down-payment", r.down_payment_input || 8000);
      setVal("inp-apt-duration", aptData.loan_duration || r.loan_duration || 20);
      setVal("inp-apt-rate", aptData.annual_interest_rate || r.annual_interest_rate || 3.6);
      setVal("inp-apt-ins-rate", aptData.annual_insurance_rate || r.annual_insurance_rate || 0.3);
    } else {
      if (titleEl) titleEl.innerText = "Thêm Căn hộ Cho thuê Mới";
      if (nameInp) nameInp.value = "";
      if (origNameInp) origNameInp.value = "";
      setVal("inp-apt-address", "");
      setVal("inp-apt-surface", 35);
      setVal("inp-apt-typology", "T2 (2 pièces)");
      setVal("inp-apt-dpe", "C");
      setVal("inp-apt-price", 95000);
      setVal("inp-apt-notary", 7200);
      setVal("inp-apt-reno", 0);
      setVal("inp-apt-furniture", 2000);
      setVal("inp-apt-rent", 650);
      setVal("inp-apt-coop", 900);
      setVal("inp-apt-tf", 800);
      setVal("inp-apt-pno", 150);
      setVal("inp-apt-down-payment", 8000);
      setVal("inp-apt-duration", 20);
      setVal("inp-apt-rate", 3.6);
      setVal("inp-apt-ins-rate", 0.3);
    }

    modal.style.display = "flex";
  }

  function closeApartmentModal() {
    const modal = document.getElementById("apartment-modal");
    if (modal) modal.style.display = "none";
  }

  async function saveApartment() {
    const nameInp = document.getElementById("inp-apt-name");
    const origNameInp = document.getElementById("inp-apt-original-name");
    const name = nameInp ? nameInp.value.trim() : "";
    const originalName = origNameInp ? origNameInp.value.trim() : "";

    if (!name) {
      alert("Vui lòng nhập tên căn hộ!");
      return;
    }

    const payload = {
      name: name,
      original_name: originalName || undefined,
      params: {
        address: getVal("inp-apt-address") || name,
        surface: Number(getVal("inp-apt-surface")) || 30,
        typology: getVal("inp-apt-typology") || "T2 (2 pièces)",
        dpe_rating: getVal("inp-apt-dpe") || "C",
        district_tier: "Quartier Résidentiel",
        renovation_state: "Bon état",
        property_price: Number(getVal("inp-apt-price")) || 90000,
        property_type: "ancien",
        auto_calc_notary: true,
        notary_fees: Number(getVal("inp-apt-notary")) || 6750,
        renovation_cost: Number(getVal("inp-apt-reno")) || 0,
        furniture_cost: Number(getVal("inp-apt-furniture")) || 2000,
        monthly_rent: Number(getVal("inp-apt-rent")) || 600,
        vacancy_pct: 5.0,
        annual_coop: Number(getVal("inp-apt-coop")) || 900,
        annual_tf: Number(getVal("inp-apt-tf")) || 800,
        annual_pno: Number(getVal("inp-apt-pno")) || 150,
        annual_mgmt_pct: 0.0,
        annual_maintenance: 300,
        auto_calc_bank: true,
        down_payment_input: Number(getVal("inp-apt-down-payment")) || 8000,
        loan_duration: Number(getVal("inp-apt-duration")) || 20,
        annual_interest_rate: Number(getVal("inp-apt-rate")) || 3.6,
        annual_insurance_rate: Number(getVal("inp-apt-ins-rate")) || 0.3,
        user_tmi: 30
      }
    };

    try {
      const headers = window.Auth ? window.Auth.getAuthHeaders() : { "Content-Type": "application/json" };
      const res = await fetch("/api/pylocation/apartment", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Lỗi khi lưu căn hộ");

      closeApartmentModal();
      await render();
    } catch (e) {
      alert(e.message);
    }
  }

  async function deleteApartment(name) {
    if (!confirm(`Bạn có chắc chắn muốn xóa căn hộ "${name}" không?`)) return;

    try {
      const headers = window.Auth ? window.Auth.getAuthHeaders() : {};
      const res = await fetch(`/api/pylocation/apartment/${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers
      });
      if (!res.ok) throw new Error("Lỗi khi xóa căn hộ");

      await render();
    } catch (e) {
      alert(e.message);
    }
  }

  async function saveTuroSettings() {
    const btn = document.getElementById("btn-save-turo");
    if (btn) {
      btn.disabled = true;
      btn.innerText = "⏳ Đang lưu...";
    }

    const payload = {
      num_cars: Number(getVal("inp-turo-num-cars")) || 3,
      price: Number(getVal("inp-turo-price")) || 5000,
      gross_gain: Number(getVal("inp-turo-gross")) || 1800,
      insurance: Number(getVal("inp-turo-insurance")) || 350,
      repairs: Number(getVal("inp-turo-repairs")) || 350,
      decote: 6.0,
      holding_years: 10
    };

    try {
      const headers = window.Auth ? window.Auth.getAuthHeaders() : { "Content-Type": "application/json" };
      const res = await fetch("/api/pylocation/turo", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Lỗi lưu Turo");

      if (btn) {
        btn.innerText = "✅ Đã lưu!";
        setTimeout(() => {
          btn.disabled = false;
          btn.innerText = "💾 Lưu Cấu hình Turo";
        }, 1500);
      }
      await render();
    } catch (e) {
      alert(e.message);
      if (btn) {
        btn.disabled = false;
        btn.innerText = "💾 Lưu Cấu hình Turo";
      }
    }
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  function bindEvents() {
    const btnSync = document.getElementById("btn-sync-to-fire");
    if (btnSync) btnSync.addEventListener("click", syncToFire);

    const btnAddApt = document.getElementById("btn-add-apartment");
    if (btnAddApt) btnAddApt.addEventListener("click", () => openApartmentModal(null));

    const btnCloseModal = document.getElementById("btn-close-apt-modal");
    if (btnCloseModal) btnCloseModal.addEventListener("click", closeApartmentModal);

    const btnCancelModal = document.getElementById("btn-cancel-apt-modal");
    if (btnCancelModal) btnCancelModal.addEventListener("click", closeApartmentModal);

    const btnSaveModal = document.getElementById("btn-save-apt-modal");
    if (btnSaveModal) btnSaveModal.addEventListener("click", saveApartment);

    const btnSaveTuro = document.getElementById("btn-save-turo");
    if (btnSaveTuro) btnSaveTuro.addEventListener("click", saveTuroSettings);
  }

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
  });

  // Expose global module
  window.PatrimoineApp = {
    render,
    syncToFire,
    openApartmentModal,
    saveApartment,
    deleteApartment
  };

})();
