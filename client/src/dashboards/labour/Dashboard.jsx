import React, { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { API_URL } from "../../config";
import { Briefcase, IndianRupee, Clock, Award, Star, Search, MapPin } from "lucide-react";

const Dashboard = () => {
    const { t } = useOutletContext();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [stats, setStats] = useState({
    applications: 0,
    accepted: 0,
    earnings: 0
  });
  const [jobs, setJobs] = useState([]);
  /* New State for Requests */
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleRequestAction = async (requestId, status) => {
    try {
      await axios.put(`${API_URL}/api/hire-requests/${requestId}/status`, { status });
      // Refresh requests
      const res = await axios.get(`${API_URL}/api/hire-requests/worker/${user.id}`);
      setRequests(res.data);
      if(status === 'accepted') alert("Request Accepted! Contact details revealed.");
    } catch(err) {
      alert("Action Failed");
    }
  };

  // Fetch fresh user data on mount to ensure name update
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.email) return;
        const res = await axios.post(`${API_URL}/api/get-user-details`, { email: user.email });
        if (res.data) {
          setUser(prev => ({ ...prev, name: res.data.name }));
          // Update local storage to keep it in sync
          const stored = JSON.parse(localStorage.getItem("user"));
          localStorage.setItem("user", JSON.stringify({ ...stored, name: res.data.name }));
        }
      } catch (err) {
        console.error("Dashboard user sync failed", err);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(!user?.id) return;
        
        // 1. Fetch Applications (to calc stats)
        const appsRes = await axios.get(`${API_URL}/api/labour/applications/${user.id}`);
        const apps = appsRes.data;
        
        const accepted = apps.filter(a => a.status === 'accepted').length;
        
        // Mock Earnings (or calc based on completed jobs wage)
        const earnings = apps
           .filter(a => a.status === 'accepted') // Ideally 'completed'
           .reduce((sum, a) => sum + (a.job_id?.wage || 0), 0);

        setStats({
          applications: apps.length,
          accepted: accepted,
          earnings: earnings
        });

        // 2. Fetch Job Feed for "Recommended"
        const jobsRes = await axios.get(`${API_URL}/api/jobs/feed`);
        setJobs(jobsRes.data.slice(0, 4)); // Top 4

        // 3. Fetch Job Invites/Requests
        try {
           const reqRes = await axios.get(`${API_URL}/api/hire-requests/worker/${user.id}`);
           setRequests(reqRes.data);
        } catch(e) { console.error("Failed to fetch requests", e); }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="animate-fade-in p-6">
      
      {/* 1. Welcome Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-8 text-white mb-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">{user?.name ? `${t?.hello || "Hello"}, ${user.name}!` : `${t?.hello || "Hello"}!`}</h2>
          <p className="text-blue-100 max-w-xl">
             You have {stats.accepted > 0 ? `${stats.accepted} active jobs` : "new opportunities"} waiting for you. 
             Keep your profile updated to get more offers.
          </p>
          <button 
             onClick={() => window.location.href='/labour/jobs'}
             className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition shadow-md inline-flex items-center gap-2"
          >
             <Search size={18}/> Find Jobs
          </button>
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* 2. Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
               <Briefcase size={24}/>
            </div>
            <div>
               <div className="text-2xl font-bold text-gray-800">{stats.applications}</div>
               <div className="text-sm text-gray-500">Jobs Applied</div>
            </div>
         </div>
         
         <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
               <Award size={24}/>
            </div>
            <div>
               <div className="text-2xl font-bold text-gray-800">{stats.accepted}</div>
               <div className="text-sm text-gray-500">Hired Jobs</div>
            </div>
         </div>

         <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
               <IndianRupee size={24}/>
            </div>
            <div>
               <div className="text-2xl font-bold text-gray-800">₹{stats.earnings.toLocaleString()}</div>
               <div className="text-sm text-gray-500">Total Earnings (Est.)</div>
            </div>
         </div>
      </div>



  {/* 2.5 New Requests Section */}
  {requests.length > 0 && (
     <div className="mb-8 animate-fade-in">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
           <span className="relative flex h-4 w-4">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
           </span>
           Incoming Work Requests
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {requests.map((req, index) => (
              <div 
                key={req._id} 
                className={`p-6 rounded-xl border-l-4 shadow-sm transition-all duration-300 hover:shadow-md animate-slide-up ${
                 req.status === 'pending' ? 'bg-white border-yellow-400' : 
                 req.status === 'accepted' ? 'bg-white border-green-500' : 'bg-gray-50 border-gray-300 opacity-70'
              }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-gray-100 p-0.5 border border-gray-200">
                          <img src={req.contractor_id?.profile_pic_url || "https://via.placeholder.com/48"} className="w-full h-full object-cover rounded-full"/>
                       </div>
                       <div>
                          <p className="font-bold text-lg text-gray-800">{req.contractor_id?.name || "Contractor"}</p>
                          <p className="text-xs text-gray-500 font-medium">{new Date(req.created_at).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                         req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                         req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {req.status === 'pending' ? 'Action Required' : req.status}
                    </span>
                 </div>
                 
                 <div className="mb-6 pl-16">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">Looking For</p>
                    <p className="text-lg font-semibold text-blue-900 mb-3">{req.job_type}</p>
                    {req.message && (
                       <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-600 italic text-sm relative">
                          <span className="absolute -top-2 left-4 text-2xl text-gray-300">"</span>
                          {req.message}
                       </div>
                    )}
                 </div>

                 {req.status === 'pending' && (
                    <div className="flex gap-3 pl-16">
                       <button 
                         onClick={() => handleRequestAction(req._id, 'rejected')}
                         className="flex-1 bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 hover:text-red-600 transition"
                       >
                          Decline
                       </button>
                       <button 
                         onClick={() => handleRequestAction(req._id, 'accepted')}
                         className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-0.5"
                       >
                          Accept & Connect
                       </button>
                    </div>
                 )}

                 {req.status === 'accepted' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl animate-fade-in">
                       <p className="text-xs font-bold text-green-700 uppercase mb-2">Contractor Details Revealed</p>
                       <div className="flex flex-col gap-2">
                          <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                             <MapPin size={16} className="text-green-600"/> 
                             {req.contractor_id?.location || "Location shared"}
                          </p>
                          <a href="#" className="text-sm font-bold text-green-700 flex items-center gap-2 hover:underline">
                             <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs">📞</div> 
                             View Contact Number
                          </a>
                       </div>
                    </div>
                 )}
              </div>
           ))}
        </div>
     </div>
  )}

  {/* 3. Recommended Jobs Section (Existing) */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
     <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Star className="text-yellow-500" fill="#eab308"/> Recommended For You
               </h3>
               <a href="/labour/jobs" className="text-blue-600 text-sm font-semibold hover:underline">View All</a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {jobs.map(job => (
                  <div key={job._id || job.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition cursor-pointer group">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                           <div className="font-bold text-gray-800 group-hover:text-blue-600 transition">{job.title}</div>
                           <div className="text-xs text-gray-500">{job.contractor_id?.name || "Contractor"}</div>
                        </div>
                        <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded font-bold">₹{job.wage}</span>
                     </div>
                     <div className="flex items-center gap-4 text-xs text-gray-500 mt-4">
                        <span className="flex items-center gap-1"><MapPin size={12}/> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock size={12}/> {new Date(job.created_at).toLocaleDateString()}</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* 4. Right Sidebar: Profile Status */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
            <h3 className="font-bold text-gray-800 mb-4">Profile Strength</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
               <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '70%'}}></div>
            </div>
            <p className="text-xs text-gray-500 mb-6">Complete your profile to getting 2x more job offers.</p>

            <h3 className="font-bold text-gray-800 mb-4">Your Skills</h3>
            <div className="flex flex-wrap gap-2 mb-6">
               {user?.skill && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">{user.skill}</span>}
               <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">+ Add Skill</span>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
               <h4 className="text-sm font-bold text-orange-800 mb-1">Safety First!</h4>
               <p className="text-xs text-orange-700">Always verify job location and discuss payment terms before starting work.</p>
            </div>
         </div>
      </div>

    </div>
  );
};

export default Dashboard;