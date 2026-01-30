import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaUserTie,
  FaMoneyBill,
  FaCog,
  FaSignOutAlt,
  FaBriefcase,
  FaShieldAlt,
} from "react-icons/fa";
import "../App.css";

const Sidebar = ({ userRole, lang, t }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // In case sidebar is used standalone (which it shouldn't be usually in this layout)
  // we fallback to localstorage or defaults, but typically 't' comes from parent
  const role = userRole || "labour";

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const isActive = (path) =>
    location.pathname.startsWith(path) ? "active" : "";

  // Dynamic Menus based on translations
  const menus = {
    labour: [
      { label: t?.dashboard || "Dashboard", icon: <FaHome />, path: "/labour/dashboard" },
      { label: t?.jobs || "Jobs", icon: <FaBriefcase />, path: "/labour/jobs" },
      { label: t?.payments || "Payments", icon: <FaMoneyBill />, path: "/labour/payments" },
      { label: t?.schemes || "Schemes", icon: <FaShieldAlt />, path: "/labour/welfare" },
      { label: t?.profile || "Profile", icon: <FaUserTie />, path: "/labour/profile" },
    ],

    contractor: [
      { label: t?.dashboard || "Dashboard", icon: <FaHome />, path: "/contractor/dashboard" },
      { label: t?.workers || "Workers", icon: <FaUsers />, path: "/contractor/workers" },
      { label: t?.myJobs || "My Jobs", icon: <FaBriefcase />, path: "/contractor/jobs" },
      { label: t?.labourLaws || "Labour Laws", icon: <FaShieldAlt />, path: "/contractor/govt-info" },
      { label: t?.profile || "Profile", icon: <FaUserTie />, path: "/contractor/profile" },
    ],

    developer: [
      { label: t?.users || "Users", icon: <FaUsers />, path: "/developer/users" },
      { label: t?.policies || "Policies", icon: <FaBriefcase />, path: "/developer/policies" },
      { label: t?.settings || "Settings", icon: <FaCog />, path: "/developer/settings" },
    ],
  };

  return (
    <aside className="sidebar">
      <h3 className="sidebar-title">
        <span style={{ color: "#ff9800" }}>રોજગાર</span> Connect
      </h3>

      <div className="sidebar-section">
        {menus[role]?.map((item) => (
          <div
            key={item.path}
            className={`menu-item ${isActive(item.path)}`}
            onClick={() => navigate(item.path)}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <p className="user-role">{t?.loggedInAs || "Logged in as"}</p>
        <strong className="user-name">
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </strong>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>{t?.logout || "Logout"}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
