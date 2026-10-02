import os
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Body, Header
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

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
    if err:
        raise HTTPException(status_code=400, detail=err)
    
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
    if err:
        raise HTTPException(status_code=401, detail=err)
    
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

    # Guest / Demo Mode
    try:
        if PLANS_FILE.exists():
            with open(PLANS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            return data
    except Exception:
        pass
    return DEFAULT_PLANS

@app.post("/api/plans")
def save_plans(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    user = get_current_user_optional(authorization)
    if user:
        save_user_plans(user["id"], payload)
        return {"status": "success", "message": "Kế hoạch đã được lưu vào tài khoản đám mây của bạn!"}

    # Guest / Demo Mode: write to shared file
    try:
        with open(PLANS_FILE, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        return {"status": "success", "message": "Đã lưu kế hoạch (Chế độ Khách)"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# pyLocation Integration: Real Estate (LMNP), Turo Fleet & Patrimoine Endpoints
# ==============================================================================
def _compute_apartment_metrics(name: str, apt: Dict[str, Any]) -> Dict[str, Any]:
    try:
        from calculator.mortgage import calculate_mortgage, calculate_notary_fees
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
    
    return {
        "name": name,
        "address": apt.get("address", name),
        "surface": surface,
        "typology": apt.get("typology", "T2"),
        "dpe_rating": apt.get("dpe_rating", "C"),
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
        from calculator.turo import calculate_turo_investment
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

    computed_apartments = []
    tot_val = 0
    tot_loan = 0
    tot_rent = 0
    tot_pmt = 0
    tot_cf_current = 0
    tot_cf_post_loan = 0
    tot_down_payment = 0

    for name, apt_data in apts_raw.items():
        comp = _compute_apartment_metrics(name, apt_data)
        computed_apartments.append(comp)
        tot_val += comp["property_price"]
        tot_loan += comp["loan_amount"]
        tot_rent += comp["monthly_rent"]
        tot_pmt += comp["monthly_loan_payment"]
        tot_cf_current += comp["monthly_cashflow"]
        tot_cf_post_loan += comp["monthly_post_loan_cashflow"]
        tot_down_payment += comp["down_payment"]

    computed_turo = _compute_turo_metrics(turo_raw)

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
        "wealth": wealth_raw,
        "summary": summary
    }

@app.post("/api/pylocation/apartment")
def save_pylocation_apartment(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    """Save or update an apartment in pyLocation / user account."""
    name = str(payload.get("name", "")).strip()
    data = payload.get("data", {})
    if not name:
        raise HTTPException(status_code=400, detail="Tên căn hộ không được để trống")
    
    user = get_current_user_optional(authorization)
    if user:
        user_pat = get_user_patrimoine(user["id"]) or {}
        apts = user_pat.get("apartments", {})
        apts[name] = data
        user_pat["apartments"] = apts
        save_user_patrimoine(user["id"], user_pat)
        return {"success": True, "message": f"Căn hộ '{name}' đã được lưu vào tài khoản đám mây của bạn!", "apartment": _compute_apartment_metrics(name, data)}

    # Guest mode
    apts_file = PYLOCATION_DATA_DIR / "saved_apartments.json"
    apts = {}
    if apts_file.exists():
        try:
            with open(apts_file, "r", encoding="utf-8") as f:
                apts = json.load(f)
        except Exception:
            pass

    apts[name] = data
    PYLOCATION_DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(apts_file, "w", encoding="utf-8") as f:
        json.dump(apts, f, ensure_ascii=False, indent=2)

    return {"success": True, "message": f"Căn hộ '{name}' đã được lưu thành công", "apartment": _compute_apartment_metrics(name, data)}

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
            return {"success": True, "message": f"Đã xóa căn hộ '{name}' khỏi tài khoản của bạn"}
        raise HTTPException(status_code=404, detail=f"Không tìm thấy căn hộ '{name}'")

    apts_file = PYLOCATION_DATA_DIR / "saved_apartments.json"
    if not apts_file.exists():
        raise HTTPException(status_code=404, detail="File không tồn tại")
    
    with open(apts_file, "r", encoding="utf-8") as f:
        apts = json.load(f)

    if name in apts:
        del apts[name]
        with open(apts_file, "w", encoding="utf-8") as f:
            json.dump(apts, f, ensure_ascii=False, indent=2)
        return {"success": True, "message": f"Đã xóa căn hộ '{name}'"}
    else:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy căn hộ '{name}'")

@app.post("/api/pylocation/turo")
def save_pylocation_turo(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    """Save Turo fleet settings."""
    user = get_current_user_optional(authorization)
    if user:
        user_pat = get_user_patrimoine(user["id"]) or {}
        user_pat["turo"] = payload
        save_user_patrimoine(user["id"], user_pat)
        return {"success": True, "turo": _compute_turo_metrics(payload)}

    turo_file = PYLOCATION_DATA_DIR / "turo_settings.json"
    PYLOCATION_DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(turo_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    return {"success": True, "turo": _compute_turo_metrics(payload)}

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

    # 1. Update/Add Real Estate Passive Income
    existing_re_idx = -1
    for idx, inc in enumerate(plan["incomes"]):
        if "LMNP" in inc.get("name", "") or "BĐS Cho thuê" in inc.get("name", ""):
            existing_re_idx = idx
            break

    re_income_item = {
        "name": "🏠 BĐS Cho thuê LMNP Pháp",
        "amount": annual_rental_cf if annual_rental_cf > 0 else 18000,
        "startAge": cur_age,
        "endAge": 85,
        "growth": 1.5,
        "taxable": False # LMNP amortized = 0 tax
    }

    if existing_re_idx >= 0:
        plan["incomes"][existing_re_idx] = re_income_item
    else:
        plan["incomes"].append(re_income_item)

    # 2. Update/Add Turo Fleet Passive Income
    if turo_annual_cf > 0:
        existing_turo_idx = -1
        for idx, inc in enumerate(plan["incomes"]):
            if "Turo" in inc.get("name", "") or "Cho thuê xe" in inc.get("name", ""):
                existing_turo_idx = idx
                break

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

    # 3. Synchronize Real Estate Asset Allocation Weight
    if "assetAllocation" in plan:
        plan["assetAllocation"]["realEstate"] = 30
        plan["assetAllocation"]["stocks"] = 55
        plan["assetAllocation"]["bonds"] = 15

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
        withdrawal_rate = float(payload.get("withdrawalRate", 4.0)) / 100.0
        
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
    except Exception as e:
        pass

    return {"models": default_models, "source": "static"}

def generate_local_gemini_analysis(chart_id: str, chart_title: str, chart_summary: Dict[str, Any], plan: Dict[str, Any]) -> str:
    """Phân tích tài chính thông thái, thân thiện, dễ hiểu, không dùng thuật ngữ rườm rà và luôn có ví dụ thực tế."""
    cur = plan.get("currency", "EUR")
    cur_sym = "€" if cur == "EUR" else ("₫" if cur == "VND" else "$")
    cur_age = plan.get("currentAge", 29)
    retire_age = plan.get("retirementAge", 42)
    life_exp = plan.get("lifeExpectancy", 85)
    
    if chart_id in ("chart-networth", "chart-net-worth"):
        peak = chart_summary.get("peakNetWorth", "N/A")
        peak_age = chart_summary.get("peakAge", retire_age)
        final_nw = chart_summary.get("finalNetWorth", "N/A")
        fire_target = chart_summary.get("fireTarget", "N/A")
        fire_age = chart_summary.get("fireAge", 42)
        has_mortgage = plan.get("mortgage", {}).get("enabled", True)
        
        salary_amt = plan.get("incomes", [{}])[0].get("amount", 25000) if plan.get("incomes") else 25000
        ann_sav = plan.get("annualSavings", 7922)
        ret_exp = plan.get("retirementExpenses", 10000)
        forex = plan.get("exchangeRateEurVnd", 27500)
        monthly_exp_vnd = round((ret_exp * forex) / 12 / 1_000_000)
        
        mortgage_text = (
            "- **Căn nhà trả góp tại Pháp**: Đến năm 42 tuổi, bạn đã trả nợ được 13/20 năm. Khi về Việt Nam, bạn có thể cho thuê nhà tại Pháp để tiền thuê tự nuôi phần nợ còn lại, hoặc bán lấy một khoản vốn lớn mang về nước."
            if has_mortgage else
            "- **Toàn bộ tiền ở dạng linh hoạt**: Bạn không bị kẹt vốn vào nhà đất, giúp bạn hoàn toàn chủ động điều chuyển tiền và an tâm sinh sống."
        )
        
        return (
            f"### 🎯 Tuổi nghỉ hưu thích hợp nhất: 41 – 42 tuổi\n"
            f"Dựa trên thu nhập lương {salary_amt:,.0f} {cur_sym}/năm, tiền để dành đều đặn ~{ann_sav:,.0f} {cur_sym}/năm (~{round(ann_sav/12)} {cur_sym}/tháng) và mức chi tiêu mong muốn khi về Việt Nam là {ret_exp:,.0f} {cur_sym}/năm (~{monthly_exp_vnd} triệu VNĐ/tháng), **độ tuổi nghỉ hưu thích hợp và an toàn nhất cho bạn là 41 – 42 tuổi** (đúng ngay mốc bạn đang nhắm tới).\n\n"
            f"### 💡 1. Tại sao mốc 41 – 42 tuổi là điểm vàng hưu trí của bạn?\n"
            f"- **Tiền tự đẻ ra tiền đủ nuôi bạn**: Ở tuổi 42, danh mục đầu tư đạt mốc mục tiêu khoảng **{fire_target}** (gần 7,1 tỷ VNĐ). Chỉ cần rút 4% tiền lời mỗi năm ({round(ret_exp):,.0f} {cur_sym}/năm), cộng thêm 200 {cur_sym}/tháng tiền cổ tức có sẵn từ tuổi 38, bạn có **~29 triệu VNĐ/tháng** — dư sức chi trả mức sống {monthly_exp_vnd} triệu/tháng và còn dư tiền làm quỹ du lịch.\n"
            f"- **Tiền gốc không bao giờ vơi**: Bạn chỉ tiêu phần tiền lãi, còn tiền gốc vẫn tiếp tục sinh sôi. Đến tuổi {life_exp}, bạn vẫn còn khoảng **{final_nw}** (tài sản đạt đỉnh **{peak}** ở tuổi {peak_age}).\n"
            f"{mortgage_text}\n\n"
            f"### ⚖️ 2. So sánh 3 mốc tuổi để bạn dễ dàng lựa chọn\n"
            f"- **Mốc 39 tuổi (Nghỉ sớm - Hơi sát nút)**: Tài sản tích lũy đạt ~180.000 € (~5 tỷ VNĐ). Mức này đủ tiền ăn tiêu cơ bản, nhưng nếu năm đó thị trường kinh tế khó khăn thì dễ bị hụt tiền. Bạn chỉ nên nghỉ ở tuổi 39 nếu có thêm một công việc tự do nhẹ nhàng kiếm thêm 5–7 triệu VNĐ/tháng.\n"
            f"- **Mốc 41 – 42 tuổi (Khuyên dùng - Cân bằng hoàn hảo)**: Tài sản đạt ~260.000 €, tạo ra dòng tiền an toàn ~29 triệu VNĐ/tháng. Bạn hoàn toàn tự do tài chính, không sợ biến động thị trường và thoải mái tận hưởng cuộc sống.\n"
            f"- **Mốc 45 tuổi (Rất dư dả)**: Danh mục vượt 380.000 € (~10,4 tỷ VNĐ), chi tiêu thoải mái 35–40 triệu VNĐ/tháng không cần suy nghĩ.\n\n"
            f"### 🎯 3. Các bước cụ thể bạn có thể làm theo ngay\n"
            f"1. **Duy trì thói quen 'trả cho mình trước'**: Cứ ngày nhận lương, tự động chuyển ngay {round(ann_sav/12)} {cur_sym} vào tài khoản đầu tư tích lũy (PEA / quỹ chỉ số ETF toàn cầu) trước khi chi tiêu sinh hoạt.\n"
            f"2. **Chuẩn bị 2 năm tiền mặt ở tuổi 40–41**: Khoảng 1–2 năm trước khi về Việt Nam, hãy trích sẵn khoảng 20.000 € vào sổ tiết kiệm ngắn hạn (như Livret A). Khoản tiền này để chi tiêu 2 năm đầu tiên về nước, giúp bạn ngủ ngon dù thị trường có lên xuống."
        )

    elif chart_id in ("chart-cashflow", "chart-cash-flow"):
        return (
            f"### 💡 1. Nhìn nhanh dòng tiền vào và ra của bạn\n"
            f"- **Giai đoạn đi làm (Tuổi {cur_age} – {retire_age})**: Tiền lương hàng tháng tại Pháp nhiều hơn tiền chi tiêu, phần dư ra liên tục được đưa vào đầu tư giúp tài sản tăng nhanh.\n"
            f"- **Giai đoạn nghỉ hưu sớm (Sau tuổi {retire_age})**: Bạn ngừng nhận lương, chuyển sang dùng tiền lãi và rút một phần nhỏ từ tài sản đầu tư để sinh sống tại Việt Nam.\n"
            f"- **Sau tuổi 65 có thêm tiền hỗ trợ**: Bạn sẽ bắt đầu nhận thêm tiền lương hưu từ Pháp, giúp giảm gánh nặng phải tự rút tiền túi.\n\n"
            f"### ⚠️ 2. Điểm cần lưu ý về dòng tiền\n"
            f"- **Khoảng trống từ tuổi {retire_age} đến 65 (khoảng {65 - retire_age} năm)**: Trong những năm này, bạn chưa có lương hưu hỗ trợ mà phải hoàn toàn tự túc từ số tiền tích lũy. Vì vậy cần tránh các khoản chi tiêu quá lớn bất ngờ.\n\n"
            f"### 🎯 3. Các bước cụ thể bạn có thể làm theo ngay\n"
            f"1. **Tạo thêm nguồn thu nhập nhẹ nhàng** (Ví dụ: Mua một căn nhà nhỏ cho thuê hoặc nhận tiền cổ tức đều đặn khoảng vài triệu mỗi tháng, giúp bạn có thêm tiền tiêu vặt mà không phải rút vào tiền gốc).\n"
            f"2. **Nếu lãi vay nhà đang thấp, không cần vội trả hết** (Ví dụ: Nếu lãi vay mua nhà chỉ 1.5%–2%/năm, bạn nên trả góp đều đặn hàng tháng thay vì dồn một cục tiền lớn trả hết, vì đem số tiền đó đi đầu tư có thể sinh lời 6%–8%/năm)."
        )

    elif chart_id in ("chart-withdrawal-comparison", "chart-withdrawals"):
        return (
            f"### 💡 1. So sánh 4 cách rút tiền khi về hưu\n"
            f"- **Cách linh hoạt theo tình hình (Lan can - Khuyên dùng)**: Khi thị trường tăng tốt thì bạn được tiêu nhiều hơn một chút; khi năm nào kinh tế khó khăn thì tự động bớt chi tiêu khoảng 10%. Cách này giúp bạn không bao giờ sợ hết tiền.\n"
            f"- **Cách rút số tiền cố định mỗi năm**: Năm nào cũng rút một số tiền như nhau cộng thêm trượt giá. Cách này dễ tính nhưng nếu gặp năm thị trường giảm sâu thì tiền hao hụt khá nhanh.\n"
            f"- **Cách rút theo phần trăm**: Mỗi năm rút một tỷ lệ cố định trên số tiền còn lại. Tiền không bao giờ cạn, nhưng số tiền tiêu mỗi năm sẽ lên xuống thất thường.\n\n"
            f"### ⚠️ 2. Điều cần tránh\n"
            f"- Đừng rút quá 4%–4.5% tổng tài sản mỗi năm (Ví dụ: Có 10 tỷ thì mỗi năm chỉ nên rút khoảng 350 – 400 triệu để chi tiêu. Nếu rút nhiều hơn, tiền có thể hết trước tuổi già).\n\n"
            f"### 🎯 3. Các bước cụ thể bạn có thể làm theo ngay\n"
            f"1. **Áp dụng nguyên tắc linh hoạt**: Đặt mức chi tiêu khởi điểm khoảng 3.8% tổng tài sản (Ví dụ: Có 5 tỷ thì năm đầu tiêu khoảng 190 triệu, tương đương ~16 triệu/tháng).\n"
            f"2. **Điều chỉnh theo từng năm**: Năm nào danh mục lời nhiều thì tự thưởng chuyến du lịch; năm nào thị trường giảm thì giảm bớt chi tiêu mua sắm xa xỉ."
        )

    elif chart_id in ("chart-tax-optimization", "chart-taxes"):
        return (
            f"### 💡 1. Cách giữ lại nhiều tiền nhất trước thuế\n"
            f"- **Tận dụng tài khoản ưu đãi tại Pháp (PEA và Assurance-Vie)**: Nước Pháp có chính sách rất tốt cho người biết tích lũy dài hạn. Khi giữ tài khoản đủ thời gian (5 năm với PEA và 8 năm với Assurance-Vie), bạn sẽ được miễn phần lớn thuế thu nhập trên tiền lời.\n"
            f"- **Tiết kiệm hàng trăm triệu đồng**: Bằng cách chọn đúng tài khoản để rút tiền trước, bạn sẽ tránh được việc phải nộp thuế cao không đáng có.\n\n"
            f"### ⚠️ 2. Điều cần nhớ về thời gian\n"
            f"- Các tài khoản này tính tuổi từ **ngày bạn mở tài khoản**, chứ không phải từ ngày bạn nộp nhiều tiền. Nếu để sát ngày về hưu mới mở thì sẽ không kịp thời gian để được miễn thuế.\n\n"
            f"### 🎯 3. Các bước cụ thể bạn có thể làm theo ngay\n"
            f"1. **Mở tài khoản PEA và Assurance-Vie ngay hôm nay**: Kể cả chỉ nộp vào 50 € hoặc 100 € để 'bấm giờ' tính thời gian càng sớm càng tốt.\n"
            f"2. **Thứ tự rút tiền thông minh**: Khi cần tiền tiêu, ưu tiên rút từ tài khoản tiết kiệm an toàn trước ➔ sau đó rút từ Assurance-Vie trong hạn mức miễn thuế ➔ rồi mới đến các tài khoản khác."
        )

    elif chart_id in ("chart-monte-carlo", "chart-insights"):
        return (
            f"### 💡 1. Kết quả thử nghiệm 1.000 tình huống cuộc đời\n"
            f"- Hệ thống đã giả lập 1.000 kịch bản thị trường khác nhau (từ những năm kinh tế bùng nổ đến những đợt khủng hoảng lớn).\n"
            f"- **Kết quả rất khả quan**: Phần lớn các trường hợp bạn đều an toàn về đích với tài sản dư dả cho đến tuổi 85.\n\n"
            f"### ⚠️ 2. Kịch bản xui xẻo nhất cần phòng ngừa\n"
            f"- Nếu chẳng may ngay khi vừa nghỉ việc mà thị trường chứng khoán giảm mạnh 2-3 năm liền, số tiền của bạn sẽ bị sụt giảm nhanh hơn dự tính nếu bạn phải bán tài sản giá rẻ để lấy tiền ăn tiêu.\n\n"
            f"### 🎯 3. Cách phòng ngừa rất dễ làm theo\n"
            f"1. **Chuẩn bị 'bình oxy tiền mặt' trước khi nghỉ việc 1 năm**: Để sẵn 2 năm chi phí sinh hoạt trong tài khoản an toàn (ví dụ: sổ tiết kiệm ngân hàng). Khi thị trường giảm, bạn chỉ tiêu tiền trong bình oxy này, tuyệt đối không bán lỗ các khoản đầu tư.\n"
            f"2. **Kiên nhẫn chờ thị trường hồi phục**: Lịch sử cho thấy các đợt giảm giá thường phục hồi sau 1-2 năm. Tiền mặt dự phòng sẽ giúp bạn hoàn toàn an tâm ngủ ngon."
        )

    elif chart_id in ("chart-scenarios", "chart-stress-test"):
        return (
            f"### 💡 1. Thử sức tài chính trước các biến cố lớn\n"
            f"- **Thị trường giảm sâu (-35%)**: Tài sản của bạn giảm tạm thời trên màn hình, nhưng tiền sinh hoạt hàng ngày vẫn được bảo đảm nếu bạn không bán tháo tài sản lúc giá rẻ.\n"
            f"- **Giá cả sinh hoạt tại Việt Nam tăng cao**: Vì phần lớn tài sản của bạn được đầu tư vào các quỹ uy tín và doanh nghiệp lớn, giá trị tài sản sẽ tự động tăng theo thời gian để bù đắp sự mất giá của đồng tiền.\n\n"
            f"### ⚠️ 2. Biến cố tốn kém nhất: Sức khỏe\n"
            f"- Những chi phí y tế đột xuất lúc lớn tuổi là nguyên nhân lớn nhất làm hao hụt tài sản nếu không chuẩn bị trước.\n\n"
            f"### 🎯 3. Việc cụ thể bạn nên làm theo ngay\n"
            f"1. **Mua bảo hiểm sức khỏe chu đáo trước khi nghỉ việc**: Đảm bảo bạn và gia đình có thẻ bảo hiểm sức khỏe toàn cầu hoặc gói bảo hiểm cao cấp tại Việt Nam, để nếu có ốm đau thì bảo hiểm chi trả, không phải đụng vào tiền tiết kiệm nghỉ hưu.\n"
            f"2. **Cắt giảm 10% các khoản chi tiêu không thiết yếu khi có biến cố** (Ví dụ: Tạm hoãn mua đồ công nghệ mới, giảm bớt vài chuyến du lịch xa trong năm đó)."
        )

    elif chart_id in ("chart-spending-smile", "chart-estate"):
        return (
            f"### 💡 1. Đường cong chi tiêu thực tế theo độ tuổi\n"
            f"- Chi tiêu trong đời người thường có hình 'nụ cười':\n"
            f"  - **Lúc vừa nghỉ hưu (Tuổi {retire_age}–60)**: Đang còn trẻ khỏe, thích đi du lịch, trải nghiệm nên tiêu nhiều nhất.\n"
            f"  - **Tuổi trung niên (Tuổi 60–75)**: Sống chậm rãi, thích ở nhà chăm vườn, nấu ăn nên chi tiêu tự nhiên giảm xuống.\n"
            f"  - **Sau tuổi 75**: Đi lại ít hơn nhưng cần thêm một phần tiền chăm sóc sức khỏe và bồi dưỡng tuổi già.\n\n"
            f"### ⚠️ 2. Để lại tiền cho con cháu sao cho đỡ tốn thuế\n"
            f"- Số tiền còn lại ở tuổi 85 của bạn dự kiến khá lớn. Nếu để dồn đến cuối đời mới chuyển giao thì có thể chịu thuế thừa kế không cần thiết.\n\n"
            f"### 🎯 3. Các bước cụ thể bạn có thể làm theo ngay\n"
            f"1. **Tận dụng luật tặng tiền miễn thuế của Pháp**: Cứ mỗi 15 năm, cha mẹ được phép tặng cho mỗi người con tới 100.000 € hoàn toàn miễn thuế. Hãy chia dần từng phần khi con cái lập nghiệp hoặc lập gia đình.\n"
            f"2. **Lên kế hoạch tận hưởng đúng giai đoạn**: Đừng quá dè sẻn trong 10 năm đầu sau khi nghỉ hưu (tuổi {retire_age}–52), vì đó là lúc bạn có nhiều sức khỏe nhất để tận hưởng cuộc sống."
        )

    elif chart_id in ("chart-patrimoine", "chart-pylocation"):
        total_prop = chart_summary.get("total_property_value", 293000)
        postloan_cf = chart_summary.get("total_postloan_cashflow_monthly", 1401)
        turo_cf = chart_summary.get("turo_cashflow_monthly", 234)
        total_cf = postloan_cf + turo_cf
        return (
            f"### 💡 1. Sức mạnh đòn bẩy BĐS Pháp & Cỗ máy dòng tiền tự động\n"
            f"- Danh mục 3 căn hộ ({total_prop:,.0f} €) đang được người thuê nhà và ngân hàng tài trợ trả nợ thay bạn. Sau khi hoàn thành kỳ trả nợ 20 năm, toàn bộ danh mục sẽ bơm về dòng tiền ròng **+{postloan_cf:,.0f} €/tháng** (~38.5 Triệu ₫/tháng).\n"
            f"- Cộng thêm lợi nhuận đội xe Turo ({turo_cf:,.0f} €/tháng), tổng dòng tiền thụ động đạt **+{total_cf:,.0f} €/tháng** (~45 Triệu ₫/tháng). Con số này bao phủ trọn vẹn chi phí sinh hoạt khi bạn về Việt Nam hưu trí mà chưa cần bán bất kỳ cổ phiếu hay chứng chỉ quỹ ETF nào!\n\n"
            f"### 🛡️ 2. Tấm khiên thuế LMNP (Khấu hao tài sản Amortissement)\n"
            f"- Nhờ cơ chế trích khấu hao tài sản (Amortissement comptable) của chế độ LMNP Réel tại Pháp, doanh thu cho thuê gần như **được miễn thuế 0%** trong suốt 10–15 năm đầu. Đây là ưu thế vượt trội giúp dòng tiền tích lũy tăng trưởng tối đa.\n\n"
            f"### 🎯 3. Các bước hành động cụ thể để quản lý từ xa\n"
            f"1. **Tạo quỹ đệm dự phòng BĐS**: Trích riêng 3–6 tháng tiền thuê (khoảng 5.000 € – 6.000 €) vào tài khoản tiết kiệm an toàn để xử lý ngay khi cần sửa chữa điều hòa, thay thiết bị hoặc lấp phòng trống.\n"
            f"2. **Ủy thác quản lý chuyên nghiệp khi hồi hương**: Khi về Việt Nam sinh sống, hãy ký hợp đồng ủy quyền với đơn vị quản lý căn hộ hoặc Conciergerie với mức phí 7–8% doanh thu để hưởng trọn dòng tiền thụ động mà không phải đau đầu lo việc bảo trì hay đón khách."
        )

    else:
        return (
            f"### 💡 1. Nhận xét chung\n"
            f"- Kế hoạch tài chính của bạn đang đi rất đúng hướng. Việc kiếm tiền ở nơi có thu nhập cao và về nơi có chi phí sinh hoạt vừa phải để nghỉ hưu sớm là một quyết định rất sáng suốt.\n\n"
            f"### 🎯 2. Lời khuyên bỏ túi\n"
            f"- Hãy kiên trì trích tiền tiết kiệm và đầu tư đều đặn mỗi tháng, mục tiêu tự do tài chính ở tuổi {retire_age} đang ở rất gần bạn!"
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
    cur_age = plan.get("currentAge", 29)
    retire_age = plan.get("retirementAge", 42)
    life_exp = plan.get("lifeExpectancy", 85)
    
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
            
            # Specialized prompt tailored exclusively for each specific chart topic
            if chart_id in ("chart-networth", "chart-net-worth"):
                chart_specific_instructions = (
                    "CHỦ ĐỀ CHUYÊN BIỆT: BIỂU ĐỒ TĂNG TRƯỞNG TÀI SẢN RÒNG & TUỔI NGHỈ HƯU TỐI ƯU\n"
                    "Trọng tâm phân tích: Điểm uốn tài sản chạm mốc Nest Egg tự do tài chính, đỉnh tài sản (Peak Net Worth), và ĐÁNH GIÁ TUỔI NGHỈ HƯU THÍCH HỢP NHẤT (41-42 tuổi) dựa vào thu nhập và chi tiêu.\n\n"
                    "HÃY TRẢ LỜI ĐÚNG CÁC PHẦN SAU:\n"
                    "### 🎯 Đánh giá Tuổi Nghỉ Hưu Thích Hợp Nhất từ Gemini\n"
                    "(Khẳng định rõ tuổi nghỉ hưu tối ưu dựa trên thu nhập, tiền để dành và chi tiêu người dùng đã nhập)\n\n"
                    "### 💡 1. Bức tranh tài sản & Điểm uốn Tự do Tài chính\n"
                    "(Giải thích dễ hiểu về mốc tài sản mục tiêu, tiền sinh lời hàng tháng đủ sống, tiền gốc không bị vơi)\n\n"
                    "### ⚖️ 2. So sánh 3 mốc tuổi nghỉ hưu (39 tuổi vs 41–42 tuổi vs 45 tuổi)\n"
                    "(Chỉ ra sự khác biệt thực tế giữa 3 mốc tuổi và lý do vì sao 41-42 là điểm vàng cân bằng nhất)\n\n"
                    "### 🎯 3. Các bước cụ thể bạn có thể làm theo ngay\n"
                    "(Đưa ra 2 việc làm cụ thể kèm số tiền ví dụ thực tế)"
                )
            elif chart_id in ("chart-cashflow", "chart-cash-flow"):
                chart_specific_instructions = (
                    "CHỦ ĐỀ CHUYÊN BIỆT: BIỂU ĐỒ DÒNG TIỀN HÀNG NĂM (THU NHẬP vs CHI TIÊU vs RÚT TIỀN)\n"
                    "Trọng tâm phân tích: Cân đối giữa dòng tiền thu vào (lương đi làm, cổ tức thụ động, lương hưu Pháp sau tuổi 65) và dòng tiền chi ra (sinh hoạt phí, nợ vay mua nhà). Đặc biệt chỉ rõ KHOẢNG TRỐNG DÒNG TIỀN từ lúc nghỉ hưu đến tuổi 65 (khi chưa có lương hưu trợ lực) và sự an nhàn sau 65 tuổi.\n\n"
                    "HÃY TRẢ LỜI ĐÚNG CÁC PHẦN SAU:\n"
                    "### 💡 1. Nhìn nhanh Dòng tiền Vào & Ra theo từng chặng đời\n"
                    "(Phân tích dòng tiền giai đoạn đi làm, giai đoạn hưu trí sớm tự túc, và giai đoạn sau 65 tuổi có lương hưu Pháp)\n\n"
                    "### ⚠️ 2. Cảnh báo Khoảng trống Dòng tiền trước tuổi 65\n"
                    "(Chỉ ra vì sao những năm đầu nghỉ hưu cần quản lý dòng tiền cẩn thận và tránh rút tiền quá đà)\n\n"
                    "### 🎯 3. Cách tối ưu dòng tiền hàng tháng để luôn thảnh thơi\n"
                    "(Đưa ra 2 hành động cụ thể, ví dụ tạo thêm nguồn thu nhẹ nhàng hoặc tối ưu nợ vay mua nhà)"
                )
            elif chart_id in ("chart-withdrawal-comparison", "chart-withdrawals"):
                chart_specific_instructions = (
                    "CHỦ ĐỀ CHUYÊN BIỆT: SO SÁNH 4 CHIẾN LƯỢC RÚT TIỀN HƯU TRÍ\n"
                    "Trọng tâm phân tích: So sánh trực quan giữa 4 cách rút tiền: Quy tắc Bengen 4% cố định, Chiến lược Lan can Guyton-Klinger, Rút theo tuổi thọ VPW, và Rút tỷ lệ % cố định. Nêu bật vì sao Guyton-Klinger là lựa chọn khuyên dùng nhất.\n\n"
                    "HÃY TRẢ LỜI ĐÚNG CÁC PHẦN SAU:\n"
                    "### 💡 1. Ưu & Nhược điểm thực tế của 4 cách rút tiền khi về hưu\n"
                    "(So sánh ngắn gọn, đời thường giữa rút cố định cứng nhắc, rút theo % và rút linh hoạt theo thị trường)\n\n"
                    "### 🛡️ 2. Vì sao Chiến lược Lan can (Guyton-Klinger) giúp bạn không bao giờ sợ cạn tiền?\n"
                    "(Giải thích quy tắc thắt lưng buộc bụng 10% khi thị trường khó khăn và tự thưởng khi thị trường thắng lớn)\n\n"
                    "### 🎯 3. Hướng dẫn rút tiền thực tế từng năm kèm ví dụ cụ thể\n"
                    "(Đưa ra ví dụ cụ thể bằng số tiền hàng năm để người dùng áp dụng làm theo)"
                )
            elif chart_id in ("chart-tax-optimization", "chart-taxes"):
                chart_specific_instructions = (
                    "CHỦ ĐỀ CHUYÊN BIỆT: TỐI ƯU HÓA THUẾ & TẬN DỤNG TÀI KHOẢN PHÁP (PEA, ASSURANCE-VIE)\n"
                    "Trọng tâm phân tích: Cách tiết kiệm hàng trăm triệu đồng tiền thuế nhờ ưu đãi tài khoản PEA (miễn thuế sau 5 năm) và Assurance-Vie (miễn thuế tiền lời sau 8 năm), Hiệp định tránh đánh thuế 2 lần giữa Pháp và Việt Nam, và thứ tự rút tiền thông minh (waterfall).\n\n"
                    "HÃY TRẢ LỜI ĐÚNG CÁC PHẦN SAU:\n"
                    "### 💡 1. Cách giữ lại nhiều tiền nhất trước thuế nhờ PEA & Assurance-Vie\n"
                    "(Giải thích đơn giản luật ưu đãi thuế của Pháp và tại sao được giữ nguyên tài khoản khi chuyển về Việt Nam)\n\n"
                    "### ⚠️ 2. Cạm bẫy thuế cần tránh khi chuyển cư trú thuế về Việt Nam\n"
                    "(Nhắc nhở về điều kiện thời gian mở tài khoản và cách khai báo thuế theo Hiệp định 1992)\n\n"
                    "### 🎯 3. Thứ tự rút tiền thông minh nhất (Quy trình 3 bước)\n"
                    "(Hướng dẫn thứ tự rút từ tài khoản an toàn trước ➔ đến tài khoản ưu đãi thuế ➔ giúp tiết kiệm tối đa)"
                )
            elif chart_id in ("chart-monte-carlo", "chart-insights"):
                chart_specific_instructions = (
                    "CHỦ ĐỀ CHUYÊN BIỆT: MÔ PHỎNG MONTE CARLO 1.000 KỊCH BẢN & RỦI RO SỤT GIẢM SỚM (SRR)\n"
                    "Trọng tâm phân tích: Kết quả giả lập 1.000 kịch bản thị trường cuộc đời, tỷ lệ thành công của kế hoạch, phân tích nguy cơ lớn nhất là Sequence of Returns Risk (thị trường giảm sâu vào đúng 2-3 năm đầu nghỉ việc) và giải pháp xây dựng đệm tiền mặt an toàn.\n\n"
                    "HÃY TRẢ LỜI ĐÚNG CÁC PHẦN SAU:\n"
                    "### 💡 1. Ý nghĩa của 1.000 kịch bản cuộc đời & Tỷ lệ thành công\n"
                    "(Giải thích dễ hiểu về tỷ lệ thành công và tại sao danh mục có khả năng vượt qua các đợt suy thoái)\n\n"
                    "### ⚠️ 2. Kịch bản xui xẻo nhất: Thị trường giảm sâu ngay khi vừa nghỉ việc\n"
                    "(Giải thích vì sao bán tài sản lúc giá rẻ trong 3 năm đầu là nguy hiểm nhất)\n\n"
                    "### 🎯 3. Cách tạo 'Bình Oxy Tiền Mặt 2 Năm' để ngủ ngon trước mọi biến động\n"
                    "(Hướng dẫn chuẩn bị lượng tiền mặt dự phòng trước khi nghỉ việc kèm con số ví dụ cụ thể)"
                )
            elif chart_id in ("chart-scenarios", "chart-stress-test"):
                chart_specific_instructions = (
                    "CHỦ ĐỀ CHUYÊN BIỆT: THỬ SỨC TÀI CHÍNH TRƯỚC CÁC BIẾN CỐ LỚN (WHAT-IF STRESS TEST)\n"
                    "Trọng tâm phân tích: Sức chịu đựng của tài sản trước 4 cú sốc lớn: Khủng hoảng chứng khoán (-35%), Lạm phát cao kéo dài, Cú sốc chi phí y tế lớn, và Thu nhỏ nhà cửa (Downsizing). Đánh giá biến cố nào nguy hiểm nhất và giải pháp phòng thủ.\n\n"
                    "HÃY TRẢ LỜI ĐÚNG CÁC PHẦN SAU:\n"
                    "### 💡 1. Đánh giá Khả năng Chịu Đựng của Tài sản trước Biến cố lớn\n"
                    "(Giải thích tại sao tài sản vẫn đứng vững trước đợt sụt giảm thị trường nhờ đầu tư dài hạn)\n\n"
                    "### ⚠️ 2. Biến cố tốn kém nhất: Chi phí Y tế & Sức khỏe tuổi già\n"
                    "(Chỉ ra vì sao viện phí bất ngờ là rủi ro lớn nhất làm hao hụt tiền hưu)\n\n"
                    "### 🎯 3. Kế hoạch phòng thủ 2 lớp (Bảo hiểm toàn diện + Tiết giảm chi tiêu)\n"
                    "(Đưa ra việc làm cụ thể về mua bảo hiểm sức khỏe và cách linh hoạt cắt giảm chi tiêu khi gặp biến cố)"
                )
            elif chart_id in ("chart-spending-smile", "chart-estate"):
                chart_specific_instructions = (
                    "CHỦ ĐỀ CHUYÊN BIỆT: ĐƯỜNG CONG CHI TIÊU HÌNH NỤ CƯỜI (SPENDING SMILE) & THỪA KẾ DI SẢN\n"
                    "Trọng tâm phân tích: Mô hình chi tiêu thực tế đời người hình nụ cười (Go-Go tiêu nhiều để trải nghiệm ➔ Slow-Go sống chậm tiết kiệm ➔ No-Go chăm sóc y tế) và Kế hoạch chuyển giao di sản thừa kế cho con cháu để không bị đóng thuế thừa kế nặng.\n\n"
                    "HÃY TRẢ LỜI ĐÚNG CÁC PHẦN SAU:\n"
                    "### 💡 1. Chi tiêu đời người hình 'Nụ cười' (Spending Smile)\n"
                    "(Giải thích tại sao tuổi 42-55 tiêu nhiều nhất và sau đó tự nhiên giảm bớt, giúp nhẹ gánh tích lũy)\n\n"
                    "### 🏛️ 2. Kế hoạch để lại Di sản & Tối ưu Thuế Thừa kế\n"
                    "(Tận dụng luật tặng quà miễn thuế của Pháp 100.000 € mỗi 15 năm cho con để chuyển giao dần tài sản)\n\n"
                    "### 🎯 3. Lời khuyên phân bổ chi tiêu để tận hưởng trọn vẹn cuộc sống\n"
                    "(Khuyên người dùng mạnh dạn tận hưởng 10 năm đầu hưu trí khi còn nhiều sức khỏe nhất kèm ví dụ)"
                )
            elif chart_id in ("chart-patrimoine", "chart-pylocation"):
                chart_specific_instructions = (
                    "CHỦ ĐỀ CHUYÊN BIỆT: BẤT ĐỘNG SẢN PHÁP (LMNP), ĐÒN BẨY TÀI CHÍNH & DÒNG TIỀN THỤ ĐỘNG NGHỈ HƯU\n"
                    "Trọng tâm phân tích: Sức mạnh đòn bẩy ngân hàng mua BĐS cho thuê tại Pháp (người thuê trả nợ hộ), cơ chế khiên thuế LMNP khấu hao Amortissement giúp 0% thuế thu nhập, dòng tiền ròng vững chắc sau khi tất toán gói vay 20 năm so sánh với chi phí sinh hoạt tại Việt Nam, và chiến lược đội xe Turo.\n\n"
                    "HÃY TRẢ LỜI ĐÚNG CÁC PHẦN SAU:\n"
                    "### 💡 1. Sức mạnh Đòn bẩy BĐS & Cỗ máy Dòng tiền Thụ động\n"
                    "(Phân tích danh mục 3 căn hộ đang được ngân hàng và người thuê gánh nợ, dòng tiền về già khi hết nợ so sánh với chi phí sống hưu trí ở VN)\n\n"
                    "### 🛡️ 2. Tấm khiên thuế LMNP Khấu hao (Amortissement)\n"
                    "(Giải thích vì sao LMNP Réel tại Pháp cho phép khấu hao tài sản giúp không phải đóng thuế thu nhập trong 10-15 năm đầu)\n\n"
                    "### 🎯 3. Các bước hành động cụ thể để quản lý từ xa khi hồi hương\n"
                    "(Đưa ra việc làm cụ thể: lập quỹ đệm khẩn cấp 5.000€ và cách ủy thác cho đơn vị quản lý chuyên nghiệp khi về Việt Nam)"
                )
            else:
                chart_specific_instructions = (
                    "CHỦ ĐỀ: PHÂN TÍCH CHIẾN LƯỢC TÀI CHÍNH TỔNG THỂ\n"
                    "HÃY TRẢ LỜI ĐÚNG 3 PHẦN SAU:\n"
                    "### 💡 1. Đánh giá Tổng thể Biểu đồ\n"
                    "### ⚠️ 2. Điểm cần lưu ý\n"
                    "### 🎯 3. Hành động đề xuất cụ thể kèm ví dụ"
                )

            prompt = (
                f"Bạn là người cố vấn tài chính cá nhân thân thiện, thông thái và thực tế của phần mềm pyRetrait.\n"
                f"Hãy phân tích biểu đồ tài chính '{chart_title}' (Chart ID: {chart_id}) cho người dùng dựa trên dữ liệu sau:\n"
                f"- Tên kế hoạch: {plan.get('name', 'Franco-Viet FIRE')}\n"
                f"- Tiền tệ: {plan.get('currency', 'EUR')}\n"
                f"- Tuổi hiện tại: {cur_age}, Tuổi dự định nghỉ hưu sớm: {retire_age}, Tuổi thọ dự kiến: {life_exp}\n"
                f"- Thu nhập hàng năm: {plan.get('incomes', [{}])[0].get('amount', 25000) if plan.get('incomes') else 25000} {cur_sym}, Tiết kiệm hàng năm: {plan.get('annualSavings', 7922)} {cur_sym} (tỷ lệ {plan.get('savingsRate', 33.3)}%)\n"
                f"- Chi tiêu khi về hưu: {plan.get('retirementExpenses', 10000)} {cur_sym}/năm\n"
                f"- Tóm tắt số liệu biểu đồ: {json.dumps(chart_summary, ensure_ascii=False)}\n\n"
                f"NGUYÊN TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ):\n"
                f"1. TẬP TRUNG 100% VÀO CHỦ ĐỀ RIÊNG CỦA BIỂU ĐỒ NÀY: Tuyệt đối không lặp lại nội dung của các biểu đồ khác. Biểu đồ nào chỉ nói sâu vào chuyên môn của biểu đồ đó.\n"
                f"2. DIỄN ĐẠT CỰC KỲ DỄ HIỂU, BÌNH DÂN: Trò chuyện gần gũi, khích lệ, như một người bạn hiểu biết về tiền bạc đang chia sẻ chân tình. Tránh giọng văn trịnh thượng hay cứng nhắc.\n"
                f"3. TUYỆT ĐỐI HẠN CHẾ THUẬT NGỮ CHUYÊN MÔN: KHÔNG dùng các từ đao to búa lớn (KHÔNG dùng: geo-arbitrage, glidepath, waterfall, sequence of returns risk, địa tài chính, hệ số tương quan, tỷ lệ rút tĩnh...). Hãy dùng các cách gọi đời thường ai cũng hiểu (như 'đệm tiền mặt', 'chia tiền ra nhiều giỏ', 'tiền đẻ ra tiền').\n"
                f"4. BẮT BUỘC PHẢI CÓ VÍ DỤ MINH HỌA CỤ THỂ, DỄ LÀM THEO: Từng lời khuyên đều phải đi kèm VÍ DỤ RÕ RÀNG bằng con số hoặc hành động cụ thể.\n\n"
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
                gen_config = {
                    "temperature": 0.4,
                    "maxOutputTokens": 4096
                }
                # Disable thinking budget for 2.5 models so tokens are not consumed by reasoning
                if "2.5" in model_name or "thinking" in model_name:
                    gen_config["thinkingConfig"] = {"thinkingBudget": 0}

                req_body = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }],
                    "generationConfig": gen_config
                }
                async with httpx.AsyncClient(timeout=20.0) as client:
                    resp = await client.post(url, json=req_body)
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
        "analysis": f"> ℹ️ *Lưu ý: Phân tích dự phòng theo thuật toán Heuristic nội bộ (do Gemini API chưa kết nối hoặc model tạm hết quota).*\n\n" + analysis
    }

# Mount frontend files
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
else:
    @app.get("/")
    def index():
        return {"message": "pyRetrait API is running. Frontend directory will be loaded once created."}
