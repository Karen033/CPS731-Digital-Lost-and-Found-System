import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./main.css";
import tmuLogo from "./assets/tmu_logo_cropped.png";
import notificationsIcon from "./assets/notification_icon.png";
import settingsIcon from "./assets/settings_icon.png";
import supabase from "./supabaseClient";

function HomePage() {
    const [items, setItems] = useState([]);
    const [fetchError, setFetchError] = useState(null);
    const navigate = useNavigate();
    const [isPopupOpen, setIsPopupOpen] = useState(false);

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
            <div>
                <input 
                className="search"
                type="text"
                placeholder="search"
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
                <button className="notification">
                    <img src={notificationsIcon} />
                </button>
                <button className="settings">
                    <img src={settingsIcon} />
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
                  src={item.IMAGE_URL}
                  alt={item.NAME}
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
