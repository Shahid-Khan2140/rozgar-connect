import React, { useState } from "react";
import "../../App.css";

const Payments = () => {
  const [filter, setFilter] = useState("all");

  const paymentHistory = [
    { id: 1, date: "2026-01-15", description: "Mason Work - Construction", amount: 1500, status: "Completed", method: "Bank Transfer" },
    { id: 2, date: "2026-01-14", description: "Helper Work - Farm Labor", amount: 800, status: "Completed", method: "Bank Transfer" },
    { id: 3, date: "2026-01-13", description: "Electrical Work - Installation", amount: 2000, status: "Pending", method: "Bank Transfer" },
    { id: 4, date: "2026-01-10", description: "Plumbing Assistance", amount: 1200, status: "Completed", method: "Bank Transfer" },
    { id: 5, date: "2026-01-08", description: "Carpenter Work", amount: 1800, status: "Completed", method: "Bank Transfer" },
  ];

  const totalEarnings = paymentHistory.reduce((sum, p) => p.status === "Completed" ? sum + p.amount : sum, 0);
  const pendingAmount = paymentHistory.reduce((sum, p) => p.status === "Pending" ? sum + p.amount : sum, 0);
  
  const filteredPayments = filter === "all" ? paymentHistory : paymentHistory.filter(p => p.status === filter);

  return (
    <div className="animate-fade-in">
      <h2 className="page-title">Wage Payment & Settlement Records</h2>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <h3>Total Earnings</h3>
          <p className="stat-number">₹{totalEarnings}</p>
        </div>
        <div className="stat-card orange">
          <h3>Pending Amount</h3>
          <p className="stat-number">₹{pendingAmount}</p>
        </div>
        <div className="stat-card green">
          <h3>Total Transactions</h3>
          <p className="stat-number">{paymentHistory.length}</p>
        </div>
      </div>

      {/* Filter & Details */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700', color: '#0f2a44'}}>Payment Records</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>
          <button 
            onClick={() => setFilter("all")}
            style={{
              padding: '10px 20px',
              background: filter === "all" ? '#ff9800' : '#f5f5f5',
              color: filter === "all" ? 'white' : '#666',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            All Payments
          </button>
          <button 
            onClick={() => setFilter("Completed")}
            style={{
              padding: '10px 20px',
              background: filter === "Completed" ? '#2e7d32' : '#f5f5f5',
              color: filter === "Completed" ? 'white' : '#666',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            Completed
          </button>
          <button 
            onClick={() => setFilter("Pending")}
            style={{
              padding: '8px 16px',
              background: filter === "Pending" ? '#fbc02d' : '#eee',
              color: filter === "Pending" ? '#333' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Pending
          </button>
        </div>

        <table style={{ width: '100%' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ textAlign: 'left', padding: '12px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Description</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Method</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', color: '#666' }}>{payment.date}</td>
                <td style={{ padding: '12px', fontWeight: '500' }}>{payment.description}</td>
                <td style={{ padding: '12px', color: '#888' }}>{payment.method}</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#2e7d32' }}>₹{payment.amount}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: payment.status === 'Completed' ? '#e8f5e9' : '#fff3e0',
                    color: payment.status === 'Completed' ? '#2e7d32' : '#e65100'
                  }}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Methods Info */}
      <div className="card" style={{ marginTop: '20px', background: '#f0f7ff', borderLeft: '4px solid #0f2a44' }}>
        <h3>💳 Payment Information</h3>
        <p>Payments are processed every Friday. Ensure your bank account details are updated in your profile for timely credit.</p>
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>Account verified on: 2026-01-01</p>
      </div>
    </div>
  );
};

export default Payments;