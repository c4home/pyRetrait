/**
 * pyRetrait — Core Mathematical Financial Independence & Cash-Flow Engine
 */

window.RetirementEngine = (function() {
  'use strict';

  // Get only the symbol of the currency (€, ₫, $, ¥)
  function getCurrencySymbol(currency = 'EUR') {
    if (currency === 'EUR' || currency === '€') return '€';
    if (currency === 'VND' || currency === '₫') return '₫';
    if (currency === 'CNY' || currency === '¥') return '¥';
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
    } else if (currency === 'CNY' || currency === '¥') {
      if (compact) {
        if (Math.abs(amount) >= 1_000_000) {
          return sym + (amount / 1_000_000).toFixed(2) + 'M';
        } else if (Math.abs(amount) >= 1_000) {
          return sym + (amount / 1_000).toFixed(1) + 'k';
        }
        return sym + Math.round(amount).toLocaleString('zh-CN');
      }
      return sym + Math.round(amount).toLocaleString('zh-CN');
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

  // Calculate weighted return across asset classes or dynamic investments with optional rebalancing bonus
  // Quy chuẩn: Tổng các danh mục không được vượt quá 100%, nhưng không cần đầy đủ 100%.
  // Mẫu số luôn luôn là 100% của danh mục. Phần chưa phân bổ (100% - total) có tỷ suất sinh lời 0% (nhàn rỗi/bảo toàn vốn).
  function calculateWeightedReturn(allocOrInvestments, returns, rebalanceBonus = 0.3) {
    if (!allocOrInvestments) return 8.0;

    let items = [];
    if (Array.isArray(allocOrInvestments)) {
      items = allocOrInvestments;
    } else if (Array.isArray(allocOrInvestments.investments)) {
      items = allocOrInvestments.investments;
    }

    // Nếu là mảng danh mục đầu tư tùy biến do người dùng tự thêm
    if (items.length > 0) {
      let total = 0;
      let weightedSum = 0;
      let activeCount = 0;
      items.forEach(it => {
        const ratio = Math.max(0, Number(it.ratio) || 0);
        const ret = Number(it.annualReturn) || 0;
        total += ratio;
        weightedSum += ratio * ret;
        if (ratio > 0) activeCount++;
      });
      const clampedTotal = Math.min(100, Math.max(0, total));
      const baseWeighted = weightedSum / 100.0;
      const bonus = (activeCount >= 2) ? (rebalanceBonus || 0.3) * (clampedTotal / 100.0) : 0.0;
      return Math.round((baseWeighted + bonus) * 100) / 100;
    }

    // Fallback đối tượng truyền thống { stocks, bonds, realEstate, cash }
    const stocks = (allocOrInvestments.stocks !== undefined && !isNaN(Number(allocOrInvestments.stocks))) ? Math.max(0, Number(allocOrInvestments.stocks)) : 60;
    const bonds = (allocOrInvestments.bonds !== undefined && !isNaN(Number(allocOrInvestments.bonds))) ? Math.max(0, Number(allocOrInvestments.bonds)) : 20;
    const realEstate = (allocOrInvestments.realEstate !== undefined && !isNaN(Number(allocOrInvestments.realEstate))) ? Math.max(0, Number(allocOrInvestments.realEstate)) : 0;
    const cash = (allocOrInvestments.cash !== undefined && !isNaN(Number(allocOrInvestments.cash))) ? Math.max(0, Number(allocOrInvestments.cash)) : 0;
    const total = stocks + bonds + realEstate + cash;
    const clampedTotal = Math.min(100, Math.max(0, total));

    const rStocks = (returns && returns.stocks !== undefined && !isNaN(Number(returns.stocks))) ? Number(returns.stocks) : 9.5;
    const rBonds = (returns && returns.bonds !== undefined && !isNaN(Number(returns.bonds))) ? Number(returns.bonds) : 3.5;
    const rRE = (returns && returns.realEstate !== undefined && !isNaN(Number(returns.realEstate))) ? Number(returns.realEstate) : 6.5;
    const rCash = (returns && returns.cash !== undefined && !isNaN(Number(returns.cash))) ? Number(returns.cash) : 1.5;

    // Tính lợi nhuận theo trọng số trên tổng 100% tài sản
    const weightedSum = (stocks * rStocks) + (bonds * rBonds) + (realEstate * rRE) + (cash * rCash);
    const baseWeighted = weightedSum / 100.0;

    // Thưởng kỷ luật tái cân bằng: chỉ áp dụng khi có ít nhất 2 lớp tài sản được phân bổ > 0%
    const activeClassesCount = [stocks, bonds, realEstate, cash].filter(v => v > 0).length;
    const bonus = (activeClassesCount >= 2) ? (rebalanceBonus || 0.3) * (clampedTotal / 100.0) : 0.0;

    return Math.round((baseWeighted + bonus) * 100) / 100;
  }

  // Nhận diện chuẩn xác toàn diện các luồng thu nhập BĐS / LMNP (kể cả 1 căn hay nhiều căn)
  function isRealEstateIncomeStream(stream) {
    if (!stream) return false;
    if (stream.isRealEstate || stream.isLmnp) return true;
    const name = stream.name || '';
    return (/lmnp|doanh thu bđs|doanh thu bds|doanh thu bất động sản|dòng tiền bđs|dòng tiền bds|dòng tiền bất động sản|bất động sản|bat dong san|cho thuê/i).test(name);
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
  function computePropertyValue(propVal0, age, startAge, isHouse, customAppreciation, hasMaintenanceParam) {
    let initialVal = 0;
    let elapsed = 0;
    let isHouseType = false;
    let customRate = null;
    let hasMaintenance = false;

    if (typeof propVal0 === 'object' && propVal0 !== null) {
      const prop = propVal0;
      initialVal = Number(prop.current_value || prop.value || prop.property_price || prop.price || prop.propVal0) || 0;
      elapsed = (typeof age === 'number') ? Math.max(0, age) : Math.max(0, (Number(prop.age) || 0) - (Number(prop.startAge) || 0));
      isHouseType = (prop.property_type === 'house' || prop.property_category === 'house' || prop.isHouse === true);
      customRate = (prop.growth_rate !== undefined && prop.growth_rate !== null) ? (Number(prop.growth_rate) / 100.0) : ((prop.customAppreciation !== undefined) ? prop.customAppreciation : null);
      hasMaintenance = (Number(prop.annual_maintenance) > 0 || Number(prop.charges_copro) > 0 || Number(prop.maintenance_cost) > 0 || Boolean(prop.hasMaintenance));
    } else {
      initialVal = Number(propVal0) || 0;
      elapsed = Math.max(0, (Number(age) || 0) - (Number(startAge) || 0));
      isHouseType = Boolean(isHouse);
      customRate = (customAppreciation !== undefined && customAppreciation !== null) ? customAppreciation : null;
      hasMaintenance = Boolean(hasMaintenanceParam);
    }

    if (elapsed === 0) return Math.round(initialVal);

    if (isHouseType) {
      // Formula 1: Nhà mặt đất (House / Maison)
      const rate = customRate !== null ? customRate : 0.025;
      return Math.round(initialVal * Math.pow(1.0 + rate, elapsed));
    } else {
      // Formula 2: Căn hộ chung cư (Apartment / Copropriété)
      // Phần Đất: 25% giá trị ban đầu, tăng trưởng dài hạn +2.0%/năm
      const landRatio = 0.25;
      const buildingRatio = 0.75;
      const landRate = 0.020;
      const landVal = initialVal * landRatio * Math.pow(1.0 + landRate, elapsed);

      // Phần Xác nhà: 75% giá trị ban đầu
      // Nếu có quỹ bảo trì định kỳ (Fonds de travaux / Charges copro): Sàn bảo tồn 60% sau 30 năm
      // Nếu không có bảo trì: Hao mòn về sàn 10% sau 30 năm
      const maxDecayYears = 30;
      const decayFloor = hasMaintenance ? 0.60 : 0.10;
      const decayRatio = Math.max(decayFloor, 1.0 - (elapsed / maxDecayYears) * (1.0 - decayFloor));

      const adjFactor = (customRate !== null && customRate !== 0)
        ? Math.pow(1.0 + customRate, elapsed)
        : 1.0;
      const buildingVal = initialVal * buildingRatio * decayRatio * adjFactor;

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
    const hasMaintenance = Boolean(mortgage.hasMaintenance || Number(mortgage.annual_maintenance) > 0 || Number(mortgage.charges_copro) > 0 || Number(mortgage.annualMaintenance) > 0);

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
      curPropVal = computePropertyValue(propVal0, age + 1, startAge, isHouse, appreciation, hasMaintenance);
    }

    for (let age = currentAge; age <= lifeExpectancy; age++) {
      curPropVal = computePropertyValue(propVal0, age, startAge, isHouse, appreciation, hasMaintenance);
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

  /**
   * Đánh giá Lưới An Toàn 3 Biến Cố Khắc Nghiệt (Triple-Shock Stress Resilience)
   * Chạy độc lập 3 kịch bản khủng hoảng:
   * 1. market_crash: Khủng hoảng thị trường sớm (-35% trong 2 năm đầu nghỉ hưu - rủi ro SORR)
   * 2. high_inflation: Bão giá lạm phát phi mã (+30% chi phí sống trong 5 năm đầu)
   * 3. medical_shock: Cú sốc chi phí y tế đột xuất (500 triệu VND ở tuổi 65)
   */
  function evaluateStressResilience(plan) {
    if (!plan) return null;
    const scenarios = [
      {
        id: 'market_crash',
        key: 'market_crash',
        nameVi: 'Khủng hoảng Thị trường Sớm (-35% Năm 1 & 2)',
        nameEn: 'Early Market Crash (-35% Yr 1 & 2)',
        nameFr: 'Krach Boursier Précoce (-35% An 1 & 2)',
        descVi: 'Mô phỏng rủi ro trình tự lợi nhuận (SORR): thị trường giảm 35% ngay khi bạn vừa bước vào hưu trí.',
        descEn: 'Sequence of returns risk: market drops 35% right after retirement.',
        descFr: 'Risque de séquence des rendements: chute de 35% dès le début de la retraite.',
        adviceVi: 'Lập đệm tiền mặt dự phòng 2–3 năm chi tiêu hoặc dùng chiến lược rút tiền linh hoạt (Guyton-Klinger) để không phải bán cắt lỗ khi thị trường chạm đáy.',
        adviceEn: 'Build a 2–3 year cash cushion or switch to Guyton-Klinger dynamic withdrawals to avoid selling at market bottom.',
        adviceFr: 'Constituez un matelas de sécurité de 2–3 ans ou utilisez Guyton-Klinger pour éviter de vendre à perte au creux du marché.'
      },
      {
        id: 'high_inflation',
        key: 'high_inflation',
        nameVi: 'Lạm phát Phi mã (+30% Chi phí trong 5 năm)',
        nameEn: 'High Inflation Spike (+30% Expenses for 5 Yrs)',
        nameFr: 'Flambée Inflationniste (+30% Dépenses pdt 5 Ans)',
        descVi: 'Chi phí sinh hoạt tăng vọt 30% liên tục 5 năm đầu do bất ổn kinh tế vĩ mô hoặc chuỗi cung ứng.',
        descEn: 'Living expenses jump 30% for 5 consecutive years due to macroeconomic shocks.',
        descFr: 'Les dépenses bondissent de 30% pendant 5 ans consécutifs en raison des chocs macroéconomiques.',
        adviceVi: 'Chủ động thắt chặt chi tiêu trong các năm bão giá (chuyển sớm sang giai đoạn Slow-Go) và phân bổ tài sản phòng thủ lạm phát (BĐS, cổ phiếu).',
        adviceEn: 'Flexibly tighten spending during inflation spikes and allocate to inflation-resilient assets (Real Estate, equities).',
        adviceFr: 'Resserrez vos dépenses pendant les chocs d\'inflation et diversifiez vers des actifs résilients (immobilier, actions).'
      },
      {
        id: 'medical_shock',
        key: 'medical_shock',
        nameVi: 'Cú sốc Chi phí Y tế Đột xuất (500Tr ₫ ở tuổi 65)',
        nameEn: 'Medical Expense Shock (€18k at Age 65)',
        nameFr: 'Choc de Dépenses de Santé (18k € à 65 ans)',
        descVi: 'Phát sinh một khoản viện phí / y tế đặc biệt quy mô lớn ngoài bảo hiểm y tế cơ bản.',
        descEn: 'A sudden large medical bill outside basic health coverage.',
        descFr: 'Une dépense médicale imprévue majeure non couverte par la sécurité sociale.',
        adviceVi: 'Tham gia hợp đồng bảo hiểm sức khỏe tư nhân có quyền lợi nội trú cao để chuyển giao rủi ro tài chính này cho đơn vị bảo hiểm.',
        adviceEn: 'Maintain private health insurance with strong inpatient coverage to transfer catastrophic medical risks.',
        adviceFr: 'Souscrivez une mutuelle santé privée avec un bon plafond d\'hospitalisation pour transférer ce risque financier.'
      }
    ];

    let passedCount = 0;
    const scenarioResults = scenarios.map(sc => {
      const stressProj = runProjection(plan, sc.key, true);
      let passed = true;
      let failureReason = null; // 'floor_breach' | 'spending_cut' | 'depleted'
      let failureAge = null;
      let capitalGap = 0;
      let delayYearsGap = 0;

      if (!stressProj || !stressProj.survived || (stressProj.finalPortfolio !== undefined && stressProj.finalPortfolio <= 0)) {
        passed = false;
        failureReason = 'depleted';
      }

      // Kiểm tra Multi-Gate qua toàn bộ các năm nghỉ hưu:
      // Gate 1: Sàn Tài sản An toàn >= 5 năm khoản tiền thiếu mỗi năm (Chi tiêu - Lương hưu & Thụ động)
      // Gate 2: Mức sống không bị cắt giảm quá 20% (chi tiêu thực tế >= 80% chi tiêu kế hoạch)
      // Gate 3: Danh mục không cạn kiệt (portfolioEnd > 0)
      if (stressProj && Array.isArray(stressProj.timeline)) {
        for (let i = 0; i < stressProj.timeline.length; i++) {
          const row = stressProj.timeline[i];
          if (!row.isRetired) continue;

          // Gate 3: Cạn kiệt hoàn toàn vốn
          if (row.portfolioEnd <= 0) {
            passed = false;
            failureReason = 'depleted';
            failureAge = row.age;
            break;
          }

          // Gate 1: Sàn Tài sản An Toàn >= 5 năm khoản tiền thiếu mỗi năm
          // Khoản tiền thiếu mỗi năm = Max(0, Tổng chi tiêu cả năm - Lương hưu & Tiền thụ động nhận được)
          const annualExp = row.expenses || 0;
          const netPassive = Math.max(0, (row.income || 0) - (row.tax || 0));
          const netDeficit = Math.max(0, annualExp - netPassive);
          const safetyFloor = netDeficit * 5;
          if (row.portfolioEnd < safetyFloor) {
            passed = false;
            failureReason = 'floor_breach';
            failureAge = row.age;
            break;
          }

          // Gate 2: Giới hạn cắt giảm mức sống (chi tiêu thực tế không tụt quá 20%)
          const actualSpending = (row.withdrawal || 0) + Math.max(0, (row.income || 0) - (row.tax || 0));
          if (annualExp > 0 && actualSpending < annualExp * 0.80) {
            passed = false;
            failureReason = 'spending_cut';
            failureAge = row.age;
            break;
          }
        }
      }

      if (passed) {
        passedCount++;
      } else {
        // Ước tính khoảng thiếu hụt vốn (Capital Gap) chiết khấu về hiện tại
        const planCurAge = Number(plan.currentAge) || 29;
        const yearsToFail = Math.max(1, (failureAge || 60) - planCurAge);
        let deficitAtFail = 0;
        if (stressProj && Array.isArray(stressProj.timeline)) {
          const failRow = stressProj.timeline.find(r => r.age === failureAge);
          if (failRow) {
            const failExp = failRow.expenses || 0;
            const failNetPassive = Math.max(0, (failRow.income || 0) - (failRow.tax || 0));
            const failDeficit = Math.max(0, failExp - failNetPassive);
            const floor = failDeficit * 5;
            deficitAtFail = Math.max(0, floor - (failRow.portfolioEnd || 0));
          }
        }
        const annualizedBase = (Number(plan.retirementExpenses) || 12000) * 2.0;
        if (deficitAtFail <= 0) deficitAtFail = annualizedBase;
        capitalGap = Math.round(Math.max(annualizedBase, deficitAtFail / Math.pow(1.04, yearsToFail)));

        // Ước tính số năm cần lùi tuổi hưu (Delay Retirement Years)
        const annSavings = Number(plan.annualSavings) || 10000;
        delayYearsGap = Math.min(8, Math.max(1, Math.ceil(capitalGap / Math.max(6000, annSavings * 1.6))));
      }

      return {
        id: sc.id,
        key: sc.key,
        nameVi: sc.nameVi,
        nameEn: sc.nameEn,
        nameFr: sc.nameFr,
        descVi: sc.descVi,
        descEn: sc.descEn,
        descFr: sc.descFr,
        adviceVi: sc.adviceVi,
        adviceEn: sc.adviceEn,
        adviceFr: sc.adviceFr,
        passed,
        failureReason,
        failureAge,
        capitalGap,
        delayYearsGap,
        finalPortfolio: stressProj ? stressProj.finalPortfolio : 0
      };
    });

    const isBulletproof = passedCount === scenarios.length;
    let badge = 'fragile';
    if (isBulletproof) {
      badge = 'bulletproof';
    } else if (passedCount >= 1) {
      badge = 'standard';
    }

    return {
      passedCount,
      totalCount: scenarios.length,
      isBulletproof,
      badge,
      scenarios: scenarioResults
    };
  }

  /**
   * Tìm Tuổi Nghỉ Hưu Tối Ưu / Tuổi Gợi Ý (Optimal / Suggested Retirement Age)
   * Tiêu chuẩn khắt khe: Phải ĐÁP ỨNG TOÀN BỘ 3 TRỤ CỘT ĐẠT TỰ DO TÀI CHÍNH:
   * 1. Vốn trước khi về hưu: Tài sản thanh khoản ≥ Hệ số an toàn (25 - 30 lần) × Khoản tiền thiếu mỗi năm (kèm bù đắp các năm chờ lương hưu)
   * 2. Chịu được biến động thị trường: 1,000 kịch bản mô phỏng Monte Carlo đạt tỷ lệ thành công ≥ 80%
   * 3. Chịu được biến cố bệnh tật, khủng hoảng: Vượt qua cả 3 cú sốc (Bệnh tật, Khủng hoảng, Lạm phát) với Sàn thanh khoản ≥ 5 năm khoản tiền thiếu & Mức sống ≥ 80% (isBulletproof)
   * Và đảm bảo dòng tiền cơ sở không cạn kiệt (survived: true).
   */
  function findOptimalRetirementAge(plan, baseFireAge = null) {
    if (!plan) return null;
    const currentAge = Number(plan.currentAge) || 29;
    const lifeExpectancy = Number(plan.lifeExpectancy) || 85;
    // Bắt đầu quét từ tuổi hiện tại trở đi để tìm đúng điểm tự do tài chính tối ưu sớm nhất
    const minSearchAge = currentAge;
    const maxSearchAge = Math.min(lifeExpectancy - 2, 75);

    const mcSim = (typeof window !== 'undefined' && window.MonteCarloSimulator) 
      ? window.MonteCarloSimulator 
      : (typeof MonteCarloSimulator !== 'undefined' ? MonteCarloSimulator : null);

    let optimalBulletproofAge = null; // Đạt MC >= 80% VÀ Bulletproof (vượt cả 3 cú sốc lớn)
    let optimalSolidAge = null;       // Đạt MC >= 80% VÀ passedCount >= 2
    let optimalBasicAge = null;       // Đạt MC >= 80% VÀ dòng tiền sống sót
    let bestMcAge = null;
    let maxMcRate = 0;

    for (let candAge = minSearchAge; candAge <= maxSearchAge; candAge++) {
      // Đánh giá ứng viên bằng ĐÚNG cấu hình của kế hoạch người dùng (kể cả chiến lược rút tiền),
      // để kết quả tuổi tối ưu nhất quán với 3 trụ cột đang hiển thị ở thanh bên cho kế hoạch thật.
      const candPlan = { ...plan, retirementAge: candAge };

      // Nấc 1: Chạy projection cơ sở cho tuổi thử nghiệm (bỏ qua đệ quy optimal và stress)
      const candProj = runProjection(candPlan, null, true, true);
      if (!candProj || !candProj.survived || (candProj.finalPortfolio !== undefined && candProj.finalPortfolio <= 0)) {
        continue;
      }

      // Nấc 2: Kiểm tra Điều kiện 1 & 2 (Đủ Nest Egg an toàn tương ứng với thời lượng hưu)
      const horizon = Math.max(1, lifeExpectancy - candAge);
      const reqMult = horizon > 35 ? 30 : (horizon > 30 ? 28 : 25);
      
      const baseRetireExp = Number(plan.retirementExpenses) || 12000;
      let passiveAtRetire = 0;
      const ssAge = Number(plan.socialSecurityAge) || 64;
      if (candAge >= ssAge) {
        passiveAtRetire += Number(plan.socialSecurityAnnual) || 0;
      }
      if (Array.isArray(plan.incomes)) {
        plan.incomes.forEach(inc => {
          if (inc.enabled === false) return;
          if (isRealEstateIncomeStream(inc) && plan.lmnpEnabled === false) return;
          const sAge = Number(inc.startAge) || currentAge;
          const eAge = Number(inc.endAge) || lifeExpectancy;
          const name = (inc.name || "").toLowerCase();
          const isSalary = !inc.isBhxhVn && (inc.isSalary || (/lương|salary|impôt|impot/i).test(inc.name || "") || (sAge < candAge && eAge <= candAge));
          if (!isSalary && candAge >= sAge && candAge <= eAge) {
            const incAmt = Number(inc.amount) || 0;
            if (incAmt > 0) {
              passiveAtRetire += incAmt;
            }
          }
        });
      }
      const netDeficit = Math.max(0, baseRetireExp - passiveAtRetire);
      const reqNestEgg = Math.round(netDeficit > 0 ? (netDeficit * reqMult) : (baseRetireExp * 10));

      // Lấy tài sản lúc bắt đầu bước vào hưu trí tại tuổi candAge
      const prevRow = candProj.timeline.find(r => r.age === candAge - 1);
      const currRow = candProj.timeline.find(r => r.age === candAge);
      const portAtRetire = prevRow ? prevRow.portfolioEnd : (currRow ? (currRow.portfolioEnd + (currRow.withdrawal || 0)) : 0);

      if (portAtRetire < reqNestEgg) {
        continue;
      }

      // Nấc 3: Kiểm tra Điều kiện 3 (Mô phỏng Monte Carlo đạt tỷ lệ an toàn ≥ 80%)
      let successRate = 0;
      if (mcSim && typeof mcSim.runSimulation === 'function') {
        try {
          // Chạy 400 lượt (seed cố định) — trùng với số lượt dùng cho thanh bên để hai nơi cho cùng kết quả
          const mcRes = mcSim.runSimulation(candPlan, 400, 15.0);
          successRate = parseFloat(mcRes.successRate) || 0;
        } catch (e) {
          console.warn("Lỗi tính Monte Carlo khi tìm tuổi tối ưu:", e);
        }
      }

      if (successRate > maxMcRate) {
        maxMcRate = successRate;
        bestMcAge = candAge;
      }

      // Nếu tỷ lệ thành công Monte Carlo chưa đạt 80%, tuyệt đối KHÔNG coi đây là Tuổi Tối Ưu!
      // Tiếp tục quét lên tuổi cao hơn để tích lũy thêm đệm vốn và rút ngắn khoảng cách chờ lương hưu.
      if (successRate < 80.0) {
        continue;
      }

      // Nấc 4: Kiểm tra Điều kiện 4 (Stress Resilience - Chống chịu 3 biến cố lớn)
      const candStress = evaluateStressResilience(candPlan);
      if (candStress && candStress.isBulletproof) {
        // Đạt chuẩn cao nhất (Cả 4 điều kiện hoàn hảo: MC >= 80% & Vượt trọn vẹn cả 3 biến cố)
        return candAge;
      } else if (candStress && candStress.passedCount >= 2) {
        if (!optimalSolidAge) optimalSolidAge = candAge;
      } else {
        if (!optimalBasicAge) optimalBasicAge = candAge;
      }

      // Nếu đã tìm thấy tuổi vững chắc (MC >= 80% và pass >= 2 biến cố), chỉ quét thêm tối đa 3 năm
      // xem có chạm được mốc Bulletproof không. Nếu không, chốt optimalSolidAge.
      if (optimalSolidAge && (candAge - optimalSolidAge >= 3)) {
        return optimalSolidAge;
      }
    }

    if (optimalBulletproofAge) return optimalBulletproofAge;
    if (optimalSolidAge) return optimalSolidAge;
    if (optimalBasicAge) return optimalBasicAge;

    // Nếu không có tuổi nào đạt MC >= 80%, nhưng có tuổi tiệm cận rất sát (>= 75%)
    if (maxMcRate >= 75.0 && bestMcAge) {
      return bestMcAge;
    }

    // Nếu toàn bộ dải tuổi đều có tỷ lệ thành công thấp (< 75%), kế hoạch chưa thể coi là khả thi an toàn
    return null;
  }

  // Calculate year-by-year cash flows and net worth trajectory
  function runProjection(plan, overrideScenario = null, skipStressResilience = false, skipOptimalSearch = false) {
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
    const isAssetAllocEnabled = (plan.enableAssetAllocation !== false);
    if (isAssetAllocEnabled && (plan.investments || plan.assetAllocation)) {
      weightedReturnPre = calculateWeightedReturn(plan.investments || plan.assetAllocation, plan.assetReturns, 0.3);
      weightedReturnPost = weightedReturnPre;
      returnPre = weightedReturnPre / 100.0;
      returnPost = weightedReturnPost / 100.0;
    } else if (isAssetAllocEnabled) {
      weightedReturnPre = (plan.investmentReturnPre !== undefined && plan.investmentReturnPre !== null) ? Number(plan.investmentReturnPre) : 8.0;
      weightedReturnPost = (plan.investmentReturnPost !== undefined && plan.investmentReturnPost !== null) ? Number(plan.investmentReturnPost) : weightedReturnPre;
      returnPre = weightedReturnPre / 100.0;
      returnPost = weightedReturnPost / 100.0;
    } else {
      // Khi TẮT Danh mục đầu tư: Tiền nhàn rỗi không tham gia thị trường sinh lời, lợi suất = 0.0%/năm
      weightedReturnPre = 0.0;
      weightedReturnPost = 0.0;
      returnPre = 0.0;
      returnPost = 0.0;
    }

    // 2. Mortgages & Amortization Schedule
    const mortgageSchedule = calculateMortgageSchedule(plan.mortgage, currentAge, lifeExpectancy);

    // 3. French Accounts tracking
    let frenchAccs = plan.frenchAccounts ? { ...plan.frenchAccounts } : null;
    let totalWaterfallTaxSaved = 0;

    const targetLegacy = (plan.enableEstateLegacy !== false) ? (Number(plan.targetLegacy) || 100_000) : 0;
    const baseRetireExpenses = Number(plan.retirementExpenses) || 12_000;
    const annualSavings = Number(plan.annualSavings) || 10_000;
    const initialSavings = (plan.currentSavings !== undefined && plan.currentSavings !== null && !isNaN(Number(plan.currentSavings)))
      ? Number(plan.currentSavings)
      : 0;
    const withdrawalStrategy = plan.withdrawalStrategy || 'guyton_klinger';
    const initialSWR = (Number(plan.initialWithdrawalRate) || 4.0) / 100.0;

    // Profile & Cross-border settings
    const isSingle = (plan.maritalStatus !== 'married');
    const isSingleCountry = (plan.retireMode === 'domestic' || (plan.workCountry && plan.retireCountry && plan.workCountry === plan.retireCountry));

    // Base Forex parameters
    const baseForex = Number(plan.dualInflation?.eurVndInitialRate) || Number(plan.exchangeRateEurVnd) || 27500;
    const forexDrift = isSingleCountry ? 0 : ((Number(plan.dualInflation?.eurVndAnnualDrift) || 1.2) / 100.0);

    const startAge = 18;
    const timeline = [];

    if (currentAge > startAge) {
      for (let age = startAge; age < currentAge; age++) {
        const pastYear = birthYear + age;

        let pastIncome = 0;
        let pastRealEstateDeficit = 0;
        const pastIncomeBreakdown = [];
        const pastRealEstateExpenseItems = [];
        if (Array.isArray(plan.incomes)) {
          plan.incomes.forEach(stream => {
            if (stream.enabled === false) return;
            if (isRealEstateIncomeStream(stream) && plan.lmnpEnabled === false) return;
            const sAge = Number(stream.startAge);
            const isSalary = !stream.isBhxhVn && (stream.isSalary || (stream.name && (/lương|salary|impôt|impot/i).test(stream.name)));
            const effectiveEndAge = isSalary ? retireAge : (Number(stream.endAge) || retireAge);
            if (age >= sAge && age <= effectiveEndAge) {
              const streamGrowth = (Number(stream.growth) || 0) / 100.0;
              const streamYearsActive = age - sAge;
              const streamVal = (Number(stream.amount) || 0) * Math.pow(1.0 + streamGrowth, streamYearsActive);
              if (streamVal < 0) {
                // Dòng tiền BĐS âm: đưa vào mục CHI TIÊU
                const posVal = Math.abs(streamVal);
                pastRealEstateDeficit += posVal;
                pastRealEstateExpenseItems.push({
                  name: stream.name || 'Dòng tiền BĐS âm',
                  amount: posVal,
                  monthly: posVal / 12
                });
              } else if (streamVal > 0) {
                pastIncome += streamVal;
                pastIncomeBreakdown.push({
                  name: stream.name || 'Thu nhập',
                  amount: streamVal,
                  monthly: streamVal / 12
                });
              }
            }
          });
        }
        pastIncome = Math.round(pastIncome);
        pastRealEstateDeficit = Math.round(pastRealEstateDeficit);

        // Chi tiêu sinh hoạt quá khứ: chỉ phát sinh tương ứng nếu có thu nhập thực tế, nếu không có thu nhập thì mặc định = 0
        const basePastLiving = pastIncome > 0 ? Math.min(pastIncome, Math.round(Number(plan.annualExpenses || 15000))) : 0;
        const pastExpenseBreakdown = [];
        if (basePastLiving > 0) {
          pastExpenseBreakdown.push({
            name: 'Chi tiêu sinh hoạt',
            amount: basePastLiving,
            monthly: basePastLiving / 12
          });
        }
        pastRealEstateExpenseItems.forEach(item => pastExpenseBreakdown.push(item));
        const pastExpenses = basePastLiving + pastRealEstateDeficit;

        // Tài sản quá khứ: chỉ có nếu có tích lũy từ thu nhập thực tế trừ chi phí, không tự động sinh số dương giả lập
        const pastNetCash = pastIncome - pastExpenses;
        const pastPortfolio = Math.max(0, pastNetCash);

        timeline.push({
          age,
          year: pastYear,
          isRetired: false,
          isPast: true,
          income: pastIncome,
          expenses: pastExpenses,
          incomeBreakdown: pastIncomeBreakdown,
          expenseBreakdown: pastExpenseBreakdown,
          withdrawal: 0,
          totalAvailableCash: pastIncome,
          mortgagePayment: 0,
          netCashFlow: pastNetCash,
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
      const isInflationActive = plan.dualInflation ? (plan.dualInflation.enabled !== false) : true;
      const currentInflation = isInflationActive
        ? (isSingleCountry
            ? (Number(plan.dualInflation?.inflationPre) || Number(plan.inflationRate) || (plan.workCountry === 'VN' ? 4.0 : 2.0)) / 100.0
            : (isRetired ? (Number(plan.dualInflation?.inflationPost) || 4.0) / 100.0 : (Number(plan.dualInflation?.inflationPre) || 2.2) / 100.0))
        : 0;
      
      if (i > 0) {
        cumInflation *= (1.0 + currentInflation);
      }

      // Dynamic EUR/VND Forex Rate
      const currentEurVndRate = Math.round(baseForex * Math.pow(1.0 + forexDrift, i));

      // 1. Calculate Active and Passive Incomes for this year
      let annualIncome = 0;
      let taxableIncome = 0;
      const incomeBreakdown = [];
      let realEstateDeficitThisYear = 0;
      const realEstateExpenseItems = [];
      let bhxhContributionThisYear = 0;
      const bhxhExpenseItems = [];
      if (Array.isArray(plan.incomes)) {
        plan.incomes.forEach(stream => {
          if (stream.enabled === false) return;
          // Kiểm tra nếu là luồng BĐS LMNP và cờ lmnpEnabled bị tắt
          if (isRealEstateIncomeStream(stream) && plan.lmnpEnabled === false) return;

          const isSalary = !stream.isBhxhVn && (stream.isSalary || (stream.name && (/lương|salary|impôt|impot/i).test(stream.name)));
          const effectiveEndAge = isSalary ? (retireAge - 1) : (Number(stream.endAge) || retireAge);
          if (age >= stream.startAge && age <= effectiveEndAge) {
            const streamGrowth = (stream.growth !== undefined && stream.growth !== null && !isNaN(Number(stream.growth)))
              ? Number(stream.growth) / 100.0
              : 0.04;
            const streamYearsActive = age - stream.startAge;
            const streamVal = (Number(stream.amount) || 0) * Math.pow(1.0 + streamGrowth, streamYearsActive);
            
            if (streamVal < 0) {
              // Dòng tiền BĐS âm: đưa vào mục CHI TIÊU
              const posVal = Math.abs(streamVal);
              realEstateDeficitThisYear += posVal;
              realEstateExpenseItems.push({
                name: stream.name || 'Dòng tiền BĐS âm',
                amount: posVal,
                monthly: posVal / 12
              });
            } else if (streamVal > 0) {
              annualIncome += streamVal;
              if (stream.taxable !== false) {
                taxableIncome += streamVal;
              }
              incomeBreakdown.push({
                name: stream.name || 'Thu nhập ngoài',
                amount: streamVal,
                monthly: streamVal / 12
              });
            }
          }
        });
      }

      // Add French Pension / BHXH if reached age (with realistic Décote calculation & couple support)
      // 1. Phân loại và tích hợp nguồn lương hưu an sinh theo quốc gia
      const workC = plan.workCountry || 'FR';
      const retireC = plan.retireCountry || plan.workCountry || 'FR';
      const isFrenchEnabled = (plan.enableFrenchPension !== false);
      const isBhxhEnabled = (plan.enableBhxhVn !== false && plan.bhxhVnEnabled !== false);
      const hasFrenchPension = (workC === 'FR' || retireC === 'FR' || plan.enableFrenchPension === true) && isFrenchEnabled;
      const hasBhxhPension = (workC === 'VN' || retireC === 'VN' || plan.enableBhxhVn === true || plan.bhxhVnEnabled === true) && isBhxhEnabled;
      const hasGermanPension = (workC === 'DE' || retireC === 'DE' || plan.enableGermanPension === true) && (plan.enableGermanPension !== false);
      const hasUsPension = (workC === 'US' || retireC === 'US' || plan.enableUsPension === true) && (plan.enableUsPension !== false);
      const hasJapanPension = (workC === 'JP' || retireC === 'JP' || plan.enableJapanPension === true) && (plan.enableJapanPension !== false);
      const hasCanadaPension = (workC === 'CA' || retireC === 'CA' || plan.enableCanadaPension === true) && (plan.enableCanadaPension !== false);
      const hasAustraliaPension = (workC === 'AU' || retireC === 'AU' || plan.enableAustraliaPension === true) && (plan.enableAustraliaPension !== false);
      const hasKoreaPension = (workC === 'KR' || retireC === 'KR' || plan.enableKoreaPension === true) && (plan.enableKoreaPension !== false);
      const hasTaiwanPension = (workC === 'TW' || retireC === 'TW' || plan.enableTaiwanPension === true) && (plan.enableTaiwanPension !== false);

      // 1.1 Lương hưu Pháp (CNAV + Agirc-Arrco)
      if (isRetired && hasFrenchPension && isFrenchEnabled) {
        if (plan.maritalStatus === 'married' && plan.frenchPensionDetails) {
          const s1 = plan.frenchPensionDetails.spouse1 || {};
          const s2 = plan.frenchPensionDetails.spouse2 || {};
          let p1Amt = 0;
          let p2Amt = 0;
          const s1ClaimAge = Number(s1.claimAge) || 64;
          const s2ClaimAge = Number(s2.claimAge) || 64;

          if (age >= s1ClaimAge && window.TaxOptimizer && window.TaxOptimizer.calculateFrenchPension) {
            const raw1 = Number(s1.targetAnnualPension) || Number(plan.socialSecurityAnnual) || 18000;
            const res1 = window.TaxOptimizer.calculateFrenchPension(raw1, Number(s1.startWorkAge) || 24, Math.min(retireAge, s1ClaimAge), s1ClaimAge);
            p1Amt = res1.totalAnnualPension * cumInflation;
          }
          if (age >= s2ClaimAge && window.TaxOptimizer && window.TaxOptimizer.calculateFrenchPension) {
            const raw2 = Number(s2.targetAnnualPension) || 16000;
            const res2 = window.TaxOptimizer.calculateFrenchPension(raw2, Number(s2.startWorkAge) || 24, Math.min(retireAge, s2ClaimAge), s2ClaimAge);
            p2Amt = res2.totalAnnualPension * cumInflation;
          }
          const frenchTotal = p1Amt + p2Amt;
          annualIncome += frenchTotal;
          taxableIncome += frenchTotal;
          if (p1Amt > 0) {
            incomeBreakdown.push({
              name: 'Lương hưu Pháp (Bạn)',
              amount: p1Amt,
              monthly: p1Amt / 12
            });
          }
          if (p2Amt > 0) {
            incomeBreakdown.push({
              name: 'Lương hưu Pháp (Bạn đời)',
              amount: p2Amt,
              monthly: p2Amt / 12
            });
          }
        } else {
          const s1 = plan.frenchPensionDetails?.spouse1 || {};
          const ssAge = Number(s1.claimAge) || Number(plan.socialSecurityAge) || 64;
          if (age >= ssAge) {
            const rawSS = Number(s1.targetAnnualPension) || Number(plan.socialSecurityAnnual) || 18000;
            if (rawSS > 0) {
              const startWorkAge = Number(s1.startWorkAge) || Number(plan.startWorkAge) || 24;
              let pensionReceived = 0;
              if (window.TaxOptimizer && window.TaxOptimizer.calculateFrenchPension) {
                const resSS = window.TaxOptimizer.calculateFrenchPension(rawSS, startWorkAge, Math.min(retireAge, ssAge), ssAge);
                pensionReceived = resSS.totalAnnualPension * cumInflation;
              } else {
                pensionReceived = rawSS * cumInflation;
              }
              annualIncome += pensionReceived;
              taxableIncome += pensionReceived;
              if (pensionReceived > 0) {
                incomeBreakdown.push({
                  name: 'Lương hưu Pháp',
                  amount: pensionReceived,
                  monthly: pensionReceived / 12
                });
              }
            }
          }
        }
      }

      // 1.2 Lương hưu & Đóng phí BHXH Việt Nam
      if (hasBhxhPension && isBhxhEnabled && plan.bhxhVnDetails) {
        const b1 = plan.bhxhVnDetails.spouse1 || {};
        const b2 = plan.bhxhVnDetails.spouse2 || {};
        const userGender = plan.gender || b1.gender || 'male';
        const b1Claim = Number(b1.claimAge) || (userGender === 'female' ? 60 : 62);
        const conv = (plan.currency === 'VND') ? 1 : (currentEurVndRate || 27500);

        const b1Years = Math.max(0, Number(b1.yearsContributed) || 20);
        const b1Salary = Number(b1.monthlySalaryVnd) || 10000000;
        const b1PayMonthlyVnd = Math.round(b1Salary * 0.22); // 22% theo Luật BHXH tự nguyện

        // Giai đoạn đóng phí BHXH (Bạn): Chi tiêu trong số năm đóng tính từ currentAge và trước khi nhận hưu
        if (age >= currentAge && age < (currentAge + b1Years) && age < b1Claim && b1PayMonthlyVnd > 0) {
          const b1PayAnnualVnd = b1PayMonthlyVnd * 12;
          const b1PayVal = (b1PayAnnualVnd * cumInflation) / conv;
          bhxhContributionThisYear += b1PayVal;
          bhxhExpenseItems.push({
            name: plan.maritalStatus === 'married' ? 'Đóng BHXH VN (Bạn)' : 'Đóng BHXH VN',
            amount: b1PayVal,
            monthly: b1PayVal / 12
          });
        }

        // Giai đoạn hưởng lương hưu BHXH (Bạn): Thu nhập khi đạt tuổi b1Claim
        let b1Amt = 0;
        if (age >= b1Claim && window.TaxOptimizer && window.TaxOptimizer.calculateVietnamBhxhPension) {
          const resB1 = window.TaxOptimizer.calculateVietnamBhxhPension(b1Salary, b1Years, userGender, b1Claim);
          b1Amt = resB1.annualPensionVnd;
        }

        let b2Amt = 0;
        if (plan.maritalStatus === 'married') {
          const spouseGender = b2.gender || (userGender === 'female' ? 'male' : 'female');
          const b2Claim = Number(b2.claimAge) || (spouseGender === 'female' ? 60 : 62);
          const b2Years = Math.max(0, Number(b2.yearsContributed) || 20);
          const b2Salary = Number(b2.monthlySalaryVnd) || 10000000;
          const b2PayMonthlyVnd = Math.round(b2Salary * 0.22);

          // Giai đoạn đóng phí BHXH (Bạn đời)
          if (age >= currentAge && age < (currentAge + b2Years) && age < b2Claim && b2PayMonthlyVnd > 0) {
            const b2PayAnnualVnd = b2PayMonthlyVnd * 12;
            const b2PayVal = (b2PayAnnualVnd * cumInflation) / conv;
            bhxhContributionThisYear += b2PayVal;
            bhxhExpenseItems.push({
              name: 'Đóng BHXH VN (Bạn đời)',
              amount: b2PayVal,
              monthly: b2PayVal / 12
            });
          }

          // Giai đoạn hưởng lương hưu BHXH (Bạn đời)
          if (age >= b2Claim && window.TaxOptimizer && window.TaxOptimizer.calculateVietnamBhxhPension) {
            const resB2 = window.TaxOptimizer.calculateVietnamBhxhPension(b2Salary, b2Years, spouseGender, b2Claim);
            b2Amt = resB2.annualPensionVnd;
          }
        }

        if (b1Amt > 0) {
          const b1Val = (b1Amt * cumInflation) / conv;
          incomeBreakdown.push({
            name: plan.maritalStatus === 'married' ? 'Lương hưu BHXH VN (Bạn)' : 'Lương hưu BHXH VN',
            amount: b1Val,
            monthly: b1Val / 12
          });
        }
        if (b2Amt > 0) {
          const b2Val = (b2Amt * cumInflation) / conv;
          incomeBreakdown.push({
            name: 'Lương hưu BHXH VN (Bạn đời)',
            amount: b2Val,
            monthly: b2Val / 12
          });
        }
        const totalBhxhVnd = (b1Amt + b2Amt) * cumInflation;
        if (totalBhxhVnd > 0) {
          const bhxhVal = (totalBhxhVnd / conv);
          annualIncome += bhxhVal;
          taxableIncome += bhxhVal;
        }
      }

      // 1.3 Lương hưu Đức (Gesetzliche Rentenversicherung)
      if (isRetired && hasGermanPension && plan.enableGermanPension !== false && plan.germanPensionDetails) {
        const g1 = plan.germanPensionDetails.spouse1 || {};
        const g2 = plan.germanPensionDetails.spouse2 || {};
        const g1Claim = Number(g1.claimAge) || 67;
        let g1Amt = 0;
        let g2Amt = 0;

        if (age >= g1Claim && window.TaxOptimizer && window.TaxOptimizer.calculateGermanPension) {
          const resG1 = window.TaxOptimizer.calculateGermanPension(g1.grossAnnualSalary || 45000, g1.yearsContributed || 35, g1Claim);
          g1Amt = resG1.totalAnnualPension;
        }

        if (plan.maritalStatus === 'married') {
          const g2Claim = Number(g2.claimAge) || 67;
          if (age >= g2Claim && window.TaxOptimizer && window.TaxOptimizer.calculateGermanPension) {
            const resG2 = window.TaxOptimizer.calculateGermanPension(g2.grossAnnualSalary || 38000, g2.yearsContributed || 35, g2Claim);
            g2Amt = resG2.totalAnnualPension;
          }
        }

        if (g1Amt > 0) {
          incomeBreakdown.push({
            name: plan.maritalStatus === 'married' ? 'Lương hưu Đức (Bạn)' : 'Lương hưu Đức',
            amount: g1Amt * cumInflation,
            monthly: (g1Amt * cumInflation) / 12
          });
        }
        if (g2Amt > 0) {
          incomeBreakdown.push({
            name: 'Lương hưu Đức (Bạn đời)',
            amount: g2Amt * cumInflation,
            monthly: (g2Amt * cumInflation) / 12
          });
        }
        const totalGermanEur = (g1Amt + g2Amt) * cumInflation;
        if (totalGermanEur > 0) {
          annualIncome += totalGermanEur;
          taxableIncome += totalGermanEur;
        }
      }

      // 1.4 Lương hưu Mỹ (Social Security Administration)
      if (isRetired && hasUsPension && plan.enableUsPension !== false && plan.usPensionDetails) {
        const u1 = plan.usPensionDetails.spouse1 || {};
        const u2 = plan.usPensionDetails.spouse2 || {};
        const u1Claim = Number(u1.claimAge) || 67;
        let u1Amt = 0;
        let u2Amt = 0;

        if (age >= u1Claim && window.TaxOptimizer && window.TaxOptimizer.calculateUsSocialSecurityPension) {
          const resU1 = window.TaxOptimizer.calculateUsSocialSecurityPension(u1.grossAnnualSalary || 65000, u1.yearsWorked || 35, u1Claim);
          u1Amt = resU1.totalAnnualPensionUsd;
        }

        if (plan.maritalStatus === 'married') {
          const u2Claim = Number(u2.claimAge) || 67;
          if (age >= u2Claim && window.TaxOptimizer && window.TaxOptimizer.calculateUsSocialSecurityPension) {
            const resU2 = window.TaxOptimizer.calculateUsSocialSecurityPension(u2.grossAnnualSalary || 55000, u2.yearsWorked || 35, u2Claim);
            u2Amt = resU2.totalAnnualPensionUsd;
          }
        }

        const usdToEurRate = 0.92;
        if (u1Amt > 0) {
          const u1Val = (plan.currency === 'USD') ? (u1Amt * cumInflation) : (u1Amt * cumInflation * usdToEurRate);
          incomeBreakdown.push({
            name: plan.maritalStatus === 'married' ? 'Lương hưu An sinh Mỹ (Bạn)' : 'Lương hưu An sinh Mỹ',
            amount: u1Val,
            monthly: u1Val / 12
          });
        }
        if (u2Amt > 0) {
          const u2Val = (plan.currency === 'USD') ? (u2Amt * cumInflation) : (u2Amt * cumInflation * usdToEurRate);
          incomeBreakdown.push({
            name: 'Lương hưu An sinh Mỹ (Bạn đời)',
            amount: u2Val,
            monthly: u2Val / 12
          });
        }

        const totalUsd = (u1Amt + u2Amt) * cumInflation;
        if (totalUsd > 0) {
          const usPensionVal = (plan.currency === 'USD') ? totalUsd : (totalUsd * usdToEurRate);
          annualIncome += usPensionVal;
          taxableIncome += usPensionVal;
        }
      }

      // 1.5 Lương hưu Nhật Bản (Kokumin & Kōsei Nenkin)
      if (isRetired && hasJapanPension && plan.enableJapanPension !== false && plan.japanPensionDetails) {
        const j1 = plan.japanPensionDetails.spouse1 || {};
        const j2 = plan.japanPensionDetails.spouse2 || {};
        const j1Claim = Number(j1.claimAge) || 65;
        let j1Amt = 0;
        let j2Amt = 0;

        if (age >= j1Claim && window.TaxOptimizer && window.TaxOptimizer.calculateJapanPension) {
          const resJ1 = window.TaxOptimizer.calculateJapanPension(j1.grossAnnualSalary || 4500000, j1.yearsContributed || 25, j1Claim);
          j1Amt = resJ1.totalAnnualPensionEur;
        }

        if (plan.maritalStatus === 'married') {
          const j2Claim = Number(j2.claimAge) || 65;
          if (age >= j2Claim && window.TaxOptimizer && window.TaxOptimizer.calculateJapanPension) {
            const resJ2 = window.TaxOptimizer.calculateJapanPension(j2.grossAnnualSalary || 3500000, j2.yearsContributed || 20, j2Claim);
            j2Amt = resJ2.totalAnnualPensionEur;
          }
        }

        const convJp = (plan.currency === 'EUR') ? 1 : (plan.currency === 'USD' ? 1 / 0.92 : (currentEurVndRate || 27500));
        if (j1Amt > 0) {
          const j1Val = (j1Amt * cumInflation) * convJp;
          incomeBreakdown.push({
            name: plan.maritalStatus === 'married' ? 'Lương hưu Nhật Bản (Bạn)' : 'Lương hưu Nhật Bản',
            amount: j1Val,
            monthly: j1Val / 12
          });
        }
        if (j2Amt > 0) {
          const j2Val = (j2Amt * cumInflation) * convJp;
          incomeBreakdown.push({
            name: 'Lương hưu Nhật Bản (Bạn đời)',
            amount: j2Val,
            monthly: j2Val / 12
          });
        }

        const totalJpEur = (j1Amt + j2Amt) * cumInflation;
        if (totalJpEur > 0) {
          const jpVal = (plan.currency === 'EUR') ? totalJpEur : (plan.currency === 'USD' ? totalJpEur / 0.92 : totalJpEur * (currentEurVndRate || 27500));
          annualIncome += jpVal;
          taxableIncome += jpVal;
        }
      }

      // 1.6 Lương hưu Canada (CPP & OAS)
      if (isRetired && hasCanadaPension && plan.enableCanadaPension !== false && plan.canadaPensionDetails) {
        const c1 = plan.canadaPensionDetails.spouse1 || {};
        const c2 = plan.canadaPensionDetails.spouse2 || {};
        const c1Claim = Number(c1.claimAge) || 65;
        let c1Amt = 0;
        let c2Amt = 0;

        if (age >= c1Claim && window.TaxOptimizer && window.TaxOptimizer.calculateCanadaPension) {
          const resC1 = window.TaxOptimizer.calculateCanadaPension(c1.grossAnnualSalary || 65000, c1.yearsContributed || 30, c1.yearsResident || 30, c1Claim);
          c1Amt = resC1.totalAnnualPensionEur;
        }

        if (plan.maritalStatus === 'married') {
          const c2Claim = Number(c2.claimAge) || 65;
          if (age >= c2Claim && window.TaxOptimizer && window.TaxOptimizer.calculateCanadaPension) {
            const resC2 = window.TaxOptimizer.calculateCanadaPension(c2.grossAnnualSalary || 50000, c2.yearsContributed || 25, c2.yearsResident || 25, c2Claim);
            c2Amt = resC2.totalAnnualPensionEur;
          }
        }

        const convCa = (plan.currency === 'EUR') ? 1 : (plan.currency === 'USD' ? 1 / 0.92 : (currentEurVndRate || 27500));
        if (c1Amt > 0) {
          const c1Val = (c1Amt * cumInflation) * convCa;
          incomeBreakdown.push({
            name: plan.maritalStatus === 'married' ? 'Lương hưu Canada (Bạn)' : 'Lương hưu Canada',
            amount: c1Val,
            monthly: c1Val / 12
          });
        }
        if (c2Amt > 0) {
          const c2Val = (c2Amt * cumInflation) * convCa;
          incomeBreakdown.push({
            name: 'Lương hưu Canada (Bạn đời)',
            amount: c2Val,
            monthly: c2Val / 12
          });
        }

        const totalCaEur = (c1Amt + c2Amt) * cumInflation;
        if (totalCaEur > 0) {
          const caVal = (plan.currency === 'EUR') ? totalCaEur : (plan.currency === 'USD' ? totalCaEur / 0.92 : totalCaEur * (currentEurVndRate || 27500));
          annualIncome += caVal;
          taxableIncome += caVal;
        }
      }

      // 1.7 Lương hưu Úc (Superannuation & Age Pension)
      if (isRetired && hasAustraliaPension && plan.enableAustraliaPension !== false && plan.australiaPensionDetails) {
        const a1 = plan.australiaPensionDetails.spouse1 || {};
        const a2 = plan.australiaPensionDetails.spouse2 || {};
        const a1Claim = Number(a1.claimAge) || 67;
        let a1Amt = 0;
        let a2Amt = 0;

        if (age >= a1Claim && window.TaxOptimizer && window.TaxOptimizer.calculateAustraliaPension) {
          const resA1 = window.TaxOptimizer.calculateAustraliaPension(a1.grossAnnualSalary || 85000, a1.yearsWorked || 25, a1.superBalance || 250000, a1Claim);
          a1Amt = resA1.totalAnnualPensionEur;
        }

        if (plan.maritalStatus === 'married') {
          const a2Claim = Number(a2.claimAge) || 67;
          if (age >= a2Claim && window.TaxOptimizer && window.TaxOptimizer.calculateAustraliaPension) {
            const resA2 = window.TaxOptimizer.calculateAustraliaPension(a2.grossAnnualSalary || 65000, a2.yearsWorked || 20, a2.superBalance || 180000, a2Claim);
            a2Amt = resA2.totalAnnualPensionEur;
          }
        }

        const convAu = (plan.currency === 'EUR') ? 1 : (plan.currency === 'USD' ? 1 / 0.92 : (currentEurVndRate || 27500));
        if (a1Amt > 0) {
          const a1Val = (a1Amt * cumInflation) * convAu;
          incomeBreakdown.push({
            name: plan.maritalStatus === 'married' ? 'Lương hưu Úc (Bạn)' : 'Lương hưu Úc',
            amount: a1Val,
            monthly: a1Val / 12
          });
        }
        if (a2Amt > 0) {
          const a2Val = (a2Amt * cumInflation) * convAu;
          incomeBreakdown.push({
            name: 'Lương hưu Úc (Bạn đời)',
            amount: a2Val,
            monthly: a2Val / 12
          });
        }

        const totalAuEur = (a1Amt + a2Amt) * cumInflation;
        if (totalAuEur > 0) {
          const auVal = (plan.currency === 'EUR') ? totalAuEur : (plan.currency === 'USD' ? totalAuEur / 0.92 : totalAuEur * (currentEurVndRate || 27500));
          annualIncome += auVal;
          taxableIncome += auVal;
        }
      }

      // 1.8 Lương hưu Hàn Quốc (NPS)
      if (isRetired && hasKoreaPension && plan.enableKoreaPension !== false && plan.koreaPensionDetails) {
        const k1 = plan.koreaPensionDetails.spouse1 || {};
        const k2 = plan.koreaPensionDetails.spouse2 || {};
        const k1Claim = Number(k1.claimAge) || 65;
        let k1Amt = 0;
        let k2Amt = 0;

        if (age >= k1Claim && window.TaxOptimizer && window.TaxOptimizer.calculateKoreaPension) {
          const resK1 = window.TaxOptimizer.calculateKoreaPension(k1.grossMonthlySalary || 3500000, k1.yearsContributed || 20, k1Claim);
          k1Amt = resK1.totalAnnualPensionEur;
        }

        if (plan.maritalStatus === 'married') {
          const k2Claim = Number(k2.claimAge) || 65;
          if (age >= k2Claim && window.TaxOptimizer && window.TaxOptimizer.calculateKoreaPension) {
            const resK2 = window.TaxOptimizer.calculateKoreaPension(k2.grossMonthlySalary || 2800000, k2.yearsContributed || 15, k2Claim);
            k2Amt = resK2.totalAnnualPensionEur;
          }
        }

        const convKr = (plan.currency === 'EUR') ? 1 : (plan.currency === 'USD' ? 1 / 0.92 : (currentEurVndRate || 27500));
        if (k1Amt > 0) {
          const k1Val = (k1Amt * cumInflation) * convKr;
          incomeBreakdown.push({
            name: plan.maritalStatus === 'married' ? 'Lương hưu Hàn Quốc (Bạn)' : 'Lương hưu Hàn Quốc',
            amount: k1Val,
            monthly: k1Val / 12
          });
        }
        if (k2Amt > 0) {
          const k2Val = (k2Amt * cumInflation) * convKr;
          incomeBreakdown.push({
            name: 'Lương hưu Hàn Quốc (Bạn đời)',
            amount: k2Val,
            monthly: k2Val / 12
          });
        }

        const totalKrEur = (k1Amt + k2Amt) * cumInflation;
        if (totalKrEur > 0) {
          const krVal = (plan.currency === 'EUR') ? totalKrEur : (plan.currency === 'USD' ? totalKrEur / 0.92 : totalKrEur * (currentEurVndRate || 27500));
          annualIncome += krVal;
          taxableIncome += krVal;
        }
      }

      // 1.9 Lương hưu Đài Loan (Labor Insurance & Labor Pension)
      if (isRetired && hasTaiwanPension && plan.enableTaiwanPension !== false && plan.taiwanPensionDetails) {
        const t1 = plan.taiwanPensionDetails.spouse1 || {};
        const t2 = plan.taiwanPensionDetails.spouse2 || {};
        const t1Claim = Number(t1.claimAge) || 65;
        let t1Amt = 0;
        let t2Amt = 0;

        if (age >= t1Claim && window.TaxOptimizer && window.TaxOptimizer.calculateTaiwanPension) {
          const resT1 = window.TaxOptimizer.calculateTaiwanPension(t1.insuredMonthlySalary || 45800, t1.yearsContributed || 20, t1Claim);
          t1Amt = resT1.totalAnnualPensionEur;
        }

        if (plan.maritalStatus === 'married') {
          const t2Claim = Number(t2.claimAge) || 65;
          if (age >= t2Claim && window.TaxOptimizer && window.TaxOptimizer.calculateTaiwanPension) {
            const resT2 = window.TaxOptimizer.calculateTaiwanPension(t2.insuredMonthlySalary || 36000, t2.yearsContributed || 15, t2Claim);
            t2Amt = resT2.totalAnnualPensionEur;
          }
        }

        const convTw = (plan.currency === 'EUR') ? 1 : (plan.currency === 'USD' ? 1 / 0.92 : (currentEurVndRate || 27500));
        if (t1Amt > 0) {
          const t1Val = (t1Amt * cumInflation) * convTw;
          incomeBreakdown.push({
            name: plan.maritalStatus === 'married' ? 'Lương hưu Đài Loan (Bạn)' : 'Lương hưu Đài Loan',
            amount: t1Val,
            monthly: t1Val / 12
          });
        }
        if (t2Amt > 0) {
          const t2Val = (t2Amt * cumInflation) * convTw;
          incomeBreakdown.push({
            name: 'Lương hưu Đài Loan (Bạn đời)',
            amount: t2Val,
            monthly: t2Val / 12
          });
        }

        const totalTwEur = (t1Amt + t2Amt) * cumInflation;
        if (totalTwEur > 0) {
          const twVal = (plan.currency === 'EUR') ? totalTwEur : (plan.currency === 'USD' ? totalTwEur / 0.92 : totalTwEur * (currentEurVndRate || 27500));
          annualIncome += twVal;
          taxableIncome += twVal;
        }
      }

      // 1.10 Tax Estimation using precise Progressive Tax Engine
      let estimatedTax = 0;
      const kidsCount = (plan.familyPlan && plan.familyPlan.enabled !== false) ? (Number(plan.familyPlan.kidsCount) || 0) : 0;
      if (window.TaxOptimizer && window.TaxOptimizer.calculateProgressiveTax) {
        estimatedTax = window.TaxOptimizer.calculateProgressiveTax(taxableIncome, plan.taxRegime || 'france_vietnam', {
          customTaxRate: plan.taxRate,
          currency: plan.currency || 'EUR',
          exchangeRateEurVnd: currentEurVndRate,
          maritalStatus: plan.maritalStatus || (isSingle ? 'single' : 'married'),
          kidsCount: kidsCount,
          taxParts: (plan.taxParts !== undefined && plan.taxParts !== null && Number(plan.taxParts) > 0) ? Number(plan.taxParts) : 0
        });
      } else {
        const effectiveTaxRate = (Number(plan.taxRate) || 12.0) / 100.0;
        estimatedTax = taxableIncome * effectiveTaxRate * 0.7;
      }
      totalTaxesPaid += estimatedTax;

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
      const childCostItems = [];
      if (plan.familyPlan && plan.familyPlan.enabled !== false && Number(plan.familyPlan.kidsCount) > 0) {
        const kCount = Number(plan.familyPlan.kidsCount) || 0;
        const curSimYear = (Number(plan.birthYear) || (new Date().getFullYear() - currentAge)) + age;
        const birthYears = [
          Number(plan.familyPlan.kid1Birth) || 2022,
          Number(plan.familyPlan.kid2Birth) || 2025,
          Number(plan.familyPlan.kid3Birth) || 2027,
          Number(plan.familyPlan.kid4Birth) || 2029
        ];
        const workCityKey = plan.workCity || 'fr_paris';
        const pppFactor = (window.TaxOptimizer && window.TaxOptimizer.COUNTRY_PPP_PROFILES && window.TaxOptimizer.COUNTRY_PPP_PROFILES[workCityKey])
          ? (Number(window.TaxOptimizer.COUNTRY_PPP_PROFILES[workCityKey].ppp) || 1.0)
          : 1.0;
        const kidCostMonthly = (Number(plan.familyPlan.kidCostMonthly) || 350) * pppFactor;
        const kidUniMonthly = (Number(plan.familyPlan.kidUniMonthly) || 900) * pppFactor;

        let grossChildCost = 0;
        let depCount = 0;
        for (let k = 0; k < Math.min(kCount, 4); k++) {
          const kAge = curSimYear - birthYears[k];
          if (kAge >= 0 && kAge < 18) {
            grossChildCost += kidCostMonthly * 12;
            childCostItems.push({
              name: `Nuôi con thứ ${k + 1} (0–18 tuổi)`,
              amount: kidCostMonthly * 12 * cumInflation,
              monthly: kidCostMonthly * cumInflation
            });
          } else if (kAge >= 18 && kAge <= 23) {
            grossChildCost += kidUniMonthly * 12;
            childCostItems.push({
              name: `Nuôi con thứ ${k + 1} (Đại học 18–23 tuổi)`,
              amount: kidUniMonthly * 12 * cumInflation,
              monthly: kidUniMonthly * cumInflation
            });
          }
          if (kAge >= 0 && kAge < 20) depCount++;
        }

        // Trợ cấp gia đình trực tiếp (Family Allowance / Kindergeld) theo quốc gia: Chuyển vào mục THU NHẬP
        let familyAllowanceMonthly = 0;
        if (plan.workCountry === 'FR') {
          if (depCount === 2) familyAllowanceMonthly = 148;
          else if (depCount === 3) familyAllowanceMonthly = 338;
          else if (depCount >= 4) familyAllowanceMonthly = 529;
        } else if (plan.workCountry === 'DE') {
          familyAllowanceMonthly = depCount * 250; // Kindergeld Đức
        } else if (plan.workCountry === 'BE') {
          familyAllowanceMonthly = depCount * 190; // Allocations Bỉ
        }

        if (familyAllowanceMonthly > 0 && depCount > 0) {
          const familyAllowanceAnnual = familyAllowanceMonthly * 12 * cumInflation;
          annualIncome += familyAllowanceAnnual;
          // Trợ cấp gia đình được miễn thuế TNCN nên không cộng vào taxableIncome
          incomeBreakdown.push({
            name: plan.workCountry === 'DE' ? 'Trợ cấp gia đình (Kindergeld)' : (plan.workCountry === 'BE' ? 'Trợ cấp gia đình (Allocations)' : 'Trợ cấp gia đình (CAF)'),
            amount: familyAllowanceAnnual,
            monthly: familyAllowanceMonthly * cumInflation
          });
        }

        // Chi phí nuôi con sinh hoạt thực tế (Chi tiêu)
        childLifecycleCostThisYear = grossChildCost * cumInflation;
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
            const isDebt = exp.isDebt === true || (/crédit|credit|vay|nợ|loan|prêt|pret|ngân hàng|trả góp|tra gop|leasing/i).test(exp.name || '');
            if (isDebt) {
              activeDebtsSum += expVal;
            }
          }
        });
      }

      let currentExpenses = 0;
      const expenseBreakdown = [];
      if (isRetired) {
        // Base living expenses in retirement (Phương án 1: Số tiền nhập vào đã là chi tiêu thực tế tại địa điểm đã chọn)
        const enableRetireExp = plan.enableRetirementExpense !== false;
        const baseRetireLiving = enableRetireExp ? ((baseRetireExpenses * spendingFactor) * cumInflation) : 0;
        if (enableRetireExp && baseRetireLiving > 0) {
          expenseBreakdown.push({
            name: 'Chi tiêu/tháng khi về hưu',
            amount: baseRetireLiving,
            monthly: baseRetireLiving / 12
          });
        }
        if (seniorCareCost > 0) {
          const careVal = seniorCareCost * cumInflation;
          expenseBreakdown.push({
            name: 'Chăm sóc tuổi già (EHPAD/Y tế)',
            amount: careVal,
            monthly: careVal / 12
          });
        }
        let activeCustomExpensesSum = 0;
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
              if (expVal > 0) {
                activeCustomExpensesSum += expVal;
                expenseBreakdown.push({
                  name: exp.name || 'Chi tiêu',
                  amount: expVal,
                  monthly: expVal / 12
                });
              } else if (expVal < 0) {
                const posVal = Math.abs(expVal);
                annualIncome += posVal;
                incomeBreakdown.push({
                  name: exp.name || 'Khoản thu hoàn lại',
                  amount: posVal,
                  monthly: posVal / 12
                });
              }
            }
          });
        }
        childCostItems.forEach(ci => expenseBreakdown.push(ci));
        realEstateExpenseItems.forEach(ri => expenseBreakdown.push(ri));
        bhxhExpenseItems.forEach(bi => expenseBreakdown.push(bi));

        const baseRetire = baseRetireLiving + (seniorCareCost * cumInflation);
        currentExpenses = baseRetire + activeCustomExpensesSum + childLifecycleCostThisYear + realEstateDeficitThisYear + bhxhContributionThisYear;
      } else {
        // Accumulation phase: Base living expenses (from savings rate or annualExpenses) + Active custom expenses & debts
        let baseAccum = 0;
        if (annualIncome > 0 && plan.savingsRate !== undefined && plan.savingsRate !== null && Number(plan.savingsRate) > 0) {
          const rate = Number(plan.savingsRate) / 100.0;
          const incomeAfterTax = Math.max(0, annualIncome - estimatedTax);
          baseAccum = incomeAfterTax * (1.0 - rate);
        } else {
          baseAccum = (Number(plan.annualExpenses) || 0) * cumInflation;
        }

        if (baseAccum > 0) {
          expenseBreakdown.push({
            name: 'Chi tiêu sinh hoạt cơ bản',
            amount: baseAccum,
            monthly: baseAccum / 12
          });
        }

        let customAccumExpensesSum = 0;
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
              if (expVal > 0) {
                customAccumExpensesSum += expVal;
                expenseBreakdown.push({
                  name: exp.name || 'Chi tiêu',
                  amount: expVal,
                  monthly: expVal / 12
                });
              } else if (expVal < 0) {
                const posVal = Math.abs(expVal);
                annualIncome += posVal;
                incomeBreakdown.push({
                  name: exp.name || 'Khoản thu hoàn lại',
                  amount: posVal,
                  monthly: posVal / 12
                });
              }
            }
          });
        }

        childCostItems.forEach(ci => expenseBreakdown.push(ci));
        realEstateExpenseItems.forEach(ri => expenseBreakdown.push(ri));
        bhxhExpenseItems.forEach(bi => expenseBreakdown.push(bi));
        currentExpenses = baseAccum + customAccumExpensesSum + childLifecycleCostThisYear + realEstateDeficitThisYear + bhxhContributionThisYear;
      }

      // Apply Scenario Overrides (Market crash, High inflation, Medical Shock, Downsizing)
      let scenarioReturnModifier = 0.0;
      if (overrideScenario) {
        if (overrideScenario === 'market_crash' && (age === retireAge || age === retireAge + 1)) {
          scenarioReturnModifier = -0.35; // -35% crash in early retirement
        } else if (overrideScenario === 'high_inflation' && (age >= retireAge && age < retireAge + 5)) {
          currentExpenses *= 1.30; // 30% jump in expenses
          expenseBreakdown.forEach(eb => {
            eb.amount *= 1.30;
            eb.monthly *= 1.30;
          });
        } else if (overrideScenario === 'medical_shock' && (age === 65 || (age === retireAge && retireAge > 65))) {
          const fx = currentEurVndRate || 27500;
          const medicalShockAmt = 500_000_000 / fx; // 500tr VND (~18k EUR)
          currentExpenses += medicalShockAmt;
          expenseBreakdown.push({
            name: 'Cú sốc chi phí y tế đột xuất (Tuổi 65)',
            amount: medicalShockAmt,
            monthly: medicalShockAmt / 12
          });
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



      // 4. Withdrawal / Savings Cash Flow
      let netSavingsOrWithdrawal = 0;
      let withdrawalAmount = 0;
      let actualWithdrawal = 0;
      let returnRate = isRetired ? returnPost : returnPre;
      returnRate += scenarioReturnModifier;

      const displayPortfolio = portfolio;

      if (!isRetired) {
        // Accumulation phase: Net Savings and Expenses
        const incomeAfterTax = Math.max(0, annualIncome - estimatedTax);
        if (hasExpenseStreams && activeExpenseStreamsSum > 0) {
          // Realistic cashflow: Income After Tax minus Actual Expense Streams, Debts, Real Estate Deficits & BHXH Contributions
          netSavingsOrWithdrawal = incomeAfterTax - currentExpenses;
        } else if (annualIncome > 0) {
          if (plan.savingsRate !== undefined && plan.savingsRate !== null && Number(plan.savingsRate) > 0) {
            const rate = Number(plan.savingsRate) / 100.0;
            currentExpenses = (incomeAfterTax * (1.0 - rate)) + childLifecycleCostThisYear + realEstateDeficitThisYear + bhxhContributionThisYear;
            netSavingsOrWithdrawal = incomeAfterTax - currentExpenses;
          } else {
            const cashflowSavings = incomeAfterTax - currentExpenses;
            netSavingsOrWithdrawal = (plan.annualSavings !== undefined && plan.annualSavings !== null && !isNaN(Number(plan.annualSavings)) && Number(plan.annualSavings) > 0)
              ? Math.max(cashflowSavings, (annualSavings * cumInflation) - realEstateDeficitThisYear - bhxhContributionThisYear)
              : cashflowSavings;
          }
        } else {
          netSavingsOrWithdrawal = (annualSavings > 0 ? (annualSavings * cumInflation) : 0) - currentExpenses;
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
        const deficit = Math.max(0, currentExpenses - incomeAfterTax);

        if (isStrategyActive) {
          // Khi BẬT chiến lược rút tiền:
          // Danh mục rút theo quy tắc chiến lược đã chọn (Bengen 4%, Guyton-Klinger, VPW, Fixed %)
          // 1. Nếu BẬT Smart Cap (mặc định):
          //    - Khi thâm hụt sinh hoạt (deficit) nhỏ hơn mức rút chiến lược: chỉ rút đúng deficit để không rút cạn danh mục ảo khi đã có lương hưu trợ lực.
          //    - Khi thâm hụt sinh hoạt lớn hơn mức rút chiến lược: áp dụng trần an toàn của chiến lược để bảo vệ danh mục không bị lạm rút.
          // 2. Nếu TẮT Smart Cap (chế độ rút cố định truyền thống):
          //    - Luôn ép rút tối thiểu theo mức SWR của chiến lược bất kể có cần tiêu hết hay không.
          const isSmartCap = plan.smartWithdrawalCap !== false;
          // 1. Khi BẬT Smart Cap (mặc định):
          //    Danh mục rút đúng bằng phần thiếu hụt sinh hoạt thực tế (deficit) sau khi đã trừ lương hưu/thu nhập khác.
          //    Không bao giờ ép rút thừa theo tỷ lệ SWR, đảm bảo đủ tiền sống và bảo toàn tối đa danh mục.
          // 2. Khi TẮT Smart Cap (chế độ truyền thống):
          //    Luôn ép rút tối thiểu theo tỷ lệ SWR của chiến lược (Math.max(withdrawalAmount, deficit)).
          const targetWithdrawal = isSmartCap
            ? deficit
            : Math.max(withdrawalAmount, deficit);
          actualWithdrawal = Math.max(0, Math.min(portfolio, targetWithdrawal));

          // Dòng tiền ròng tác động lên danh mục:
          // Tiền vào: thặng dư thu nhập ngoài nếu có (Math.max(0, incomeAfterTax - currentExpenses))
          // Tiền ra: actualWithdrawal
          const externalSurplus = Math.max(0, incomeAfterTax - currentExpenses);
          netSavingsOrWithdrawal = externalSurplus - actualWithdrawal;
          portfolio = Math.max(0, (portfolio + netSavingsOrWithdrawal) * (1.0 + returnRate));

          // Tax-Efficient French Account Withdrawal Waterfall
          if (frenchAccs && actualWithdrawal > 0 && window.TaxOptimizer && window.TaxOptimizer.simulateWithdrawalWaterfall) {
            const wf = window.TaxOptimizer.simulateWithdrawalWaterfall(frenchAccs, actualWithdrawal, true);
            frenchAccs = wf.remainingBalances;
            totalWaterfallTaxSaved += wf.taxSavedVsPFU;
          }
        } else {
          // Khi TẮT chiến lược rút tiền: KHÔNG rút vốn từ danh mục đầu tư
          // Người về hưu chỉ sống bằng nguồn thu nhập ngoài (lương hưu, cổ tức, thụ động)
          // Danh mục đầu tư được giữ nguyên vẹn để tiếp tục sinh lời
          actualWithdrawal = 0;
          if (incomeAfterTax >= currentExpenses) {
            const surplus = incomeAfterTax - currentExpenses;
            portfolio = (portfolio + surplus) * (1.0 + returnRate);
            netSavingsOrWithdrawal = surplus;
          } else {
            // Không rút tiền từ danh mục, số dư vẫn sinh lời bình thường
            portfolio = portfolio * (1.0 + returnRate);
            netSavingsOrWithdrawal = 0;
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
        incomeBreakdown,
        expenseBreakdown,
        withdrawal: actualWithdrawal,
        totalAvailableCash: isRetired ? (annualIncome + actualWithdrawal) : annualIncome,
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

    // Key metrics calculations: Chuẩn hóa theo 3 Trụ Cột Đạt Tự Do Tài Chính
    const finalPortfolio = timeline[timeline.length - 1].portfolioEnd;
    
    // 1. Tiền cần bù đắp mỗi năm = Chi tiêu hưu − Lương hưu − Thu nhập thụ động
    const ssAge = Number(plan.socialSecurityAge) || 64;
    let passiveAtRetireNow = 0;
    if (retireAge >= ssAge) {
      passiveAtRetireNow += Number(plan.socialSecurityAnnual) || 0;
    }
    if (Array.isArray(plan.incomes)) {
      plan.incomes.forEach(inc => {
        if (inc.enabled === false) return;
        if (isRealEstateIncomeStream(inc) && plan.lmnpEnabled === false) return;
        const sAge = Number(inc.startAge) || currentAge;
        const eAge = Number(inc.endAge) || lifeExpectancy;
        const name = (inc.name || "").toLowerCase();
        const isSalary = !inc.isBhxhVn && (inc.isSalary || (/lương|salary|impôt|impot/i).test(inc.name || "") || (sAge < retireAge && eAge <= retireAge));
        if (!isSalary && retireAge >= sAge && retireAge <= eAge) {
          const incAmt = Number(inc.amount) || 0;
          if (incAmt > 0) {
            passiveAtRetireNow += incAmt;
          }
        }
      });
    }
    const netDeficitNow = Math.max(0, baseRetireExpenses - passiveAtRetireNow);
    const horizonNow = Math.max(1, lifeExpectancy - retireAge);
    const safetyMultNow = horizonNow > 35 ? 30 : (horizonNow > 30 ? 28 : 25);
    const fireTargetNestEgg = Math.round(netDeficitNow > 0 ? (netDeficitNow * safetyMultNow) : (baseRetireExpenses * 10));

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

    // Tính Tuổi Nghỉ Hưu Tối Ưu / Tuổi Gợi Ý (Đáp ứng trọn vẹn TẤT CẢ các điều kiện)
    let optimalFireAge = null;
    if (!overrideScenario && !skipStressResilience && !skipOptimalSearch) {
      optimalFireAge = findOptimalRetirementAge(plan, fireAge);
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

    // Stress Resilience Evaluation (3 Worst-case Shocks)
    let stressResilience = null;
    if (!skipStressResilience && !overrideScenario) {
      stressResilience = evaluateStressResilience(plan);
      if (stressResilience && stressResilience.isBulletproof) {
        score = Math.min(99, score + 5);
      }
    }

    return {
      timeline,
      yearlyData: timeline,
      currentAge,
      retireAge,
      lifeExpectancy,
      peakNetWorth,
      peakAge,
      fireAge: fireAge,
      optimalFireAge: optimalFireAge,
      milestones,
      finalPortfolio,
      finalTotalNetWorth: timeline[timeline.length - 1].totalNetWorth,
      fireTargetNestEgg,
      safetyMultiplier: safetyMultNow,
      safeAnnualSpend,
      yearsToFIRE,
      totalTaxesPaid,
      totalLifetimeIncome,
      totalLifetimeExpenses,
      readinessScore: score,
      survived: finalPortfolio > 0,
      meetsLegacy: finalPortfolio >= targetLegacy,
      targetLegacy,
      mortgageSchedule,
      weightedReturnPre,
      weightedReturnPost,
      birthYear,
      currentCalendarYear,
      totalWaterfallTaxSaved,
      stressResilience,
      isSingleCountry,
      maritalStatus: plan.maritalStatus || 'single'
    };
  }

  return {
    formatCurrency,
    getCurrencySymbol,
    calculateWeightedReturn,
    calculateMortgageSchedule,
    computePropertyValue,
    evaluateStressResilience,
    findOptimalRetirementAge,
    runProjection
  };
})();
