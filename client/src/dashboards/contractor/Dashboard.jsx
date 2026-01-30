import React, { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { API_URL } from "../../config";
import { Users, Briefcase, DollarSign, Clock, TrendingUp, AlertCircle } from "lucide-react";

const ContractorDashboard = () => {
    const { t } = useOutletContext();
  const [stats, setStats] = useState({
    activeWorkers: 0,
    openJobs: 0,
    totalSpent: 0,
    pendingApps: 0
  });
  const [recentApps, setRecentApps] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if(!user.id) return;

      // Parallel fetch for speed
      const [jobsRes, workersRes] = await Promise.all([
        axios.get(`${API_URL}/api/contractor/jobs/${user.id}`),
        // We can fetch applicants by iterating jobs or a specialized route. 
        // For MVP, we'll derive from jobs or mock a bit if routes are missing.
        // Actually we have /api/jobs/:id/applications but that is per job.
        // Let's rely on finding jobs with status 'open' or 'assigned'.
        Promise.resolve({data: []}) 
      ]);

      const jobs = jobsRes.data;
      
      const open = jobs.filter(j => j.status === 'open').length;
      const assigned = jobs.filter(j => j.status === 'assigned');
      const completed = jobs.filter(j => j.status === 'completed');
      
      const spent = completed.reduce((sum, j) => sum + (Number(j.wage) || 0), 0);

      // Get recent applications (Need a new route or just iterate open jobs?)
      // For now, let's filter assigned jobs as "Active Work"
      setActiveJobs(assigned.slice(0, 5));

      setStats({
        activeWorkers: assigned.length,
        openJobs: open,
        totalSpent: spent,
        pendingApps: 0 // We'll add this later if we add a "My Applications" aggregate route
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="animate-fade-in p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">{user.name ? `${t?.hello || "Hello"}, ${user.name} 👋` : `${t?.hello || "Hello"} 👋`}</h2>
        <p className="text-gray-500">Here is what is happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">Active Workers</div>
            <div className="text-2xl font-bold text-gray-800">{stats.activeWorkers}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <Briefcase size={24} />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">Open Jobs</div>
            <div className="text-2xl font-bold text-gray-800">{stats.openJobs}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">Total Spent</div>
            <div className="text-2xl font-bold text-gray-800">₹{stats.totalSpent.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">Completion Rate</div>
            <div className="text-2xl font-bold text-gray-800">92%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Jobs List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-lg text-gray-800">Active Work Sites</h3>
             <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
          </div>

          <div className="space-y-4">
            {activeJobs.length === 0 ? (
               <div className="text-center py-10 text-gray-400">
                  No active jobs at the moment.
               </div>
            ) : (
               activeJobs.map(job => (
                 <div key={job._id || job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {job.title[0]}
                       </div>
                       <div>
                          <div className="font-bold text-gray-800">{job.title}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                             <Clock size={12}/> Started {new Date(job.created_at).toLocaleDateString()}
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-sm font-bold text-gray-700">₹{job.wage}</div>
                       <div className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold mt-1">
                          In Progress
                       </div>
                    </div>
                 </div>
               ))
            )}
          </div>
        </div>

        {/* Quick Actions & Recent */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-xl p-6 text-white text-center">
              <h3 className="text-lg font-bold mb-2">Need more workers?</h3>
              <p className="text-blue-200 text-sm mb-4">Post a new job or browse the directory to find skilled labor.</p>
              <button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition shadow-lg"
                onClick={() => window.location.href = '/contractor/jobs'}
              >
                 Post a Job
              </button>
           </div>
           
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <AlertCircle size={18} className="text-orange-500"/> System Alerts
              </h3>
              <ul className="space-y-3">
                 <li className="text-sm text-gray-600 flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></span>
                    Verified ID enables specialized hiring.
                 </li>
                 <li className="text-sm text-gray-600 flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></span>
                    New labor laws update available.
                 </li>
              </ul>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ContractorDashboard;
