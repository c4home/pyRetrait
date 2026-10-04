/**
 * auth.js - Multi-User Authentication & Cloud Sync Client
 * pyRetrait Platform
 */

const Auth = (function() {
  const TOKEN_KEY = "pyRetrait_token";
  const USER_KEY = "pyRetrait_user";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  }

  function isLoggedIn() {
    return !!getToken() && !!getUser();
  }

  function setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    updateAuthUI();
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    updateAuthUI();
    // Reload page or re-fetch plans to show clean state
    window.location.reload();
  }

  function getAuthHeaders(headers = {}) {
    const token = getToken();
    const h = { "Content-Type": "application/json", ...headers };
    if (token) {
      h["Authorization"] = `Bearer ${token}`;
    }
    return h;
  }

  // API Calls
  async function login(email, password) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || "Đăng nhập thất bại");
    }
    setAuth(data.token, data.user);
    return data;
  }

  async function register(email, password, name = "") {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || email.split("@")[0] })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || "Đăng ký thất bại");
    }
    setAuth(data.token, data.user);
    return data;
  }

  async function verifyCurrentSession() {
    const token = getToken();
    if (!token) {
      updateAuthUI();
      return null;
    }
    try {
      const res = await fetch("/api/auth/me", {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        updateAuthUI();
        return data.user;
      } else {
        // Token expired or invalid
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        updateAuthUI();
        return null;
      }
    } catch (e) {
      updateAuthUI();
      return getUser();
    }
  }

  // UI Updates & Modal Controllers
  function updateAuthUI() {
    const user = getUser();
    const btn = document.getElementById("auth-btn-trigger");
    const label = document.getElementById("auth-btn-label");
    const icon = document.getElementById("auth-btn-icon");
    const dropdown = document.getElementById("user-dropdown");
    const nameEl = document.getElementById("dropdown-user-name");
    const emailEl = document.getElementById("dropdown-user-email");

    if (!btn) return;

    if (user && user.name) {
      if (label) label.textContent = user.name;
      if (icon) icon.textContent = "👤";
      btn.classList.add("btn-user-logged");
      btn.title = `Đã đăng nhập: ${user.email}`;
      if (nameEl) nameEl.textContent = user.name;
      if (emailEl) emailEl.textContent = user.email;
    } else {
      if (label) label.textContent = "Đăng Nhập / Đăng Ký";
      if (icon) icon.textContent = "🔑";
      btn.classList.remove("btn-user-logged");
      btn.title = "Đăng nhập để đồng bộ kế hoạch lên đám mây";
      if (dropdown) dropdown.classList.remove("show");
    }
  }

  function openAuthModal(initialTab = "login") {
    const modal = document.getElementById("auth-modal");
    if (!modal) return;
    modal.style.display = "flex";
    switchTab(initialTab);
    clearErrors();
  }

  function closeAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.style.display = "none";
    clearErrors();
  }

  function switchTab(tab) {
    const tabLogin = document.getElementById("auth-tab-btn-login");
    const tabReg = document.getElementById("auth-tab-btn-register");
    const paneLogin = document.getElementById("auth-pane-login");
    const paneReg = document.getElementById("auth-pane-register");

    clearErrors();
    if (tab === "register") {
      tabLogin?.classList.remove("active");
      tabReg?.classList.add("active");
      if (paneLogin) paneLogin.style.display = "none";
      if (paneReg) paneReg.style.display = "block";
      document.getElementById("auth-reg-email")?.focus();
    } else {
      tabReg?.classList.remove("active");
      tabLogin?.classList.add("active");
      if (paneReg) paneReg.style.display = "none";
      if (paneLogin) paneLogin.style.display = "block";
      document.getElementById("auth-login-email")?.focus();
    }
  }

  function showError(msg) {
    const errEl = document.getElementById("auth-modal-error");
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.display = "block";
    }
  }

  function clearErrors() {
    const errEl = document.getElementById("auth-modal-error");
    if (errEl) {
      errEl.textContent = "";
      errEl.style.display = "none";
    }
  }

  async function syncGuestDataToCloud() {
    // 1. Sync guest real estate & Turo patrimoine to user cloud database
    const guestPat = localStorage.getItem("pyRetrait_guest_patrimoine_v2");
    if (guestPat) {
      try {
        await fetch("/api/pylocation/sync-cloud", {
          method: "POST",
          headers: getAuthHeaders(),
          body: guestPat
        });
        localStorage.removeItem("pyRetrait_guest_patrimoine_v2");
      } catch (e) {
        console.warn("Failed to sync guest patrimoine to cloud:", e);
      }
    }

    // 2. Sync guest FIRE plans if cloud account has no plans yet
    const guestPlans = localStorage.getItem("pyRetrait_plans_v2");
    if (guestPlans) {
      try {
        const resCheck = await fetch("/api/plans", { headers: getAuthHeaders() });
        if (resCheck.ok) {
          const cloudPlans = await resCheck.json();
          if (!cloudPlans || !cloudPlans.plans || !cloudPlans.plans.length) {
            await fetch("/api/plans", {
              method: "POST",
              headers: getAuthHeaders(),
              body: guestPlans
            });
          }
        }
      } catch (e) {
        console.warn("Failed to check/sync guest plans:", e);
      }
    }
  }

  function init() {
    verifyCurrentSession();

    // Trigger button
    const btn = document.getElementById("auth-btn-trigger");
    const dropdown = document.getElementById("user-dropdown");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isLoggedIn()) {
          dropdown?.classList.toggle("show");
        } else {
          openAuthModal("login");
        }
      });
    }

    // Close dropdown on outside click
    document.addEventListener("click", (e) => {
      if (dropdown && !dropdown.contains(e.target) && e.target !== btn) {
        dropdown.classList.remove("show");
      }
    });

    // Logout
    document.getElementById("auth-logout-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        logout();
      }
    });

    // Modal Close
    document.getElementById("btn-close-auth-modal")?.addEventListener("click", closeAuthModal);
    document.getElementById("btn-cancel-auth-modal")?.addEventListener("click", closeAuthModal);
    const modalEl = document.getElementById("auth-modal");
    if (modalEl) {
      modalEl.addEventListener("click", (e) => {
        if (e.target === modalEl) closeAuthModal();
      });
    }

    // Tab buttons
    document.getElementById("auth-tab-btn-login")?.addEventListener("click", () => switchTab("login"));
    document.getElementById("auth-tab-btn-register")?.addEventListener("click", () => switchTab("register"));

    // Switch link in form
    document.getElementById("link-to-register")?.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("register");
    });
    document.getElementById("link-to-login")?.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("login");
    });

    // Form Submit: Login
    document.getElementById("auth-form-login")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();
      const email = document.getElementById("auth-login-email")?.value.trim();
      const password = document.getElementById("auth-login-password")?.value;
      const submitBtn = document.getElementById("btn-submit-login");

      if (!email || !password) {
        showError("Vui lòng nhập đầy đủ email và mật khẩu.");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Đang đăng nhập...";
      }

      try {
        await login(email, password);
        await syncGuestDataToCloud();
        closeAuthModal();
        window.location.reload();
      } catch (err) {
        showError(err.message || "Đăng nhập không thành công.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Đăng Nhập";
        }
      }
    });

    // Form Submit: Register
    document.getElementById("auth-form-register")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();
      const email = document.getElementById("auth-reg-email")?.value.trim();
      const password = document.getElementById("auth-reg-password")?.value;
      const submitBtn = document.getElementById("btn-submit-register");

      if (!email || !password) {
        showError("Vui lòng điền email và mật khẩu.");
        return;
      }
      if (password.length < 6) {
        showError("Mật khẩu phải có độ dài ít nhất 6 ký tự.");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Đang tạo tài khoản...";
      }

      try {
        await register(email, password);
        await syncGuestDataToCloud();
        closeAuthModal();
        window.location.reload();
      } catch (err) {
        showError(err.message || "Đăng ký không thành công.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Tạo Tài Khoản";
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);

  return {
    getToken,
    getUser,
    isLoggedIn,
    getAuthHeaders,
    openAuthModal,
    closeAuthModal,
    logout
  };
})();

window.Auth = Auth;
