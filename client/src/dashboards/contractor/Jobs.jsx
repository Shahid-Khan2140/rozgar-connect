import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../App.css";
import { API_URL } from "../../config";

const ContractorJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/contractor/jobs/${currentUser.id}`);
        setJobs(res.data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser.id) fetchJobs();
  }, [currentUser.id]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#2e7d32'; // Green
      case 'pending': return '#ff9800'; // Orange
      case 'assigned': return '#1976d2'; // Blue
      default: return '#666';
    }
  };

  if (loading) return <div>Loading Jobs...</div>;

  return (
    <div className="animate-fade-in">
      <h2 className="page-title">My Posted Jobs</h2>
      
      {jobs.length === 0 ? (
        <div className="card" style={{padding:'40px', textAlign:'center', color:'#888'}}>
          <p>No jobs posted yet. Go to "Workers" to hire someone.</p>
        </div>
      ) : (
        <div className="profile-grid" style={{gridTemplateColumns: '1fr'}}>
          {jobs.map(job => (
            <div key={job.id} className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap'}}>
              <div style={{flex: 1, minWidth: '250px'}}>
                <h3 style={{margin:'0 0 5px 0'}}>{job.title}</h3>
                <p style={{margin:'0 0 5px 0', color:'#666', fontSize:'14px'}}>{job.description}</p>
                <div style={{display:'flex', gap:'15px', fontSize:'13px', color:'#555'}}>
                   <span>📍 {job.location}</span>
                   <span>📅 {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{flex: 1, minWidth: '250px', borderLeft:'1px solid #eee', paddingLeft:'20px'}}>
                 <p style={{fontSize:'12px', textTransform:'uppercase', color:'#888', margin:'0 0 5px 0'}}>Assigned To</p>
                 <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <div style={{width:'40px', height:'40px', background:'#eee', borderRadius:'50%'}}></div> {/* Placeholder Avatar */}
                    <div>
                      <strong style={{display:'block'}}>{job.worker_name}</strong>
                      <small>{job.worker_phone}</small>
                    </div>
                 </div>
              </div>

              <div style={{minWidth: '150px', textAlign:'right'}}>
                 <span style={{
                    display:'inline-block', 
                    padding:'6px 12px', 
                    borderRadius:'20px', 
                    background: getStatusColor(job.status), 
                    color:'white', 
                    fontSize:'12px', 
                    fontWeight:'bold',
                    marginBottom: '8px'
                  }}>
                    {job.status.toUpperCase()}
                 </span>
                 <p style={{margin:0, fontWeight:'bold', fontSize:'18px'}}>₹{job.wage}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractorJobs;
