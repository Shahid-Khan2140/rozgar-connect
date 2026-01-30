import React, { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom"; // Import context hook
import { API_URL } from "../../config";
import { ExternalLink, Shield } from "lucide-react";

const Welfare = () => {
  const { t, user } = useOutletContext(); // Get translations and user from Layout

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetFilter, setTargetFilter] = useState("All"); 
  const [activeBoard, setActiveBoard] = useState("All");

  // Determine available filters based on Role
  const isLabour = user?.role === 'labour';
  const isContractor = user?.role === 'contractor';

  const filterOptions = isLabour 
      ? ['All', 'Labour'] 
      : isContractor 
          ? ['All', 'Contractor', 'Labour'] // Contractors might want to see Labour schemes too
          : ['All', 'Labour', 'Contractor']; // Fallback/Developer

  // --- 1. Fetch Schemes on Mount ---
  const fetchSchemes = async () => {
     try {
        const res = await axios.get(`${API_URL}/api/schemes`);
        setSchemes(res.data);
     } catch(err) {
        console.error(err);
     } finally {
        setLoading(false);
     }
  };

  useEffect(() => {
     fetchSchemes();
  }, []);

  // --- 2. Sync Logic (Trigger Scraper) ---
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
       await axios.post(`${API_URL}/api/schemes/sync`);
       // Re-fetch after sync
       fetchSchemes();
    } catch(err) {
       console.error("Sync failed:", err);
       alert("Failed to sync with government portals. Please try again.");
    } finally {
       setSyncing(false);
    }
  };
  
  const filtered = schemes.filter(s => {
      // 1. Board Filter
      const boardMatch = activeBoard === "All" || s.board === activeBoard;
      
      // 2. Target Group Filter (Button Selection)
      const exactTargetMatch = targetFilter === "All" || s.target_group === "Both" || s.target_group === targetFilter;
      
      // 3. Role-Based Safety Filter (Hidden Logic)
      // If user is Labour, NEVER show "Contractor" only schemes, even in "All"
      const roleSafety = isLabour ? s.target_group !== 'Contractor' : true;

      return boardMatch && exactTargetMatch && roleSafety;
  });

  // --- 3. Helper: Badge Colors ---
  const getBadgeColor = (board) => {
     switch(board) {
        case 'GLWB': return 'bg-blue-100 text-blue-700';
        case 'GRWWB': return 'bg-purple-100 text-purple-700';
        case 'GBOCWWB': return 'bg-orange-100 text-orange-700';
        case 'eShram': return 'bg-indigo-100 text-indigo-700';
        case 'Govt': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
     }
  };
  
  // Translation Helper for Buttons
  const getButtonLabel = (key) => {
      if(key === 'All') return t?.everyone || "Everyone";
      if(key === 'Labour') return t?.for_labour || "For Labours";
      if(key === 'Contractor') return t?.for_contractor || "For Contractors";
      return key;
  };

  return (
    <div className="animate-fade-in p-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             <Shield className="text-orange-500"/> {t?.official_info || "Official Government Information"}
           </h2>
           <p className="text-gray-500 text-sm mt-1">{t?.verified_schemes || "Verified schemes & regulations from Gujarat Government Portals."}</p>
        </div>
        
        {/* Sync & Portal Link */}
        <div className="flex gap-2">
          <button 
             onClick={handleSync}
             disabled={syncing}
             className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border border-blue-200 hover:bg-blue-50 transition text-blue-700 ${syncing ? 'opacity-50' : ''}`}
          >
             <span className={syncing ? "animate-spin" : ""}>⟳</span> {syncing ? (t?.checking || "Checking...") : (t?.checkUpdates || "Check Updates")}
          </button>
        </div>
      </div>

      {/* Target Audience Toggle */}
      <div className="flex justify-center mb-6">
         <div className="bg-gray-100 p-1 rounded-lg flex">
            {filterOptions.map(option => (
                <button 
                    key={option} 
                    onClick={() => setTargetFilter(option)} 
                    className={`px-6 py-2 rounded-md text-sm font-bold transition ${targetFilter === option ? 'bg-white shadow text-blue-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {getButtonLabel(option)}
                </button>
            ))}
         </div>
      </div>

      {/* Board Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
         {['All', 'GLWB', 'GRWWB', 'GBOCWWB', 'eShram', 'Govt'].map(b => (
            <button key={b} onClick={() => setActiveBoard(b)} 
               className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${activeBoard === b ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
               {b === 'All' ? (t?.all || "All Boards") : b}
            </button>
         ))}
      </div>

      {/* Schemes Grid */}
      {loading ? <p className="text-center text-gray-500">Fetching official data...</p> : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filtered.map(scheme => (
               <div key={scheme._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition flex flex-col h-full relative overflow-hidden">
                  {/* Status Strip */}
                  <div className="absolute top-0 left-0 w-1 bg-green-500 h-full"></div>

                  <div className="flex justify-between items-start mb-3 pl-2">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getBadgeColor(scheme.board)}`}>
                        {scheme.board}
                     </span>
                     <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        {scheme.source_name || "Official Portal"}
                     </span>
                  </div>

                  <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 pl-2" title={scheme.title}>
                     {scheme.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 pl-2 line-clamp-3 flex-grow">
                     {scheme.description}
                  </p>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4 mx-2">
                     <div className="text-xs font-bold text-gray-500 mb-1 uppercase">{t?.eligibility || "Eligibility & Docs"}</div>
                     <p className="text-xs text-gray-700 mb-1">✅ {scheme.eligibility || "Check details"}</p>
                     <p className="text-xs text-gray-500">📄 {scheme.documents?.join(", ") || "Aadhaar Card"}</p>
                  </div>

                  <div className="mt-auto px-2">
                    <a 
                       href={scheme.link}
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="w-full border border-blue-600 text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2 text-sm"
                    >
                       {t?.view_on || "View on"} {scheme.board} Portal <ExternalLink size={14}/>
                    </a>
                    <div className="text-[10px] text-gray-400 text-center mt-2">
                       {t?.last_verified || "Last Verified"}: {new Date(scheme.last_checked || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
               </div>
            ))}
         </div>
      )}

      {/* Mandatory Disclaimer Footer */}
      <div className="border-t border-gray-200 pt-6 mt-8 text-center">
         <p className="text-xs text-gray-500 max-w-2xl mx-auto italic">
            "This information is sourced from official Government of Gujarat or Government of India portals (glwb.gujarat.gov.in, labour.gujarat.gov.in). 
            Rozgar Connect provides guidance only and redirects users to official websites for applications. We do not process government applications directly."
         </p>
      </div>

    </div>
  );
};

export default Welfare;
