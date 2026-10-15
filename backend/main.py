import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Body, Header, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Logging configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("pyRetrait")

# Cấu hình bảo mật (nạp .env, khóa JWT, CORS) — import trước auth để .env luôn được đọc trước
from backend.config import get_cors_origins

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
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_no_cache_headers(request: Request, call_next):
    response = await call_next(request)
    if (
        request.url.path == "/"
        or request.url.path.endswith(".html")
        or request.url.path.endswith(".js")
        or request.url.path.endswith(".css")
    ):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
PLANS_FILE = DATA_DIR / "plans.json"
SETTINGS_FILE = DATA_DIR / "settings.json"

# Tải biến môi trường từ file .env nếu có
def _load_env_file(env_path: Path) -> None:
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


# Kế hoạch mẫu mặc định — đọc từ file riêng để giảm kích thước main.py
DEFAULT_PLANS_FILE = DATA_DIR / "default_plans.json"

def _load_default_plans() -> Dict[str, Any]:
    """Tải kế hoạch mẫu từ file JSON riêng."""
    for p in (DEFAULT_PLANS_FILE, PLANS_FILE):
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if data and data.get("plans"):
                        return data
            except Exception:
                pass
    # Fallback tối giản nếu file không tồn tại
    return {"activePlanId": "plan_franco_viet", "plans": {}}

# Khởi tạo plans.json nếu chưa có
if not PLANS_FILE.exists():
    default_plans = _load_default_plans()
    with open(PLANS_FILE, "w", encoding="utf-8") as f:
        json.dump(default_plans, f, ensure_ascii=False, indent=2)


def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """Xác thực JWT token từ header Authorization, trả về None nếu là khách."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split("Bearer ", 1)[1].strip()
    payload = verify_token(token)
    if payload:
        return {"id": payload["sub"], "email": payload["email"], "name": payload["name"]}
    return None


# ==============================================================================
# Health Check
# ==============================================================================
@app.get("/health")
def health_check():
    return {"status": "ok"}


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

    # Khởi tạo kế hoạch mặc định cho user mới
    save_user_plans(user["id"], _load_default_plans())

    # Khởi tạo dữ liệu BĐS/Turo mẫu cho user mới
    save_user_patrimoine(user["id"], _load_default_patrimoine())

    token = create_token(user["id"], user["email"], user["name"])
    return {"status": "success", "token": token, "user": user, "message": "Đăng ký tài khoản thành công!"}


@app.post("/api/auth/login")
def login_user(payload: Dict[str, Any] = Body(...)):
    email = payload.get("email", "")
    password = payload.get("password", "")
    user, err = authenticate_user(email, password)
    if err or not user:
        raise HTTPException(status_code=401, detail=err or "Đăng nhập thất bại")
    token = create_token(user["id"], user["email"], user["name"])
    return {"status": "success", "token": token, "user": user, "message": "Đăng nhập thành công!"}


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
        default_plans = _load_default_plans()
        save_user_plans(user["id"], default_plans)
        return default_plans
    # Chế độ Khách: trả về template mặc định
    return _load_default_plans()


@app.post("/api/plans")
def save_plans(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    user = get_current_user_optional(authorization)
    if user:
        save_user_plans(user["id"], payload)
        return {"status": "success", "message": "Kế hoạch đã được lưu an toàn vào tài khoản đám mây của bạn!"}
    return {"status": "guest", "message": "Chế độ Khách: Dữ liệu được lưu độc lập trên trình duyệt của máy bạn. Đăng nhập để đồng bộ đám mây."}


# ==============================================================================
# Patrimoine (BĐS / Turo) — chỉ lưu/đọc dữ liệu thô.
# Mọi tính toán cashflow, yield, Turo chạy client-side (frontend/js/patrimoine.js).
# ==============================================================================
DEFAULT_PATRIMONY_FILE = DATA_DIR / "default_patrimoine.json"


def _load_default_patrimoine() -> Dict[str, Any]:
    """Tải dữ liệu BĐS/Turo mẫu (thô) từ file JSON riêng."""
    if DEFAULT_PATRIMONY_FILE.exists():
        try:
            with open(DEFAULT_PATRIMONY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"apartments": {}, "turo": {}, "wealth": {}}


@app.get("/api/patrimoine")
def get_patrimoine(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Trả dữ liệu thô { apartments, turo, wealth }. Khách nhận dữ liệu mẫu."""
    user = get_current_user_optional(authorization)
    if not user:
        return _load_default_patrimoine()
    stored = get_user_patrimoine(user["id"])
    if stored:
        return stored
    seed = _load_default_patrimoine()
    save_user_patrimoine(user["id"], seed)
    return seed


@app.post("/api/patrimoine")
def save_patrimoine(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Lưu dữ liệu thô BĐS/Turo của người dùng đã đăng nhập."""
    user = get_current_user_optional(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Vui lòng đăng nhập để đồng bộ dữ liệu lên đám mây")
    apartments = payload.get("apartments", {})
    turo = payload.get("turo", {})
    wealth = payload.get("wealth", {})
    if not isinstance(apartments, dict) or not isinstance(turo, dict) or not isinstance(wealth, dict):
        raise HTTPException(status_code=400, detail="Dữ liệu patrimoine không hợp lệ")
    save_user_patrimoine(user["id"], {"apartments": apartments, "turo": turo, "wealth": wealth})
    return {"status": "success"}


# Fallback tương thích ngược cho trình duyệt còn cache JS cũ
@app.get("/api/pylocation/data")
def get_pylocation_data_legacy(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Tương thích ngược khi trình duyệt còn lưu cache JS cũ."""
    raw = get_patrimoine(authorization=authorization)
    apts_raw = raw.get("apartments", {})
    apartments_list = []
    if isinstance(apts_raw, dict):
        for name, data in apts_raw.items():
            apartments_list.append({"name": name, "raw": data, **(data if isinstance(data, dict) else {})})
    return {
        **raw,
        "apartments": apartments_list,
        "summary": {}
    }


# ==============================================================================
# Gemini AI Settings & Chart Analysis
# ==============================================================================
@app.get("/api/ai/settings")
def get_ai_settings():
    """Trả về cấu hình Gemini API (key đã mask, model đang dùng)."""
    env_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    key = env_key
    source = "env" if (env_key and len(env_key.strip()) > 0) else "none"
    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if not key:
                    key = data.get("gemini_api_key")
                    if key: source = "ui"
                if data.get("gemini_model"):
                    model = data.get("gemini_model")
        except Exception:
            pass

    masked = f"{key[:4]}...{key[-4:]}" if key and len(key) > 8 else (bool(key) and "Đã cấu hình")
    return {"has_api_key": bool(key), "masked_key": masked, "selected_model": model, "source": source}


@app.post("/api/ai/settings")
def save_ai_settings(payload: Dict[str, Any] = Body(...)):
    """Lưu Gemini API key và model đã chọn vào settings.json."""
    key = str(payload.get("gemini_api_key", "")).strip()
    model = str(payload.get("gemini_model", "gemini-2.5-flash")).strip()
    data: Dict[str, Any] = {}
    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            pass
    if key: data["gemini_api_key"] = key
    if model: data["gemini_model"] = model
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    return {"success": True, "has_api_key": bool(data.get("gemini_api_key")), "selected_model": data.get("gemini_model", "gemini-2.5-flash")}


@app.get("/api/ai/models")
async def get_available_models(api_key: Optional[str] = None):
    """Query Google API để lấy danh sách Gemini models khả dụng theo thời gian thực."""
    key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key and SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                settings = json.load(f)
                key = settings.get("gemini_api_key")
        except Exception:
            pass

    default_models = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-flash"]
    if not key or len(key.strip()) < 10:
        return {"models": default_models, "source": "static"}

    try:
        import httpx
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key.strip()}"
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                gemini_list = [
                    m.get("name", "").replace("models/", "")
                    for m in data.get("models", [])
                    if "generateContent" in m.get("supportedGenerationMethods", []) and "gemini" in m.get("name", "")
                ]
                if gemini_list:
                    gemini_list.sort(reverse=True)
                    return {"models": gemini_list, "source": "google_api"}
    except Exception:
        pass

    return {"models": default_models, "source": "static"}


@app.post("/api/ai/analyze-chart")
async def analyze_chart(payload: Dict[str, Any] = Body(...)):
    """
    Gửi dữ liệu biểu đồ lên Gemini API để phân tích tài chính.
    Nếu không có API key, trả về thông báo yêu cầu cấu hình.
    """
    chart_id = payload.get("chart_id", "")
    chart_title = payload.get("chart_title", "")
    chart_summary = payload.get("chart_summary", {})
    plan = payload.get("plan", {})
    api_key = payload.get("api_key") or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

    # Thông tin kế hoạch để xây dựng prompt
    cur = plan.get("currency", "EUR")
    cur_sym = "€" if cur == "EUR" else ("₫" if cur == "VND" else "$")
    cur_age = int(plan.get("currentAge") or 29)
    retire_age = int(plan.get("retirementAge") or 42)
    life_exp = int(plan.get("lifeExpectancy") or 85)

    incomes = plan.get("incomes", [])
    total_annual_income = sum(float(inc.get("amount", 0)) for inc in incomes if inc.get("enabled", True))
    if total_annual_income <= 0:
        total_annual_income = float(plan.get("annualSavings", 0)) / max(0.01, float(plan.get("savingsRate", 33.3)) / 100)

    ann_sav = float(plan.get("annualSavings", 0))
    ret_exp = float(plan.get("retirementExpenses", 0))
    forex = float(plan.get("exchangeRateEurVnd", 27500))
    monthly_exp_vnd = round((ret_exp * forex) / 12 / 1_000_000)
    cur_savings = float(plan.get("currentSavings") or 0)

    actual_records = plan.get("actualRecords") or []
    actual_records_text = (
        "; ".join([f"{r.get('date')}: {float(r.get('amount', 0)):,.0f} {cur_sym} ({r.get('note', '')})" for r in actual_records[-5:]])
        if actual_records else "Chưa có"
    )
    incomes_summary_text = (
        ", ".join([f"{s.get('name')}: {float(s.get('amount', 0)):,.0f} {cur_sym}/năm ({s.get('startAge')}–{s.get('endAge')}t)" for s in incomes if s.get("enabled", True)])
        if incomes else "Chưa cấu hình"
    )
    expenses = plan.get("expenses", [])
    expenses_summary_text = (
        ", ".join([f"{s.get('name')}: {float(s.get('amount', 0)):,.0f} {cur_sym}/năm ({s.get('startAge')}–{s.get('endAge')}t)" for s in expenses if s.get("enabled", True)])
        if expenses else "Chưa cấu hình"
    )

    if not api_key and SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                settings = json.load(f)
                api_key = settings.get("gemini_api_key")
        except Exception:
            pass

    # Nếu không có API key, yêu cầu người dùng cấu hình
    if not api_key or len(api_key.strip()) < 10:
        return {
            "success": False, "source": "no_api_key", "model": None,
            "analysis": (
                "> **Chưa cấu hình API Key**\n\n"
                "Để nhận phân tích thông minh cho kế hoạch này, vui lòng:\n"
                "1. Mở mục **Cấu hình Trợ lý AI** ở góc dưới\n"
                "2. Nhập API Key của bạn (miễn phí tại [aistudio.google.com](https://aistudio.google.com))\n"
                "3. Nhấn **Lưu** và thử lại"
            )
        }

    # Gọi Gemini API
    try:
        import httpx

        system_instruction = (
            "Bạn là chuyên gia tư vấn tài chính cá nhân độc lập, thân thiện, thông thái và thực tế của phần mềm pyRetrait.\n"
            "NHIỆM VỤ: Phân tích biểu đồ tài chính người dùng, đưa ra nhận xét sâu sắc và khuyến nghị khả thi.\n\n"
            "NGUYÊN TẮC BẮT BUỘC:\n"
            "1. NGẮN GỌN: Trả lời khoảng 220–320 từ, đi thẳng vào trọng tâm.\n"
            "2. TL;DR ĐẦU TIÊN: Bắt đầu bằng `> **Tóm tắt cốt lõi (TL;DR)**: [1–2 câu kết luận quan trọng nhất]`.\n"
            "3. NGÔN NGỮ ĐỜI THƯỜNG: Giọng ấm áp, dễ hiểu, tránh thuật ngữ phức tạp.\n"
            "4. FORMAT: Chỉ dùng H3 (###), danh sách (-), số (1.) và in đậm (**). KHÔNG dùng bảng hay code block.\n"
            "5. BÁM SÁT DỮ LIỆU: Không bịa số liệu mâu thuẫn với thông số người dùng.\n"
            "6. ĐÚNG BIỂU ĐỒ: Tập trung 100% vào biểu đồ được yêu cầu."
        )

        extra_strat_context = ""
        if chart_summary.get("compareWithdrawalsActive") and chart_summary.get("strategiesComparison"):
            strat_items = chart_summary.get("strategiesComparison", [])
            lines = [f"  * {s.get('name')}: Số dư tuổi thọ ({life_exp}t) = {s.get('finalPortfolio')} — Trạng thái: {s.get('survived')}" for s in strat_items]
            extra_strat_context = (
                "\nĐẶC BIỆT - NGƯỜI DÙNG ĐANG BẬT SO SÁNH 4 CHIẾN LƯỢC RÚT TIỀN TRÊN CÙNG BIỂU ĐỒ:\n"
                + "\n".join(lines) + "\n"
                "- Yêu cầu bổ sung: Hãy phân tích, so sánh số dư tuổi thọ cuối đời giữa 4 chiến lược, chỉ ra chiến lược nào bảo toàn vốn an toàn nhất, chiến lược nào tạo dòng tiền dồi dào nhất, và đưa ra khuyến nghị phù hợp với hoàn cảnh người dùng.\n\n"
            )

        prompt = (
            f"Phân tích biểu đồ '{chart_title}' (ID: {chart_id}) với dữ liệu:\n"
            f"- Kế hoạch: {plan.get('name', 'Franco-Viet FIRE')} | Tiền tệ: {cur} ({cur_sym})\n"
            f"- Tuổi: {cur_age} → nghỉ hưu {retire_age} → tuổi thọ {life_exp}\n"
            f"- Tài sản hiện có: {cur_savings:,.0f} {cur_sym}\n"
            f"- Thu nhập: {incomes_summary_text}\n"
            f"- Chi tiêu & nợ: {expenses_summary_text}\n"
            f"- Tiết kiệm/năm: {ann_sav:,.0f} {cur_sym} | Chi tiêu hưu trí: {ret_exp:,.0f} {cur_sym}/năm (~{monthly_exp_vnd}M₫/tháng)\n"
            f"- Số dư thực tế: {actual_records_text}\n"
            f"- Dữ liệu mô phỏng: {json.dumps(chart_summary, ensure_ascii=False)}\n"
            f"{extra_strat_context}\n"
            f"CẤU TRÚC PHẢN HỒI (sau TL;DR):\n"
            f"### 1. Nhận xét chính về {chart_title}\n"
            f"### 2. Điểm cần lưu ý\n"
            f"### 3. Hành động đề xuất cụ thể (kèm ví dụ số thực tế)"
        )

        user_model = payload.get("model") or os.environ.get("GEMINI_MODEL")
        if not user_model and SETTINGS_FILE.exists():
            try:
                with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                    settings = json.load(f)
                    user_model = settings.get("gemini_model")
            except Exception:
                pass

        candidate_models = []
        if user_model and user_model.strip():
            candidate_models.append(user_model.strip())
        for m in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
            if m not in candidate_models:
                candidate_models.append(m)

        for model_name in candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key.strip()}"
            gen_config: Dict[str, Any] = {"temperature": 0.4, "maxOutputTokens": 4096}
            if "2.5" in model_name or "thinking" in model_name:
                gen_config["thinkingConfig"] = {"thinkingBudget": 0}

            req_body = {
                "system_instruction": {"parts": [{"text": system_instruction}]},
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": gen_config
            }
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(url, json=req_body)
                if resp.status_code == 400 and "system_instruction" in resp.text:
                    fallback_body = {
                        "contents": [{"parts": [{"text": f"CHỈ THỊ HỆ THỐNG:\n{system_instruction}\n\n---\n\n{prompt}"}]}],
                        "generationConfig": gen_config
                    }
                    resp = await client.post(url, json=fallback_body)

                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        text = "".join(p.get("text", "") for p in parts if "text" in p and not p.get("thought", False))
                        if text:
                            resolved_model = (data.get("modelVersion") or model_name).replace("models/", "").strip()
                            return {"success": True, "source": "gemini_api", "model": resolved_model, "analysis": text}
                else:
                    logger.warning(f"[Gemini API] Model {model_name} HTTP {resp.status_code}: {resp.text[:150]}")

    except Exception as e:
        logger.error(f"[Gemini API Error]: {e}")

    return {
        "success": False, "source": "api_error", "model": None,
        "analysis": (
            "> **Không thể kết nối Gemini API**\n\n"
            "Vui lòng kiểm tra:\n"
            "1. API Key có đúng và còn quota không?\n"
            "2. Kết nối internet có ổn định không?\n"
            "3. Model đã chọn có còn khả dụng không?"
        )
    }


# Mount frontend static files
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
else:
    @app.get("/")
    def index():
        return {"message": "pyRetrait API is running. Frontend directory will be loaded once created."}
