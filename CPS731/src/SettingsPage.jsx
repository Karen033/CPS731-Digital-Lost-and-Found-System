import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supabase from "./supabaseClient";
import './main.css';
import tmuLogo from './assets/tmu_logo_cropped.png';
import userIcon from './assets/user_icon.png';
import arrowIcon from "./assets/arrow_icon.png";
import bookIcon from "./assets/book_icon.png";
import displayIcon from "./assets/display_icon.png";
import globeIcon from "./assets/globe_icon.png";
import keyIcon from "./assets/key_icon.png";
import lockIcon from "./assets/lock_icon.png";
import questionIcon from "./assets/question_icon.png";
import notificationIcon from "./assets/notification_icon.png"

function SettingsPage () {
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [newDisplayName, setNewDisplayName] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isChangeDisplayNamePopupOpen, setIsChangeDisplayNamePopupOpen] = useState(false);
    const [isChangePasswordPopupOpen, setIsChangePasswordPopupOpen] = useState(false);
    const [isNotifSettingPopupOpen, setIsNotifSettingPopupOpen] = useState(false);
    const [isDisplaySettingPopupOpen, setIsDisplaySettingPopupOpen] = useState(false);
    const [isLostAndFoundSettingPopupOpen, setIsLostAndFoundSettingPopupOpen] = useState(false);
    const [isAccessibilityPopupOpen, setIsAccessibilityPopupOpen] = useState(false);
    const [isFAQPopupOpen, setIsFAQPopupOpen] = useState(false);
    const [isPrivacyPopupOpen, setIsPrivacyPopupOpen] = useState(false);

    const handleChangeDisplayName = () => {
        setIsChangeDisplayNamePopupOpen(true);
    }

    const handleChangePassword = () => {
        setIsChangePasswordPopupOpen(true);
    }

    const handleNotifSetting = () => {
        setIsNotifSettingPopupOpen(true);
    }

    const handleDisplaySetting = () => {
        setIsDisplaySettingPopupOpen(true);
    }

    const handleLostAndFoundSetting = () => {
        setIsLostAndFoundSettingPopupOpen(true);
    }

    const handleAccessibility = () => {
        setIsAccessibilityPopupOpen(true);
    }

    const handleFAQ = () => {
        setIsFAQPopupOpen(true);
    }

    const handlePrivacy = () => {
        setIsPrivacyPopupOpen(true);
    }

    const handleClose = () => {
        setIsNotifSettingPopupOpen(false);
        setIsDisplaySettingPopupOpen(false);
        setIsLostAndFoundSettingPopupOpen(false);
        setIsAccessibilityPopupOpen(false);
        setIsFAQPopupOpen(false);
        setIsPrivacyPopupOpen(false);
    };

    // Get logged-in user from localStorage
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        console.log("Logged in user:", user); // Debugging
        if (user) {
            setLoggedInUser(user);
        }
    }, []);

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
    }, [loggedInUser]);

    const handleChangeName = async () => {
        if (!newDisplayName) {
          alert("Please enter a new display name");
          return;
        }
    
        try {
          const { error } = await supabase
            .from("USERS")
            .update({ DISPLAY_NAME: newDisplayName })
            .eq("USER_ID", loggedInUser.id);
    
          if (error) {
            console.error("Update error:", error);
            setError("Error updating display name. Please try again.");
          } else {
            setSuccess("Display name updated successfully!");
            setIsChangeDisplayNamePopupOpen(false);
          }
        } catch (err) {
          console.error("Unexpected error during update:", err);
          setError("An unexpected error occurred. Please try again.");
        }
      };

      const handleChangePass = async () => {
        if (!oldPassword || !newPassword) {
          alert("Please enter your old and new password");
          return;
        }

        if (oldPassword !== userDetails.PASSWORD) {
            alert("Old password is incorrect");
            return;
        }
    
        try {
          const { error } = await supabase
            .from("USERS")
            .update({ PASSWORD: newPassword })
            .eq("USER_ID", loggedInUser.id);
    
          if (error) {
            console.error("Update error:", error);
            setError("Error updating password. Please try again.");
          } else {
            setSuccess("Password updated successfully!");
            setIsChangePasswordPopupOpen(false);
          }
        } catch (err) {
          console.error("Unexpected error during update:", err);
          setError("An unexpected error occurred. Please try again.");
        }
      };

    return (
        <div className="settings-page">
            <header className="header">
                <button className="home">
                    <Link to="/LoginPage/Home">
                        <img src={tmuLogo} className="header_logo" alt="TMU Logo" />
                    </Link>
                </button>
                <h1>Settings</h1>
                <button className="profile">
                    <Link to="/LoginPage/ProfileManagement">
                        <img src={userIcon}/>
                    </Link>
                </button>
            </header>
            <div className="settings-page-buttons">
                <button className="settings-page-button" onClick={handleChangeDisplayName}>
                    <div className="left">
                        <img src={userIcon} />  
                        <h3>Change Display Name</h3>
                    </div>
                    <img className="right-img" src={arrowIcon} />
                </button>
                {isChangeDisplayNamePopupOpen && (
                    <div className="overlay">
                        <div className="popup">
                            <h2>{userDetails.DISPLAY_NAME}</h2>
                            <p>New Display Name:</p>
                            <input 
                            type="text"
                            placeholder="New Display Name"
                            onChange={(e) => setNewDisplayName(e.target.value)}
                            />
                            {error && <p className="error">{error}</p>}
                            {success && <p className="success">{success}</p>}
                            <button onClick={handleChangeName} className="report">Update</button>
                        </div>
                    </div>
                )}
                <button className="settings-page-button" onClick={handleChangePassword}>
                    <div className="left">
                        <img src={keyIcon} />  
                        <h3>Change Password</h3>
                    </div>
                    <img className="right-img" src={arrowIcon} />
                </button>
                {isChangePasswordPopupOpen && (
                    <div className="overlay">
                        <div className="popup">
                            <h2>Change Password</h2>
                            <p>Old Password:</p>
                            <input 
                            type="password"
                            placeholder="Old Password"
                            onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <p>New Password:</p>
                            <input 
                            type="password"
                            placeholder="New Password"
                            onChange={(e) => setNewPassword(e.target.value)}
                            />
                            {error && <p className="error">{error}</p>}
                            {success && <p className="success">{success}</p>}
                            <button onClick={handleChangePass} className="report">Update</button>
                        </div>
                    </div>
                )}
                <button className="settings-page-button" onClick={handleNotifSetting}>
                    <div className="left">
                        <img src={notificationIcon} />  
                        <h3>Notification Preferences</h3>
                    </div>
                    <img className="right-img" src={arrowIcon} />
                </button>
                {isNotifSettingPopupOpen && (
                    <div className="overlay">
                        <div className="popup">
                            <h2>TO BE IMPLEMENTED IN THE FUTURE</h2>
                            <button onClick={handleClose} className="report">Close</button>
                        </div>
                    </div>
                )}
                <button className="settings-page-button" onClick={handleDisplaySetting}>
                    <div className="left">
                        <img src={displayIcon} />  
                        <h3>Display Settings</h3>
                    </div>
                    <img className="right-img" src={arrowIcon} />
                </button>
                {isDisplaySettingPopupOpen && (
                    <div className="overlay">
                        <div className="popup">
                            <h2>TO BE IMPLEMENTED IN THE FUTURE</h2>
                            <button onClick={handleClose} className="report">Close</button>
                        </div>
                    </div>
                )}
                <button className="settings-page-button" onClick={handleLostAndFoundSetting}>
                    <div className="left">
                        <img src={bookIcon} />  
                        <h3>Lost and Found Settings</h3>
                    </div>
                    <img className="right-img" src={arrowIcon} />
                </button>
                {isLostAndFoundSettingPopupOpen && (
                    <div className="overlay">
                        <div className="popup">
                            <h2>TO BE IMPLEMENTED IN THE FUTURE</h2>
                            <button onClick={handleClose} className="report">Close</button>
                        </div>
                    </div>
                )}
                <button className="settings-page-button" onClick={handleAccessibility}>
                    <div className="left">
                        <img src={globeIcon} />  
                        <h3>Accessibility and Languages</h3>
                    </div>
                    <img className="right-img" src={arrowIcon} />
                </button>
                {isAccessibilityPopupOpen && (
                    <div className="overlay">
                        <div className="popup">
                            <h2>Accessibility and Languages</h2>
                            <h4>Accessible to All TMU Students</h4>
                            <p>Features for inclusivity of users with disabilities to be implemented in the future</p>
                            <h4>Languages: English</h4>
                            <button onClick={handleClose} className="report">Close</button>
                        </div>
                    </div>
                )}
                <button className="settings-page-button" onClick={handleFAQ}>
                    <div className="left">
                        <img src={questionIcon} />  
                        <h3>Lost and Found FAQ</h3>
                    </div>
                    <img className="right-img" src={arrowIcon} />
                </button>
                {isFAQPopupOpen && (
                    <div className="overlay">
                        <div className="popup">
                            <h2>Lost And Found FAQ</h2>
                            <p>On university campuses, students, staff, and faculty frequently misplace personal belongings, from textbooks and electronic devices to ID cards and other essential items. 
                                Current lost and found systems are managed manually through physical locations, leading to unclaimed items and frustrated individuals. 
                                Our team developed a Digital Lost and Found System to streamline the process of reporting, tracking, and recovering lost items on campus. 
                                The system will serve as a centralized platform where users can report lost or found items.</p>
                            <button onClick={handleClose} className="report">Close</button>
                        </div>
                    </div>
                )}
                <button className="settings-page-button" onClick={handlePrivacy}>
                    <div className="left">
                        <img src={lockIcon} />  
                        <h3>Privacy Policy</h3>
                    </div>
                    <img className="right-img" src={arrowIcon} />
                </button>
                {isPrivacyPopupOpen && (
                    <div className="overlay">
                        <div className="popup">
                            <h2>Privacy Policy</h2>
                            <p>Find privacy policy here: 
                                <a href="https://www.torontomu.ca/privacy/">TMU Privacy Policy</a>
                            </p>
                            <button onClick={handleClose} className="report">Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SettingsPage;
