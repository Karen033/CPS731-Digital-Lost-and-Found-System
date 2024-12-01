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
    const [accountType, setAccountType] = useState(null);  // To store the account type (Student/Admin)
    const [items, setItems] = useState([]);
    const [fetchError, setFetchError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");  // State to store the search query
    const navigate = useNavigate();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [unopenedCount, setUnopenedCount] = useState(0);
    const [isLostItemPopupOpen, setIsLostItemPopupOpen] = useState(false); // New state for Lost Item Popup
    const [lostItemName, setLostItemName] = useState("");
    const [lostItemDescription, setLostItemDescription] = useState("");
 

    // Get logged-in user from localStorage and fetch account type
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        if (user) {
            setLoggedInUser(user);
            fetchAccountType(user.id);
        }
    }, []);

    // Fetch account type (Student/Admin) from USERS table
    const fetchAccountType = async (userId) => {
        try {
            const { data, error } = await supabase
                .from("USERS")
                .select("ACCOUNT_TYPE")
                .eq("USER_ID", userId)
                .single();

            if (error) {
                console.error("Error fetching account type:", error);
                return;
            }

            setAccountType(data.ACCOUNT_TYPE);  // Store account type
        } catch (error) {
            console.error("Error fetching account type:", error);
        }
    };
    const handleCheckMatch = async () => {
      if (!lostItemName || !lostItemDescription) {
          alert("Please fill in both the name and description of the lost item.");
          return;
      }

      try {
          const { data, error } = await supabase
              .from("ITEM")
              .select("*")
              .eq("NAME", lostItemName)
              .eq("DESCRIPTION", lostItemDescription)
              .eq("STATUS", "FOUND");

          if (error) {
              console.error("Error checking for match:", error);
              alert("An error occurred while checking for a match.");
              return;
          }

          if (data.length > 0) {
              navigate("/LoginPage/Home/ItemPageMatch", { state: { lostItemName, lostItemDescription } });
          } else {
              alert("No match found for the lost item.");
          }
      } catch (error) {
          console.error("Unexpected error:", error);
          alert("An unexpected error occurred.");
      }
  };
   
    // Open confirmation popup
    const handleCancel = () => {
      setLostItemName("");        
      setLostItemDescription("");
      setIsLostItemPopupOpen(false);
  };
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
    const handleLostItemPopup = () => {
      setIsLostItemPopupOpen(true);
  };

    // Fetch items based on account type (Admin or Student)
    useEffect(() => {
        const fetchItemsForUser = async () => {
            if (!loggedInUser || !accountType) {
                return;
            }

            try {
                if (accountType === "Admin") {
                    // Admin: Fetch all lost and found items
                    const { data: allItems, error: itemsError } = await supabase
                        .from("ITEM")
                        .select("ITEM_ID, NAME, DESCRIPTION, STATUS, IMAGE_URL");

                    if (itemsError) {
                        console.error("Error fetching items:", itemsError);
                        setFetchError("Could not fetch items.");
                    } else {
                        setItems(allItems);
                        setFetchError(null); // Clear any previous errors
                    }
                } else if (accountType === "Student") {
                    // Student: Check if the user has reported a lost item
                    const { data: submitsData, error: submitsError } = await supabase
                        .from("SUBMITS")
                        .select("ITEM_ID")
                        .eq("USER_ID", loggedInUser.id);

                    if (submitsError) {
                        console.error("Error checking lost item reports:", submitsError);
                        setFetchError("Could not verify user submissions.");
                        return;
                    }

                    if (submitsData.length === 0) {
                        setFetchError("You need to report a lost item before viewing found items.");
                        return;
                    }

                    // Student: Fetch all found items
                    const { data: foundItems, error: itemsError } = await supabase
                        .from("ITEM")
                        .select("ITEM_ID, NAME, DESCRIPTION, STATUS, IMAGE_URL")
                        .eq("STATUS", "FOUND");

                    if (itemsError) {
                        console.error("Error fetching found items:", itemsError);
                        setFetchError("Could not fetch found items.");
                    } else {
                        setItems(foundItems);
                        setFetchError(null); // Clear any previous errors
                    }
                }
            } catch (error) {
                console.error("Unexpected error fetching items:", error);
                setFetchError("An unexpected error occurred.");
            }
        };

        fetchItemsForUser();
    }, [loggedInUser, accountType]);

    // Fetch unopened notifications count
    useEffect(() => {
        if (!loggedInUser) return;

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

            setUnopenedCount(data.length);
        };

        fetchUnopenedNotifications();
    }, [loggedInUser]);

    const handleLogout = () => {
        localStorage.removeItem("loggedInUser");
        navigate("/LoginPage");
    };

    // Filter items based on search query
    const filteredItems = items.filter((item) =>
        item.NAME.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.DESCRIPTION.toLowerCase().includes(searchQuery.toLowerCase())
    );



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
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            paddingRight: "30px",
                            width: "400px",
                            height: "30px",
                        }}
                    />
                    <img
                        src={search_icon}
                        className="search_icon"
                        alt="search"
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "20px",
                            height: "20px",
                            pointerEvents: "none",
                        }}
                    />
                </div>

                <div className="buttons">
                  <button className="report" onClick={handleLostItemPopup}>
                        Lost Item Match
                  </button>
                  {isLostItemPopupOpen && (
                        <div className="overlay">
                            <div className="popup">
                                <h3>Item Match</h3>
                                <input
                                    type="text"
                                    placeholder="Lost Item Name"
                                    value={lostItemName}
                                    onChange={(e) => setLostItemName(e.target.value)}
                                />
                                <textarea
                                    placeholder="Lost Item Description"
                                    value={lostItemDescription}
                                    onChange={(e) => setLostItemDescription(e.target.value)}
                                ></textarea>
                                <div className="popup-buttons">
                                    <button onClick={handleCheckMatch} className="report">
                                        Check Match
                                    </button>
                                    <button onClick={handleCancel} className="cancel">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <button className="report" onClick={handleReportClick}>
                        Report Item
                    </button>
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
                        <Link to="/LoginPage/ProfileManagement">
                            <img src={profileIcon} />
                        </Link>
                    </button>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content Section */}
            {fetchError ? (
                <div className="center-message">
                    <p className="error">{fetchError}</p>
                </div>
            ) : (
                <div className="item-container">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
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
                        ))
                    ) : (
                        <p>No items to display</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default HomePage;
