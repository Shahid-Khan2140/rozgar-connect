import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import "../App.css"; 
import Sidebar from "../components/Sidebar"; 
import { Bell, Moon, Sun, LogOut, CheckCircle, Info } from "lucide-react";
import { translations } from "../utils/translations";

const Layout = () => {
  const navigate = useNavigate();

  // --- 1. GLOBAL STATE (With Crash Prevention) ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || 'en');
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  
  const notifRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
    
    // Click outside to close notification dropdown
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // Run once on mount

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = translations[lang] || translations['en'];

  const fetchNotifications = async () => {
    if(!user?.id) return;
    try {
      const res = await axios.get(`${API_URL}/api/notifications/${user.id}`);
      setNotifications(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // Toggle 'dark' class on html tag for Tailwind
    if (newMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`app-layout ${darkMode ? "dark" : ""}`}>
      
      {/* SIDEBAR */}
      <Sidebar userRole={user?.role} lang={lang} t={t} />

      {/* MAIN CONTENT */}
      <main className="main-content relative">
        <header className="top-header flex justify-between items-center px-6 py-4 bg-[#0f2a44] text-white shadow-md border-b-4 border-orange-500">
          <div>
            <h3 className="font-semibold text-lg text-white tracking-wide">
              {t.govtTitle}
            </h3>
            <p className="text-xs text-blue-200 mt-1 font-medium">
              {t.welcome}, {user?.name || "User"}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Dark Mode Toggle */}
             <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-white/10 transition">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             {/* Language Toggle */}
             <div className="relative group">
                <button className="p-2 rounded hover:bg-white/10 text-xs font-bold border border-blue-400 w-10 text-center uppercase">
                  {lang}
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white rounded shadow-lg hidden group-hover:block z-50 text-gray-800 border border-gray-200">
                   <button onClick={() => changeLanguage('en')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-medium">English (EN)</button>
                   <button onClick={() => changeLanguage('hi')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-medium">Hindi (HI)</button>
                   <button onClick={() => changeLanguage('gu')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-medium">Gujarati (GU)</button>
                </div>
             </div>

             {/* SOS Button */}
             <button 
               onClick={() => alert("Emergency Helpline: 1800-ROZGAR (Mock)")}
               className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold animate-pulse"
             >
               {t.sos}
             </button>

             {/* Notifications */}
             <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setShowNotif(!showNotif)}
                  className="p-2 rounded-full hover:bg-white/10 transition relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-[#0f2a44]"></span>
                  )}
                </button>
                
                {showNotif && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 text-gray-800 overflow-hidden">
                     <div className="bg-gray-50 px-4 py-3 border-b text-sm font-bold text-gray-700">Notifications</div>
                     <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n._id} className="p-3 border-b hover:bg-gray-50 flex gap-3 text-sm">
                               <div className="mt-1">
                                  {n.type === 'success' ? <CheckCircle size={14} className="text-green-500"/> : <Info size={14} className="text-blue-500"/>}
                               </div>
                               <div>
                                  <div className="font-semibold text-xs text-gray-800 mb-0.5">{n.title}</div>
                                  <div className="text-gray-500 text-xs">{n.message}</div>
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
                )}
             </div>

             {/* Logout */}
             <button 
               onClick={handleLogout}
               className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-semibold transition flex items-center gap-2"
             >
               <LogOut size={16} /> {t.logout}
             </button>
          </div>
        </header>

        <div className="p-6 h-[calc(100vh-80px)] overflow-y-auto bg-gray-50">
          <Outlet context={{ user, setUser, darkMode, lang, t }} />
        </div>
      </main>
    </div>
  );
};

export default Layout;