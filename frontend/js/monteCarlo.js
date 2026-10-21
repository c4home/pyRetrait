/**
 * pyRetrait — Monte Carlo Simulation & Sequence of Returns Risk (SRR) Engine
 */

window.MonteCarloSimulator = (function() {
  'use strict';

  // Mulberry32 32-bit deterministic PRNG (reproducible across all browsers and devices)
  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Box-Muller transform for standard normal random number generator using seeded PRNG
  function createRandomNormal(seed = 42) {
    const rng = mulberry32(seed);
    return function(mean, stdDev) {
      let u1 = 0, u2 = 0;
      while (u1 === 0) u1 = rng();
      while (u2 === 0) u2 = rng();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      return mean + z0 * stdDev;
    };
  }

  // Fast client-side 1,000-run simulation
  function runSimulation(plan, iterations = 1000, volatility = 15.0) {
    // Seeded PRNG ensures identical data produces 100% identical results on all browsers (Chrome, Brave, Safari, etc.)
    const randomNormal = createRandomNormal(42);
    const currentAge = Number(plan.currentAge) || 29;
    const retireAge = Number(plan.retirementAge) || 43;
    const lifeExpectancy = Number(plan.lifeExpectancy) || 85;

    // Run deterministic base projection from RetirementEngine to capture 100% accurate net cashflows
    const engine = (typeof window !== 'undefined' && window.RetirementEngine)
      ? window.RetirementEngine
      : (typeof RetirementEngine !== 'undefined' ? RetirementEngine : null);

    const baseRun = engine ? engine.runProjection(plan, null, true, true) : null;

    if (baseRun && (baseRun.timeline || baseRun.yearlyData)) {
      const rawTimeline = baseRun.yearlyData || baseRun.timeline;
      const baseRows = rawTimeline.filter(r => !r.isPast && r.age >= currentAge);
      const totalYears = Math.max(0, baseRows.length - 1);
      const ageAxis = baseRows.map(r => r.age);
      const startPortfolio = Number(baseRows[0] && baseRows[0].portfolioEnd !== undefined ? baseRows[0].portfolioEnd : (plan.currentSavings || 0));

      const rawMeanPre = (baseRun.weightedReturnPre !== undefined) ? baseRun.weightedReturnPre : (plan.enableAssetAllocation === false ? 0 : (Number(plan.investmentReturnPre) || 8.0));
      const meanReturnPre = rawMeanPre > 1 ? (rawMeanPre / 100.0) : rawMeanPre;
      const rawMeanPost = (baseRun.weightedReturnPost !== undefined) ? baseRun.weightedReturnPost : (plan.enableAssetAllocation === false ? 0 : (Number(plan.investmentReturnPost) || rawMeanPre));
      const meanReturnPost = rawMeanPost > 1 ? (rawMeanPost / 100.0) : rawMeanPost;
      const sigma = (Number(volatility) || 15.0) / 100.0;

      const allTrajectories = [];
      let successCount = 0;
      const failureAges = [];

      for (let sim = 0; sim < iterations; sim++) {
        let portfolio = startPortfolio;
        const path = [portfolio];
        let survived = true;

        for (let y = 0; y < totalYears; y++) {
          const row = baseRows[y];
          const age = row.age;
          const isRet = row.isRetired;
          const meanReturn = isRet ? meanReturnPost : meanReturnPre;
          const r = randomNormal(meanReturn, sigma);

          let netFlow = Number(row.netCashFlow) || 0;

          if (isRet) {
            if (netFlow < 0) {
              let withdrawal = -netFlow;
              // Quy tắc phòng vệ Guyton-Klinger: Cắt giảm 10% rút vốn khi thị trường giảm mạnh (r < -0.05)
              if (plan.enableWithdrawalStrategy !== false && plan.withdrawalStrategy === 'guyton_klinger' && r < -0.05) {
                withdrawal *= 0.90;
              }
              portfolio = Math.max(0, (portfolio - withdrawal) * (1.0 + r));
            } else {
              portfolio = (portfolio + netFlow) * (1.0 + r);
            }
          } else {
            portfolio = (portfolio + netFlow) * (1.0 + r);
          }

          if (portfolio <= 0 && survived) {
            survived = false;
            failureAges.push(age + 1);
          }
          path.push(Math.max(0, portfolio));
        }

        if (survived && path[path.length - 1] > 0) {
          successCount++;
        }
        allTrajectories.push(path);
      }

      const p10 = [];
      const p25 = [];
      const p50 = [];
      const p75 = [];
      const p90 = [];

      for (let y = 0; y <= totalYears; y++) {
        const yearValues = allTrajectories.map(p => p[y]).sort((a, b) => a - b);
        const getP = (pct) => yearValues[Math.floor(yearValues.length * pct)];

        p10.push(getP(0.10));
        p25.push(getP(0.25));
        p50.push(getP(0.50));
        p75.push(getP(0.75));
        p90.push(getP(0.90));
      }

      const successRate = ((successCount / iterations) * 100).toFixed(1);
      const avgFailureAge = failureAges.length > 0
        ? (failureAges.reduce((a, b) => a + b, 0) / failureAges.length).toFixed(1)
        : null;

      return {
        successRate,
        ageAxis,
        p10,
        p25,
        p50,
        p75,
        p90,
        avgFailureAge,
        totalSimulations: iterations
      };
    }

    // Fallback: Nếu không gọi được engine
    const frenchAccs = plan.frenchAccounts || {};
    const frenchTotal = (Number(frenchAccs.peaBalance) || 0) + 
                        (Number(frenchAccs.assuranceVieBalance) || 0) + 
                        (Number(frenchAccs.livretABalance) || 0) + 
                        (Number(frenchAccs.perBalance) || 0);
    const currentSavings = (Number(plan.currentSavings) || 0) + frenchTotal;
    const annualSavings = Number(plan.annualSavings) || 0;
    const baseRetireExpenses = Number(plan.retirementExpenses) || 12000;
    const effectiveRetireExpenses = baseRetireExpenses;

    const rawMeanPre = (plan.enableAssetAllocation === false) ? 0 : (plan.investmentReturnPre !== undefined && plan.investmentReturnPre !== null ? Number(plan.investmentReturnPre) : 8.0);
    const meanReturnPre = rawMeanPre / 100.0;
    const meanReturnPost = (plan.enableAssetAllocation === false) ? 0 : (plan.investmentReturnPost !== undefined && plan.investmentReturnPost !== null ? Number(plan.investmentReturnPost) / 100.0 : meanReturnPre);
    const sigma = (Number(volatility) || 15.0) / 100.0;
    const inflation = (Number(plan.inflationRate) || 2.5) / 100.0;

    const ssAge = Number(plan.socialSecurityAge) || 65;
    const ssAnnual = Number(plan.socialSecurityAnnual) || 0;
    const passiveStreams = (plan.incomes || []).filter(inc => {
      if (inc.enabled === false) return false;
      const isLmnp = inc.isRealEstate || inc.isLmnp || (inc.name && (/lmnp|doanh thu bđs|doanh thu bds|doanh thu bất động sản|bất động sản|bat dong san|cho thuê/i).test(inc.name));
      if (isLmnp && plan.lmnpEnabled === false) return false;
      return true;
    });

    const totalYears = lifeExpectancy - currentAge;
    const ageAxis = [];
    for (let a = currentAge; a <= lifeExpectancy; a++) {
      ageAxis.push(a);
    }

    const allTrajectories = [];
    let successCount = 0;
    const failureAges = [];

    for (let sim = 0; sim < iterations; sim++) {
      let portfolio = currentSavings;
      const path = [portfolio];
      let survived = true;

      for (let y = 1; y <= totalYears; y++) {
        const age = currentAge + y;
        const cumInflation = Math.pow(1.0 + inflation, y);
        const meanReturn = age >= retireAge ? meanReturnPost : meanReturnPre;
        const r = randomNormal(meanReturn, sigma);

        if (age < retireAge) {
          const savingsThisYear = annualSavings * Math.pow(1.0 + inflation, y - 1);
          portfolio = (portfolio + savingsThisYear) * (1.0 + r);
        } else {
          const grossSpend = effectiveRetireExpenses * cumInflation;
          let passiveIncomeThisYear = 0;
          if (age >= ssAge) {
            passiveIncomeThisYear += ssAnnual * cumInflation;
          }
          passiveStreams.forEach(inc => {
            const sAge = Number(inc.startAge) || 18;
            const eAge = Number(inc.endAge) || lifeExpectancy;
            const name = (inc.name || "").toLowerCase();
            const isWorkingSalary = !inc.isBhxhVn && (inc.isSalary || (/lương|salary|impôt|impot/i).test(name) || (sAge < retireAge && eAge <= retireAge));
            if (!isWorkingSalary && age >= sAge && age <= eAge) {
              passiveIncomeThisYear += (Number(inc.amount) || 0) * (inc.growth ? Math.pow(1.0 + (inc.growth / 100.0), age - sAge) : cumInflation);
            }
          });

          const netDeficit = Math.max(0, grossSpend - passiveIncomeThisYear);
          let actualSpend = netDeficit;
          if (plan.enableWithdrawalStrategy !== false && plan.withdrawalStrategy === 'guyton_klinger' && r < -0.05) {
            actualSpend = netDeficit * 0.90;
          }
          portfolio = Math.max(0, (portfolio - actualSpend) * (1.0 + r));
        }

        if (portfolio <= 0 && survived) {
          survived = false;
          failureAges.push(age);
        }
        path.push(portfolio);
      }

      if (survived && path[path.length - 1] > 0) {
        successCount++;
      }
      allTrajectories.push(path);
    }

    const p10 = [];
    const p25 = [];
    const p50 = [];
    const p75 = [];
    const p90 = [];

    for (let y = 0; y <= totalYears; y++) {
      const yearValues = allTrajectories.map(p => p[y]).sort((a, b) => a - b);
      const getP = (pct) => yearValues[Math.floor(yearValues.length * pct)];
      
      p10.push(getP(0.10));
      p25.push(getP(0.25));
      p50.push(getP(0.50));
      p75.push(getP(0.75));
      p90.push(getP(0.90));
    }

    const successRate = ((successCount / iterations) * 100).toFixed(1);
    const avgFailureAge = failureAges.length > 0 
      ? (failureAges.reduce((a, b) => a + b, 0) / failureAges.length).toFixed(1)
      : null;

    return {
      successRate,
      ageAxis,
      p10,
      p25,
      p50,
      p75,
      p90,
      avgFailureAge,
      totalSimulations: iterations
    };
  }

  const Simulator = {
    runSimulation
  };

  if (typeof window !== 'undefined') {
    window.MonteCarloSimulator = Simulator;
    window.MonteCarloSimulation = Simulator;
  }

  return Simulator;
})();
