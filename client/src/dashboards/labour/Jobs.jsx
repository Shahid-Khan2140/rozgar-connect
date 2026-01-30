import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import MapWithMarkers from "../../components/MapWithMarkers";
import { Search, MapPin, Briefcase, IndianRupee, Filter, Bookmark, MessageCircle, Star, Grid, Map } from "lucide-react";
import "../../App.css";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("search"); // 'search', 'saved', 'applied'
  const [viewMode, setViewMode] = useState("grid");
  const [voiceListening, setVoiceListening] = useState(false);
  const [reviewModal, setReviewModal] = useState({ show: false, jobId: null, contractorId: null });
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const [filters, setFilters] = useState({
    query: "",
    location: "",
    category: "All",
    wage_min: "",
  });
  const [message, setMessage] = useState("");
  const [appliedJobs, setAppliedJobs] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchJobs();
    if(user) {
      fetchMyApplications();
      fetchSavedJobs();
    }
  }, [activeTab]);

  const handleReviewSubmit = async () => {
     try {
        await axios.post(`${API_URL}/api/reviews`, {
           job_id: reviewModal.jobId,
           reviewer_id: user.id,
           reviewee_id: reviewModal.contractorId, 
           rating: rating,
           comment: reviewText,
           role: 'labour'
        });
        setMessage("Review Submitted Successfully!");
        setReviewModal({ show: false, jobId: null, contractorId: null });
        setTimeout(() => setMessage(""), 3000);
     } catch(err) {
        setMessage("Failed to submit review");
     }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      if(activeTab === 'saved') {
         if(!user) return;
         const res = await axios.get(`${API_URL}/api/users/saved-jobs/${user.id}`);
         setJobs(res.data);
      } else {
         const { query, location, category, wage_min } = filters;
         const params = {};
         if (query) params.query = query;
         if (location) params.location = location;
         if (category !== "All") params.category = category;
         if (wage_min) params.wage_min = wage_min;

         const endpoint = Object.keys(params).length > 0 ? "/api/jobs/search" : "/api/jobs/feed";
         const res = await axios.get(`${API_URL}${endpoint}`, { params });
         setJobs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    if(!user) return;
    try {
      const res = await axios.get(`${API_URL}/api/users/saved-jobs/${user.id}`);
      const ids = res.data.map(j => j._id || j.id);
      setSavedJobs(ids);
    } catch(err) { console.error(err); }
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice search not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setVoiceListening(true);
    recognition.onend = () => setVoiceListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFilters(prev => ({ ...prev, query: transcript }));
      // Auto trigger search
      setTimeout(() => fetchJobs(), 500);
    };
    recognition.start();
  };

  const fetchMyApplications = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_URL}/api/labour/applications/${user.id}`);
      // Store full application objects for the 'Applied' tab
      setAppliedJobs(res.data); 
    } catch (err) {
      console.error("Error fetching applications", err);
    }
  };

  // Helper to check if applied
  const isApplied = (jobId) => {
    return appliedJobs.some(app => (app.job_id?._id || app.job_id) === jobId);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleSaveJob = async (jobId) => {
    if(!user) return alert("Please login");
    try {
      if(savedJobs.includes(jobId)) {
         await axios.delete(`${API_URL}/api/users/saved-jobs/${user.id}/${jobId}`);
         setSavedJobs(prev => prev.filter(id => id !== jobId));
         setMessage("Job removed from saved");
      } else {
         await axios.post(`${API_URL}/api/users/saved-jobs`, { userId: user.id, jobId });
         setSavedJobs(prev => [...prev, jobId]);
         setMessage("Job Saved!");
      }
      setTimeout(() => setMessage(""), 2000);
    } catch(err) { console.error(err); }
  };

  const handleApply = async (jobId) => {
     if(!user) return alert("Login required");
     try {
        await axios.post(`${API_URL}/api/labour/apply`, { worker_id: user.id, job_id: jobId });
        setMessage("Applied Successfully!");
        fetchMyApplications(); // Refresh
        setTimeout(() => setMessage(""), 3000);
     } catch(err) {
        alert(err.response?.data?.error || "Failed to apply");
     }
  };

  const handleChat = (contractor) => {
     if(contractor?.phone) {
        window.open(`https://wa.me/${contractor.phone}`, '_blank');
     } else {
        alert("Contractor contact hidden until hired.");
     }
  };
  
  return (
    <div className="animate-fade-in p-6">
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'search' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Find Jobs
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'saved' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Saved ({savedJobs.length})
        </button>
        <button 
          onClick={() => setActiveTab('applied')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'applied' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          My Applications
        </button>
      </div>

       {/* View Toggle (Only for Search/Saved) */}
        {activeTab !== 'applied' && (
           <div className="flex justify-end mb-4">
            <div className="bg-gray-100 p-1 rounded-lg flex shadow-inner">
             <button 
               onClick={() => setViewMode("grid")}
               className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-800' : 'text-gray-500 hover:text-gray-700'}`}
             >
               <Grid size={14}/> Grid
             </button>
             <button 
               onClick={() => setViewMode("map")}
               className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition ${viewMode === 'map' ? 'bg-white shadow-sm text-blue-800' : 'text-gray-500 hover:text-gray-700'}`}
             >
               <Map size={14}/> Map
             </button>
            </div>
          </div>
        )}

      {/* Search Bar (Only visible in search tab) */}
      {activeTab === 'search' && (
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="query"
              placeholder="Search keywords..."
              className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.query}
              onChange={handleFilterChange}
            />
            {/* Voice Search Button */}
            <button 
              type="button"
              onClick={startVoiceSearch}
              className={`absolute right-2 top-2 p-1 rounded-full transition ${voiceListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-blue-600'}`}
              title="Voice Search"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            </button>
          </div>
          {/* ... other inputs ... */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="location"
              placeholder="Location..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <select
              name="category"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="All">All Categories</option>
              <option value="Construction">Construction</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Driving">Driving</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Farming">Farming</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" /> Filter
          </button>
        </form>
      )}

      {/* Message Toast */}
      {message && (
        <div className={`p-3 mb-4 rounded-md ${message.includes("Success") || message.includes("Saved") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}

      {/* APPLIED JOBS VIEW */}
      {activeTab === 'applied' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appliedJobs.length === 0 ? (
               <div className="col-span-full text-center py-10 bg-white rounded-lg border border-dashed text-gray-500">
                  You haven't applied to any jobs yet.
               </div>
            ) : (
               appliedJobs.map(app => {
                  const job = app.job_id;
                  return (
                    <div key={app._id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                       <div>
                          <h3 className="font-bold text-gray-800">{job.title || "Job Unavailable"}</h3>
                          <p className="text-sm text-gray-500 mb-1">{job.contractor_id?.name || "Contractor"}</p>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                             app.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                             app.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                             'bg-yellow-100 text-yellow-700'
                          }`}>
                             {app.status === 'accepted' ? 'Hired 🎉' : app.status}
                          </span>
                       </div>
                       <div className="text-right">
                          <div className="font-bold text-gray-800">₹{job.wage}</div>
                          <div className="text-xs text-gray-400">{new Date(app.applied_at).toLocaleDateString()}</div>
                          
                          {/* Chat if Hired */}
                          {app.status === 'accepted' && job.status !== 'completed' && (
                             <button 
                               onClick={() => handleChat(job.contractor_id)}
                               className="mt-2 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
                             >
                                <MessageCircle size={12}/> Chat
                             </button>
                          )}

                          {/* Rate if Completed */}
                          {job.status === 'completed' && app.status === 'accepted' && (
                             <button 
                               onClick={() => setReviewModal({ show: true, jobId: job._id || job.id, contractorId: job.contractor_id._id || job.contractor_id })}
                               className="mt-2 text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 flex items-center gap-1"
                             >
                                <Star size={12}/> Rate
                             </button>
                          )}
                       </div>
                    </div>
                  );
               })
            )}
         </div>
      )}

      {/* REVIEW MODAL */}
      {reviewModal.show && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm animate-scale-in">
               <h3 className="text-xl font-bold text-gray-800 mb-4">Rate Contractor</h3>
               <div className="flex gap-2 justify-center mb-6">
                  {[1, 2, 3, 4, 5].map(star => (
                     <button key={star} onClick={() => setRating(star)} className="transition transform hover:scale-110">
                        <Star size={32} fill={star <= rating ? "#eab308" : "none"} className={star <= rating ? "text-yellow-500" : "text-gray-300"} />
                     </button>
                  ))}
               </div>
               <textarea 
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-yellow-500 outline-none mb-4"
                  rows="3"
                  placeholder="Share your experience working with this contractor..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
               ></textarea>
               <div className="flex gap-3">
                  <button onClick={() => setReviewModal({ show: false, jobId: null, contractorId: null })} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
                  <button onClick={handleReviewSubmit} className="flex-1 py-2 rounded-lg bg-yellow-500 text-white font-bold hover:bg-yellow-600">Submit Review</button>
               </div>
            </div>
         </div>
      )}

      {/* ACTIVE JOBS LIST (Search Results or Saved) */}
      {activeTab !== 'applied' && (
        <>
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading jobs...</p>
          ) : viewMode === 'map' ? (
             <div className="mb-8 animate-scale-in">
                <MapWithMarkers items={jobs} type="job" onItemClick={(job) => handleApply(job._id || job.id)} />
                <p className="text-center text-xs text-gray-400 mt-2">Click markers to view details and apply.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job._id || job.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition relative group">
                    {/* Save Button */}
                    <button 
                      onClick={() => handleSaveJob(job._id || job.id)}
                      className={`absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition ${savedJobs.includes(job._id || job.id) ? 'text-blue-600' : 'text-gray-400'}`}
                      title="Save Job"
                    >
                      <Bookmark size={18} fill={savedJobs.includes(job._id || job.id) ? "currentColor" : "none"} />
                    </button>

                    <div className="flex justify-between items-start mb-2 pr-10">
                      <h3 className="font-bold text-lg text-gray-800">{job.title}</h3>
                      <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                        {job.wage_type || 'daily'}
                      </span>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{job.description}</p>
                    
                    <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" /> {job.location || "Remote"}
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-gray-400" /> ₹{job.wage}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" /> {job.category}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                             {job.contractor_id?.profile_pic_url ? (
                                <img src={job.contractor_id.profile_pic_url} alt="C" className="w-full h-full object-cover" />
                             ) : (
                                <span className="flex items-center justify-center h-full text-xs font-bold text-gray-500">C</span>
                             )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-semibold">{job.contractor_id?.name || "Contractor"}</span>
                          </div>
                       </div>

                      <button
                        onClick={() => handleApply(job._id || job.id)}
                        disabled={isApplied(job._id || job.id)}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                          isApplied(job._id || job.id)
                            ? "bg-green-100 text-green-600 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isApplied(job._id || job.id) ? "Applied" : "Apply Now"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">No jobs found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Jobs;