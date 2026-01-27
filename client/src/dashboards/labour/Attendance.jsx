import React, { useState, useEffect } from "react";
import "../../App.css";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [todayDate] = useState(new Date().toLocaleDateString());

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUserEmail(user?.email);
    
    // Load attendance from localStorage (mock data)
    const savedAttendance = JSON.parse(localStorage.getItem("attendance")) || [
      { id: 1, name: "Ramesh Kumar", role: "Mason", status: "Present", date: todayDate },
      { id: 2, name: "Suresh Patel", role: "Helper", status: "Absent", date: todayDate },
      { id: 3, name: "Anita Devi", role: "Helper", status: "Present", date: todayDate },
      { id: 4, name: "Mahesh Bhai", role: "Carpenter", status: "Present", date: todayDate },
    ];
    setAttendanceData(savedAttendance);
  }, [todayDate]);

  const handleStatusChange = (id, newStatus) => {
    const updated = attendanceData.map(item =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    setAttendanceData(updated);
    localStorage.setItem("attendance", JSON.stringify(updated));
  };

  const handleDownloadReport = () => {
    const reportText = attendanceData
      .map(a => `${a.name} (${a.role}) - ${a.status}`)
      .join("\n");
    const blob = new Blob([`Attendance Report - ${todayDate}\n\n${reportText}`], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${todayDate}.txt`;
    a.click();
  };

  return (
    <div className="animate-fade-in">
      <h2 className="page-title">Attendance & Presence Management</h2>
      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'center', paddingBottom: '15px', borderBottom: '2px solid #f0f0f0'}}>
          <div>
            <h3 style={{margin:'0 0 5px 0', fontSize: '16px', fontWeight: '700', color: '#0f2a44'}}>Attendance Record</h3>
            <p style={{margin: 0, fontSize: '13px', color: '#666'}}>Last Updated: {todayDate}</p>
          </div>
          <button onClick={handleDownloadReport} className="btn-modern btn-green" style={{width:'auto', padding:'10px 20px', fontSize:'13px', fontWeight: '600'}}>Download Report</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Worker Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((w) => (
              <tr key={w.id}>
                <td style={{fontWeight:'500'}}>{w.name}</td>
                <td style={{color:'#546e7a'}}>{w.role}</td>
                <td>
                  <span style={{
                    padding:'4px 12px', borderRadius:'4px', fontSize:'12px', fontWeight:'600',
                    background: w.status === 'Present' ? '#e8f5e9' : '#ffebee',
                    color: w.status === 'Present' ? '#2e7d32' : '#c62828'
                  }}>
                    {w.status}
                  </span>
                </td>
                <td>
                  <select 
                    value={w.status}
                    onChange={(e) => handleStatusChange(w.id, e.target.value)}
                    style={{padding:'5px', borderRadius:'4px', border:'1px solid #ccc', cursor:'pointer'}}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;