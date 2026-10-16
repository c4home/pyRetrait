/**
 * pyRetrait — Tax Optimization & French-Vietnam Fiscal Engine
 */

window.TaxOptimizer = (function() {
  'use strict';

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

  // French Progressive Income Tax Brackets (Barème de l'Impôt sur le Revenu - IR)
  const FR_TAX_BRACKETS = [
    { cap: 11294, rate: 0.00 },
    { cap: 28797, rate: 0.11 },
    { cap: 82341, rate: 0.30 },
    { cap: 177106, rate: 0.41 },
    { cap: Infinity, rate: 0.45 }
  ];

  // Flat Tax (Prélèvement Forfaitaire Unique - PFU)
  const FR_PFU_RATE = 0.30; // 12.8% IR + 17.2% Prélèvements Sociaux

  /**
   * Calculate progressive tax on given taxable income
   * @param {number} taxableIncome - Thu nhập chịu thuế gộp
   * @param {string} regime - Chế độ thuế ('france_vietnam', 'international')
   * @param {Object|number} options - Tùy chọn (customTaxRate, currency, exchangeRateEurVnd)
   */
  function calculateProgressiveTax(taxableIncome, regime = 'france_vietnam', options = {}) {
    if (taxableIncome <= 0) return 0;

    const customRate = (typeof options === 'number')
      ? options
      : (options && options.customTaxRate !== undefined && options.customTaxRate !== null && !isNaN(Number(options.customTaxRate)) ? Number(options.customTaxRate) : null);
    const currency = (typeof options === 'object' && options.currency) ? options.currency : 'EUR';
    const fx = (typeof options === 'object' && Number(options.exchangeRateEurVnd) > 0) ? Number(options.exchangeRateEurVnd) : 27500;

    // 1. Chế độ Quốc tế / Thuế tùy chỉnh:
    if (regime === 'international') {
      const rate = (customRate !== null) ? customRate : 10.0;
      return taxableIncome * (rate / 100.0);
    }

    // 2. Chế độ Pháp ↔ Việt Nam:
    if (regime === 'france_vietnam') {
      // Đưa về đơn vị EUR để tính chuẩn biểu thuế IR Pháp 2024
      const incomeEur = (currency === 'VND') ? (taxableIncome / fx) : (currency === 'USD' ? taxableIncome / 1.10 : taxableIncome);
      const abattementEur = Math.min(incomeEur * 0.10, 14171); // Giảm trừ 10% frais pro tối đa 14.171 € (2024)
      const netTaxableEur = Math.max(0, incomeEur - abattementEur);

      let taxEur = 0;
      let prevCap = 0;
      for (let i = 0; i < FR_TAX_BRACKETS.length; i++) {
        const { cap, rate } = FR_TAX_BRACKETS[i];
        if (netTaxableEur > prevCap) {
          const chunk = Math.min(netTaxableEur - prevCap, cap - prevCap);
          taxEur += chunk * rate;
          prevCap = cap;
        } else {
          break;
        }
      }

      if (currency === 'VND') return taxEur * fx;
      if (currency === 'USD') return taxEur * 1.10;
      return taxEur;
    }

    return taxableIncome * 0.10;
  }

  /**
   * Tính chi tiết từng bậc thuế (Bậc 0%, 11%, 30%...), TMI và so sánh PFU
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

    if (regime === 'france_vietnam') {
      const incomeEur = (currency === 'VND') ? (taxableIncome / fx) : (currency === 'USD' ? taxableIncome / 1.10 : taxableIncome);
      const abattementEur = Math.min(incomeEur * 0.10, 14171);
      const netTaxableEur = Math.max(0, incomeEur - abattementEur);

      let totalTaxEur = 0;
      let prevCap = 0;
      let marginalRate = 0;
      const bracketDetails = [];

      for (let i = 0; i < FR_TAX_BRACKETS.length; i++) {
        const { cap, rate } = FR_TAX_BRACKETS[i];
        if (netTaxableEur > prevCap) {
          const chunk = Math.min(netTaxableEur - prevCap, cap - prevCap);
          const chunkTax = chunk * rate;
          totalTaxEur += chunkTax;
          marginalRate = rate * 100;
          bracketDetails.push({
            bracketIndex: i + 1,
            ratePercent: rate * 100,
            rangeLabel: cap === Infinity ? `> ${prevCap.toLocaleString('fr-FR')} €` : `${prevCap.toLocaleString('fr-FR')} € – ${cap.toLocaleString('fr-FR')} €`,
            taxableAmount: chunk,
            taxAmount: chunkTax
          });
          prevCap = cap;
        } else {
          break;
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
    let totalTaxUsd = 0;
    let prevCap = 0;
    let marginalRate = 0;
    const bracketDetails = [];

    for (let i = 0; i < US_TAX_BRACKETS_SINGLE.length; i++) {
      const { cap, rate } = US_TAX_BRACKETS_SINGLE[i];
      if (incomeUsd > prevCap) {
        const chunk = Math.min(incomeUsd - prevCap, cap - prevCap);
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
      abattement: 0,
      netTaxable: taxableIncome,
      totalTax,
      effectiveRate,
      marginalRate,
      bracketDetails,
      pfuComparisonTax: taxableIncome * 0.30,
      taxSavedVsPFU: Math.max(0, (taxableIncome * 0.30) - totalTax)
    };
  }

  /**
   * Calculate exact French state pension (CNAV + Agirc-Arrco) based on French 2023 reform
   * For workers born after 1968:
   * - 172 trimestres required for full rate
   * - Age 64: Legal minimum retirement age
   * - Age 67: Age du taux plein automatique (no decote)
   */
  function calculateFrenchPension(averageSalary, startWorkAge, stopWorkAge, claimAge = 67) {
    const yearsWorkedInFrance = Math.max(0, stopWorkAge - startWorkAge);
    const trimestresAcquis = Math.min(172, yearsWorkedInFrance * 4);
    const trimestresRequis = 172; // Réforme 2023

    // Plafond Annuel de la Sécurité Sociale (PASS ~46,368 €)
    const PASS = 46368;
    const sam = Math.min(averageSalary, PASS);

    // Taux plein = 50% at age 67
    let taux = 0.50;
    if (claimAge < 67) {
      // Decote de 1.25% par trimestre manquant
      const trimestresManquants = (67 - claimAge) * 4;
      taux = Math.max(0.375, 0.50 - (trimestresManquants * 0.0125));
    }

    const retraiteBase = sam * taux * (trimestresAcquis / trimestresRequis);
    // Agirc-Arrco complémentaire estimates roughly 50-65% of base pension for cadre/non-cadre
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
   * Tax-Efficient French Account Withdrawal Waterfall
   * Priority:
   * 1. Livret A / Cash (100% tax free, low yield)
   * 2. Assurance-Vie (>8 yrs, tax allowance 4,600 € / yr capital gains)
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
      // PEA is exempt from 12.8% IR, and for non-residents in VN under DTA, French social levies CSG 17.2% are not due!
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
    calculateProgressiveTax,
    calculateTaxDetailed,
    calculateFrenchPension,
    simulateWithdrawalWaterfall
  };
})();
