import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import { useUser } from "./UserContext";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useUser();
  const navigate = useNavigate();

  const navigateBasedOnUserType = (userType) => {
    switch (userType) {
      case "manager":
        navigate("/manager");
        break;
      case "cashier":
        navigate("/cashier");
        break;
      case "admin":
        navigate("/admin");
        break;
      default:
        navigate("/");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        process.env.REACT_APP_SERVER_URL + "api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();
      if (response.status === 200) {
        localStorage.setItem("user", JSON.stringify(data.user));
        login({ userType: data.userType });
        navigateBasedOnUserType(data.userType);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="login-form-container">
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
      <a
        href="https://project-3-client-cqgf.onrender.com/"
        className="external-link-button"
        rel="noopener noreferrer"
      >
        Back to Home Page
      </a>
    </div>
  );
};

export default LoginForm;
