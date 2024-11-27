import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./main.css";
import tmuLogo from "./assets/tmu_logo_cropped.png";
import supabase from "./supabaseClient";

function RegisterPage () {
    const[email, setEmail] = useState('');
    const[firstName, setFirstName] = useState('');
    const[lastName, setLastName] = useState('');
    const[username, setUsername] = useState('');
    const[password, setPassword] = useState('');
    const[displayName, setDisplayName] = useState('');
    const [status, setStatus] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!username || !password || !email || !firstName || !lastName || !displayName) {
          alert("Please fill out all fields");
          return;
        }
    
        try {
            const { error } = await supabase
                .from('USERS')
                .insert([
                    {
                        FIRST_NAME: firstName,
                        LAST_NAME: lastName,
                        USER_NAME: username,
                        PASSWORD: password,
                        EMAIL: email,
                        DISPLAY_NAME: displayName,
                    },
                ]);

            if (error) {
                console.error('Insert error:', error);
                setStatus('Error registering user. Please try again.');
            } else {
                setStatus('Project created successfully!');

                //Navigate to login page
                navigate("/LoginPage");
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            setStatus('Error registering user. Please try again.');
        }
      };

    return (
        <div className="register-page">
            <div>
                <img src={tmuLogo} className="logo" />
            </div>
            <input
                type="text"
                placeholder="TMU Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                className="first"
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <input
                className="last"
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />
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
            <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
            />
            <div>
                <button onClick={handleRegister}>Register</button>
            </div>
            {status && <p>{status}</p>}
        </div>
    );
}

export default RegisterPage;