import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import { Search, MapPin, Briefcase, IndianRupee, Filter, Bookmark, MessageCircle } from "lucide-react";
import "../../App.css";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("search"); // 'search' or 'saved'
  
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
  }, [activeTab]); // Refetch when tab changes

  const fetchJobs = async () => {
    setLoading(true);
    try {
      if(activeTab === 'saved') {
         // Fetch saved jobs
         if(!user) return;
         const res = await axios.get(`${API_URL}/api/users/saved-jobs/${user.id}`);
         setJobs(res.data);
      } else {
         // Search/Feed
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

  const fetchMyApplications = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_URL}/api/labour/applications/${user.id}`);
      setAppliedJobs(res.data.map(app => app.job_id._id || app.job_id));
    } catch (err) {
      console.error("Error fetching applications", err);
    }
  };

  const handleApply = async (jobId) => {
    if (!user) return setMessage("Please login to apply");
    
    try {
      // Find job details for contractor ID
      const job = jobs.find(j => (j._id || j.id) === jobId);
      if(!job) return;

      await axios.post(`${API_URL}/api/jobs/apply`, {
        job_id: jobId,
        worker_id: user.id,
        contractor_id: job.contractor_id._id || job.contractor_id,
        cover_letter: "I am interested in this job."
      });
      setMessage("Application Submitted Successfully!");
      setAppliedJobs([...appliedJobs, jobId]);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Application Failed");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSaveJob = async (jobId) => {
    if (!user) return;
    try {
      await axios.post(`${API_URL}/api/users/save-job`, {
        user_id: user.id,
        job_id: jobId
      });
      setSavedJobs([...savedJobs, jobId]);
      setMessage("Job Saved to your collection!");
      setTimeout(() => setMessage(""), 2000);
    } catch(err) {
      console.error(err);
    }
  };

  const handleChat = (contractor) => {
    const phone = contractor.phone || "919999999999";
    const text = "Hello, I saw your job posting on Rozgar Connect.";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="animate-fade-in p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Briefcase className="text-blue-600" /> Find Jobs
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'search' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          All Jobs
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'saved' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Saved Jobs ({savedJobs.length})
        </button>
      </div>

      {/* Search Bar (Only visible in search tab) */}
      {activeTab === 'search' && (
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="query"
              placeholder="Search keywords..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.query}
              onChange={handleFilterChange}
            />
          </div>
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
            <Filter className="w-4 h-4" /> Filter Results
          </button>
        </form>
      )}

      {message && (
        <div className={`p-3 mb-4 rounded-md ${message.includes("Success") || message.includes("Saved") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}

      {/* Job List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading jobs...</p>
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
                        {/* Chat Button */}
                        <button 
                          onClick={() => handleChat(job.contractor_id)}
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                           <MessageCircle size={10}/> Chat
                        </button>
                      </div>
                   </div>

                  <button
                    onClick={() => handleApply(job._id || job.id)}
                    disabled={appliedJobs.includes(job._id || job.id)}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                      appliedJobs.includes(job._id || job.id)
                        ? "bg-green-100 text-green-600 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {appliedJobs.includes(job._id || job.id) ? "Applied" : "Apply Now"}
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
    </div>
  );
};

export default Jobs;