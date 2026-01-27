import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import rg1Logo from "../assets/Rg1.png"; 
import { translations } from "../utils/translations"; 
import "../App.css";

const MainLayout = () => {
  const navigate = useNavigate();
  
  // ============================================
  // 1. GLOBAL STATE MANAGEMENT (The "Brain")
  // ============================================

  // Language (Persists on refresh)
  const [lang, setLang] = useState(localStorage.getItem("appLang") || "en");
  
  // Theme (Dark/Light)
  const [darkMode, setDarkMode] = useState(localStorage.getItem("appTheme") === "dark");

  // User Profile (Name/Email)
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("adminProfile")) || {
    name: "Shahid Khan",
    email: "admin@rozgar.gov.in"
  });

  // Activity Log (Tracks actions)
  const [activityLog, setActivityLog] = useState(
    JSON.parse(localStorage.getItem("activityLog")) || []
  );

  const t = translations[lang]; 

  // ============================================
  // 2. EFFECTS & LOGIC
  // ============================================

  // Apply Dark Mode to the <body> tag whenever state changes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("appTheme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("appTheme", "light");
    }
  }, [darkMode]);

  // Save Language Preference
  useEffect(() => {
    localStorage.setItem("appLang", lang);
  }, [lang]);

  // Helper function to add a new log entry
  const addLog = (action) => {
    const newLog = { id: Date.now(), text: action, time: new Date().toLocaleTimeString() };
    const updatedLogs = [newLog, ...activityLog].slice(0, 10); // Keep only last 10 actions
    setActivityLog(updatedLogs);
    localStorage.setItem("activityLog", JSON.stringify(updatedLogs));
  };

  const handleLogout = () => {
    if (window.confirm(lang === "en" ? "Logout?" : "લોગ આઉટ?")) {
      addLog("User Logged Out");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  return (
    <div className="app-wrapper">
      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        
        {/* BRANDING */}
        <div className="nav-brand-container">
          <img src={rg1Logo} alt="Logo" className="nav-logo-main" />
          <div className="nav-text-group">
            <h1>
              <span className="rojgar">રોજગાર</span> 
              <span className="connect"> Connect</span>
            </h1>
            <p className="nav-tagline">Government of Gujarat | Labor Welfare Portal</p>
          </div>
        </div>

        {/* RIGHT CONTROLS */}
        <div className="nav-right-group">
          
          {/* 1. Dynamic User Name Display */}
          <div className="nav-user-section">
            <span>{user.name}</span>
          </div>

          {/* 2. Settings Button (Text Only) */}
          <button 
            className="nav-text-btn" 
            onClick={() => navigate("/dashboard/settings")}
          >
            {t.settings}
          </button>

          {/* 3. Logout Button (Text Only) */}
          <button 
            className="nav-text-btn logout" 
            onClick={handleLogout}
          >
            {t.logout}
          </button>
        </div>
      </nav>

      {/* ================= CONTENT ================= */}
      {/* PASSING ALL STATE DOWN TO CHILDREN (Dashboard, Settings) */}
      <div className="content-wrapper">
        <Outlet context={{ 
          lang, setLang, t, 
          darkMode, setDarkMode, 
          user, setUser, 
          activityLog, addLog 
        }} />
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="main-footer">
        <p>
          &copy; {new Date().getFullYear()} <strong>Rozgar Connect</strong>. All Rights Reserved.
        </p>
        <p className="footer-credits">
           Designed & Developed by <strong>Shahid Khan</strong>
        </p>
      </footer>

    </div>
  );
};

export default MainLayout;