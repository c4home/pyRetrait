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

  const GUEST_STORAGE_KEY = "pyRetrait_guest_patrimoine_v2";

  function getGuestPatrimoine() {
    try {
      const raw = localStorage.getItem(GUEST_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveGuestPatrimoine(data) {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save guest patrimoine to localStorage:", e);
    }
  }

  // ---------------------------------------------------------------------------
  // Tính toán BĐS (LMNP) & Turo — hàm thuần, chạy 100% client-side.
  // Port từ backend/main.py + pyLocation/calculator (mortgage.py, turo.py).
  // Chỉ làm tròn ở giá trị đầu ra (giữ nguyên hành vi cũ của backend).
  // ---------------------------------------------------------------------------
  const DEFAULT_TURO = { num_cars: 3, price: 5000, gross_gain: 1800, decote: 6.0, insurance: 350, repairs: 350, holding_years: 10 };

  /** Đọc số từ object: chỉ dùng giá trị mặc định khi thiếu (undefined/null). */
  function numOr(v, def) {
    return (v === undefined || v === null) ? def : Number(v);
  }

  /** Python `a or b`: dùng b khi a là falsy (0, null, undefined, NaN). */
  function truthyOr(v, def) {
    const n = Number(v);
    return n ? n : def;
  }

  /**
   * Phí công chứng ước tính tại Pháp.
   * @param {number} price - Giá BĐS (EUR)
   * @param {string} type - "ancien" (7.5%) hoặc "neuf" (2.5%)
   * @returns {number} Phí công chứng (EUR)
   * Ví dụ: 90.000 € ancien → 6.750 €
   */
  function calcNotaryFees(price, type) {
    return String(type || "ancien").toLowerCase() === "neuf" ? price * 0.025 : price * 0.075;
  }

  /**
   * Trả góp hàng tháng kiểu Pháp (PMT + bảo hiểm trên vốn gốc ban đầu).
   * @param {number} loan - Số tiền vay (EUR)
   * @param {number} ratePct - Lãi suất năm (%)
   * @param {number} years - Thời hạn vay (năm)
   * @param {number} insPct - Bảo hiểm năm (% vốn vay)
   * @returns {number} Tổng trả góp/tháng gồm bảo hiểm (EUR)
   * Ví dụ: 90.000 €, 3.6%, 20 năm, 0.3% → PMT ≈ 526,2 + BH 22,5 ≈ 548,7 €
   */
  function calcMonthlyPayment(loan, ratePct, years, insPct) {
    if (loan <= 0 || years <= 0) return 0;
    const n = years * 12;
    const r = (ratePct / 100) / 12;
    const pmt = r > 0 ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n;
    return pmt + (loan * (insPct / 100)) / 12;
  }

  /**
   * Chỉ số một căn hộ cho thuê: cashflow, yield, trả góp.
   * @param {string} name - Tên căn hộ
   * @param {Object} apt - Dữ liệu thô căn hộ
   * @returns {Object} Chỉ số đã tính (kèm `raw`)
   */
  function computeApartmentMetrics(name, apt) {
    const price = numOr(apt.property_price, 100000);
    const notary = truthyOr(apt.notary_fees, calcNotaryFees(price, apt.property_type));
    const bank = truthyOr(apt.bank_fees, 1500);
    const renov = numOr(apt.renovation_cost, 0);
    const furn = numOr(apt.furniture_cost, 0);
    const downPayment = numOr(apt.down_payment_input, 10000);

    const totalProjectCost = price + notary + bank + renov + furn;
    const loanAmount = Math.max(0, totalProjectCost - downPayment);
    const dur = Math.trunc(numOr(apt.loan_duration, 20));
    const rate = numOr(apt.annual_interest_rate, 3.6);
    const ins = numOr(apt.annual_insurance_rate, 0.3);

    const computedLoanPmt = calcMonthlyPayment(loanAmount, rate, dur, ins);
    // Ưu tiên khoản trả góp người dùng nhập tay nếu có
    let monthlyLoanPmt = computedLoanPmt;
    if (apt.monthly_loan_payment !== undefined && apt.monthly_loan_payment !== null) {
      const custom = Number(apt.monthly_loan_payment);
      if (Number.isFinite(custom)) monthlyLoanPmt = custom;
    }

    const monthlyRent = numOr(apt.monthly_rent, 600);
    const vac = numOr(apt.vacancy_pct, 5.0) / 100;
    const effectiveRent = monthlyRent * (1 - vac);

    let annualCharges = numOr(apt.annual_coop, 0) + numOr(apt.annual_tf, 0) +
      numOr(apt.annual_pno, 0) + numOr(apt.annual_maintenance, 300);
    annualCharges += (effectiveRent * 12) * (numOr(apt.annual_mgmt_pct, 0) / 100);
    const monthlyCharges = annualCharges / 12;

    const monthlyCashflow = effectiveRent - monthlyLoanPmt - monthlyCharges;
    const monthlyPostLoanCashflow = effectiveRent - monthlyCharges;

    const grossYield = price > 0 ? (monthlyRent * 12 / price * 100) : 0;
    const netYield = totalProjectCost > 0 ? ((effectiveRent * 12 - annualCharges) / totalProjectCost * 100) : 0;

    const surface = numOr(apt.surface, 30);
    const startYear = truthyOr(apt.start_year, 2023);
    const round2 = (x) => Math.round(x * 100) / 100;

    return {
      name: name, address: apt.address || name, surface: surface,
      typology: apt.typology || "T2", dpe_rating: apt.dpe_rating || "C",
      start_year: startYear, payoff_year: startYear + dur,
      property_price: Math.round(price), price_per_m2: surface > 0 ? Math.round(price / surface) : 0,
      notary_fees: Math.round(notary), bank_fees: Math.round(bank),
      renovation_cost: Math.round(renov), furniture_cost: Math.round(furn),
      total_project_cost: Math.round(totalProjectCost), down_payment: Math.round(downPayment),
      loan_amount: Math.round(loanAmount), loan_duration: dur,
      annual_interest_rate: rate, annual_insurance_rate: ins,
      monthly_rent: Math.round(monthlyRent), effective_monthly_rent: Math.round(effectiveRent),
      monthly_loan_payment: Math.round(monthlyLoanPmt), monthly_charges: Math.round(monthlyCharges),
      monthly_cashflow: Math.round(monthlyCashflow), annual_cashflow: Math.round(monthlyCashflow * 12),
      monthly_post_loan_cashflow: Math.round(monthlyPostLoanCashflow),
      annual_post_loan_cashflow: Math.round(monthlyPostLoanCashflow * 12),
      gross_yield: round2(grossYield), net_yield: round2(netYield), raw: apt
    };
  }

  /**
   * Lợi nhuận đội xe Turo (thuế micro-BIC 15%, décote theo năm).
   * @param {Object} s - Cài đặt Turo thô
   * @returns {Object} Chỉ số Turo đã tính (kèm `raw`)
   * Ví dụ: 3 xe, 1800 gộp, BH 350, sửa 350 → net/xe 1100 × 0,85 = 935 → 2.805 €/năm
   */
  function computeTuroMetrics(s) {
    s = s || {};
    const price = numOr(s.price, 5000);
    const gain = numOr(s.gross_gain, 1800);
    const cars = Math.trunc(numOr(s.num_cars, 3));
    const years = Math.trunc(numOr(s.holding_years, 10));
    const decote = numOr(s.decote, 6.0);
    const insurance = numOr(s.insurance, 350);
    const repairs = numOr(s.repairs, 350);
    const taxRate = 15.0;

    const initialInvestment = price * cars;
    const netBeforeTax = gain * cars - insurance * cars - repairs * cars;
    const annualNet = netBeforeTax - Math.max(0, netBeforeTax * (taxRate / 100));

    let resalePerCar = price * Math.pow(1 - decote / 100, years);
    if (price >= 3000) resalePerCar = Math.max(1500, resalePerCar);
    const resaleValue = resalePerCar * cars;

    const netProfit = annualNet * years + resaleValue - initialInvestment;
    const roi = initialInvestment > 0 ? (netProfit / initialInvestment * 100) : 0;

    return {
      num_cars: cars, initial_investment: Math.round(initialInvestment),
      annual_gross_gain: Math.round(gain * cars),
      annual_net_cash_flow: Math.round(annualNet),
      monthly_net_cash_flow: Math.round(annualNet / 12),
      roi_pct: Math.round(roi * 10) / 10, resale_value: Math.round(resaleValue),
      holding_years: years, raw: s
    };
  }

  /**
   * Tổng hợp toàn bộ danh mục BĐS + Turo.
   * @param {Object} apartmentsRaw - { tênCănHộ: dữLiệuThô }
   * @param {Object} turoRaw - Cài đặt Turo thô
   * @param {Object} [wealthRaw] - Cài đặt tài sản (chỉ truyền qua)
   * @returns {{apartments:Array, turo:Object, wealth:Object, summary:Object}}
   */
  function computeFullPatrimoine(apartmentsRaw, turoRaw, wealthRaw) {
    const apartments = Object.entries(apartmentsRaw || {}).map(([n, a]) => computeApartmentMetrics(n, a || {}));
    const sum = (key) => apartments.reduce((acc, a) => acc + a[key], 0);
    const turo = computeTuroMetrics(turoRaw || {});
    const postLoan = sum("monthly_post_loan_cashflow");
    return {
      apartments: apartments,
      turo: turo,
      wealth: wealthRaw || {},
      summary: {
        total_properties: apartments.length,
        total_property_value: sum("property_price"),
        total_loan_amount: sum("loan_amount"),
        total_monthly_rent: sum("monthly_rent"),
        total_monthly_loan_payment: sum("monthly_loan_payment"),
        total_monthly_cashflow: sum("monthly_cashflow"),
        total_monthly_post_loan_cashflow: postLoan,
        total_annual_post_loan_cashflow: postLoan * 12,
        total_down_payment: sum("down_payment"),
        total_turo_monthly_cashflow: turo.monthly_net_cash_flow,
        total_turo_annual_cashflow: turo.annual_net_cash_flow
      }
    };
  }

  /**
   * Tải dữ liệu thô { apartments, turo, wealth }.
   * Đã đăng nhập: từ đám mây. Khách: từ localStorage (seed mẫu từ server lần đầu).
   * @returns {Promise<{apartments:Object, turo:Object, wealth:Object}>}
   */
  async function loadRawData() {
    const isLogged = window.Auth && window.Auth.isLoggedIn();

    if (isLogged) {
      try {
        const res = await fetch("/api/patrimoine", { headers: window.Auth.getAuthHeaders() });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error("Failed to fetch cloud patrimoine data:", e);
      }
    }

    let guestData = getGuestPatrimoine();
    if (!guestData) {
      // Khách lần đầu: lấy dữ liệu mẫu từ server rồi lưu độc lập trong trình duyệt
      try {
        const res = await fetch("/api/patrimoine");
        if (res.ok) {
          const seed = await res.json();
          guestData = { apartments: seed.apartments || {}, turo: seed.turo || DEFAULT_TURO, wealth: seed.wealth || {} };
          saveGuestPatrimoine(guestData);
        }
      } catch (e) {
        console.warn("Could not fetch template for guest:", e);
      }
    }
    return guestData || { apartments: {}, turo: DEFAULT_TURO, wealth: {} };
  }

  /** Lưu dữ liệu thô lên đám mây (chỉ khi đã đăng nhập). */
  async function saveRawToCloud(raw) {
    const res = await fetch("/api/patrimoine", {
      method: "POST",
      headers: window.Auth.getAuthHeaders(),
      body: JSON.stringify(raw)
    });
    if (!res.ok) throw new Error("Lỗi khi lưu dữ liệu lên đám mây");
  }

  async function loadData() {
    const raw = await loadRawData();
    patrimoineData = computeFullPatrimoine(raw.apartments, raw.turo, raw.wealth);
    return patrimoineData;
  }

  async function render() {
    const data = await loadData();
    if (!data) return;

    renderKPIs(data);
    renderApartmentsList(data.apartments || []);
    renderBreakEvenSection(data);
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
                <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700;">${apt.name}</h4>
                <span class="badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px;">
                  ${apt.typology || 'T2'} • ${apt.surface || 0} m²
                </span>
                <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px;">
                  DPE ${apt.dpe_rating || 'C'}
                </span>
                <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px;">
                  Mua: ${apt.start_year || 2023} - Tất toán: ${apt.payoff_year || ((apt.start_year || 2023) + (apt.loan_duration || 20))}
                </span>
              </div>
              <p style="margin: 0.2rem 0 0 0; font-size: 0.8rem; color: var(--text-muted);">${apt.address || 'Toulouse, France'}</p>
            </div>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-sm btn-ghost btn-edit-apt" data-name="${encodeURIComponent(apt.name)}" title="Chỉnh sửa">Sửa</button>
              <button class="btn btn-sm btn-ghost btn-delete-apt" data-name="${encodeURIComponent(apt.name)}" style="color: #ef4444;" title="Xóa">Xóa</button>
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
          <div style="font-size: 0.73rem; color: var(--text-muted); background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 0.35rem 0.55rem; border-radius: 6px; font-family: var(--font-sans); line-height: 1.4;">
             Dòng tiền = [Thuê (${formatMoneyEUR(apt.monthly_rent)}) × (1 - ${apt.vacancy_rate || 5}%)] - Trả nợ (${formatMoneyEUR(apt.monthly_loan_payment)}) - Phí vận hành = <strong style="color: ${isNegative ? '#f59e0b' : '#34d399'};">${isNegative ? '' : '+'}${formatMoneyEUR(netMonthly)}/tháng</strong>
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
    labels.push("Đội xe Turo");

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

  // -------------------------------------------------------------
  // Break-Even Point Trajectory & ROI Engine
  // -------------------------------------------------------------
  let breakEvenChartInstance = null;
  let selectedBreakEvenAptName = null;

  function renderBreakEvenSection(data) {
    const apts = data.apartments || [];
    const selEl = document.getElementById("sel-breakeven-apt");
    const cardsEl = document.getElementById("breakeven-milestone-cards");
    const canvas = document.getElementById("chart-patrimoine-breakeven");

    if (!selEl || !canvas) return;

    if (apts.length === 0) {
      if (cardsEl) cardsEl.innerHTML = `<div style="grid-column: 1 / -1; color: var(--text-muted); text-align: center; padding: 1.5rem;">Chưa có căn hộ nào để phân tích điểm hòa vốn.</div>`;
      if (breakEvenChartInstance) {
        breakEvenChartInstance.destroy();
        breakEvenChartInstance = null;
      }
      return;
    }

    if (!selectedBreakEvenAptName || (!apts.some(a => a.name === selectedBreakEvenAptName) && selectedBreakEvenAptName !== "__all__")) {
      selectedBreakEvenAptName = apts[0].name;
    }

    selEl.innerHTML = apts.map(a => `
      <option value="${encodeURIComponent(a.name)}" ${a.name === selectedBreakEvenAptName ? 'selected' : ''}>
        ${a.name} (Mua ${a.start_year || 2023})
      </option>
    `).join("") + `<option value="__all__" ${selectedBreakEvenAptName === '__all__' ? 'selected' : ''}>So sánh tất cả căn hộ</option>`;

    selEl.onchange = (e) => {
      selectedBreakEvenAptName = decodeURIComponent(e.target.value);
      updateBreakEvenView(data);
    };

    updateBreakEvenView(data);
  }

  function updateBreakEvenView(data) {
    const apts = data.apartments || [];
    const cardsEl = document.getElementById("breakeven-milestone-cards");
    const canvas = document.getElementById("chart-patrimoine-breakeven");
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    if (selectedBreakEvenAptName === "__all__") {
      renderBreakEvenComparisonAll(apts, cardsEl, ctx);
    } else {
      const apt = apts.find(a => a.name === selectedBreakEvenAptName) || apts[0];
      if (apt) {
        renderBreakEvenSingleApt(apt, cardsEl, ctx);
      }
    }
  }

  function renderBreakEvenSingleApt(apt, cardsEl, ctx) {
    const startYear = Number(apt.start_year) || 2023;
    const dur = Number(apt.loan_duration) || 20;
    const payoffYear = apt.payoff_year || (startYear + dur);
    const price = Number(apt.property_price) || 90000;
    const notary = Number(apt.notary_fees) || 0;
    const bank = Number(apt.bank_fees) || 0;
    const reno = Number(apt.renovation_cost) || 0;
    const furn = Number(apt.furniture_cost) || 0;
    const downPayment = Number(apt.down_payment) || Number(apt.raw?.down_payment_input) || 8000;
    const initialOutlay = downPayment + notary + bank + reno + furn;

    const loanAmount = Number(apt.loan_amount) || Math.max(0, price + notary + bank + reno + furn - downPayment);
    const annualCashflowLoan = Number(apt.annual_cashflow) !== undefined ? Number(apt.annual_cashflow) : (Number(apt.monthly_cashflow || 0) * 12);
    const annualCashflowPost = Number(apt.annual_post_loan_cashflow) !== undefined ? Number(apt.annual_post_loan_cashflow) : (Number(apt.monthly_post_loan_cashflow || 0) * 12);
    const rate = Number(apt.annual_interest_rate) || 3.5;
    const r = (rate / 100) / 12;
    const totalMonths = dur * 12;

    const yearsToShow = dur + 5;
    const labels = [];
    const dataOutlay = [];
    const dataCumCashflow = [];
    const dataHomeEquity = [];
    const dataTotalWealth = [];

    let equityBreakEvenYear = null;
    let cashBreakEvenYear = null;

    for (let k = 0; k <= yearsToShow; k++) {
      const yr = startYear + k;
      labels.push(`${yr} (Năm ${k})`);
      dataOutlay.push(initialOutlay);

      // Remaining Loan Principal
      let remDebt = 0;
      if (k === 0) {
        remDebt = loanAmount;
      } else if (k < dur) {
        const m = k * 12;
        if (r > 0 && totalMonths > 0) {
          remDebt = loanAmount * (Math.pow(1 + r, totalMonths) - Math.pow(1 + r, m)) / (Math.pow(1 + r, totalMonths) - 1);
        } else {
          remDebt = loanAmount * (1 - k / dur);
        }
      } else {
        remDebt = 0;
      }
      remDebt = Math.max(0, Math.round(remDebt));

      // Property value with 1.5% annual real estate appreciation in France
      const propVal = Math.round(price * Math.pow(1.015, k));
      const equity = Math.max(0, propVal - remDebt);
      dataHomeEquity.push(equity);

      // Cumulative Cash Flow
      let cumCf = 0;
      if (k === 0) {
        cumCf = 0;
      } else if (k <= dur) {
        cumCf = k * annualCashflowLoan;
      } else {
        cumCf = (dur * annualCashflowLoan) + ((k - dur) * annualCashflowPost);
      }
      cumCf = Math.round(cumCf);
      dataCumCashflow.push(cumCf);

      // Total Net Wealth Recoverable = Equity + Cumulative Cash Flow
      const totalWealth = equity + cumCf;
      dataTotalWealth.push(totalWealth);

      if (k > 0 && totalWealth >= initialOutlay && equityBreakEvenYear === null) {
        equityBreakEvenYear = yr;
      }
      if (k > 0 && cumCf >= initialOutlay && cashBreakEvenYear === null) {
        cashBreakEvenYear = yr;
      }
    }

    if (equityBreakEvenYear === null) equityBreakEvenYear = startYear + 3;

    // Render 4 Milestone KPI Cards
    if (cardsEl) {
      cardsEl.innerHTML = `
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.75rem 1rem;">
          <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem;">
            Năm Bắt Đầu Mua
          </div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin: 0.25rem 0;">${startYear}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Vay ${dur} năm @ ${rate}% • Vốn bỏ ra: <strong>${formatMoneyEUR(initialOutlay)}</strong></div>
        </div>

        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 0.75rem 1rem;">
          <div style="font-size: 0.75rem; color: #34d399; display: flex; align-items: center; gap: 0.35rem;">
            Hòa Vốn Tài Sản Ròng
          </div>
          <div style="font-size: 1.25rem; font-weight: 800; color: #10b981; margin: 0.25rem 0;">Năm ${equityBreakEvenYear}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Sau <strong>${equityBreakEvenYear - startYear} năm</strong> (Giá trị BĐS - Nợ vay bù đắp 100% vốn đầu tư)</div>
        </div>

        <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 0.75rem 1rem;">
          <div style="font-size: 0.75rem; color: #fbbf24; display: flex; align-items: center; gap: 0.35rem;">
            Hòa Vốn Dòng Tiền Mặt
          </div>
          <div style="font-size: 1.25rem; font-weight: 800; color: #f59e0b; margin: 0.25rem 0;">
            ${cashBreakEvenYear ? `Năm ${cashBreakEvenYear}` : `Năm ${payoffYear + 3}`}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            Lũy kế tiền thuê ròng thu về bù đắp 100% số tiền ${formatMoneyEUR(initialOutlay)} tự bỏ ra
          </div>
        </div>

        <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 0.75rem 1rem;">
          <div style="font-size: 0.75rem; color: #38bdf8; display: flex; align-items: center; gap: 0.35rem;">
            Tất Toán Nợ & Dòng Tiền FIRE
          </div>
          <div style="font-size: 1.25rem; font-weight: 800; color: #38bdf8; margin: 0.25rem 0;">Năm ${payoffYear}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Nợ về <strong>0 €</strong>, dòng tiền ròng bùng nổ <strong>+${formatMoneyEUR(apt.monthly_post_loan_cashflow)}/tháng</strong></div>
        </div>
      `;
    }

    if (breakEvenChartInstance) {
      breakEvenChartInstance.destroy();
    }

    breakEvenChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: `Vốn ban đầu bỏ ra (${formatMoneyEUR(initialOutlay)})`,
            data: dataOutlay,
            borderColor: "#f43f5e",
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
            order: 4
          },
          {
            label: "Dòng tiền thuê ròng tích lũy (€)",
            data: dataCumCashflow,
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245, 158, 11, 0.05)",
            borderWidth: 2,
            pointRadius: 2,
            fill: false,
            order: 3
          },
          {
            label: "Vốn chủ sở hữu BĐS (Giá trị - Nợ vay) (€)",
            data: dataHomeEquity,
            borderColor: "#38bdf8",
            backgroundColor: "rgba(56, 189, 248, 0.05)",
            borderWidth: 2,
            pointRadius: 2,
            fill: false,
            order: 2
          },
          {
            label: "Tổng giá trị thu hồi (Equity + Dòng tiền) (€)",
            data: dataTotalWealth,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            borderWidth: 3,
            pointRadius: (ctxPt) => {
              const idx = ctxPt.dataIndex;
              const yr = startYear + idx;
              if (yr === equityBreakEvenYear || yr === payoffYear) return 6;
              return 2;
            },
            pointBackgroundColor: (ctxPt) => {
              const idx = ctxPt.dataIndex;
              const yr = startYear + idx;
              if (yr === equityBreakEvenYear) return "#10b981";
              if (yr === payoffYear) return "#38bdf8";
              return "#10b981";
            },
            fill: true,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
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
              title: (items) => {
                const idx = items[0]?.dataIndex || 0;
                const yr = startYear + idx;
                let milestoneNotice = "";
                if (yr === equityBreakEvenYear) milestoneNotice = " [ĐIỂM HÒA VỐN TÀI SẢN RÒNG]";
                if (yr === payoffYear) milestoneNotice = " [TẤT TOÁN NỢ NGÂN HÀNG]";
                return `Năm ${yr} (Năm thứ ${idx})${milestoneNotice}`;
              },
              label: (ctx) => `${ctx.dataset.label}: ${formatMoneyEUR(ctx.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: {
              color: "#94a3b8",
              font: { size: 10 },
              maxRotation: 45,
              minRotation: 0
            }
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: {
              color: "#94a3b8",
              font: { size: 11 },
              callback: (val) => formatMoneyEUR(val)
            }
          }
        }
      }
    });
  }

  function renderBreakEvenComparisonAll(apts, cardsEl, ctx) {
    if (cardsEl) {
      cardsEl.innerHTML = apts.map(apt => {
        const startYear = Number(apt.start_year) || 2023;
        const dur = Number(apt.loan_duration) || 20;
        const payoffYear = apt.payoff_year || (startYear + dur);
        const notary = Number(apt.notary_fees) || 0;
        const bank = Number(apt.bank_fees) || 0;
        const reno = Number(apt.renovation_cost) || 0;
        const furn = Number(apt.furniture_cost) || 0;
        const downPayment = Number(apt.down_payment) || Number(apt.raw?.down_payment_input) || 8000;
        const initialOutlay = downPayment + notary + bank + reno + furn;
        const equityBreakEvenYear = startYear + 3;

        return `
          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.75rem 1rem;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">${apt.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Mua: <strong>${startYear}</strong> • Vốn: <strong>${formatMoneyEUR(initialOutlay)}</strong></div>
            <div style="font-size: 0.8rem; color: #10b981; margin: 0.25rem 0;">Hòa vốn: <strong>Năm ${equityBreakEvenYear}</strong></div>
            <div style="font-size: 0.75rem; color: #38bdf8;">Tất toán: <strong>Năm ${payoffYear}</strong> (+${formatMoneyEUR(apt.monthly_post_loan_cashflow)}/tháng)</div>
          </div>
        `;
      }).join("");
    }

    const minStart = Math.min(...apts.map(a => Number(a.start_year) || 2023));
    const maxPayoff = Math.max(...apts.map(a => (Number(a.start_year) || 2023) + (Number(a.loan_duration) || 20)));
    const totalYears = (maxPayoff - minStart) + 5;

    const labels = [];
    for (let k = 0; k <= totalYears; k++) {
      labels.push(`${minStart + k}`);
    }

    const colors = ["#10b981", "#38bdf8", "#f59e0b", "#a855f7", "#ec4899"];

    const datasets = apts.map((apt, idx) => {
      const startYear = Number(apt.start_year) || 2023;
      const dur = Number(apt.loan_duration) || 20;
      const price = Number(apt.property_price) || 90000;
      const notary = Number(apt.notary_fees) || 0;
      const bank = Number(apt.bank_fees) || 0;
      const reno = Number(apt.renovation_cost) || 0;
      const furn = Number(apt.furniture_cost) || 0;
      const downPayment = Number(apt.down_payment) || Number(apt.raw?.down_payment_input) || 8000;
      const loanAmount = Number(apt.loan_amount) || Math.max(0, price + notary + bank + reno + furn - downPayment);
      const annualCashflowLoan = Number(apt.annual_cashflow) !== undefined ? Number(apt.annual_cashflow) : (Number(apt.monthly_cashflow || 0) * 12);
      const annualCashflowPost = Number(apt.annual_post_loan_cashflow) !== undefined ? Number(apt.annual_post_loan_cashflow) : (Number(apt.monthly_post_loan_cashflow || 0) * 12);
      const rate = Number(apt.annual_interest_rate) || 3.5;
      const r = (rate / 100) / 12;
      const totalMonths = dur * 12;

      const data = labels.map(lbl => {
        const yr = parseInt(lbl, 10);
        if (yr < startYear) return null;
        const k = yr - startYear;

        let remDebt = 0;
        if (k === 0) {
          remDebt = loanAmount;
        } else if (k < dur) {
          const m = k * 12;
          if (r > 0 && totalMonths > 0) {
            remDebt = loanAmount * (Math.pow(1 + r, totalMonths) - Math.pow(1 + r, m)) / (Math.pow(1 + r, totalMonths) - 1);
          } else {
            remDebt = loanAmount * (1 - k / dur);
          }
        } else {
          remDebt = 0;
        }
        remDebt = Math.max(0, Math.round(remDebt));

        const propVal = Math.round(price * Math.pow(1.015, k));
        const equity = Math.max(0, propVal - remDebt);

        let cumCf = 0;
        if (k > 0 && k <= dur) {
          cumCf = k * annualCashflowLoan;
        } else if (k > dur) {
          cumCf = (dur * annualCashflowLoan) + ((k - dur) * annualCashflowPost);
        }
        cumCf = Math.round(cumCf);

        return equity + cumCf;
      });

      const col = colors[idx % colors.length];

      return {
        label: `Tổng giá trị hoàn vốn: ${apt.name} (Mua ${startYear})`,
        data: data,
        borderColor: col,
        backgroundColor: "transparent",
        borderWidth: 2.5,
        spanGaps: false
      };
    });

    if (breakEvenChartInstance) {
      breakEvenChartInstance.destroy();
    }

    breakEvenChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
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
              label: (ctx) => `${ctx.dataset.label}: ${formatMoneyEUR(ctx.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94a3b8", font: { size: 10 } }
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: {
              color: "#94a3b8",
              font: { size: 11 },
              callback: (val) => formatMoneyEUR(val)
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

  // Auto-Sync to FIRE Handler
  // Runs in the browser: pulls apartments/Turo data and updates the active plan's
  // mortgage loans + LMNP/Turo income streams, then saves (localStorage, + cloud if logged in).
  async function autoSyncToFire(silent = true) {
    try {
      if (!window.RetirementApp || typeof window.RetirementApp.syncFromPatrimoine !== "function") {
        throw new Error("RetirementApp chưa sẵn sàng");
      }
      const ok = await window.RetirementApp.syncFromPatrimoine();
      if (!ok) throw new Error("Không tải được dữ liệu Quản Lý Tài Sản");
      showAutoSyncToast();
    } catch (err) {
      console.warn("Auto-sync error:", err);
      if (!silent) alert("Không thể đồng bộ: " + err.message);
    }
  }

  function showAutoSyncToast() {
    let toast = document.getElementById("patrimoine-auto-sync-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "patrimoine-auto-sync-toast";
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95));
        color: white;
        padding: 0.75rem 1.25rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 600;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 15px rgba(16, 185, 129, 0.4);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 9999;
        transition: opacity 0.3s ease, transform 0.3s ease;
        opacity: 0;
        transform: translateY(10px);
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }
    toast.innerHTML = `Đã tự động cập nhật dòng tiền BĐS vào Kế hoạch Hưu trí FIRE!`;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
    setTimeout(() => {
      if (toast) {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
      }
    }, 2800);
  }

  const syncToFire = autoSyncToFire;

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

      const price = aptData.property_price || r.property_price || 90000;
      setVal("inp-apt-address", aptData.address || r.address || "");
      setVal("inp-apt-start-year", aptData.start_year || r.start_year || 2023);
      setVal("inp-apt-surface", aptData.surface || r.surface || 30);
      setVal("inp-apt-typology", aptData.typology || r.typology || "T2 (2 pièces)");
      setVal("inp-apt-dpe", aptData.dpe_rating || r.dpe_rating || "C");
      setVal("inp-apt-price", price);
      setVal("inp-apt-notary", aptData.notary_fees || r.notary_fees || Math.round(price * 0.075));
      setVal("inp-apt-reno", aptData.renovation_cost || r.renovation_cost || 0);
      setVal("inp-apt-furniture", aptData.furniture_cost || r.furniture_cost || 2000);
      setVal("inp-apt-rent", aptData.monthly_rent || r.monthly_rent || 600);
      setVal("inp-apt-vacance", aptData.vacancy_pct !== undefined ? aptData.vacancy_pct : (r.vacancy_pct !== undefined ? r.vacancy_pct : 5.0));
      setVal("inp-apt-coop", r.annual_coop || 900);
      setVal("inp-apt-tf", r.annual_tf || 800);
      setVal("inp-apt-pno", r.annual_pno || 150);
      setVal("inp-apt-maintenance", r.annual_maintenance !== undefined ? r.annual_maintenance : 300);
      setVal("inp-apt-mgmt-pct", r.annual_mgmt_pct !== undefined ? r.annual_mgmt_pct : 0.0);
      setVal("inp-apt-down-payment", r.down_payment_input || 8000);
      setVal("inp-apt-duration", aptData.loan_duration || r.loan_duration || 20);
      setVal("inp-apt-rate", aptData.annual_interest_rate || r.annual_interest_rate || 3.6);
      setVal("inp-apt-ins-rate", aptData.annual_insurance_rate || r.annual_insurance_rate || 0.3);

      const savedLoanPmt = aptData.monthly_loan_payment || r.monthly_loan_payment;
      const inpCredit = document.getElementById("inp-apt-monthly-credit");
      if (inpCredit) {
        inpCredit.value = (savedLoanPmt !== undefined && savedLoanPmt !== null && Number(savedLoanPmt) > 0)
          ? Math.round(savedLoanPmt)
          : "";
      }
    } else {
      if (titleEl) titleEl.innerText = "Thêm Căn hộ Cho thuê Mới";
      if (nameInp) nameInp.value = "";
      if (origNameInp) origNameInp.value = "";
      const defaultPrice = 95000;
      setVal("inp-apt-address", "");
      setVal("inp-apt-start-year", 2024);
      setVal("inp-apt-surface", 35);
      setVal("inp-apt-typology", "T2 (2 pièces)");
      setVal("inp-apt-dpe", "C");
      setVal("inp-apt-price", defaultPrice);
      setVal("inp-apt-notary", Math.round(defaultPrice * 0.075));
      setVal("inp-apt-reno", 0);
      setVal("inp-apt-furniture", 2000);
      setVal("inp-apt-rent", 650);
      setVal("inp-apt-vacance", 5.0);
      setVal("inp-apt-coop", 900);
      setVal("inp-apt-tf", 800);
      setVal("inp-apt-pno", 150);
      setVal("inp-apt-maintenance", 300);
      setVal("inp-apt-mgmt-pct", 0.0);
      setVal("inp-apt-down-payment", 8000);
      setVal("inp-apt-duration", 20);
      setVal("inp-apt-rate", 3.6);
      setVal("inp-apt-ins-rate", 0.3);

      const inpCredit = document.getElementById("inp-apt-monthly-credit");
      if (inpCredit) {
        inpCredit.value = "";
        inpCredit.dataset.autoCalc = "true";
      }
    }

    updateAptLiveSummary();
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

    const aptParams = {
      address: getVal("inp-apt-address") || name,
      start_year: Number(getVal("inp-apt-start-year")) || 2023,
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
      vacancy_pct: Number(getVal("inp-apt-vacance")) || 5.0,
      annual_coop: Number(getVal("inp-apt-coop")) || 900,
      annual_tf: Number(getVal("inp-apt-tf")) || 800,
      annual_pno: Number(getVal("inp-apt-pno")) || 150,
      annual_maintenance: Number(getVal("inp-apt-maintenance")) || 300,
      annual_mgmt_pct: Number(getVal("inp-apt-mgmt-pct")) || 0.0,
      monthly_loan_payment: Number(getVal("inp-apt-monthly-credit")) || 0,
      auto_calc_bank: true,
      down_payment_input: Number(getVal("inp-apt-down-payment")) || 8000,
      loan_duration: Number(getVal("inp-apt-duration")) || 20,
      annual_interest_rate: Number(getVal("inp-apt-rate")) || 3.6,
      annual_insurance_rate: Number(getVal("inp-apt-ins-rate")) || 0.3,
      user_tmi: 30
    };

    const payload = {
      name: name,
      original_name: originalName || undefined,
      data: aptParams,
      params: aptParams
    };

    const isLogged = window.Auth && window.Auth.isLoggedIn();
    if (isLogged) {
      try {
        const raw = await loadRawData();
        raw.apartments = raw.apartments || {};
        if (originalName && originalName !== name) delete raw.apartments[originalName];
        raw.apartments[name] = aptParams;
        await saveRawToCloud(raw);

        closeApartmentModal();
        await render();
        await autoSyncToFire();
      } catch (e) {
        alert(e.message);
      }
      return;
    }

    // Guest Mode: save into localStorage
    let guestData = getGuestPatrimoine() || { apartments: {}, turo: {} };
    if (!guestData.apartments) guestData.apartments = {};
    if (originalName && originalName !== name && guestData.apartments[originalName]) {
      delete guestData.apartments[originalName];
    }
    guestData.apartments[name] = aptParams;
    saveGuestPatrimoine(guestData);

    closeApartmentModal();
    await render();
    await autoSyncToFire();
  }

  async function deleteApartment(name) {
    if (!confirm(`Bạn có chắc chắn muốn xóa căn hộ "${name}" không?`)) return;

    const isLogged = window.Auth && window.Auth.isLoggedIn();
    if (isLogged) {
      try {
        const raw = await loadRawData();
        if (raw.apartments) delete raw.apartments[name];
        await saveRawToCloud(raw);

        await render();
        await autoSyncToFire();
      } catch (e) {
        alert(e.message);
      }
      return;
    }

    // Guest Mode: delete from localStorage
    let guestData = getGuestPatrimoine() || { apartments: {}, turo: {} };
    if (guestData.apartments && guestData.apartments[name]) {
      delete guestData.apartments[name];
      saveGuestPatrimoine(guestData);
    }
    await render();
    await autoSyncToFire();
  }

  async function saveTuroSettings() {
    const btn = document.getElementById("btn-save-turo");
    if (btn) {
      btn.disabled = true;
      btn.innerText = "Đang lưu...";
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

    const isLogged = window.Auth && window.Auth.isLoggedIn();
    if (isLogged) {
      try {
        const raw = await loadRawData();
        raw.turo = payload;
        await saveRawToCloud(raw);

        if (btn) {
          btn.innerText = "Đã lưu đám mây!";
          setTimeout(() => {
            btn.disabled = false;
            btn.innerText = "Lưu Cấu hình Turo";
          }, 1500);
        }
        await render();
        await autoSyncToFire();
      } catch (e) {
        alert(e.message);
        if (btn) {
          btn.disabled = false;
          btn.innerText = "Lưu Cấu hình Turo";
        }
      }
      return;
    }

    // Guest Mode: save into localStorage
    let guestData = getGuestPatrimoine() || { apartments: {}, turo: {} };
    guestData.turo = payload;
    saveGuestPatrimoine(guestData);

    if (btn) {
      btn.innerText = "Đã lưu vào trình duyệt!";
      setTimeout(() => {
        btn.disabled = false;
        btn.innerText = "Lưu Cấu hình Turo";
      }, 1500);
    }
    await render();
    await autoSyncToFire();
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  function updateAptLiveSummary(triggeredByCreditInput = false) {
    const price = parseFloat(getVal("inp-apt-price")) || 0;
    const notary = parseFloat(getVal("inp-apt-notary")) || 0;
    const furn = parseFloat(getVal("inp-apt-furniture")) || 0;
    const reno = parseFloat(getVal("inp-apt-reno")) || 0;
    const down = parseFloat(getVal("inp-apt-down-payment")) || 0;
    const rent = parseFloat(getVal("inp-apt-rent")) || 0;
    const vac = (parseFloat(getVal("inp-apt-vacance")) || 5.0) / 100.0;
    const tf = parseFloat(getVal("inp-apt-tf")) || 0;
    const coop = parseFloat(getVal("inp-apt-coop")) || 0;
    const pno = parseFloat(getVal("inp-apt-pno")) || 0;
    const maint = parseFloat(getVal("inp-apt-maintenance")) || 300;
    const mgmtPct = (parseFloat(getVal("inp-apt-mgmt-pct")) || 0.0) / 100.0;
    const dur = parseInt(getVal("inp-apt-duration")) || 20;
    const rate = (parseFloat(getVal("inp-apt-rate")) || 3.6) / 100.0;
    const insRate = (parseFloat(getVal("inp-apt-ins-rate")) || 0.3) / 100.0;

    const bank = 1500; // standard bank guarantee/file fee in France
    const total = price + notary + bank + reno + furn;
    const loan = Math.max(0, total - down);

    // Calculated monthly mortgage payment
    const r = rate / 12.0;
    const n = dur * 12;
    const loanPmt = (loan > 0 && r > 0) ? loan * (r / (1.0 - Math.pow(1.0 + r, -n))) : (loan / Math.max(1, n));
    const insPmt = (loan * insRate) / 12.0;
    const calcMonthlyPmt = Math.round(loanPmt + insPmt);

    // User's manual credit repayment input is the PRIMARY source of truth:
    const inpCredit = document.getElementById("inp-apt-monthly-credit");
    let actualCreditPmt = 0;
    if (inpCredit) {
      const typed = parseFloat(inpCredit.value);
      if (!isNaN(typed) && typed >= 0) {
        actualCreditPmt = Math.round(typed);
      }
    }

    // Effective rent after vacancy
    const effectiveRent = rent * (1.0 - vac);
    const monthlyMgmtFee = (effectiveRent * 12.0 * mgmtPct) / 12.0;
    const monthlyOperatingCharges = (coop + tf + pno + maint) / 12.0 + monthlyMgmtFee;
    const totalMonthlyOutflow = actualCreditPmt + monthlyOperatingCharges;
    const netCashflow = effectiveRent - totalMonthlyOutflow;

    // Badges update
    const badgeRent = document.getElementById("badge-apt-effective-rent");
    if (badgeRent) {
      badgeRent.innerText = `Thực thu: ${formatMoneyEUR(Math.round(effectiveRent))}/tháng`;
    }

    const badgeExp = document.getElementById("badge-apt-total-expenses");
    if (badgeExp) {
      badgeExp.innerText = `Tổng chi: ~${formatMoneyEUR(Math.round(totalMonthlyOutflow))}/tháng (Crédit: ${formatMoneyEUR(actualCreditPmt)} + Phí: ${formatMoneyEUR(Math.round(monthlyOperatingCharges))})`;
    }

    const lblTotal = document.getElementById("lbl-apt-total-project");
    const lblLoan = document.getElementById("lbl-apt-loan-amount");
    const lblDown = document.getElementById("lbl-apt-down-payment");
    const lblNetCf = document.getElementById("lbl-apt-net-cashflow");

    if (lblTotal) lblTotal.innerText = formatMoneyEUR(total);
    if (lblLoan) lblLoan.innerText = formatMoneyEUR(loan);
    if (lblDown) lblDown.innerText = formatMoneyEUR(down);
    if (lblNetCf) {
      const sign = netCashflow >= 0 ? "+" : "";
      lblNetCf.innerText = `${sign}${formatMoneyEUR(Math.round(netCashflow))}/tháng`;
      lblNetCf.style.color = netCashflow >= 0 ? "#10b981" : "#f87171";
    }
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

    // Auto-calculate Notary Fees (~7.5% in France) when property price changes
    const inpPrice = document.getElementById("inp-apt-price");
    const inpNotary = document.getElementById("inp-apt-notary");
    if (inpPrice && inpNotary) {
      inpPrice.addEventListener("input", () => {
        const p = parseFloat(inpPrice.value) || 0;
        inpNotary.value = Math.round(p * 0.075);
        updateAptLiveSummary();
      });
    }

    // Monthly Credit recalculate button (Only on manual user request)
    const btnRecalcCredit = document.getElementById("btn-recalc-apt-credit");
    if (btnRecalcCredit) {
      btnRecalcCredit.addEventListener("click", () => {
        const inpCredit = document.getElementById("inp-apt-monthly-credit");
        if (inpCredit) {
          const price = parseFloat(getVal("inp-apt-price")) || 0;
          const notary = parseFloat(getVal("inp-apt-notary")) || 0;
          const furn = parseFloat(getVal("inp-apt-furniture")) || 0;
          const reno = parseFloat(getVal("inp-apt-reno")) || 0;
          const down = parseFloat(getVal("inp-apt-down-payment")) || 0;
          const dur = parseInt(getVal("inp-apt-duration")) || 20;
          const rate = (parseFloat(getVal("inp-apt-rate")) || 3.6) / 100.0;
          const insRate = (parseFloat(getVal("inp-apt-ins-rate")) || 0.3) / 100.0;
          const bank = 1500;
          const total = price + notary + bank + reno + furn;
          const loan = Math.max(0, total - down);
          const r = rate / 12.0;
          const n = dur * 12;
          const loanPmt = (loan > 0 && r > 0) ? loan * (r / (1.0 - Math.pow(1.0 + r, -n))) : (loan / Math.max(1, n));
          const insPmt = (loan * insRate) / 12.0;
          const estPmt = Math.round(loanPmt + insPmt);
          inpCredit.value = estPmt;
          updateAptLiveSummary();
        }
      });
    }

    // Direct input on Monthly Credit
    const inpCredit = document.getElementById("inp-apt-monthly-credit");
    if (inpCredit) {
      inpCredit.addEventListener("input", () => {
        updateAptLiveSummary();
      });
    }

    // Live update apartment modal summary on cost & revenue inputs (without modifying monthly credit!)
    [
      "inp-apt-price", "inp-apt-notary", "inp-apt-furniture", "inp-apt-reno",
      "inp-apt-down-payment", "inp-apt-rent", "inp-apt-vacance", "inp-apt-tf",
      "inp-apt-coop", "inp-apt-pno", "inp-apt-maintenance", "inp-apt-mgmt-pct",
      "inp-apt-duration", "inp-apt-rate", "inp-apt-ins-rate"
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", () => updateAptLiveSummary());
    });
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
    deleteApartment,
    loadData,
    computeFullPatrimoine
  };

})();
