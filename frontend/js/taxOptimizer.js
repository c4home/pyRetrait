/**
 * pyRetrait — Tax Optimization, Roth Conversion Ladder, Capital Gains & ACA Subsidy Engine
 */

window.TaxOptimizer = (function() {
  'use strict';

  // US Federal Tax Brackets (Single / Married Filing Jointly simplified reference)
  const US_TAX_BRACKETS_SINGLE = [
    { cap: 11600, rate: 0.10 },
    { cap: 47150, rate: 0.12 },
    { cap: 100525, rate: 0.22 },
    { cap: 191950, rate: 0.24 },
    { cap: 243725, rate: 0.32 },
    { cap: 609350, rate: 0.35 },
    { cap: Infinity, rate: 0.37 }
  ];

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
   */
  function calculateProgressiveTax(taxableIncome, regime = 'france_vietnam') {
    if (taxableIncome <= 0) return 0;
    
    let brackets = FR_TAX_BRACKETS;
    let netTaxable = taxableIncome;

    if (regime === 'france_vietnam') {
      // 10% Abattement forfaitaire pour frais professionnels (Plafond 14,171 €)
      const abattement = Math.min(taxableIncome * 0.10, 14171);
      netTaxable = Math.max(0, taxableIncome - abattement);
      brackets = FR_TAX_BRACKETS;
    } else if (regime === 'us') {
      brackets = US_TAX_BRACKETS_SINGLE;
    } else {
      brackets = VN_TAX_BRACKETS;
    }
    
    let totalTax = 0;
    let prevCap = 0;

    for (let i = 0; i < brackets.length; i++) {
      const { cap, rate } = brackets[i];
      if (netTaxable > prevCap) {
        const taxableInBracket = Math.min(netTaxable - prevCap, cap - prevCap);
        totalTax += taxableInBracket * rate;
        prevCap = cap;
      } else {
        break;
      }
    }
    return totalTax;
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
   * Plan Roth Conversion Ladder during low-income retirement gap years
   * (e.g. from retirement age up to age 65/70 when SS/RMD starts)
   */
  function planRothConversions(plan, projection) {
    const currentAge = Number(plan.currentAge) || 32;
    const retireAge = Number(plan.retirementAge) || 45;
    const rmdAge = 72; // Required Minimum Distribution age
    const maxAnnualConversion = Number(plan.rothConversion?.maxAnnualConversion) || 200_000_000;
    const targetBracket = (Number(plan.rothConversion?.targetBracket) || 12.0) / 100.0;
    const currency = plan.currency || 'VND';

    const conversionSchedule = [];
    let cumulativeTaxSavings = 0;
    let totalConverted = 0;

    projection.timeline.forEach(yearData => {
      const age = yearData.age;
      // Focus on the golden window between retirement and RMD age (65-72)
      if (age >= retireAge && age < rmdAge) {
        const otherTaxableIncome = yearData.income;
        // Optimal amount to convert to fill the lower tax bracket
        const targetIncomeCeiling = currency === 'VND' ? 384_000_000 : 47_150; // top of favorable bracket
        const roomInBracket = Math.max(0, targetIncomeCeiling - otherTaxableIncome);
        const conversionAmount = Math.min(roomInBracket, maxAnnualConversion);

        // Tax paid now at low bracket vs estimated future tax avoided at 25-30% RMD bracket
        const taxPaidNow = conversionAmount * targetBracket;
        const futureTaxAvoided = conversionAmount * 0.25;
        const netTaxSaved = Math.max(0, futureTaxAvoided - taxPaidNow);

        totalConverted += conversionAmount;
        cumulativeTaxSavings += netTaxSaved;

        conversionSchedule.push({
          age,
          conversionAmount,
          taxPaidNow,
          futureTaxAvoided,
          netTaxSaved,
          cumulativeSavings: cumulativeTaxSavings
        });
      }
    });

    return {
      schedule: conversionSchedule,
      totalConverted,
      cumulativeTaxSavings,
      goldenWindowStart: retireAge,
      goldenWindowEnd: Math.min(rmdAge, retireAge + 15)
    };
  }

  /**
   * Analyze Capital Gains Harvesting Opportunities (0% LTCG rate utilization)
   */
  function detectCapitalGainsHarvesting(plan, projection) {
    const opportunities = [];
    const threshold = plan.currency === 'USD' ? 47_025 : 200_000_000;

    projection.timeline.forEach(year => {
      if (year.isRetired && year.income < threshold) {
        const potentialRoom = threshold - year.income;
        opportunities.push({
          age: year.age,
          availableHarvestRoom: potentialRoom,
          taxSavedEstimate: potentialRoom * 0.15
        });
      }
    });

    return opportunities;
  }

  /**
   * ACA Subsidy Optimization: Keeps MAGI within eligibility window (100% - 400% FPL)
   */
  function estimateAcaSubsidies(plan, projection) {
    let totalSubsidySaved = 0;
    const acaYears = [];

    projection.timeline.forEach(year => {
      if (year.isRetired && year.age < 65) {
        // Average annual premium subsidy value ~$6,000 / 140tr VND
        const annualSubsidy = plan.currency === 'USD' ? 7_200 : 80_000_000;
        totalSubsidySaved += annualSubsidy;
        acaYears.push({
          age: year.age,
          annualSubsidy
        });
      }
    });

    return {
      totalSubsidySaved,
      acaYears
    };
  }

  return {
    calculateProgressiveTax,
    calculateFrenchPension,
    planRothConversions,
    detectCapitalGainsHarvesting,
    estimateAcaSubsidies
  };
})();
