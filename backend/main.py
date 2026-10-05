import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Body, Header
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

# Logging configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("pyRetrait")


# Authentication & Multi-user database
from backend.auth import (
    init_db,
    create_user,
    authenticate_user,
    create_token,
    verify_token,
    get_user_by_id,
    get_user_plans,
    save_user_plans,
    get_user_patrimoine,
    save_user_patrimoine,
)

init_db()

app = FastAPI(
    title="pyRetrait - Advanced FIRE & Retirement Planning Engine",
    description="Comprehensive financial independence and early retirement platform",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
PLANS_FILE = DATA_DIR / "plans.json"

# pyLocation Integration Directories & Path
import sys
PYLOCATION_DIR = BASE_DIR / "pyLocation"
if not PYLOCATION_DIR.exists():
    PYLOCATION_DIR = BASE_DIR.parent / "pyLocation"
PYLOCATION_DATA_DIR = PYLOCATION_DIR / "data"
if PYLOCATION_DIR.exists() and str(PYLOCATION_DIR) not in sys.path:
    sys.path.insert(0, str(PYLOCATION_DIR))


# Tải biến môi trường từ file .env nếu có
def _load_env_file(env_path: Path):
    if not env_path.exists():
        return
    try:
        from dotenv import load_dotenv
        load_dotenv(env_path, override=False)
    except Exception:
        pass
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k and k not in os.environ and v:
                    os.environ[k] = v
    except Exception:
        pass

_load_env_file(BASE_DIR / ".env")

# Khởi tạo dữ liệu mẫu nếu chưa có
DEFAULT_PLANS = {
    "activePlanId": "plan_franco_viet",
    "plans": {
        "plan_franco_viet": {
            "id": "plan_franco_viet",
            "name": "🇫🇷 ➔ 🇻🇳 Kế hoạch Franco-Viet FIRE (Pháp ➔ Việt Nam)",
            "currency": "EUR",
            "currentAge": 29,
            "birthYear": 1997,
            "retirementAge": 42,
            "lifeExpectancy": 85,
            "currentSavings": 50000,
            "annualSavings": 18000,
            "annualExpenses": 24000,
            "retirementExpenses": 13200,
            "inflationRate": 2.5,
            "investmentReturnPre": 9.0,
            "investmentReturnPost": 7.5,
            "withdrawalStrategy": "guyton_klinger",
            "initialWithdrawalRate": 4.0,
            "targetLegacy": 100000,
            "taxRegime": "france_vietnam",
            "taxRate": 12.0,
            "socialSecurityAge": 65,
            "socialSecurityAnnual": 7200,
            "assetAllocation": {"stocks": 60, "bonds": 20, "realEstate": 20},
            "assetReturns": {"stocks": 9.5, "bonds": 3.5, "realEstate": 6.5},
            "postAssetAllocation": {"stocks": 40, "bonds": 40, "realEstate": 20},
            "dualInflation": {"enabled": True, "inflationPre": 2.2, "inflationPost": 4.0, "eurVndInitialRate": 27500, "eurVndAnnualDrift": 1.2},
            "mortgage": {
                "enabled": True,
                "name": "Vay mua BĐS tại Pháp (Crédit Immo)",
                "loanAmount": 160000,
                "loanTermYears": 20,
                "interestRate": 2.2,
                "startAge": 29,
                "propertyValue": 200000,
                "propertyAppreciation": 2.5
            },
            "frenchAccounts": {"peaBalance": 35000, "assuranceVieBalance": 10000, "livretABalance": 5000, "ctoBalance": 0},
            "incomes": [
                {"name": "Lương tại Pháp (Net après impôt)", "amount": 42000, "startAge": 29, "endAge": 42, "growth": 3.5, "taxable": True},
                {"name": "Cổ tức / Thu nhập thụ động", "amount": 2400, "startAge": 38, "endAge": 85, "growth": 4.0, "taxable": False}
            ],
            "spendingPhases": {
                "enabled": True,
                "gogoAge": 55,
                "gogoFactor": 1.15,
                "slowgoAge": 70,
                "slowgoFactor": 0.90,
                "nogoFactor": 0.80
            },
            "rothConversion": {"enabled": False, "targetBracket": 12.0, "maxAnnualConversion": 0},
            "healthcare": {"enabled": True, "annualPreMedicare": 800, "annualPostMedicare": 1500, "acaOptimization": False},
            "milestones": [
                {"id": "ms_home", "name": "Mua nhà / Trả trước BĐS", "age": 35, "icon": "🏡", "type": "expense", "amount": 30000, "note": "Đặt cọc mua căn hộ cho thuê", "enabled": True}
            ]
        },
        "plan_baseline": {
            "id": "plan_baseline",
            "name": "Kế hoạch Tiêu chuẩn (Baseline FIRE)",
            "currency": "VND", # hoặc USD
            "currentAge": 32,
            "retirementAge": 45,
            "lifeExpectancy": 85,
            "currentSavings": 1500000000, # 1.5 tỷ VND
            "annualSavings": 360000000,   # 30 tr/tháng = 360tr/năm
            "annualExpenses": 240000000,  # 20 tr/tháng = 240tr/năm
            "retirementExpenses": 300000000, # 25 tr/tháng sau nghỉ hưu
            "inflationRate": 4.0,         # 4% lạm phát VN
            "investmentReturnPre": 10.0,  # 10% lãi suất tích lũy
            "investmentReturnPost": 8.0,  # 8% lãi suất khi hưu trí
            "withdrawalStrategy": "guyton_klinger", # bengen_4pct, guyton_klinger, vpw, fixed_pct, custom
            "initialWithdrawalRate": 4.0,
            "targetLegacy": 1000000000,   # 1 tỷ để lại thừa kế
            "taxRegime": "international", # us hoặc international
            "taxRate": 10.0,              # Thuế thu nhập/đầu tư bình quân
            "socialSecurityAge": 62,
            "socialSecurityAnnual": 72000000, # Lương hưu BHXH 6tr/tháng = 72tr/năm
            "incomes": [
                {"name": "Lương chính & Thưởng", "amount": 600000000, "startAge": 32, "endAge": 45, "growth": 5.0, "taxable": True},
                {"name": "BĐS Cho thuê / Cổ tức", "amount": 120000000, "startAge": 42, "endAge": 85, "growth": 4.0, "taxable": True}
            ],
            "spendingPhases": {
                "enabled": True,
                "gogoAge": 60,
                "gogoFactor": 1.15,
                "slowgoAge": 75,
                "slowgoFactor": 0.90,
                "nogoFactor": 0.80
            },
            "rothConversion": {
                "enabled": True,
                "targetBracket": 15.0,
                "maxAnnualConversion": 200000000
            },
            "healthcare": {
                "enabled": True,
                "annualPreMedicare": 30000000,
                "annualPostMedicare": 15000000,
                "acaOptimization": True
            }
        },
        "plan_aggressive": {
            "id": "plan_aggressive",
            "name": "Nghỉ hưu Cực sớm (Fat FIRE 40 tuổi)",
            "currency": "VND",
            "currentAge": 32,
            "retirementAge": 40,
            "lifeExpectancy": 85,
            "currentSavings": 2500000000,
            "annualSavings": 500000000,
            "annualExpenses": 240000000,
            "retirementExpenses": 360000000,
            "inflationRate": 4.0,
            "investmentReturnPre": 12.0,
            "investmentReturnPost": 8.5,
            "withdrawalStrategy": "vpw",
            "initialWithdrawalRate": 3.8,
            "targetLegacy": 2000000000,
            "taxRegime": "international",
            "taxRate": 10.0,
            "socialSecurityAge": 62,
            "socialSecurityAnnual": 72000000,
            "incomes": [
                {"name": "Kinh doanh & Tư vấn", "amount": 800000000, "startAge": 32, "endAge": 40, "growth": 7.0, "taxable": True},
                {"name": "Thu nhập Thụ động BĐS", "amount": 200000000, "startAge": 40, "endAge": 85, "growth": 4.5, "taxable": True}
            ],
            "spendingPhases": {
                "enabled": True,
                "gogoAge": 55,
                "gogoFactor": 1.20,
                "slowgoAge": 70,
                "slowgoFactor": 0.85,
                "nogoFactor": 0.75
            },
            "rothConversion": {"enabled": False, "targetBracket": 12.0, "maxAnnualConversion": 0},
            "healthcare": {"enabled": True, "annualPreMedicare": 40000000, "annualPostMedicare": 20000000, "acaOptimization": False}
        }
    }
}

if not PLANS_FILE.exists():
    with open(PLANS_FILE, "w", encoding="utf-8") as f:
        json.dump(DEFAULT_PLANS, f, ensure_ascii=False, indent=2)

def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split("Bearer ", 1)[1].strip()
    payload = verify_token(token)
    if payload:
        return {"id": payload["sub"], "email": payload["email"], "name": payload["name"]}
    return None

# ==============================================================================
# Authentication & User Account Endpoints
# ==============================================================================
@app.post("/api/auth/register")
def register_user(payload: Dict[str, Any] = Body(...)):
    email = payload.get("email", "")
    password = payload.get("password", "")
    name = payload.get("name", "")
    
    user, err = create_user(email, password, name)
    if err or not user:
        raise HTTPException(status_code=400, detail=err or "Không thể tạo tài khoản")
    
    # Initialize default starter plans for this user in database
    save_user_plans(user["id"], DEFAULT_PLANS)
    
    # Initialize default starter real estate/patrimoine for this user
    try:
        apts_file = PYLOCATION_DATA_DIR / "saved_apartments.json"
        if apts_file.exists():
            with open(apts_file, "r", encoding="utf-8") as f:
                initial_apts = json.load(f)
                save_user_patrimoine(user["id"], {"apartments": initial_apts})
    except Exception:
        pass

    token = create_token(user["id"], user["email"], user["name"])
    return {
        "status": "success",
        "token": token,
        "user": user,
        "message": "Đăng ký tài khoản thành công!"
    }

@app.post("/api/auth/login")
def login_user(payload: Dict[str, Any] = Body(...)):
    email = payload.get("email", "")
    password = payload.get("password", "")
    
    user, err = authenticate_user(email, password)
    if err or not user:
        raise HTTPException(status_code=401, detail=err or "Đăng nhập thất bại")
    
    token = create_token(user["id"], user["email"], user["name"])
    return {
        "status": "success",
        "token": token,
        "user": user,
        "message": "Đăng nhập thành công!"
    }

@app.get("/api/auth/me")
def get_current_profile(authorization: Optional[str] = Header(None)):
    user = get_current_user_optional(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Phiên làm việc hết hạn hoặc chưa đăng nhập")
    profile = get_user_by_id(user["id"])
    return {"status": "success", "user": profile or user}

# ==============================================================================
# Multi-User Financial Plans Endpoints
# ==============================================================================
@app.get("/api/plans")
def get_plans(authorization: Optional[str] = Header(None)):
    user = get_current_user_optional(authorization)
    if user:
        user_plans = get_user_plans(user["id"])
        if user_plans:
            return user_plans
        # If user has no plans yet, initialize with default plans
        save_user_plans(user["id"], DEFAULT_PLANS)
        return DEFAULT_PLANS

    # Guest / Demo Mode: Always return pristine default template
    # Do not leak or share other guest's modified data across different machines
    return DEFAULT_PLANS

@app.post("/api/plans")
def save_plans(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    user = get_current_user_optional(authorization)
    if user:
        save_user_plans(user["id"], payload)
        return {"status": "success", "message": "Kế hoạch đã được lưu an toàn vào tài khoản đám mây của bạn!"}

    # Guest / Demo Mode: Do not overwrite server shared file!
    # Data for guests is stored safely and independently in each user's browser localStorage.
    return {"status": "guest", "message": "Chế độ Khách: Dữ liệu được lưu độc lập trên trình duyệt của máy bạn. Đăng nhập để đồng bộ đám mây."}

# ==============================================================================
# pyLocation Integration: Real Estate (LMNP), Turo Fleet & Patrimoine Endpoints
# ==============================================================================
def _compute_apartment_metrics(name: str, apt: Dict[str, Any]) -> Dict[str, Any]:
    try:
        from calculator.mortgage import calculate_mortgage, calculate_notary_fees  # type: ignore[import-not-found,import-untyped]
    except Exception:
        def calculate_notary_fees(p, t="ancien"): return p * 0.075
        def calculate_mortgage(loan, rate, dur, ins=0.3):
            r = (rate / 100.0) / 12.0
            n = dur * 12
            pmt = loan * (r / (1.0 - (1.0 + r)**(-n))) if r > 0 else (loan / n if n > 0 else 0)
            ins_m = (loan * (ins / 100.0)) / 12.0
            return {"total_monthly_payment": pmt + ins_m, "monthly_payment_excluding_insurance": pmt, "monthly_insurance": ins_m}

    price = float(apt.get("property_price", 100000))
    p_type = apt.get("property_type", "ancien")
    notary = float(apt.get("notary_fees") or calculate_notary_fees(price, p_type))
    bank = float(apt.get("bank_fees") or 1500)
    renov = float(apt.get("renovation_cost", 0))
    furn = float(apt.get("furniture_cost", 0))
    down_payment = float(apt.get("down_payment_input", 10000))
    
    total_project_cost = price + notary + bank + renov + furn
    loan_amount = max(0.0, total_project_cost - down_payment)
    dur = int(apt.get("loan_duration", 20))
    rate = float(apt.get("annual_interest_rate", 3.6))
    ins = float(apt.get("annual_insurance_rate", 0.3))
    
    m_res = calculate_mortgage(loan_amount, rate, dur, ins)
    monthly_loan_pmt = float(m_res.get("total_monthly_payment", 0))
    
    monthly_rent = float(apt.get("monthly_rent", 600))
    vac = float(apt.get("vacancy_pct", 5.0)) / 100.0
    effective_rent = monthly_rent * (1.0 - vac)
    
    annual_charges = (
        float(apt.get("annual_coop", 0)) +
        float(apt.get("annual_tf", 0)) +
        float(apt.get("annual_pno", 0)) +
        float(apt.get("annual_maintenance", 0))
    )
    mgmt_pct = float(apt.get("annual_mgmt_pct", 0)) / 100.0
    annual_charges += (effective_rent * 12.0) * mgmt_pct
    monthly_charges = annual_charges / 12.0
    
    # Cashflow during mortgage
    monthly_cashflow = effective_rent - monthly_loan_pmt - monthly_charges
    # Cashflow after loan payoff (in retirement)
    monthly_post_loan_cashflow = effective_rent - monthly_charges
    
    gross_yield = (monthly_rent * 12.0 / price * 100.0) if price > 0 else 0.0
    net_yield = ((effective_rent * 12.0 - annual_charges) / total_project_cost * 100.0) if total_project_cost > 0 else 0.0
    
    surface = float(apt.get("surface", 30))
    price_per_m2 = round(price / surface) if surface > 0 else 0
    start_year = int(apt.get("start_year") or 2023)
    payoff_year = start_year + dur
    
    return {
        "name": name,
        "address": apt.get("address", name),
        "surface": surface,
        "typology": apt.get("typology", "T2"),
        "dpe_rating": apt.get("dpe_rating", "C"),
        "start_year": start_year,
        "payoff_year": payoff_year,
        "property_price": round(price),
        "price_per_m2": price_per_m2,
        "notary_fees": round(notary),
        "bank_fees": round(bank),
        "renovation_cost": round(renov),
        "furniture_cost": round(furn),
        "total_project_cost": round(total_project_cost),
        "down_payment": round(down_payment),
        "loan_amount": round(loan_amount),
        "loan_duration": dur,
        "annual_interest_rate": rate,
        "annual_insurance_rate": ins,
        "monthly_rent": round(monthly_rent),
        "effective_monthly_rent": round(effective_rent),
        "monthly_loan_payment": round(monthly_loan_pmt),
        "monthly_charges": round(monthly_charges),
        "monthly_cashflow": round(monthly_cashflow),
        "annual_cashflow": round(monthly_cashflow * 12),
        "monthly_post_loan_cashflow": round(monthly_post_loan_cashflow),
        "annual_post_loan_cashflow": round(monthly_post_loan_cashflow * 12),
        "gross_yield": round(gross_yield, 2),
        "net_yield": round(net_yield, 2),
        "raw": apt
    }

def _compute_turo_metrics(settings: Dict[str, Any]) -> Dict[str, Any]:
    try:
        from calculator.turo import calculate_turo_investment  # type: ignore[import-not-found,import-untyped]
        res = calculate_turo_investment(
            initial_car_price=float(settings.get("price", 5000)),
            annual_gross_gain=float(settings.get("gross_gain", 1800)),
            num_cars=int(settings.get("num_cars", 3)),
            holding_years=int(settings.get("holding_years", 10)),
            annual_depreciation_pct=float(settings.get("decote", 6.0)),
            annual_insurance=float(settings.get("insurance", 350)),
            annual_repairs_maintenance=float(settings.get("repairs", 350))
        )
        return {
            "num_cars": res["num_cars"],
            "initial_investment": round(res["initial_investment"]),
            "annual_gross_gain": round(res["annual_gross_gain"]),
            "annual_net_cash_flow": round(res["annual_net_cash_flow"]),
            "monthly_net_cash_flow": round(res["annual_net_cash_flow"] / 12),
            "roi_pct": round(res["roi_pct"], 1),
            "resale_value": round(res["resale_value"]),
            "holding_years": res["holding_years"],
            "raw": settings
        }
    except Exception:
        cars = int(settings.get("num_cars", 3))
        gain = float(settings.get("gross_gain", 1800)) * cars
        return {
            "num_cars": cars,
            "initial_investment": float(settings.get("price", 5000)) * cars,
            "annual_gross_gain": round(gain),
            "annual_net_cash_flow": round(gain * 0.52),
            "monthly_net_cash_flow": round((gain * 0.52) / 12),
            "roi_pct": 22.0,
            "resale_value": 4500,
            "holding_years": int(settings.get("holding_years", 10)),
            "raw": settings
        }

def _compute_full_patrimoine(apts_raw: Dict[str, Any], turo_raw: Dict[str, Any], wealth_raw: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    computed_apartments = []
    tot_val = 0
    tot_loan = 0
    tot_rent = 0
    tot_pmt = 0
    tot_cf_current = 0
    tot_cf_post_loan = 0
    tot_down_payment = 0

    for name, apt_data in (apts_raw or {}).items():
        comp = _compute_apartment_metrics(name, apt_data)
        computed_apartments.append(comp)
        tot_val += comp["property_price"]
        tot_loan += comp["loan_amount"]
        tot_rent += comp["monthly_rent"]
        tot_pmt += comp["monthly_loan_payment"]
        tot_cf_current += comp["monthly_cashflow"]
        tot_cf_post_loan += comp["monthly_post_loan_cashflow"]
        tot_down_payment += comp["down_payment"]

    computed_turo = _compute_turo_metrics(turo_raw or {})

    summary = {
        "total_properties": len(computed_apartments),
        "total_property_value": tot_val,
        "total_loan_amount": tot_loan,
        "total_monthly_rent": tot_rent,
        "total_monthly_loan_payment": tot_pmt,
        "total_monthly_cashflow": tot_cf_current,
        "total_monthly_post_loan_cashflow": tot_cf_post_loan,
        "total_annual_post_loan_cashflow": tot_cf_post_loan * 12,
        "total_down_payment": tot_down_payment,
        "total_turo_monthly_cashflow": computed_turo.get("monthly_net_cash_flow", 0),
        "total_turo_annual_cashflow": computed_turo.get("annual_net_cash_flow", 0)
    }

    return {
        "apartments": computed_apartments,
        "turo": computed_turo,
        "wealth": wealth_raw or {},
        "summary": summary
    }

@app.get("/api/pylocation/data")
def get_pylocation_data(authorization: Optional[str] = Header(None)):
    """Load and compute all real estate and Turo metrics from pyLocation data."""
    user = get_current_user_optional(authorization)
    
    apts_raw = {}
    turo_raw = {"num_cars": 3, "price": 5000, "gross_gain": 1800, "decote": 6.0, "insurance": 350, "repairs": 350, "holding_years": 10}
    wealth_raw = {}

    if user:
        user_pat = get_user_patrimoine(user["id"])
        if user_pat:
            apts_raw = user_pat.get("apartments", {})
            turo_raw = user_pat.get("turo", turo_raw)
            wealth_raw = user_pat.get("wealth", {})
        else:
            # Seed from default files
            apts_file = PYLOCATION_DATA_DIR / "saved_apartments.json"
            if apts_file.exists():
                try:
                    with open(apts_file, "r", encoding="utf-8") as f:
                        apts_raw = json.load(f)
                except Exception:
                    pass
            save_user_patrimoine(user["id"], {"apartments": apts_raw, "turo": turo_raw, "wealth": wealth_raw})
    else:
        apts_file = PYLOCATION_DATA_DIR / "saved_apartments.json"
        turo_file = PYLOCATION_DATA_DIR / "turo_settings.json"
        wealth_file = PYLOCATION_DATA_DIR / "wealth_settings.json"
        if apts_file.exists():
            try:
                with open(apts_file, "r", encoding="utf-8") as f:
                    apts_raw = json.load(f)
            except Exception:
                pass
        if turo_file.exists():
            try:
                with open(turo_file, "r", encoding="utf-8") as f:
                    turo_raw = json.load(f)
            except Exception:
                pass
        if wealth_file.exists():
            try:
                with open(wealth_file, "r", encoding="utf-8") as f:
                    wealth_raw = json.load(f)
            except Exception:
                pass

    return _compute_full_patrimoine(apts_raw, turo_raw, wealth_raw)

@app.post("/api/pylocation/compute")
def compute_pylocation_preview(payload: Dict[str, Any] = Body(...)):
    """Compute real estate & turo metrics on the fly for guest without saving to disk."""
    apts_raw = payload.get("apartments", {})
    turo_raw = payload.get("turo", {"num_cars": 3, "price": 5000, "gross_gain": 1800, "decote": 6.0, "insurance": 350, "repairs": 350, "holding_years": 10})
    wealth_raw = payload.get("wealth", {})
    return _compute_full_patrimoine(apts_raw, turo_raw, wealth_raw)

@app.post("/api/pylocation/sync-to-fire")
def sync_pylocation_to_fire(authorization: Optional[str] = Header(None)):
    """
    Magic Bridge: Sync all pyLocation real estate passive cash flows and Turo profits
    directly into the active pyRetrait FIRE retirement plan!
    """
    data = get_pylocation_data(authorization=authorization)
    summary = data.get("summary", {})
    turo = data.get("turo", {})
    
    monthly_rental_cf = summary.get("total_monthly_post_loan_cashflow", 0)
    annual_rental_cf = summary.get("total_annual_post_loan_cashflow", 0)
    turo_annual_cf = turo.get("annual_net_cash_flow", 0)
    total_properties = summary.get("total_properties", 0)

    # Load plans
    plans_data = get_plans(authorization=authorization)
    active_id = plans_data.get("activePlanId", "plan_franco_viet")
    if active_id not in plans_data.get("plans", {}):
        active_id = list(plans_data.get("plans", {}).keys())[0]
    
    plan = plans_data["plans"][active_id]
    cur_age = int(plan.get("currentAge", 29))
    retire_age = int(plan.get("retirementAge", 42))

    if not isinstance(plan.get("incomes"), list):
        plan["incomes"] = []

    # 1. Update/Add/Remove Real Estate Passive Income
    existing_re_idx = -1
    for idx, inc in enumerate(plan["incomes"]):
        if "LMNP" in inc.get("name", "") or "BĐS Cho thuê" in inc.get("name", ""):
            existing_re_idx = idx
            break

    if total_properties > 0:
        re_income_item = {
            "name": "🏠 BĐS Cho thuê LMNP Pháp",
            "amount": annual_rental_cf,
            "startAge": cur_age,
            "endAge": 85,
            "growth": 1.5,
            "taxable": False # LMNP amortized = 0 tax
        }
        if existing_re_idx >= 0:
            plan["incomes"][existing_re_idx] = re_income_item
        else:
            plan["incomes"].append(re_income_item)
    else:
        if existing_re_idx >= 0:
            plan["incomes"].pop(existing_re_idx)

    # 2. Update/Add/Remove Turo Fleet Passive Income
    existing_turo_idx = -1
    for idx, inc in enumerate(plan["incomes"]):
        if "Turo" in inc.get("name", "") or "Cho thuê xe" in inc.get("name", ""):
            existing_turo_idx = idx
            break

    if turo_annual_cf > 0:
        turo_income_item = {
            "name": "🚗 Đội xe Cho thuê Turo",
            "amount": turo_annual_cf,
            "startAge": cur_age,
            "endAge": min(cur_age + 10, retire_age),
            "growth": 0.0,
            "taxable": False
        }
        if existing_turo_idx >= 0:
            plan["incomes"][existing_turo_idx] = turo_income_item
        else:
            plan["incomes"].append(turo_income_item)
    else:
        if existing_turo_idx >= 0:
            plan["incomes"].pop(existing_turo_idx)

    # 3. Asset allocation is left untouched: the user controls it with the sliders.

    # Save plans
    save_plans(plans_data, authorization=authorization)

    return {
        "success": True,
        "message": "Đã đồng bộ thành công danh mục BĐS & Turo vào Kế hoạch Hưu trí FIRE!",
        "addedMonthlyRental": monthly_rental_cf,
        "addedMonthlyTuro": turo.get("monthly_net_cash_flow", 0),
        "totalPropertyValue": summary.get("total_property_value", 0),
        "activePlanId": active_id
    }

@app.post("/api/pylocation/sync-cloud")
def sync_patrimoine_to_cloud(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    """Sync guest local patrimoine from browser localStorage into user's cloud account upon login."""
    user = get_current_user_optional(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Vui lòng đăng nhập để đồng bộ dữ liệu lên đám mây")
    
    apts_raw = payload.get("apartments", {})
    turo_raw = payload.get("turo", {})
    wealth_raw = payload.get("wealth", {})
    
    user_pat = get_user_patrimoine(user["id"]) or {}
    existing_apts = user_pat.get("apartments", {})
    if apts_raw:
        existing_apts.update(apts_raw)
    user_pat["apartments"] = existing_apts
    if turo_raw:
        user_pat["turo"] = turo_raw
    if wealth_raw:
        user_pat["wealth"] = wealth_raw
        
    save_user_patrimoine(user["id"], user_pat)
    try:
        sync_pylocation_to_fire(authorization=authorization)
    except Exception as e:
        logger.warning(f"Auto-sync on sync-cloud warning: {e}")
        
    return {"success": True, "message": "Đã đồng bộ thành công dữ liệu Căn hộ vào tài khoản đám mây!", "data": _compute_full_patrimoine(existing_apts, user_pat.get("turo", {}), user_pat.get("wealth", {}))}

@app.post("/api/pylocation/apartment")
def save_pylocation_apartment(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    """Save or update an apartment in pyLocation / user account."""
    name = str(payload.get("name", "")).strip()
    data = payload.get("data") or payload.get("params") or {}
    if not name:
        raise HTTPException(status_code=400, detail="Tên căn hộ không được để trống")
    
    user = get_current_user_optional(authorization)
    if user:
        user_pat = get_user_patrimoine(user["id"]) or {}
        apts = user_pat.get("apartments", {})
        apts[name] = data
        user_pat["apartments"] = apts
        save_user_patrimoine(user["id"], user_pat)
        try:
            sync_pylocation_to_fire(authorization=authorization)
        except Exception as e:
            logger.warning(f"Auto-sync on save apartment warning: {e}")
        return {"success": True, "message": f"Căn hộ '{name}' đã được lưu và tự động đồng bộ vào kế hoạch FIRE!", "apartment": _compute_apartment_metrics(name, data)}

    # Guest mode: return computed metrics without overwriting server shared file
    comp = _compute_apartment_metrics(name, data)
    return {"success": True, "message": f"Căn hộ '{name}' đã được lưu trong trình duyệt của bạn!", "apartment": comp}

@app.delete("/api/pylocation/apartment/{name}")
def delete_pylocation_apartment(name: str, authorization: Optional[str] = Header(None)):
    """Delete an apartment from user account or pyLocation/data/saved_apartments.json."""
    user = get_current_user_optional(authorization)
    if user:
        user_pat = get_user_patrimoine(user["id"]) or {}
        apts = user_pat.get("apartments", {})
        if name in apts:
            del apts[name]
            user_pat["apartments"] = apts
            save_user_patrimoine(user["id"], user_pat)
            try:
                sync_pylocation_to_fire(authorization=authorization)
            except Exception as e:
                logger.warning(f"Auto-sync on delete apartment warning: {e}")
            return {"success": True, "message": f"Đã xóa căn hộ '{name}' và tự động cập nhật kế hoạch FIRE"}
        raise HTTPException(status_code=404, detail=f"Không tìm thấy căn hộ '{name}'")

    return {"success": True, "message": f"Đã xóa căn hộ '{name}' khỏi bộ nhớ trình duyệt"}

@app.post("/api/pylocation/turo")
def save_pylocation_turo(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    """Save Turo fleet settings."""
    user = get_current_user_optional(authorization)
    if user:
        user_pat = get_user_patrimoine(user["id"]) or {}
        user_pat["turo"] = payload
        save_user_patrimoine(user["id"], user_pat)
        try:
            sync_pylocation_to_fire(authorization=authorization)
        except Exception as e:
            logger.warning(f"Auto-sync on save turo warning: {e}")
        return {"success": True, "turo": _compute_turo_metrics(payload)}

    # Guest mode
    return {"success": True, "turo": _compute_turo_metrics(payload)}

@app.post("/api/simulate/monte-carlo")
def run_monte_carlo(payload: Dict[str, Any] = Body(...)):
    """
    Chạy mô phỏng Monte Carlo 1,000 kịch bản ngẫu nhiên sử dụng Phân phối Gaussian / Log-Normal.
    Tính toán Sequence of Returns Risk, Success Rate, và các phân vị P10, P25, P50 (Median), P75, P90.
    """
    try:
        current_age = int(payload.get("currentAge", 35))
        retire_age = int(payload.get("retirementAge", 48))
        life_expectancy = int(payload.get("lifeExpectancy", 85))
        current_savings = float(payload.get("currentSavings", 1000000))
        annual_savings = float(payload.get("annualSavings", 200000))
        retirement_expenses = float(payload.get("retirementExpenses", 300000))
        mean_return = float(payload.get("investmentReturn", 9.0)) / 100.0
        volatility = float(payload.get("volatility", 15.0)) / 100.0
        inflation = float(payload.get("inflationRate", 4.0)) / 100.0
        num_simulations = int(payload.get("numSimulations", 1000))
        # withdrawal_rate reserved for custom withdrawal strategies
        _ = float(payload.get("withdrawalRate", 4.0)) / 100.0
        
        years = life_expectancy - current_age + 1
        age_axis = list(range(current_age, life_expectancy + 1))
        
        # Ma trận mô phỏng (num_simulations x years)
        trajectories = np.zeros((num_simulations, years))
        trajectories[:, 0] = current_savings
        
        np.random.seed(42)
        
        # Sinh chuỗi tỷ suất lợi nhuận hàng năm theo Monte Carlo
        annual_returns = np.random.normal(loc=mean_return, scale=volatility, size=(num_simulations, years))
        
        success_count = 0
        failure_ages = []
        
        for sim in range(num_simulations):
            portfolio = current_savings
            survived = True
            
            for y_idx, age in enumerate(age_axis[1:], start=1):
                r = annual_returns[sim, y_idx]
                cum_inflation = (1.0 + inflation) ** y_idx
                
                if age < retire_age:
                    # Giai đoạn tích lũy
                    portfolio = portfolio * (1.0 + r) + annual_savings * ((1.0 + inflation) ** (y_idx - 1))
                else:
                    # Giai đoạn rút tiền
                    # Sử dụng Bengen hoặc điều chỉnh theo lạm phát
                    expense_needed = retirement_expenses * cum_inflation
                    portfolio = (portfolio - expense_needed) * (1.0 + r)
                
                if portfolio <= 0:
                    portfolio = 0.0
                    if survived:
                        survived = False
                        failure_ages.append(age)
                
                trajectories[sim, y_idx] = portfolio
            
            if survived and trajectories[sim, -1] > 0:
                success_count += 1
                
        success_rate = round((success_count / num_simulations) * 100, 1)
        
        # Tính toán các đường phân vị
        p10 = np.percentile(trajectories, 10, axis=0).tolist()
        p25 = np.percentile(trajectories, 25, axis=0).tolist()
        p50 = np.percentile(trajectories, 50, axis=0).tolist() # Trung vị
        p75 = np.percentile(trajectories, 75, axis=0).tolist()
        p90 = np.percentile(trajectories, 90, axis=0).tolist()
        
        # Mẫu 20 đường ngẫu nhiên để vẽ fan chart
        sample_paths = trajectories[:25].tolist()
        
        return {
            "successRate": success_rate,
            "numSimulations": num_simulations,
            "ageAxis": age_axis,
            "p10": p10,
            "p25": p25,
            "p50": p50,
            "p75": p75,
            "p90": p90,
            "samplePaths": sample_paths,
            "medianEndPortfolio": round(p50[-1], 2),
            "worstCaseEndPortfolio": round(p10[-1], 2),
            "averageFailureAge": round(float(np.mean(failure_ages)), 1) if failure_ages else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# GEMINI AI CHART ANALYSIS & INSIGHTS
# ==============================================================================

SETTINGS_FILE = DATA_DIR / "settings.json"

@app.get("/api/ai/settings")
def get_ai_settings():
    env_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    key = env_key
    source = "env" if (env_key and len(env_key.strip()) > 0) else "none"
    model = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")
    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if not key:
                    key = data.get("gemini_api_key")
                    if key:
                        source = "ui"
                if data.get("gemini_model"):
                    model = data.get("gemini_model")
        except Exception:
            pass
    masked = f"{key[:4]}...{key[-4:]}" if key and len(key) > 8 else (bool(key) and "Đã cấu hình")
    return {"has_api_key": bool(key), "masked_key": masked, "selected_model": model, "source": source}

@app.post("/api/ai/settings")
def save_ai_settings(payload: Dict[str, Any] = Body(...)):
    key = str(payload.get("gemini_api_key", "")).strip()
    model = str(payload.get("gemini_model", "gemini-3.8-flash")).strip()
    data = {}
    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            pass
    if key:
        data["gemini_api_key"] = key
    if model:
        data["gemini_model"] = model
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    return {"success": True, "has_api_key": bool(data.get("gemini_api_key")), "selected_model": data.get("gemini_model", "gemini-3.8-flash")}

@app.get("/api/ai/models")
async def get_available_models(api_key: Optional[str] = None):
    """Dynamically query Google API for all available Gemini models in real time."""
    key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key and SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                settings = json.load(f)
                key = settings.get("gemini_api_key")
        except Exception:
            pass

    default_models = ["gemini-flash-lite-latest", "gemini-2.5-flash", "gemini-3.8-flash", "gemini-3.7-flash"]
    if not key or len(key.strip()) < 10:
        return {"models": default_models, "source": "static"}

    try:
        import httpx
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key.strip()}"
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                raw_models = data.get("models", [])
                # Filter models that support content generation and belong to Gemini family
                gemini_list = []
                for m in raw_models:
                    m_name = m.get("name", "").replace("models/", "")
                    methods = m.get("supportedGenerationMethods", [])
                    if "generateContent" in methods and "gemini" in m_name:
                        gemini_list.append(m_name)
                if gemini_list:
                    # Put newest/flash models at top
                    gemini_list.sort(reverse=True)
                    return {"models": gemini_list, "source": "google_api"}
    except Exception:
        pass

    return {"models": default_models, "source": "static"}

def generate_local_gemini_analysis(chart_id: str, chart_title: str, chart_summary: Dict[str, Any], plan: Dict[str, Any]) -> str:
    """Phân tích tài chính thông thái, thân thiện, dễ hiểu, bám sát số liệu mô phỏng thực tế và luôn có ví dụ cụ thể."""
    cur = plan.get("currency", "EUR")
    cur_sym = "€" if cur == "EUR" else ("₫" if cur == "VND" else "$")
    cur_age = int(plan.get("currentAge") or 29)
    retire_age = int(plan.get("retirementAge") or 42)
    life_exp = int(plan.get("lifeExpectancy") or 85)
    
    incomes = plan.get("incomes", [])
    total_salary = sum(float(inc.get("amount", 0)) for inc in incomes if inc.get("enabled", True))
    if total_salary <= 0:
        total_salary = float(plan.get("annualSavings", 7922)) / max(0.01, float(plan.get("savingsRate", 33.3)) / 100)
        
    ann_sav = float(plan.get("annualSavings", 7922))
    ret_exp = float(plan.get("retirementExpenses", 10000))
    forex = float(plan.get("exchangeRateEurVnd", 27500))
    monthly_exp_vnd = round((ret_exp * forex) / 12 / 1_000_000)
    
    early_age = max(cur_age, retire_age - 3)
    late_age = retire_age + 3
    fire_age = chart_summary.get("fireAge", retire_age)
    
    if chart_id in ("chart-networth", "chart-net-worth"):
        peak = chart_summary.get("peakNetWorth", "N/A")
        peak_age = chart_summary.get("peakAge", retire_age)
        final_nw = chart_summary.get("finalNetWorth", "N/A")
        fire_target = chart_summary.get("fireTarget", "N/A")
        has_mortgage = plan.get("mortgage", {}).get("enabled", False) or bool(plan.get("frenchMortgages"))
        
        mortgage_text = (
            "- **Khoản vay mua nhà**: Khi bước vào tuổi nghỉ hưu, bạn có thể tiếp tục để tiền thuê tự nuôi khoản nợ vay hoặc cơ cấu lại danh mục để tối đa hóa dòng tiền ròng."
            if has_mortgage else
            "- **Tài sản hoàn toàn linh hoạt**: Bạn không bị gánh nặng nợ vay, giúp toàn quyền chủ động điều chuyển vốn và an tâm sinh sống."
        )
        
        return (
            f"> 💡 **Tóm tắt cốt lõi (TL;DR)**: Mục tiêu nghỉ hưu ở tuổi {retire_age} của bạn hoàn toàn khả thi và cân bằng; tài sản tích lũy sinh lời đủ chi trả mức sống mong muốn và bảo toàn vốn đến tuổi {life_exp}.\n\n"
            f"### 🎯 Đánh giá Mốc Tuổi Nghỉ Hưu {retire_age} tuổi\n"
            f"Dựa trên thu nhập tổng {total_salary:,.0f} {cur_sym}/năm, tiền để dành đều đặn ~{ann_sav:,.0f} {cur_sym}/năm (~{round(ann_sav/12)} {cur_sym}/tháng) và mức chi tiêu hưu trí dự kiến là {ret_exp:,.0f} {cur_sym}/năm (~{monthly_exp_vnd} triệu ₫/tháng), **mốc {retire_age} tuổi là điểm cân bằng vàng** cho hành trình độc lập tài chính của bạn (điểm chạm mục tiêu FIRE rơi vào khoảng {fire_age} tuổi).\n\n"
            f"### 💡 1. Sức bền của Khối Tài sản & Tiền Lãi Nuôi Sống\n"
            f"- **Tiền tự đẻ ra tiền đủ trang trải**: Ở tuổi {retire_age}, danh mục đầu tư đạt mốc mục tiêu khoảng **{fire_target}**. Với tỷ lệ rút vốn an toàn 3.8%–4% mỗi năm ({round(ret_exp):,.0f} {cur_sym}/năm), dòng tiền sinh lời đủ bao phủ hoàn toàn chi phí sinh hoạt hàng tháng mà không làm hao mòn vốn gốc.\n"
            f"- **Tiền gốc tiếp tục tăng trưởng**: Nhờ sức mạnh lãi kép, danh mục dự kiến đạt đỉnh **{peak}** ở tuổi {peak_age}, và đến tuổi {life_exp} bạn vẫn duy trì được khối tài sản khoảng **{final_nw}**.\n"
            f"{mortgage_text}\n\n"
            f"### ⚖️ 2. So sánh 3 mốc tuổi nghỉ hưu linh hoạt\n"
            f"- **Mốc {early_age} tuổi (Nghỉ sớm hơn)**: Bạn có thể nghỉ sớm hơn dự kiến nếu chuẩn bị thêm một nguồn thu nhập phụ nhẹ nhàng khoảng 5–7 triệu ₫/tháng để giảm áp lực rút tiền những năm đầu.\n"
            f"- **Mốc {retire_age} tuổi (Mục tiêu tối ưu)**: Tài sản đạt điểm chạm FIRE hoàn hảo, dòng tiền thảnh thơi và bạn hoàn toàn làm chủ thời gian của mình.\n"
            f"- **Mốc {late_age} tuổi (Làm thêm tích lũy)**: Khối tài sản sẽ phình to hơn đáng kể, cho phép bạn nâng mức chi tiêu du lịch trải nghiệm hoặc để lại khối di sản lớn cho gia đình.\n\n"
            f"### 🎯 3. Các bước cụ thể làm theo ngay\n"
            f"1. **Duy trì nguyên tắc 'trả cho mình trước'**: Cứ ngày nhận lương, tự động chuyển ngay ~{round(ann_sav/12)} {cur_sym} vào danh mục đầu tư tích lũy dài hạn trước khi chi tiêu sinh hoạt.\n"
            f"2. **Chuẩn bị bình oxy tiền mặt 2 năm trước khi nghỉ việc**: Khoảng 1–2 năm trước khi bước sang tuổi {retire_age}, hãy trích sẵn khoảng 2 năm chi phí sinh hoạt (~{round(ret_exp * 2):,.0f} {cur_sym}) vào tài khoản tiết kiệm an toàn để chi tiêu giai đoạn đầu về hưu."
        )

    elif chart_id in ("chart-cashflow", "chart-cash-flow"):
        gap_years = max(0, 65 - retire_age)
        gap_text = (
            f"- **Khoảng trống dòng tiền từ tuổi {retire_age} đến 65 (khoảng {gap_years} năm)**: Trong những năm này, bạn chưa có lương hưu nhà nước hỗ trợ mà phải hoàn toàn tự túc từ số tiền tích lũy. Vì vậy cần tránh các khoản chi tiêu quá lớn bất ngờ."
            if gap_years > 0 else
            f"- **Dòng tiền hưu trí tức thì**: Do bạn nghỉ hưu ở mốc {retire_age} tuổi, bạn có thể kết hợp ngay các nguồn hưu trí và thu nhập thụ động để ổn định cuộc sống."
        )
        return (
            f"> 💡 **Tóm tắt cốt lõi (TL;DR)**: Dòng tiền của bạn chuyển dịch nhịp nhàng từ tích lũy chủ động sang rút vốn có kiểm soát; cần lưu ý bảo toàn dòng tiền trong những năm đầu sau khi ngừng đi làm.\n\n"
            f"### 💡 1. Nhìn nhanh dòng tiền vào và ra theo từng chặng đời\n"
            f"- **Giai đoạn đi làm (Tuổi {cur_age} – {retire_age})**: Thu nhập hàng tháng vượt chi phí sinh hoạt, phần thặng dư liên tục được tái đầu tư giúp tài sản tăng tốc.\n"
            f"- **Giai đoạn nghỉ hưu sớm (Sau tuổi {retire_age})**: Bạn ngừng nhận lương chủ động, chuyển sang dùng tiền lời và rút một phần nhỏ từ tài sản đầu tư để sinh sống.\n"
            f"- **Giai đoạn tuổi vàng**: Sau mốc 64–65 tuổi, các khoản trợ cấp hoặc lương hưu bổ sung sẽ giảm bớt gánh nặng rút tiền túi cá nhân.\n\n"
            f"### ⚠️ 2. Điểm cần lưu ý về dòng tiền\n"
            f"{gap_text}\n\n"
            f"### 🎯 3. Các bước cụ thể làm theo ngay\n"
            f"1. **Tạo thêm nguồn thu nhập nhẹ nhàng**: Chuẩn bị một vài tài sản tạo dòng tiền như cổ tức hoặc nhà cho thuê để có thêm tiền tiêu vặt mà không phải bán tài sản gốc.\n"
            f"2. **Nếu lãi suất vay đang thấp, không cần vội tất toán trước hạn**: Khi lãi suất vay chỉ 1.5%–2.5%/năm, duy trì trả góp đều đặn và để phần vốn còn lại sinh lời 6%–8%/năm trong quỹ đầu tư sẽ có lợi hơn nhiều."
        )

    elif chart_id in ("chart-withdrawal-comparison", "chart-withdrawals"):
        return (
            f"> 💡 **Tóm tắt cốt lõi (TL;DR)**: Chiến lược Lan can Guyton-Klinger mang lại sự cân bằng hoàn hảo nhất giữa mức chi tiêu ổn định và khả năng chống cạn kiệt tài sản đến tuổi {life_exp}.\n\n"
            f"### 💡 1. So sánh 4 cách rút tiền khi về hưu\n"
            f"- **Cách linh hoạt theo tình hình (Lan can Guyton-Klinger - Khuyên dùng)**: Khi thị trường tăng tốt bạn được tiêu nhiều hơn một chút; khi năm nào kinh tế khó khăn thì tự động thắt lưng buộc bụng bớt 10%. Cách này giúp bạn không bao giờ sợ hết tiền.\n"
            f"- **Cách rút số tiền cố định mỗi năm (Quy tắc 4% Bengen)**: Năm nào cũng rút một số tiền như nhau cộng trượt giá. Cách này dễ dự toán nhưng nếu gặp năm thị trường giảm sâu thì tiền hao hụt rất nhanh.\n"
            f"- **Cách rút theo phần trăm cố định**: Mỗi năm rút một tỷ lệ cố định trên số dư còn lại. Tiền không bao giờ cạn, nhưng số tiền tiêu mỗi năm sẽ trồi sụt theo thị trường.\n"
            f"- **Cách rút theo tuổi thọ (VPW)**: Tối đa hóa số tiền được tiêu theo từng độ tuổi, nhưng đòi hỏi tính kỷ luật cao.\n\n"
            f"### ⚠️ 2. Điều cần tránh\n"
            f"- Tuyệt đối tránh rút quá 4%–4.5% tổng tài sản mỗi năm trong những năm thị trường suy thoái, vì bán tài sản ở đáy sẽ triệt tiêu cơ hội phục hồi.\n\n"
            f"### 🎯 3. Các bước cụ thể làm theo ngay\n"
            f"1. **Áp dụng tỷ lệ khởi điểm 3.8%**: Đặt mức chi tiêu năm đầu tiên bằng khoảng 3.8% tổng tài sản để tạo biên an toàn dự phòng.\n"
            f"2. **Điều chỉnh linh hoạt từng năm**: Năm nào danh mục tăng trưởng vượt kỳ vọng thì tự thưởng chuyến du lịch; năm nào thị trường ảm đạm thì cắt giảm các chi tiêu xa xỉ."
        )

    elif chart_id in ("chart-tax-optimization", "chart-taxes"):
        return (
            "> 💡 **Tóm tắt cốt lõi (TL;DR)**: Tận dụng các tài khoản ưu đãi thuế dài hạn và thứ tự rút tiền đúng cách có thể giúp bạn tiết kiệm hàng trăm triệu đồng thuế thu nhập.\n\n"
            "### 💡 1. Cách giữ lại nhiều tiền nhất trước thuế\n"
            "- **Tận dụng tài khoản ưu đãi (PEA và Assurance-Vie / Roth)**: Khi giữ tài khoản đủ thời gian quy định (5 năm với PEA và 8 năm với Assurance-Vie), bạn sẽ được miễn phần lớn thuế thu nhập trên tiền lời.\n"
            "- **Tiết kiệm hàng trăm triệu đồng**: Bằng cách chọn đúng tài khoản để rút tiền trước, bạn sẽ tránh được việc phải nộp thuế suất cao không đáng có.\n\n"
            "### ⚠️ 2. Điều cần nhớ về thời gian mở tài khoản\n"
            "- Các tài khoản này tính niên hạn từ **ngày bạn mở tài khoản**, chứ không phải từ ngày bạn nộp nhiều tiền. Nếu để sát ngày về hưu mới mở thì sẽ không kịp thời gian để được hưởng ưu đãi miễn thuế.\n\n"
            "### 🎯 3. Các bước cụ thể làm theo ngay\n"
            "1. **Mở tài khoản ưu đãi ngay hôm nay**: Kể cả chỉ nộp vào một số tiền nhỏ (50 € – 100 €) để bấm giờ tính thâm niên tài khoản càng sớm càng tốt.\n"
            "2. **Thứ tự rút tiền thông minh**: Khi cần tiền tiêu, ưu tiên rút từ tài khoản tiết kiệm an toàn trước ➔ sau đó rút từ tài khoản ưu đãi trong hạn mức miễn thuế ➔ rồi mới đến các tài khoản chịu thuế cao."
        )

    elif chart_id in ("chart-monte-carlo", "chart-insights"):
        succ_rate = chart_summary.get("successRate", "95%+")
        return (
            f"> 💡 **Tóm tắt cốt lõi (TL;DR)**: Thử nghiệm 1.000 cuộc đời giả lập cho thấy kế hoạch của bạn đạt độ an toàn rất cao ({succ_rate}); chỉ cần chuẩn bị quỹ tiền mặt dự phòng để vô hiệu hóa rủi ro thị trường giảm sớm.\n\n"
            f"### 💡 1. Kết quả thử nghiệm 1.000 tình huống cuộc đời\n"
            f"- Hệ thống đã giả lập 1.000 kịch bản thị trường khác nhau (từ những năm kinh tế bùng nổ đến những đợt khủng hoảng tài chính toàn cầu).\n"
            f"- **Kết quả rất khả quan**: Phần lớn các trường hợp bạn đều an toàn về đích với tài sản dư dả cho đến tuổi {life_exp}.\n\n"
            f"### ⚠️ 2. Kịch bản xui xẻo nhất cần phòng ngừa\n"
            f"- Nếu chẳng may ngay khi vừa thôi việc mà thị trường chứng khoán giảm mạnh 2-3 năm liền, số tiền của bạn sẽ bị sụt giảm nhanh hơn dự tính nếu bạn phải bán tháo tài sản giá rẻ để lấy tiền ăn tiêu.\n\n"
            f"### 🎯 3. Cách phòng ngừa rất dễ làm theo\n"
            f"1. **Chuẩn bị 'bình oxy tiền mặt' trước khi nghỉ việc 1 năm**: Để sẵn 2 năm chi phí sinh hoạt trong tài khoản an toàn (như sổ tiết kiệm). Khi thị trường giảm, bạn chỉ tiêu tiền trong bình oxy này, tuyệt đối không bán lỗ các khoản đầu tư.\n"
            f"2. **Kiên nhẫn chờ thị trường hồi phục**: Lịch sử cho thấy các đợt khủng hoảng thường phục hồi sau 1–2 năm. Tiền mặt dự phòng sẽ giúp bạn hoàn toàn an tâm ngủ ngon."
        )

    elif chart_id in ("chart-scenarios", "chart-stress-test"):
        sc_title = chart_summary.get("title", "Biến cố thị trường")
        return (
            f"> 💡 **Tóm tắt cốt lõi (TL;DR)**: Danh mục của bạn có độ dẻo dai tốt trước các cú sốc lớn; việc chủ động mua bảo hiểm sức khỏe và giữ lối sống linh hoạt là chìa khóa phòng thủ vững chắc nhất.\n\n"
            f"### 💡 1. Thử sức tài chính trước biến cố: {sc_title}\n"
            f"- **Thị trường giảm sâu (-35%)**: Tài sản của bạn giảm tạm thời trên màn hình, nhưng tiền sinh hoạt hàng ngày vẫn được bảo đảm nếu bạn không bán tháo tài sản lúc giá rẻ.\n"
            f"- **Lạm phát giá cả sinh hoạt**: Nhờ phần lớn tài sản được đầu tư vào các quỹ doanh nghiệp và tài sản thực, giá trị tài sản sẽ tự động tăng theo thời gian để bù đắp sự mất giá của đồng tiền.\n\n"
            f"### ⚠️ 2. Biến cố tốn kém nhất: Chi phí Sức khỏe\n"
            f"- Những chi phí y tế đột xuất lúc lớn tuổi là nguyên nhân lớn nhất làm hao hụt tài sản hưu trí nếu không có phương án che chắn từ trước.\n\n"
            f"### 🎯 3. Việc cụ thể bạn nên làm theo ngay\n"
            f"1. **Mua bảo hiểm sức khỏe chu đáo trước khi nghỉ việc**: Đảm bảo bạn và gia đình có thẻ bảo hiểm sức khỏe toàn diện để nếu có ốm đau thì bảo hiểm chi trả, không phải đụng vào tiền tiết kiệm nghỉ hưu.\n"
            f"2. **Cắt giảm 10% các khoản chi tiêu không thiết yếu khi có biến cố**: Tạm hoãn mua sắm đồ đắt tiền hoặc giảm bớt các chuyến du lịch xa trong năm thị trường khó khăn."
        )

    elif chart_id in ("chart-spending-smile", "chart-estate"):
        tgt_leg = chart_summary.get("targetLegacy", "N/A")
        proj_leg = chart_summary.get("projectedLegacy", "N/A")
        pct = chart_summary.get("pctOfTarget", "100%")
        return (
            f"> 💡 **Tóm tắt cốt lõi (TL;DR)**: Chi tiêu đời người tự nhiên giảm dần sau 60 tuổi; kế hoạch của bạn đảm bảo tài sản tích lũy đạt {pct} mục tiêu di sản để lại ({proj_leg}).\n\n"
            f"### 💡 1. Đường cong chi tiêu thực tế theo độ tuổi\n"
            f"- Chi tiêu trong đời người thường có hình 'nụ cười' (Spending Smile):\n"
            f"  - **Lúc vừa nghỉ hưu (Tuổi {retire_age}–60)**: Đang còn trẻ khỏe, thích đi du lịch và trải nghiệm nên chi tiêu đạt mức cao nhất.\n"
            f"  - **Tuổi trung niên (Tuổi 60–75)**: Sống chậm rãi, thích ở nhà chăm vườn, nấu ăn nên chi tiêu tự nhiên giảm bớt.\n"
            f"  - **Sau tuổi 75**: Đi lại ít hơn nhưng cần thêm một phần tiền chăm sóc sức khỏe và bồi dưỡng tuổi già.\n\n"
            f"### 🏛️ 2. Để lại tiền cho con cháu và di sản thừa kế\n"
            f"- Tài sản dự kiến còn lại ở tuổi {life_exp} đạt khoảng **{proj_leg}** (so với mục tiêu di sản {tgt_leg}). Bạn hoàn toàn có thể an tâm chuyển giao di sản cho thế hệ sau.\n\n"
            f"### 🎯 3. Các bước cụ thể làm theo ngay\n"
            f"1. **Chuyển giao dần khi con cái lập nghiệp**: Thay vì dồn toàn bộ đến cuối đời, hãy tận dụng các hạn mức quà tặng miễn thuế để hỗ trợ con cái mua nhà hoặc lập nghiệp.\n"
            f"2. **Lên kế hoạch tận hưởng trọn vẹn 10 năm đầu hưu trí**: Đừng quá dè sẻn trong thập kỷ đầu tiên sau tuổi {retire_age}, vì đó là lúc bạn có nhiều năng lượng nhất để sống trọn vẹn từng ngày."
        )

    elif chart_id in ("chart-patrimoine", "chart-pylocation"):
        apt_count = chart_summary.get("total_apartments", 3)
        total_prop = chart_summary.get("total_property_value", 293000)
        postloan_cf = chart_summary.get("total_postloan_cashflow_monthly", 1401)
        turo_cf = chart_summary.get("turo_cashflow_monthly", 0)
        total_cf = postloan_cf + turo_cf
        turo_text = f", cộng thêm lợi nhuận đội xe Turo (+{turo_cf:,.0f} {cur_sym}/tháng)" if turo_cf > 0 else ""
        return (
            f"> 💡 **Tóm tắt cốt lõi (TL;DR)**: Danh mục {apt_count} BĐS là cỗ máy tạo dòng tiền thụ động vững chắc (+{total_cf:,.0f} {cur_sym}/tháng sau khi trả hết nợ vay), đủ bao phủ chi phí sinh hoạt tuổi hưu.\n\n"
            f"### 💡 1. Sức mạnh đòn bẩy BĐS & Cỗ máy dòng tiền tự động\n"
            f"- Danh mục {apt_count} căn hộ ({total_prop:,.0f} {cur_sym}) đang được người thuê nhà và ngân hàng tài trợ trả nợ thay bạn. Sau khi hoàn thành kỳ trả góp, danh mục sẽ bơm về dòng tiền ròng **+{postloan_cf:,.0f} {cur_sym}/tháng**{turo_text}.\n"
            f"- Tổng dòng tiền thụ động đạt **+{total_cf:,.0f} {cur_sym}/tháng**, bảo đảm mức sống thảnh thơi mà chưa cần bán bất kỳ cổ phiếu hay chứng chỉ quỹ ETF nào.\n\n"
            f"### 🛡️ 2. Tấm khiên thuế Khấu hao Tài sản\n"
            f"- Nhờ cơ chế trích khấu hao tài sản (Amortissement), doanh thu cho thuê gần như **được miễn thuế 0%** trong suốt nhiều năm đầu. Đây là ưu thế vượt trội giúp dòng tiền tích lũy tăng trưởng tối đa.\n\n"
            f"### 🎯 3. Các bước hành động cụ thể để quản lý từ xa\n"
            f"1. **Tạo quỹ đệm dự phòng BĐS**: Trích riêng 3–6 tháng tiền thuê vào tài khoản tiết kiệm an toàn để xử lý ngay khi cần sửa chữa thiết bị hoặc lấp phòng trống.\n"
            f"2. **Ủy thác quản lý chuyên nghiệp khi hồi hương**: Khi chuyển nơi sinh sống, hãy ký hợp đồng ủy quyền với đơn vị quản lý chuyên nghiệp với mức phí 7–8% doanh thu để hưởng trọn dòng tiền thụ động mà không phải đau đầu lo việc bảo trì hay đón khách."
        )

    else:
        return (
            f"> 💡 **Tóm tắt cốt lõi (TL;DR)**: Kế hoạch tài chính của bạn đang đi rất đúng hướng; mục tiêu tự do tài chính ở tuổi {retire_age} hoàn toàn trong tầm tay.\n\n"
            f"### 💡 1. Nhận xét tổng quan\n"
            f"- Việc kiếm tiền ở nơi có thu nhập cao và tối ưu chi phí sinh hoạt để nghỉ hưu sớm là một chiến lược rất sáng suốt.\n\n"
            f"### 🎯 2. Lời khuyên bỏ túi\n"
            f"- Hãy kiên trì trích tiền tiết kiệm và đầu tư đều đặn mỗi tháng, mục tiêu độc lập tài chính ở tuổi {retire_age} đang ở rất gần bạn!"
        )

@app.post("/api/ai/analyze-chart")
async def analyze_chart(payload: Dict[str, Any] = Body(...)):
    chart_id = payload.get("chart_id", "")
    chart_title = payload.get("chart_title", "")
    chart_summary = payload.get("chart_summary", {})
    plan = payload.get("plan", {})
    api_key = payload.get("api_key") or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    
    cur = plan.get("currency", "EUR")
    cur_sym = "€" if cur == "EUR" else ("₫" if cur == "VND" else "$")
    cur_age = int(plan.get("currentAge") or 29)
    retire_age = int(plan.get("retirementAge") or 42)
    life_exp = int(plan.get("lifeExpectancy") or 85)
    
    incomes = plan.get("incomes", [])
    total_annual_income = sum(float(inc.get("amount", 0)) for inc in incomes if inc.get("enabled", True))
    if total_annual_income <= 0:
        total_annual_income = float(plan.get("annualSavings", 7922)) / max(0.01, (float(plan.get("savingsRate", 33.3)) / 100))
        
    ann_sav = float(plan.get("annualSavings", 7922))
    ret_exp = float(plan.get("retirementExpenses", 10000))
    forex = float(plan.get("exchangeRateEurVnd", 27500))
    monthly_exp_vnd = round((ret_exp * forex) / 12 / 1_000_000)
    
    early_age = max(cur_age, retire_age - 3)
    late_age = retire_age + 3
    fire_age = chart_summary.get("fireAge", retire_age)
    
    if not api_key and SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                settings = json.load(f)
                api_key = settings.get("gemini_api_key")
        except Exception:
            pass

    # If user provided a real Gemini API Key, call Google Generative Language API
    if api_key and len(api_key.strip()) > 10:
        try:
            import httpx
            
            # System instruction with strict guardrails, conciseness and persona definition
            system_instruction = (
                "Bạn là chuyên gia tư vấn tài chính cá nhân độc lập, thân thiện, thông thái và thực tế của phần mềm pyRetrait.\n"
                "NHIỆM VỤ: Phân tích biểu đồ tài chính người dùng đang quan sát, đưa ra nhận xét sâu sắc và khuyến nghị khả thi.\n\n"
                "CÁC NGUYÊN TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ):\n"
                "1. ĐỘ DÀI & ĐỘ SÚC TÍCH: Trả lời ngắn gọn, cô đọng (khoảng 220 - 320 từ), đi thẳng vào trọng tâm số liệu, không lan man kéo dài.\n"
                "2. KHỞI ĐẦU BẰNG HỘP TL;DR: Luôn bắt đầu bài phân tích bằng đúng 1 dòng trích dẫn tóm tắt cốt lõi định dạng blockquote: `> 💡 **Tóm tắt cốt lõi (TL;DR)**: [Kết luận 1-2 câu quan trọng nhất]`.\n"
                "3. DIỄN ĐẠT ĐỜI THƯỜNG, DỄ HIỂU: Giọng văn ấm áp, khích lệ như một người bạn am hiểu tài chính. Tuyệt đối KHÔNG dùng thuật ngữ đao to búa lớn (KHÔNG dùng: geo-arbitrage, glidepath, sequence of returns risk, waterfall rút vốn, hệ số beta/sharpe...). Hãy giải thích bằng ngôn từ thực tế như 'bình oxy tiền mặt', 'chia tiền vào nhiều giỏ', 'tiền đẻ ra tiền'.\n"
                "4. KHÔNG SINH BẢNG HOẶC KHỐI CODE: Giao diện hiển thị không hỗ trợ bảng (markdown table) hay khối code (```). CHỈ ĐƯỢC DÙNG tiêu đề H3 (###), danh sách gạch đầu dòng (-), danh sách số (1.) và chữ in đậm (**).\n"
                "5. BÁM SÁT DỮ LIỆU ĐƯỢC CUNG CẤP: Tuyệt đối không bịa đặt số liệu mâu thuẫn với thông số của người dùng. Mọi ví dụ số tiền đều phải lấy tỷ lệ phù hợp với quy mô thu nhập và chi tiêu của họ.\n"
                "6. ĐÚNG CHUYÊN ĐỀ BIỂU ĐỒ: Tập trung 100% vào nội dung của biểu đồ được yêu cầu, không lặp lại nội dung của biểu đồ khác."
            )

            # Specialized prompt tailored dynamically for each specific chart topic
            if chart_id in ("chart-networth", "chart-net-worth"):
                chart_specific_instructions = (
                    f"CHỦ ĐỀ CHUYÊN BIỆT: TĂNG TRƯỞNG TÀI SẢN RÒNG & ĐIỂM CHẠM TỰ DO TÀI CHÍNH (FIRE)\n"
                    f"Dữ liệu biểu đồ: Điểm FIRE đạt ở tuổi {fire_age} với Nest Egg mục tiêu {chart_summary.get('fireTarget', 'N/A')}. "
                    f"Đỉnh tài sản đạt {chart_summary.get('peakNetWorth', 'N/A')} ở tuổi {chart_summary.get('peakAge', retire_age)}. "
                    f"Tài sản cuối đời tuổi {life_exp} dự kiến còn {chart_summary.get('finalNetWorth', 'N/A')}.\n\n"
                    f"YÊU CẦU CẤU TRÚC PHẢN HỒI (sau dòng TL;DR):\n"
                    f"### 🎯 Đánh giá Mốc Tuổi Nghỉ Hưu {retire_age} tuổi\n"
                    f"(So sánh tuổi mong muốn {retire_age} tuổi với tuổi đạt FIRE thực tế {fire_age} tuổi. Khẳng định xem kế hoạch khả thi hay cần điều chỉnh thời gian tích lũy)\n\n"
                    f"### 💡 1. Sức bền của Khối Tài sản & Tiền Lãi Nuôi Sống\n"
                    f"(Giải thích dễ hiểu về mốc tài sản mục tiêu, dòng tiền sinh lời hàng năm so với mức chi tiêu {ret_exp:,.0f} {cur_sym}/năm, tiền gốc có bị vơi không)\n\n"
                    f"### ⚖️ 2. So sánh 3 mốc tuổi nghỉ hưu linh hoạt\n"
                    f"- **Mốc {early_age} tuổi (Nghỉ sớm hơn)**: [Đánh giá mức độ an toàn và điều kiện cần nếu muốn nghỉ sớm]\n"
                    f"- **Mốc {retire_age} tuổi (Mốc mục tiêu của bạn)**: [Đánh giá độ cân bằng giữa tích lũy và hưởng thụ]\n"
                    f"- **Mốc {late_age} tuổi (Làm thêm vài năm)**: [Đánh giá độ dư dả và gia tăng di sản]\n\n"
                    f"### 🎯 3. Các bước hành động cụ thể làm theo ngay\n"
                    f"1. [Hành động tích lũy tự động hàng tháng kèm con số thực tế]\n"
                    f"2. [Hành động chuẩn bị quỹ đệm an toàn trước thềm nghỉ hưu]"
                )
            elif chart_id in ("chart-cashflow", "chart-cash-flow"):
                chart_specific_instructions = (
                    f"CHỦ ĐỀ CHUYÊN BIỆT: DÒNG TIỀN THEO TỪNG CHẶNG ĐỜI (THU NHẬP vs CHI TIÊU vs TÍCH LŨY/RÚT VỐN)\n"
                    f"Dữ liệu biểu đồ: Tuổi đi làm ({cur_age} – {retire_age} tuổi), Tuổi hưu trí ({retire_age} – {life_exp} tuổi). "
                    f"Tổng thu nhập cả đời: {chart_summary.get('totalLifetimeIncome', 'N/A')}, Tổng chi tiêu cả đời: {chart_summary.get('totalLifetimeExpenses', 'N/A')}. "
                    f"Tích lũy hàng năm hiện tại: {ann_sav:,.0f} {cur_sym}/năm, Chi tiêu hưu trí dự kiến: {ret_exp:,.0f} {cur_sym}/năm.\n\n"
                    f"YÊU CẦU CẤU TRÚC PHẢN HỒI (sau dòng TL;DR):\n"
                    f"### 💡 1. Dòng tiền Vào & Ra qua 2 giai đoạn cuộc đời\n"
                    f"(Phân tích giai đoạn tích lũy tuổi {cur_age}–{retire_age} và bước ngoặt chuyển sang giai đoạn rút tiền từ tuổi {retire_age})\n\n"
                    f"### ⚠️ 2. Lưu ý về Khoảng trống Dòng tiền những năm đầu nghỉ hưu\n"
                    f"(Chỉ rõ rủi ro khi thu nhập chủ động chấm dứt ở tuổi {retire_age} nhưng các nguồn lương hưu nhà nước hoặc dòng tiền thụ động khác chưa đạt đỉnh; cách quản lý chi tiêu tránh thâm hụt vốn sớm)\n\n"
                    f"### 🎯 3. Cách tối ưu dòng tiền hàng tháng để luôn thảnh thơi\n"
                    f"1. [Chiến lược tạo thêm dòng thu nhập nhẹ nhàng hoặc phân bổ tiền mặt]\n"
                    f"2. [Tối ưu hóa các khoản nợ vay hoặc chi phí cố định]"
                )
            elif chart_id in ("chart-withdrawal-comparison", "chart-withdrawals"):
                strat_info = json.dumps(chart_summary.get("strategies", []), ensure_ascii=False)
                chart_specific_instructions = (
                    f"CHỦ ĐỀ CHUYÊN BIỆT: SO SÁNH 4 CHIẾN LƯỢC RÚT TIỀN HƯU TRÍ TRÊN CÙNG KỊCH BẢN\n"
                    f"Dữ liệu mô phỏng thực tế của 4 chiến lược: {strat_info}. Tỷ lệ rút ban đầu (SWR): {chart_summary.get('initialSWR', '4%')}. "
                    f"Chiến lược người dùng đang chọn: {chart_summary.get('chosenStrategy', 'guyton_klinger')}.\n\n"
                    f"YÊU CẦU CẤU TRÚC PHẢN HỒI (sau dòng TL;DR):\n"
                    f"### 💡 1. Đánh giá số dư thực tế của 4 chiến lược ở tuổi {life_exp}\n"
                    f"(Trích dẫn trực tiếp số dư cuối đời và tính ổn định của 4 phương pháp từ dữ liệu mô phỏng: Quy tắc 4% cố định Bengen, Lan can Guyton-Klinger, Tỷ lệ thay đổi VPW, và Rút % cố định)\n\n"
                    f"### 🛡️ 2. Vì sao Chiến lược Lan can (Guyton-Klinger) là lá chắn an toàn nhất?\n"
                    f"(Giải thích cơ chế tự điều chỉnh: giảm 10% chi tiêu khi thị trường khó khăn và tự thưởng khi danh mục tăng trưởng vượt trội)\n\n"
                    f"### 🎯 3. Quy tắc rút tiền thực tế từng năm bạn nên áp dụng\n"
                    f"1. [Hướng dẫn mức rút năm đầu tiên kèm số tiền cụ thể]\n"
                    f"2. [Nguyên tắc ứng phó khi thị trường giảm điểm]"
                )
            elif chart_id in ("chart-tax-optimization", "chart-taxes"):
                chart_specific_instructions = (
                    f"CHỦ ĐỀ CHUYÊN BIỆT: TỐI ƯU HÓA THUẾ & TẬN DỤNG CÁC TÀI KHOẢN ƯU ĐÃI (PEA, ASSURANCE-VIE, ROTH)\n"
                    f"Dữ liệu tài khoản: Số dư PEA: {chart_summary.get('peaBalance', '35.000 €')}, Assurance-Vie: {chart_summary.get('avBalance', '10.000 €')}, "
                    f"Tổng thuế tiết kiệm từ chuyển đổi: {chart_summary.get('taxSavings', 'N/A')}, Tiết kiệm từ thứ tự rút vốn (waterfall): {chart_summary.get('waterfallTaxSaved', '18.400 €')}.\n\n"
                    f"YÊU CẦU CẤU TRÚC PHẢN HỒI (sau dòng TL;DR):\n"
                    f"### 💡 1. Giá trị của việc tối ưu thuế & Ưu đãi từ tài khoản tích lũy\n"
                    f"(Giải thích lợi thế giữ lại tiền lời nhờ mốc thời gian 5 năm PEA và 8 năm Assurance-Vie hoặc tài khoản miễn thuế; tại sao tiết kiệm thuế tương đương với tăng tỷ suất sinh lời)\n\n"
                    f"### ⚠️ 2. Cạm bẫy về thời gian & Thay đổi cư trú thuế\n"
                    f"(Nhắc nhở quan trọng: tuổi tài khoản tính từ ngày mở chứ không phải ngày nộp nhiều tiền; lưu ý khi chuyển cư trú giữa các quốc gia)\n\n"
                    f"### 🎯 3. Thứ tự rút tiền thông minh 3 bước (Rút đúng giỏ tiền)\n"
                    f"1. [Bước 1: Rút từ tài khoản tiền mặt/tiết kiệm ngắn hạn không thuế]\n"
                    f"2. [Bước 2: Rút từ tài khoản có ưu đãi thuế trong hạn mức miễn thuế hàng năm]\n"
                    f"3. [Bước 3: Tối ưu tài khoản đầu tư sinh lời còn lại]"
                )
            elif chart_id in ("chart-monte-carlo", "chart-insights"):
                chart_specific_instructions = (
                    f"CHỦ ĐỀ CHUYÊN BIỆT: MÔ PHỎNG MONTE CARLO KỊCH BẢN THỊ TRƯỜNG & RỦI RO SỤT GIẢM SỚM (SRR)\n"
                    f"Dữ liệu mô phỏng: Tỷ lệ sống sót thành công: {chart_summary.get('successRate', 'N/A')}. "
                    f"Kịch bản trung vị (50th): {chart_summary.get('medianEnd', 'N/A')}. "
                    f"Kịch bản xấu nhất (10th/Khủng hoảng): {chart_summary.get('worstCase', 'N/A')}. "
                    f"Kịch bản bùng nổ (90th): {chart_summary.get('bestCase', 'N/A')}. Độ biến động giả định: {chart_summary.get('volatility', '15%')}.\n\n"
                    f"YÊU CẦU CẤU TRÚC PHẢN HỒI (sau dòng TL;DR):\n"
                    f"### 💡 1. Ý nghĩa của Tỷ lệ Thành công {chart_summary.get('successRate', '')} trong 1.000 Cuộc Đời Giả Lập\n"
                    f"(Đánh giá xem tỷ lệ thành công này đã đủ an tâm chưa và tiềm năng tăng trưởng trung vị {chart_summary.get('medianEnd', '')})\n\n"
                    f"### ⚠️ 2. Kịch bản Nguy Hiểm Nhất: Thị trường giảm sâu vào đúng 2-3 năm đầu nghỉ việc\n"
                    f"(Giải thích vì sao bán tháo tài sản khi thị trường sụt giảm đầu kỳ nghỉ hưu là đòn chí mạng bào mòn vốn)\n\n"
                    f"### 🎯 3. Cách tạo 'Bình Oxy Tiền Mặt 2 Năm' để ngủ ngon\n"
                    f"1. [Hướng dẫn trích lập số tiền mặt chi tiêu 2 năm trước ngày nghỉ việc kèm con số ví dụ]\n"
                    f"2. [Nguyên tắc bất di bất dịch: Khi thị trường gấu thì chỉ tiêu tiền trong bình oxy, chờ thị trường hồi phục]"
                )
            elif chart_id in ("chart-scenarios", "chart-stress-test"):
                chart_specific_instructions = (
                    f"CHỦ ĐỀ CHUYÊN BIỆT: THỬ SỨC TÀI CHÍNH TRƯỚC CÁC BIẾN CỐ LỚN (WHAT-IF STRESS TEST)\n"
                    f"Kịch bản đang kiểm tra: '{chart_summary.get('title', 'What-If')}' (Mã: {chart_summary.get('activeScenario', '')}).\n"
                    f"Đánh giá hệ thống: {chart_summary.get('assessment', '')}. "
                    f"Chênh lệch tài sản cuối đời so với cơ sở: {chart_summary.get('netWorthDiff', '0')}. "
                    f"Khả năng tồn tại tài sản: {chart_summary.get('survived', 'An toàn')}. "
                    f"Tài sản kịch bản: {chart_summary.get('scenarioFinalNW', 'N/A')} (so với cơ sở {chart_summary.get('baseFinalNW', 'N/A')}).\n\n"
                    f"YÊU CẦU CẤU TRÚC PHẢN HỒI (sau dòng TL;DR):\n"
                    f"### 💡 1. Tác động thực tế của Cú sốc này lên Kế hoạch FIRE\n"
                    f"(Phân tích mức độ suy giảm tài sản và khả năng chống chịu của danh mục trước biến cố)\n\n"
                    f"### ⚠️ 2. Điểm yếu dễ bị tổn thương nhất\n"
                    f"(Chỉ ra nguyên nhân khiến tài sản bị suy giảm và hậu quả nếu không có phương án ứng phó)\n\n"
                    f"### 🎯 3. Biện pháp phòng thủ chủ động\n"
                    f"1. [Hành động phòng ngừa trước khi biến cố xảy ra]\n"
                    f"2. [Hành động thích ứng nếu biến cố thực sự diễn ra (cắt giảm chi tiêu linh hoạt, điều chỉnh lối sống)]"
                )
            elif chart_id in ("chart-spending-smile", "chart-estate"):
                chart_specific_instructions = (
                    f"CHỦ ĐỀ CHUYÊN BIỆT: ĐƯỜNG CONG CHI TIÊU HÌNH NỤ CƯỜI & KẾ HOẠCH DI SẢN THỪA KẾ\n"
                    f"Dữ liệu: Tuổi nghỉ hưu: {chart_summary.get('retireAge', retire_age)} tuổi, Tuổi thọ dự tính: {chart_summary.get('lifeExpectancy', life_exp)} tuổi. "
                    f"Mục tiêu di sản để lại: {chart_summary.get('targetLegacy', 'N/A')}, Dự kiến tài sản để lại: {chart_summary.get('projectedLegacy', 'N/A')} "
                    f"(Đạt {chart_summary.get('pctOfTarget', 'N/A')} mục tiêu).\n\n"
                    f"YÊU CẦU CẤU TRÚC PHẢN HỒI (sau dòng TL;DR):\n"
                    f"### 💡 1. Chi tiêu đời người hình 'Nụ cười' (Go-Go ➔ Slow-Go ➔ No-Go)\n"
                    f"(Giải thích vì sao 10 năm đầu hưu trí ({chart_summary.get('retireAge', retire_age)}–{int(chart_summary.get('retireAge', retire_age)) + 12} tuổi) là lúc tiêu nhiều nhất để trải nghiệm, sau đó chi tiêu tự giảm xuống giúp giảm áp lực tích lũy)\n\n"
                    f"### 🏛️ 2. Kế hoạch Chuyển giao Di sản & Tối ưu Thuế\n"
                    f"(Đánh giá con số tài sản để lại so với mục tiêu; cách chuyển giao dần từng phần khi con cháu lập nghiệp thay vì dồn vào cuối đời)\n\n"
                    f"### 🎯 3. Lời khuyên phân bổ để tận hưởng trọn vẹn cuộc sống\n"
                    f"1. [Mạnh dạn chi tiêu trải nghiệm cho giai đoạn sức khỏe sung mãn nhất]\n"
                    f"2. [Kế hoạch chuẩn bị quỹ chăm sóc y tế cho chặng đời sau 75 tuổi]"
                )
            elif chart_id in ("chart-patrimoine", "chart-pylocation"):
                apt_cnt = chart_summary.get('total_apartments', 0)
                prop_val = chart_summary.get('total_property_value', 0)
                loan_amt = chart_summary.get('total_loan_amount', 0)
                during_cf = chart_summary.get('total_during_cashflow_monthly', 0)
                post_cf = chart_summary.get('total_postloan_cashflow_monthly', 0)
                turo_cnt = chart_summary.get('turo_cars_count', 0)
                turo_cf = chart_summary.get('turo_cashflow_monthly', 0)
                total_passive = chart_summary.get('total_passive_monthly', post_cf + turo_cf)
                turo_desc = f"kèm đội xe Turo {turo_cnt} xe mang về dòng tiền +{turo_cf:,.0f} {cur_sym}/tháng" if turo_cnt > 0 or turo_cf > 0 else "chưa bao gồm xe Turo"

                chart_specific_instructions = (
                    f"CHỦ ĐỀ CHUYÊN BIỆT: BẤT ĐỘNG SẢN CHO THUÊ (LMNP), ĐÒN BẨY TÀI CHÍNH & DÒNG TIỀN THỤ ĐỘNG\n"
                    f"Dữ liệu danh mục: {apt_cnt} bất động sản (tổng giá trị {prop_val:,.0f} {cur_sym}, dư nợ vay {loan_amt:,.0f} {cur_sym}). "
                    f"Dòng tiền hàng tháng trong kỳ trả góp: {during_cf:,.0f} {cur_sym}/tháng. "
                    f"Dòng tiền ròng sau khi trả hết nợ vay: +{post_cf:,.0f} {cur_sym}/tháng ({turo_desc}). "
                    f"Tổng dòng tiền thụ động kỳ vọng về già: +{total_passive:,.0f} {cur_sym}/tháng.\n\n"
                    f"YÊU CẦU CẤU TRÚC PHẢN HỒI (sau dòng TL;DR):\n"
                    f"### 💡 1. Sức mạnh Đòn bẩy Ngân hàng & Cỗ máy Dòng tiền Thụ động\n"
                    f"(Phân tích danh mục {apt_cnt} BĐS đang được người thuê nhà trả nợ thay bạn; dòng tiền ròng vững chắc sau khi tất toán gói vay đối chiếu với chi phí sinh hoạt tuổi già)\n\n"
                    f"### 🛡️ 2. Tấm khiên thuế Khấu hao Tài sản (Amortissement)\n"
                    f"(Giải thích cơ chế trích khấu hao tài sản giúp giảm hoặc triệt tiêu thuế thu nhập từ tiền thuê nhà trong nhiều năm đầu)\n\n"
                    f"### 🎯 3. Các bước hành động cụ thể để quản lý an nhàn\n"
                    f"1. [Trích lập quỹ đệm sửa chữa và phòng ngừa rủi ro trống phòng khoảng 3–6 tháng tiền thuê]\n"
                    f"2. [Chiến lược ủy thác vận hành chuyên nghiệp khi chuyển nơi sinh sống để hưởng dòng tiền thụ động không lo âu]"
                )
            else:
                chart_specific_instructions = (
                    "CHỦ ĐỀ: PHÂN TÍCH CHIẾN LƯỢC TÀI CHÍNH TỔNG THỂ\n"
                    "YÊU CẦU CẤU TRÚC PHẢN HỒI (sau dòng TL;DR):\n"
                    "### 💡 1. Đánh giá Tổng thể Biểu đồ\n"
                    "### ⚠️ 2. Điểm cần lưu ý\n"
                    "### 🎯 3. Hành động đề xuất cụ thể kèm ví dụ"
                )

            prompt = (
                f"Hãy phân tích biểu đồ tài chính '{chart_title}' (Chart ID: {chart_id}) cho người dùng dựa trên dữ liệu sau:\n"
                f"- Tên kế hoạch: {plan.get('name', 'Franco-Viet FIRE')}\n"
                f"- Tiền tệ: {plan.get('currency', 'EUR')}\n"
                f"- Tuổi hiện tại: {cur_age}, Tuổi dự định nghỉ hưu sớm: {retire_age}, Tuổi thọ dự kiến: {life_exp}\n"
                f"- Tổng thu nhập hàng năm: {total_annual_income:,.0f} {cur_sym}, Tiết kiệm hàng năm: {ann_sav:,.0f} {cur_sym} (tỷ lệ {plan.get('savingsRate', 33.3)}%)\n"
                f"- Chi tiêu khi về hưu: {ret_exp:,.0f} {cur_sym}/năm (~{monthly_exp_vnd} triệu ₫/tháng)\n"
                f"- Tóm tắt số liệu mô phỏng: {json.dumps(chart_summary, ensure_ascii=False)}\n\n"
                f"{chart_specific_instructions}"
            )

            user_model = payload.get("model") or os.environ.get("GEMINI_MODEL")
            if not user_model and SETTINGS_FILE.exists():
                try:
                    with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                        settings = json.load(f)
                        user_model = settings.get("gemini_model")
                except Exception:
                    pass

            # Dynamically prioritize user-specified model, followed by latest versions
            candidate_models = []
            if user_model and user_model.strip():
                candidate_models.append(user_model.strip())
            for m in ["gemini-flash-lite-latest", "gemini-2.5-flash", "gemini-3.8-flash", "gemini-3.7-flash"]:
                if m not in candidate_models:
                    candidate_models.append(m)

            for model_name in candidate_models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key.strip()}"
                gen_config: Dict[str, Any] = {
                    "temperature": 0.4,
                    "maxOutputTokens": 4096
                }
                # Disable thinking budget for 2.5 models so tokens are not consumed by reasoning
                if "2.5" in model_name or "thinking" in model_name:
                    gen_config["thinkingConfig"] = {"thinkingBudget": 0}

                req_body = {
                    "system_instruction": {
                        "parts": [{"text": system_instruction}]
                    },
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }],
                    "generationConfig": gen_config
                }
                async with httpx.AsyncClient(timeout=20.0) as client:
                    resp = await client.post(url, json=req_body)
                    # If endpoint doesn't support system_instruction field, fallback by prepending to user prompt
                    if resp.status_code == 400 and "system_instruction" in resp.text:
                        fallback_body = {
                            "contents": [{
                                "parts": [{"text": f"CHỈ THỊ HỆ THỐNG:\n{system_instruction}\n\n---\n\n{prompt}"}]
                            }],
                            "generationConfig": gen_config
                        }
                        resp = await client.post(url, json=fallback_body)

                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            # Extract textual content, filtering out thought parts
                            text = "".join(p.get("text", "") for p in parts if "text" in p and not p.get("thought", False))
                            if text:
                                return {
                                    "success": True,
                                    "source": "gemini_api",
                                    "model": model_name,
                                    "analysis": text
                                }
                    else:
                        print(f"⚠️ [Gemini API] Model {model_name} không phản hồi thành công (HTTP {resp.status_code}): {resp.text[:150]}")
        except Exception as e:
            print(f"⚠️ [Gemini API Error]: {e}")

    # Fallback to local heuristic engine (clearly labeled so user is never misled)
    analysis = generate_local_gemini_analysis(chart_id, chart_title, chart_summary, plan)
    return {
        "success": True,
        "source": "gemini_engine",
        "model": "Chế độ Ngoại tuyến (Heuristic Fallback)",
        "analysis": "> ℹ️ *Lưu ý: Phân tích dự phòng theo thuật toán Heuristic nội bộ (do Gemini API chưa kết nối hoặc model tạm hết quota).*\n\n" + analysis
    }

# Mount frontend files
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
else:
    @app.get("/")
    def index():
        return {"message": "pyRetrait API is running. Frontend directory will be loaded once created."}
