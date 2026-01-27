import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../App.css";
import { API_URL } from "../../config";

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/policies`);
      setPolicies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/policies`, form);
      setForm({ title: "", content: "" });
      fetchPolicies();
      alert("Policy Posted!");
    } catch (err) {
      alert("Failed to post policy");
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="page-title">Government Policies & Updates</h2>

      <div className="card" style={{marginBottom: '30px'}}>
        <h3>Post New Policy</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-modern has-value">
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required/>
            <label>Policy Title</label>
          </div>
          <div className="input-modern has-value">
            <textarea 
              value={form.content} 
              onChange={e => setForm({...form, content: e.target.value})} 
              required
              rows="4"
              style={{width:'100%', padding:'15px', border:'2px solid #f0f2f5', borderRadius:'12px', outline:'none'}}
            ></textarea>
            <label style={{top:'-10px', background:'white'}}>Content / Description</label>
          </div>
          <button type="submit" className="btn-modern btn-primary">Publish Update</button>
        </form>
      </div>

      <div className="policy-list">
        {policies.map(p => (
          <div key={p.id} className="card" style={{borderLeft: '5px solid #ff9800'}}>
             <h3 style={{marginTop:0}}>{p.title}</h3>
             <p style={{whiteSpace:'pre-wrap'}}>{p.content}</p>
             <p style={{fontSize:'12px', color:'#999', marginTop:'15px'}}>
                Posted on: {new Date(p.date_posted).toLocaleDateString()}
             </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Policies;
