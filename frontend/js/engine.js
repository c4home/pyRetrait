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
    const cash = (alloc.cash !== undefined && !isNaN(Number(alloc.cash))) ? Number(alloc.cash) : 0;
    const total = (stocks + bonds + realEstate + cash) || 100;

    const rStocks = (returns && returns.stocks !== undefined && !isNaN(Number(returns.stocks))) ? Number(returns.stocks) : 9.5;
    const rBonds = (returns && returns.bonds !== undefined && !isNaN(Number(returns.bonds))) ? Number(returns.bonds) : 3.5;
    const rRE = (returns && returns.realEstate !== undefined && !isNaN(Number(returns.realEstate))) ? Number(returns.realEstate) : 6.5;
    const rCash = (returns && returns.cash !== undefined && !isNaN(Number(returns.cash))) ? Number(returns.cash) : 1.5;

    const weighted = ((stocks * rStocks) + (bonds * rBonds) + (realEstate * rRE) + (cash * rCash)) / total;
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

  /**
   * Tính toán giá trị BĐS theo thời gian dựa trên loại hình Nhà mặt đất vs Căn hộ chung cư.
   * - Nhà mặt đất (House / Maison): Giá trị đất tăng trưởng bền vững dài hạn: propVal0 * (1 + rate)^t
   * - Căn hộ chung cư (Apartment): Mô hình phân tách Đất (20% tăng trưởng) + Xác nhà (80% khấu hao dần về 10% sau 30 năm)
   */
  function computePropertyValue(propVal0, age, startAge, isHouse, customAppreciation) {
    const elapsed = Math.max(0, age - startAge);
    if (elapsed === 0) return Math.round(propVal0);

    if (isHouse) {
      // Formula 1: Nhà mặt đất
      const rate = customAppreciation !== undefined && customAppreciation !== null ? customAppreciation : 0.025;
      return Math.round(propVal0 * Math.pow(1.0 + rate, elapsed));
    } else {
      // Formula 2: Căn hộ chung cư (khấu hao xác nhà sau 30 năm sử dụng)
      const landRatio = 0.20;
      const buildingRatio = 0.80;
      const landRate = 0.020; // 2%/năm tăng trưởng đất
      const landVal = propVal0 * landRatio * Math.pow(1.0 + landRate, elapsed);

      // Tuổi thọ hao mòn công trình: 30 năm (chạm sàn 10% ở năm thứ 30)
      const maxDecayYears = 30;
      const decayRatio = Math.max(0.10, 1.0 - (elapsed / maxDecayYears) * 0.90);
      const adjFactor = (customAppreciation !== undefined && customAppreciation !== null && customAppreciation !== 0)
        ? Math.pow(1.0 + customAppreciation, elapsed)
        : 1.0;
      const buildingVal = propVal0 * buildingRatio * decayRatio * adjFactor;

      return Math.round(landVal + buildingVal);
    }
  }

  function calculateSingleMortgageSchedule(mortgage, currentAge, lifeExpectancy) {
    const loanAmount = Number(mortgage.loanAmount) || 0;
    const interestRate = (mortgage.interestRate !== undefined && !isNaN(Number(mortgage.interestRate)) ? Number(mortgage.interestRate) : 2.2) / 100.0;
    const insuranceRate = (Number(mortgage.insuranceRate) || 0) / 100.0;
    const termYears = Number(mortgage.loanTermYears) || 20;
    const startAge = (mortgage.startAge !== undefined && !isNaN(Number(mortgage.startAge))) ? Number(mortgage.startAge) : currentAge;
    const endAge = startAge + termYears;
    const propVal0 = Number(mortgage.propertyValue) || (loanAmount * 1.25);
    
    // Nhận diện loại hình BĐS: Nhà mặt đất (house) hay Căn hộ chung cư (apartment)
    const isHouse = (mortgage.propertyCategory === 'house' || mortgage.propertyType === 'house' || (mortgage.typology && (/maison|villa|nhà/i).test(mortgage.typology)) || (/maison|villa|nhà mặt đất/i).test(mortgage.name || ''));
    const defaultAppr = isHouse ? 2.5 : 0.0;
    const appreciation = (mortgage.propertyAppreciation !== undefined && mortgage.propertyAppreciation !== null && !isNaN(Number(mortgage.propertyAppreciation)))
      ? Number(mortgage.propertyAppreciation) / 100.0
      : (defaultAppr / 100.0);

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
    // Prioritize user's manual monthly credit repayment input (monthlyLoanPaymentEur, or pure loan excluding operating charges)
    const manualMonthlyPmt = Number(mortgage.monthlyLoanPaymentEur || (mortgage.monthlyChargesEur ? Math.max(0, mortgage.monthlyPaymentEur - mortgage.monthlyChargesEur) : 0) || mortgage.monthlyPaymentEur || mortgage.monthlyPayment || 0);
    const monthlyPayment = manualMonthlyPmt > 0 ? manualMonthlyPmt : (principalInterestPayment + monthlyInsurance);
    const effectivePiPayment = manualMonthlyPmt > 0 ? Math.max(0, manualMonthlyPmt - monthlyInsurance) : principalInterestPayment;
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
          const principalMonth = Math.min(balance, Math.max(0, effectivePiPayment - interestMonth));
          balance = Math.max(0, balance - principalMonth);
        }
      } else {
        balance = 0;
      }
      curPropVal = computePropertyValue(propVal0, age + 1, startAge, isHouse, appreciation);
    }

    for (let age = currentAge; age <= lifeExpectancy; age++) {
      curPropVal = computePropertyValue(propVal0, age, startAge, isHouse, appreciation);
      if (age >= startAge && age < endAge) {
        let interestPaidYear = 0;
        let principalPaidYear = 0;
        for (let m = 0; m < 12; m++) {
          const interestMonth = balance * rMonthly;
          const principalMonth = Math.min(balance, Math.max(0, effectivePiPayment - interestMonth));
          interestPaidYear += interestMonth;
          principalPaidYear += principalMonth;
          balance = Math.max(0, balance - principalMonth);
        }
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
      weightedReturnPost = weightedReturnPre;
      returnPre = weightedReturnPre / 100.0;
      returnPost = weightedReturnPost / 100.0;
    } else {
      weightedReturnPre = Number(plan.investmentReturnPre) || 8.0;
      weightedReturnPost = weightedReturnPre;
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
    const initialSavings = (plan.currentSavings !== undefined && plan.currentSavings !== null && !isNaN(Number(plan.currentSavings)))
      ? Number(plan.currentSavings)
      : 0;
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
            const isSalary = !stream.isBhxhVn && (stream.isSalary || (stream.name && (/lương|salary|impôt|impot/i).test(stream.name)));
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
          milestones: (age === startAge) ? ['18 tuổi'] : []
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
          if (stream.enabled === false) return;
          const isSalary = !stream.isBhxhVn && (stream.isSalary || (stream.name && (/lương|salary|impôt|impot/i).test(stream.name)));
          const effectiveEndAge = isSalary ? (retireAge - 1) : (Number(stream.endAge) || retireAge);
          if (age >= stream.startAge && age <= effectiveEndAge) {
            const streamGrowth = (stream.growth !== undefined && stream.growth !== null && !isNaN(Number(stream.growth)))
              ? Number(stream.growth) / 100.0
              : 0.04;
            const streamYearsActive = age - stream.startAge;
            const streamVal = (Number(stream.amount) || 0) * Math.pow(1.0 + streamGrowth, streamYearsActive);
            annualIncome += streamVal;
          }
        });
      }

      // Add French Pension / BHXH if reached age (with realistic Décote calculation)
      let pensionReceivedThisYear = 0;
      const ssAge = Number(plan.socialSecurityAge) || 64;
      if (isRetired && age >= ssAge && plan.enableFrenchPension !== false) {
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

      // Senior Care / Dépendance / EHPAD reserve in late retirement (age 78+)
      let seniorCareCost = 0;
      const careAge = Number(plan.seniorCareAge) || 78;
      if (isRetired && age >= careAge && Number(plan.seniorCareMonthly) > 0 && plan.enableSeniorCare !== false) {
        seniorCareCost = (Number(plan.seniorCareMonthly) || 0) * 12;
      }

      // Child Lifecycle Expenses (Kế Hoạch Con Cái & Gia Đình)
      let childLifecycleCostThisYear = 0;
      if (plan.familyPlan && plan.familyPlan.enabled !== false && Number(plan.familyPlan.kidsCount) > 0) {
        const kCount = Number(plan.familyPlan.kidsCount) || 0;
        const curSimYear = (Number(plan.birthYear) || (new Date().getFullYear() - currentAge)) + age;
        const birthYears = [
          Number(plan.familyPlan.kid1Birth) || 2022,
          Number(plan.familyPlan.kid2Birth) || 2025,
          Number(plan.familyPlan.kid3Birth) || 2027,
          Number(plan.familyPlan.kid4Birth) || 2029
        ];
        const kidCostMonthly = Number(plan.familyPlan.kidCostMonthly) || 350;
        const kidUniMonthly = Number(plan.familyPlan.kidUniMonthly) || 900;

        let grossChildCost = 0;
        let depCount = 0;
        for (let k = 0; k < Math.min(kCount, 4); k++) {
          const kAge = curSimYear - birthYears[k];
          if (kAge >= 0 && kAge < 18) grossChildCost += kidCostMonthly * 12;
          else if (kAge >= 18 && kAge <= 23) grossChildCost += kidUniMonthly * 12;
          if (kAge >= 0 && kAge < 20) depCount++;
        }

        // CAF Family Allowance in France (bù đắp chi phí nuôi con)
        let cafMonthly = 0;
        if (depCount === 2) cafMonthly = 148;
        else if (depCount === 3) cafMonthly = 338;
        else if (depCount >= 4) cafMonthly = 529;

        const netAnnualChildCost = Math.max(0, grossChildCost - (cafMonthly * 12));
        childLifecycleCostThisYear = netAnnualChildCost * cumInflation;
      }

      // Calculate Active Expense Streams for this year (if configured)
      let activeExpenseStreamsSum = 0;
      let hasExpenseStreams = Array.isArray(plan.expenses) && plan.expenses.length > 0;
      let activeDebtsSum = 0;

      if (hasExpenseStreams) {
        plan.expenses.forEach(exp => {
          if (exp.enabled === false) return;
          const start = (exp.startAge !== undefined && exp.startAge !== null && !isNaN(Number(exp.startAge)))
            ? Number(exp.startAge) : currentAge;
          const end = (exp.endAge !== undefined && exp.endAge !== null && !isNaN(Number(exp.endAge)))
            ? Number(exp.endAge) : 85;
          if (age >= start && age <= end) {
            const expGrowth = (exp.growth !== undefined && exp.growth !== null && !isNaN(Number(exp.growth)))
              ? Number(exp.growth) / 100.0
              : 0.0;
            const yearsActive = age - start;
            const expVal = (Number(exp.amount) || 0) * Math.pow(1.0 + expGrowth, yearsActive);
            activeExpenseStreamsSum += expVal;
            const isDebt = exp.isDebt === true || (/crédit|credit|vay|nợ|loan|prêt|pret|ngân hàng/i).test(exp.name || '');
            if (isDebt) {
              activeDebtsSum += expVal;
            }
          }
        });
      }

      let currentExpenses = 0;
      if (isRetired) {
        // Base living expenses in retirement (Phương án 1: Số tiền nhập vào đã là chi tiêu thực tế tại địa điểm đã chọn)
        const baseRetire = ((baseRetireExpenses * spendingFactor) + seniorCareCost) * cumInflation;
        currentExpenses = baseRetire + activeDebtsSum + childLifecycleCostThisYear;
      } else {
        // Accumulation phase: realistic sum of active expense streams or fallback to base
        if (hasExpenseStreams && activeExpenseStreamsSum > 0) {
          currentExpenses = activeExpenseStreamsSum + childLifecycleCostThisYear;
        } else {
          currentExpenses = ((Number(plan.annualExpenses) || 240_000_000) * cumInflation) + childLifecycleCostThisYear;
        }
      }

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
          const fx = currentEurVndRate || 27500;
          currentExpenses += (500_000_000 / fx); // 500tr VND (~18k EUR)
        } else if (overrideScenario === 'downsizing' && age === 60) {
          const fx = currentEurVndRate || 27500;
          portfolio += (2_000_000_000 / fx); // 2 tỷ VND (~73k EUR)
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
        estimatedTax = window.TaxOptimizer.calculateProgressiveTax(annualIncome, plan.taxRegime || 'france_vietnam', {
          customTaxRate: plan.taxRate,
          currency: plan.currency || cur,
          exchangeRateEurVnd: currentEurVndRate
        });
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

      const displayPortfolio = portfolio;

      if (!isRetired) {
        // Accumulation phase: Net Savings and Expenses
        const incomeAfterTax = Math.max(0, annualIncome - estimatedTax);
        if (hasExpenseStreams && activeExpenseStreamsSum > 0) {
          // Realistic cashflow: Income After Tax minus Actual Expense Streams & Debts
          netSavingsOrWithdrawal = incomeAfterTax - currentExpenses;
        } else if (annualIncome > 0) {
          if (plan.savingsRate !== undefined && plan.savingsRate !== null && Number(plan.savingsRate) > 0) {
            const rate = Number(plan.savingsRate) / 100.0;
            currentExpenses = (incomeAfterTax * (1.0 - rate)) + childLifecycleCostThisYear;
            netSavingsOrWithdrawal = incomeAfterTax - currentExpenses;
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
          initialRetirePortfolio = displayPortfolio;
          initialAnnualWithdrawal = initialRetirePortfolio * initialSWR;
          previousYearWithdrawal = initialAnnualWithdrawal;
        }

        // Apply chosen withdrawal strategy (nếu bật)
        const isStrategyActive = plan.enableWithdrawalStrategy !== false;
        if (isStrategyActive) {
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
        } else {
          // Khi tắt chiến lược rút tiền: danh mục chỉ rút bù đắp phần thiếu hụt sinh hoạt thực tế
          withdrawalAmount = 0;
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
          const actualWithdrawal = isStrategyActive
            ? Math.min(portfolio, Math.max(deficit, withdrawalAmount))
            : Math.min(portfolio, deficit);
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

      const totalNetWorth = displayPortfolio + homeEquity;
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
        portfolioEnd: displayPortfolio,
        realPortfolioEnd: displayPortfolio / cumInflation,
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
    const effectiveRetireBase = baseRetireExpenses;
    const fireTargetNestEgg = Math.round(effectiveRetireBase * 25); // 25x rule based directly on actual retirement expenses
    const safeAnnualSpend = Math.max(0, (initialRetirePortfolio || 0) * initialSWR);
    const yearsToFIRE = Math.max(0, retireAge - currentAge);

    // Detect when FIRE Nest Egg is reached (tính từ tuổi hiện tại trở đi trong kịch bản hiện tại)
    let fireAge = null;
    for (let i = 0; i < timeline.length; i++) {
      if (timeline[i].age >= currentAge && timeline[i].portfolioEnd >= fireTargetNestEgg && fireAge === null) {
        fireAge = timeline[i].age;
        break;
      }
    }

    // Tính Tuổi Nghỉ Hưu Tối Ưu (Optimal FIRE Age):
    // Nâng cấp: Thay vì chỉ dừng lại ở điều kiện danh nghĩa 25x (vốn chỉ an toàn cho kỳ hưu trí ngắn 30 năm),
    // thuật toán tìm độ tuổi hưu an toàn thực sự đáp ứng 2 điều kiện:
    // 1. Xác suất thành công Monte Carlo P_success >= 80% (chuẩn CFP / FP Canada / Vanguard).
    // 2. Quy mô Nest Egg đạt chuẩn theo độ dài hưu trí (Horizon-adjusted SWR):
    //    - Horizon > 35 năm: tối thiểu 30x chi tiêu (SWR ~3.3%)
    //    - Horizon 30 - 35 năm: tối thiểu 28x chi tiêu (SWR ~3.57%)
    //    - Horizon <= 30 năm: tối thiểu 25x chi tiêu (SWR 4.0%)
    let optimalFireAge = null;
    const minSearchAge = Math.max(currentAge, fireAge || currentAge);
    const maxSearchAge = Math.min(lifeExpectancy - 2, 75);

    // Bước 1: Mô phỏng Monte Carlo Stochastic Search (nếu có MonteCarloSimulator)
    if (typeof window !== 'undefined' && window.MonteCarloSimulator && typeof window.MonteCarloSimulator.runSimulation === 'function') {
      try {
        let bestAge = null;
        let bestRate = 0;
        for (let testAge = minSearchAge; testAge <= maxSearchAge; testAge++) {
          const testPlan = Object.assign({}, plan, { retirementAge: testAge });
          if (Array.isArray(testPlan.incomes)) {
            testPlan.incomes = testPlan.incomes.map(inc => {
              const copy = Object.assign({}, inc);
              const name = (copy.name || '').toLowerCase();
              if (copy.isSalary || name.includes('lương') || name.includes('salary') || name.includes('impôt') || name.includes('impot')) {
                copy.endAge = testAge;
              }
              return copy;
            });
          }

          // Chạy 200 lượt mô phỏng nhanh
          const mcRes = window.MonteCarloSimulator.runSimulation(testPlan, 200, 15.0);
          const sRate = Number(mcRes.successRate) || 0;

          if (sRate > bestRate) {
            bestRate = sRate;
            bestAge = testAge;
          }

          // Tiêu chuẩn FIRE an toàn: Xác suất thành công Monte Carlo bắt buộc đạt tối thiểu 80.0%
          if (sRate >= 80.0) {
            optimalFireAge = testAge;
            break;
          }
        }
        if (!optimalFireAge && bestRate >= 70.0) {
          optimalFireAge = bestAge;
        }
      } catch (errOpt) {
        console.warn("Lỗi tính optimalFireAge qua Monte Carlo:", errOpt);
      }
    }

    // Bước 2: Fallback Tất Định theo Horizon-adjusted Nest Egg (30x cho >35 năm, 28x cho 30-35 năm, 25x cho <=30 năm)
    if (!optimalFireAge) {
      for (let testAge = minSearchAge; testAge <= maxSearchAge; testAge++) {
        const horizon = Math.max(1, lifeExpectancy - testAge);
        const reqMult = horizon > 35 ? 30 : (horizon > 30 ? 28 : 25);
        const reqNestEgg = effectiveRetireBase * reqMult;

        for (let k = 0; k < timeline.length; k++) {
          if (timeline[k].age === testAge && timeline[k].portfolioEnd >= reqNestEgg) {
            optimalFireAge = testAge;
            break;
          }
        }
        if (optimalFireAge) break;
      }
    }

    // Bước 3: Nếu timeline hiện tại chưa đạt (ngắt sớm), tiếp tục mô phỏng tích lũy từ currentAge
    if (!optimalFireAge) {
      let simPortfolio = initialSavings;
      let simCumInf = 1.0;
      for (let simAge = currentAge; simAge <= lifeExpectancy; simAge++) {
        if (simAge > currentAge) {
          const infRate = (plan.inflationRate ? Number(plan.inflationRate) : 2.5) / 100.0;
          simCumInf *= (1.0 + infRate);
        }
        let simIncome = 0;
        if (Array.isArray(plan.incomes)) {
          plan.incomes.forEach(stream => {
            if (stream.enabled === false) return;
            const sAge = Number(stream.startAge) || currentAge;
            if (simAge >= sAge) {
              const streamGrowth = (stream.growth !== undefined && stream.growth !== null && !isNaN(Number(stream.growth)))
                ? Number(stream.growth) / 100.0
                : 0.04;
              simIncome += (Number(stream.amount) || 0) * Math.pow(1.0 + streamGrowth, simAge - sAge);
            }
          });
        }
        const effectiveTaxRate = (Number(plan.taxRate) || 12.0) / 100.0;
        const simTax = simIncome * effectiveTaxRate * 0.7;
        const simIncomeNet = Math.max(0, simIncome - simTax);
        let simNetSavings = 0;
        let simExpSum = 0;
        if (Array.isArray(plan.expenses) && plan.expenses.length > 0) {
          plan.expenses.forEach(exp => {
            if (exp.enabled === false) return;
            const start = (exp.startAge !== undefined && exp.startAge !== null && !isNaN(Number(exp.startAge)))
              ? Number(exp.startAge) : currentAge;
            const end = (exp.endAge !== undefined && exp.endAge !== null && !isNaN(Number(exp.endAge)))
              ? Number(exp.endAge) : 85;
            if (simAge >= start && simAge <= end) {
              const expGrowth = (exp.growth !== undefined && exp.growth !== null && !isNaN(Number(exp.growth)))
                ? Number(exp.growth) / 100.0 : 0.0;
              simExpSum += (Number(exp.amount) || 0) * Math.pow(1.0 + expGrowth, simAge - start);
            }
          });
        }
        if (simExpSum > 0) {
          simNetSavings = simIncomeNet - simExpSum;
        } else if (simIncome > 0 && plan.savingsRate !== undefined && Number(plan.savingsRate) > 0) {
          simNetSavings = simIncomeNet * (Number(plan.savingsRate) / 100.0);
        } else {
          simNetSavings = (Number(plan.annualSavings) || 10_000) * simCumInf;
        }

        const horizon = Math.max(1, lifeExpectancy - simAge);
        const reqMult = horizon > 35 ? 30 : (horizon > 30 ? 28 : 25);
        const reqNestEgg = effectiveRetireBase * reqMult;

        if (simPortfolio >= reqNestEgg) {
          optimalFireAge = simAge;
          break;
        }
        simPortfolio = (simPortfolio + simNetSavings) * (1.0 + returnPre);
      }
    }

    if (!optimalFireAge) {
      optimalFireAge = fireAge;
    }

    // Build comprehensive Life Milestones markers
    const cur = plan.currency || 'EUR';
    const milestones = [];

    if (currentAge > 18) {
      milestones.push({
        id: 'ms_age18',
        age: 18,
        icon: '',
        name: '18 tuổi',
        desc: `Tuổi 18 (${birthYear + 18}): Khởi đầu tuổi trưởng thành`,
        color: '#94a3b8',
        isSystem: true
      });
    }

    milestones.push({
      id: 'ms_current',
      age: currentAge,
      icon: '',
      name: 'Hiện tại',
      desc: `Tuổi ${currentAge} (${birthYear + currentAge}): Điểm xuất phát hiện tại (${formatCurrency(initialSavings, cur)})`,
      color: '#38bdf8',
      isSystem: true
    });

    if (fireAge !== null) {
      milestones.push({
        id: 'ms_fire',
        age: fireAge,
        icon: '',
        name: 'Đạt FIRE',
        desc: `Tuổi ${fireAge}: Danh mục chạm mốc Tự do tài chính (${formatCurrency(fireTargetNestEgg, cur)})`,
        color: '#f97316',
        isSystem: true
      });
    }

    milestones.push({
      id: 'ms_retire',
      age: retireAge,
      icon: '',
      name: 'Nghỉ hưu',
      desc: `Tuổi ${retireAge}: Bắt đầu Nghỉ hưu & Rút vốn (${formatCurrency(initialRetirePortfolio || portfolio, cur)})`,
      color: '#fbbf24',
      isSystem: true
    });

    if (peakAge && peakAge !== retireAge && peakAge !== currentAge) {
      milestones.push({
        id: 'ms_peak',
        age: peakAge,
        icon: '',
        name: 'Đỉnh tài sản',
        desc: `Tuổi ${peakAge}: Danh mục đạt giá trị cao nhất cuộc đời (${formatCurrency(peakNetWorth, cur)})`,
        color: '#a855f7',
        isSystem: true
      });
    }

    if (Number(plan.socialSecurityAnnual) > 0 && plan.enableFrenchPension !== false) {
      const ssAge = Number(plan.socialSecurityAge) || 64;
      const startWork = Number(plan.startWorkAge) || 24;
      const quarters = Math.max(0, Math.min(retireAge, ssAge) - startWork) * 4;
      const descPension = (plan.enableFrenchDecote !== false && quarters < 172)
        ? `Tuổi ${ssAge}: Kích hoạt lương hưu (${quarters}/172 quý - Bị phạt Décote do nghỉ sớm)`
        : `Tuổi ${ssAge}: Kích hoạt trợ cấp hưu trí / BHXH (${formatCurrency(plan.socialSecurityAnnual, cur)}/năm)`;

      milestones.push({
        id: 'ms_pension',
        age: ssAge,
        icon: '',
        name: 'Lương hưu',
        desc: descPension,
        color: '#34d399',
        isSystem: true
      });
    }

    if (Number(plan.seniorCareMonthly) > 0 && plan.enableSeniorCare !== false) {
      const careAge = Number(plan.seniorCareAge) || 78;
      milestones.push({
        id: 'ms_senior_care',
        age: careAge,
        icon: '',
        name: 'Chăm sóc Tuổi Già (Dépendance)',
        desc: `Tuổi ${careAge}: Kích hoạt quỹ y tế & viện dưỡng lão (${formatCurrency(Number(plan.seniorCareMonthly) * 12, cur)}/năm)`,
        color: '#ec4899',
        isSystem: true
      });
    }

    if (plan.familyPlan && plan.familyPlan.enabled !== false && Number(plan.familyPlan.kidsCount) > 0) {
      const kCount = Number(plan.familyPlan.kidsCount) || 0;
      const parentBirthYear = Number(plan.birthYear) || (new Date().getFullYear() - currentAge);
      const birthYears = [
        Number(plan.familyPlan.kid1Birth) || 2022,
        Number(plan.familyPlan.kid2Birth) || 2025,
        Number(plan.familyPlan.kid3Birth) || 2027,
        Number(plan.familyPlan.kid4Birth) || 2029
      ];
      const kidUniMonthly = Number(plan.familyPlan.kidUniMonthly) || 900;

      for (let k = 1; k <= Math.min(kCount, 4); k++) {
        const kBirth = birthYears[k - 1];

        // 1. Cột mốc Chào đời / Năm sinh bé
        const pAgeBirth = kBirth - parentBirthYear;
        if (pAgeBirth >= 18 && pAgeBirth <= lifeExpectancy) {
          milestones.push({
            id: `ms_kid${k}_birth`,
            age: pAgeBirth,
            icon: '',
            name: `Sinh bé thứ ${k}`,
            desc: `Tuổi ${pAgeBirth} (Năm ${kBirth}): Chào đón bé thứ ${k} chào đời`,
            color: '#818cf8',
            isSystem: true
          });
        }

        // 2. Cột mốc Con vào Đại học (18 tuổi)
        const pAgeUni = (kBirth + 18) - parentBirthYear;
        if (pAgeUni >= 18 && pAgeUni <= lifeExpectancy) {
          milestones.push({
            id: `ms_kid${k}_uni`,
            age: pAgeUni,
            icon: '',
            name: `Con thứ ${k} vào Đại học`,
            desc: `Tuổi ${pAgeUni} (Năm ${kBirth + 18}): Con thứ ${k} tròn 18 tuổi vào Đại học (${formatCurrency(kidUniMonthly * 12, cur)}/năm)`,
            color: '#818cf8',
            isSystem: true
          });
        }
      }
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
            icon: '',
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
    if (mortgageSchedule && Array.isArray(mortgageSchedule.parts) && mortgageSchedule.parts.length > 1) {
      mortgageSchedule.parts.forEach((pt, pIdx) => {
        if (pt.endAge <= lifeExpectancy) {
          const loanName = (plan.mortgage && plan.mortgage.loans && plan.mortgage.loans[pIdx]?.name) || `Khoản vay ${pIdx + 1}`;
          milestones.push({
            id: `ms_mortgage_paid_${pIdx}`,
            age: pt.endAge,
            icon: '',
            name: `Tất toán ${loanName}`,
            desc: `Tuổi ${pt.endAge}: Hoàn tất trả nợ vay ${loanName}! Sở hữu 100% BĐS (${formatCurrency(pt.schedule[pt.endAge]?.propertyValue || 0, cur)})`,
            color: '#10b981',
            isSystem: true
          });
        }
      });
    } else if (mortgageSchedule && mortgageSchedule.endAge <= lifeExpectancy) {
      const loanName = (plan.mortgage && plan.mortgage.loans && plan.mortgage.loans[0]?.name) ? ` ${plan.mortgage.loans[0].name}` : ' nợ nhà';
      milestones.push({
        id: 'ms_mortgage_paid',
        age: mortgageSchedule.endAge,
        icon: '',
        name: `Tất toán${loanName}`,
        desc: `Tuổi ${mortgageSchedule.endAge}: Hoàn tất trả nợ vay mua nhà! Sở hữu 100% BĐS (${formatCurrency(mortgageSchedule.schedule[mortgageSchedule.endAge]?.propertyValue || 0, cur)})`,
        color: '#10b981',
        isSystem: true
      });
    }

    const finalEstate = timeline[timeline.length - 1]?.totalNetWorth ?? finalPortfolio;
    milestones.push({
      id: 'ms_end',
      age: lifeExpectancy,
      icon: '',
      name: 'Di sản',
      desc: `Tuổi ${lifeExpectancy}: Tài sản thừa kế để lại (${formatCurrency(finalEstate, cur)})`,
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
      fireAge: fireAge || optimalFireAge,
      optimalFireAge: optimalFireAge || fireAge,
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
