import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

// Layout
import Layout from "./layout/Layout";

// Labour
import LabourDashboard from "./dashboards/labour/Dashboard";
import Attendance from "./dashboards/labour/Attendance";
import Jobs from "./dashboards/labour/Jobs";
import Payments from "./dashboards/labour/Payments";
import Profile from "./dashboards/labour/Profile";
import Welfare from "./dashboards/labour/Welfare";

// Contractor
// Contractor
import ContractorDashboard from "./dashboards/contractor/Dashboard";
import Workers from "./dashboards/contractor/Workers";
import ContractorJobs from "./dashboards/contractor/Jobs";

// Developer
import Settings from "./dashboards/developer/Settings";
import AdminUsers from "./dashboards/developer/Users";
import AdminPolicies from "./dashboards/developer/Policies";

function App() {
  // Get role safely
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || null;

  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            {/* Redirect root based on role */}
            <Route
              index
              element={
                role ? (
                  <Navigate to={`/${role}/dashboard`} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* LABOUR ROUTES */}
            <Route path="labour/dashboard" element={<LabourDashboard />} />
            <Route path="labour/attendance" element={<Attendance />} />
            <Route path="labour/jobs" element={<Jobs />} />
            <Route path="labour/payments" element={<Payments />} />
            <Route path="labour/profile" element={<Profile />} />
            <Route path="labour/welfare" element={<Welfare />} />

            {/* CONTRACTOR ROUTES */}
            <Route path="contractor/dashboard" element={<ContractorDashboard />} />
            <Route path="contractor/workers" element={<Workers />} />
            <Route path="contractor/jobs" element={<ContractorJobs />} />
            <Route path="contractor/govt-info" element={<Welfare />} />
            <Route path="contractor/profile" element={<Profile />} />

            {/* DEVELOPER ROUTES */}
            <Route path="developer/users" element={<AdminUsers />} />
            <Route path="developer/policies" element={<AdminPolicies />} />
            <Route path="developer/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
