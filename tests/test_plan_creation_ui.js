/**
 * Bộ kiểm thử tự động không cần trình duyệt (Headless UI Logic Test)
 * Kiểm tra 12 trường hợp tương tác của Modal Tạo Kế Hoạch Mới & Các Quy Tắc Hiển Thị UI
 * 
 * Chạy bằng lệnh: node tests/test_plan_creation_ui.js
 */

const fs = require('fs');
const vm = require('vm');
const path = require('path');

console.log("======================================================================");
console.log("🚀 BỘ KIỂM THỬ TỰ ĐỘNG CÁC TRƯỜNG HỢP UI — TẠO KẾ HOẠCH MỚI (pyRetrait)");
console.log("======================================================================\n");

// 1. Xây dựng Mock DOM tối giản chuẩn HTML5
class MockClassList {
  constructor(el) {
    this.classes = new Set();
    this.el = el;
  }
  add(...cls) { cls.forEach(c => this.classes.add(c)); }
  remove(...cls) { cls.forEach(c => this.classes.delete(c)); }
  toggle(c, force) {
    if (force !== undefined) {
      if (force) this.classes.add(c);
      else this.classes.delete(c);
      return force;
    }
    if (this.classes.has(c)) { this.classes.delete(c); return false; }
    this.classes.add(c); return true;
  }
  contains(c) { return this.classes.has(c); }
  toString() { return Array.from(this.classes).join(' '); }
}

class MockElement {
  constructor(id, tag = 'div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.style = {};
    this.dataset = {};
    this.classList = new MockClassList(this);
    this.value = '';
    this.innerText = '';
    this.textContent = '';
    this.innerHTML = '';
    this.disabled = false;
    this.children = [];
    this._attributes = {};
  }
  addEventListener(event, cb) {}
  removeEventListener(event, cb) {}
  setAttribute(k, v) { this._attributes[k] = v; }
  getAttribute(k) { return this._attributes[k] || null; }
  querySelector(selector) {
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      return this.children.find(c => c.classList && c.classList.contains(cls)) || null;
    }
    return null;
  }
  querySelectorAll(selector) {
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      return this.children.filter(c => c.classList && c.classList.contains(cls));
    }
    return [];
  }
}

// 2. Thiết lập cây DOM mô phỏng
const domElements = new Map();
function getOrCreateElement(id, tag = 'div') {
  if (!domElements.has(id)) {
    domElements.set(id, new MockElement(id, tag));
  }
  return domElements.get(id);
}

// Các element trong Modal
getOrCreateElement('plan-modal');
getOrCreateElement('plan-modal-title');
getOrCreateElement('inp-new-plan-name', 'input');
getOrCreateElement('btn-plan-gender-male', 'button');
getOrCreateElement('btn-plan-gender-female', 'button');
getOrCreateElement('btn-plan-fam-single', 'button');
getOrCreateElement('btn-plan-fam-married', 'button');
getOrCreateElement('btn-plan-mode-domestic', 'button');
getOrCreateElement('btn-plan-mode-relocate', 'button');
getOrCreateElement('btn-plan-mode-hybrid', 'button');
getOrCreateElement('inp-plan-work-city', 'select');
getOrCreateElement('inp-plan-retire-city', 'select');
getOrCreateElement('flag-plan-work');
getOrCreateElement('flag-plan-retire');
getOrCreateElement('tag-plan-retire-ppp');
getOrCreateElement('arrow-plan-transition');
getOrCreateElement('inp-new-plan-template', 'select');
getOrCreateElement('plan-selector', 'select');

// Các element trong Tab 1 bị ảnh hưởng bởi profile hưu trí
getOrCreateElement('card-dual-inflation-stream');
getOrCreateElement('retire-location-radios');
getOrCreateElement('card-lmnp-income-stream');
getOrCreateElement('card-bhxh-income-stream');
getOrCreateElement('box-spouse-birth-year');
getOrCreateElement('badge-pension-status');
getOrCreateElement('lbl-french-pension-total-title');
getOrCreateElement('lbl-bhxh-col-spouse1-title');
getOrCreateElement('lbl-bhxh-col-spouse2-title');
getOrCreateElement('lbl-bhxh-spouse1-claim-title');
getOrCreateElement('lbl-bhxh-spouse2-claim-title');

// Grid & Columns cho French Pension
const frenchBody = getOrCreateElement('french-inputs-body');
const frenchGrid = new MockElement('french-grid');
frenchGrid.classList.add('spouse-pension-grid');
const frenchCol1 = new MockElement('french-col-1');
frenchCol1.classList.add('spouse-col-card');
const frenchCol2 = new MockElement('french-col-2');
frenchCol2.classList.add('spouse-col-card');
frenchBody.children = [frenchGrid, frenchCol1, frenchCol2];

// Grid & Columns cho BHXH VN
const bhxhBody = getOrCreateElement('bhxh-inputs-body');
const bhxhGrid = new MockElement('bhxh-grid');
bhxhGrid.classList.add('spouse-pension-grid');
const bhxhCol1 = new MockElement('bhxh-col-1');
bhxhCol1.classList.add('spouse-col-card');
const bhxhCol2 = new MockElement('bhxh-col-2');
bhxhCol2.classList.add('spouse-col-card');
bhxhBody.children = [bhxhGrid, bhxhCol1, bhxhCol2];

// Mock Document & Window
let alertMessages = [];
global.window = global;
global.window.dispatchEvent = () => true;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.CustomEvent = class CustomEvent {
  constructor(type, opt) {
    this.type = type;
    this.detail = opt ? opt.detail : null;
  }
};
const mockDocElement = new MockElement('html', 'html');
const mockBody = new MockElement('body', 'body');
global.document = {
  documentElement: mockDocElement,
  body: mockBody,
  getElementById: (id) => getOrCreateElement(id),
  querySelectorAll: (sel) => [],
  addEventListener: () => {}
};
global.alert = (msg) => { alertMessages.push(msg); };
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); }
};

// 3. Nạp mã nguồn dự án vào Context
const projectRoot = path.resolve(__dirname, '..');
const filesToLoad = [
  'frontend/js/i18n.js',
  'frontend/js/state.js',
  'frontend/js/taxOptimizer.js',
  'frontend/js/monteCarlo.js',
  'frontend/js/engine.js',
  'frontend/js/ui-modals.js',
  'frontend/js/ui-tab1-streams.js'
];

for (const rel of filesToLoad) {
  const fullPath = path.join(projectRoot, rel);
  const code = fs.readFileSync(fullPath, 'utf8');
  vm.runInThisContext(code, { filename: fullPath });
}

// Khởi tạo State ban đầu nếu rỗng
if (window.AppState && typeof window.AppState.initPlans === 'function') {
  window.AppState.initPlans();
}
if (!window.AppState.getActivePlan()) {
  const fallbackPlan = {
    id: "plan_franco_viet",
    name: "Kế hoạch Mẫu Franco-Viet FIRE",
    currentAge: 29,
    retirementAge: 43,
    endAge: 85,
    gender: "male",
    maritalStatus: "single",
    taxParts: 1.0,
    workCountry: "FR",
    retireCountry: "VN",
    workCity: "fr_paris",
    retireCity: "vn_hcm_hn",
    retireMode: "relocate",
    currency: "EUR",
    incomes: [{ name: "Lương chính", amount: 25000, startAge: 29, endAge: 43, growth: 2.5, isSalary: true, isPrimarySalary: true }]
  };
  window.AppState.getState().plansData.plans["plan_franco_viet"] = fallbackPlan;
  window.AppState.setActivePlanId("plan_franco_viet");
}

// 4. Test Runner Harness
let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} - Chi tiết: ${details}`);
    failed++;
  }
}

// ======================================================================
// THỰC THI 12 TEST CASES
// ======================================================================

console.log("--- NHÓM 1: TÌNH TRẠNG HÔN NHÂN & BỐ CỤC GIA ĐÌNH ---");

// Test 1: Tạo kế hoạch Cá nhân (Single)
(function testSinglePlan() {
  const nameInp = getOrCreateElement('inp-new-plan-name');
  nameInp.value = "Kế Hoạch Độc Thân 30t";
  
  window.ModalsUI.setPlanGender('male');
  window.ModalsUI.setPlanFamily('single');
  window.ModalsUI.saveNewPlanFromModal();
  
  const plan = window.AppState.getActivePlan();
  assert(plan.maritalStatus === 'single', "Test 1.1: maritalStatus lưu thành công 'single'");
  assert(plan.taxParts === 1.0, "Test 1.2: Suất thuế gia cảnh taxParts = 1.0 cho cá nhân");
  
  // Kiểm tra visibility quy tắc UI
  window.Tab1StreamsUI.applyProfileVisibilityRules(plan);
  const boxSpouse = getOrCreateElement('box-spouse-birth-year');
  assert(boxSpouse.style.display === 'none', "Test 1.3: Khối năm sinh bạn đời bị ẩn khi chọn Cá nhân");
  
  const frenchCol2 = getOrCreateElement('french-inputs-body').children[2];
  assert(frenchCol2.style.display === 'none', "Test 1.4: Cột lương hưu bạn đời (Pháp) bị ẩn");
  
  const hasSpouseSalary = plan.incomes.some(i => i.isSpouseSalary);
  assert(!hasSpouseSalary, "Test 1.5: Không tự tạo thẻ lương bạn đời cho kế hoạch cá nhân");
})();

// Test 2: Tạo kế hoạch Vợ chồng (Couple / Married)
(function testCouplePlan() {
  const nameInp = getOrCreateElement('inp-new-plan-name');
  nameInp.value = "Kế Hoạch Vợ Chồng Đồng Hành";
  
  window.ModalsUI.setPlanGender('male');
  window.ModalsUI.setPlanFamily('married');
  window.ModalsUI.saveNewPlanFromModal();
  
  const plan = window.AppState.getActivePlan();
  assert(plan.maritalStatus === 'married', "Test 2.1: maritalStatus lưu thành công 'married'");
  assert(plan.taxParts === 2.0, "Test 2.2: Suất thuế gia cảnh taxParts = 2.0 cho 2 vợ chồng");
  
  window.Tab1StreamsUI.applyProfileVisibilityRules(plan);
  const boxSpouse = getOrCreateElement('box-spouse-birth-year');
  assert(boxSpouse.style.display === '', "Test 2.3: Khối năm sinh bạn đời hiển thị cho cặp đôi");
  
  const frenchCol2 = getOrCreateElement('french-inputs-body').children[2];
  assert(frenchCol2.style.display === '', "Test 2.4: Cột lương hưu bạn đời hiển thị 2 cột song hành");
  
  const spouseSalary = plan.incomes.find(i => i.isSpouseSalary);
  assert(!!spouseSalary, "Test 2.5: Tự động bổ sung thẻ 'Lương hiện tại của bạn đời'");
  assert(spouseSalary && spouseSalary.amount > 0, "Test 2.6: Mức lương bạn đời được ước tính hợp lý");
})();

console.log("\n--- NHÓM 2: GIỚI TÍNH & TUỔI NGHỈ HƯU BHXH THEO LUẬT ---");

// Test 3: Giới tính Nam (Male: Nam 62t, Bạn đời Nữ 60t)
(function testGenderMale() {
  const plan = window.AppState.getActivePlan();
  plan.gender = 'male';
  window.Tab1StreamsUI.applyProfileVisibilityRules(plan);
  
  const title1 = getOrCreateElement('lbl-bhxh-col-spouse1-title').innerText;
  const claim1 = getOrCreateElement('lbl-bhxh-spouse1-claim-title').innerText;
  assert(title1.includes("Nam — 62t"), "Test 3.1: Tiêu đề cột bạn là Nam 62 tuổi");
  assert(claim1.includes("62t"), "Test 3.2: Tuổi nhận BHXH bạn là 62t");
  
  const title2 = getOrCreateElement('lbl-bhxh-col-spouse2-title').innerText;
  assert(title2.includes("Nữ — 60t"), "Test 3.3: Bạn đời tự động mang giới tính Nữ 60 tuổi");
})();

// Test 4: Giới tính Nữ (Female: Nữ 60t, Bạn đời Nam 62t)
(function testGenderFemale() {
  const plan = window.AppState.getActivePlan();
  plan.gender = 'female';
  window.Tab1StreamsUI.applyProfileVisibilityRules(plan);
  
  const title1 = getOrCreateElement('lbl-bhxh-col-spouse1-title').innerText;
  const claim1 = getOrCreateElement('lbl-bhxh-spouse1-claim-title').innerText;
  assert(title1.includes("Nữ — 60t"), "Test 4.1: Tiêu đề cột bạn là Nữ 60 tuổi");
  assert(claim1.includes("60t"), "Test 4.2: Tuổi nhận BHXH bạn là 60t");
  
  const title2 = getOrCreateElement('lbl-bhxh-col-spouse2-title').innerText;
  assert(title2.includes("Nam — 62t"), "Test 4.3: Bạn đời tự động mang giới tính Nam 62 tuổi");
})();

console.log("\n--- NHÓM 3: QUỐC GIA & CHẾ ĐỘ NGHỈ HƯU (FR / VN / CROSS-BORDER) ---");

// Test 5: Nội địa Pháp (FR -> FR)
(function testDomesticFrance() {
  const plan = window.AppState.getActivePlan();
  plan.workCountry = 'FR';
  plan.retireCountry = 'FR';
  plan.retireMode = 'domestic';
  
  window.Tab1StreamsUI.applyProfileVisibilityRules(plan);
  
  const boxCrossBorder = getOrCreateElement('box-crossborder-inflation');
  const boxDomestic = getOrCreateElement('box-domestic-inflation');
  assert(boxCrossBorder.style.display === 'none' && boxDomestic.style.display === 'block', "Test 5.1: Ẩn lạm phát kép xuyên biên giới, bật lạm phát nội địa khi ở Pháp");
  
  const cardLmnp = getOrCreateElement('card-lmnp-income-stream');
  assert(cardLmnp.style.display === '', "Test 5.2: Hiển thị thẻ BĐS LMNP Pháp");
  
  const cardBhxh = getOrCreateElement('card-bhxh-income-stream');
  assert(cardBhxh.style.display === 'none', "Test 5.3: Ẩn thẻ BHXH Việt Nam khi ở Pháp thuần túy");

  const cardFrench = getOrCreateElement('card-french-pension-stream');
  assert(cardFrench.style.display === '', "Test 5.4: Hiển thị thẻ lương hưu Pháp khi làm việc tại Pháp");

  const cardKids = getOrCreateElement('card-children-family-stream');
  const cardExpense = getOrCreateElement('card-retire-expense-stream');
  const cardSenior = getOrCreateElement('card-senior-care-stream');
  assert(cardKids.style.display === '' && cardExpense.style.display === '' && cardSenior.style.display === '', "Test 5.5: Các thẻ chung (Con cái, Chi tiêu hưu trí, Chăm sóc tuổi già) luôn luôn hiển thị");
})();

// Test 6: Xuyên biên giới Pháp -> Việt Nam (FR -> VN)
(function testRelocateFranceToVn() {
  const plan = window.AppState.getActivePlan();
  plan.workCountry = 'FR';
  plan.retireCountry = 'VN';
  plan.retireMode = 'relocate';
  
  window.Tab1StreamsUI.applyProfileVisibilityRules(plan);
  
  const cardDualInf = getOrCreateElement('card-dual-inflation-stream');
  assert(cardDualInf.style.display === '', "Test 6.1: Hiển thị lạm phát kép & trôi dạt tỷ giá EUR/VND");
  
  const cardLmnp = getOrCreateElement('card-lmnp-income-stream');
  assert(cardLmnp.style.display === '', "Test 6.2: Vẫn hiển thị dòng tiền LMNP Pháp mang về VN");
  
  const cardBhxh = getOrCreateElement('card-bhxh-income-stream');
  assert(cardBhxh.style.display === '', "Test 6.3: Hiển thị BHXH Việt Nam cho người về VN");

  const cardFrench = getOrCreateElement('card-french-pension-stream');
  assert(cardFrench.style.display === '', "Test 6.4: Bật cả thẻ lương hưu Pháp và thẻ BHXH VN khi nơi làm việc khác nơi nghỉ hưu");
})();

// Test 7: Thuần nội địa Việt Nam (VN -> VN)
(function testPureVietnam() {
  const nameInp = getOrCreateElement('inp-new-plan-name');
  nameInp.value = "Kế Hoạch Sống & Về Hưu Tại Sài Gòn";
  
  const workSelect = getOrCreateElement('inp-plan-work-city');
  const retireSelect = getOrCreateElement('inp-plan-retire-city');
  workSelect.value = 'vn_hcm_hn';
  retireSelect.value = 'vn_hcm_hn';
  
  window.ModalsUI.setPlanRetireMode('domestic');
  window.ModalsUI.saveNewPlanFromModal();
  
  const plan = window.AppState.getActivePlan();
  assert(plan.workCountry === 'VN' && plan.retireCountry === 'VN', "Test 7.1: Quốc gia làm việc và nghỉ hưu là VN");
  assert(plan.taxRegime === 'vietnam_standard', "Test 7.2: Áp dụng biểu thuế lũy tiến Việt Nam chuẩn");
  assert(plan.frenchAccounts && plan.frenchAccounts.peaBalance === 0, "Test 7.3: Tài khoản PEA Pháp được reset về 0");
  
  window.Tab1StreamsUI.applyProfileVisibilityRules(plan);
  const cardLmnp = getOrCreateElement('card-lmnp-income-stream');
  assert(cardLmnp.style.display === '', "Test 7.4: Thẻ BĐS là tài sản chung toàn cầu, vẫn luôn hiển thị đối với hồ sơ Việt Nam & các nước khác");

  const cardFrench = getOrCreateElement('card-french-pension-stream');
  assert(cardFrench.style.display === 'none', "Test 7.5: Ẩn thẻ lương hưu Pháp khi thuần Việt Nam");
  const cardBhxh = getOrCreateElement('card-bhxh-income-stream');
  assert(cardBhxh.style.display === '', "Test 7.6: Hiển thị thẻ lương hưu BHXH Việt Nam khi làm việc tại VN");
})();

console.log("\n--- NHÓM 4: LOGIC TƯƠNG TÁC MODAL & RÀNG BUỘC DỮ LIỆU ---");

// Test 8: Tự động chuyển 'domestic' khi chọn cùng thành phố
(function testAutoDomesticOnSameCity() {
  const workSelect = getOrCreateElement('inp-plan-work-city');
  const retireSelect = getOrCreateElement('inp-plan-retire-city');
  const btnDomestic = getOrCreateElement('btn-plan-mode-domestic');
  const btnRelocate = getOrCreateElement('btn-plan-mode-relocate');
  
  // Đang ở relocate
  btnRelocate.classList.add('active');
  btnDomestic.classList.remove('active');
  retireSelect.value = 'vn_hcm_hn';
  
  // Chọn nơi làm việc chuyển sang VN trùng với nơi nghỉ hưu
  window.ModalsUI.handlePlanWorkCityChange('vn_hcm_hn');
  
  assert(btnDomestic.classList.contains('active'), "Test 8.1: Tự kích hoạt chế độ 1 nơi (domestic)");
  assert(retireSelect.disabled === true, "Test 8.2: Khóa dropdown nơi nghỉ hưu để tránh chọn mâu thuẫn");
})();

// Test 9: Cập nhật Tag PPP So sánh chi phí
(function testPppTagCalculation() {
  const workSelect = getOrCreateElement('inp-plan-work-city');
  const retireSelect = getOrCreateElement('inp-plan-retire-city');
  const tagPpp = getOrCreateElement('tag-plan-retire-ppp');
  const btnDomestic = getOrCreateElement('btn-plan-mode-domestic');
  const btnRelocate = getOrCreateElement('btn-plan-mode-relocate');
  
  // FR -> VN (relocate)
  btnRelocate.classList.add('active');
  btnDomestic.classList.remove('active');
  workSelect.value = 'fr_paris';
  retireSelect.value = 'vn_hcm_hn';
  retireSelect.disabled = false;
  
  window.ModalsUI.updatePlanModalPppTags();
  assert(tagPpp.textContent.includes("Giảm ~"), `Test 9.1: Tag PPP báo giảm chi phí khi về VN (${tagPpp.textContent})`);
  
  // Chuyển sang domestic
  window.ModalsUI.setPlanRetireMode('domestic');
  assert(tagPpp.textContent.includes("Cùng chi phí"), `Test 9.2: Tag PPP báo 'Cùng chi phí' khi ở domestic (${tagPpp.textContent})`);
})();

// Test 10: Validation chặn lưu khi bỏ trống tên kế hoạch
(function testValidationEmptyName() {
  const nameInp = getOrCreateElement('inp-new-plan-name');
  nameInp.value = "   "; // Khoảng trắng
  
  alertMessages = [];
  window.ModalsUI.saveNewPlanFromModal();
  
  assert(alertMessages.length > 0 && alertMessages[0].includes("Vui lòng nhập tên"), "Test 10.1: Chặn lưu và báo alert khi để trống tên kế hoạch");
})();

// Test 11: Nạp kế hoạch ở chế độ Chỉnh Sửa ('edit' mode)
(function testEditModeModal() {
  const plan = window.AppState.getActivePlan();
  plan.name = "Kế hoạch Cần Sửa Tên";
  plan.maritalStatus = 'married';
  plan.gender = 'female';
  plan.workCity = 'fr_lyon';
  plan.retireCity = 'vn_da_nang';
  plan.retireMode = 'relocate';
  
  window.ModalsUI.openModal("Chỉnh sửa", 'edit');
  
  const nameInp = getOrCreateElement('inp-new-plan-name');
  const btnFemale = getOrCreateElement('btn-plan-gender-female');
  const btnMarried = getOrCreateElement('btn-plan-fam-married');
  
  assert(nameInp.value === "Kế hoạch Cần Sửa Tên", "Test 11.1: Modal hiển thị đúng tên kế hoạch đang sửa");
  assert(btnFemale.classList.contains('active'), "Test 11.2: Modal bật đúng giới tính Nữ");
  assert(btnMarried.classList.contains('active'), "Test 11.3: Modal bật đúng đối tượng Vợ Chồng");
})();

// Test 12: Tự động tính ngân sách chi tiêu hưu trí từ dòng tiền (Cashflow-driven Budget)
(function testCashflowDrivenBudget() {
  const budget = window.TaxOptimizer.calculateRetireBudgetFromCashflow({
    monthlyNetIncome: 4000,
    monthlySavings: 1500,
    monthlyMortgagePaidOff: 500,
    workCityKey: 'fr_paris',
    retireCityKey: 'vn_hcm_hn',
    retireMode: 'relocate',
    householdSize: 2
  });
  
  assert(budget && budget.annualRetireTotal > 0, "Test 12.1: Tính toán thành công ngân sách hưu trí tự động");
  assert(budget.annualRetireTotal < (4000 - 1500 - 500) * 12, "Test 12.2: Chi tiêu tại VN được điều chỉnh giảm theo PPP hợp lý");
})();

// ======================================================================
// TỔNG KẾT KẾT QUẢ KIỂM THỬ
// ======================================================================
console.log("\n======================================================================");
console.log(`📊 TỔNG KẾT: Đã kiểm tra ${passed + failed} tiêu chí.`);
console.log(`   - Thành công: ${passed} tiêu chí ✅`);
console.log(`   - Thất bại:   ${failed} tiêu chí ❌`);
console.log("======================================================================\n");

if (failed === 0) {
  console.log("🎉 TẤT CẢ CÁC TRƯỜNG HỢP UI & LOGIC CỦA 'TẠO KẾ HOẠCH MỚI' ĐẠT 100% TIÊU CHUẨN!");
  process.exit(0);
} else {
  console.error("⚠️ CÓ TIÊU CHÍ CHƯA ĐẠT! Vui lòng kiểm tra lại chi tiết phía trên.");
  process.exit(1);
}
