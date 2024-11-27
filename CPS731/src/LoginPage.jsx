import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./main.css";
import tmuLogo from "./assets/tmu_logo_cropped.png";
import supabase from "./supabaseClient";
import { Link } from "react-router-dom";

function LoginPage() {
  const [fetchError, setFetchError] = useState(null);
  const [users, setUsers] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("USERS") // Name of table
        .select();

      if (error) {
        setFetchError("Could not fetch users");
        setUsers(null); // Set users to null if error occurred in case it had data from before
        console.log(error);
      }
      if (data) {
        setUsers(data);
        setFetchError(null);
      }
    };

    fetchUsers();
  }, []);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    try {
      console.log("Attempting login with:");
      console.log("Username:", username.trim());
      console.log("Password:", password.trim());

      const { data, error } = await supabase
        .from("USERS")
        .select("USER_ID, EMAIL, USER_NAME, FIRST_NAME, LAST_NAME, PASSWORD")
        .eq("USER_NAME", username.trim())
        .eq("PASSWORD", password.trim())
        .single();

      if (error) {
        console.error("Supabase error:", error);
        setError("Invalid username or password. Please try again.");
      } else if (!data) {
        console.log("No user found with the given credentials.");
        setError("Invalid username or password. Please try again.");
      } else {
        console.log("Login successful:", data);
        setError("");
        const fullName = `${data.FIRST_NAME} ${data.LAST_NAME}`;

        // Store the logged-in user's email in localStorage
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({ id: data.USER_ID, fullName, email: data.EMAIL })
        );

        // Navigate to the homepage
        navigate("/LoginPage/Home");
      }
    } catch (err) {
      console.error("Unexpected error during login:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="login-page">
        <h1>Digital Lost and Found</h1>
        <div>
            <img src={tmuLogo} className="logo" />
        </div>
        <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <div>
            <button onClick={handleLogin}>Login</button>
        </div>
        <p>Forgot password? <Link to='/LoginPage/ForgotPassword'>Click here</Link></p>
    </div>
  );
}

export default LoginPage;