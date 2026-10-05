# Tài Liệu Đặc Tả Thuật Toán & Công Thức Tính Toán pyRetrait (Calculation Engine Specification)

Tài liệu này cung cấp chi tiết toán học và cơ chế giải thuật được áp dụng trong lõi tính toán của nền tảng **pyRetrait**.

---

## 1. Giai Đoạn Tích Lũy (Accumulation Phase: $t < \text{Tuổi Nghỉ Hưu}$)

### 1.1. Tăng trưởng Thu nhập theo Luồng (Wage Growth Compounding)
Với mỗi luồng thu nhập $k \in \text{Incomes}$, tại độ tuổi $\text{age}$:
$$\text{Income}_k(\text{age}) = \text{Amount}_k \times (1 + g_k)^{\text{age} - \text{StartAge}_k} \quad (\text{với } \text{StartAge}_k \le \text{age} \le \text{EndAge}_k)$$
Tổng thu nhập danh nghĩa năm $t$:
$$\text{AnnualIncome}(t) = \sum_{k} \text{Income}_k(t)$$

### 1.2. Thuế Thu Nhập Lũy Tiến (Progressive Income Tax)
Theo Biểu thuế lũy tiến Pháp (IR 2024), thu nhập chịu thuế ròng được trừ 10% chi phí chuyên nghiệp (trần 14,171 €):
$$\text{TaxableIncome} = \max(0, \, \text{AnnualIncome} - \min(\text{AnnualIncome} \times 10\%, \, 14171))$$

Thuế thu nhập được tính theo từng bậc (tranches):
$$\text{Tax} = \sum_{i=1}^{M} \tau_i \times \max(0, \, \min(\text{TaxableIncome}, C_i) - C_{i-1})$$
Trong đó $C_i$ là các ngưỡng trần (11,294 €, 28,797 €, 82,341 €, 177,106 €) và $\tau_i$ là thuế suất tương ứng (0%, 11%, 30%, 41%, 45%).

### 1.3. Phân bổ Tiết kiệm & Chi tiêu theo Tỷ lệ Thu nhập (Income Allocation)
Dựa vào Tỷ lệ Tiết kiệm $s = \frac{\text{savingsRate}}{100}$ (ví dụ $s = \frac{1}{3} \approx 33.33\%$):
$$\text{IncomeAfterTax} = \max(0, \, \text{AnnualIncome} - \text{Tax})$$
$$\text{NetSavings}(t) = \text{IncomeAfterTax} \times s$$
$$\text{LivingExpenses}(t) = \text{IncomeAfterTax} \times (1 - s)$$

### 1.4. Tăng trưởng Danh mục Tài sản (Portfolio Compounding)
$$\text{Portfolio}(t+1) = \Big(\text{Portfolio}(t) + \text{NetSavings}(t)\Big) \times (1 + r_{\text{pre}})$$
Trong đó $r_{\text{pre}}$ là tỷ suất sinh lời danh nghĩa bình quân trước nghỉ hưu (mặc định 8.0% - 10.0%/năm).

---

## 2. Giai Đoạn Hưu Trí (Retirement Phase: $t \ge \text{Tuổi Nghỉ Hưu}$)

### 2.1. Bốn Chiến Lược Rút Tiền (Withdrawal Strategies)

#### Chiến lược 1: Quy tắc 4% Cổ điển (Bengen 4% Rule)
- Tại năm đầu nghỉ hưu ($t = 0$): $\text{Withdrawal}_0 = \text{Portfolio}_0 \times \text{SWR}$ (với SWR thường là 4.0%).
- Các năm sau đó, số tiền rút danh nghĩa được điều chỉnh theo lạm phát lũy kế:
  $$\text{Withdrawal}_t = \text{Withdrawal}_0 \times (1 + i)^t$$

#### Chiến lược 2: Lan Can Động Guyton-Klinger (Guardrails Strategy)
Chiến lược tự động điều chỉnh linh hoạt theo diễn biến thị trường để tránh cạn kiệt tài sản:
1. Dự kiến rút tiền danh nghĩa: $\text{Expected}_t = \text{Withdrawal}_{t-1} \times (1 + i)$.
2. Tỷ lệ rút tiền thực tế tức thời: $w_t = \frac{\text{Expected}_t}{\text{Portfolio}_t}$.
3. **Quy tắc Bảo toàn Vốn (Capital Preservation Rule)**:
   $$\text{Nếu } w_t > \text{SWR} \times 1.20 \implies \text{Cắt giảm chi tiêu: } \text{Withdrawal}_t = \text{Expected}_t \times 0.90$$
4. **Quy tắc Thịnh vượng (Prosperity Rule)**:
   $$\text{Nếu } w_t < \text{SWR} \times 0.80 \implies \text{Tăng chi tiêu hưởng thụ: } \text{Withdrawal}_t = \text{Expected}_t \times 1.10$$
5. Ngoài hai trường hợp trên: $\text{Withdrawal}_t = \text{Expected}_t$.

#### Chiến lược 3: Tỷ Lệ Thay Đổi Theo Tuổi Thọ (VPW - Variable Percentage Withdrawal)
Tỷ lệ rút tiền được tính toán lại hàng năm dựa trên số năm sống kỳ vọng còn lại:
$$w_{\text{VPW}}(t) = \frac{1}{\text{LifeExpectancy} - \text{Age}_t + 1} + 0.02$$
$$\text{Withdrawal}_t = \text{Portfolio}_t \times \text{clamp}(w_{\text{VPW}}, 3\%, 12\%)$$

#### Chiến lược 4: Rút Cố Định Theo Danh Mục (Fixed Percentage)
$$\text{Withdrawal}_t = \text{Portfolio}_t \times \text{SWR}$$

---

### 2.2. Cơ Chế Bù Trừ Dòng Tiền Thụ Động & Tái Đầu Tư Thặng Dư
Tại mỗi năm hưu trí, thu nhập thụ động ròng (lương hưu, tiền thuê nhà, cổ tức) được đối trừ với chi phí sinh hoạt $\text{Expenses}_t$:
- **Trường hợp Thu nhập $\ge$ Chi phí sinh hoạt (Thặng dư)**:
  Không cần bán tài sản trong danh mục đầu tư! Toàn bộ khoản tiền thặng dư được tự động tái đầu tư:
  $$\text{Surplus}_t = \text{PassiveIncome}_t - \text{Expenses}_t$$
  $$\text{Portfolio}(t+1) = \Big(\text{Portfolio}(t) + \text{Surplus}_t\Big) \times (1 + r_{\text{post}})$$
- **Trường hợp Thu nhập < Chi phí sinh hoạt (Thiếu hụt - Deficit)**:
  Khoản thiếu hụt được bù đắp từ danh mục đầu tư:
  $$\text{Deficit}_t = \text{Expenses}_t - \text{PassiveIncome}_t$$
  $$\text{ActualWithdrawal}_t = \min\Big(\text{Portfolio}(t), \, \max(\text{Deficit}_t, \, \text{Withdrawal}_t)\Big)$$
  $$\text{Portfolio}(t+1) = \Big(\text{Portfolio}(t) - \text{ActualWithdrawal}_t\Big) \times (1 + r_{\text{post}})$$

---

### 2.3. Mô Hình Chi Tiêu Spending Smile
Mức sống khi nghỉ hưu thay đổi theo các chu kỳ sức khỏe và nhu cầu trải nghiệm:
- **Giai đoạn Go-Go (từ lúc nghỉ hưu đến 55 - 60 tuổi)**: Du lịch, thể thao, khám phá $\implies \text{Hệ số} = 1.15$ (+15%).
- **Giai đoạn Slow-Go (60 - 75 tuổi)**: Sinh hoạt chậm rãi tại nhà $\implies \text{Hệ số} = 0.90$ (-10%).
- **Giai đoạn No-Go (sau 75 tuổi)**: Nhu cầu tiêu dùng cơ bản giảm, quỹ y tế riêng $\implies \text{Hệ số} = 0.80$ (-20%).

### 2.4. Thuật Toán Lương Hưu Pháp & Phạt Décote (French Pension Décote Engine)
Theo Cải cách Hưu trí Pháp 2023 (Réforme des Retraites), mức hưởng lương hưu tối đa (Taux Plein) đòi hỏi người lao động phải tích lũy đủ **172 quý (Trimestres)**, tương đương 43 năm đóng bảo hiểm:

1. **Tính Số Năm & Số Quý Đã Đóng Góp**:
   $$\text{YearsWorked} = \max\Big(0, \, \min(\text{RetireAge}, \text{SSAge}) - \text{StartWorkAge}\Big)$$
   $$\text{QuartersContributed} = \text{YearsWorked} \times 4$$
2. **Hệ Số Tỷ Lệ Đóng (Prorata Quarters Ratio)**:
   $$\text{Prorata} = \frac{\min(172, \, \text{QuartersContributed})}{172}$$
3. **Tính Phạt Thiếu Quý (Décote Penalty)**:
   - Số quý còn thiếu để đạt chuẩn 172 quý:
     $$\text{MissingQuarters} = \max(0, \, 172 - \text{QuartersContributed})$$
   - **Cơ chế Tuổi 67 Tự Động Xóa Phạt (Taux Plein Automatique à 67 ans)**:
     - Nếu người lao động bắt đầu nhận lương hưu từ tuổi $\text{SSAge} \ge 67$:
       $$\text{PenaltyRate} = 0\% \quad (\text{Miễn trừ toàn bộ phạt Décote})$$
     - Nếu nhận lương hưu trước 67 tuổi ($\text{SSAge} < 67$):
       $$\text{PenaltyRate} = \min(25\%, \, \text{MissingQuarters} \times 1.25\%)$$
4. **Tỷ Lệ Lương Hưu Thực Nhận Hiệu Lực (Effective Pension Ratio)**:
   $$\text{EffectivePensionRatio} = \text{Prorata} \times (1 - \text{PenaltyRate})$$
   $$\text{FrenchPensionReceived}(\text{age}) = \text{GrossBasePension} \times \text{EffectivePensionRatio} \quad (\text{với } \text{age} \ge \text{SSAge})$$

### 2.5. Hệ Số Sức Mua Địa Điểm Hưu Trí & Phí Bảo Hiểm CFE (Purchasing Power Parity - PPP)
pyRetrait mô hình hóa sự khác biệt về sức mua giữa Pháp và Việt Nam thông qua hệ số nhân chi phí $k_{\text{loc}}$ và chi phí bảo hiểm quốc tế bổ sung:

$$\text{AdjustedExpenses}(t) = \Big(\text{BaseLivingExpenses} \times k_{\text{loc}}\Big) + \text{CFE\_AnnualCost}$$

Trong đó:
- **Kịch bản 1: 100% Pháp**:
  - $k_{\text{loc}} = 1.00$
  - $\text{CFE\_AnnualCost} = 0 €$
- **Kịch bản 2: Song hành (6 tháng Pháp / 6 tháng Việt Nam)**:
  - $k_{\text{loc}} = 0.70$ (Tiết kiệm 30% chi phí sống tổng thể)
  - $\text{CFE\_AnnualCost} = 0 €$ (Duy trì thẻ Vitale thông thường)
- **Kịch bản 3: 100% Việt Nam (Hồi hương toàn phần)**:
  - $k_{\text{loc}} = 0.45$ (Sức mua tại Việt Nam giúp giảm tới 55% chi phí sinh hoạt)
  - $\text{CFE\_AnnualCost} = 1,800 €/\text{năm}$ (~150 €/tháng duy trì Quỹ CFE + Bảo hiểm Top-up quốc tế)

### 2.6. Quỹ Chăm Sóc Tuổi Già (Senior Care / Dépendance Reserve)
Từ tuổi 78 trở đi, chi phí y tế và chăm sóc đặc biệt (viện dưỡng lão cao cấp hoặc điều dưỡng tại nhà) được kích hoạt:
$$\text{SeniorCare}(\text{age}) = \begin{cases} 
\text{SeniorCareBudget} \times 12, & \text{khi } \text{age} \ge 78 \\
0, & \text{khi } \text{age} < 78 
\end{cases}$$
Khoản chi này được cộng trực tiếp vào tổng chi tiêu hưu trí hàng năm, giúp kiểm thử độ an toàn của danh mục trước rủi ro sức khỏe giai đoạn cuối đời.

---

## 3. Mô Phỏng Monte Carlo & Đo Lường Rủi Ro SRR

Để đo lường rủi ro **Sequence of Returns Risk (SRR)** — nguy cơ thị trường sụp đổ ngay những năm đầu nghỉ hưu:
1. Sinh chuỗi $N = 1,000$ kịch bản tỷ suất sinh lời ngẫu nhiên theo phân phối chuẩn Gaussian:
   $$R_{s, t} \sim \mathcal{N}(\mu, \sigma^2)$$
   Với $\mu$ là tỷ suất lợi nhuận kỳ vọng (ví dụ 8.0%) và $\sigma$ là độ biến động thị trường (thường là 15.0%).
2. Chạy mô phỏng cho từng kịch bản $s \in [1, N]$ qua từng năm dòng đời.
3. Xác suất thành công (Success Rate):
   $$\text{Success Rate} = \frac{\sum_{s=1}^{N} \mathbb{I}(\text{Portfolio}_{s, \text{End}} > 0)}{N} \times 100\%$$
4. Trích xuất các phân vị tài sản tại mỗi năm $t$: $P_{10}(t), P_{25}(t), P_{50}(t) \text{ (Trung vị)}, P_{75}(t), P_{90}(t)$ để vẽ biểu đồ quạt (Fanchart).

---

## 4. Mô Hình Tài Sản Bất Động Sản & Đội Xe (Gestion de Patrimoine Engine)

### 4.1. Lịch Trả Nợ Vay Thế Chấp Pháp (Mortgage Amortization Schedule)
Với khoản vay $P$, lãi suất năm $i_{\text{annual}}$, lãi suất tháng $r = \frac{i_{\text{annual}}}{12}$ và thời hạn vay $n = 12 \times \text{years}$:
Khoản tiền trả góp cố định hàng tháng (*Mensualité*):
$$M = P \times \frac{r(1 + r)^n}{(1 + r)^n - 1}$$
Tại mỗi tháng $m$:
$$\text{Lãi vay}_m = \text{Dư nợ}_{m-1} \times r$$
$$\text{Gốc trả}_m = M - \text{Lãi vay}_m$$
$$\text{Dư nợ}_m = \text{Dư nợ}_{m-1} - \text{Gốc trả}_m$$

### 4.2. Cơ Chế Khấu Hao LMNP 0% Thuế (Amortissement Fiscal)
Theo luật thuế Pháp đối với chế độ **LMNP Réel**:
- Khấu hao phần công trình xây dựng (85% giá trị tài sản): thời gian 25 - 30 năm ($\approx 2.83\% - 3.4\%$/năm).
- Khấu hao đồ đạc nội thất: thời gian 5 - 7 năm ($\approx 14.3\% - 20\%$/năm).
- Khấu hao chi phí cải tạo sửa chữa: thời gian 10 năm ($10\%$/năm).

Thu nhập chịu thuế ròng hàng năm:
$$\text{TaxableIncome}_{\text{LMNP}} = \max\Big(0, \, \text{GrossRent} - \text{Charges} - \text{TaxeFoncière} - \text{MortgageInterest} - \text{Amortization}\Big)$$
Nhờ khoản khấu hao phi tiền mặt (*Amortissement*), $\text{TaxableIncome}_{\text{LMNP}}$ thường bằng **0 € trong suốt 12 – 18 năm đầu**, bảo toàn 100% dòng tiền mà không phát sinh thuế thu nhập cá nhân (IR) hay phụ thu an sinh xã hội Pháp (17.2% Prélèvements Sociaux).

### 4.3. Dòng Tiền 2 Pha & Đồng Bộ Vào FIRE
Dòng tiền ròng được chia thành hai pha rõ rệt:
1. **Pha 1: Đang trong thời gian trả nợ vay (Under Mortgage)**:
   $$\text{CashFlow}_{\text{mortgage}} = \text{EffectiveRent} - M - \text{MonthlyCharges}$$
   (Thường hòa vốn hoặc bù nhẹ khoảng $-100$ đến $-300 €$/tháng để xây dựng tài sản ròng bằng đòn bẩy ngân hàng).
2. **Pha 2: Sau khi tất toán nợ (Post-Debt Passive Surge)**:
   $$\text{CashFlow}_{\text{post-debt}} = \text{EffectiveRent} - \text{MonthlyCharges}$$
   Toàn bộ tiền thuê được giải phóng thành dòng tiền thụ động ròng (**$+1,400 €$/tháng**).
3. **Đội xe Turo**:
   $$\text{Profit}_{\text{Turo}} = \text{Revenue} - \text{Depreciation} - \text{Insurance} - \text{Maintenance} - \text{PlatformFee} \approx +234 €/\text{tháng}$$
4. **Tích hợp vào Kế hoạch FIRE**:
   Hệ thống chuyển đổi tự động sang các luồng thu nhập với mốc tuổi tương ứng. Khi bước vào tuổi nghỉ hưu, dòng tiền thụ động ròng (+1,635 €/tháng) tự động đối trừ vào chi phí sinh hoạt $\text{Expenses}_t$, giúp giảm đáng kể số tiền cần rút từ danh mục chứng khoán PEA/S&P500.

### 4.4. Mô Hình Chi Phí & Dòng Tiền BĐS Thực Tế (Notaire, Vacance, Taxe Foncière)
Để phản ánh chính xác kinh tế học BĐS tại Pháp:
1. **Phí Công Chứng Mua Bán (Frais de Notaire 7.5%)**:
   $$\text{TotalAcquisitionCost} = \text{PurchasePrice} \times 1.075$$
   $$\text{LoanAmount} = \text{TotalAcquisitionCost} - \text{DownPayment}$$
2. **Tỷ Lệ Phòng Trống (Vacance Locative)**:
   $$\text{EffectiveMonthlyRent} = \text{GrossMonthlyRent} \times (1 - \text{VacancyRate})$$
3. **Tổng Chi Phí Vận Hành Hàng Tháng**:
   $$\text{MonthlyCharges} = \frac{\text{CoopCharges} + \text{TaxeFonciere} + \text{PNO\_Insurance} + \text{MaintenanceBudget}}{12}$$
4. **Dòng Tiền Ròng Trực Tiếp (Live Net Cash Flow)**:
   $$\text{NetCashFlow} = \text{EffectiveMonthlyRent} - M - \text{MonthlyCharges}$$

---

## 5. Mô Hình Vòng Đời Gia Đình & Con Cái (Family Lifecycle & Education Engine)

pyRetrait tích hợp mô hình dòng tiền gia đình đa thế hệ dựa trên **Năm sinh của con cái**:

1. **Xác Định Độ Tuổi Của Con Theo Từng Năm Mô Phỏng**:
   $$\text{ChildAge}(t) = \text{SimulationYear}(t) - \text{BirthYear}_{\text{child}}$$
2. **Giai Đoạn Trợ Cấp Gia Đình Pháp (Allocations Familiales Caf)**:
   - Áp dụng khi gia đình có từ 2 con trở lên trong độ tuổi $0 \le \text{ChildAge} < 18$:
     $$\text{CafIncome}(t) \approx 140 € – 320 €/\text{tháng}$$
3. **Giai Đoạn Chi Phí Học Đại Học / Thạc Sĩ (Higher Education)**:
   - Kích hoạt trong khung tuổi $18 \le \text{ChildAge} \le 23$:
     $$\text{AnnualEducationCost} = \text{Tuition} + \text{StudentHousing} + \text{LivingStipend}$$
     (Ước tính từ 6,000 € – 15,000 €/năm/con tùy học tại Pháp hay quốc tế).
4. **Giai Đoạn Trưởng Thành & Hỗ Trợ Ban Đầu (Wedding / Kickstart)**:
   - Tại mốc tuổi $\text{ChildAge} \in [24, 26]$: Khoản hỗ trợ một lần (ví dụ 10,000 € – 30,000 €) được đối trừ vào dòng tiền danh mục.
5. **Hiển Thị Trên Biểu Đồ Family Trajectory**:
   Các đỉnh chi phí đại học được vẽ đè lên đường cong tài sản ròng, giúp cha mẹ chủ động chuẩn bị quỹ học vấn mà không làm gãy đổ lộ trình FIRE.


