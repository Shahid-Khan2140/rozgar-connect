import React, { useState } from "react";
import { IndianRupee, Clock, CheckCircle, Download, CreditCard } from "lucide-react";
import "../../App.css";

const Payments = () => {
  const [filter, setFilter] = useState("all");

  const paymentHistory = [
    { id: 1, date: "2026-01-15", description: "Mason Work - Construction", amount: 1500, status: "Completed", method: "Bank Transfer" },
    { id: 2, date: "2026-01-14", description: "Helper Work - Farm Labor", amount: 800, status: "Completed", method: "Bank Transfer" },
    { id: 3, date: "2026-01-13", description: "Electrical Work - Installation", amount: 2000, status: "Pending", method: "Bank Transfer" },
    { id: 4, date: "2026-01-10", description: "Plumbing Assistance", amount: 1200, status: "Completed", method: "UPI" },
    { id: 5, date: "2026-01-08", description: "Carpenter Work", amount: 1800, status: "Completed", method: "Cash" },
  ];

  const totalEarnings = paymentHistory.reduce((sum, p) => p.status === "Completed" ? sum + p.amount : sum, 0);
  const pendingAmount = paymentHistory.reduce((sum, p) => p.status === "Pending" ? sum + p.amount : sum, 0);
  
  const filteredPayments = filter === "all" ? paymentHistory : paymentHistory.filter(p => p.status === filter);

  return (
    <div className="animate-fade-in p-6">
      <div className="flex justify-between items-center mb-8">
         <div>
            <h2 className="text-2xl font-bold text-gray-800">Payments & Settlements</h2>
            <p className="text-gray-500 text-sm">Track your earnings and transaction history.</p>
         </div>
         <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition">
            <Download size={18}/> Download Statement
         </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
             <IndianRupee size={24}/>
          </div>
          <div>
             <div className="text-gray-500 text-sm font-medium">Total Earnings</div>
             <div className="text-2xl font-bold text-gray-800">₹{totalEarnings.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
             <Clock size={24}/>
          </div>
          <div>
             <div className="text-gray-500 text-sm font-medium">Pending Amount</div>
             <div className="text-2xl font-bold text-gray-800">₹{pendingAmount.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
             <CheckCircle size={24}/>
          </div>
          <div>
             <div className="text-gray-500 text-sm font-medium">Settled Records</div>
             <div className="text-2xl font-bold text-gray-800">{paymentHistory.filter(p=>p.status==='Completed').length}</div>
          </div>
        </div>
      </div>

      {/* Filter & Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
           <h3 className="font-bold text-gray-800">Transaction History</h3>
           <div className="flex bg-gray-100 p-1 rounded-lg">
             {['all', 'Completed', 'Pending'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
             ))}
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                 <tr>
                    <th className="px-6 py-4 text-left">Date</th>
                    <th className="px-6 py-4 text-left">Description</th>
                    <th className="px-6 py-4 text-left">Method</th>
                    <th className="px-6 py-4 text-left">Amount</th>
                    <th className="px-6 py-4 text-left">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-blue-50/50 transition">
                       <td className="px-6 py-4 text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</td>
                       <td className="px-6 py-4 text-sm font-medium text-gray-800">{payment.description}</td>
                       <td className="px-6 py-4 text-xs text-gray-500 flex items-center gap-1">
                          <CreditCard size={14}/> {payment.method}
                       </td>
                       <td className="px-6 py-4 text-sm font-bold text-gray-800">₹{payment.amount}</td>
                       <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                             payment.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                             {payment.status}
                          </span>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;