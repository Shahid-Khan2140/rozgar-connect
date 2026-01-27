import React, { useState } from "react";
import "../../App.css";

const Safety = () => {
  const [showReport, setShowReport] = useState(false);
  const [incident, setIncident] = useState("");

  const handleReportSubmit = () => {
    if (incident.trim()) {
      alert("✅ Incident reported to authorities!");
      setIncident("");
      setShowReport(false);
    }
  };

  const safetyTips = [
    { id: 1, title: "Personal Protective Equipment", description: "Always wear helmet, gloves, and steel-toed boots", icon: "�" },
    { id: 2, title: "Machinery Safety", description: "Never disable safety features on equipment", icon: "⚙️" },
    { id: 3, title: "Electrical Safety", description: "Avoid contact with wet hands near electrical equipment", icon: "⚡" },
    { id: 4, title: "Heat & Hydration", description: "Take regular breaks and stay hydrated", icon: "💧" },
    { id: 5, title: "First Aid Knowledge", description: "Know basic first aid and locate first aid box", icon: "🏥" },
    { id: 6, title: "Report Accidents", description: "Report all incidents immediately to supervisor", icon: "📋" }
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="page-title">Workplace Safety & Health Standards</h2>
      
      <div className="card" style={{marginBottom:'20px', borderLeft:'4px solid #d32f2f', background:'#ffebee'}}>
        <h3 style={{color: '#0f2a44', fontSize:'16px', margin:'0 0 10px 0', fontWeight: '700'}}>Safety Alert</h3>
        <p style={{margin:0, fontSize:'14px', color: '#c62828', fontWeight: '500'}}>Heatwave Warning: Ahmedabad District - Ensure hydration breaks every hour between 12 PM - 3 PM.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        {safetyTips.map((tip) => (
          <div key={tip.id} className="card" style={{ borderTop: '4px solid #ff9800', padding: '15px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>{tip.icon}</div>
            <h4 style={{ margin: '0 0 8px 0', color: '#0f2a44', fontWeight: '700' }}>{tip.title}</h4>
            <p style={{ margin: 0, color: '#666', fontSize: '13px', lineHeight: '1.4' }}>{tip.description}</p>
          </div>
        ))}
      </div>

      <div className="main-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card">
          <h3 style={{margin: '0 0 15px 0', fontSize: '16px', fontWeight: '700', color: '#0f2a44'}}>Safety Protocols</h3>
          <ul style={{paddingLeft:'20px', lineHeight:'1.8', color: '#555', margin: '0', fontSize: '13px'}}>
            <li>Always wear protective helmets in construction zones.</li>
            <li>Ensure electrical equipment is grounded before use.</li>
            <li>Report damaged tools immediately to the supervisor.</li>
            <li>Keep emergency exits clear of debris and materials.</li>
            <li>Use harnesses when working at heights above 6 feet.</li>
            <li>Never work under the influence of alcohol or drugs.</li>
          </ul>
        </div>
        
        <div className="card">
          <h3>Need Help?</h3>
          {!showReport ? (
            <div>
              <p style={{fontSize:'14px', color:'#666', marginBottom:'15px', margin:0}}>Report safety violations or accidents immediately.</p>
              <button onClick={() => setShowReport(true)} className="btn-modern btn-orange" style={{ width: '100%', marginTop: '15px' }}>🚨 Report Incident</button>
            </div>
          ) : (
            <div>
              <textarea 
                placeholder="Describe the incident..."
                value={incident}
                onChange={(e) => setIncident(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  marginBottom: '10px',
                  height: '80px',
                  fontSize: '12px'
                }}
              ></textarea>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleReportSubmit} className="btn-modern btn-orange" style={{ flex: 1 }}>Submit</button>
                <button onClick={() => setShowReport(false)} className="btn-modern" style={{ flex: 1, background: '#ccc', color: '#333' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Safety;