import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import { Plus, MapPin, IndianRupee, Briefcase, User, Calendar, X, Check } from "lucide-react";
import "../../App.css";

const ContractorJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Application Management
  const [viewAppsJob, setViewAppsJob] = useState(null);
  const [applications, setApplications] = useState([]);

  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    location: "",
    wage: "",
    wage_type: "daily",
    category: "Construction",
    worker_id: null
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchJobs();
  }, [currentUser.id]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/contractor/jobs/${currentUser.id}`);
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId) => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs/${jobId}/applications`);
      setApplications(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  const handleOpenApps = (job) => {
    setViewAppsJob(job);
    fetchApplications(job.id || job._id);
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/jobs`, {
        ...newJob,
        contractor_id: currentUser.id
      });
      setShowForm(false);
      fetchJobs();
      setNewJob({ title: "", description: "", location: "", wage: "", wage_type: "daily", category: "Construction", worker_id: null });
    } catch (err) {
      alert("Failed to post job");
    }
  };

  const handleAccept = async (appId, workerId) => {
    try {
       await axios.post(`${API_URL}/api/applications/${appId}/status`, {
         status: 'accepted',
         job_id: viewAppsJob.id || viewAppsJob._id,
         worker_id: workerId
       });
       alert("Application Accepted! Job is now assigned.");
       setViewAppsJob(null);
       fetchJobs();
    } catch(err) {
       alert("Action Failed");
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === "all") return true;
    if (activeTab === "open") return job.status === "open";
    if (activeTab === "assigned") return job.status !== "open";
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'assigned': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="animate-fade-in p-6 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Jobs</h2>
          <p className="text-gray-500 text-sm mt-1">Post new jobs and track ongoing work.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-700 transition shadow-sm"
        >
          {showForm ? "Cancel" : <><Plus size={18} /> Post New Job</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8 animate-slide-in-top">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Create New Job Listing</h3>
          <form onSubmit={handleCreateJob} className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input 
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={newJob.title}
                onChange={e => setNewJob({...newJob, title: e.target.value})}
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition h-24"
                value={newJob.description}
                onChange={e => setNewJob({...newJob, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input 
                  required
                  className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newJob.location}
                  onChange={e => setNewJob({...newJob, location: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={newJob.category}
                onChange={e => setNewJob({...newJob, category: e.target.value})}
              >
                <option>Construction</option>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Cleaning</option>
                <option>Transport</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wage Amount (₹)</label>
              <input 
                type="number"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newJob.wage}
                onChange={e => setNewJob({...newJob, wage: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wage Type</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={newJob.wage_type}
                onChange={e => setNewJob({...newJob, wage_type: e.target.value})}
              >
                <option value="daily">Daily</option>
                <option value="hourly">Hourly</option>
                <option value="monthly">Monthly</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>

            <div className="col-span-2 pt-2">
              <button 
                type="submit" 
                className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-900 transition"
              >
                Post Job
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {['all', 'open', 'assigned'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-medium capitalize transition-colors relative ${
              activeTab === tab 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab} Jobs
          </button>
        ))}
      </div>

      {loading ? <p className="text-gray-500 text-center py-8">Loading...</p> : (
        <div className="grid gap-4">
          {filteredJobs.length === 0 ? (
            <p className="text-gray-400 text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              No jobs found.
            </p>
          ) : (
            filteredJobs.map(job => (
               <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4 hover:shadow-md transition">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 text-lg">{job.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3">{job.description}</p>
                  
                  <div className="flex gap-4 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><MapPin size={14}/> {job.location}</span>
                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 md:border-l md:pl-6 border-gray-100">
                   <div className="text-right min-w-[100px]">
                     <div className="text-xl font-bold text-gray-800">₹{job.wage}</div>
                     <div className="text-xs text-gray-400 uppercase">Per {job.wage_type || 'day'}</div>
                   </div>

                   {/* Job Actions */}
                   {job.status === 'open' ? (
                      <button 
                        onClick={() => handleOpenApps(job)}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition whitespace-nowrap"
                      >
                         View Applications
                      </button>
                   ) : (
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg pr-4">
                           <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                              {job.worker_name?.[0] || 'W'}
                           </div>
                           <div>
                              <div className="text-sm font-bold text-gray-700">{job.worker_name}</div>
                              <div className="text-xs text-gray-500">{job.worker_phone}</div>
                           </div>
                        </div>
                        
                        {job.status === 'assigned' && (
                          <button
                            onClick={async () => {
                              if(confirm("Mark this job as completed?")) {
                                await axios.put(`${API_URL}/api/jobs/${job.id || job._id}/status`, { status: 'completed' });
                                fetchJobs();
                              }
                            }}
                            className="text-xs text-green-600 font-bold hover:underline"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Applications Modal */}
      {viewAppsJob && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-scale-in">
               <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-lg">Applicants for {viewAppsJob.title}</h3>
                  <button onClick={() => setViewAppsJob(null)} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button>
               </div>
               
                <div className="p-4 overflow-y-auto flex-1">
                  {applications.length === 0 ? (
                     <p className="text-center text-gray-500 py-8">No applications yet.</p>
                  ) : (
                     applications.map(app => (
                        <div key={app._id} className="border border-gray-200 rounded-lg p-4 mb-3 flex flex-col md:flex-row justify-between gap-4">
                           <div className="flex gap-4">
                              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                 {app.worker_id.profile_pic_url ? (
                                    <img src={app.worker_id.profile_pic_url} className="w-full h-full object-cover" />
                                 ) : (
                                    <span className="flex items-center justify-center h-full font-bold text-gray-500">
                                       {app.worker_id.name?.[0]}
                                    </span>
                                 )}
                              </div>
                              <div>
                                 <div className="font-bold text-gray-800">{app.worker_id.name}</div>
                                 <div className="text-sm text-gray-500">{app.worker_id.skill || "No specific skill"}</div>
                                 <div className="text-xs text-blue-600 mt-1">{app.cover_letter}</div>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-2">
                              {app.status === 'applied' ? (
                                 <>
                                    <button 
                                      onClick={async () => {
                                         if(confirm("Reject this applicant?")) {
                                            try {
                                              await axios.post(`${API_URL}/api/applications/${app._id}/status`, { status: 'rejected' });
                                              fetchApplications(viewAppsJob.id || viewAppsJob._id);
                                            } catch(e) { alert("Failed to reject"); }
                                         }
                                      }}
                                      className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
                                      title="Reject"
                                    >
                                       <X size={16}/>
                                    </button>
                                    <button 
                                      onClick={() => handleAccept(app._id, app.worker_id._id)}
                                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition flex items-center gap-2"
                                    >
                                       <Check size={16}/> Hire
                                    </button>
                                 </>
                              ) : (
                                 <div className="flex flex-col items-end gap-1">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                       app.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                       {app.status}
                                    </span>
                                    {app.status === 'accepted' && (
                                       <button 
                                          onClick={() => {
                                             const phone = app.worker_id.phone || "919999999999";
                                             window.open(`https://wa.me/${phone}`, '_blank');
                                          }}
                                          className="text-xs text-green-600 font-bold hover:underline flex items-center gap-1"
                                       >
                                          WhatsApp <User size={10}/>
                                       </button>
                                    )}
                                 </div>
                              )}
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default ContractorJobs;
