/**
 * pyRetrait — What-If Scenarios & Stress Test Manager
 */

window.ScenarioManager = (function() {
  'use strict';

  const SCENARIO_DESCRIPTIONS = {
    baseline: {
      title: "Kịch bản Cơ sở",
      desc: "Điều kiện kinh tế bình thường, lạm phát và lợi nhuận diễn biến theo kỳ vọng lịch sử.",
      assessment: "Kế hoạch diễn ra suôn sẻ, dòng tiền thặng dư dồi dào và vượt qua mọi mục tiêu tài chính."
    },
    market_crash: {
      title: "Khủng hoảng Thị trường Sớm (-35% Năm 1 & 2)",
      desc: "Danh mục đầu tư bị tổn thất (-35% trong 2 năm đầu nghỉ hưu) nhưng mức chi tiêu sinh hoạt không bị ảnh hưởng. Tuy nhiên nếu danh mục thanh khoản cạn kiệt, bạn sẽ không còn tiền mặt để rút bù đắp chi tiêu.",
      assessment: "Với cơ chế chỉ rút vốn bù đắp phần thiếu hụt chi tiêu thực tế, bạn chỉ rút đúng số tiền cần dùng. Nếu duy trì thêm đệm tiền mặt dự phòng 2–3 năm, bạn sẽ không bao giờ rơi vào thế bị động khi thị trường sụt giảm."
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
