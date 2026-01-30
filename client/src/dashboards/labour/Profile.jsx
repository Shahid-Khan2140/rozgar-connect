import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { 
  Camera, Mail, Phone, MapPin, User, FileText, 
  Shield, Award, Edit2, Save, CheckCircle 
} from 'lucide-react';
import '../../App.css';
import { API_URL } from "../../config";

const Profile = () => {
    const { t, setUser: setUserContext } = useOutletContext();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);

  // --- 1. USER STATE ---
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    gender: "",
    aadhaarVerified: false,
    uan: "100900900900", 
    id: "XXXX-XXXX-1234",
    profilePic: null // This will hold the URL from DB
  });

  // --- 2. FETCH DATA FROM SERVER ON LOAD ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        
        if (storedUser?.email) {
          const res = await axios.post(`${API_URL}/api/get-user-details`, { 
            email: storedUser.email 
          });
          const data = res.data;
          
          setUser(prev => ({
            ...prev,
            name: data.name || "User",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            dob: data.dob ? data.dob.split('T')[0] : "", 
            gender: data.gender || "Male",
            // IMPORTANT: Use profile_pic_url from DB to persist image
            profilePic: data.profile_pic_url || null,
            skills: data.skills || (data.skill ? [data.skill] : [])
          }));
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // --- 3. HANDLE TEXT INPUT CHANGES ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // --- 4. HANDLE IMAGE UPLOAD (PERSISTENT) ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // A. Show immediate local preview
    const previewUrl = URL.createObjectURL(file);
    setUser(prev => ({ ...prev, profilePic: previewUrl }));

    // B. Upload to Server
    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("email", user.email); // Use email to identify user

    try {
      const res = await axios.post(`${API_URL}/api/upload-profile-pic`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // C. Update state with actual Server URL (so it stays on refresh)
      if (res.data.imageUrl) {
        setUser(prev => ({ ...prev, profilePic: res.data.imageUrl }));
        alert("✅ Profile Picture Updated!");
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("❌ Failed to save profile picture to server.");
    }
  };

  // --- 5. SAVE TEXT DATA TO DB ---
  const handleSave = async () => {
    try {
      await axios.post(`${API_URL}/api/update-full-profile`, {
        email: user.email,
        name: user.name,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
        skill: user.skills?.[0] || "", // updates legacy field for backward compatibility
        skills: user.skills // updates new array field (need to update backend to support this if not already)
      });
      
      // Update global context so Layout and other components reflect changes immediately
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedGlobalUser = { ...currentUser, name: user.name };
      localStorage.setItem("user", JSON.stringify(updatedGlobalUser));
      setUserContext(updatedGlobalUser); // Update global state
      
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile. Please try again.");
    }
  };

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  if (loading) return <div style={{padding:'40px', textAlign:'center'}}>Loading Profile...</div>;

  return (
    <div className="profile-page animate-fade-in">
      
      {/* --- HEADER BANNER --- */}
      <div className="profile-header-card">
        <div className="header-content">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img 
                src={user.profilePic || defaultAvatar} 
                alt="Profile"
                className="main-avatar" 
              />
              <button 
                className="camera-btn" 
                onClick={() => fileInputRef.current.click()}
                title="Change Profile Picture"
              >
                <Camera size={16} color="white" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                hidden 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>
            <div className="user-text">
              <h2 className="user-name">
                {user.name} 
                {user.aadhaarVerified && <CheckCircle size={18} fill="#4caf50" color="white" className="verified-badge" />}
              </h2>
              <p className="user-id"><Shield size={12} /> Citizen ID: {user.id}</p>
              <p className="member-since">Member since January 2023</p>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        
        {/* --- LEFT SIDEBAR (Contact Info) --- */}
        <div className="profile-sidebar card">
          <div className="sidebar-group">
            <h4 className="sidebar-heading">Contact Details</h4>
            
            <div className="info-row">
              <Mail size={18} className="icon-muted" />
              <div>
                <label>Email</label>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="info-row">
              <Phone size={18} className="icon-muted" />
              <div>
                <label>Phone</label>
                <p>{user.phone}</p>
              </div>
            </div>

            <div className="info-row">
              <MapPin size={18} className="icon-muted" />
              <div>
                <label>Address</label>
                <p className="address-text">{user.address || "Not set"}</p>
              </div>
            </div>
          </div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-group">
            <h4 className="sidebar-heading">Official Identifiers</h4>
            <div className="info-row">
              <Shield size={18} className="icon-muted" />
              <div>
                <label>Aadhaar Status</label>
                <p className="status-verified">
                  {user.aadhaarVerified ? "✅ Verified" : "⚠️ Pending"}
                </p>
              </div>
            </div>
            <div className="info-row">
              <FileText size={18} className="icon-muted" />
              <div>
                <label>UAN (EPF)</label>
                <p>{user.uan}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT MAIN CONTENT (Tabs & Form) --- */}
        <div className="profile-main card">
          
          {/* Tabs Navigation */}
          <div className="custom-tabs">
            {['personal', 'documents', 'schemes', 'security'].map(tab => (
              <button 
                key={tab}
                className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* TAB 1: PERSONAL DETAILS FORM */}
          {activeTab === 'personal' && (
            <div className="tab-panel">
              <div className="panel-header">
                <h3>Basic Information</h3>
                <button 
                  className={`edit-btn ${isEditing ? 'save' : ''}`} 
                  onClick={() => {
                    if (isEditing) handleSave(); // Save if currently editing
                    else setIsEditing(true);     // Enable edit mode
                  }}
                >
                  {isEditing ? <><Save size={14} /> Save</> : <><Edit2 size={14} /> Edit</>}
                </button>
              </div>

              <div className="form-layout">
                {/* Full Name */}
                <div className="form-group">
                  <label>{t?.fullName || "Full Name"}</label>
                  <input 
                    type="text" name="name" 
                    value={user.name} onChange={handleChange} 
                    disabled={!isEditing} 
                    className="gov-input"
                  />
                </div>

                {/* Email (Read-Only usually, but editable here if needed) */}
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" name="email" 
                    value={user.email} 
                    disabled={true} // Email is unique ID, kept disabled usually
                    className="gov-input"
                    style={{backgroundColor: '#f9f9f9', cursor: 'not-allowed'}}
                  />
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" name="phone" 
                    value={user.phone} onChange={handleChange} 
                    disabled={!isEditing} 
                    className="gov-input"
                  />
                </div>

                {/* DOB */}
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input 
                    type="date" name="dob" 
                    value={user.dob} onChange={handleChange} 
                    disabled={!isEditing} 
                    className="gov-input"
                  />
                </div>

                {/* Gender */}
                <div className="form-group">
                  <label>Gender</label>
                  <select 
                    name="gender" 
                    value={user.gender} onChange={handleChange} 
                    disabled={!isEditing} 
                    className="gov-input"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Address */}
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea 
                    name="address" rows="3"
                    value={user.address} onChange={handleChange} 
                    disabled={!isEditing} 
                    className="gov-input"
                  ></textarea>
                </div>

                {/* Skills Section */}
                <div className="form-group full-width">
                  <label>Professional Skills</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {user.skills?.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        {skill}
                        {isEditing && (
                          <button 
                            onClick={() => {
                              const newSkills = user.skills.filter((_, i) => i !== index);
                              setUser({...user, skills: newSkills});
                            }}
                            className="bg-blue-200 hover:bg-red-200 text-blue-800 hover:text-red-700 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         className="gov-input flex-1" 
                         placeholder="Add a skill (e.g. Masonry)"
                         onKeyDown={(e) => {
                           if(e.key === 'Enter') {
                             e.preventDefault();
                             if(e.currentTarget.value.trim()) {
                               setUser({...user, skills: [...(user.skills || []), e.currentTarget.value.trim()]});
                               e.currentTarget.value = "";
                             }
                           }
                         }}
                       />
                       <button 
                         className="bg-blue-600 text-white px-4 rounded-lg"
                         onClick={(e) => {
                            const input = e.currentTarget.previousSibling;
                            if(input.value.trim()) {
                               setUser({...user, skills: [...(user.skills || []), input.value.trim()]});
                               input.value = "";
                            }
                         }}
                       >
                         Add
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="tab-panel">
              <h3>KYC Documents</h3>
              <div className="doc-card">
                <div className="doc-icon"><FileText color="#2e7d32" /></div>
                <div className="doc-info">
                  <h4>Aadhaar Card</h4>
                  <p>Status: <strong>Verified</strong></p>
                </div>
                <button className="btn-small">View</button>
              </div>
              <div className="doc-card">
                <div className="doc-icon"><FileText color="#1565c0" /></div>
                <div className="doc-info">
                  <h4>PAN Card</h4>
                  <p>Status: <strong>Verified</strong></p>
                </div>
                <button className="btn-small">View</button>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMES */}
          {activeTab === 'schemes' && (
            <div className="tab-panel">
              <h3>My Schemes</h3>
              <div className="scheme-box active">
                <div className="scheme-header">
                  <Award color="#e65100" />
                  <span className="badge-active">Active</span>
                </div>
                <h4>PM Kaushal Vikas Yojana</h4>
                <p>Enrolled on 15th March 2023</p>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'security' && (
            <div className="tab-panel">
              <h3>Security Settings</h3>
              <div className="doc-card">
                <div className="doc-icon"><Shield color="#0f2a44" /></div>
                <div className="doc-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>Status: <strong>Enabled</strong></p>
                </div>
                <button className="btn-small">Manage</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;