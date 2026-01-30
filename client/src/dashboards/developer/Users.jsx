import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../App.css";
import { API_URL } from "../../config";

const Users = () => {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch(err) {
      alert("Failed to delete user");
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="page-title">User Management</h2>
      <div className="card" style={{overflowX: 'auto'}}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Contact</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>#{u.id}</td>
                <td className="font-bold">{u.name || "N/A"}</td>
                <td>
                  <span style={{
                    padding:'4px 8px', borderRadius:'4px', fontSize:'12px', fontWeight:'bold',
                    background: u.role === 'contractor' ? '#e3f2fd' : (u.role === 'developer' ? '#f3e5f5' : '#e8f5e9'),
                    color: u.role === 'contractor' ? '#1565c0' : (u.role === 'developer' ? '#7b1fa2' : '#2e7d32')
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td>
                  {u.email}<br/>
                  <small className="text-secondary">{u.phone}</small>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  {u.role !== 'developer' && (
                    <button onClick={() => handleDelete(u.id)} className="btn-modern" style={{background:'#d32f2f', padding:'5px 10px', fontSize:'12px', width:'auto'}}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
