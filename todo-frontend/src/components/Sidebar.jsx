import { useNavigate } from "react-router-dom";
import "../css/sidebar.css";

export default function Sidebar({ active = "tasks" }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>ToDo App</h2>
      </div>

      <nav className="sidebar-menu">
        <button
          className={`sidebar-link ${active === "tasks" ? "active" : ""}`}
          onClick={() => navigate("/tasks")}
        >
          Tasks
        </button>

        <button
          className={`sidebar-link ${active === "completed" ? "active" : ""}`}
        >
          Completed
        </button>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
