import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/sidebar";
import "../css/style.css";

export default function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [direction, setDirection] = useState("desc");
  const [error, setError] = useState("");

  const fetchTasks = async (
    customFilter = filter,
    customSort = sortBy,
    customDirection = direction
  ) => {
    try {
      let params = [];

      if (customFilter !== "all") {
        params.push(`is_done=${customFilter}`);
      }

      params.push(`sort=${customSort}`);
      params.push(`direction=${customDirection}`);

      const query = params.length ? `?${params.join("&")}` : "";
      const res = await api.get(`/tasks${query}`);

      setTasks(res.data.tasks.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      } else {
        setError("Gagal mengambil tasks");
      }
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setAdding(true);
    try {
      await api.post("/tasks", { title, description });
      setTitle("");
      setDescription("");
      fetchTasks();
    } catch {
      alert("Gagal tambah task");
    } finally {
      setAdding(false);
    }
  };

  const toggleDone = async (id) => {
    try {
      const res = await api.patch(`/tasks/${id}/done`);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data.task : t))
      );
    } catch {
      alert("Gagal update task");
    }
  };

  const deleteTask = async (id) => {
    if (!confirm("Hapus task ini?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch {
      alert("Gagal hapus task");
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const saveEdit = async (id) => {
    try {
      const res = await api.put(`/tasks/${id}`, {
        title: editTitle,
        description: editDescription,
      });

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data.task : t))
      );
      setEditingId(null);
    } catch {
      alert("Gagal update task");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="tasks-container">
      <Sidebar />

      <div className="tasks-main">
        {/* HEADER */}
        <div className="tasks-header">
          <h1>My Tasks</h1>
          <button onClick={logout} className="logout-btn ">Logout</button>
          {error && <p className="error-message">{error}</p>}

          <div className="filter-controls">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                fetchTasks(e.target.value, sortBy, direction);
              }}
            >
              <option value="all">All</option>
              <option value="0">Undone</option>
              <option value="1">Done</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                fetchTasks(filter, e.target.value, direction);
              }}
            >
              <option value="created_at">Created</option>
              <option value="title">Title</option>
              <option value="due_date">Due Date</option>
            </select>

            <select
              value={direction}
              onChange={(e) => {
                setDirection(e.target.value);
                fetchTasks(filter, sortBy, e.target.value);
              }}
            >
              <option value="desc">⬇ Desc</option>
              <option value="asc">⬆ Asc</option>
            </select>
          </div>
        </div>

        {/* CONTENT */}
        <div className="tasks-content">
          {/* ADD TASK */}
          <form onSubmit={addTask} className="add-task-form">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />

            <button className="add-task-btn" disabled={adding}>
              {adding ? "Adding..." : "Add Task"}
            </button>
          </form>

          {/* TASK LIST */}
          <div className="task-list">
            {tasks.length === 0 && (
              <p className="no-tasks">No tasks</p>
            )}

            {tasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-content">
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.is_done}
                    onChange={() => toggleDone(task.id)}
                  />

                  {editingId === task.id ? (
                    <div className="task-edit">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) =>
                          setEditDescription(e.target.value)
                        }
                      />
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="task-save-btn"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="task-info">
                      <p
                        className={`task-title ${
                          task.is_done ? "done" : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="task-description">
                          {task.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="task-actions">
                  <button
                    onClick={() => startEdit(task)}
                    className="task-edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="task-delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
