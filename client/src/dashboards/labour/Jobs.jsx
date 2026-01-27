import React, { useState } from "react";
import "../../App.css";

const Jobs = () => {
  const [appliedJobs, setAppliedJobs] = useState(JSON.parse(localStorage.getItem("appliedJobs")) || []);
  const [message, setMessage] = useState("");

  const availableJobs = [
    { id: 1, title: "Construction Helper", location: "Ahmedabad", wage: "₹500/day", company: "BuildTech Ltd", description: "Assist in construction site work" },
    { id: 2, title: "Farm Labor", location: "Rajkot", wage: "₹400/day", company: "Green Farms", description: "Agricultural field work" },
    { id: 3, title: "Electrician", location: "Surat", wage: "₹800/day", company: "ElectroSafe", description: "Electrical installation and repair" },
    { id: 4, title: "Plumbing Assistant", location: "Vadodara", wage: "₹500/day", company: "WaterFlow Co.", description: "Plumbing work assistance" },
    { id: 5, title: "Mason", location: "Gandhinagar", wage: "₹700/day", company: "MasterBuild", description: "Masonry and brickwork" },
    { id: 6, title: "Driver", location: "Ahmedabad", wage: "₹600/day", company: "Transport Hub", description: "Commercial vehicle driving" },
  ];

  const handleApply = (jobId, jobTitle) => {
    if (!appliedJobs.includes(jobId)) {
      const updated = [...appliedJobs, jobId];
      setAppliedJobs(updated);
      localStorage.setItem("appliedJobs", JSON.stringify(updated));
      setMessage(`Successfully applied to "${jobTitle}"`);
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(`Already applied to "${jobTitle}"`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="page-title">Job Opportunities & Placements</h2>
      
      <div style={{marginBottom: '25px', padding: '15px', background: '#f3e5f5', borderLeft: '4px solid #7b1fa2', borderRadius: '6px'}}>
        <p style={{margin: 0, color: '#5e35b1', fontWeight: '500'}}>Total Applied: <strong>{appliedJobs.length} job{appliedJobs.length !== 1 ? 's' : ''}</strong></p>
      </div>
      
      {message && (
        <div style={{
          background: message.includes("Successfully") ? '#e8f5e9' : '#fff3e0',
          color: message.includes("Successfully") ? '#2e7d32' : '#e65100',
          padding: '12px 15px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontWeight: '500',
          borderLeft: '4px solid ' + (message.includes("Successfully") ? '#4caf50' : '#ff9800')
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {availableJobs.map((job) => (
          <div key={job.id} className="card" style={{ padding: '20px', borderLeft: '4px solid #ff9800', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#0f2a44', fontSize: '16px', fontWeight: '700' }}>{job.title}</h3>
            <p style={{ margin: '3px 0 0 0', color: '#666', fontSize: '13px', fontWeight: '500' }}>{job.company}</p>
            <p style={{ margin: '10px 0', color: '#666', fontSize: '14px', lineHeight: '1.4' }}>{job.description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #eee' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  <strong>Location:</strong> {job.location}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>{job.wage}</div>
              </div>
              <button 
                onClick={() => handleApply(job.id, job.title)}
                disabled={appliedJobs.includes(job.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: appliedJobs.includes(job.id) ? '#ccc' : '#2e7d32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: appliedJobs.includes(job.id) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                {appliedJobs.includes(job.id) ? '✓ Applied' : 'Apply Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {appliedJobs.length > 0 && (
        <div className="card" style={{ marginTop: '30px', background: '#f0f7ff', borderLeft: '4px solid #0f2a44' }}>
          <h3>📊 Your Applications</h3>
          <p>You have applied to {appliedJobs.length} job(s). Check your email for updates on your applications.</p>
        </div>
      )}
    </div>
  );
};

export default Jobs;