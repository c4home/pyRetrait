import os
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

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
            "healthcare": {"enabled": True, "annualPreMedicare": 800, "annualPostMedicare": 1500, "acaOptimization": False}
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

@app.get("/api/plans")
def get_plans():
    try:
        with open(PLANS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        return DEFAULT_PLANS

@app.post("/api/plans")
def save_plans(payload: Dict[str, Any] = Body(...)):
    try:
        with open(PLANS_FILE, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        return {"status": "success", "message": "Plans saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

# Mount frontend files
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
else:
    @app.get("/")
    def index():
        return {"message": "pyRetrait API is running. Frontend directory will be loaded once created."}
