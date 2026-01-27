import React, { useState } from "react";
import "../../App.css";

const Support = () => {
  const [tickets, setTickets] = useState(JSON.parse(localStorage.getItem("supportTickets")) || []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ subject: "", category: "", description: "" });
  const [message, setMessage] = useState("");

  const faqItems = [
    { q: "How do I apply for a job?", a: "Go to Jobs section and click 'Apply Now' on any job. You can track applications in your profile." },
    { q: "How are payments processed?", a: "Payments are processed every Friday via bank transfer. Ensure your account details are verified." },
    { q: "How do I update my profile?", a: "Click on Profile in the sidebar and update your details. Save changes to sync with our system." },
    { q: "How do I file a grievance?", a: "Go to Grievance Portal and click 'Lodge New Complaint'. Our team will respond within 48 hours." },
    { q: "Can I enroll in multiple training courses?", a: "Yes! You can enroll in as many courses as you like. Complete them at your own pace." },
    { q: "How do I get my training certificate?", a: "Complete the course with 80% or higher score. Certificate will be available in your profile." }
  ];

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.category || !formData.description) {
      setMessage("Please fill all required fields");
      return;
    }

    const newTicket = {
      id: Date.now(),
      ...formData,
      date: new Date().toLocaleDateString(),
      status: "Open"
    };

    const updated = [...tickets, newTicket];
    setTickets(updated);
    localStorage.setItem("supportTickets", JSON.stringify(updated));
    setFormData({ subject: "", category: "", description: "" });
    setShowForm(false);
    setMessage("Ticket submitted successfully. Our team will respond within 24 hours.");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="page-title">Help & Support Center</h2>

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

      <div className="main-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Support Ticket Form */}
        <div className="card">
          {!showForm ? (
            <div>
              <h3 style={{ marginTop: 0 }}>Submit a Support Ticket</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>Need help? Our support team is here to assist you.</p>
              <button onClick={() => setShowForm(true)} className="btn-modern btn-orange" style={{ width: '100%' }}>
                📝 Create New Ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket}>
              <h3 style={{ marginTop: 0 }}>New Support Ticket</h3>
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
                  style={{width:'100%', padding:'15px', borderRadius:'12px', border:'2px solid #eee', background:'#f9f9f9', outline:'none'}}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Payment">Payment Issue</option>
                  <option value="Job Application">Job Application</option>
                  <option value="Profile">Profile Help</option>
                  <option value="Technical">Technical Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="input-modern">
                <textarea 
                  placeholder="Describe your issue..."
                  style={{width:'100%', padding:'15px', borderRadius:'12px', border:'2px solid #eee', height:'120px', resize:'vertical'}}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-modern btn-primary" style={{ flex: 1 }}>Submit Ticket</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-modern" style={{ flex: 1, background: '#ccc', color: '#333' }}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>📞 Contact Information</h3>
          <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#888', fontWeight: 'bold' }}>TOLL-FREE HELPLINE</p>
            <p style={{ margin: '0', fontSize: '20px', fontWeight: 'bold', color: '#d32f2f' }}>155372</p>
          </div>
          <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#888', fontWeight: 'bold' }}>EMAIL</p>
            <p style={{ margin: '0', color: '#0f2a44', textDecoration: 'underline' }}>support@rozgar.gov.in</p>
          </div>
          <div>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#888', fontWeight: 'bold' }}>RESPONSE TIME</p>
            <p style={{ margin: '0', color: '#666' }}>Within 24-48 hours (Mon-Sat, 9 AM - 6 PM)</p>
          </div>
        </div>
      </div>

      {/* Your Tickets */}
      {tickets.length > 0 && (
        <div className="card" style={{ marginTop: '30px' }}>
          <h3 style={{ marginTop: 0 }}>Your Support Tickets</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Subject</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{ticket.subject}</td>
                    <td style={{ padding: '10px', color: '#666' }}>{ticket.category}</td>
                    <td style={{ padding: '10px', color: '#888' }}>{ticket.date}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: '#fbc02d',
                        color: '#333'
                      }}>
                        {ticket.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="card" style={{ marginTop: '30px' }}>
        <h3 style={{ marginTop: 0 }}>❓ Frequently Asked Questions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {faqItems.map((item, idx) => (
            <div key={idx} style={{ padding: '15px', background: '#f5f5f5', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#333' }}>Q: {item.q}</p>
              <p style={{ margin: '0', color: '#666', fontSize: '13px', lineHeight: '1.5' }}>A: {item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Support;