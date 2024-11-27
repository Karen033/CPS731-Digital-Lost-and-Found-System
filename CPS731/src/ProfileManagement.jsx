import tmuLogo from './assets/tmu_logo_cropped.png'
import userProfile from './assets/user.png'
import { Link } from "react-router-dom";
import './main.css'
import settingsIcon from "./assets/settings_icon.png";
import React, { useState, useEffect } from "react";

function ProfileManagement() {
    const [loggedInUser, setLoggedInUser] = useState(null);

    // Get logged-in user from localStorage
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        console.log("Logged in user:", user);
        if (user) {
          setLoggedInUser(user);
        }
      }, []);      

    return (
        <div className="profile-management-page">
            <header className='header'>
                <div>
                    <img src={tmuLogo} className="header_logo" />
                </div>
                <div className='buttons'>
                    <button className='setting'>
                        <img src={settingsIcon} />
                    </button>
                </div>
            </header>
            <div>
                <img src={userProfile} />
            </div>
            <div className='account-type'>
                <h2>{loggedInUser?.accountType || "No Account Type Found"}</h2>
            </div>
            <div className='profile-buttons'>
                <button>University ID</button>
                <button>University Email</button>
                <button>Contact Information</button>
                <button>User Lost and Found Reports</button>
                <button>Notification Settings</button>
                <button>Settings and Preferences</button>
            </div>
        </div>
    )
}

export default ProfileManagement;
