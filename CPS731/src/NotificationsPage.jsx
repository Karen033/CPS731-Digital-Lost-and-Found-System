import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supabase from "./supabaseClient"; 
import './main.css';
import tmuLogo from './assets/tmu_logo_cropped.png';
import profileIcon from './assets/user_icon.png';
import settingsIcon from "./assets/settings_icon.png";
import notificationsIcon from "./assets/notification_icon.png";

function NotificationsPage() {
    const [thisWeek, setThisWeek] = useState([]);
    const [older, setOlder] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get logged-in user from localStorage
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        console.log("Logged in user:", user); // Debugging
        if (user) {
            setLoggedInUser(user);
        }
    }, []);

    // Function to format time ago
    const formatTimeAgo = (date) => {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return "Invalid date";
        }

        const now = new Date();
        const timeDiff = now - date;
        const seconds = Math.floor(timeDiff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);

        if (days < 1) {
            if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
        }

        if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
        if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;

        return "Just now";
    };

    // Fetch notifications from Supabase for the logged-in user
    const fetchNotifications = async () => {
        if (!loggedInUser) {
            console.warn("Logged in user is null or undefined.");
            return [];
        }
    
        try {
            const { data: notifications, error } = await supabase
                .from('NOTIFICATIONS')
                .select('*')
                .eq('USER_ID', loggedInUser.id)
                .order('CREATED_AT', { ascending: false });
    
            if (error) {
                console.error('Error fetching notifications:', error.message);
                setError("Failed to fetch notifications.");
                setLoading(false);
                return [];
            }
    
            setLoading(false);
            return notifications;
        } catch (error) {
            console.error('Unexpected error:', error.message);
            setError("An unexpected error occurred.");
            setLoading(false);
            return [];
        }
    };    

    // Group notifications into 'This Week' and 'Older'
    const groupNotifications = (notifications) => {
        const now = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);

        const thisWeek = [];
        const older = [];

        notifications.forEach(notification => {
            const createdAt = new Date(notification.CREATED_AT);
            if (isNaN(createdAt.getTime())) {
                notification.timeAgo = "Invalid date";
                older.push(notification);
                return;
            }

            notification.timeAgo = formatTimeAgo(createdAt);
            if (createdAt >= oneWeekAgo) {
                thisWeek.push(notification);
            } else {
                older.push(notification);
            }
        });

        return { thisWeek, older };
    };

    // Mark notification as opened
    const markAsOpened = async (notification) => {
        try {
            const { error } = await supabase
                .from('NOTIFICATIONS')
                .update({ OPENED: true })
                .eq('NOTIFICATION_ID', notification.NOTIFICATION_ID);

            if (error) {
                console.error('Error updating notification:', error.message);
                return;
            }

            // Update state locally
            setThisWeek(prev => 
                prev.map(item =>
                    item.NOTIFICATION_ID === notification.NOTIFICATION_ID
                        ? { ...item, OPENED: true }
                        : item
                )
            );
            setOlder(prev => 
                prev.map(item =>
                    item.NOTIFICATION_ID === notification.NOTIFICATION_ID
                        ? { ...item, OPENED: true }
                        : item
                )
            );
        } catch (error) {
            console.error('Unexpected error:', error.message);
        }
    };

    // Fetch and group notifications on component mount
    useEffect(() => {
        const fetchAndGroupNotifications = async () => {
            if (!loggedInUser) return; // Ensure loggedInUser is available
    
            setLoading(true);
            const notifications = await fetchNotifications();
            const grouped = groupNotifications(notifications);
            setThisWeek(grouped.thisWeek);
            setOlder(grouped.older);
        };
    
        fetchAndGroupNotifications();
    }, [loggedInUser]); // Add loggedInUser as a dependency

    return (
        <div className="notifications-page">
            <header className="header">
                <div className="notif-left">
                    <h1>Notifications</h1>
                    <img src={notificationsIcon} alt="Notifications" />
                </div>
                <div>
                    <button className="home">
                        <Link to="/LoginPage/Home">
                            <img src={tmuLogo} className="header_logo" alt="TMU Logo" />
                        </Link>
                    </button>
                    <button className="setting">
                        <Link to="/LoginPage/ProfileManagement/Settings">
                            <img src={settingsIcon} alt="Settings" />
                        </Link>
                    </button>
                    <button className="profile">
                        <Link to="/LoginPage/ProfileManagement">
                            <img src={profileIcon} alt="Profile" />
                        </Link>
                    </button>
                </div>
            </header>
            <div className="notif-container">
                {loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div>{error}</div>
                ) : (
                    <>
                        <div className="this-week">
                            <h2>This Week</h2>
                            {thisWeek.length === 0 ? (
                                <p>No notifications this week.</p>
                            ) : (
                                <ul>
                                    {thisWeek.map(notification => (
                                        <li 
                                            key={notification.NOTIFICATION_ID} 
                                            className={notification.OPENED ? 'notification-opened' : 'notification-unopened'}
                                        >
                                            <strong>{notification.TITLE}</strong><br />
                                            <em>{notification.timeAgo}</em><br />
                                            <button onClick={() => { setSelectedNotification(notification); markAsOpened(notification); }}>
                                                View
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="older">
                            <h2>Older</h2>
                            {older.length === 0 ? (
                                <p>No older notifications.</p>
                            ) : (
                                <ul>
                                    {older.map(notification => (
                                        <li 
                                            key={notification.NOTIFICATION_ID} 
                                            className={notification.OPENED ? 'notification-opened' : 'notification-unopened'}
                                        >
                                            <strong>{notification.TITLE}</strong><br />
                                            <em>{notification.timeAgo}</em><br />
                                            <button onClick={() => { setSelectedNotification(notification); markAsOpened(notification); }}>
                                                View
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </div>

            {selectedNotification && (
                <div className="overlay">
                    <div className="popup">
                        <div className="popup-content">
                            <h2>{selectedNotification.TITLE}</h2>
                            <p>{selectedNotification.DESCRIPTION}</p>
                            <button onClick={() => setSelectedNotification(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationsPage;
