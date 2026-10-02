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
   $$\text{CashFlow}_{\text{mortgage}} = \text{Rent} - M - \text{Charges} - \text{TaxeFoncière}$$
   (Thường hòa vốn hoặc bù nhẹ khoảng $-300$ đến $-400 €$/tháng để xây dựng tài sản ròng bằng đòn bẩy ngân hàng).
2. **Pha 2: Sau khi tất toán nợ (Post-Debt Passive Surge)**:
   $$\text{CashFlow}_{\text{post-debt}} = \text{Rent} - \text{Charges} - \text{TaxeFoncière}$$
   Toàn bộ tiền thuê được giải phóng thành dòng tiền thụ động ròng (**$+1,400 €$/tháng**).
3. **Đội xe Turo**:
   $$\text{Profit}_{\text{Turo}} = \text{Revenue} - \text{Depreciation} - \text{Insurance} - \text{Maintenance} - \text{PlatformFee} \approx +234 €/\text{tháng}$$
4. **Tích hợp vào Kế hoạch FIRE**:
   Hệ thống chuyển đổi tự động sang các luồng thu nhập với mốc tuổi tương ứng. Khi bước vào tuổi nghỉ hưu, dòng tiền thụ động ròng (+1,635 €/tháng) tự động đối trừ vào chi phí sinh hoạt $\text{Expenses}_t$, giúp giảm đáng kể số tiền cần rút từ danh mục chứng khoán PEA/S&P500.

