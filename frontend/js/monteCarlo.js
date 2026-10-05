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

    // 1. Initial liquid portfolio: sum of currentSavings and French tax-advantaged accounts
    const frenchAccs = plan.frenchAccounts || {};
    const frenchTotal = (Number(frenchAccs.peaBalance) || 0) + 
                        (Number(frenchAccs.assuranceVieBalance) || 0) + 
                        (Number(frenchAccs.livretABalance) || 0) + 
                        (Number(frenchAccs.perBalance) || 0);
    const currentSavings = (Number(plan.currentSavings) || 0) + frenchTotal;

    const annualSavings = Number(plan.annualSavings) || 0;

    // 2. Effective location-adjusted retirement expenses (matches engine.js)
    const baseRetireExpenses = Number(plan.retirementExpenses) || 12000;
    const locFactor = (plan.retirementLocation === 'vietnam') ? 0.45 : (plan.retirementLocation === 'hybrid' ? 0.70 : 1.0);
    const locExtra = (plan.retirementLocation === 'vietnam') ? (plan.currency === 'EUR' ? 1800 : 45_000_000) : (plan.retirementLocation === 'hybrid' ? (plan.currency === 'EUR' ? 2200 : 55_000_000) : 0);
    const effectiveRetireExpenses = (plan.retirementLocation ? ((baseRetireExpenses * locFactor) + locExtra) : baseRetireExpenses);

    const meanReturnPre = (Number(plan.investmentReturnPre) || 6.0) / 100.0;
    const meanReturnPost = (Number(plan.investmentReturnPost) || 7.5) / 100.0;
    const sigma = (Number(volatility) || 15.0) / 100.0;
    const inflation = (Number(plan.inflationRate) || 2.5) / 100.0;

    // 3. Passive retirement incomes (Pension / Social Security + Dividends + Other retirement streams)
    const ssAge = Number(plan.socialSecurityAge) || 65;
    const ssAnnual = Number(plan.socialSecurityAnnual) || 0;
    const passiveStreams = (plan.incomes || []).filter(inc => inc.enabled !== false);

    const totalYears = lifeExpectancy - currentAge;
    const ageAxis = [];
    for (let a = currentAge; a <= lifeExpectancy; a++) {
      ageAxis.push(a);
    }

    const allTrajectories = [];
    let successCount = 0;
    const failureAges = [];

    // Run N simulations
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
          // Accumulation phase
          const savingsThisYear = annualSavings * Math.pow(1.0 + inflation, y - 1);
          portfolio = (portfolio + savingsThisYear) * (1.0 + r);
        } else {
          // Retirement Withdrawal phase
          const grossSpend = effectiveRetireExpenses * cumInflation;

          // Guaranteed passive income this year (Pension + Dividends/Rental streams)
          let passiveIncomeThisYear = 0;
          if (age >= ssAge) {
            passiveIncomeThisYear += ssAnnual * cumInflation;
          }
          passiveStreams.forEach(inc => {
            const sAge = Number(inc.startAge) || 18;
            const eAge = Number(inc.endAge) || lifeExpectancy;
            const name = (inc.name || "").toLowerCase();
            const isWorkingSalary = name.includes("lương tại") || name.includes("lương chính") || (sAge < retireAge && eAge <= retireAge);
            if (!isWorkingSalary && age >= sAge && age <= eAge) {
              passiveIncomeThisYear += (Number(inc.amount) || 0) * (inc.growth ? Math.pow(1.0 + (inc.growth / 100.0), age - sAge) : cumInflation);
            }
          });

          // Net deficit that must be withdrawn from portfolio
          const netDeficit = Math.max(0, grossSpend - passiveIncomeThisYear);

          // Support Guyton-Klinger guardrail flexibility if configured (10% cut in market downturns)
          let actualSpend = netDeficit;
          if (plan.withdrawalStrategy === 'guyton_klinger' && r < -0.05) {
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

    // Compute percentiles for each year
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

  return {
    runSimulation
  };
})();
