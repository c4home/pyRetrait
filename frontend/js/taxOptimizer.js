/**
 * pyRetrait — Tax Optimization, Multi-Country PPP & Pension Engine
 */

window.TaxOptimizer = (function() {
  'use strict';

  // Giỏ chuẩn gốc Tây Âu (Base West-European Retirement Basket in EUR / month)
  const BASE_RETIRE_BASKET_EUR = {
    lean: 1600,        // Mức sống cơ bản (Lean FIRE)
    standard: 2400,    // Mức sống tiêu chuẩn (Standard FIRE)
    fat: 4000,         // Mức sống thịnh vượng (Fat FIRE)
    seniorHealth: 180  // Chi phí y tế / bảo hiểm sức khỏe tuổi già gốc tại Pháp/Tây Âu
  };

  // Ma trận hồ sơ Sức mua tương đương (PPP Profiles) cho 22+ quốc gia / khu vực
  // Gốc chuẩn: Pháp Paris = 1.00
  const COUNTRY_PPP_PROFILES = {
    // 1. Pháp & Tây Âu
    'fr_paris': { countryCode: 'FR', label: 'Paris & Vùng Thủ Đô', countryLabel: 'Pháp', flag: '🇫🇷', ppp: 1.00, inflation: 0.020, healthCostBase: 180 },
    'fr_province': { countryCode: 'FR', label: 'Tỉnh lẻ Pháp', countryLabel: 'Pháp', flag: '🇫🇷', ppp: 0.85, inflation: 0.020, healthCostBase: 180 },
    'de_munich': { countryCode: 'DE', label: 'Munich / Frankfurt', countryLabel: 'Đức', flag: '🇩🇪', ppp: 1.05, inflation: 0.022, healthCostBase: 200 },
    'de_berlin': { countryCode: 'DE', label: 'Berlin / Tỉnh lẻ', countryLabel: 'Đức', flag: '🇩🇪', ppp: 0.90, inflation: 0.022, healthCostBase: 200 },
    'be_brussels': { countryCode: 'BE', label: 'Brussels / Bỉ', countryLabel: 'Bỉ', flag: '🇧🇪', ppp: 0.92, inflation: 0.020, healthCostBase: 180 },
    'ch_zurich': { countryCode: 'CH', label: 'Zurich / Geneva', countryLabel: 'Thụy Sĩ', flag: '🇨🇭', ppp: 1.45, inflation: 0.015, healthCostBase: 350 },
    'uk_london': { countryCode: 'UK', label: 'London / Anh', countryLabel: 'Anh', flag: '🇬🇧', ppp: 1.10, inflation: 0.025, healthCostBase: 150 },

    // 2. Nam Âu (Thiên đường hưu trí Châu Âu)
    'pt_lisbon': { countryCode: 'PT', label: 'Lisbon / Porto', countryLabel: 'Bồ Đào Nha', flag: '🇵🇹', ppp: 0.65, inflation: 0.025, healthCostBase: 140 },
    'pt_algarve': { countryCode: 'PT', label: 'Algarve / Tỉnh lẻ', countryLabel: 'Bồ Đào Nha', flag: '🇵🇹', ppp: 0.55, inflation: 0.025, healthCostBase: 130 },
    'es_valencia': { countryCode: 'ES', label: 'Valencia / Alicante', countryLabel: 'Tây Ban Nha', flag: '🇪🇸', ppp: 0.68, inflation: 0.023, healthCostBase: 140 },
    'es_province': { countryCode: 'ES', label: 'Tỉnh lẻ Tây Ban Nha', countryLabel: 'Tây Ban Nha', flag: '🇪🇸', ppp: 0.58, inflation: 0.023, healthCostBase: 130 },
    'it_rome': { countryCode: 'IT', label: 'Rome / Milan', countryLabel: 'Ý', flag: '🇮🇹', ppp: 0.78, inflation: 0.022, healthCostBase: 150 },
    'gr_athens': { countryCode: 'GR', label: 'Athens / Hy Lạp', countryLabel: 'Hy Lạp', flag: '🇬🇷', ppp: 0.58, inflation: 0.025, healthCostBase: 120 },

    // 3. Bắc Mỹ & Châu Đại Dương
    'us_ny_sf': { countryCode: 'US', label: 'New York / San Francisco', countryLabel: 'Mỹ', flag: '🇺🇸', ppp: 1.35, inflation: 0.025, healthCostBase: 300 },
    'us_average': { countryCode: 'US', label: 'Bình quân các bang Mỹ', countryLabel: 'Mỹ', flag: '🇺🇸', ppp: 1.00, inflation: 0.025, healthCostBase: 250 },
    'ca_toronto': { countryCode: 'CA', label: 'Toronto / Vancouver', countryLabel: 'Canada', flag: '🇨🇦', ppp: 0.98, inflation: 0.023, healthCostBase: 200 },
    'au_sydney': { countryCode: 'AU', label: 'Sydney / Melbourne', countryLabel: 'Úc', flag: '🇦🇺', ppp: 1.05, inflation: 0.025, healthCostBase: 220 },

    // 4. Đông Nam Á & Châu Á
    'vn_hcm_hn': { countryCode: 'VN', label: 'TP.HCM / Hà Nội', countryLabel: 'Việt Nam', flag: '🇻🇳', ppp: 0.45, inflation: 0.040, healthCostBase: 100 },
    'vn_province': { countryCode: 'VN', label: 'Đà Nẵng / Tỉnh lẻ VN', countryLabel: 'Việt Nam', flag: '🇻🇳', ppp: 0.35, inflation: 0.040, healthCostBase: 90 },
    'th_bangkok': { countryCode: 'TH', label: 'Bangkok', countryLabel: 'Thái Lan', flag: '🇹🇭', ppp: 0.45, inflation: 0.025, healthCostBase: 110 },
    'th_chiangmai': { countryCode: 'TH', label: 'Chiang Mai / Tỉnh lẻ', countryLabel: 'Thái Lan', flag: '🇹🇭', ppp: 0.35, inflation: 0.025, healthCostBase: 95 },
    'my_kl': { countryCode: 'MY', label: 'Kuala Lumpur / Penang', countryLabel: 'Malaysia', flag: '🇲🇾', ppp: 0.48, inflation: 0.025, healthCostBase: 100 },
    'sg_singapore': { countryCode: 'SG', label: 'Singapore', countryLabel: 'Singapore', flag: '🇸🇬', ppp: 1.20, inflation: 0.022, healthCostBase: 250 },
    'cn_shanghai': { countryCode: 'CN', label: 'Thượng Hải / Bắc Kinh', countryLabel: 'Trung Quốc', flag: '🇨🇳', ppp: 0.65, inflation: 0.025, healthCostBase: 120 },
    'cn_tier2': { countryCode: 'CN', label: 'Thành Đô / Tỉnh lẻ', countryLabel: 'Trung Quốc', flag: '🇨🇳', ppp: 0.45, inflation: 0.025, healthCostBase: 100 },
    'jp_tokyo': { countryCode: 'JP', label: 'Tokyo / Nhật Bản', countryLabel: 'Nhật Bản', flag: '🇯🇵', ppp: 0.85, inflation: 0.015, healthCostBase: 160 },

    // 5. Tùy chỉnh cá nhân
    'custom': { countryCode: 'CUSTOM', label: 'Tùy chỉnh cá nhân', countryLabel: 'Khác', flag: '🌐', ppp: 1.00, inflation: 0.025, healthCostBase: 150 }
  };

  // International / Vietnam progressive or flat rates
  const VN_TAX_BRACKETS = [
    { cap: 60_000_000, rate: 0.05 },
    { cap: 120_000_000, rate: 0.10 },
    { cap: 216_000_000, rate: 0.15 },
    { cap: 384_000_000, rate: 0.20 },
    { cap: 624_000_000, rate: 0.25 },
    { cap: 960_000_000, rate: 0.30 },
    { cap: Infinity, rate: 0.35 }
  ];

  // French Progressive Income Tax Brackets (Barème de l'Impôt sur le Revenu - IR 2024)
  const FR_TAX_BRACKETS = [
    { cap: 11294, rate: 0.00 },
    { cap: 28797, rate: 0.11 },
    { cap: 82341, rate: 0.30 },
    { cap: 177106, rate: 0.41 },
    { cap: Infinity, rate: 0.45 }
  ];

  // Flat Tax Pháp (Prélèvement Forfaitaire Unique - PFU)
  const FR_PFU_RATE = 0.30; // 12.8% IR + 17.2% Prélèvements Sociaux

  // US Federal Tax Brackets (2024)
  const US_TAX_BRACKETS_SINGLE = [
    { cap: 11600, rate: 0.10 },
    { cap: 47150, rate: 0.12 },
    { cap: 100525, rate: 0.22 },
    { cap: 191950, rate: 0.24 },
    { cap: 243725, rate: 0.32 },
    { cap: 609350, rate: 0.35 },
    { cap: Infinity, rate: 0.37 }
  ];

  const US_TAX_BRACKETS_MARRIED = [
    { cap: 23200, rate: 0.10 },
    { cap: 94300, rate: 0.12 },
    { cap: 201050, rate: 0.22 },
    { cap: 383900, rate: 0.24 },
    { cap: 487450, rate: 0.32 },
    { cap: 731200, rate: 0.35 },
    { cap: Infinity, rate: 0.37 }
  ];

  /**
   * Calculate progressive tax on given taxable income
   * Hỗ trợ số suất gia cảnh taxParts (1.0 = độc thân, 2.0 = vợ chồng)
   * @param {number} taxableIncome - Thu nhập chịu thuế gộp
   * @param {string} regime - Chế độ thuế ('france_vietnam', 'international', 'us', hoặc taxArchetype)
   * @param {Object|number} options - Tùy chọn (customTaxRate, currency, exchangeRateEurVnd, taxParts, taxArchetype)
   */
  function calculateProgressiveTax(taxableIncome, regime = 'france_vietnam', options = {}) {
    if (taxableIncome <= 0) return 0;

    const customRate = (typeof options === 'number')
      ? options
      : (options && options.customTaxRate !== undefined && options.customTaxRate !== null && !isNaN(Number(options.customTaxRate)) ? Number(options.customTaxRate) : null);
    const currency = (typeof options === 'object' && options.currency) ? options.currency : 'EUR';
    const fx = (typeof options === 'object' && Number(options.exchangeRateEurVnd) > 0) ? Number(options.exchangeRateEurVnd) : 27500;
    const kids = (typeof options === 'object' && Number(options.kidsCount) > 0) ? Number(options.kidsCount) : 0;
    const childParts = kids <= 2 ? (kids * 0.5) : (1.0 + (kids - 2) * 1.0);
    const explicitBase = (typeof options === 'object' && options.maritalStatus)
      ? (options.maritalStatus === 'married' ? 2.0 : 1.0)
      : null;
    const baseParts = explicitBase !== null
      ? explicitBase
      : ((typeof options === 'object' && Number(options.taxParts) > 0)
          ? Math.max(1.0, Math.min(2.0, Number(options.taxParts) - childParts))
          : 1.0);
    const taxParts = (typeof options === 'object' && Number(options.taxParts) > 0) ? Number(options.taxParts) : (baseParts + childParts);
    const archetype = (typeof options === 'object' && options.taxArchetype) ? options.taxArchetype : null;

    // 1. Chế độ Thuế suất Cố định / Không thuế vốn (Zero CGT / International)
    if (archetype === 'zero_cgt' || regime === 'international' || regime === 'zero_cgt') {
      const rate = (customRate !== null) ? customRate : 0.0;
      return taxableIncome * (rate / 100.0);
    }

    // 2. Chế độ Châu Á - Thái Bình Dương (Asia-Pacific / Vietnam Progressive)
    if (archetype === 'asia_pacific' || regime === 'asia_pacific' || regime === 'vietnam') {
      const incomeVnd = (currency === 'EUR') ? (taxableIncome * fx) : (currency === 'USD' ? (taxableIncome * 1.10 * fx) : taxableIncome);
      const deductionVnd = 132_000_000 + (taxParts > 1 ? (taxParts - 1) * 52_800_000 : 0);
      const netTaxableVnd = Math.max(0, incomeVnd - deductionVnd);
      let taxVnd = 0;
      let prevCap = 0;
      for (let i = 0; i < VN_TAX_BRACKETS.length; i++) {
        const { cap, rate } = VN_TAX_BRACKETS[i];
        if (netTaxableVnd > prevCap) {
          const chunk = Math.min(netTaxableVnd - prevCap, cap - prevCap);
          taxVnd += chunk * rate;
          prevCap = cap;
        } else {
          break;
        }
      }
      if (currency === 'EUR') return taxVnd / fx;
      if (currency === 'USD') return taxVnd / (fx * 1.10);
      return taxVnd;
    }

    // 3. Chế độ Chia Đôi Đức / EU Splitting (eu_splitting)
    if (archetype === 'eu_splitting' || regime === 'eu_splitting' || regime === 'germany') {
      const incomeEur = (currency === 'VND') ? (taxableIncome / fx) : (currency === 'USD' ? taxableIncome / 1.10 : taxableIncome);
      const splitFactor = taxParts >= 2 ? 2.0 : 1.0;
      const splitIncome = incomeEur / splitFactor;
      let taxEur = 0;
      if (splitIncome > 11784) {
        if (splitIncome <= 17005) {
          const y = (splitIncome - 11784) / 10000;
          taxEur = (995.21 * y + 1400) * y;
        } else if (splitIncome <= 66760) {
          const z = (splitIncome - 17005) / 10000;
          taxEur = (208.85 * z + 2397) * z + 1014;
        } else if (splitIncome <= 277825) {
          taxEur = 0.42 * splitIncome - 10602.13;
        } else {
          taxEur = 0.45 * splitIncome - 18936.88;
        }
      }
      taxEur = Math.max(0, taxEur) * splitFactor;
      if (currency === 'VND') return taxEur * fx;
      if (currency === 'USD') return taxEur * 1.10;
      return taxEur;
    }

    // 4. Chế độ Mỹ (US Federal)
    if (regime === 'us') {
      const incomeUsd = (currency === 'VND') ? (taxableIncome / (fx * 1.10)) : (currency === 'EUR' ? taxableIncome * 1.10 : taxableIncome);
      const brackets = taxParts >= 2 ? US_TAX_BRACKETS_MARRIED : US_TAX_BRACKETS_SINGLE;
      const stdDed = taxParts >= 2 ? 29200 : 14600;
      const netTaxableUsd = Math.max(0, incomeUsd - stdDed);
      let taxUsd = 0;
      let prevCap = 0;
      for (let i = 0; i < brackets.length; i++) {
        const { cap, rate } = brackets[i];
        if (netTaxableUsd > prevCap) {
          const chunk = Math.min(netTaxableUsd - prevCap, cap - prevCap);
          taxUsd += chunk * rate;
          prevCap = cap;
        } else {
          break;
        }
      }
      if (currency === 'VND') return taxUsd * (fx * 1.10);
      if (currency === 'EUR') return taxUsd / 1.10;
      return taxUsd;
    }

    // 5. Chế độ Pháp (Quotient Familial) — Mặc định 'france_vietnam' hoặc 'fr_quotient'
    const incomeEur = (currency === 'VND') ? (taxableIncome / fx) : (currency === 'USD' ? taxableIncome / 1.10 : taxableIncome);
    const abattementMax = 14171 * (taxParts >= 2 ? taxParts : 1.0);
    const abattementEur = Math.min(incomeEur * 0.10, abattementMax);
    const netTaxableEur = Math.max(0, incomeEur - abattementEur);

    function computeFrenchTaxParts(netEur, parts) {
      const incPerPart = netEur / parts;
      let taxPP = 0;
      let prevCap = 0;
      for (let i = 0; i < FR_TAX_BRACKETS.length; i++) {
        const { cap, rate } = FR_TAX_BRACKETS[i];
        if (incPerPart > prevCap) {
          const chunk = Math.min(incPerPart - prevCap, cap - prevCap);
          taxPP += chunk * rate;
          prevCap = cap;
        } else {
          break;
        }
      }
      return taxPP * parts;
    }

    let taxEur = computeFrenchTaxParts(netTaxableEur, taxParts);

    // Plafonnement du quotient familial: Trần giảm trừ tối đa 1.759 € cho mỗi nửa suất con tăng thêm
    const refBaseParts = (taxParts >= 2.0 && baseParts === 2.0) ? 2.0 : (taxParts > 1.0 && baseParts === 1.0 && kids > 0 ? 1.0 : (taxParts >= 2.0 ? 2.0 : 1.0));
    if (taxParts > refBaseParts) {
      const baseTax = computeFrenchTaxParts(netTaxableEur, refBaseParts);
      const extraParts = taxParts - refBaseParts;
      const maxReduction = (extraParts / 0.5) * 1759;
      const minTax = Math.max(0, baseTax - maxReduction);
      if (taxEur < minTax) {
        taxEur = minTax;
      }
    }

    if (currency === 'VND') return taxEur * fx;
    if (currency === 'USD') return taxEur * 1.10;
    return taxEur;
  }

  /**
   * Tính chi tiết từng bậc thuế, TMI và so sánh PFU (có xét taxParts)
   */
  function calculateTaxDetailed(taxableIncome, regime = 'france_vietnam', options = {}) {
    if (taxableIncome <= 0) {
      return {
        grossIncome: 0,
        abattement: 0,
        netTaxable: 0,
        totalTax: 0,
        effectiveRate: 0,
        marginalRate: 0,
        bracketDetails: [],
        pfuComparisonTax: 0,
        taxSavedVsPFU: 0
      };
    }

    const customRate = (typeof options === 'number')
      ? options
      : (options && options.customTaxRate !== undefined && options.customTaxRate !== null && !isNaN(Number(options.customTaxRate)) ? Number(options.customTaxRate) : null);
    const currency = (typeof options === 'object' && options.currency) ? options.currency : 'EUR';
    const fx = (typeof options === 'object' && Number(options.exchangeRateEurVnd) > 0) ? Number(options.exchangeRateEurVnd) : 27500;
    const kids = (typeof options === 'object' && Number(options.kidsCount) > 0) ? Number(options.kidsCount) : 0;
    const childParts = kids <= 2 ? (kids * 0.5) : (1.0 + (kids - 2) * 1.0);
    const explicitBase = (typeof options === 'object' && options.maritalStatus)
      ? (options.maritalStatus === 'married' ? 2.0 : 1.0)
      : null;
    const baseParts = explicitBase !== null
      ? explicitBase
      : ((typeof options === 'object' && Number(options.taxParts) > 0)
          ? Math.max(1.0, Math.min(2.0, Number(options.taxParts) - childParts))
          : 1.0);
    const taxParts = (typeof options === 'object' && Number(options.taxParts) > 0) ? Number(options.taxParts) : (baseParts + childParts);

    if (regime === 'international') {
      const rate = (customRate !== null) ? customRate : 10.0;
      const totalTax = taxableIncome * (rate / 100.0);
      return {
        grossIncome: taxableIncome,
        abattement: 0,
        netTaxable: taxableIncome,
        totalTax,
        effectiveRate: rate,
        marginalRate: rate,
        bracketDetails: [
          { bracketIndex: 1, ratePercent: rate, rangeLabel: 'Thuế suất bình quân tùy chỉnh', taxableAmount: taxableIncome, taxAmount: totalTax }
        ],
        pfuComparisonTax: taxableIncome * 0.30,
        taxSavedVsPFU: Math.max(0, (taxableIncome * 0.30) - totalTax)
      };
    }

    if (regime === 'france_vietnam' || regime === 'fr_quotient') {
      const incomeEur = (currency === 'VND') ? (taxableIncome / fx) : (currency === 'USD' ? taxableIncome / 1.10 : taxableIncome);
      const abattementMax = 14171 * (taxParts >= 2 ? taxParts : 1.0);
      const abattementEur = Math.min(incomeEur * 0.10, abattementMax);
      const netTaxableEur = Math.max(0, incomeEur - abattementEur);

      const incomePerPart = netTaxableEur / taxParts;
      let totalTaxPerPart = 0;
      let prevCap = 0;
      let marginalRate = 0;
      const bracketDetails = [];

      for (let i = 0; i < FR_TAX_BRACKETS.length; i++) {
        const { cap, rate } = FR_TAX_BRACKETS[i];
        if (incomePerPart > prevCap) {
          const chunkPerPart = Math.min(incomePerPart - prevCap, cap - prevCap);
          const chunkTaxPerPart = chunkPerPart * rate;
          totalTaxPerPart += chunkTaxPerPart;
          marginalRate = rate * 100;
          bracketDetails.push({
            bracketIndex: i + 1,
            ratePercent: rate * 100,
            rangeLabel: cap === Infinity ? `> ${(prevCap * taxParts).toLocaleString('fr-FR')} €` : `${(prevCap * taxParts).toLocaleString('fr-FR')} € – ${(cap * taxParts).toLocaleString('fr-FR')} €`,
            taxableAmount: chunkPerPart * taxParts,
            taxAmount: chunkTaxPerPart * taxParts
          });
          prevCap = cap;
        } else {
          break;
        }
      }

      let totalTaxEur = totalTaxPerPart * taxParts;
      const refBaseParts = (taxParts >= 2.0 && baseParts === 2.0) ? 2.0 : (taxParts > 1.0 && baseParts === 1.0 && kids > 0 ? 1.0 : (taxParts >= 2.0 ? 2.0 : 1.0));
      if (taxParts > refBaseParts) {
        const baseIncomePerPart = netTaxableEur / refBaseParts;
        let baseTaxPP = 0;
        let prevBaseCap = 0;
        for (let i = 0; i < FR_TAX_BRACKETS.length; i++) {
          const { cap, rate } = FR_TAX_BRACKETS[i];
          if (baseIncomePerPart > prevBaseCap) {
            const chunk = Math.min(baseIncomePerPart - prevBaseCap, cap - prevBaseCap);
            baseTaxPP += chunk * rate;
            prevBaseCap = cap;
          } else {
            break;
          }
        }
        const baseTaxEur = baseTaxPP * refBaseParts;
        const extraParts = taxParts - refBaseParts;
        const maxReduction = (extraParts / 0.5) * 1759;
        const minTaxEur = Math.max(0, baseTaxEur - maxReduction);
        if (totalTaxEur < minTaxEur) {
          totalTaxEur = minTaxEur;
        }
      }

      const convFactor = (currency === 'VND') ? fx : (currency === 'USD' ? 1.10 : 1);
      const totalTax = totalTaxEur * convFactor;
      const effectiveRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;
      const pfuComparisonTax = (incomeEur * FR_PFU_RATE) * convFactor;
      const taxSavedVsPFU = Math.max(0, pfuComparisonTax - totalTax);

      return {
        grossIncome: taxableIncome,
        abattement: abattementEur * convFactor,
        netTaxable: netTaxableEur * convFactor,
        totalTax,
        effectiveRate,
        marginalRate,
        bracketDetails,
        pfuComparisonTax,
        taxSavedVsPFU
      };
    }

    // US Regime
    const incomeUsd = (currency === 'VND') ? (taxableIncome / (fx * 1.10)) : (currency === 'EUR' ? taxableIncome * 1.10 : taxableIncome);
    const brackets = taxParts >= 2 ? US_TAX_BRACKETS_MARRIED : US_TAX_BRACKETS_SINGLE;
    const stdDed = taxParts >= 2 ? 29200 : 14600;
    const netTaxableUsd = Math.max(0, incomeUsd - stdDed);

    let totalTaxUsd = 0;
    let prevCap = 0;
    let marginalRate = 0;
    const bracketDetails = [];

    for (let i = 0; i < brackets.length; i++) {
      const { cap, rate } = brackets[i];
      if (netTaxableUsd > prevCap) {
        const chunk = Math.min(netTaxableUsd - prevCap, cap - prevCap);
        const chunkTax = chunk * rate;
        totalTaxUsd += chunkTax;
        marginalRate = rate * 100;
        bracketDetails.push({
          bracketIndex: i + 1,
          ratePercent: rate * 100,
          rangeLabel: cap === Infinity ? `> $${prevCap.toLocaleString('en-US')}` : `$${prevCap.toLocaleString('en-US')} – $${cap.toLocaleString('en-US')}`,
          taxableAmount: chunk,
          taxAmount: chunkTax
        });
        prevCap = cap;
      } else {
        break;
      }
    }

    const convFactor = (currency === 'VND') ? (fx * 1.10) : (currency === 'EUR' ? 1 / 1.10 : 1);
    const totalTax = totalTaxUsd * convFactor;
    const effectiveRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;

    return {
      grossIncome: taxableIncome,
      abattement: stdDed * convFactor,
      netTaxable: netTaxableUsd * convFactor,
      totalTax,
      effectiveRate,
      marginalRate,
      bracketDetails,
      pfuComparisonTax: taxableIncome * 0.30,
      taxSavedVsPFU: Math.max(0, (taxableIncome * 0.30) - totalTax)
    };
  }

  /**
   * Tính Chi tiêu Hưu trí Dự kiến Từ Dòng Tiền & Số Dư Hàng Tháng Hiện Tại
   * Công thức: Chi tiêu hiện tại = Thu nhập ròng - Tiết kiệm - Nợ vay mua nhà tất toán trước hưu
   * Quy đổi sang nơi nghỉ hưu theo PPP + Phụ phí bảo hiểm y tế tuổi già
   * @param {Object} params - Tham số dòng tiền
   * @returns {Object} Kết quả chi tiêu hưu trí, hệ số PPP và bảng bóc tách 7 hạng mục
   */
  function calculateRetireBudgetFromCashflow(params = {}) {
    const {
      monthlyNetIncome = 0,
      monthlySavings = 0,
      monthlyMortgagePaidOff = 0,
      currentMonthlyLivingFallback = 2000,
      workCityKey = 'fr_paris',
      retireCityKey = 'vn_hcm_hn',
      retireMode = 'relocate', // 'domestic' | 'relocate' | 'hybrid'
      householdSize = 1,
      customPpp = null
    } = params;

    const netIncome = Math.max(0, Number(monthlyNetIncome) || 0);
    const savings = Math.max(0, Number(monthlySavings) || 0);
    const mortgagePaid = Math.max(0, Number(monthlyMortgagePaidOff) || 0);

    // Bước 1: Chi tiêu sinh hoạt thực tế hiện tại
    let currentLivingMonthly;
    if (netIncome > savings && netIncome > 0) {
      currentLivingMonthly = Math.max(500, Math.round(netIncome - savings - mortgagePaid));
    } else {
      currentLivingMonthly = Math.max(500, Math.round(Number(currentMonthlyLivingFallback) || 2000));
    }

    // Bước 2: Xác định hệ số Sức mua tương đương (PPP)
    const workProfile = COUNTRY_PPP_PROFILES[workCityKey] || COUNTRY_PPP_PROFILES['fr_paris'];
    const retireProfile = COUNTRY_PPP_PROFILES[retireCityKey] || COUNTRY_PPP_PROFILES['vn_hcm_hn'];
    const pppWork = workProfile.ppp || 1.0;
    const pppRetire = (customPpp !== null && !isNaN(Number(customPpp))) ? Number(customPpp) : (retireProfile.ppp || 1.0);

    let effectivePpp;
    let pppRatio;

    if (retireMode === 'domestic' || workCityKey === retireCityKey) {
      effectivePpp = pppWork;
      pppRatio = 1.0;
    } else if (retireMode === 'hybrid') {
      effectivePpp = 0.5 * pppWork + 0.5 * pppRetire;
      pppRatio = effectivePpp / pppWork;
    } else {
      // 'relocate'
      effectivePpp = pppRetire;
      pppRatio = pppRetire / pppWork;
    }

    const pppAdjustedLiving = Math.round(currentLivingMonthly * pppRatio);

    // Bước 3: Phụ phí bảo hiểm y tế tuổi già (Senior Health Add-on)
    const baseSeniorHealth = BASE_RETIRE_BASKET_EUR.seniorHealth;
    const seniorHealthAddon = Math.round(baseSeniorHealth * effectivePpp * (householdSize >= 2 ? 1.90 : 1.0));
    const monthlyRetireTotal = pppAdjustedLiving + seniorHealthAddon;
    const annualRetireTotal = monthlyRetireTotal * 12;

    // Dòng tham chiếu tĩnh 3 mốc (Lean, Standard, Fat) để đối chiếu
    const hhMult = (householdSize >= 2 ? 1.70 : 1.0);
    const lean = Math.round(BASE_RETIRE_BASKET_EUR.lean * effectivePpp * hhMult);
    const standard = Math.round(BASE_RETIRE_BASKET_EUR.standard * effectivePpp * hhMult);
    const fat = Math.round(BASE_RETIRE_BASKET_EUR.fat * effectivePpp * hhMult);

    let matchedTierLabel = 'Tiêu chuẩn';
    if (monthlyRetireTotal < standard * 0.85) {
      matchedTierLabel = 'Cơ bản';
    } else if (monthlyRetireTotal > standard * 1.35) {
      matchedTierLabel = 'Thịnh vượng';
    }

    // Bóc tách 7 hạng mục chi tiêu thiết yếu hàng tháng
    const breakdown = {
      food: Math.round(pppAdjustedLiving * 0.26),
      housing: Math.round(pppAdjustedLiving * 0.24),
      health: seniorHealthAddon + Math.round(pppAdjustedLiving * 0.06),
      utilities: Math.round(pppAdjustedLiving * 0.10),
      transport: Math.round(pppAdjustedLiving * 0.10),
      household: Math.round(pppAdjustedLiving * 0.10),
      leisure: Math.round(pppAdjustedLiving * 0.14)
    };

    return {
      currentLivingMonthly,
      pppRatio,
      effectivePpp,
      pppAdjustedLiving,
      seniorHealthAddon,
      monthlyRetireTotal,
      annualRetireTotal,
      matchedTierLabel,
      referenceBenchmarks: { lean, standard, fat },
      breakdown
    };
  }

  /**
   * Tra cứu 3 mốc chi tiêu tham chiếu xã hội (Cơ bản, Tiêu chuẩn, Thịnh vượng) theo địa phương
   * @param {string} cityKey - Mã địa phương
   * @param {string} lifestyleTier - 'lean' | 'standard' | 'fat'
   * @param {number} householdSize - 1 (cá nhân) | 2 (vợ chồng)
   * @param {number|null} customPppFactor - Hệ số PPP tùy biến
   */
  function getSuggestedRetirementBudget(cityKey = 'vn_hcm_hn', lifestyleTier = 'standard', householdSize = 1, customPppFactor = null) {
    const profile = COUNTRY_PPP_PROFILES[cityKey] || COUNTRY_PPP_PROFILES['fr_paris'];
    const ppp = (customPppFactor !== null && !isNaN(Number(customPppFactor))) ? Number(customPppFactor) : (profile.ppp || 1.0);
    const hhMult = householdSize >= 2 ? 1.70 : 1.0;

    const lean = Math.round(BASE_RETIRE_BASKET_EUR.lean * ppp * hhMult);
    const standard = Math.round(BASE_RETIRE_BASKET_EUR.standard * ppp * hhMult);
    const fat = Math.round(BASE_RETIRE_BASKET_EUR.fat * ppp * hhMult);
    const seniorHealth = Math.round(BASE_RETIRE_BASKET_EUR.seniorHealth * ppp * (householdSize >= 2 ? 1.90 : 1.0));

    let monthlyBudget = standard;
    if (lifestyleTier === 'lean') monthlyBudget = lean;
    else if (lifestyleTier === 'fat') monthlyBudget = fat;

    const livingPortion = Math.max(0, monthlyBudget - seniorHealth);
    const breakdown = {
      food: Math.round(livingPortion * 0.26),
      housing: Math.round(livingPortion * 0.24),
      health: seniorHealth + Math.round(livingPortion * 0.06),
      utilities: Math.round(livingPortion * 0.10),
      transport: Math.round(livingPortion * 0.10),
      household: Math.round(livingPortion * 0.10),
      leisure: Math.round(livingPortion * 0.14)
    };

    return {
      cityKey,
      ppp,
      householdSize,
      lifestyleTier,
      monthlyBudget,
      annualBudget: monthlyBudget * 12,
      seniorHealth,
      benchmarks: { lean, standard, fat },
      breakdown
    };
  }

  /**
   * Tính chính xác Lương hưu Pháp (CNAV + Agirc-Arrco) theo luật Cải cách Hưu trí Pháp 2023
   * Hỗ trợ gọi cho cá nhân hoặc hồ sơ vợ chồng 2 người độc lập
   * - 172 quý (trimestres) để hưởng trọn tỷ lệ 50%
   * - Tuổi 64: Tuổi tối thiểu bắt đầu nhận hưu
   * - Tuổi 67: Tuổi xóa phạt décote tự động
   * - Phạt décote: -1.25% mỗi quý thiếu nếu claim trước 67t
   */
  function calculateFrenchPension(averageSalary, startWorkAge, stopWorkAge, claimAge = 67) {
    // Hỗ trợ truyền vào object cặp vợ chồng { spouse1, spouse2 }
    if (typeof averageSalary === 'object' && averageSalary !== null && (averageSalary.spouse1 || averageSalary.spouse2)) {
      const s1 = averageSalary.spouse1 || {};
      const s2 = averageSalary.spouse2 || {};
      const p1 = calculateFrenchPension(
        s1.averageSalary || s1.targetAnnualPension || 0,
        s1.startWorkAge !== undefined ? s1.startWorkAge : 24,
        s1.stopWorkAge !== undefined ? s1.stopWorkAge : (s1.claimAge || 64),
        s1.claimAge !== undefined ? s1.claimAge : 64
      );
      const p2 = calculateFrenchPension(
        s2.averageSalary || s2.targetAnnualPension || 0,
        s2.startWorkAge !== undefined ? s2.startWorkAge : 24,
        s2.stopWorkAge !== undefined ? s2.stopWorkAge : (s2.claimAge || 64),
        s2.claimAge !== undefined ? s2.claimAge : 64
      );
      return {
        spouse1: p1,
        spouse2: p2,
        totalAnnualPension: p1.totalAnnualPension + p2.totalAnnualPension,
        monthlyPension: p1.monthlyPension + p2.monthlyPension
      };
    }

    // Tương thích ngược nếu người dùng truyền số quý đóng thay vì tuổi
    let trimestresAcquis;
    let yearsWorkedInFrance;
    if (Number(startWorkAge) > 80) {
      trimestresAcquis = Math.min(172, Math.max(0, Number(startWorkAge)));
      yearsWorkedInFrance = Math.round(trimestresAcquis / 4);
    } else {
      yearsWorkedInFrance = Math.max(0, Number(stopWorkAge) - Number(startWorkAge));
      trimestresAcquis = Math.min(172, yearsWorkedInFrance * 4);
    }
    const trimestresRequis = 172; // Réforme 2023

    // Plafond Annuel de la Sécurité Sociale (PASS ~46,368 €)
    const PASS = 46368;
    const sam = Math.min(Number(averageSalary) || 0, PASS);

    // Taux plein = 50% ở tuổi 67
    let taux = 0.50;
    const actualClaimAge = Number(claimAge) || 67;
    if (actualClaimAge < 67) {
      // Phạt décote 1.25% mỗi quý thiếu
      const trimestresManquants = (67 - actualClaimAge) * 4;
      taux = Math.max(0.375, 0.50 - (trimestresManquants * 0.0125));
    }

    const retraiteBase = sam * taux * (trimestresAcquis / trimestresRequis);
    // Agirc-Arrco bổ sung ước tính 55% mức lương hưu cơ bản
    const agircArrco = retraiteBase * 0.55;

    const totalAnnualPension = Math.round(retraiteBase + agircArrco);
    return {
      yearsWorked: yearsWorkedInFrance,
      trimestresAcquis,
      trimestresRequis,
      retraiteBase: Math.round(retraiteBase),
      agircArrco: Math.round(agircArrco),
      totalAnnualPension,
      monthlyPension: Math.round(totalAnnualPension / 12)
    };
  }

  /**
   * Tính Lương hưu BHXH Việt Nam chuẩn Luật Bảo hiểm Xã hội
   * - Nam: 20 năm đầu = 45%, mỗi năm sau +2% -> Tối đa 75% ở 35 năm đóng (Tuổi nghỉ hưu 62t)
   * - Nữ: 15 năm đầu = 45%, mỗi năm sau +2% -> Tối đa 75% ở 30 năm đóng (Tuổi nghỉ hưu 60t)
   * - Phạt nghỉ hưu trước tuổi: Giảm 2% tỷ lệ hưởng mỗi năm nghỉ sớm
   * @param {number|Object} salaryVnd - Tiền lương đóng BHXH bình quân (hoặc object { spouse1, spouse2 })
   * @param {number} yearsContributed - Số năm đóng BHXH
   * @param {string} gender - 'male' | 'female'
   * @param {number|null} claimAge - Tuổi bắt đầu hưởng lương hưu
   */
  function calculateVietnamBhxhPension(salaryVnd, yearsContributed, gender = 'male', claimAge = null) {
    if (typeof salaryVnd === 'object' && salaryVnd !== null && (salaryVnd.spouse1 || salaryVnd.spouse2)) {
      const s1 = salaryVnd.spouse1 || {};
      const s2 = salaryVnd.spouse2 || {};
      const p1 = calculateVietnamBhxhPension(
        s1.monthlySalaryVnd || s1.salaryVnd || 0,
        s1.yearsContributed !== undefined ? s1.yearsContributed : 20,
        s1.gender || 'male',
        s1.claimAge !== undefined ? s1.claimAge : 62
      );
      const p2 = calculateVietnamBhxhPension(
        s2.monthlySalaryVnd || s2.salaryVnd || 0,
        s2.yearsContributed !== undefined ? s2.yearsContributed : 20,
        s2.gender || 'female',
        s2.claimAge !== undefined ? s2.claimAge : 60
      );
      return {
        spouse1: p1,
        spouse2: p2,
        totalMonthlyPensionVnd: p1.monthlyPensionVnd + p2.monthlyPensionVnd,
        totalAnnualPensionVnd: p1.annualPensionVnd + p2.annualPensionVnd
      };
    }

    const salary = Number(salaryVnd) || 0;
    const years = Math.max(0, Number(yearsContributed) || 0);
    const isFemale = (String(gender).toLowerCase() === 'female' || String(gender).toLowerCase() === 'nu');
    const standardAge = isFemale ? 60 : 62;
    const actualClaimAge = (claimAge !== null && claimAge !== undefined) ? Number(claimAge) : standardAge;

    let baseRate = 0;
    if (isFemale) {
      if (years >= 15) {
        baseRate = 0.45 + (years - 15) * 0.02;
      } else {
        baseRate = years * 0.03;
      }
    } else {
      if (years >= 20) {
        baseRate = 0.45 + (years - 20) * 0.02;
      } else {
        baseRate = years * 0.0225;
      }
    }
    baseRate = Math.min(0.75, Math.max(0, baseRate));

    // Phạt nghỉ hưu sớm trước tuổi luật định (-2% mỗi năm thiếu)
    let penaltyRate = 0;
    if (actualClaimAge < standardAge) {
      penaltyRate = (standardAge - actualClaimAge) * 0.02;
    }
    const effectiveRate = Math.max(0, baseRate - penaltyRate);

    const monthlyPensionVnd = Math.round(salary * effectiveRate);
    const annualPensionVnd = monthlyPensionVnd * 12;

    return {
      gender: isFemale ? 'female' : 'male',
      yearsContributed: years,
      standardAge,
      claimAge: actualClaimAge,
      baseRatePercent: Math.round(baseRate * 100 * 10) / 10,
      penaltyPercent: Math.round(penaltyRate * 100 * 10) / 10,
      effectiveRatePercent: Math.round(effectiveRate * 100 * 10) / 10,
      monthlyPensionVnd,
      annualPensionVnd
    };
  }

  /**
   * Tax-Efficient French Account Withdrawal Waterfall
   * Priority:
   * 1. Livret A / Cash (100% tax free, low yield)
   * 2. Assurance-Vie (>8 yrs, tax allowance 4,600 € / yr capital gains for single, 9,200 € for couple)
   * 3. PEA (>5 yrs, 0% IR income tax)
   * 4. CTO / Taxable accounts (PFU 30%)
   */
  function simulateWithdrawalWaterfall(accounts, neededAnnualAmount, isSingle = true) {
    let remainingNeed = neededAnnualAmount;
    let fromCash = 0;
    let fromAV = 0;
    let fromPEA = 0;
    let fromCTO = 0;
    let taxPaid = 0;
    let taxSavedVsPFU = 0;

    let livretA = Number(accounts?.livretABalance) || 0;
    let av = Number(accounts?.assuranceVieBalance) || 0;
    let pea = Number(accounts?.peaBalance) || 0;
    let cto = Number(accounts?.ctoBalance) || 0;

    // 1. Tier 1: Cash / Livret A
    if (remainingNeed > 0 && livretA > 0) {
      fromCash = Math.min(remainingNeed, livretA);
      remainingNeed -= fromCash;
      livretA -= fromCash;
    }

    // 2. Tier 2: Assurance-Vie past 8 years (Abattement 4,600 € single / 9,200 € couple)
    const avAllowance = isSingle ? 4600 : 9200;
    if (remainingNeed > 0 && av > 0) {
      // Assuming rough 40% gain proportion in AV
      const maxWithdrawalTaxFree = avAllowance / 0.40;
      fromAV = Math.min(remainingNeed, av, maxWithdrawalTaxFree);
      remainingNeed -= fromAV;
      av -= fromAV;
      // Tax avoided: 12.8% IR portion avoided under allowance
      taxSavedVsPFU += Math.min(fromAV * 0.40, avAllowance) * 0.128;
    }

    // 3. Tier 3: PEA past 5 years (0% IR tax, exempt)
    if (remainingNeed > 0 && pea > 0) {
      fromPEA = Math.min(remainingNeed, pea);
      remainingNeed -= fromPEA;
      pea -= fromPEA;
      // PEA is exempt from 12.8% IR, and for non-residents in VN under DTA, French social levies CSG 17.2% are not due
      taxSavedVsPFU += (fromPEA * 0.45) * 0.30;
    }

    // 4. Tier 4: CTO / Remainder
    if (remainingNeed > 0) {
      fromCTO = remainingNeed;
      taxPaid += (fromCTO * 0.40) * 0.30; // 30% Flat tax on gains
    }

    return {
      fromCash: Math.round(fromCash),
      fromAV: Math.round(fromAV),
      fromPEA: Math.round(fromPEA),
      fromCTO: Math.round(fromCTO),
      taxPaid: Math.round(taxPaid),
      taxSavedVsPFU: Math.round(taxSavedVsPFU),
      remainingBalances: {
        livretA: Math.round(livretA),
        av: Math.round(av),
        pea: Math.round(pea),
        cto: Math.round(cto)
      }
    };
  }

  return {
    BASE_RETIRE_BASKET_EUR,
    COUNTRY_PPP_PROFILES,
    calculateProgressiveTax,
    calculateTaxDetailed,
    calculateRetireBudgetFromCashflow,
    getSuggestedRetirementBudget,
    calculateFrenchPension,
    calculateVietnamBhxhPension,
    simulateWithdrawalWaterfall
  };
})();

