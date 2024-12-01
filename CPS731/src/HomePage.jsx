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
    const [accountType, setAccountType] = useState(null); // To store the account type (Student/Admin)
    const [items, setItems] = useState([]);
    const [fetchError, setFetchError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
    const navigate = useNavigate();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [unopenedCount, setUnopenedCount] = useState(0);

    // Get logged-in user from localStorage and fetch account type
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        if (user) {
            setLoggedInUser(user);
            fetchAccountType(user.id);
            performMatchCheck(user.id);
        }
    }, []);

    const performMatchCheck = async (userId) => {
        try {
            const { data: lostItems, error: lostError } = await supabase
                .from("ITEM")
                .select("ITEM_ID, NAME, DESCRIPTION, LOCATION_ID")
                .eq("STATUS", "LOST")
                .eq("USER_ID", userId);

            if (lostError) {
                console.error("Error fetching lost items:", lostError);
                return;
            }

            for (const lostItem of lostItems) {
                const { data: matchingItems, error: matchError } = await supabase
                    .from("ITEM")
                    .select("ITEM_ID, NAME, DESCRIPTION, LOCATION_ID")
                    .eq("STATUS", "FOUND")
                    .ilike("NAME", `%${lostItem.NAME}%`)
                    .ilike("DESCRIPTION", `%${lostItem.DESCRIPTION}%`)
                    .eq("LOCATION_ID", lostItem.LOCATION_ID);

                if (matchError) {
                    console.error("Error fetching matching items:", matchError);
                    return;
                }

                if (matchingItems && matchingItems.length > 0) {
                    navigate("/LoginPage/Home/ItemPageMatch", { state: { matches: matchingItems } });
                    return; // Stop further checks once a match is found
                }
            }
        } catch (error) {
            console.error("Unexpected error during match checking:", error);
        }
    };

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

            setAccountType(data.ACCOUNT_TYPE); // Store account type
        } catch (error) {
            console.error("Error fetching account type:", error);
        }
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

    useEffect(() => {
        const fetchItemsForUser = async () => {
            if (!loggedInUser || !accountType) {
                return;
            }

            try {
                if (accountType === "Admin") {
                    const { data: allItems, error: itemsError } = await supabase
                        .from("ITEM")
                        .select("ITEM_ID, NAME, DESCRIPTION, STATUS, IMAGE_URL");

                    if (itemsError) {
                        console.error("Error fetching items:", itemsError);
                        setFetchError("Could not fetch items.");
                    } else {
                        setItems(allItems);
                        setFetchError(null);
                    }
                } else if (accountType === "Student") {
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

                    const { data: foundItems, error: itemsError } = await supabase
                        .from("ITEM")
                        .select("ITEM_ID, NAME, DESCRIPTION, STATUS, IMAGE_URL")
                        .eq("STATUS", "FOUND");

                    if (itemsError) {
                        console.error("Error fetching found items:", itemsError);
                        setFetchError("Could not fetch found items.");
                    } else {
                        setItems(foundItems);
                        setFetchError(null);
                    }
                }
            } catch (error) {
                console.error("Unexpected error fetching items:", error);
                setFetchError("An unexpected error occurred.");
            }
        };

        fetchItemsForUser();
    }, [loggedInUser, accountType]);

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

    const handleClaim = async (item) => {
      if (!loggedInUser) {
          console.error("User not logged in.");
          alert("You need to log in to claim items.");
          return;
      }
  
      try {
          // Insert the claim into the CLAIMED table
          const { data, error } = await supabase
              .from("CLAIMED")
              .insert({
                  ITEM_ID: item.ITEM_ID,
                  CLAIMANT_ID: loggedInUser.id,
              });
  
          if (error) {
              console.error("Error claiming item:", error);
              alert("An error occurred while claiming the item. Please try again.");
          } else {
              console.log("Item claimed successfully:", data);
              alert(`You have successfully claimed the item: ${item.NAME}`);
          }
      } catch (error) {
          console.error("Unexpected error while claiming item:", error);
          alert("An unexpected error occurred. Please try again.");
      }
  };

    const handleLogout = () => {
        localStorage.removeItem("loggedInUser");
        navigate("/LoginPage");
    };

    const filteredItems = items.filter((item) =>
        item.NAME.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.DESCRIPTION.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="home-page">
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

                    {/* Admin-only Verify Claims Button */}
                    {accountType === "Admin" && (
                        <Link to="/LoginPage/VerifyClaimsPage">
                            <button className="verify-claims-button">
                                Verify Claims
                            </button>
                        </Link>
                     )}
                </div>
            </header>

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
                                <button className="claim-button" onClick={() => handleClaim(item)}>
                                    Claim
                                </button>
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
