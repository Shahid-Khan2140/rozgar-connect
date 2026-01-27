import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaUserTie,
  FaMoneyBill,
  FaCog,
  FaSignOutAlt,
  FaBriefcase,
} from "react-icons/fa";
import "../App.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "labour";

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const isActive = (path) =>
    location.pathname.startsWith(path) ? "active" : "";

  const menus = {
    labour: [
      { label: "Dashboard", icon: <FaHome />, path: "/labour/dashboard" },
      { label: "Jobs", icon: <FaBriefcase />, path: "/labour/jobs" },
      { label: "Payments", icon: <FaMoneyBill />, path: "/labour/payments" },
      { label: "Profile", icon: <FaUserTie />, path: "/labour/profile" },
    ],

    contractor: [
      { label: "Workers", icon: <FaUsers />, path: "/contractor/workers" },
      { label: "My Jobs", icon: <FaBriefcase />, path: "/contractor/jobs" },
      { label: "Profile", icon: <FaUserTie />, path: "/contractor/profile" },
    ],

    developer: [
      { label: "Users", icon: <FaUsers />, path: "/developer/users" },
      { label: "Policies", icon: <FaBriefcase />, path: "/developer/policies" },
      { label: "Settings", icon: <FaCog />, path: "/developer/settings" },
    ],
  };

  return (
    <aside className="sidebar">
      <h3 className="sidebar-title">
        <span style={{ color: "#ff9800" }}>રોજગાર</span> Connect
      </h3>

      <div className="sidebar-section">
        {menus[role].map((item) => (
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
        <p className="user-role">Logged in as</p>
        <strong className="user-name">
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </strong>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
