import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../App.css";
import { API_URL } from "../../config";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    // Fetch workers data
    const fetchWorkers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/workers`);
        setWorkers(res.data);
      } catch (err) {
        console.error("Failed to fetch workers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  // Dashboard Stats
  const stats = [
    { label: "Total Workers", value: workers.length, color: "blue" },
    { label: "Active Jobs", value: "45", color: "orange" },
    { label: "Pending Applications", value: "12", color: "green" },
    { label: "Total Wages Paid", value: "₹4.2L", color: "purple" }
  ];

  const recentJobs = [
    { id: 1, role: "Construction Mason", location: "Ahmedabad", wage: "₹600/day" },
    { id: 2, role: "Farm Helper", location: "Rajkot", wage: "₹450/day" },
    { id: 3, role: "Electrician", location: "Surat", wage: "₹800/job" },
    { id: 4, role: "Plumbing Assistant", location: "Vadodara", wage: "₹500/day" },
  ];

  if (loading) return <div className="page-title">Loading...</div>;

  return (
    <div className="animate-fade-in">
      {/* 1. Header Section */}
      <h2 className="page-title">Labour Dashboard - Overview</h2>
      
      <div style={{marginBottom: '25px', padding: '15px', background: '#e3f2fd', borderLeft: '4px solid #2196f3', borderRadius: '6px'}}>
        <p style={{margin: 0, color: '#1565c0', fontWeight: '500'}}>Good to see you, <strong>{user?.name || "User"}</strong>! Your dashboard shows the latest updates on jobs, payments, and welfare schemes.</p>
      </div>

      {/* 2. Stats Row */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <h3>{stat.label}</h3>
            <p className="stat-number">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 3. Main Content Grid */}
      <div className="main-grid">
        
        {/* Left Column: Recent Jobs Table */}
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', paddingBottom: '15px', borderBottom: '2px solid #f0f0f0'}}>
            <h3 style={{margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f2a44'}}>Available Job Opportunities</h3>
            <button className="btn-modern btn-primary" style={{width:'auto', padding:'8px 16px', fontSize:'13px', marginTop:0, fontWeight: '600'}}>View All Jobs</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Location</th>
                <th>Wage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr key={job.id}>
                  <td style={{fontWeight:'600', color:'#333'}}>{job.role}</td>
                  <td style={{color:'#666'}}>{job.location}</td>
                  <td style={{fontWeight:'bold', color:'#2e7d32'}}>{job.wage}</td>
                  <td>
                    <button className="delete-btn" style={{color:'#0f2a44', borderColor:'#0f2a44'}}>Apply</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column: Registered Workers List */}
        <div className="card" style={{height: 'fit-content'}}>
          <h3>Registered Workers ({workers.length})</h3>
          <ul style={{listStyle:'none', padding:0}}>
            {workers.slice(0, 5).map((worker) => (
              <li key={worker.id} style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #eee', alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:'600', color:'#333'}}>{worker.name}</div>
                  <div style={{fontSize:'12px', color:'#888'}}>{worker.skill} • ₹{worker.rate}/day</div>
                </div>
                <button className="btn-modern btn-green" style={{width:'auto', padding:'5px 10px', fontSize:'11px', height:'30px', marginTop:'0'}}>Hire</button>
              </li>
            ))}
          </ul>
          <button className="btn-modern btn-orange" style={{marginTop:'15px', width:'100%'}}>View All Workers</button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;