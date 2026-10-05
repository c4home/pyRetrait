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

  // Calculate weighted return across asset classes with optional rebalancing bonus
  function calculateWeightedReturn(alloc, returns, rebalanceBonus = 0.3) {
    if (!alloc) return 8.0;
    const stocks = (alloc.stocks !== undefined && !isNaN(Number(alloc.stocks))) ? Number(alloc.stocks) : 60;
    const bonds = (alloc.bonds !== undefined && !isNaN(Number(alloc.bonds))) ? Number(alloc.bonds) : 20;
    const realEstate = (alloc.realEstate !== undefined && !isNaN(Number(alloc.realEstate))) ? Number(alloc.realEstate) : 20;
    const total = (stocks + bonds + realEstate) || 100;

    const rStocks = (returns && returns.stocks !== undefined && !isNaN(Number(returns.stocks))) ? Number(returns.stocks) : 9.5;
    const rBonds = (returns && returns.bonds !== undefined && !isNaN(Number(returns.bonds))) ? Number(returns.bonds) : 3.5;
    const rRE = (returns && returns.realEstate !== undefined && !isNaN(Number(returns.realEstate))) ? Number(returns.realEstate) : 6.5;

    const weighted = ((stocks * rStocks) + (bonds * rBonds) + (realEstate * rRE)) / total;
    return Math.round((weighted + (rebalanceBonus || 0)) * 100) / 100;
  }

  // Calculate full standard amortization schedule and home equity trajectory.
  // Supports either a single manual loan, or `mortgage.loans` (an array of loans,
  // e.g. one per apartment synced from Gestion de Patrimoine) which are summed per age.
  function calculateMortgageSchedule(mortgage, currentAge, lifeExpectancy) {
    if (!mortgage || mortgage.enabled === false) return null;
    if (Array.isArray(mortgage.loans) && mortgage.loans.length > 0) {
      return calculateCombinedMortgageSchedule(mortgage.loans, currentAge, lifeExpectancy);
    }
    return calculateSingleMortgageSchedule(mortgage, currentAge, lifeExpectancy);
  }

  function calculateCombinedMortgageSchedule(loans, currentAge, lifeExpectancy) {
    const parts = loans
      .map(l => calculateSingleMortgageSchedule(l, currentAge, lifeExpectancy))
      .filter(Boolean);
    if (parts.length === 0) return null;

    const fields = ['monthlyPayment', 'annualPayment', 'interestPaid', 'principalPaid', 'remainingDebt', 'propertyValue', 'homeEquity'];
    const schedule = {};
    for (let age = currentAge; age <= lifeExpectancy; age++) {
      const row = { active: false };
      fields.forEach(f => { row[f] = 0; });
      parts.forEach(pt => {
        const r = pt.schedule[age];
        if (!r) return;
        if (r.active) row.active = true;
        fields.forEach(f => { row[f] += r[f] || 0; });
      });
      schedule[age] = row;
    }

    const curRow = schedule[currentAge] || {};
    return {
      // Payment currently due (only loans active at the current age)
      monthlyPayment: curRow.monthlyPayment || 0,
      annualPayment: curRow.annualPayment || 0,
      termYears: Math.max(...parts.map(pt => pt.termYears)),
      startAge: Math.min(...parts.map(pt => pt.startAge)),
      endAge: Math.max(...parts.map(pt => pt.endAge)),
      totalInterest: parts.reduce((s, pt) => s + pt.totalInterest, 0),
      loanCount: parts.length,
      parts,
      schedule
    };
  }

  function calculateSingleMortgageSchedule(mortgage, currentAge, lifeExpectancy) {
    const loanAmount = Number(mortgage.loanAmount) || 0;
    const interestRate = (mortgage.interestRate !== undefined && !isNaN(Number(mortgage.interestRate)) ? Number(mortgage.interestRate) : 2.2) / 100.0;
    const insuranceRate = (Number(mortgage.insuranceRate) || 0) / 100.0;
    const termYears = Number(mortgage.loanTermYears) || 20;
    const startAge = (mortgage.startAge !== undefined && !isNaN(Number(mortgage.startAge))) ? Number(mortgage.startAge) : currentAge;
    const endAge = startAge + termYears;
    const propVal0 = Number(mortgage.propertyValue) || (loanAmount * 1.25);
    const appreciation = (mortgage.propertyAppreciation !== undefined ? Number(mortgage.propertyAppreciation) : 2.5) / 100.0;

    if (loanAmount <= 0 || termYears <= 0) return null;

    const rMonthly = interestRate / 12;
    const nMonths = termYears * 12;
    let principalInterestPayment = 0;
    if (rMonthly > 0) {
      principalInterestPayment = loanAmount * (rMonthly / (1 - Math.pow(1 + rMonthly, -nMonths)));
    } else {
      principalInterestPayment = loanAmount / nMonths;
    }
    // French borrower insurance is charged on the initial capital, constant every month
    const monthlyInsurance = (loanAmount * insuranceRate) / 12;
    const monthlyPayment = principalInterestPayment + monthlyInsurance;
    const annualPayment = monthlyPayment * 12;

    const schedule = {};
    let balance = loanAmount;
    let curPropVal = propVal0;

    // Loan started in the past (e.g. apartment bought in 2023): amortize the
    // elapsed years first so the remaining debt at the current age is correct.
    for (let age = startAge; age < currentAge; age++) {
      if (age < endAge) {
        for (let m = 0; m < 12; m++) {
          const interestMonth = balance * rMonthly;
          const principalMonth = Math.min(balance, principalInterestPayment - interestMonth);
          balance = Math.max(0, balance - principalMonth);
        }
      } else {
        balance = 0;
      }
      curPropVal = curPropVal * (1.0 + appreciation);
    }

    for (let age = currentAge; age <= lifeExpectancy; age++) {
      if (age >= startAge && age < endAge) {
        let interestPaidYear = 0;
        let principalPaidYear = 0;
        for (let m = 0; m < 12; m++) {
          const interestMonth = balance * rMonthly;
          const principalMonth = Math.min(balance, principalInterestPayment - interestMonth);
          interestPaidYear += interestMonth;
          principalPaidYear += principalMonth;
          balance = Math.max(0, balance - principalMonth);
        }
        curPropVal = curPropVal * (1.0 + appreciation);
        const homeEquity = Math.max(0, curPropVal - balance);
        schedule[age] = {
          active: true,
          monthlyPayment: Math.round(monthlyPayment),
          annualPayment: Math.round(annualPayment),
          interestPaid: Math.round(interestPaidYear),
          principalPaid: Math.round(principalPaidYear),
          remainingDebt: Math.round(balance),
          propertyValue: Math.round(curPropVal),
          homeEquity: Math.round(homeEquity)
        };
      } else if (age >= endAge) {
        curPropVal = curPropVal * (1.0 + appreciation);
        schedule[age] = {
          active: false,
          monthlyPayment: 0,
          annualPayment: 0,
          interestPaid: 0,
          principalPaid: 0,
          remainingDebt: 0,
          propertyValue: Math.round(curPropVal),
          homeEquity: Math.round(curPropVal)
        };
      } else {
        schedule[age] = {
          active: false,
          monthlyPayment: 0,
          annualPayment: 0,
          interestPaid: 0,
          principalPaid: 0,
          remainingDebt: 0,
          propertyValue: propVal0,
          homeEquity: 0
        };
      }
    }

    return {
      monthlyPayment: Math.round(monthlyPayment),
      annualPayment: Math.round(annualPayment),
      termYears,
      startAge,
      endAge,
      totalInterest: Math.round((principalInterestPayment * nMonths) - loanAmount),
      name: mortgage.name || '',
      loanAmount,
      schedule
    };
  }

  // Calculate year-by-year cash flows and net worth trajectory
  function runProjection(plan, overrideScenario = null) {
    const currentAge = Number(plan.currentAge) || 29;
    const retireAge = Number(plan.retirementAge) || 42;
    const lifeExpectancy = Number(plan.lifeExpectancy) || 85;
    const currentCalendarYear = new Date().getFullYear();
    const birthYear = Number(plan.birthYear) || (currentCalendarYear - currentAge);

    // 1. Asset Allocation & Weighted Returns
    let returnPre = 0.08;
    let returnPost = 0.075;
    let weightedReturnPre = 8.0;
    let weightedReturnPost = 7.5;
    if (plan.assetAllocation) {
      weightedReturnPre = calculateWeightedReturn(plan.assetAllocation, plan.assetReturns, 0.3);
      weightedReturnPost = calculateWeightedReturn(plan.postAssetAllocation || plan.assetAllocation, plan.assetReturns, 0.2);
      returnPre = weightedReturnPre / 100.0;
      returnPost = weightedReturnPost / 100.0;
    } else {
      weightedReturnPre = Number(plan.investmentReturnPre) || 8.0;
      weightedReturnPost = Number(plan.investmentReturnPost) || 7.5;
      returnPre = weightedReturnPre / 100.0;
      returnPost = weightedReturnPost / 100.0;
    }

    // 2. Mortgages & Amortization Schedule
    const mortgageSchedule = calculateMortgageSchedule(plan.mortgage, currentAge, lifeExpectancy);

    // 3. French Accounts tracking
    let frenchAccs = plan.frenchAccounts ? { ...plan.frenchAccounts } : null;
    let totalWaterfallTaxSaved = 0;

    const targetLegacy = Number(plan.targetLegacy) || 100_000;
    const baseRetireExpenses = Number(plan.retirementExpenses) || 12_000;
    const annualSavings = Number(plan.annualSavings) || 10_000;
    const initialSavings = Number(plan.currentSavings) || 50_000;
    const withdrawalStrategy = plan.withdrawalStrategy || 'guyton_klinger';
    const initialSWR = (Number(plan.initialWithdrawalRate) || 4.0) / 100.0;

    // Base Forex parameters
    const baseForex = Number(plan.dualInflation?.eurVndInitialRate) || Number(plan.exchangeRateEurVnd) || 27500;
    const forexDrift = (Number(plan.dualInflation?.eurVndAnnualDrift) || 1.2) / 100.0;

    const startAge = 18;
    const timeline = [];

    if (currentAge > startAge) {
      for (let age = startAge; age < currentAge; age++) {
        const pastYear = birthYear + age;

        // Chỉ tính thu nhập trong quá khứ NẾU người dùng thực sự có cấu hình nguồn thu nhập tại độ tuổi đó
        let pastIncome = 0;
        if (Array.isArray(plan.incomes)) {
          plan.incomes.forEach(stream => {
            if (stream.enabled === false) return;
            const sAge = Number(stream.startAge);
            const isSalary = stream.isSalary || (stream.name && (/lương|salary|impôt|impot/i).test(stream.name));
            const effectiveEndAge = isSalary ? retireAge : (Number(stream.endAge) || retireAge);
            if (age >= sAge && age <= effectiveEndAge) {
              const streamGrowth = (Number(stream.growth) || 0) / 100.0;
              const streamYearsActive = age - sAge;
              const streamVal = (Number(stream.amount) || 0) * Math.pow(1.0 + streamGrowth, streamYearsActive);
              pastIncome += streamVal;
            }
          });
        }
        pastIncome = Math.round(pastIncome);

        // Chi tiêu sinh hoạt quá khứ: chỉ phát sinh tương ứng nếu có thu nhập thực tế, nếu không có thu nhập thì mặc định = 0
        const pastExpenses = pastIncome > 0 ? Math.min(pastIncome, Math.round(Number(plan.annualExpenses || 15000))) : 0;

        // Tài sản quá khứ: chỉ có nếu có tích lũy từ thu nhập thực tế, không tự động sinh số dương giả lập
        const pastPortfolio = pastIncome > 0 ? Math.max(0, pastIncome - pastExpenses) : 0;

        timeline.push({
          age,
          year: pastYear,
          isRetired: false,
          isPast: true,
          income: pastIncome,
          expenses: pastExpenses,
          mortgagePayment: 0,
          netCashFlow: pastIncome - pastExpenses,
          tax: 0,
          portfolioEnd: pastPortfolio,
          realPortfolioEnd: pastPortfolio,
          cumInflation: 1.0,
          currentInflation: 0.02,
          eurVndRate: baseForex,
          homeEquity: 0,
          remainingDebt: 0,
          propertyValue: 0,
          totalNetWorth: pastPortfolio,
          realTotalNetWorth: pastPortfolio,
          milestones: (age === startAge) ? ['🌱 18 tuổi'] : []
        });
      }
    }

    let portfolio = initialSavings;
    let peakNetWorth = initialSavings;
    let peakAge = currentAge;
    let initialRetirePortfolio = 0;
    let initialAnnualWithdrawal = 0;
    let previousYearWithdrawal = 0;
    let totalTaxesPaid = 0;
    let totalLifetimeIncome = 0;
    let totalLifetimeExpenses = 0;
    let cumInflation = 1.0;

    const years = lifeExpectancy - currentAge;

    for (let i = 0; i <= years; i++) {
      const age = currentAge + i;
      const isRetired = age >= retireAge;

      // 4. Dual-Stage Inflation Compounding
      const currentInflation = (plan.dualInflation && plan.dualInflation.enabled)
        ? (isRetired ? (Number(plan.dualInflation.inflationPost) || 4.0) / 100.0 : (Number(plan.dualInflation.inflationPre) || 2.2) / 100.0)
        : (Number(plan.inflationRate) || 4.0) / 100.0;
      
      if (i > 0) {
        cumInflation *= (1.0 + currentInflation);
      }

      // Dynamic EUR/VND Forex Rate
      const currentEurVndRate = Math.round(baseForex * Math.pow(1.0 + forexDrift, i));

      // 1. Calculate Active and Passive Incomes for this year
      let annualIncome = 0;
      if (Array.isArray(plan.incomes)) {
        plan.incomes.forEach(stream => {
          const isSalary = stream.isSalary || (stream.name && (/lương|salary|impôt|impot/i).test(stream.name));
          const effectiveEndAge = isSalary ? retireAge : (Number(stream.endAge) || retireAge);
          if (age >= stream.startAge && age <= effectiveEndAge) {
            const streamGrowth = (Number(stream.growth) || 4.0) / 100.0;
            const streamYearsActive = age - stream.startAge;
            const streamVal = (Number(stream.amount) || 0) * Math.pow(1.0 + streamGrowth, streamYearsActive);
            annualIncome += streamVal;
          }
        });
      }

      // Add French Pension / BHXH if reached age (with realistic Décote calculation)
      let pensionReceivedThisYear = 0;
      const ssAge = Number(plan.socialSecurityAge) || 64;
      if (isRetired && age >= ssAge) {
        const rawSS = Number(plan.socialSecurityAnnual) || 0;
        if (rawSS > 0) {
          if (plan.enableFrenchDecote !== false) {
            const startWorkAge = Number(plan.startWorkAge) || 24;
            const yearsWorked = Math.max(0, Math.min(retireAge, ssAge) - startWorkAge);
            const quarters = yearsWorked * 4;
            const targetQuarters = 172; // Standard 43 years in France (Taux Plein)
            const missingQuarters = Math.max(0, targetQuarters - quarters);
            const prorata = Math.min(1.0, quarters / targetQuarters);
            // Before age 67: décote penalty is 1.25% per missing quarter (max 20 quarters = 25% max penalty)
            const decotePenalty = (age < 67 && missingQuarters > 0) ? Math.min(20, missingQuarters) * 0.0125 : 0;
            pensionReceivedThisYear = rawSS * prorata * (1.0 - decotePenalty) * cumInflation;
          } else {
            pensionReceivedThisYear = rawSS * cumInflation;
          }
          annualIncome += pensionReceivedThisYear;
        }
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

      // Purchasing Power Parity (PPP) Location Adjustment (France vs Vietnam)
      const retireLoc = plan.retirementLocation || 'france'; // 'france' | 'hybrid' | 'vietnam'
      let locationFactor = 1.0;
      let expExtraCost = 0;
      if (isRetired) {
        if (retireLoc === 'vietnam') {
          locationFactor = 0.45; // ~55% reduction in living expenses in Vietnam for equivalent comfort
          expExtraCost += (Number(plan.vietnamCfeAnnual) || (cur === 'EUR' ? 1800 : 45_000_000));
        } else if (retireLoc === 'hybrid') {
          locationFactor = 0.70; // 6 months France / 6 months Vietnam
          expExtraCost += (Number(plan.hybridTravelAnnual) || (cur === 'EUR' ? 2200 : 55_000_000));
        }
      }

      // Senior Care / Dépendance / EHPAD reserve in late retirement (age 78+)
      let seniorCareCost = 0;
      const careAge = Number(plan.seniorCareAge) || 78;
      if (isRetired && age >= careAge && Number(plan.seniorCareMonthly) > 0) {
        seniorCareCost = (Number(plan.seniorCareMonthly) || 0) * 12;
      }

      let currentExpenses = isRetired 
        ? ((baseRetireExpenses * locationFactor * spendingFactor) + expExtraCost + seniorCareCost) * cumInflation 
        : (Number(plan.annualExpenses) || 240_000_000) * cumInflation;

      // Healthcare cost adjustments
      if (plan.healthcare && plan.healthcare.enabled) {
        if (isRetired && age < 65) {
          currentExpenses += (Number(plan.healthcare.annualPreMedicare) || (cur === 'EUR' ? 1200 : 30_000_000)) * cumInflation;
        } else if (isRetired && age >= 65) {
          currentExpenses += (Number(plan.healthcare.annualPostMedicare) || (cur === 'EUR' ? 600 : 15_000_000)) * cumInflation;
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

      // Apply Custom Milestones (e.g. Buying house, child education, inheritance)
      let milestoneCashflow = 0;
      let activeMilestonesThisYear = [];
      if (Array.isArray(plan.milestones)) {
        plan.milestones.forEach(ms => {
          if (ms.enabled !== false && Number(ms.age) === age) {
            activeMilestonesThisYear.push(ms);
            const amt = Number(ms.amount) || 0;
            if (ms.type === 'expense') {
              portfolio = Math.max(0, portfolio - amt);
              milestoneCashflow -= amt;
            } else if (ms.type === 'income') {
              portfolio += amt;
              milestoneCashflow += amt;
            }
          }
        });
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
          withdrawalAmount = initialAnnualWithdrawal * Math.pow(1.0 + currentInflation, yearsIntoRetirement);
        } else if (withdrawalStrategy === 'guyton_klinger') {
          // Guyton-Klinger Guardrails
          const nominalExpected = previousYearWithdrawal * (1.0 + currentInflation);
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

          // Tax-Efficient French Account Withdrawal Waterfall
          if (frenchAccs && window.TaxOptimizer && window.TaxOptimizer.simulateWithdrawalWaterfall) {
            const wf = window.TaxOptimizer.simulateWithdrawalWaterfall(frenchAccs, actualWithdrawal, true);
            frenchAccs = wf.remainingBalances;
            totalWaterfallTaxSaved += wf.taxSavedVsPFU;
          }
        }
      }

      // Mortgage Cashflow & Home Equity Trajectory
      const mortYear = mortgageSchedule ? mortgageSchedule.schedule[age] : null;
      let homeEquity = 0;
      let remainingDebt = 0;
      let propertyValue = 0;
      let mortgagePaymentThisYear = 0;
      if (mortYear) {
        homeEquity = mortYear.homeEquity;
        remainingDebt = mortYear.remainingDebt;
        propertyValue = mortYear.propertyValue;
        if (mortYear.active) {
          mortgagePaymentThisYear = mortYear.annualPayment;
        }
      }

      const totalNetWorth = portfolio + homeEquity;
      if (totalNetWorth > peakNetWorth) {
        peakNetWorth = totalNetWorth;
        peakAge = age;
      }

      totalLifetimeIncome += annualIncome;
      totalLifetimeExpenses += currentExpenses;

      const calendarYear = birthYear + age;

      timeline.push({
        age,
        year: calendarYear,
        isRetired,
        income: annualIncome,
        expenses: currentExpenses,
        mortgagePayment: mortgagePaymentThisYear,
        netCashFlow: netSavingsOrWithdrawal,
        tax: estimatedTax,
        portfolioEnd: portfolio,
        realPortfolioEnd: portfolio / cumInflation,
        cumInflation,
        currentInflation,
        eurVndRate: currentEurVndRate,
        homeEquity,
        remainingDebt,
        propertyValue,
        totalNetWorth,
        realTotalNetWorth: totalNetWorth / cumInflation,
        milestones: activeMilestonesThisYear
      });
    }

    // Key metrics calculations
    const finalPortfolio = timeline[timeline.length - 1].portfolioEnd;
    const locFactor = (plan.retirementLocation === 'vietnam') ? 0.45 : (plan.retirementLocation === 'hybrid' ? 0.70 : 1.0);
    const locExtra = (plan.retirementLocation === 'vietnam') ? (cur === 'EUR' ? 1800 : 45_000_000) : (plan.retirementLocation === 'hybrid' ? (cur === 'EUR' ? 2200 : 55_000_000) : 0);
    const effectiveRetireBase = (baseRetireExpenses * locFactor) + locExtra;
    const fireTargetNestEgg = Math.round(effectiveRetireBase * 25); // 25x rule tailored to retirement location
    const safeAnnualSpend = initialRetirePortfolio > 0 ? initialRetirePortfolio * initialSWR : fireTargetNestEgg * 0.04;
    const yearsToFIRE = Math.max(0, retireAge - currentAge);

    // Detect when FIRE Nest Egg is reached (tính từ tuổi hiện tại trở đi)
    let fireAge = null;
    for (let i = 0; i < timeline.length; i++) {
      if (timeline[i].age >= currentAge && timeline[i].portfolioEnd >= fireTargetNestEgg && fireAge === null) {
        fireAge = timeline[i].age;
        break;
      }
    }

    // Build comprehensive Life Milestones markers
    const cur = plan.currency || 'EUR';
    const milestones = [];

    if (currentAge > 18) {
      milestones.push({
        id: 'ms_age18',
        age: 18,
        icon: '🌱',
        name: '18 tuổi',
        desc: `Tuổi 18 (${birthYear + 18}): Khởi đầu tuổi trưởng thành`,
        color: '#94a3b8',
        isSystem: true
      });
    }

    milestones.push({
      id: 'ms_current',
      age: currentAge,
      icon: '📍',
      name: 'Hiện tại',
      desc: `Tuổi ${currentAge} (${birthYear + currentAge}): Điểm xuất phát hiện tại (${formatCurrency(initialSavings, cur)})`,
      color: '#38bdf8',
      isSystem: true
    });

    if (fireAge !== null) {
      milestones.push({
        id: 'ms_fire',
        age: fireAge,
        icon: '🔥',
        name: 'Đạt FIRE',
        desc: `Tuổi ${fireAge}: Danh mục chạm mốc Tự do tài chính (${formatCurrency(fireTargetNestEgg, cur)})`,
        color: '#f97316',
        isSystem: true
      });
    }

    milestones.push({
      id: 'ms_retire',
      age: retireAge,
      icon: '🏖️',
      name: 'Nghỉ hưu',
      desc: `Tuổi ${retireAge}: Bắt đầu Nghỉ hưu & Rút vốn (${formatCurrency(initialRetirePortfolio || portfolio, cur)})`,
      color: '#fbbf24',
      isSystem: true
    });

    if (peakAge && peakAge !== retireAge && peakAge !== currentAge) {
      milestones.push({
        id: 'ms_peak',
        age: peakAge,
        icon: '👑',
        name: 'Đỉnh tài sản',
        desc: `Tuổi ${peakAge}: Danh mục đạt giá trị cao nhất cuộc đời (${formatCurrency(peakNetWorth, cur)})`,
        color: '#a855f7',
        isSystem: true
      });
    }

    if (Number(plan.socialSecurityAnnual) > 0) {
      const ssAge = Number(plan.socialSecurityAge) || 64;
      const startWork = Number(plan.startWorkAge) || 24;
      const quarters = Math.max(0, Math.min(retireAge, ssAge) - startWork) * 4;
      const descPension = (plan.enableFrenchDecote !== false && quarters < 172)
        ? `Tuổi ${ssAge}: Kích hoạt lương hưu (${quarters}/172 quý - Bị phạt Décote do nghỉ sớm)`
        : `Tuổi ${ssAge}: Kích hoạt trợ cấp hưu trí / BHXH (${formatCurrency(plan.socialSecurityAnnual, cur)}/năm)`;

      milestones.push({
        id: 'ms_pension',
        age: ssAge,
        icon: '🏛️',
        name: 'Lương hưu',
        desc: descPension,
        color: '#34d399',
        isSystem: true
      });
    }

    if (Number(plan.seniorCareMonthly) > 0) {
      const careAge = Number(plan.seniorCareAge) || 78;
      milestones.push({
        id: 'ms_senior_care',
        age: careAge,
        icon: '🩺',
        name: 'Chăm sóc Tuổi Già (Dépendance)',
        desc: `Tuổi ${careAge}: Kích hoạt quỹ y tế & viện dưỡng lão (${formatCurrency(Number(plan.seniorCareMonthly) * 12, cur)}/năm)`,
        color: '#ec4899',
        isSystem: true
      });
    }

    // Include custom milestones defined in the plan
    if (Array.isArray(plan.milestones)) {
      plan.milestones.forEach(ms => {
        if (ms.enabled !== false) {
          const amt = Number(ms.amount) || 0;
          const sign = ms.type === 'income' ? '+' : '-';
          milestones.push({
            id: ms.id || ('ms_' + Math.random().toString(36).substr(2, 6)),
            age: Number(ms.age),
            icon: ms.icon || '⭐',
            name: ms.name,
            desc: `Tuổi ${ms.age} • ${ms.name}: ${sign}${formatCurrency(amt, cur)}${ms.note ? ' (' + ms.note + ')' : ''}`,
            amount: amt,
            type: ms.type || 'expense',
            color: ms.color || (ms.type === 'income' ? '#10b981' : '#ec4899'),
            isCustom: true
          });
        }
      });
    }

    // If mortgage schedule active, add mortgage payoff celebration milestone
    if (mortgageSchedule && mortgageSchedule.endAge <= lifeExpectancy) {
      milestones.push({
        id: 'ms_mortgage_paid',
        age: mortgageSchedule.endAge,
        icon: '🏡',
        name: 'Tất toán nợ nhà',
        desc: `Tuổi ${mortgageSchedule.endAge}: Hoàn tất trả nợ vay mua nhà! Sở hữu 100% BĐS (${formatCurrency(mortgageSchedule.schedule[mortgageSchedule.endAge]?.propertyValue || 0, cur)})`,
        color: '#10b981',
        isSystem: true
      });
    }

    milestones.push({
      id: 'ms_end',
      age: lifeExpectancy,
      icon: '🏁',
      name: 'Di sản',
      desc: `Tuổi ${lifeExpectancy}: Tài sản thừa kế để lại (${formatCurrency(finalPortfolio, cur)})`,
      color: '#94a3b8',
      isSystem: true
    });

    milestones.sort((a, b) => a.age - b.age);

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
      fireAge,
      milestones,
      finalPortfolio,
      finalTotalNetWorth: timeline[timeline.length - 1].totalNetWorth,
      fireTargetNestEgg,
      safeAnnualSpend,
      yearsToFIRE,
      totalTaxesPaid,
      totalLifetimeIncome,
      totalLifetimeExpenses,
      readinessScore: score,
      survived: finalPortfolio > 0,
      meetsLegacy: finalPortfolio >= targetLegacy,
      mortgageSchedule,
      weightedReturnPre,
      weightedReturnPost,
      birthYear,
      currentCalendarYear,
      totalWaterfallTaxSaved
    };
  }

  return {
    formatCurrency,
    getCurrencySymbol,
    calculateWeightedReturn,
    calculateMortgageSchedule,
    runProjection
  };
})();
