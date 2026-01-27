import React, { useState } from "react";
import "../../App.css";

const Grievance = () => {
  const [complaints, setComplaints] = useState(JSON.parse(localStorage.getItem("grievances")) || []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ subject: "", type: "", description: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.type || !formData.description) {
      setMessage("Please fill all required fields!");
      return;
    }

    const newComplaint = {
      id: Date.now(),
      ...formData,
      date: new Date().toLocaleDateString(),
      status: "Submitted"
    };

    const updated = [...complaints, newComplaint];
    setComplaints(updated);
    localStorage.setItem("grievances", JSON.stringify(updated));
    setFormData({ subject: "", type: "", description: "" });
    setShowForm(false);
    setMessage("Complaint submitted successfully and is under review");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="page-title">Grievance & Complaint Portal</h2>

      {message && (
        <div style={{
          background: message.includes("successfully") ? '#e8f5e9' : '#fff3e0',
          color: message.includes("successfully") ? '#2e7d32' : '#e65100',
          padding: '12px 15px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontWeight: '500',
          borderLeft: '4px solid ' + (message.includes("successfully") ? '#4caf50' : '#ff9800')
        }}>
          {message}
        </div>
      )}

      <div className="main-grid" style={{gridTemplateColumns: "2fr 1fr"}}>
        <div className="card">
          {!showForm ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #f0f0f0' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f2a44' }}>Filed Complaints</h3>
                <button onClick={() => setShowForm(true)} className="btn-modern btn-orange" style={{ width: 'auto', fontSize: '13px', fontWeight: '600' }}>
                  File New Complaint
                </button>
              </div>

              {complaints.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '40px 0', fontWeight: '500' }}>No complaints filed yet.</p>
              ) : (
                <div>
                  {complaints.map((complaint) => (
                    <div key={complaint.id} style={{
                      padding: '15px',
                      borderLeft: '4px solid #ff9800',
                      background: '#fafafa',
                      marginBottom: '15px',
                      borderRadius: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 5px 0', color: '#0f2a44', fontWeight: '600' }}>{complaint.subject}</h4>
                          <p style={{ margin: '3px 0', fontSize: '12px', color: '#666' }}>Type: <strong>{complaint.type}</strong> | {complaint.date}</p>
                          <p style={{ margin: '8px 0 0 0', color: '#555', fontSize: '13px' }}>{complaint.description}</p>
                        </div>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '700',
                          background: '#fbc02d',
                          color: '#333',
                          whiteSpace: 'nowrap'
                        }}>
                          {complaint.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700', color: '#0f2a44' }}>File a New Complaint</h3>
              <form onSubmit={handleSubmit}>
                <div className="input-modern">
                  <input 
                    type="text" 
                    placeholder=" " 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required 
                  />
                  <label>Subject</label>
                </div>
                <div className="input-modern">
                  <select 
                    style={{width:'100%', padding:'15px', borderRadius:'12px', border:'2px solid #eee', background:'#f9f9f9', outline:'none', color: '#455a64'}}
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="">Select Issue Type</option>
                    <option value="Wage Dispute">Wage Dispute</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Safety Violation">Safety Violation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="input-modern">
                  <textarea 
                    placeholder="Describe your issue in detail..." 
                    style={{width:'100%', padding:'15px', borderRadius:'12px', border:'2px solid #eee', height:'120px', resize:'vertical'}}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-modern btn-orange" style={{ flex: 1 }}>Submit Complaint</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-modern" style={{ flex: 1, background: '#ccc', color: '#333' }}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="card" style={{height:'fit-content'}}>
          <h3>🚨 Emergency Contacts</h3>
          <ul style={{listStyle:'none', padding:0}}>
            <li style={{marginBottom:'15px', paddingBottom:'10px', borderBottom:'1px solid #eee'}}>
              <span style={{fontSize:'12px', color:'#78909c', textTransform:'uppercase', fontWeight:'bold'}}>Labor Helpline</span>
              <div style={{color:'#d32f2f', fontWeight:'bold', fontSize:'18px', marginTop:'5px'}}>155372</div>
            </li>
            <li style={{marginBottom:'15px', paddingBottom:'10px', borderBottom:'1px solid #eee'}}>
              <span style={{fontSize:'12px', color:'#78909c', textTransform:'uppercase', fontWeight:'bold'}}>Women's Safety</span>
              <div style={{color:'#d32f2f', fontWeight:'bold', fontSize:'18px', marginTop:'5px'}}>181</div>
            </li>
            <li>
              <span style={{fontSize:'12px', color:'#78909c', textTransform:'uppercase', fontWeight:'bold'}}>Police</span>
              <div style={{color:'#d32f2f', fontWeight:'bold', fontSize:'18px', marginTop:'5px'}}>100</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Grievance;