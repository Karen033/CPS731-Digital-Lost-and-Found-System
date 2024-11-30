import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./main.css";
import tmuLogo from "./assets/tmu_logo_cropped.png";
import search_icon from "./assets/search_icon.png";
import notificationsIcon from "./assets/notification_icon.png";
import profileIcon from "./assets/user_icon.png";
import supabase from "./supabaseClient";
import { Link } from "react-router-dom";

function HomePage() {
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [items, setItems] = useState([]);
    const [fetchError, setFetchError] = useState(null);
    const navigate = useNavigate();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [unopenedCount, setUnopenedCount] = useState(0);

    // Get logged-in user from localStorage
    useEffect(() => {
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      console.log("Logged in user:", user); // Debugging
      if (user) {
          setLoggedInUser(user);
      }
  }, []);

    // Open confirmation popup
    const handleReportClick = () => {
        setIsPopupOpen(true);
    };

    const handleLostItem = () => {
        setIsPopupOpen(false);
        navigate("/LoginPage/LostItemReport");
    };
  
    const handleFoundItem = () => {
      setIsPopupOpen(false);
      navigate("/LoginPage/FoundItemReport");
    };

    useEffect(() => {
        const fetchItems = async () => {
        const { data, error } = await supabase
            .from("ITEM") // Name of the table in Supabase
            .select("ITEM_ID, NAME, DESCRIPTION, STATUS, IMAGE_URL");

        if (error) {
            console.error("Error fetching items:", error);
            setFetchError("Could not fetch items");
        } else {
            setItems(data);
        }
        };

    fetchItems();
  }, []);

  // Fetch unopened notifications count
  useEffect(() => {
    if (!loggedInUser) return; // Avoid fetching if user is not set

    const fetchUnopenedNotifications = async () => {
      const { data, error } = await supabase
        .from("NOTIFICATIONS")
        .select("NOTIFICATION_ID", { count: "exact" })
        .eq("USER_ID", loggedInUser.id)
        .eq("OPENED", false);

      if (error) {
        console.error("Error fetching unopened notifications:", error);
        return;
      }

      setUnopenedCount(data.length); // Update the count of unopened notifications
    };

    fetchUnopenedNotifications();
  }, [loggedInUser]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/LoginPage");
  };

  return (
    <div className="home-page">
      {/* Header Section */}
      <header className="header">
            <div>
                <img src={tmuLogo} className="header_logo" />
            </div>
            <div style={{ position: "relative", display: "inline-block" }}>
  <input
    className="search"
    type="text"
    placeholder="search"
    style={{
      paddingRight: "30px", // Add space for the icon
      width: "400px", // Adjust width as needed
      height: "30px", // Adjust height as needed
    }}
  />
  <img
    src={search_icon}
    className="search_icon"
    alt="search"
    style={{
      position: "absolute",
      right: "10px", // Adjust spacing
      top: "50%",
      transform: "translateY(-50%)", // Center vertically
      width: "20px",
      height: "20px",
      pointerEvents: "none", // Ensure the icon doesn't interfere with input clicks
    }}
  />
</div>

            <div className="buttons">
                <button className="report" onClick={handleReportClick}>Report Item</button>
                {isPopupOpen && (
                    <div className="overlay">
                    <div className="popup">
                    <p>What type of item do you want to report?</p>
                    <button onClick={handleLostItem} className="report">
                        Lost Item
                    </button>
                    <button onClick={handleFoundItem} className="report">
                        Found Item
                    </button>
                    </div>
                </div>
                )}
                <div className="notification-wrapper">
                  <button className="notification">
                    <Link to="/LoginPage/Home/Notifications">
                      <img src={notificationsIcon} />
                      {unopenedCount > 0 && (
                        <span className="notification-badge">{unopenedCount}</span>
                      )}
                    </Link>
                  </button>
                </div>
                <button className="profile">
                    <Link to="/LoginPage/ProfileManagement"><img src={profileIcon} /></Link>
                </button>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>
        </header>
      {fetchError ? (
        <p className="error">{fetchError}</p>
      ) : (
        <div className="item-container">
          {items.map((item) => (
            <div key={item.ITEM_ID} className="item-card">
              {item.IMAGE_URL && (
                <img
                  src={`https://npuneojjiqzybvnjnfsv.supabase.co/storage/v1/object/public/items/${item.IMAGE_URL}`}
                  alt={item.NAME}
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                  className="item-image"
                />
              )}
              <h2 className="item-name">{item.NAME}</h2>
              <p className="item-description">{item.DESCRIPTION}</p>
              <p className={`item-status ${item.STATUS.toLowerCase()}`}>
                {item.STATUS}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

export default HomePage;
