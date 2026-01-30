import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../App.css";
import { API_URL } from "../../config";
import MapWithMarkers from "../../components/MapWithMarkers";
import { User, Star, MapPin, Send, CheckCircle, Grid, Map } from "lucide-react";

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("browse"); // 'browse' | 'requests'
  const [sentRequests, setSentRequests] = useState([]);

  // ... existing hooks

  useEffect(() => {
    fetchWorkers();
    if(currentUser?.id) fetchSentRequests();
  }, []);

  const fetchSentRequests = async () => {
    try {
      if(!currentUser.id) return;
      const res = await axios.get(`${API_URL}/api/hire-requests/contractor/${currentUser.id}`);
      setSentRequests(res.data);
    } catch(err) {
      console.error("Error fetching requests:", err);
    }
  };

  // ... existing handlers

  // Inside handleRequestSubmit success:
  // ...
  setSuccessMsg("Request Sent Successfully!");
  fetchSentRequests(); // Refresh list

  // ... existing render logic

  return (
    <div className="animate-fade-in p-6">
       {/* Top Navigation */}
       <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <button 
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'browse' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Browse Workers
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'requests' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            My Sent Requests ({sentRequests.length})
          </button>
       </div>

      {activeTab === 'browse' ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
               <h2 className="text-2xl font-bold text-gray-800">Browse Workers</h2>
               <p className="text-gray-500 text-sm">Find and request skilled labor for your projects.</p>
            </div>
            
            {/* View Toggle */}
            <div className="bg-gray-100 p-1 rounded-lg flex shadow-inner">
               <button 
                 onClick={() => setViewMode("grid")}
                 className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-800' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 <Grid size={16}/> Grid
               </button>
               <button 
                 onClick={() => setViewMode("map")}
                 className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition ${viewMode === 'map' ? 'bg-white shadow-sm text-blue-800' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 <Map size={16}/> Map View
               </button>
            </div>
          </div>
    
          {viewMode === 'map' ? (
             <div className="mb-8 animate-scale-in">
                <MapWithMarkers items={workers} type="worker" onItemClick={handleRequestClick} />
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {workers.map((w, index) => (
              <div key={w._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                 <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-blue-100 to-white mb-4 relative">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-sm relative z-10">
                       {w.profile_pic_url ? <img src={w.profile_pic_url} alt={w.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50"><User size={32} /></div>}
                    </div>
                    <div className="absolute bottom-1 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-20 animate-pulse"></div>
                 </div>
                 <h3 className="font-bold text-xl text-gray-800 mb-1 group-hover:text-blue-700 transition-colors">{w.name}</h3>
                 <p className="text-sm text-gray-500 flex items-center gap-1 mb-4 justify-center"><MapPin size={12} className="text-red-400" /> {w.location || "Location Unavailable"}</p>
                 <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-xs font-bold mb-5 shadow-sm border border-orange-100">
                   <Star size={12} fill="#ea580c" /> {w.rating} <span className="text-orange-400 font-normal">({w.review_count || 0} reviews)</span>
                 </div>
                 <div className="w-full pt-4 mb-4 border-t border-dashed border-gray-200">
                     <p className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest mb-2">Primary Skill</p>
                     <span className="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm">{w.skill || "General Labor"}</span>
                 </div>
                 <button onClick={() => handleRequestClick(w)} className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900 shadow-lg hover:shadow-slate-500/30 transition-all flex items-center justify-center gap-2 group-hover:scale-105 active:scale-95">
                   <Send size={16} className="group-hover:translate-x-1 transition-transform"/> Send Request
                 </button>
                 <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded">
                   <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Contact revealed after acceptance
                 </div>
              </div>
            ))}
            </div>
          )}
        </>
      ) : (
        <div className="animate-fade-in">
           <h2 className="text-2xl font-bold text-gray-800 mb-6">Sent Requests</h2>
           <div className="space-y-4">
              {sentRequests.length === 0 ? (
                 <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">You haven't sent any hire requests yet.</p>
                 </div>
              ) : (
                 sentRequests.map((req) => (
                    <div key={req._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition">
                       <div className="flex items-center gap-4 w-full">
                          <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                             <img src={req.worker_id?.profile_pic_url || "https://via.placeholder.com/64"} alt="Worker" className="w-full h-full object-cover"/>
                          </div>
                          <div>
                             <h3 className="text-lg font-bold text-gray-800">{req.worker_id?.name || "Unknown Worker"}</h3>
                             <p className="text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString()} • {req.job_type}</p>
                             {/* Status Badge */}
                             <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                             }`}>
                                {req.status}
                             </span>
                          </div>
                       </div>

                       {/* Reveal Contact Logic */}
                       <div className="w-full md:w-auto flex-shrink-0 text-right">
                          {req.status === 'accepted' ? (
                             <div className="bg-green-50 px-4 py-3 rounded-lg border border-green-100">
                                <p className="text-xs text-green-600 font-bold uppercase mb-1">Contact Revealed</p>
                                <a href={`tel:${req.worker_id?.phone}`} className="text-lg font-bold text-gray-800 flex items-center justify-end gap-2 hover:text-green-600">
                                   📞 {req.worker_id?.phone || "No Phone"}
                                </a>
                             </div>
                          ) : (
                             <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 opacity-60">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Contact Hidden</p>
                                <p className="text-sm font-medium text-gray-400">Wait for acceptance</p>
                             </div>
                          )}
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>
      )}

      {/* REQUEST MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-scale-in border border-gray-100 relative overflow-hidden">
             {/* Decorative Bg Blob */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>

            {!successMsg ? (
              <>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Request {selectedWorker?.name}</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">Send a formal work request. Your contact details and location will be shared with the worker <span className="font-bold text-gray-700">only after they accept</span>.</p>
                
                <form onSubmit={handleRequestSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Type of Work</label>
                    <div className="relative">
                       <select 
                         className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 appearance-none font-medium"
                         value={requestForm.job_type}
                         onChange={e => setRequestForm({...requestForm, job_type: e.target.value})}
                       >
                          <option>Daily Wage Labor</option>
                          <option>Full Time Contract</option>
                          <option>One-time Task</option>
                          <option>Consultation</option>
                       </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Message (Optional)</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none h-28 bg-gray-50 resize-none"
                      placeholder="Hi, I have a construction project in..."
                      value={requestForm.message}
                      onChange={e => setRequestForm({...requestForm, message: e.target.value})}
                    ></textarea>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-0.5"
                    >
                      Send Request
                    </button>
                  </div>
                </form>
              </>
            ) : (
               <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-lg shadow-green-200">
                     <CheckCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Request Sent!</h3>
                  <p className="text-gray-500">Waiting for worker acceptance.</p>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;