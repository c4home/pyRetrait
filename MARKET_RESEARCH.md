# Market Research & Chien Luoc Canh Tranh: pyRetrait

---

## 1. Tong Quan Thi Truong & Boi Canh (Executive Summary & Market Landscape)

### 1.1. Xu Huong FIRE & Dịch Chuyen Dia Ly Tai Chinh (Geo-Arbitrage)
Phong trao Doc Lap Tai Chinh & Nghi Huu Som (FIRE - Financial Independence, Retire Early) da phat trien tu mot tieu van hoa tai Bac My thanh mot lan song toan cau, dac biet bung no trong nhom chuyen gia cong nghe, tai chinh va tri thuc tre:
- **Khung hoang he thong an sinh xa hoi truyen thong**: Cac dot cai cach huu tri lien tiep tai Chau Au (nhu Cai cach Huu tri Phap 2023 tang tuoi huu len 64 va yeu cau 172 quy dong bao hiem) khien the he lao dong duoi 45 tuoi mat niem tin vao luong huu nha nuoc truyen thong.
- **Su troi day cua Geo-Arbitrage**: Tan dung su chenh lech suc mua (Purchasing Power Parity - PPP), lao dong tri thuc tich luy tai san bang ngoai te manh (EUR, USD) va hoi huong hoac dinh cu tai cac quoc gia co chi phi sinh hoat hop ly nhu Viet Nam, giup giam muc tieu tai san can thiet tu 50% den 65% va rut ngan thoi gian lao dong tu 10 den 15 nam.
- **Cong dong Viet Kieu va Expat**: Cong dong hon 350.000 nguoi Viet tai Phap cung hang tram ngan tri thuc tre tai chau Au va My co nhu cau thiet thuc ve mot cong cu tinh toan da quoc gia ma cac ung dung ban dia tai My hoac Phap khong the giai quyet.

### 1.2. Quy Mo Thi Truong (Market Sizing)
- **TAM (Total Addressable Market)**: Thi truong phan mem quan ly tai san ca nhan va hoach dinh huu tri toan cau (Personal Wealth & Retirement Planning) uoc tinh dat 4.8 ty USD vao nam 2028 voi toc do tang truong CAGR 13.5%/nam.
- **SAM (Serviceable Addressable Market)**: Phan khuc nguoi dung theo duoi FIRE va hoach dinh da quoc gia tai Chau Au, My va Dong Nam A uoc tinh dat 420 trieu USD.
- **SOM (Serviceable Obtainable Market)**: Nhom chuyen gia, ky su goc Viet va expats tai Phap, My, chau Au co nhu cau cau noi tai chinh Franco-Viet / US-Viet voi uoc tinh 15.000 - 30.000 nguoi dung chu dong.

---

## 2. Phan Tich Doi Thu Canh Tranh (Competitive Landscape)

| Doi thu | Thi truong muc tieu | Diem manh | Diem yeu chi mang & Ra rao nguoi dung | Mo hinh gia |
|---|---|---|---|---|
| **ProjectionLab** | Nguoi dung FIRE toan cau, dac biet la My/Chau Au | Giao dien truc quan, mo hinh dong tien da dang kieu What-If | Thu phi dinh ky ($108 - $144/nam); khong ho tro luong huu Phap (172 quy, decote); khong co co che tinh thue Viet Nam hay PPP da tien te Franco-Viet; du lieu luu tru cloud | Subscription hang nam / Lifetime $500+ |
| **Boldin (NewRetirement)** | Nguoi ve huu va lap ke hoach tai My | Tinh thue My cuc sau (Roth conversion, Medicare, RMD) | Chi phuc vu thi truong My; khong co kha nang mo phong dong tien da quoc gia; giao dien phuc tap, bieu phi cao ($120/nam); yeu cau ket noi tai khoan ngan hang My | Subscription hang nam |
| **Finary** | Nha dau tu ca nhan tai Phap & Chau Au | Dong bo tai khoan ngan hang Phap tu dong; tinh phi an danh muc | Thien ve theo doi danh muc tai san (Portfolio Tracker) hon la Engine hoach dinh huu tri (Retirement Engine); khong co mo phong Monte Carlo chuyen sau; phi rat cao (120 - 240 EUR/nam); khong phu hop cho nguoi roi Phap ve VN | Freemium / Subscription cao |
| **FireCalc / cFIREsim / Rich, Dead, Broke** | Cong dong FIRE truyen thong | Mien phi; su dung du lieu lich su thi truong My | Giao dien co lo tu nhung nam 2005 - 2010; khong co hoach dinh bat dong san, thue gia dinh hay dong tien phuc hop; khong the tuy bien theo tung nam | Mien phi |
| **Finhay / TOPI / Tikop (Viet Nam)** | Nguoi tre tich luy tai Viet Nam | De su dung, tich hop san pham tai chinh trong nuoc | Chi la ung dung ban cheo san pham tai chinh (B2C FinTech broker); hoan toan khong co engine tinh toan FIRE doc lap; thieu mo hinh Monte Carlo va hoach dinh thue | Mien phi / An phi tren san pham |

---

## 3. Khoang Trong Thi Truong & Loi The Doc Ban Cua pyRetrait (The Unmet Market Gap)

Hien nay tren thi truong, nguoi dung phai doi mat voi 3 rao can lon:
1. **Su thieu hut giai phap da quoc gia (Cross-Border Blind Spot)**: Cac cong cu cua My (Boldin) khong hieu gi ve tai khoan PEA cua Phap hay Luat Dat dai/Thue Viet Nam. Nguoc lai, cac cong cu Phap (Finary) khong the hoach dinh dong tien khi nguoi dung chuyen noi cu tru thue sang Dong Nam A.
2. **Subscription Fatigue (Hoi chung met moi vi phi thue bao)**: Nguoi dung phai tra 100 - 150 EUR/nam chi de tinh toan mot ke hoach huu tri ma ho chi kiem tra 3-4 lan mot nam.
3. **Quyen rieng tu du lieu (Privacy & Security Fears)**: Nguoi dung giau co hoac co tai san lon rat ngai khai bao toan bo chi tiet tai san, bat dong san va tien tiet kiem len cac nen tang dam may dong bo ngan hang vi lo ngai ro ri du lieu.

### Gia Tri Khac Biet Vuot Troi Cua pyRetrait:
- **He thong chuyen biet Franco-Viet Geo-Arbitrage dau tien**:
  - Tich hop truc tiep mo hinh suc mua PPP theo 3 che do sinh song (100% Phap, 6 thang Phap - 6 thang VN, 100% Viet Nam).
  - Ho tro giu nguyen tai khoan PEA sau khi roi Phap theo luat Phap ngay 20/03/2012.
  - Tinh toan chinh xac Luong huu Phap CNAV va Agirc-Arrco theo Luat Cai cach Huu tri 2023: Chuan 172 quy, muc phat decote -1.25%/quy thieu, tu dong xoa phat o tuoi 67 (*Taux plein automatique a 67 ans*).
  - Tich hop Hiep dinh Tranh danh thue hai lan Phap - Viet 1992.
- **Mo hinh Bat dong san LMNP Reel & Khau hao 0% Thue**:
  - Khong chi tinh dong tien thue nha co ban, pyRetrait mo hinh hoa toan bo bang khau hao tai san (amortissement comptable), dong tien truoc va sau khi tat toan no vay ngan hang, dong thoi dong bo 1-click vao ke hoach FIRE tong the.
- **Kien truc Local-First & Bao mat tuyet doi**:
  - Toan bo phep tinh tai chinh phuc tap (Monte Carlo 1.000 runs, dong tien 50 nam, 4 chien luoc rut tien) chay 100% tren trinh duyet bang Javascript thuan.
  - Du lieu tai san khong bao gio bi gui ve server ben thu ba; ho tro luu tru may chu ca nhan (Self-hosted Docker) hoac chay offline.
- **AI Strategy Advisor Tiet kiem Chi phi**:
  - Tich hop Google Gemini API qua co che cache bang ma bam van tay du lieu (Fingerprint Hash), chi goi API khi co bien tai chinh thay doi, khong lang phi token, co fallback cuc bo heuristic khi khong co mang.
- **Mo hinh Chi tieu 3 Giai doan Thuc te (Spending Smile)**:
  - Cho phep nguoi dung phan chia giai doan nghi huu thanh Go-Go (nang dong), Slow-Go (tiet che), va No-Go (nghi duong va cham soc y te), phan anh sat thuc te sinh hoat hon quy tac rut co dinh co dien.

---

## 4. Ma Tran So Sanh Tinh Nang Chi Tiet (Comparative Feature Matrix)

| Tieu chi & Tinh nang | ProjectionLab | Boldin (NewRetirement) | Finary | **pyRetrait** |
|---|:---:|:---:|:---:|:---:|
| **Kien truc Local-First (Chay offline, bao mat 100%)** | Khong (Cloud) | Khong (Cloud) | Khong (Cloud) | **Co (100% Client-Side)** |
| **Chi phi su dung** | $108 - $144/nam | $120/nam | 120 - 240 EUR/nam | **Mien phi & Ma nguon mo** |
| **Ho tro da tien te thoi gian thuc (EUR / VND / USD)** | Han che | Khong (USD) | Khong (EUR) | **Co (Chuyen doi tuc thi)** |
| **Franco-Viet Geo-Arbitrage & PPP** | Khong | Khong | Khong | **Co (Doc quyen chuyen sau)** |
| **Luong huu Phap (172 quy, decote, xoa phat 67t)** | Khong | Khong | Co ban | **Co (Chuan luat 2023)** |
| **BDS Phap LMNP Reel (Khau hao amortissement 0% thue)** | Khong | Khong | Khong | **Co (Chuyen sau)** |
| **Mo phong Monte Carlo xac dinh (Mulberry32 Seed 42)** | Co (Ngau nhien) | Co | Khong | **Co (Deterministic 100%)** |
| **4 Chien luoc rut tien (Bengen, Guyton-Klinger, VPW, Fixed)** | Co | Co | Khong | **Co (So sanh truc quan)** |
| **Mo hinh chi tieu huu tri 3 giai doan (Spending Smile)** | Co | Co | Khong | **Co (Tich hop san)** |
| **Co che thue My (Roth Ladder, ACA Subsidies)** | Co | Rat manh | Khong | **Co** |
| **Tri tue nhan tao tu van chien luoc (AI Advisor)** | Khong | Co (AI Chat bot) | Co (Co ban) | **Co (Gemini + Cache van tay)** |
| **Quan ly cot moc cuoc doi (Milestone Ribbon & Pins)** | Co | Co | Khong | **Co (Interactive Canvas)** |

---

## 5. Chan Dung Nguoi Dung Muc Tieu (User Personas)

### Persona 1: Ky su / Chuyen gia cong nghe tai Phap (Franco-Viet Expat)
- **Do tuoi**: 28 - 42 tuoi.
- **Thu nhap**: 50.000 - 95.000 EUR/nam.
- **Dac diem tai san**: Co tai khoan PEA da tich luy 50k - 150k EUR vao cac ETF World; so huu 1 - 2 can ho cho thue LMNP tai Phap; da dong bao hiem tu 25 den 45 quy.
- **Muc tieu**: Tich luy tai Phap trong 10-12 nam nua de dat khoang 350.000 - 450.000 EUR, sau do ve Viet Nam (Da Nang hoac TP.HCM) song sung tuc voi chi phi 25 - 35 trieu VND/thang ma khong can di lam toan thoi gian.
- **Diem dau (Pain Point)**: Khong biet khi nao du tien ve VN, khong ro tai khoan PEA co bi dong khong, lo mat quy luong huu da dong tai Phap.

### Persona 2: Chuyen gia tai Viet Nam co thu nhap ngoai te (Remote / Local FIRE)
- **Do tuoi**: 26 - 38 tuoi.
- **Thu nhap**: 2.000 - 6.000 USD/thang tu cong ty nuoc ngoai hoac kinh doanh tu do.
- **Dac diem tai san**: Tien mat tiet kiem, chung khoan Viet Nam, mot phan bat dong san hoac vang.
- **Muc tieu**: Tinh toan so nam can tich luy de dat FIRE tai Viet Nam, thu nghiem cac chien luoc rut tien Bengen 4% hoac Guyton-Klinger de dam bao danh muc khong bi chay trong chu ky suy thoai kinh te.
- **Diem dau**: Cac phan mem nuoc ngoai nhu ProjectionLab khong tinh toan duoc boi canh chi tieu bang VND va qua dat do; file Excel tu tao thi cong kenh va thieu mo phong rui ro Monte Carlo.

### Persona 3: Gia dinh tri thuc trung luu tai Phap huong den Di san & Huu tri
- **Do tuoi**: 40 - 55 tuoi.
- **Dac diem tai san**: Nha o chinh (RP), danh muc BĐS cho thue, hop dong bao hiem nhan tho (Assurance-Vie), 1-2 con nho.
- **Muc tieu**: Toi uu hoa chi phi dai hoc cho con (giai doan 18-23 tuoi), hoach dinh chuyen nhuong tai san giam thue qua co che Demembrement (Nue-propriete theo Dieu 669 CGI), va tinh toan quy du phong vien duong lao (EHPAD).
- **Diem dau**: Thieu cong cu tich hop dong thoi giua dong tien nuoi con, quy di san va hieu qua dong tien thue nha thuc te.

---

## 6. Chien Luoc Dinh Vi & Phat Trien (Go-To-Market & Growth Strategy)

### 6.1. Tuyen Bo Dinh Vi (Positioning Statement)
> *"Doi voi cac chuyen gia va nha dau tu theo duoi Doc Lap Tai Chinh, dac biet la cong dong nguoi Viet da quoc gia (Phap - My - Viet Nam), **pyRetrait** la nen tang hoach dinh huu tri chuyen sau, bao mat va hoan toan mien phi. Khong giong nhu ProjectionLab hay Finary doi hoi thue bao dat do va thieu tinh ban dia, pyRetrait cung cap engine dong tien da quoc gia manh me, giai quyet triet de bai toan Geo-Arbitrage va hoat dong 100% Local-First de bao ve tuyet doi du lieu ca nhan."*

### 6.2. Cac Kenh Tiep Can Trong Tam (Acquisition Channels)
1. **Cac cong dong nguoi Viet tai Phap & Chau Au**:
   - Hoi Sinh vien & Chuyen gia Viet Nam tai Phap (UEVF).
   - Cac nhom Facebook / Zalo: Nguoi Viet tai Phap, Hoi Dau Tu PEA & BDS Phap, Cong dong Expat Phap - Viet.
   - Workshop / Webinar chuyen de: *"Geo-Arbitrage: Tich luy Euro tai Phap, Nghi huu thoi 40 tuoi tai Viet Nam nhu the nao?"*
2. **Cac cong dong FIRE tai Viet Nam & Quoc Te**:
   - Diendan voz.vn (Box f159 - Kinh te / Chung khoan / Bat dong san).
   - Cac group FIRE Viet Nam tren Facebook (FIRE Vietnam, Nghi huu som, Tai chinh ca nhan thong minh).
   - Cong dong Bogleheads va Reddit r/FIRE, r/EuropeFIRE, r/ExpatFinance.
3. **Kenh Content Marketing & Open Source**:
   - Repository GitHub chat luong cao, kem tai lieu huong dan song ngu va vi du so hoc minh hoa de tao do tin cay (Social Proof).
   - Bai viet chuyen sau tren Substack / Medium / Spiderum ve tinh toan toan hoc va kinh te hoc hanh vi trong huu tri.

### 6.3. Lo Trinh Phat Trien San Pham (Product Roadmap)
- **Giai doan 1 (Hien tai - Nganh doc Franco-Viet & US FIRE)**:
  - Hoan thien bo engine 25 tinh nang: Monte Carlo deterministic, LMNP, Luong huu Phap 172 quy, Spending Smile 3 giai doan, Gemini AI Advisor, he thong cot moc Milestone Ribbon.
- **Giai doan 2 (Cong cu Chia se & Xuat ban an danh)**:
  - Tinh nang "An danh hoa du lieu ke hoach" (Sanitized Share Link) cho phep nguoi dung xuat ke hoach ra duoi dang an danh cac con so tuyet doi de chia se len dien dan hoac nho cong dong gop y ma khong so lo thong tin ca nhan.
- **Giai doan 3 (Mo rong he sinh thai Expat chau Au)**:
  - Bo sung mo hinh thue va luong huu cho cac quoc gia tiep theo: Duc (Rentenversicherung), Singapore (CPF), va Canada (RRSP/TFSA).
