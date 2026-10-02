/**
 * pyRetrait — What-If Scenarios & Stress Test Manager
 */

window.ScenarioManager = (function() {
  'use strict';

  const SCENARIO_DESCRIPTIONS = {
    baseline: {
      title: "Kịch bản Cơ sở (Baseline Scenario)",
      desc: "Điều kiện kinh tế bình thường, lạm phát và lợi nhuận diễn biến theo kỳ vọng lịch sử.",
      assessment: "Kế hoạch diễn ra suôn sẻ, dòng tiền thặng dư dồi dào và vượt qua mọi mục tiêu tài chính."
    },
    market_crash: {
      title: "Khủng hoảng Thị trường Sớm (-35% Năm 1 & 2)",
      desc: "Mô phỏng rủi ro trình tự lợi nhuận (Sequence of Returns Risk): thị trường chứng khoán sụt giảm mạnh ngay sau khi bạn vừa thôi việc.",
      assessment: "Nếu sử dụng chiến lược Guyton-Klinger với quỹ dự phòng tiền mặt 2 năm, bạn sẽ không phải bán tháo tài sản khi thị trường chạm đáy và kế hoạch vẫn an toàn."
    },
    high_inflation: {
      title: "Lạm phát Phi mã (Bão giá trong 5 năm đầu)",
      desc: "Chi phí sinh hoạt tăng vọt 30% liên tục trong 5 năm do bất ổn vĩ mô hoặc chuỗi cung ứng.",
      assessment: "Cần chú ý điều chỉnh chi tiêu linh hoạt (chuyển sang pha Slow-Go sớm hơn) để bảo vệ số dư danh mục không bị suy giảm quá nhanh."
    },
    medical_shock: {
      title: "Cú sốc Chi phí Y tế Đột xuất (Tuổi 65)",
      desc: "Phát sinh một khoản viện phí / y tế đặc biệt quy mô lớn ngoài bảo hiểm cơ bản.",
      assessment: "Với quy mô tài sản tích lũy, cú sốc này chỉ làm giảm nhẹ di sản để lại và hoàn toàn không làm gián đoạn dòng tiền sinh hoạt."
    },
    downsizing: {
      title: "Thu gọn Bất động sản / Bán bớt Nhà (Tuổi 60)",
      desc: "Bán nhà lớn ở trung tâm để chuyển về căn hộ nhỏ hơn hoặc vùng ven, thu hồi dòng vốn lớn tái đầu tư sinh lời.",
      assessment: "Gia tăng mạnh mẽ số dư thanh khoản và giúp đẩy tỷ lệ sống sót của danh mục lên mức tuyệt đối 100%."
    }
  };

  function evaluateScenario(plan, scenarioKey) {
    const baselineProjection = window.RetirementEngine.runProjection(plan, null);
    const stressProjection = window.RetirementEngine.runProjection(plan, scenarioKey);
    const meta = SCENARIO_DESCRIPTIONS[scenarioKey] || SCENARIO_DESCRIPTIONS.baseline;

    const netWorthDiff = stressProjection.finalPortfolio - baselineProjection.finalPortfolio;

    return {
      scenarioKey,
      meta,
      baselineProjection,
      stressProjection,
      netWorthDiff
    };
  }

  function compareTwoPlans(planA, planB) {
    const projA = window.RetirementEngine.runProjection(planA);
    const projB = window.RetirementEngine.runProjection(planB);

    return {
      planA: {
        name: planA.name,
        retireAge: planA.retirementAge,
        peakNetWorth: projA.peakNetWorth,
        finalPortfolio: projA.finalPortfolio,
        yearsToFIRE: projA.yearsToFIRE,
        safeAnnualSpend: projA.safeAnnualSpend,
        fireScore: projA.readinessScore,
        survived: projA.survived
      },
      planB: {
        name: planB.name,
        retireAge: planB.retirementAge,
        peakNetWorth: projB.peakNetWorth,
        finalPortfolio: projB.finalPortfolio,
        yearsToFIRE: projB.yearsToFIRE,
        safeAnnualSpend: projB.safeAnnualSpend,
        fireScore: projB.readinessScore,
        survived: projB.survived
      }
    };
  }

  return {
    evaluateScenario,
    compareTwoPlans,
    SCENARIO_DESCRIPTIONS
  };
})();
