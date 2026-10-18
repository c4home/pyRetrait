/**
 * pyRetrait — Tầng 3: Giao Diện Tab 2 — Sức Khỏe, Gia Đình & Y Tế Dự Phòng (ui-tab2-health.js)
 * Quản lý tính toán Tuổi sinh học (Biological Age), Điểm Sống khỏe (Healthspan),
 * Dự phòng chăm sóc tuổi già (78t+), Kế hoạch Con cái & Gia đình, Tiến độ Di sản & Checklist Y tế Pháp - VN.
 */

(function() {
  'use strict';

  // Shared State & Helpers Bridge (Tầng 2 & Tầng 3)
  const state = (window.AppState && window.AppState.state) || window.__pyRetraitFallbackState;
  const STORAGE_KEY = (window.AppState && window.AppState.STORAGE_KEY) || "pyRetrait_plans_v2";

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  function parseVal(id, fallback = 0) {
    const el = document.getElementById(id);
    if (!el) return fallback;
    const v = parseFloat(el.value);
    return isNaN(v) ? fallback : v;
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined && val !== null) el.value = val;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const ageAxisTicks = () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    return {
      color: isLight ? '#475569' : '#94a3b8',
      font: { size: 9, family: 'Inter, sans-serif' },
      maxRotation: 0,
      minRotation: 0,
      autoSkip: true,
      autoSkipPadding: 4
    };
  };

  function getActivePlan() {
    if (window.AppState && typeof window.AppState.getActivePlan === 'function') {
      return window.AppState.getActivePlan();
    }
    const plan = state.plansData.plans[state.plansData.activePlanId];
    return plan || Object.values(state.plansData.plans)[0];
  }

  function savePlansToStorage(immediateCloud = true) {
    if (window.AppState && typeof window.AppState.savePlansToStorage === 'function') {
      return window.AppState.savePlansToStorage(immediateCloud);
    }
    if (state.plansData) {
      state.plansData.updatedAt = Date.now();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plansData));
  }

  function debouncedSavePlansToStorage() {
    if (window.AppState && typeof window.AppState.debouncedSavePlansToStorage === 'function') {
      return window.AppState.debouncedSavePlansToStorage();
    }
    savePlansToStorage(false);
  }


  function getCurrency() {
    if (window.AppState && typeof window.AppState.getCurrency === 'function') {
      return window.AppState.getCurrency();
    }
    return state.currency || 'EUR';
  }

  // Quản lý thành viên đang xem trong Tab Sức Khỏe ('primary' = Bạn, 'spouse' = Bạn đời)
  let activeHealthMember = 'primary';

  function ensureHealthProfiles(plan) {
    if (!plan || typeof plan !== 'object') return;
    if (!plan.healthProfiles) {
      plan.healthProfiles = {
        primary: {
          habits: [true, true, true, false, true],
          biomarkers: { rhr: 'good', bp: 'optimal', whtr: 'optimal', strength: 'high' }
        },
        spouse: {
          habits: [true, true, true, false, true],
          biomarkers: { rhr: 'good', bp: 'optimal', whtr: 'optimal', strength: 'high' }
        }
      };
    }
    if (!plan.healthProfiles.primary) {
      plan.healthProfiles.primary = {
        habits: [true, true, true, false, true],
        biomarkers: { rhr: 'good', bp: 'optimal', whtr: 'optimal', strength: 'high' }
      };
    }
    if (!plan.healthProfiles.spouse) {
      plan.healthProfiles.spouse = {
        habits: [true, true, true, false, true],
        biomarkers: { rhr: 'good', bp: 'optimal', whtr: 'optimal', strength: 'high' }
      };
    }
  }

  function saveCurrentHealthInputs(plan) {
    if (!plan) plan = getActivePlan();
    if (!plan) return;
    ensureHealthProfiles(plan);

    const habits = [
      document.getElementById("chk-habit-exercise")?.checked ?? true,
      document.getElementById("chk-habit-sleep")?.checked ?? true,
      document.getElementById("chk-habit-diet")?.checked ?? true,
      document.getElementById("chk-habit-checkup")?.checked ?? false,
      document.getElementById("chk-habit-social")?.checked ?? true
    ];
    const biomarkers = {
      rhr: document.getElementById("sel-bio-rhr")?.value || "good",
      bp: document.getElementById("sel-bio-bp")?.value || "optimal",
      whtr: document.getElementById("sel-bio-whtr")?.value || "optimal",
      strength: document.getElementById("sel-bio-strength")?.value || "high"
    };

    plan.healthProfiles[activeHealthMember] = { habits, biomarkers };
  }

  function loadHealthMemberInputs(plan, member = 'primary') {
    if (!plan) plan = getActivePlan();
    if (!plan) return;
    ensureHealthProfiles(plan);

    const profile = plan.healthProfiles[member] || {};
    const habits = profile.habits || [true, true, true, false, true];
    ['chk-habit-exercise', 'chk-habit-sleep', 'chk-habit-diet', 'chk-habit-checkup', 'chk-habit-social'].forEach((id, idx) => {
      const el = document.getElementById(id);
      if (el && habits[idx] !== undefined) el.checked = Boolean(habits[idx]);
    });

    const bios = profile.biomarkers || {};
    const selRhr = document.getElementById("sel-bio-rhr");
    const selBp = document.getElementById("sel-bio-bp");
    const selWhtr = document.getElementById("sel-bio-whtr");
    const selStrength = document.getElementById("sel-bio-strength");
    if (selRhr && bios.rhr) selRhr.value = bios.rhr;
    if (selBp && bios.bp) selBp.value = bios.bp;
    if (selWhtr && bios.whtr) selWhtr.value = bios.whtr;
    if (selStrength && bios.strength) selStrength.value = bios.strength;

    const userGender = plan.gender || 'male';
    const memberGender = (member === 'primary') ? userGender : (userGender === 'female' ? 'male' : 'female');
    updateBiomarkersForGender(memberGender);
  }

  function calculateMemberMetrics(plan, member = 'primary') {
    if (!plan) plan = getActivePlan();
    ensureHealthProfiles(plan);

    const isPrimary = (member === 'primary');
    const curYear = new Date().getFullYear();
    const currentAge = isPrimary
      ? (Number(plan?.currentAge) || 29)
      : (curYear - (Number(plan?.spouseBirthYear) || (curYear - (Number(plan?.spouseAge) || Number(plan?.currentAge) || 29))));
    const userGender = plan?.gender || 'male';
    const memberGender = isPrimary ? userGender : (userGender === 'female' ? 'male' : 'female');
    const isFemale = (memberGender === 'female');
    const lifeExp = isPrimary
      ? (Number(plan?.lifeExpectancy) || (isFemale ? 85 : 82))
      : (isFemale ? 85 : 82);

    const profile = plan?.healthProfiles?.[member] || {};
    const habits = profile.habits || [true, true, true, false, true];
    const bios = profile.biomarkers || { rhr: 'good', bp: 'optimal', whtr: 'optimal', strength: 'high' };

    const parseBioVal = (val, type) => {
      switch (val) {
        case "optimal": return -1.5;
        case "good": return 0;
        case "average": return type === "strength" ? 0 : 1.0;
        case "poor": return 2.5;
        case "elevated": return 0.5;
        case "stage1": return 1.5;
        case "stage2": return 3.0;
        case "moderate": return 1.0;
        case "high": return type === "strength" ? -1.5 : 2.5;
        case "low": return 2.0;
        default: return 0;
      }
    };

    const delta = Math.round((parseBioVal(bios.rhr, 'rhr') + parseBioVal(bios.bp, 'bp') + parseBioVal(bios.whtr, 'whtr') + parseBioVal(bios.strength, 'strength')) * 10) / 10;
    const bioAge = Math.max(18, Math.round((currentAge + delta) * 10) / 10);
    const habitCount = habits.filter(Boolean).length;
    const score = habitCount * 20;

    const habitBonus = (habitCount - 2.5) * 1.5;
    const bioBonus = -delta * 0.5;
    const baselineHealthAge = Math.min(lifeExp - 3, Math.max(currentAge + 8, Math.round(74 + habitBonus + bioBonus)));
    const estimatedHealthspan = Math.min(lifeExp - 2, Math.max(currentAge + 5, baselineHealthAge));
    const gapYears = Math.max(1, lifeExp - estimatedHealthspan);

    return {
      currentAge,
      lifeExpectancy: lifeExp,
      memberGender,
      isFemale,
      delta,
      bioAge,
      habitCount,
      score,
      estimatedHealthspan,
      gapYears
    };
  }

  /**
   * Tính toán tuổi sinh học dựa trên 4 chỉ số sinh học đời thường
   */
  function updateBioAge() {
    const plan = getActivePlan();
    const isPrimary = (activeHealthMember === 'primary');
    const curYear = new Date().getFullYear();
    const currentAge = isPrimary
      ? (plan ? Number(plan.currentAge) || 29 : 29)
      : (curYear - (Number(plan?.spouseBirthYear) || (curYear - (Number(plan?.spouseAge) || Number(plan?.currentAge) || 29))));
    const userGender = plan?.gender || 'male';
    const memberGender = isPrimary ? userGender : (userGender === 'female' ? 'male' : 'female');
    const isFemale = (memberGender === 'female');
    const lifeExpectancy = isPrimary
      ? (plan ? Number(plan.lifeExpectancy) || (isFemale ? 85 : 82) : (isFemale ? 85 : 82))
      : (isFemale ? 85 : 82);

    // Helper map giá trị sinh học an toàn
    const parseBioVal = (val, type) => {
      const num = parseFloat(val);
      if (!isNaN(num)) return num;
      switch (val) {
        case "optimal": return -1.5;
        case "good": return 0;
        case "average": return type === "strength" ? 0 : 1.0;
        case "poor": return 2.5;
        case "elevated": return 0.5;
        case "stage1": return 1.5;
        case "stage2": return 3.0;
        case "moderate": return 1.0;
        case "high": return type === "strength" ? -1.5 : 2.5;
        case "low": return 2.0;
        default: return 0;
      }
    };

    const rhrVal = document.getElementById("sel-bio-rhr")?.value || "good";
    const bpVal = document.getElementById("sel-bio-bp")?.value || "optimal";
    const whtrVal = document.getElementById("sel-bio-whtr")?.value || "optimal";
    const strengthVal = document.getElementById("sel-bio-strength")?.value || "high";

    const rhr = parseBioVal(rhrVal, "rhr");
    const bp = parseBioVal(bpVal, "bp");
    const whtr = parseBioVal(whtrVal, "whtr");
    const strength = parseBioVal(strengthVal, "strength");

    const delta = Math.round((rhr + bp + whtr + strength) * 10) / 10;
    const bioAge = Math.max(18, Math.round((currentAge + delta) * 10) / 10);

    const lblBioNum = document.getElementById("lbl-bio-age-num");
    const lblBioBase = document.getElementById("lbl-bio-age-base");
    const lblBioDiff = document.getElementById("lbl-bio-age-diff");

    if (lblBioNum) lblBioNum.innerText = bioAge;
    if (lblBioBase) lblBioBase.innerText = `Tuổi thực tế: ${currentAge} tuổi`;

    if (lblBioDiff) {
      if (delta < 0) {
        lblBioDiff.className = "badge badge-success font-semibold";
        lblBioDiff.innerText = `Trẻ hơn ${Math.abs(delta)} tuổi`;
      } else if (delta === 0) {
        lblBioDiff.className = "badge badge-info font-semibold";
        lblBioDiff.innerText = `Tương đương tuổi thực tế`;
      } else {
        lblBioDiff.className = "badge badge-danger font-semibold";
        lblBioDiff.innerText = `Già hơn ${delta} tuổi`;
      }
    }

    return { bioAge, delta, currentAge, lifeExpectancy };
  }

  /**
   * Tính toán điểm số Healthspan và biểu đồ trực quan hóa thanh khoảng cách sống khỏe vs suy giảm
   */
  function updateHealthspanScore() {
    const habits = [
      document.getElementById("chk-habit-exercise")?.checked,
      document.getElementById("chk-habit-sleep")?.checked,
      document.getElementById("chk-habit-diet")?.checked,
      document.getElementById("chk-habit-checkup")?.checked,
      document.getElementById("chk-habit-social")?.checked
    ];
    const habitCount = habits.filter(Boolean).length;
    const score = habitCount * 20;

    const lblScore = document.getElementById("lbl-healthspan-score");
    if (lblScore) lblScore.innerText = score;

    const barFill = document.getElementById("bar-healthspan-fill");
    if (barFill) barFill.style.width = `${score}%`;

    const lblGrade = document.getElementById("lbl-healthspan-grade");
    const lblEstimate = document.getElementById("lbl-healthspan-estimate");

    // Lấy tuổi sinh học và thông số tuổi
    const bioInfo = updateBioAge();
    const currentAge = bioInfo.currentAge;
    const lifeExpectancy = bioInfo.lifeExpectancy;

    // Tính toán số năm sống khỏe (Healthspan)
    const habitBonus = (habitCount - 2.5) * 1.5;
    const bioBonus = -bioInfo.delta * 0.5;
    const baselineHealthAge = Math.min(lifeExpectancy - 3, Math.max(currentAge + 8, Math.round(74 + habitBonus + bioBonus)));
    const estimatedHealthspan = Math.min(lifeExpectancy - 2, Math.max(currentAge + 5, baselineHealthAge));

    const lblHealthspanTarget = document.getElementById("lbl-healthspan-target");
    if (lblHealthspanTarget) lblHealthspanTarget.innerText = estimatedHealthspan;

    const lblLifespanBase = document.getElementById("lbl-lifespan-base");
    if (lblLifespanBase) lblLifespanBase.innerText = `Kỳ vọng sống: ${lifeExpectancy} tuổi`;

    if (lblGrade && lblEstimate) {
      if (score >= 80) {
        lblGrade.className = "badge badge-success font-semibold";
        lblGrade.innerText = `Tuyệt Vời (+5.5 năm khỏe)`;
        lblEstimate.innerText = `Healthspan dự kiến: ${estimatedHealthspan - 2}–${estimatedHealthspan + 2} tuổi`;
      } else if (score >= 60) {
        lblGrade.className = "badge badge-info font-semibold";
        lblGrade.innerText = `Khá Tốt (+3.0 năm khỏe)`;
        lblEstimate.innerText = `Healthspan dự kiến: ${estimatedHealthspan - 2}–${estimatedHealthspan + 1} tuổi`;
      } else if (score >= 40) {
        lblGrade.className = "badge badge-warning font-semibold";
        lblGrade.innerText = `Trung Bình (+1.5 năm khỏe)`;
        lblEstimate.innerText = `Healthspan dự kiến: ${estimatedHealthspan - 2}–${estimatedHealthspan} tuổi`;
      } else {
        lblGrade.className = "badge badge-danger font-semibold";
        lblGrade.innerText = `Cần Cải Thiện Sớm`;
        lblEstimate.innerText = `Healthspan dự kiến: < ${estimatedHealthspan} tuổi`;
      }
    }

    // Cập nhật Healthspan vs Lifespan Gap Visualizer
    const gapYears = Math.max(1, lifeExpectancy - estimatedHealthspan);
    const lblGapYears = document.getElementById("lbl-gap-years");
    if (lblGapYears) {
      lblGapYears.innerText = `Khoảng trống: ${gapYears} năm (${estimatedHealthspan}–${lifeExpectancy}t)`;
    }

    const remainingLifespan = Math.max(5, lifeExpectancy - currentAge);
    const healthyYears = Math.max(2, estimatedHealthspan - currentAge);
    const transitionSpan = Math.max(2, Math.min(6, Math.round((lifeExpectancy - estimatedHealthspan) * 0.55)));
    const transitionAge = Math.min(lifeExpectancy - 1, estimatedHealthspan + transitionSpan);
    const dependentSpan = Math.max(1, lifeExpectancy - transitionAge);

    const pctHealthy = Math.round((healthyYears / remainingLifespan) * 100);
    const pctTransition = Math.round((transitionSpan / remainingLifespan) * 100);
    const pctDependent = Math.max(5, 100 - pctHealthy - pctTransition);

    const barHealthy = document.getElementById("bar-gap-healthy");
    const barTransition = document.getElementById("bar-gap-transition");
    const barDependent = document.getElementById("bar-gap-dependent");

    if (barHealthy) {
      barHealthy.style.width = `${pctHealthy}%`;
      barHealthy.style.backgroundColor = "#16a34a";
      barHealthy.title = `Giai đoạn Độc lập & Tận hưởng: ${healthyYears} năm (${currentAge}–${estimatedHealthspan} tuổi)`;
      const t = document.getElementById("lbl-gap-healthy-text");
      if (t) {
        if (pctHealthy >= 25) {
          t.innerText = `Khỏe mạnh (${currentAge}–${estimatedHealthspan}t)`;
        } else if (pctHealthy >= 12) {
          t.innerText = `Khỏe (${currentAge}–${estimatedHealthspan}t)`;
        } else {
          t.innerText = `${currentAge}–${estimatedHealthspan}t`;
        }
      }
    }

    if (barTransition) {
      barTransition.style.width = `${pctTransition}%`;
      barTransition.title = `Giai đoạn Cần hỗ trợ y tế nhẹ: ${transitionSpan} năm (${estimatedHealthspan}–${transitionAge} tuổi)`;
      const t = document.getElementById("lbl-gap-transition-text");
      if (t) {
        if (pctTransition >= 24) {
          t.innerText = `Chậm dần (${estimatedHealthspan}–${transitionAge}t)`;
        } else if (pctTransition >= 14) {
          t.innerText = `Chậm (${estimatedHealthspan}–${transitionAge}t)`;
        } else if (pctTransition >= 8) {
          t.innerText = `${estimatedHealthspan}–${transitionAge}t`;
        } else {
          t.innerText = ``;
        }
      }
    }

    if (barDependent) {
      barDependent.style.width = `${pctDependent}%`;
      barDependent.title = `Giai đoạn Nguy cơ phụ thuộc / An dưỡng: ${dependentSpan} năm (${transitionAge}–${lifeExpectancy} tuổi)`;
      const t = document.getElementById("lbl-gap-dependent-text");
      if (t) {
        if (pctDependent >= 24) {
          t.innerText = `Phụ thuộc (${transitionAge}–${lifeExpectancy}t)`;
        } else if (pctDependent >= 14) {
          t.innerText = `Cần chăm sóc (${transitionAge}–${lifeExpectancy}t)`;
        } else if (pctDependent >= 8) {
          t.innerText = `${transitionAge}–${lifeExpectancy}t`;
        } else {
          t.innerText = ``;
        }
      }
    }

    const legHealthy = document.getElementById("lbl-legend-healthy");
    const legTransition = document.getElementById("lbl-legend-transition");
    const legDependent = document.getElementById("lbl-legend-dependent");

    if (legHealthy) legHealthy.innerText = `${healthyYears} năm (${currentAge}–${estimatedHealthspan}t)`;
    if (legTransition) legTransition.innerText = `${transitionSpan} năm (${estimatedHealthspan}–${transitionAge}t)`;
    if (legDependent) legDependent.innerText = `${dependentSpan} năm (${transitionAge}–${lifeExpectancy}t)`;
  }

  /**
   * Cập nhật danh sách kiểm tra y tế chuyển tiếp Pháp - Việt
   */
  function updateCrossBorderChecklist(save = true) {
    const checklistIds = [
      'chk-cross-cfe',
      'chk-cross-espace',
      'chk-cross-ordonnance',
      'chk-cross-tiers',
      'chk-cross-vitale'
    ];

    if (save) {
      const checkedIds = checklistIds.filter(id => document.getElementById(id)?.checked);
      try {
        localStorage.setItem('pyretrait_crossborder_checklist', JSON.stringify(checkedIds));
      } catch (e) {
        console.warn("Could not save crossborder checklist to localStorage:", e);
      }
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem('pyretrait_crossborder_checklist') || '[]');
        if (Array.isArray(saved)) {
          checklistIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.checked = saved.includes(id);
          });
        }
      } catch (e) {
        console.warn("Could not load crossborder checklist from localStorage:", e);
      }
    }

    const completed = checklistIds.filter(id => document.getElementById(id)?.checked).length;
    const lblProgress = document.getElementById("lbl-checklist-progress");
    if (lblProgress) {
      lblProgress.innerText = `Đã hoàn thành ${completed}/5`;
      if (completed === 5) {
        lblProgress.className = "badge badge-success font-semibold";
      } else if (completed >= 2) {
        lblProgress.className = "badge badge-info font-semibold";
      } else {
        lblProgress.className = "badge badge-warning font-semibold";
      }
    }
  }

  /**
   * Cập nhật 4 Chỉ Số Sinh Học Cơ Bản (Biomarkers) tối ưu cho Nam và Nữ
   * @param {string} gender - 'male' hoặc 'female'
   */
  let currentActiveBioGender = 'male';

  function updateBiomarkersForGender(gender) {
    const isFemale = (String(gender).toLowerCase() === 'female' || String(gender).toLowerCase() === 'nu');
    currentActiveBioGender = isFemale ? 'female' : 'male';

    // 1. Cập nhật Badge hiển thị giới tính tiêu chuẩn
    const badgeGender = document.getElementById("badge-bio-gender-indicator");
    if (badgeGender) {
      badgeGender.innerText = isFemale ? "Tiêu chuẩn: Nữ 👩" : "Tiêu chuẩn: Nam 👨";
      badgeGender.setAttribute("title", isFemale ? "Đang áp dụng chuẩn sinh học Nữ (Nhấn để đổi sang Nam)" : "Đang áp dụng chuẩn sinh học Nam (Nhấn để đổi sang Nữ)");
      badgeGender.className = isFemale ? "badge badge-warning" : "badge badge-info";
    }

    // 2. Cập nhật các badge chuẩn y khoa
    const lblRhr = document.getElementById("lbl-bio-rhr-standard");
    const lblBp = document.getElementById("lbl-bio-bp-standard");
    const lblWhtr = document.getElementById("lbl-bio-whtr-standard");
    const lblStrength = document.getElementById("lbl-bio-strength-standard");

    if (lblRhr) lblRhr.innerText = isFemale ? "Chuẩn Nữ: <65 bpm" : "Chuẩn Nam: <60 bpm";
    if (lblBp) lblBp.innerText = isFemale ? "Chuẩn: <120 mmHg (100–115)" : "Chuẩn: <120 mmHg";
    if (lblWhtr) lblWhtr.innerText = isFemale ? "Chuẩn Nữ: <0.5 (Eo <80cm)" : "Chuẩn Nam: <0.5 (Eo <90cm)";
    if (lblStrength) lblStrength.innerText = isFemale ? "Chuẩn Nữ: >12 cái (>25kg)" : "Chuẩn Nam: >20 cái (>40kg)";

    // 3. Cập nhật các option trong select dropdowns (giữ nguyên value đang chọn)
    const selRhr = document.getElementById("sel-bio-rhr");
    if (selRhr) {
      const curVal = selRhr.value || "good";
      selRhr.innerHTML = isFemale ? `
        <option value="optimal">Dưới 65 bpm (Tối ưu cho nữ)</option>
        <option value="good">65 – 75 bpm (Tốt)</option>
        <option value="average">76 – 85 bpm (Trung bình)</option>
        <option value="poor">Trên 85 bpm (Cần cải thiện)</option>
      ` : `
        <option value="optimal">Dưới 60 bpm (Tối ưu cho nam)</option>
        <option value="good">60 – 70 bpm (Tốt)</option>
        <option value="average">71 – 80 bpm (Trung bình)</option>
        <option value="poor">Trên 80 bpm (Cần cải thiện)</option>
      `;
      selRhr.value = curVal;
    }

    const selWhtr = document.getElementById("sel-bio-whtr");
    if (selWhtr) {
      const curVal = selWhtr.value || "optimal";
      selWhtr.innerHTML = isFemale ? `
        <option value="optimal">Dưới 0.5 (Vòng eo <80cm — Tối ưu)</option>
        <option value="moderate">0.5 – 0.59 (Vòng eo 80–88cm — Tăng nhẹ)</option>
        <option value="high">≥ 0.6 (Vòng eo ≥88cm — Nguy cơ tim mạch)</option>
      ` : `
        <option value="optimal">Dưới 0.5 (Vòng eo <90cm — Tối ưu)</option>
        <option value="moderate">0.5 – 0.59 (Vòng eo 90–95cm — Tăng nhẹ)</option>
        <option value="high">≥ 0.6 (Vòng eo ≥96cm — Nguy cơ tim mạch)</option>
      `;
      selWhtr.value = curVal;
    }

    const selStrength = document.getElementById("sel-bio-strength");
    if (selStrength) {
      const curVal = selStrength.value || "high";
      selStrength.innerHTML = isFemale ? `
        <option value="high">Rất khỏe (>12 cái hít đất / Lực nắm >25kg)</option>
        <option value="average">Trung bình (6–12 cái / Lực 18–25kg)</option>
        <option value="low">Yếu (<6 cái / Lực <18kg)</option>
      ` : `
        <option value="high">Rất khỏe (>20 cái liên tục / Lực >40kg)</option>
        <option value="average">Trung bình (10–20 cái / Lực 30–40kg)</option>
        <option value="low">Yếu (<10 cái / Lực <30kg)</option>
      `;
      selStrength.value = curVal;
    }
  }

  /**
   * Chuyển đổi thành viên xem & nhập liệu sức khỏe ('primary' = Bạn, 'spouse' = Bạn đời)
   */
  function switchHealthMember(member) {
    if (member !== 'primary' && member !== 'spouse') return;
    const plan = getActivePlan();
    if (!plan) return;
    saveCurrentHealthInputs(plan);
    activeHealthMember = member;
    loadHealthMemberInputs(plan, member);
    updateCoupleHealthOverview(plan);
    updateHealthspanScore();
    debouncedSavePlansToStorage();
  }

  /**
   * Cập nhật Bảng So Sánh Sức Khỏe & Kỳ Vọng Sống Cặp Đôi (chỉ hiển thị khi là Cặp Đôi)
   */
  function updateCoupleHealthOverview(plan) {
    if (!plan) plan = getActivePlan();
    const box = document.getElementById("box-couple-health-overview");
    if (!box) return;
    const isMarried = (plan?.maritalStatus === 'married');
    if (!isMarried) {
      box.style.display = 'none';
      return;
    }
    box.style.display = 'block';

    ensureHealthProfiles(plan);

    const userGender = plan?.gender || 'male';
    const spouseGender = (userGender === 'female') ? 'male' : 'female';
    const primaryIcon = (userGender === 'female') ? '👩' : '👨';
    const spouseIcon = (spouseGender === 'female') ? '👩' : '👨';

    const primNameEl = document.getElementById("lbl-couple-primary-name");
    const primStatusEl = document.getElementById("lbl-couple-primary-status");
    const primAgeEl = document.getElementById("lbl-couple-primary-age");
    const primHealthspanEl = document.getElementById("lbl-couple-primary-healthspan");
    const primGapEl = document.getElementById("lbl-couple-primary-gap");

    const spNameEl = document.getElementById("lbl-couple-spouse-name");
    const spStatusEl = document.getElementById("lbl-couple-spouse-status");
    const spAgeEl = document.getElementById("lbl-couple-spouse-age");
    const spHealthspanEl = document.getElementById("lbl-couple-spouse-healthspan");
    const spGapEl = document.getElementById("lbl-couple-spouse-gap");

    const mPrim = calculateMemberMetrics(plan, 'primary');
    const mSpouse = calculateMemberMetrics(plan, 'spouse');

    if (primNameEl) primNameEl.innerText = `${primaryIcon} Bạn (${userGender === 'female' ? 'Nữ' : 'Nam'})`;
    if (primAgeEl) primAgeEl.innerText = `${mPrim.currentAge} tuổi`;
    if (primHealthspanEl) primHealthspanEl.innerText = `${mPrim.estimatedHealthspan} tuổi (kỳ vọng ${mPrim.lifeExpectancy}t)`;
    if (primGapEl) primGapEl.innerText = `${mPrim.gapYears} năm (${mPrim.estimatedHealthspan}–${mPrim.lifeExpectancy}t)`;
    if (primStatusEl) {
      const diffText = mPrim.delta < 0 ? `Trẻ hơn ${Math.abs(mPrim.delta)}t` : mPrim.delta === 0 ? 'Bằng tuổi thực' : `Già hơn ${mPrim.delta}t`;
      primStatusEl.innerText = `Tuổi sinh học: ${mPrim.bioAge}t (${diffText})`;
      primStatusEl.className = mPrim.delta < 0 ? "badge badge-success font-semibold" : mPrim.delta === 0 ? "badge badge-info font-semibold" : "badge badge-danger font-semibold";
    }

    if (spNameEl) spNameEl.innerText = `${spouseIcon} Bạn đời (${spouseGender === 'female' ? 'Nữ' : 'Nam'})`;
    if (spAgeEl) spAgeEl.innerText = `${mSpouse.currentAge} tuổi`;
    if (spHealthspanEl) spHealthspanEl.innerText = `${mSpouse.estimatedHealthspan} tuổi (kỳ vọng ${mSpouse.lifeExpectancy}t)`;
    if (spGapEl) spGapEl.innerText = `${mSpouse.gapYears} năm (${mSpouse.estimatedHealthspan}–${mSpouse.lifeExpectancy}t)`;
    if (spStatusEl) {
      const diffText = mSpouse.delta < 0 ? `Trẻ hơn ${Math.abs(mSpouse.delta)}t` : mSpouse.delta === 0 ? 'Bằng tuổi thực' : `Già hơn ${mSpouse.delta}t`;
      spStatusEl.innerText = `Tuổi sinh học: ${mSpouse.bioAge}t (${diffText})`;
      spStatusEl.className = mSpouse.delta < 0 ? "badge badge-success font-semibold" : mSpouse.delta === 0 ? "badge badge-info font-semibold" : "badge badge-danger font-semibold";
    }

    const btnPrim = document.getElementById("btn-health-tab-primary");
    const btnSpouse = document.getElementById("btn-health-tab-spouse");
    if (btnPrim) btnPrim.innerText = `${primaryIcon} Hồ sơ Bạn`;
    if (btnSpouse) btnSpouse.innerText = `${spouseIcon} Hồ sơ Bạn đời`;

    const cardPrim = document.getElementById("card-couple-primary-col");
    const cardSpouse = document.getElementById("card-couple-spouse-col");

    if (activeHealthMember === 'primary') {
      if (btnPrim) { btnPrim.className = "btn btn-sm btn-primary"; }
      if (btnSpouse) { btnSpouse.className = "btn btn-sm btn-outline"; }
      if (cardPrim) cardPrim.style.border = "1.5px solid var(--accent-emerald)";
      if (cardSpouse) cardSpouse.style.border = "1px solid var(--border-subtle)";
    } else {
      if (btnPrim) { btnPrim.className = "btn btn-sm btn-outline"; }
      if (btnSpouse) { btnSpouse.className = "btn btn-sm btn-primary"; }
      if (cardPrim) cardPrim.style.border = "1px solid var(--border-subtle)";
      if (cardSpouse) cardSpouse.style.border = "1.5px solid var(--accent-emerald)";
    }
  }

  /**
   * Render chính cho Tab Sức Khỏe
   */
  function renderHealthTab() {
    const plan = getActivePlan();
    ensureHealthProfiles(plan);
    loadHealthMemberInputs(plan, activeHealthMember);
    updateCoupleHealthOverview(plan);
    updateHealthspanScore();
    updateCrossBorderChecklist(false);

    const currency = getCurrency();
    const isVnd = currency === 'VND';
    const isUsd = currency === 'USD';

    const b30 = document.getElementById("lbl-budget-age-30");
    const b45 = document.getElementById("lbl-budget-age-45");
    const b60 = document.getElementById("lbl-budget-age-60");

    if (b30) b30.innerText = isVnd ? "≈ 1.1 Tr ₫/tháng" : isUsd ? "≈ $45/tháng" : "≈ 40 €/tháng";
    if (b45) b45.innerText = isVnd ? "≈ 2.7 Tr ₫/tháng" : isUsd ? "≈ $110/tháng" : "≈ 100 €/tháng";
    if (b60) b60.innerText = isVnd ? "≈ 4.9 Tr ₫/tháng" : isUsd ? "≈ $195/tháng" : "≈ 180 €/tháng";
  }

  /**
   * Đăng ký sự kiện tương tác cho Tab Sức Khỏe
   */
  function initHealthTabEvents() {
    // Buttons chuyển đổi hồ sơ Bạn / Bạn đời
    const btnPrim = document.getElementById("btn-health-tab-primary");
    if (btnPrim) {
      btnPrim.addEventListener("click", () => switchHealthMember('primary'));
    }
    const btnSpouse = document.getElementById("btn-health-tab-spouse");
    if (btnSpouse) {
      btnSpouse.addEventListener("click", () => switchHealthMember('spouse'));
    }
    const cardPrim = document.getElementById("card-couple-primary-col");
    if (cardPrim) {
      cardPrim.addEventListener("click", () => switchHealthMember('primary'));
    }
    const cardSpouse = document.getElementById("card-couple-spouse-col");
    if (cardSpouse) {
      cardSpouse.addEventListener("click", () => switchHealthMember('spouse'));
    }

    // Chuyển đổi nhanh tiêu chuẩn giới tính khi bấm vào badge
    const badgeGender = document.getElementById("badge-bio-gender-indicator");
    if (badgeGender) {
      badgeGender.addEventListener("click", () => {
        const nextGender = (currentActiveBioGender === 'female') ? 'male' : 'female';
        updateBiomarkersForGender(nextGender);
        const plan = getActivePlan();
        saveCurrentHealthInputs(plan);
        updateHealthspanScore();
        updateCoupleHealthOverview(plan);
      });
    }

    // Thói quen sống khỏe
    ['chk-habit-exercise', 'chk-habit-sleep', 'chk-habit-diet', 'chk-habit-checkup', 'chk-habit-social'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", () => {
          const plan = getActivePlan();
          saveCurrentHealthInputs(plan);
          updateHealthspanScore();
          updateCoupleHealthOverview(plan);
          debouncedSavePlansToStorage();
        });
      }
    });

    // Chỉ số sinh học
    ['sel-bio-rhr', 'sel-bio-bp', 'sel-bio-whtr', 'sel-bio-strength'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", () => {
          const plan = getActivePlan();
          saveCurrentHealthInputs(plan);
          updateHealthspanScore();
          updateCoupleHealthOverview(plan);
          debouncedSavePlansToStorage();
        });
      }
    });

    // Checklist y tế Pháp - Việt
    ['chk-cross-cfe', 'chk-cross-espace', 'chk-cross-ordonnance', 'chk-cross-tiers', 'chk-cross-vitale'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", () => {
          updateCrossBorderChecklist(true);
        });
      }
    });
  }

  // -------------------------------------------------------------
  // Sự kiện tương tác của Tab 2 (Chăm sóc tuổi già, Con cái, Di sản, Sức khỏe)
  // -------------------------------------------------------------
  function bindTab2Events() {
    try {
      initFamilyChildrenSimulation();
    } catch (e) {
      console.warn("initFamilyChildrenSimulation error:", e);
    }

    // Senior Care / Dépendance Inputs
    ['inp-senior-care-age', 'inp-senior-care-monthly'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        ['input', 'change'].forEach(evt => {
          el.addEventListener(evt, () => {
            const plan = getActivePlan();
            plan.seniorCareAge = parseVal("inp-senior-care-age", 78);
            plan.seniorCareMonthly = parseVal("inp-senior-care-monthly", 0);
            updateSeniorCareUI(plan);
            renderExpensePeriodsSummary(plan);
            savePlansToStorage();
            updateAll();
          });
        });
      }
    });

    const chkSenior = document.getElementById("chk-enable-senior-care");
    if (chkSenior) {
      chkSenior.addEventListener("change", () => {
        const plan = getActivePlan();
        plan.enableSeniorCare = chkSenior.checked;
        savePlansToStorage();
        updateSeniorCareUI(plan);
        renderExpensePeriodsSummary(plan);
        updateCashflowBalanceUI(plan);
        updateAll();
      });
    }

    const btnEditSenior = document.getElementById("btn-edit-senior-care");
    if (btnEditSenior) {
      btnEditSenior.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const body = document.getElementById("senior-inputs-body");
        if (body) {
          if (body.style.display === "none") {
            body.style.display = "block";
            btnEditSenior.innerText = "Sửa";
          } else {
            body.style.display = "none";
            btnEditSenior.innerText = "Mở rộng";
          }
        }
      });
    }

    const btnDelSenior = document.getElementById("btn-del-senior-care");
    if (btnDelSenior) {
      btnDelSenior.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const plan = getActivePlan();
        if (plan.enableSeniorCare !== false && Number(plan.seniorCareMonthly) > 0) {
          showConfirmDialog({
            icon: "",
            title: "Xác nhận xóa Quỹ chăm sóc tuổi già",
            message: `Bạn có chắc chắn muốn xóa ngân sách <strong>Dự phòng Chăm sóc Tuổi Già (78t+)</strong>?<br><span style="font-size:0.75rem; color:var(--text-faint); margin-top:6px; display:inline-block;">Khoản chi dự phòng này sẽ được đặt về 0 và dòng tiền hưu trí sẽ được tính toán lại.</span>`,
            confirmText: "Xóa khoản chi",
            onConfirm: () => {
              plan.enableSeniorCare = false;
              plan.seniorCareMonthly = 0;
              const inpM = document.getElementById("inp-senior-care-monthly");
              if (inpM) inpM.value = 0;
              const chk = document.getElementById("chk-enable-senior-care");
              if (chk) chk.checked = false;
              savePlansToStorage();
              updateSeniorCareUI(plan);
              renderExpensePeriodsSummary(plan);
              updateCashflowBalanceUI(plan);
              updateAll();
            }
          });
        } else {
          plan.enableSeniorCare = true;
          if (Number(plan.seniorCareMonthly) === 0) {
            plan.seniorCareMonthly = 1200;
            const inpM = document.getElementById("inp-senior-care-monthly");
            if (inpM) inpM.value = 1200;
          }
          const chk = document.getElementById("chk-enable-senior-care");
          if (chk) chk.checked = true;
          savePlansToStorage();
          updateSeniorCareUI(plan);
          renderExpensePeriodsSummary(plan);
          updateCashflowBalanceUI(plan);
          updateAll();
        }
      });
    }

    // Family / Children stream controls
    const chkFamily = document.getElementById("chk-enable-family-stream");
    if (chkFamily) {
      chkFamily.addEventListener("change", () => {
        const plan = getActivePlan();
        if (!plan.familyPlan) plan.familyPlan = { enabled: true, kidsCount: 2, status: 'couple', kid1Birth: 2022, kid2Birth: 2025, kidCostMonthly: 350, kidUniMonthly: 900 };
        plan.familyPlan.enabled = chkFamily.checked;
        savePlansToStorage();
        updateFamilyStreamUI(plan);
        renderExpensePeriodsSummary(plan);
        updateCashflowBalanceUI(plan);
        updateAll();
      });
    }

    const btnEditFamily = document.getElementById("btn-edit-family-stream");
    if (btnEditFamily) {
      btnEditFamily.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const body = document.getElementById("family-stream-inputs-body");
        if (body) {
          if (body.style.display === "none") {
            body.style.display = "block";
            btnEditFamily.innerText = "Thu gọn";
          } else {
            body.style.display = "none";
            btnEditFamily.innerText = "Sửa";
          }
        }
      });
    }

    const btnDelFamily = document.getElementById("btn-del-family-stream");
    if (btnDelFamily) {
      btnDelFamily.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const plan = getActivePlan();
        if (!plan.familyPlan) plan.familyPlan = { enabled: true, kidsCount: 2, status: 'couple', kid1Birth: 2022, kid2Birth: 2025, kidCostMonthly: 350, kidUniMonthly: 900 };
        if (plan.familyPlan.enabled !== false) {
          showConfirmDialog({
            icon: "",
            title: "Xác nhận tắt Kế hoạch Con cái & Gia đình",
            message: `Bạn có chắc chắn muốn tạm tắt <strong>Kế Hoạch Con Cái & Gia Đình</strong>?<br><span style="font-size:0.75rem; color:var(--text-faint); margin-top:6px; display:inline-block;">Các chi phí nuôi con và học vấn sẽ không bị tính vào dòng tiền cho đến khi bạn kích hoạt lại.</span>`,
            confirmText: "Tắt kế hoạch",
            onConfirm: () => {
              plan.familyPlan.enabled = false;
              if (chkFamily) chkFamily.checked = false;
              savePlansToStorage();
              updateFamilyStreamUI(plan);
              renderExpensePeriodsSummary(plan);
              updateCashflowBalanceUI(plan);
              updateAll();
            }
          });
        } else {
          plan.familyPlan.enabled = true;
          if (chkFamily) chkFamily.checked = true;
          savePlansToStorage();
          updateFamilyStreamUI(plan);
          renderExpensePeriodsSummary(plan);
          updateCashflowBalanceUI(plan);
          updateAll();
        }
      });
    }

    // Stream inputs change listeners
    const streamKidsCount = document.getElementById("sel-stream-kids-count");
    const streamKid1 = document.getElementById("inp-stream-kid1-birth");
    const streamKid2 = document.getElementById("inp-stream-kid2-birth");
    const streamKid3 = document.getElementById("inp-stream-kid3-birth");
    const streamKid4 = document.getElementById("inp-stream-kid4-birth");
    const streamCost = document.getElementById("inp-stream-kid-cost-monthly");
    const streamUni = document.getElementById("inp-stream-kid-uni-monthly");

    const onStreamFamilyInputChange = () => {
      const plan = getActivePlan();
      if (!plan.familyPlan) plan.familyPlan = { enabled: true, kidsCount: 2, status: 'couple', kid1Birth: 2022, kid2Birth: 2025, kid3Birth: 2027, kid4Birth: 2029, kidCostMonthly: 350, kidUniMonthly: 900 };
      if (streamKidsCount) plan.familyPlan.kidsCount = parseInt(streamKidsCount.value) || 0;
      if (streamKid1) plan.familyPlan.kid1Birth = parseInt(streamKid1.value) || 2022;
      if (streamKid2) plan.familyPlan.kid2Birth = parseInt(streamKid2.value) || 2025;
      if (streamKid3) plan.familyPlan.kid3Birth = parseInt(streamKid3.value) || 2027;
      if (streamKid4) plan.familyPlan.kid4Birth = parseInt(streamKid4.value) || 2029;
      if (streamCost) plan.familyPlan.kidCostMonthly = parseFloat(streamCost.value) || 350;
      if (streamUni) plan.familyPlan.kidUniMonthly = parseFloat(streamUni.value) || 900;
      savePlansToStorage();
      updateFamilyStreamUI(plan);
      renderExpensePeriodsSummary(plan);
      updateCashflowBalanceUI(plan);
      updateAll();
    };

    [streamKidsCount, streamKid1, streamKid2, streamKid3, streamKid4, streamCost, streamUni].forEach(el => {
      if (el) {
        el.addEventListener("change", onStreamFamilyInputChange);
        el.addEventListener("input", onStreamFamilyInputChange);
      }
    });

    // Toggle / Expand Estate Planning & Legacy Stream Card
    const btnToggleLegacy = document.getElementById("btn-toggle-estate-legacy");
    if (btnToggleLegacy) {
      btnToggleLegacy.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const body = document.getElementById("estate-legacy-inputs-body");
        if (body) {
          const isHidden = body.style.display === "none";
          body.style.display = isHidden ? "block" : "none";
          btnToggleLegacy.innerText = isHidden ? "Thu gọn" : "Mở rộng";
        }
      });
    }

    const chkEnableLegacy = document.getElementById("chk-enable-estate-legacy");
    if (chkEnableLegacy) {
      chkEnableLegacy.addEventListener("change", (e) => {
        const card = document.getElementById("card-estate-legacy-combined");
        if (card) {
          card.style.opacity = e.target.checked ? "1" : "0.65";
        }
      });
    }

    initHealthTabEvents();
  }

  function updateSeniorCareUI(p) {
    if (!p) p = getActivePlan();
    const careAge = Number(p.seniorCareAge) || 78;
    const monthlyAmt = Number(p.seniorCareMonthly) || 0;
    const annualAmt = monthlyAmt * 12;
    const maxAge = Number(p.lifeExpectancy) || 85;
    const isEnabled = p.enableSeniorCare !== false && monthlyAmt > 0;

    const inpAge = document.getElementById("inp-senior-care-age");
    const inpMonthly = document.getElementById("inp-senior-care-monthly");
    const chk = document.getElementById("chk-enable-senior-care");
    const badge = document.getElementById("badge-senior-care");
    const lblMonthly = document.getElementById("lbl-senior-card-monthly");
    const lblAnnual = document.getElementById("lbl-senior-card-annual");
    const lblRange = document.getElementById("lbl-senior-card-age-range");
    const lblGrowth = document.getElementById("lbl-senior-card-growth");
    const btnDel = document.getElementById("btn-del-senior-care");
    const card = document.getElementById("card-senior-care-stream");

    if (inpAge && Number(inpAge.value) !== careAge) inpAge.value = careAge;
    if (inpMonthly && Number(inpMonthly.value) !== monthlyAmt) inpMonthly.value = monthlyAmt;
    if (chk) chk.checked = p.enableSeniorCare !== false;

    if (btnDel) {
      btnDel.innerText = (p.enableSeniorCare !== false && monthlyAmt > 0) ? "Xóa" : "Kích hoạt";
      btnDel.className = (p.enableSeniorCare !== false && monthlyAmt > 0) ? "income-item-btn income-item-del" : "income-item-btn";
    }

    if (badge) {
      if (isEnabled) {
        badge.style.display = "inline-block";
        badge.innerText = `${window.RetirementEngine.formatCurrency(monthlyAmt, state.currency)}/tháng`;
        badge.style.background = "rgba(244, 63, 94, 0.12)";
        badge.style.color = "#fb7185";
        badge.style.borderColor = "rgba(244, 63, 94, 0.25)";
      } else {
        badge.style.display = "none";
      }
    }

    if (lblMonthly) {
      if (isEnabled) {
        lblMonthly.innerHTML = `${window.RetirementEngine.formatCurrency(monthlyAmt, state.currency)}<small>/tháng</small>`;
      } else {
        lblMonthly.innerHTML = `<span style="color: var(--text-faint);">0<small>/tháng</small></span>`;
      }
    }

    if (lblAnnual) {
      lblAnnual.innerText = isEnabled ? `≈ ${window.RetirementEngine.formatCurrency(annualAmt, state.currency)}/năm` : "Chưa dự phòng quỹ chăm sóc tuổi già";
    }

    if (lblRange) {
      lblRange.innerText = `${careAge} - ${maxAge} tuổi`;
    }

    if (lblGrowth) {
      const infPost = (p.dualInflation && p.dualInflation.enabled) ? Number(p.dualInflation.inflationPostRetire) || 4.0 : Number(p.inflationRate) || 2.2;
      lblGrowth.innerText = `+${infPost.toFixed(1)}%/năm`;
    }

    if (card) {
      card.style.opacity = (p.enableSeniorCare !== false) ? "1" : "0.75";
    }
  }

  function updateFamilyStreamUI(p) {
    if (!p) p = getActivePlan();
    if (!p) return;

    if (!p.familyPlan) {
      p.familyPlan = {
        enabled: true,
        kidsCount: 2,
        status: "couple",
        kid1Birth: 2022,
        kid2Birth: 2025,
        kid3Birth: 2027,
        kid4Birth: 2029,
        kidCostMonthly: 350,
        kidUniMonthly: 900
      };
    }

    const fp = p.familyPlan;
    const isEnabled = fp.enabled !== false;
    const count = Number(fp.kidsCount) !== undefined ? Number(fp.kidsCount) : 2;
    const status = fp.status || "couple";
    const kid1Birth = Number(fp.kid1Birth) || 2022;
    const kid2Birth = Number(fp.kid2Birth) || 2025;
    const kid3Birth = Number(fp.kid3Birth) || 2027;
    const kid4Birth = Number(fp.kid4Birth) || 2029;
    const kidCostMonthly = Number(fp.kidCostMonthly) || 350;
    const kidUniMonthly = Number(fp.kidUniMonthly) || 900;
    const birthYears = [kid1Birth, kid2Birth, kid3Birth, kid4Birth];

    const curAge = Number(p.currentAge) || 29;
    const curYear = new Date().getFullYear();
    const parentBirth = Number(p.birthYear) || (curYear - curAge);

    // Sync input controls in Column 2 (Stream card)
    const chkStream = document.getElementById("chk-enable-family-stream");
    const selStreamCount = document.getElementById("sel-stream-kids-count");
    const selStreamStatus = document.getElementById("sel-stream-family-status");
    const inpStreamKid1 = document.getElementById("inp-stream-kid1-birth");
    const inpStreamKid2 = document.getElementById("inp-stream-kid2-birth");
    const inpStreamKid3 = document.getElementById("inp-stream-kid3-birth");
    const inpStreamKid4 = document.getElementById("inp-stream-kid4-birth");
    const inpStreamCost = document.getElementById("inp-stream-kid-cost-monthly");
    const inpStreamUni = document.getElementById("inp-stream-kid-uni-monthly");
    const rowStreamBirth = document.getElementById("row-stream-children-birth");
    const rowStreamBirthExtra = document.getElementById("row-stream-children-birth-extra");
    const grpStreamKid1 = document.getElementById("grp-stream-kid1-birth");
    const grpStreamKid2 = document.getElementById("grp-stream-kid2-birth");
    const grpStreamKid3 = document.getElementById("grp-stream-kid3-birth");
    const grpStreamKid4 = document.getElementById("grp-stream-kid4-birth");

    if (chkStream) chkStream.checked = isEnabled;
    if (selStreamCount && Number(selStreamCount.value) !== count) selStreamCount.value = count;
    if (selStreamStatus && selStreamStatus.value !== status) selStreamStatus.value = status;
    if (inpStreamKid1 && Number(inpStreamKid1.value) !== kid1Birth) inpStreamKid1.value = kid1Birth;
    if (inpStreamKid2 && Number(inpStreamKid2.value) !== kid2Birth) inpStreamKid2.value = kid2Birth;
    if (inpStreamKid3 && Number(inpStreamKid3.value) !== kid3Birth) inpStreamKid3.value = kid3Birth;
    if (inpStreamKid4 && Number(inpStreamKid4.value) !== kid4Birth) inpStreamKid4.value = kid4Birth;
    if (inpStreamCost && Number(inpStreamCost.value) !== kidCostMonthly) inpStreamCost.value = kidCostMonthly;
    if (inpStreamUni && Number(inpStreamUni.value) !== kidUniMonthly) inpStreamUni.value = kidUniMonthly;

    if (rowStreamBirth) rowStreamBirth.style.display = count >= 1 ? "flex" : "none";
    if (grpStreamKid1) grpStreamKid1.style.display = count >= 1 ? "block" : "none";
    if (grpStreamKid2) grpStreamKid2.style.display = count >= 2 ? "block" : "none";

    if (rowStreamBirthExtra) rowStreamBirthExtra.style.display = count >= 3 ? "flex" : "none";
    if (grpStreamKid3) grpStreamKid3.style.display = count >= 3 ? "block" : "none";
    if (grpStreamKid4) grpStreamKid4.style.display = count >= 4 ? "block" : "none";

    // Sync input controls in Tab 4 (Estate & Family card if present)
    const selTab4Count = document.getElementById("sel-family-kids-count");
    const selTab4Status = document.getElementById("sel-family-status");
    const inpTab4Kid1 = document.getElementById("inp-kid1-birth");
    const inpTab4Kid2 = document.getElementById("inp-kid2-birth");
    const inpTab4Cost = document.getElementById("inp-kid-cost-monthly");
    const inpTab4Uni = document.getElementById("inp-kid-uni-monthly");

    if (selTab4Count && Number(selTab4Count.value) !== count) selTab4Count.value = count;
    if (selTab4Status && selTab4Status.value !== status) selTab4Status.value = status;
    if (inpTab4Kid1 && Number(inpTab4Kid1.value) !== kid1Birth) inpTab4Kid1.value = kid1Birth;
    if (inpTab4Kid2 && Number(inpTab4Kid2.value) !== kid2Birth) inpTab4Kid2.value = kid2Birth;
    if (inpTab4Cost && Number(inpTab4Cost.value) !== kidCostMonthly) inpTab4Cost.value = kidCostMonthly;
    if (inpTab4Uni && Number(inpTab4Uni.value) !== kidUniMonthly) inpTab4Uni.value = kidUniMonthly;

    // Calculate Parts Fiscales
    const baseParts = status === "couple" ? 2.0 : 1.0;
    let kidParts = 0;
    if (count === 1) kidParts = 0.5;
    else if (count === 2) kidParts = 1.0;
    else if (count >= 3) kidParts = 1.0 + (count - 2) * 1.0;
    const totalParts = baseParts + kidParts;

    // Calculate Current Year Cost
    let curMonthlyCost = 0;
    for (let k = 0; k < Math.min(count, 4); k++) {
      const kAge = curYear - birthYears[k];
      if (kAge >= 0 && kAge < 18) curMonthlyCost += kidCostMonthly;
      else if (kAge >= 18 && kAge <= 23) curMonthlyCost += kidUniMonthly;
    }

    const annualAmt = curMonthlyCost * 12;

    // Card UI Labels
    const cardEl = document.getElementById("card-children-family-stream");
    const badgeStatus = document.getElementById("badge-family-stream-status");
    const lblMonthly = document.getElementById("lbl-family-stream-monthly");
    const lblAnnual = document.getElementById("lbl-family-stream-annual");
    const lblTiming = document.getElementById("lbl-family-stream-timing");
    const btnDel = document.getElementById("btn-del-family-stream");

    const bodyFamily = document.getElementById("family-stream-inputs-body");
    if (bodyFamily) {
      bodyFamily.style.display = isEnabled ? "block" : "none";
    }

    if (badgeStatus) {
      if (count > 0 && isEnabled) {
        badgeStatus.innerText = `${count} con`;
        badgeStatus.style.background = "rgba(99, 102, 241, 0.12)";
        badgeStatus.style.color = "#818cf8";
        badgeStatus.style.borderColor = "rgba(99, 102, 241, 0.25)";
      } else if (!isEnabled) {
        badgeStatus.innerText = "Đang tắt";
        badgeStatus.style.background = "rgba(148, 163, 184, 0.1)";
        badgeStatus.style.color = "var(--text-faint)";
        badgeStatus.style.borderColor = "var(--border-subtle)";
      } else {
        badgeStatus.innerText = "Chưa có con";
        badgeStatus.style.background = "rgba(148, 163, 184, 0.1)";
        badgeStatus.style.color = "var(--text-faint)";
        badgeStatus.style.borderColor = "var(--border-subtle)";
      }
    }

    if (lblMonthly) {
      if (isEnabled && count > 0) {
        lblMonthly.innerHTML = `${window.RetirementEngine.formatCurrency(curMonthlyCost, state.currency)}<small>/tháng</small>`;
      } else {
        lblMonthly.innerHTML = `<span style="color: var(--text-faint);">0<small>/tháng</small></span>`;
      }
    }

    if (lblAnnual) {
      if (isEnabled && count > 0) {
        lblAnnual.innerText = `≈ ${window.RetirementEngine.formatCurrency(annualAmt, state.currency)}/năm • ${count} con (${kidCostMonthly} €/tháng 0–18t, ${kidUniMonthly} € ĐH)`;
      } else if (!isEnabled) {
        lblAnnual.innerText = "Kế hoạch con cái đang tạm tắt";
      } else {
        lblAnnual.innerText = "Chưa có dự kiến con cái";
      }
    }

    if (lblTiming) {
      if (count > 0) {
        const activeBirthYears = birthYears.slice(0, Math.min(count, 4));
        const youngestBirth = Math.max(...activeBirthYears);
        const endAgeTiming = (youngestBirth + 23) - parentBirth;
        lblTiming.innerText = `${curAge} – ${endAgeTiming} tuổi (khi con 23t)`;
      } else {
        lblTiming.innerText = "Chưa có dự kiến";
      }
    }

    if (btnDel) {
      btnDel.innerText = isEnabled ? "Xóa" : "Kích hoạt";
      btnDel.className = isEnabled ? "income-item-btn income-item-del" : "income-item-btn";
    }

    if (cardEl) {
      cardEl.style.opacity = isEnabled ? "1" : "0.75";
    }

    // Also update Tab 4 calculations & chart if open
    updateFamilyChildrenSimulation();
  }

  // -------------------------------------------------------------
  // TAB 6: Estate, Family & Spending Smile
  // -------------------------------------------------------------
  function updateFamilyChildrenSimulation() {
    try {
      const selCount = document.getElementById("sel-family-kids-count");
      const selStatus = document.getElementById("sel-family-status");
      const inpKid1 = document.getElementById("inp-kid1-birth");
      const inpKid2 = document.getElementById("inp-kid2-birth");
      const inpKidCost = document.getElementById("inp-kid-cost-monthly");
      const inpKidUni = document.getElementById("inp-kid-uni-monthly");

      if (!selCount) return;

      const count = parseInt(selCount.value) || 0;
      const status = selStatus ? selStatus.value : "couple";
      const baseParts = status === "couple" ? 2.0 : 1.0;
      const currentYear = new Date().getFullYear();

      const kid1Birth = parseInt(inpKid1?.value) || 2022;
      const kid2Birth = parseInt(inpKid2?.value) || 2025;
      const kid1Age = Math.max(0, currentYear - kid1Birth);
      const kid2Age = Math.max(0, currentYear - kid2Birth);
      const kidCostMonthly = parseFloat(inpKidCost?.value) || 350;
      const kidUniMonthly = parseFloat(inpKidUni?.value) || 900;

      // Toggle kid birth inputs visibility
      const grp1 = document.getElementById("grp-kid1-birth");
      const grp2 = document.getElementById("grp-kid2-birth");
      const rowBirth = document.getElementById("row-children-birth");
      if (rowBirth) rowBirth.style.display = count === 0 ? "none" : "flex";
      if (grp1) grp1.style.display = count >= 1 ? "block" : "none";
      if (grp2) grp2.style.display = count >= 2 ? "block" : "none";

      // 1. Parts Fiscales in France
      let kidParts = 0;
      if (count === 1) kidParts = 0.5;
      else if (count === 2) kidParts = 1.0;
      else if (count >= 3) kidParts = 1.0 + (count - 2) * 1.0;
      const totalParts = baseParts + kidParts;

      const lblParts = document.getElementById("lbl-family-parts");
      if (lblParts) lblParts.innerText = `${totalParts.toFixed(1)} Parts Fiscales`;

      // 2. Income Tax Savings (Capped at 1,759 € per half-part in France)
      const halfParts = kidParts * 2;
      const maxTaxSaving = Math.round(halfParts * 1759);
      const lblTaxSaving = document.getElementById("lbl-family-tax-saving");
      if (lblTaxSaving) {
        lblTaxSaving.innerText = count > 0 ? `~${new Intl.NumberFormat('fr-FR').format(maxTaxSaving)} €/năm` : "0 €";
      }

      // 3. CAF Monthly Family Allowance (2+ children in France)
      let cafMonthly = 0;
      if (count === 2) cafMonthly = 148;
      else if (count === 3) cafMonthly = 338;
      else if (count >= 4) cafMonthly = 529;
      const lblCaf = document.getElementById("lbl-family-caf");
      if (lblCaf) {
        lblCaf.innerText = count >= 2 ? `~${cafMonthly} €/tháng (~${new Intl.NumberFormat('fr-FR').format(cafMonthly * 12)} €/năm)` : "0 € (chưa đủ 2 con)";
      }

      // 4. University Milestones (Birth Year + 18)
      const kid1UniYear = kid1Birth + 18;
      const kid2UniYear = kid2Birth + 18;
      const lblTimeline = document.getElementById("lbl-family-uni-timeline");
      if (lblTimeline) {
        if (count === 0) {
          lblTimeline.innerText = "Chưa có dự kiến";
        } else if (count === 1) {
          lblTimeline.innerText = `Năm ${kid1UniYear} (khi con sinh ${kid1Birth} tròn 18t)`;
        } else {
          lblTimeline.innerText = `Năm ${kid1UniYear} & ${kid2UniYear} (khi tròn 18t)`;
        }
      }

      // 5. Inheritance Tax Exemption (100,000 € per parent per child every 15 years)
      const parentsCount = status === "couple" ? 2 : 1;
      const totalExemption = count * parentsCount * 100000;
      const lblExemption = document.getElementById("lbl-family-inheritance-exemption");
      if (lblExemption) {
        lblExemption.innerText = count > 0 ? `${new Intl.NumberFormat('fr-FR').format(totalExemption)} € / 15 năm` : "0 €";
      }

      // 6. Render Chart: Family Cash Flow Trajectory
      renderFamilyCashFlowChart(count, kid1Birth, kid2Birth, kidCostMonthly, kidUniMonthly, cafMonthly, maxTaxSaving);
    } catch (err) {
      console.warn("Family children simulation update error:", err);
    }
  }

  function renderFamilyCashFlowChart(count, kid1Birth, kid2Birth, kidCostMonthly, kidUniMonthly, cafMonthly, maxTaxSaving) {
    const canvas = document.getElementById("chart-family-cashflow");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (state.charts.familyCashFlow) {
      state.charts.familyCashFlow.destroy();
    }

    const currentYear = new Date().getFullYear();
    const maxBirth = count >= 2 ? Math.max(kid1Birth, kid2Birth) : (count === 1 ? kid1Birth : currentYear);
    const endYear = Math.max(currentYear + 20, maxBirth + 25);
    const years = [];
    const childExpenses = [];
    const familyBenefits = [];
    const realEstateCashFlow = [];

    // Check apartments from Gestion de Patrimoine
    let rawApts = [];
    try {
      if (state.patrimoineData && Array.isArray(state.patrimoineData.apartments)) {
        rawApts = state.patrimoineData.apartments;
      } else {
        const guestPat = JSON.parse(localStorage.getItem("pyRetrait_guest_patrimoine_v2") || "{}");
        if (guestPat.apartments) {
          rawApts = Object.entries(guestPat.apartments).map(([name, data]) => ({ name, ...data }));
        }
      }
    } catch (e) {}

    for (let yr = currentYear; yr <= endYear; yr++) {
      years.push(yr);

      // 1. Child expenses
      let annualChildCost = 0;
      if (count >= 1) {
        const k1Age = yr - kid1Birth;
        if (k1Age >= 0 && k1Age < 18) annualChildCost += kidCostMonthly * 12;
        else if (k1Age >= 18 && k1Age <= 23) annualChildCost += kidUniMonthly * 12;
      }
      if (count >= 2) {
        const k2Age = yr - kid2Birth;
        if (k2Age >= 0 && k2Age < 18) annualChildCost += kidCostMonthly * 12;
        else if (k2Age >= 18 && k2Age <= 23) annualChildCost += kidUniMonthly * 12;
      }
      childExpenses.push(annualChildCost);

      // 2. Family benefits (CAF + Tax savings)
      let annualBenefits = 0;
      let depCount = 0;
      if (count >= 1 && (yr - kid1Birth) >= 0 && (yr - kid1Birth) < 21) depCount++;
      if (count >= 2 && (yr - kid2Birth) >= 0 && (yr - kid2Birth) < 21) depCount++;

      if (depCount >= 2) {
        annualBenefits = cafMonthly * 12 + maxTaxSaving;
      } else if (depCount === 1) {
        annualBenefits = Math.round(maxTaxSaving * 0.5);
      }
      familyBenefits.push(annualBenefits);

      // 3. Real Estate Net Cash Flow (Patrimoine)
      let annualReCf = 0;
      if (rawApts.length > 0) {
        rawApts.forEach(apt => {
          const startYr = Number(apt.start_year) || 2023;
          const dur = Number(apt.loan_duration) || 20;
          const monthlyRent = Number(apt.monthly_rent) || 600;
          const monthlyLoan = Number(apt.monthly_loan_payment) || (monthlyRent * 0.8);
          const duringCf = (monthlyRent * 0.95 - monthlyLoan - 150) * 12;
          const postCf = (monthlyRent * 0.95 - 150) * 12;

          if (yr >= startYr) {
            if (yr < startYr + dur) {
              annualReCf += duringCf;
            } else {
              annualReCf += postCf;
            }
          }
        });
      } else {
        // Sample standard benchmark from 3 apartments:
        // Loan matures around 2043 (20 years from 2023), net cash flow rises to +18,768 €/year
        if (yr < 2043) {
          annualReCf = -1200; // slight debt service
        } else {
          annualReCf = 18768; // +1,564 €/month post-loan
        }
      }
      realEstateCashFlow.push(Math.round(annualReCf));
    }

    state.charts.familyCashFlow = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years.map(y => `${y}`),
        datasets: [
          {
            label: 'Chi phí Nuôi con & Đại học (€/năm)',
            data: childExpenses,
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.25)',
            borderWidth: 3,
            fill: true,
            tension: 0.35
          },
          {
            label: 'Dòng tiền Ròng BĐS Bù đắp (€/năm)',
            data: realEstateCashFlow,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.25
          },
          {
            label: 'Trợ cấp CAF & Tiết kiệm Thuế (€/năm)',
            data: familyBenefits,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.2)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => `Năm ${items[0].label}`,
              label: (item) => {
                const val = new Intl.NumberFormat('fr-FR').format(item.raw);
                return ` ${item.dataset.label}: ${val} €`;
              },
              afterBody: (items) => {
                const yr = parseInt(items[0].label);
                const lines = [];
                if (count >= 1) {
                  const a1 = yr - kid1Birth;
                  const st1 = a1 < 0 ? 'chưa sinh' : (a1 < 18 ? `${a1} tuổi (Đi học)` : (a1 <= 23 ? `${a1} tuổi (Đại học)` : `${a1} tuổi (Tự lập)`));
                  lines.push(`• Bé 1 (sinh ${kid1Birth}): ${st1}`);
                }
                if (count >= 2) {
                  const a2 = yr - kid2Birth;
                  const st2 = a2 < 0 ? 'chưa sinh' : (a2 < 18 ? `${a2} tuổi (Đi học)` : (a2 <= 23 ? `${a2} tuổi (Đại học)` : `${a2} tuổi (Tự lập)`));
                  lines.push(`• Bé 2 (sinh ${kid2Birth}): ${st2}`);
                }
                return lines;
              }
            }
          },
          legend: {
            labels: { color: '#94a3b8', font: { size: 11 } }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              font: { size: 10 },
              maxTicksLimit: 14
            }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              callback: (val) => `${new Intl.NumberFormat('fr-FR').format(val)} €`
            }
          }
        }
      }
    });
  }

  function initFamilyChildrenSimulation() {
    try {
      const selCount = document.getElementById("sel-family-kids-count");
      const selStatus = document.getElementById("sel-family-status");
      const inpKid1 = document.getElementById("inp-kid1-birth");
      const inpKid2 = document.getElementById("inp-kid2-birth");
      const inpKidCost = document.getElementById("inp-kid-cost-monthly");
      const inpKidUni = document.getElementById("inp-kid-uni-monthly");

      [selCount, selStatus, inpKid1, inpKid2, inpKidCost, inpKidUni].forEach(el => {
        if (el) {
          const syncTab4ToPlan = () => {
            const plan = getActivePlan();
            if (!plan.familyPlan) plan.familyPlan = { enabled: true, kidsCount: 2, status: 'couple', kid1Birth: 2022, kid2Birth: 2025, kidCostMonthly: 350, kidUniMonthly: 900 };
            if (selCount) plan.familyPlan.kidsCount = parseInt(selCount.value) || 0;
            if (selStatus) plan.familyPlan.status = selStatus.value || 'couple';
            if (inpKid1) plan.familyPlan.kid1Birth = parseInt(inpKid1.value) || 2022;
            if (inpKid2) plan.familyPlan.kid2Birth = parseInt(inpKid2.value) || 2025;
            if (inpKidCost) plan.familyPlan.kidCostMonthly = parseFloat(inpKidCost.value) || 350;
            if (inpKidUni) plan.familyPlan.kidUniMonthly = parseFloat(inpKidUni.value) || 900;
            savePlansToStorage();
            updateFamilyStreamUI(plan);
            renderExpensePeriodsSummary(plan);
            updateCashflowBalanceUI(plan);
            updateAll();
          };
          el.addEventListener("input", syncTab4ToPlan);
          el.addEventListener("change", syncTab4ToPlan);
        }
      });

      updateFamilyChildrenSimulation();
    } catch (e) {
      console.warn("Family children simulation init error:", e);
    }
  }

  function updateEstateMilestones(plan, proj) {
    if (!plan) plan = getActivePlan();
    if (!proj) proj = window.RetirementEngine.runProjection(plan);

    const milestoneBox = document.getElementById("estate-milestone-box");
    const target = Number(plan.targetLegacy) || 1000000000;
    const finalVal = proj.finalTotalNetWorth !== undefined ? proj.finalTotalNetWorth : proj.finalPortfolio;
    const pct = target > 0 ? Math.round((finalVal / target) * 100) : 100;

    const lblTarget = document.getElementById("lbl-estate-legacy-target");
    if (lblTarget) lblTarget.innerText = window.RetirementEngine.formatCurrency(target, state.currency);

    const lblFinal = document.getElementById("lbl-estate-legacy-final");
    if (lblFinal) lblFinal.innerText = `Dự kiến: ${window.RetirementEngine.formatCurrency(finalVal, state.currency)} (ở ${plan.lifeExpectancy || 85}t)`;

    const lblPct = document.getElementById("lbl-estate-legacy-pct");
    if (lblPct) {
      lblPct.innerText = `Tiến độ: ${pct}%`;
      lblPct.style.color = pct >= 100 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444';
    }

    const lblAge = document.getElementById("lbl-estate-legacy-age");
    if (lblAge) lblAge.innerText = `${plan.lifeExpectancy || 85} tuổi (Cuối đời)`;

    if (!milestoneBox) return;

    const isSurplus = finalVal >= target;
    const diff = Math.abs(finalVal - target);
    const barColor = pct >= 100 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444';
    const statusText = pct >= 100 ? 'Đạt & Vượt Mục Tiêu' : pct >= 70 ? 'Tiệm Cận Mục Tiêu' : 'Chưa Đạt Mục Tiêu';

    milestoneBox.innerHTML = `
      <div style="padding: 0.2rem 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem; flex-wrap: wrap; gap: 0.4rem;">
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">Tiến Độ Tích Lũy Di Sản:</span>
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <span style="font-size: 0.7rem; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 700; background: ${isSurplus ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}; color: ${isSurplus ? '#059669' : '#d97706'}; border: 1px solid ${isSurplus ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'};">${statusText}</span>
            <strong class="${pct >= 100 ? 'text-success' : 'text-warning'} font-mono" style="font-size: 0.95rem;">${pct}%</strong>
          </span>
        </div>
        <div style="background: var(--bg-input); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 0.55rem; border: 1px solid var(--border-subtle);">
          <div style="width: ${Math.min(100, pct)}%; height: 100%; background: ${barColor}; transition: width 0.3s ease;"></div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.45rem; margin-bottom: 0.5rem;">
          <div style="background: var(--bg-card-hover); padding: 0.45rem 0.55rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.68rem; color: var(--text-muted);">Dự kiến ở tuổi ${plan.lifeExpectancy || 85}</div>
            <div style="font-weight: 700; color: #0284c7; font-size: 0.82rem; font-family: var(--font-mono, monospace);">${window.RetirementEngine.formatCurrency(finalVal, state.currency)}</div>
          </div>
          <div style="background: var(--bg-card-hover); padding: 0.45rem 0.55rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.68rem; color: var(--text-muted);">${isSurplus ? 'Thặng dư thừa kế (+)' : 'Khoảng thiếu hụt (-)'}</div>
            <div style="font-weight: 700; color: ${isSurplus ? '#059669' : '#e11d48'}; font-size: 0.82rem; font-family: var(--font-mono, monospace);">${isSurplus ? '+' : '-'}${window.RetirementEngine.formatCurrency(diff, state.currency)}</div>
          </div>
        </div>
        <p style="font-size: 0.74rem; color: var(--text-muted); margin: 0; line-height: 1.4;">
          ${isSurplus 
            ? `Bạn có đủ thặng dư di sản vượt mức mục tiêu <strong>${window.RetirementEngine.formatCurrency(target, state.currency)}</strong>. Tài sản này có thể tự do chuyển giao cho con cái hoặc từ thiện.`
            : `Dự kiến danh mục ở tuổi ${plan.lifeExpectancy || 85} đạt <strong>${window.RetirementEngine.formatCurrency(finalVal, state.currency)}</strong>, còn thiếu <strong>${window.RetirementEngine.formatCurrency(diff, state.currency)}</strong> so với mục tiêu.`
          }
        </p>
      </div>
    `;
  }

  function renderEstateTab() {
    renderHealthTab();
  }

  // -------------------------------------------------------------
  // TAB 7: AI Advisor & Recommendations
  // -------------------------------------------------------------
  function renderAdvisorTab() {
    const plan = getActivePlan();
    const proj = window.RetirementEngine.runProjection(plan);

    document.getElementById("advisor-score-num").innerText = proj.readinessScore;
    document.getElementById("advisor-score-verdict").innerText = 
      proj.readinessScore >= 90 ? "Sẵn sàng Tuyệt vời" :
      proj.readinessScore >= 75 ? "Kế hoạch Khả thi" : "Cần Tối ưu thêm";

    const recommendationsContainer = document.getElementById("advisor-recommendations");

    let recs = [];
    const isFrancoViet = plan.taxRegime === 'france_vietnam' || plan.currency === 'EUR' || plan.id === 'plan_franco_viet';

    if (isFrancoViet) {
      recs = [
        {
          tag: "tag-opportunity",
          title: "Geo-arbitrage: Nghỉ hưu sớm hơn 12 năm nhờ Chênh lệch Sức mua",
          text: `Bạn tích lũy thu nhập bằng EUR (€) tại Pháp nhưng sẽ chi tiêu bằng VND (₫) tại Việt Nam. Chi phí sống sung túc tại VN (~30 triệu ₫/tháng ≈ 1,100 €) chỉ bằng 1/3 chi phí tại Pháp. Nhờ đó, số tiền cần để đạt FIRE giảm ngoạn mục từ 800,000 € xuống chỉ còn khoảng 300,000 € - 330,000 €! Bạn hoàn toàn có thể FIRE ở tuổi 40-42.`,
          action: "Xem dự báo Dòng tiền →",
          targetTab: "tab-projections"
        },
        {
          tag: "tag-strategy",
          title: "Tối ưu Tài khoản PEA (Plan d'Épargne en Actions - Trần 150k€)",
          text: `Tận dụng tối đa hạn mức PEA 150,000 € vào các quỹ ETF tích lũy toàn cầu (MSCI World CW8 / S&P 500). Theo luật thuế Pháp từ 2012, khi chuyển cư trú thuế về Việt Nam, bạn vẫn ĐƯỢC PHÉP GIỮ NGUYÊN tài khoản PEA tại ngân hàng/broker Pháp (BoursoBank, Fortuneo) mà không bị ép đóng tài khoản!`,
          action: "Xem tab Tối ưu Thuế →",
          targetTab: "tab-taxes"
        },
        {
          tag: "tag-opportunity",
          title: "Lương hưu Pháp (Agirc-Arrco & CNAV) không hề bị mất",
          text: `Số quý (trimestres) bạn đóng góp tại Pháp từ 23 đến 42 tuổi (~76 quý) sẽ được bảo lưu. Khi bạn bước sang tuổi 65, quỹ hưu trí Pháp sẽ chi trả lương hưu quốc tế hàng tháng (ước tính 500 - 800 €/tháng), gửi trực tiếp vào tài khoản ngân hàng của bạn tại Việt Nam.`,
          action: "Xem Dòng tiền Hưu trí →",
          targetTab: "tab-projections"
        },
        {
          tag: "tag-critical",
          title: "Hiệp định Tránh Đánh thuế Hai lần (France-Vietnam Tax Treaty)",
          text: `Khi về Việt Nam sinh sống trên 183 ngày/năm, bạn trở thành cư dân thuế Việt Nam. Nhờ Hiệp định Tránh đánh thuế 2 lần (Convention Fiscale 1992), bạn không bị Pháp đánh thuế kép trên các khoản thu nhập đầu tư quốc tế.`,
          action: "Xem tab Tối ưu Thuế →",
          targetTab: "tab-taxes"
        }
      ];
    } else {
      recs = [
        {
          tag: "tag-strategy",
          title: "Áp dụng Lan can Guyton-Klinger để chống Lạm phát",
          text: `Thay vì rút cố định 4% cứng nhắc, chiến lược Guyton-Klinger giúp bạn rút tiền nhiều hơn khi thị trường thăng hoa và tự động phòng vệ khi thị trường điều chỉnh.`,
          action: "Xem Dòng tiền & Tài sản →",
          targetTab: "tab-projections"
        },
        {
          tag: "tag-critical",
          title: "Quỹ Dự phòng 2 Năm Tiền mặt (Cash Buffer)",
          text: `Để vô hiệu hóa rủi ro Sequence of Returns Risk, bạn nên duy trì 2 năm chi tiêu (${window.RetirementEngine.formatCurrency(plan.retirementExpenses * 2, state.currency)}) ở dạng tiền gửi linh hoạt hoặc trái phiếu ngắn hạn.`,
          action: "Xem Quạt Monte Carlo trên biểu đồ →",
          targetTab: "tab-projections"
        },
        {
          tag: "tag-opportunity",
          title: "Mô hình Chi tiêu Spending Smile Giảm áp lực",
          text: `Nhu cầu chi tiêu ở độ tuổi 70-80 thường giảm 15-20% so với độ tuổi 45-60. Điều này giúp hạ thấp số tiền mục tiêu cần tích lũy đi đáng kể.`,
          action: "Xem Chi tiêu Smile →",
          targetTab: "tab-estate"
        }
      ];
    }

    recommendationsContainer.innerHTML = recs.map(r => `
      <div class="advisor-card" data-tab="${r.targetTab}" role="button" tabindex="0" title="Nhấp để ${r.action}">
        <span class="advisor-card-tag ${r.tag}">${r.tag.replace('tag-', '').toUpperCase()}</span>
        <h4 class="advisor-card-title">${r.title}</h4>
        <p class="advisor-card-text">${r.text}</p>
        <button type="button" class="advisor-card-action btn-advisor-action" data-tab="${r.targetTab}">${r.action}</button>
      </div>
    `).join("");

    recommendationsContainer.querySelectorAll(".advisor-card").forEach(card => {
      card.addEventListener("click", () => {
        const tab = card.getAttribute("data-tab");
        if (tab) switchTab(tab);
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const tab = card.getAttribute("data-tab");
          if (tab) switchTab(tab);
        }
      });
    });
  }

  const Tab2Exports = {
    init: initHealthTabEvents,
    bindEvents: bindTab2Events,
    updateBioAge,
    updateBiomarkersForGender,
    updateHealthspanScore,
    updateCrossBorderChecklist,
    switchHealthMember,
    updateCoupleHealthOverview,
    renderHealthTab,
    renderEstateTab,
    renderAdvisorTab,
    updateSeniorCareUI,
    updateFamilyStreamUI,
    updateFamilyChildrenSimulation,
    renderFamilyCashFlowChart,
    initFamilyChildrenSimulation,
    updateEstateMilestones
  };

  window.HealthTabUI = Tab2Exports;
  window.Tab2HealthUI = Tab2Exports;
  Object.assign(window, Tab2Exports);

})();
