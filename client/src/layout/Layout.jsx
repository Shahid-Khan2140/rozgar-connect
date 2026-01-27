import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import "../App.css"; 
import Sidebar from "../components/Sidebar"; 

const Layout = () => {
  const navigate = useNavigate();

  // --- 1. GLOBAL STATE (With Crash Prevention) ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    try {
      // Try to parse. If it fails (bad data), catch block handles it.
      return saved ? JSON.parse(saved) : { name: "Admin User", email: "admin@rozgar.com" };
    } catch (e) {
      console.warn("Corrupt user data found. Resetting...");
      // If data is just a string (like "shahid"), wrap it in an object
      if (saved) return { name: saved, email: saved };
      return { name: "Admin User", email: "admin@rozgar.com" };
    }
  });
  
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState("en"); 
  
  const [activityLog, setActivityLog] = useState([
    { id: 1, text: "System startup", time: new Date().toLocaleTimeString() }
  ]);

  // Helper functions
  const addLog = (text) => {
    const newLog = { id: Date.now(), text, time: new Date().toLocaleTimeString() };
    setActivityLog((prev) => [newLog, ...prev]);
  };

  const t = (key) => key; 

  // Dark Mode Toggle
  useEffect(() => {
    if (darkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={`app-layout ${darkMode ? "dark" : ""}`}>
      
      {/* SIDEBAR */}
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="top-header" style={{
          background: '#0f2a44',
          color: '#fff',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderBottom: '3px solid #ff9800'
        }}>
          <div>
            <h3 style={{
              margin: '0',
              fontWeight: '600',
              fontSize: '18px',
              color: '#fff',
              letterSpacing: '0.3px'
            }}>
              Government of India - Labour Ministry
            </h3>
            <p style={{
              margin: '3px 0 0 0',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.8)',
              fontWeight: '500'
            }}>
              Welcome, {user?.name || "User"}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              background: '#ff9800',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#e68900'}
            onMouseLeave={(e) => e.target.style.background = '#ff9800'}
          >
            Logout
          </button>
        </header>
        <div className="content-scroll">
          <Outlet context={{ 
            user, setUser, 
            darkMode, setDarkMode, 
            lang, setLang, 
            activityLog, addLog, 
            t 
          }} />
        </div>
      </main>
    </div>
  );
};

export default Layout;