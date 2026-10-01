/**
 * pyRetrait — Core Mathematical Financial Independence & Cash-Flow Engine
 */

window.RetirementEngine = (function() {
  'use strict';

  // Get only the symbol of the currency (€, ₫, $)
  function getCurrencySymbol(currency = 'EUR') {
    if (currency === 'EUR' || currency === '€') return '€';
    if (currency === 'VND' || currency === '₫') return '₫';
    return '$';
  }

  // Format currency based on selected currency code (only displaying currency symbol)
  function formatCurrency(amount, currency = 'EUR', compact = true) {
    if (isNaN(amount) || amount === null) return '0';
    const sym = getCurrencySymbol(currency);
    
    if (currency === 'VND' || currency === '₫') {
      if (compact) {
        if (Math.abs(amount) >= 1_000_000_000) {
          return sym + (amount / 1_000_000_000).toFixed(2) + ' Tỷ';
        } else if (Math.abs(amount) >= 1_000_000) {
          return sym + (amount / 1_000_000).toFixed(1) + ' Tr';
        } else if (Math.abs(amount) >= 1_000) {
          return sym + (amount / 1_000).toFixed(0) + ' k';
        }
        return sym + Math.round(amount).toLocaleString('vi-VN');
      }
      return sym + Math.round(amount).toLocaleString('vi-VN');
    } else { // EUR or USD
      if (compact) {
        if (Math.abs(amount) >= 1_000_000) {
          return sym + (amount / 1_000_000).toFixed(2) + 'M';
        } else if (Math.abs(amount) >= 1_000) {
          return sym + (amount / 1_000).toFixed(1) + 'k';
        }
        return sym + Math.round(amount).toLocaleString('fr-FR');
      }
      return sym + Math.round(amount).toLocaleString('fr-FR');
    }
  }

  // Calculate year-by-year cash flows and net worth trajectory
  function runProjection(plan, overrideScenario = null) {
    const currentAge = Number(plan.currentAge) || 32;
    const retireAge = Number(plan.retirementAge) || 45;
    const lifeExpectancy = Number(plan.lifeExpectancy) || 85;
    const inflation = (Number(plan.inflationRate) || 4.0) / 100.0;
    const returnPre = (Number(plan.investmentReturnPre) || 10.0) / 100.0;
    const returnPost = (Number(plan.investmentReturnPost) || 8.0) / 100.0;
    const targetLegacy = Number(plan.targetLegacy) || 1_000_000_000;
    const baseRetireExpenses = Number(plan.retirementExpenses) || 300_000_000;
    const annualSavings = Number(plan.annualSavings) || 360_000_000;
    const initialSavings = Number(plan.currentSavings) || 1_500_000_000;
    const withdrawalStrategy = plan.withdrawalStrategy || 'guyton_klinger';
    const initialSWR = (Number(plan.initialWithdrawalRate) || 4.0) / 100.0;

    const timeline = [];
    let portfolio = initialSavings;
    let peakNetWorth = initialSavings;
    let peakAge = currentAge;
    let initialRetirePortfolio = 0;
    let initialAnnualWithdrawal = 0;
    let previousYearWithdrawal = 0;
    let totalTaxesPaid = 0;
    let totalLifetimeIncome = 0;
    let totalLifetimeExpenses = 0;

    const years = lifeExpectancy - currentAge;

    for (let i = 0; i <= years; i++) {
      const age = currentAge + i;
      const cumInflation = Math.pow(1.0 + inflation, i);
      const isRetired = age >= retireAge;

      // 1. Calculate Active and Passive Incomes for this year
      let annualIncome = 0;
      if (Array.isArray(plan.incomes)) {
        plan.incomes.forEach(stream => {
          if (age >= stream.startAge && age <= stream.endAge) {
            const streamGrowth = (Number(stream.growth) || 4.0) / 100.0;
            const streamYearsActive = age - stream.startAge;
            const streamVal = (Number(stream.amount) || 0) * Math.pow(1.0 + streamGrowth, streamYearsActive);
            annualIncome += streamVal;
          }
        });
      }

      // Add Social Security / BHXH if reached age
      if (isRetired && age >= (Number(plan.socialSecurityAge) || 62)) {
        const ssAnnual = (Number(plan.socialSecurityAnnual) || 0) * cumInflation;
        annualIncome += ssAnnual;
      }

      // 2. Calculate Base Expense with Spending Smile Adjustment
      let spendingFactor = 1.0;
      if (isRetired && plan.spendingPhases && plan.spendingPhases.enabled) {
        const gogoAge = Number(plan.spendingPhases.gogoAge) || 60;
        const slowgoAge = Number(plan.spendingPhases.slowgoAge) || 75;
        if (age <= gogoAge) {
          spendingFactor = Number(plan.spendingPhases.gogoFactor) || 1.15;
        } else if (age <= slowgoAge) {
          spendingFactor = Number(plan.spendingPhases.slowgoFactor) || 0.90;
        } else {
          spendingFactor = Number(plan.spendingPhases.nogoFactor) || 0.80;
        }
      }

      let currentExpenses = isRetired 
        ? baseRetireExpenses * cumInflation * spendingFactor 
        : (Number(plan.annualExpenses) || 240_000_000) * cumInflation;

      // Healthcare cost adjustments
      if (plan.healthcare && plan.healthcare.enabled) {
        if (isRetired && age < 65) {
          currentExpenses += (Number(plan.healthcare.annualPreMedicare) || 30_000_000) * cumInflation;
        } else if (isRetired && age >= 65) {
          currentExpenses += (Number(plan.healthcare.annualPostMedicare) || 15_000_000) * cumInflation;
        }
      }

      // Apply Scenario Overrides (Market crash, High inflation, Medical Shock, Downsizing)
      let scenarioReturnModifier = 0.0;
      if (overrideScenario) {
        if (overrideScenario === 'market_crash' && (age === retireAge || age === retireAge + 1)) {
          scenarioReturnModifier = -0.35; // -35% crash in early retirement
        } else if (overrideScenario === 'high_inflation' && (age >= retireAge && age < retireAge + 5)) {
          currentExpenses *= 1.30; // 30% jump in expenses
        } else if (overrideScenario === 'medical_shock' && age === 65) {
          currentExpenses += 500_000_000; // 500tr shock
        } else if (overrideScenario === 'downsizing' && age === 60) {
          portfolio += 2_000_000_000; // 2 tỷ lump sum cash infusion
        }
      }

      // 3. Tax Estimation using precise Progressive Tax Engine
      let estimatedTax = 0;
      if (window.TaxOptimizer && window.TaxOptimizer.calculateProgressiveTax) {
        estimatedTax = window.TaxOptimizer.calculateProgressiveTax(annualIncome, plan.taxRegime || 'france_vietnam');
      } else {
        const effectiveTaxRate = (Number(plan.taxRate) || 12.0) / 100.0;
        estimatedTax = annualIncome * effectiveTaxRate * 0.7;
      }
      totalTaxesPaid += estimatedTax;

      // 4. Withdrawal / Savings Cash Flow
      let netSavingsOrWithdrawal = 0;
      let withdrawalAmount = 0;
      let returnRate = isRetired ? returnPost : returnPre;
      returnRate += scenarioReturnModifier;

      if (!isRetired) {
        // Accumulation phase: Net Savings and Expenses dynamically proportional to Income
        const incomeAfterTax = Math.max(0, annualIncome - estimatedTax);
        if (annualIncome > 0) {
          if (plan.savingsRate !== undefined && plan.savingsRate !== null && Number(plan.savingsRate) > 0) {
            const rate = Number(plan.savingsRate) / 100.0;
            netSavingsOrWithdrawal = incomeAfterTax * rate;
            currentExpenses = incomeAfterTax * (1.0 - rate);
          } else {
            const cashflowSavings = incomeAfterTax - currentExpenses;
            netSavingsOrWithdrawal = Math.max(cashflowSavings, annualSavings * cumInflation);
          }
        } else {
          netSavingsOrWithdrawal = annualSavings * cumInflation;
        }
        portfolio = (portfolio + netSavingsOrWithdrawal) * (1.0 + returnRate);
      } else {
        // Retirement Withdrawal Phase
        if (age === retireAge) {
          initialRetirePortfolio = portfolio;
          initialAnnualWithdrawal = initialRetirePortfolio * initialSWR;
          previousYearWithdrawal = initialAnnualWithdrawal;
        }

        // Apply chosen withdrawal strategy
        if (withdrawalStrategy === 'bengen_4pct') {
          // Bengen rule: initial dollar amount adjusted for inflation
          const yearsIntoRetirement = age - retireAge;
          withdrawalAmount = initialAnnualWithdrawal * Math.pow(1.0 + inflation, yearsIntoRetirement);
        } else if (withdrawalStrategy === 'guyton_klinger') {
          // Guyton-Klinger Guardrails
          const nominalExpected = previousYearWithdrawal * (1.0 + inflation);
          const currentWithdrawalRate = portfolio > 0 ? (nominalExpected / portfolio) : 1;
          
          if (currentWithdrawalRate > initialSWR * 1.20) {
            // Capital preservation: cut spending by 10%
            withdrawalAmount = nominalExpected * 0.90;
          } else if (currentWithdrawalRate < initialSWR * 0.80) {
            // Prosperity rule: increase spending by 10%
            withdrawalAmount = nominalExpected * 1.10;
          } else {
            withdrawalAmount = nominalExpected;
          }
          previousYearWithdrawal = withdrawalAmount;
        } else if (withdrawalStrategy === 'vpw') {
          // Variable Percentage Withdrawal: based on remaining life expectancy
          const remainingYears = Math.max(1, lifeExpectancy - age + 1);
          const vpwRate = (1.0 / remainingYears) + 0.02; // dynamic curve
          withdrawalAmount = portfolio * Math.min(0.12, Math.max(0.03, vpwRate));
        } else {
          // Fixed percentage of portfolio
          withdrawalAmount = portfolio * initialSWR;
        }

        // Net deficit needed from portfolio after accounting for passive income
        const incomeAfterTax = Math.max(0, annualIncome - estimatedTax);
        if (incomeAfterTax >= currentExpenses) {
          // Passive income covers all living expenses! Surplus is reinvested into portfolio
          const surplus = incomeAfterTax - currentExpenses;
          portfolio = (portfolio + surplus) * (1.0 + returnRate);
          netSavingsOrWithdrawal = surplus;
        } else {
          // Passive income only partially covers expenses. Net deficit must come from portfolio
          const deficit = currentExpenses - incomeAfterTax;
          const actualWithdrawal = Math.min(portfolio, Math.max(deficit, withdrawalAmount));
          portfolio = Math.max(0, (portfolio - actualWithdrawal) * (1.0 + returnRate));
          netSavingsOrWithdrawal = -actualWithdrawal;
        }
      }

      if (portfolio > peakNetWorth) {
        peakNetWorth = portfolio;
        peakAge = age;
      }

      totalLifetimeIncome += annualIncome;
      totalLifetimeExpenses += currentExpenses;

      timeline.push({
        age,
        isRetired,
        income: annualIncome,
        expenses: currentExpenses,
        netCashFlow: netSavingsOrWithdrawal,
        tax: estimatedTax,
        portfolioEnd: portfolio,
        realPortfolioEnd: portfolio / cumInflation
      });
    }

    // Key metrics calculations
    const finalPortfolio = timeline[timeline.length - 1].portfolioEnd;
    const fireTargetNestEgg = baseRetireExpenses * 25; // 25x rule
    const safeAnnualSpend = initialRetirePortfolio > 0 ? initialRetirePortfolio * initialSWR : fireTargetNestEgg * 0.04;
    const yearsToFIRE = Math.max(0, retireAge - currentAge);
    
    // Readiness score (0 - 100)
    let score = 50;
    if (finalPortfolio >= targetLegacy) score += 30;
    else if (finalPortfolio > 0) score += 15;
    
    if (peakNetWorth >= fireTargetNestEgg) score += 20;
    if (yearsToFIRE <= 15) score += 10;
    score = Math.min(99, Math.max(20, score));

    return {
      timeline,
      currentAge,
      retireAge,
      lifeExpectancy,
      peakNetWorth,
      peakAge,
      finalPortfolio,
      fireTargetNestEgg,
      safeAnnualSpend,
      yearsToFIRE,
      totalTaxesPaid,
      totalLifetimeIncome,
      totalLifetimeExpenses,
      readinessScore: score,
      survived: finalPortfolio > 0,
      meetsLegacy: finalPortfolio >= targetLegacy
    };
  }

  return {
    formatCurrency,
    getCurrencySymbol,
    runProjection
  };
})();
