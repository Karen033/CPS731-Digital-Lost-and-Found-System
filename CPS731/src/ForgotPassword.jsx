import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./main.css";
import tmuLogo from "./assets/tmu_logo_cropped.png";
import supabase from "./supabaseClient";

function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleUpdatePassword = async () => {
    if (!username || !password) {
      alert("Please enter both username and new password.");
      return;
    }

    try {
      const { error } = await supabase
        .from("USERS")
        .update({ PASSWORD: password })
        .eq("USER_NAME", username);

      if (error) {
        console.error("Update error:", error);
        setError("Error updating password. Please try again.");
      } else {
        setSuccess("Password updated successfully!");
        setTimeout(() => navigate(`/LoginPage`), 500);
      }
    } catch (err) {
      console.error("Unexpected error during update:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <h1>Digital Lost and Found</h1>
      <div>
        <img src={tmuLogo} className="logo" alt="TMU Logo" />
      </div>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div>
        <button onClick={handleUpdatePassword}>Update Password</button>
      </div>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default ForgotPassword;
