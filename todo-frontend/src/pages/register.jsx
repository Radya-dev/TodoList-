import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../css/style.css";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Password tidak sama");
      return;
    }

    setLoading(true);

    try {
      await api.post("/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
      });

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Register gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-box" onSubmit={handleRegister}>
        <h1>Register</h1>

        {error && <p className="register-error">{error}</p>}

        <input
          type="text"
          placeholder="Nama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Register"}
        </button>

        <p className="register-footer">
          Sudah punya akun?{" "}
          <button onClick={() => navigate("/")}>
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
