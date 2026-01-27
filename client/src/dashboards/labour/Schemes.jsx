import React from "react";
import "../../App.css";

const Schemes = () => {
  const schemes = [
    { id: 1, title: "Shramik Annapurna Yojana", desc: "Subsidized nutritious meals for construction workers at just ₹10 per meal.", benefits: "Daily meals, Health check-ups", status: "Active" },
    { id: 2, title: "Dhanvantari Arogya Rath", desc: "Mobile medical vans providing free on-site healthcare and check-ups.", benefits: "Free healthcare, Medicine access", status: "Active" },
    { id: 3, title: "Housing Subsidy Scheme", desc: "Financial aid up to ₹2,00,000 for building permanent houses.", benefits: "Home ownership, Long-term security", status: "Active" },
    { id: 4, title: "Education Scholarship", desc: "Scholarships ranging from ₹5,000 to ₹25,000 for children of workers.", benefits: "Educational support, Career development", status: "Enrolling" },
    { id: 5, title: "Family Protection Scheme", desc: "Life insurance and health coverage for entire family members.", benefits: "Insurance coverage, Medical expenses", status: "Active" },
    { id: 6, title: "Skill Development Program", desc: "Free vocational training in various trades and industries.", benefits: "Skill upgradation, Better wages", status: "Ongoing" },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="page-title">Government Welfare & Social Security Schemes</h2>
      
      <div className="card" style={{ background: '#e3f2fd', borderLeft: '4px solid #1976d2', marginBottom: '20px' }}>
        <p style={{ margin: 0, color: '#0d47a1', fontWeight: '500' }}>
          <strong>Note:</strong> You are eligible for all schemes below. Click to view details and apply for maximum benefits.
        </p>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'20px'}}>
        {schemes.map((s) => (
          <div key={s.id} className="card" style={{borderLeft:'4px solid #ff9800', padding: '20px', display: 'flex', flexDirection: 'column'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
              <h3 style={{color: '#0f2a44', margin:'0', fontSize:'16px', flex: 1, fontWeight: '700'}}>{s.title}</h3>
              <span style={{
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '700',
                background: s.status === 'Active' ? '#e8f5e9' : '#fff3e0',
                color: s.status === 'Active' ? '#2e7d32' : '#e65100',
                whiteSpace: 'nowrap'
              }}>
                {s.status}
              </span>
            </div>
            
            <p style={{color: '#555', fontSize:'14px', lineHeight:'1.6', margin:'10px 0'}}>{s.desc}</p>
            
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '15px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #eee' }}>
              <strong style={{color: '#0f2a44'}}>Benefits:</strong> {s.benefits}
            </div>

            <button className="btn-modern btn-primary" style={{padding:'10px 16px', fontSize:'13px', width: '100%', fontWeight: '600'}}>
              View & Apply
            </button>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '30px', background: '#f0f7ff', borderLeft: '4px solid #0f2a44' }}>
        <h3>📞 Need Help?</h3>
        <p>Contact your nearest labor office or call the toll-free helpline <strong>155372</strong> for scheme details and assistance.</p>
      </div>
    </div>
  );
};

export default Schemes;