import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supabase from "./supabaseClient"; // Ensure to import supabase client
import './main.css';
import tmuLogo from './assets/tmu_logo_cropped.png';
import userProfile from './assets/user.png';
import settingsIcon from "./assets/settings_icon.png";

function ProfileManagement() {
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null); // State to hold user details
    const [fetchError, setFetchError] = useState(null); // State for any fetch error
    const [isPopupOpen, setIsPopupOpen] = useState(false); // State for managing the popup

    const handleInformation = () => {
        setIsPopupOpen(true);
    };

    const handleClose = () => {
        setIsPopupOpen(false);
    };

    // Get logged-in user from localStorage
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        console.log("Logged in user:", user); // Debugging
        if (user) {
            setLoggedInUser(user);
        }
    }, []);

    // Fetch user details from USERS table once the logged-in user is set
    useEffect(() => {
        if (loggedInUser && loggedInUser.id) {
            const fetchUserDetails = async () => {
                try {
                    const { data, error } = await supabase
                        .from('USERS')
                        .select('*')
                        .eq('USER_ID', loggedInUser.id)
                        .single(); // Assuming USER_ID is unique and we only need one result

                    if (error) {
                        throw error;
                    }
                    console.log("Fetched user details:", data); // Debugging
                    setUserDetails(data); // Set the fetched user details
                } catch (error) {
                    console.error("Error fetching user details:", error);
                    setFetchError("Error fetching user details.");
                }
            };

            fetchUserDetails();
        }
    }, [loggedInUser]); // Trigger this effect when loggedInUser changes

    // If there's no user data or it's still loading, show a loading message or placeholder
    if (!userDetails) {
        return <div>Loading user details...</div>;
    }

    return (
        <div className="profile-management-page">
            <header className="header">
                <div>
                    <button className="home">
                        <Link to="/LoginPage/Home">
                            <img src={tmuLogo} className="header_logo" alt="TMU Logo" />
                        </Link>
                    </button>
                </div>
                <div className="buttons">
                    <button className="setting">
                        <img src={settingsIcon} alt="Settings" />
                    </button>
                </div>
            </header>

            <div>
                <img src={userProfile} alt="User Profile" />
            </div>

            <div className="account-type">
                <h2>{loggedInUser?.accountType || "No Account Type Found"}</h2>
            </div>

            <div className="profile-buttons">
                <button>University Id: {userDetails?.USER_ID || "Not Found"}</button>
                <button>University Email: {userDetails?.EMAIL || "Not Found"}</button>
                <button onClick={handleInformation}>Personal Information</button>
                {isPopupOpen && (
                    <div className="overlay">
                        <div className="popup">
                            <h2>Display Name: {userDetails.DISPLAY_NAME}</h2>
                            <h4>Name: {userDetails.FIRST_NAME} {userDetails.LAST_NAME}</h4>
                            <h4>Account Type: {userDetails.ACCOUNT_TYPE}</h4>
                            <h4>University ID: {userDetails.USER_ID}</h4>
                            <h4>University Email: {userDetails.EMAIL}</h4>
                            <h4>Username: {userDetails.USER_NAME}</h4>
                            <button onClick={handleClose} className="report">Close</button>
                        </div>
                    </div>
                )}
                <button>
                    <Link to="/LoginPage/ProfileManagement/ViewLostReportHistory">User Lost and Found Reports</Link>
                </button>
                <button>Notification Settings</button>
                <button>Settings and Preferences</button>
            </div>

            {/* Show error message if there's an issue fetching data */}
            {fetchError && <p className="error-message">{fetchError}</p>}
        </div>
    );
}

export default ProfileManagement;
