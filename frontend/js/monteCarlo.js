/**
 * pyRetrait — Monte Carlo Simulation & Sequence of Returns Risk (SRR) Engine
 */

window.MonteCarloSimulator = (function() {
  'use strict';

  // Box-Muller transform for standard normal random number generator
  function randomNormal(mean, stdDev) {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  // Fast client-side 1,000-run simulation
  function runSimulation(plan, iterations = 1000, volatility = 15.0) {
    const currentAge = Number(plan.currentAge) || 32;
    const retireAge = Number(plan.retirementAge) || 45;
    const lifeExpectancy = Number(plan.lifeExpectancy) || 85;
    const currentSavings = Number(plan.currentSavings) || 1_500_000_000;
    const annualSavings = Number(plan.annualSavings) || 360_000_000;
    const retirementExpenses = Number(plan.retirementExpenses) || 300_000_000;
    const meanReturn = (Number(plan.investmentReturnPost) || 8.0) / 100.0;
    const sigma = (Number(volatility) || 15.0) / 100.0;
    const inflation = (Number(plan.inflationRate) || 4.0) / 100.0;

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
        const r = randomNormal(meanReturn, sigma);

        if (age < retireAge) {
          // Accumulation
          const savingsThisYear = annualSavings * Math.pow(1.0 + inflation, y - 1);
          portfolio = (portfolio + savingsThisYear) * (1.0 + r);
        } else {
          // Withdrawal
          const spend = retirementExpenses * cumInflation;
          portfolio = Math.max(0, (portfolio - spend) * (1.0 + r));
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
