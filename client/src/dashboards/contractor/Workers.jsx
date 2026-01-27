import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../App.css";
import { API_URL } from "../../config";

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [jobForm, setJobForm] = useState({ title: "", description: "", location: "", wage: "" });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/contractor/laborers`);
        setWorkers(res.data);
      } catch (err) {
        console.error("Error fetching workers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const handleHireClick = (worker) => {
    setSelectedWorker(worker);
    setShowModal(true);
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/jobs`, {
        contractor_id: currentUser.id,
        worker_id: selectedWorker.id,
        ...jobForm
      });
      alert("Job Assigned Successfully!");
      setShowModal(false);
      setJobForm({ title: "", description: "", location: "", wage: "" });
    } catch (err) {
      alert("Failed to assign job.");
      console.error(err);
    }
  };

  const filtered = filter === "all" ? workers : workers.filter(w => (w.availability || 'Available') === filter);

  if (loading) return <div className="page-title">Loading Directory...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2 className="page-title">Laborers Directory</h2>
        <div className="filter-group">
          <button onClick={() => setFilter("all")} className={`tab-btn ${filter === 'all' ? 'active' : ''}`}>All</button>
          <button onClick={() => setFilter("available")} className={`tab-btn ${filter === 'available' ? 'active' : ''}`}>Available</button>
        </div>
      </div>

      <div className="profile-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', display: 'grid' }}>
        {filtered.map((w) => (
          <div key={w.id} className="card employee-card" style={{ position: 'relative' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <img 
                  src={w.profile_pic_url || "https://via.placeholder.com/60"} 
                  alt={w.name} 
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{w.name}</h3>
                  <span style={{ fontSize: '12px', color: '#666' }}>{w.phone}</span>
                </div>
             </div>
             
             <div className="info-row">
               <label>Skill:</label> <p>{w.skill || "General Labor"}</p>
             </div>
             <div className="info-row">
               <label>Location:</label> <p>{w.location || "Not Specified"}</p>
             </div>
             <div className="info-row">
               <label>Daily Rate:</label> <p style={{ color: 'var(--accent)', fontWeight: 'bold' }}>₹{w.daily_wage || "N/A"}</p>
             </div>

             <button 
               className="btn-modern" 
               style={{ marginTop: '15px', padding: '10px' }}
               onClick={() => handleHireClick(w)}
             >
               Hire / Assign Job
             </button>
          </div>
        ))}
      </div>

      {/* HIRE MODAL */}
      {showModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: 'white', padding: '30px', borderRadius: '16px', width: '500px', maxWidth: '90%'
          }}>
            <h2 style={{marginTop:0}}>Assign Job to {selectedWorker?.name}</h2>
            <form onSubmit={handleJobSubmit}>
              <div className="input-modern has-value">
                <input 
                  type="text" 
                  value={jobForm.title} 
                  onChange={e => setJobForm({...jobForm, title: e.target.value})} 
                  required 
                />
                <label>Job Title</label>
              </div>
              <div className="input-modern has-value">
                <input 
                  type="text" 
                  value={jobForm.location} 
                  onChange={e => setJobForm({...jobForm, location: e.target.value})} 
                  required 
                />
                <label>Job Location</label>
              </div>
              <div className="input-modern has-value">
                <input 
                  type="number" 
                  value={jobForm.wage} 
                  onChange={e => setJobForm({...jobForm, wage: e.target.value})} 
                  required 
                />
                <label>Offered Daily Wage (₹)</label>
              </div>
              <div className="input-modern has-value">
                <textarea 
                  value={jobForm.description} 
                  onChange={e => setJobForm({...jobForm, description: e.target.value})}
                  style={{width:'100%', padding:'15px', border:'2px solid #f0f2f5', borderRadius:'12px', minHeight:'100px'}}
                  placeholder="Job Description..."
                ></textarea>
              </div>

              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-modern" style={{background:'#eee', color:'#333'}}>Cancel</button>
                <button type="submit" className="btn-modern btn-green">Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;