import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios"; 
import { API_URL } from "../../config"; 

const Settings = () => {
  // 1. Access Global State
  const { 
    lang, setLang, 
    darkMode, setDarkMode, 
    user, setUser, 
    activityLog, addLog 
  } = useOutletContext();
  
  const navigate = useNavigate();

  // 2. Local State
  const [passData, setPassData] = useState({ current: "", new: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [notifications, setNotifications] = useState({ email: true, sms: false });
  const [twoFactor, setTwoFactor] = useState(false);
  const [note, setNote] = useState(localStorage.getItem("adminNote") || "");

  // 3. Handlers

  // Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/update-profile`, {
        currentEmail: user.email, 
        newName: user.name,
        newEmail: user.email
      });

      if (res.data.user) {
        setUser(res.data.user); 
        localStorage.setItem("user", JSON.stringify(res.data.user)); 
        setMsg({ text: "Profile updated successfully.", type: "success" });
        addLog(`Profile updated: ${res.data.user.name}`);
      }
    } catch (err) {
      setMsg({ text: "Failed to update profile.", type: "error" });
    }
  };

  // Password Update
  const handlePassUpdate = async (e) => {
    e.preventDefault();
    if (!passData.current || !passData.new) {
      setMsg({ text: "All password fields are required.", type: "error" });
      return;
    }

    try {
      await axios.post(`${API_URL}/api/change-password`, {
        username: user.email,
        currentPassword: passData.current,
        newPassword: passData.new
      });

      setMsg({ text: "Password changed successfully.", type: "success" });
      setPassData({ current: "", new: "" });
      addLog("Security: Password changed");
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Password update failed.", type: "error" });
    }
  };

  // Notepad Auto-Save
  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNote(val);
    localStorage.setItem("adminNote", val);
  };

  // Data Export
  const handleExport = (format) => {
    if(window.confirm(`Download system data as .${format.toUpperCase()}?`)) {
        addLog(`Data export initiated: .${format}`);
        if(format === 'csv' && activityLog){
            const csvContent = "data:text/csv;charset=utf-8,ID,Action,Time\n" 
                + activityLog.map(l => `${l.id},${l.text},${l.time}`).join("\n");
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", "system_logs.csv");
            document.body.appendChild(link);
            link.click();
        } else {
            alert(`System is preparing .${format} file...`);
        }
    }
  };

  return (
    <div className="dashboard-content animate-fade-in">
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <h2 className="page-title" style={{ margin: 0 }}>System Configuration</h2>
        <button onClick={() => navigate("/dashboard")} className="delete-btn" style={{ fontSize: "13px", fontWeight: "600" }}>
          Back to Dashboard
        </button>
      </div>

      {/* FEEDBACK MESSAGE */}
      {msg.text && (
        <div className={`message-box ${msg.type}`} style={{ marginBottom: "25px" }}>
          {msg.text}
        </div>
      )}

      {/* MAIN GRID */}
      <div className="main-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        
        {/* --- CARD 1: SYSTEM PREFERENCES --- */}
        <div className="card">
          <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "20px" }}>General Preferences</h3>
          
          <div style={{ marginBottom: "25px" }}>
            <label style={{ display:"block", marginBottom:"10px", fontSize: "13px", color: "var(--text-sec)", fontWeight: "600" }}>Interface Language</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className={lang === "en" ? "add-btn" : "delete-btn"} onClick={() => { setLang("en"); addLog("Language switched to English"); }}>English</button>
              <button className={lang === "gu" ? "add-btn" : "delete-btn"} onClick={() => { setLang("gu"); addLog("Language switched to Gujarati"); }}>Gujarati</button>
            </div>
          </div>

          <div>
            <label style={{ display:"block", marginBottom:"10px", fontSize: "13px", color: "var(--text-sec)", fontWeight: "600" }}>Visual Theme</label>
            <button 
                className="delete-btn" 
                style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--text-main)", textAlign: "left", paddingLeft: "15px" }}
                onClick={() => { setDarkMode(!darkMode); addLog(`Theme changed to ${!darkMode ? 'Dark' : 'Light'}`); }}
            >
                {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>
          </div>
        </div>

        {/* --- CARD 2: ADMIN PROFILE --- */}
        <div className="card">
            <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "20px" }}>Administrator Profile</h3>
            <form onSubmit={handleProfileUpdate}>
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display:"block", marginBottom:"8px", fontSize: "13px", color: "var(--text-sec)", fontWeight: "600" }}>Full Name</label>
                    <input type="text" value={user?.name || ""} onChange={(e) => setUser({...user, name: e.target.value})} className="input-modern" style={{width: '95%', padding: '12px'}} />
                </div>
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display:"block", marginBottom:"8px", fontSize: "13px", color: "var(--text-sec)", fontWeight: "600" }}>Official Email</label>
                    <input type="email" value={user?.email || ""} onChange={(e) => setUser({...user, email: e.target.value})} className="input-modern" style={{width: '95%', padding: '12px'}} />
                </div>
                <button type="submit" className="add-btn">Save Profile Changes</button>
            </form>
        </div>

        {/* --- CARD 3: SECURITY CENTER --- */}
        <div className="card">
          <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "20px" }}>Security Settings</h3>
          <form onSubmit={handlePassUpdate} style={{ marginBottom: "25px", borderBottom: "1px solid var(--border)", paddingBottom: "25px" }}>
            <label style={{ display:"block", marginBottom:"8px", fontSize: "13px", color: "var(--text-sec)", fontWeight: "600" }}>Change Password</label>
            <input type="password" placeholder="Current Password" value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} className="input-modern" style={{width: '95%', marginBottom: '15px', padding: '12px'}} />
            <input type="password" placeholder="New Password" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} className="input-modern" style={{width: '95%', marginBottom: '15px', padding: '12px'}} />
            <button type="submit" className="add-btn" style={{ background: "#d32f2f", borderColor: "#d32f2f" }}>Update Credentials</button>
          </form>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-main)" }}>Two-Factor Authentication</span>
             <input type="checkbox" checked={twoFactor} onChange={() => { setTwoFactor(!twoFactor); addLog("2FA Toggled"); }} style={{ width: "18px", height: "18px" }} />
          </div>
        </div>

        {/* --- CARD 4: DATA & ALERTS --- */}
        <div className="card">
          <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "20px" }}>Data & Notifications</h3>
          <div style={{ marginBottom: "25px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-sec)", display: "block", marginBottom: "12px" }}>Notification Channels</label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                <input type="checkbox" checked={notifications.email} onChange={() => setNotifications({...notifications, email: !notifications.email})} style={{ width: "16px", height: "16px" }} />
                <span style={{ fontSize: "14px" }}>Email Alerts (Registrations)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input type="checkbox" checked={notifications.sms} onChange={() => setNotifications({...notifications, sms: !notifications.sms})} style={{ width: "16px", height: "16px" }} />
                <span style={{ fontSize: "14px" }}>SMS Alerts (System Errors)</span>
            </div>
          </div>
          <hr style={{ border: "0", borderTop: "1px solid var(--border)", margin: "20px 0" }} />
          <h4 style={{ fontSize: "13px", marginBottom: "15px", color: "var(--text-sec)", fontWeight: "600" }}>Database Management</h4>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
             <button onClick={() => handleExport('csv')} className="delete-btn" style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)", padding: "10px 20px" }}>Export as CSV</button>
             <button className="delete-btn" style={{ background: "transparent", border: "1px solid #d32f2f", color: "#d32f2f", padding: "10px 20px" }} onClick={() => { alert("Backup Created!"); addLog("Manual DB Backup created"); }}>Backup Database</button>
          </div>
        </div>

        {/* --- CARD 5: ACTIVITY LOG --- */}
        <div className="card">
          <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "20px" }}>System Activity Log</h3>
          <div style={{ maxHeight: "180px", overflowY: "auto", background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: "6px", padding: "10px" }}>
            {activityLog && activityLog.length === 0 ? (
              <div style={{ padding: "10px", fontSize: "13px", color: "var(--text-sec)" }}>No recent activity recorded.</div>
            ) : (
              activityLog?.map((log) => (
                <div key={log.id} className="log-item" style={{ padding: "8px 0", borderBottom: "1px solid #eee", fontSize: "13px" }}>
                  <span style={{ color: "var(--text-sec)", marginRight: "12px", fontFamily: "monospace" }}>{log.time}</span>
                  <span style={{ fontWeight: "500" }}>{log.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- CARD 6: NOTEPAD --- */}
        <div className="card">
          <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "20px" }}>Administrative Notes</h3>
          <textarea 
            className="notepad-area" 
            value={note} 
            onChange={handleNoteChange} 
            placeholder="Type administrative notes here..."
            style={{ width: "95%", height: "120px", padding: "12px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "14px", fontFamily: "inherit" }}
          ></textarea>
        </div>

      </div>
    </div>
  );
};

export default Settings;