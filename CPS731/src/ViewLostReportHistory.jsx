import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supabase from "./supabaseClient";
import "./main.css";
import tmuLogo from "./assets/tmu_logo_cropped.png";
import backIcon from "./assets/back_icon.png";
import profileIcon from "./assets/user_icon.png";
import settingIcon from "./assets/settings_icon.png";

function ViewLostReportHistory() {
  const [submissions, setSubmissions] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Retrieve logged-in user information
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (user) {
      setLoggedInUser(user);
    }
  }, []);

  // Fetch all necessary data
  useEffect(() => {
    if (!loggedInUser) return; // Wait until the logged-in user is available

    const fetchLostReportHistory = async () => {
      try {
        // Fetch submissions to get items submitted by the logged-in user
        const { data: submits, error: submitsError } = await supabase
          .from("SUBMITS")
          .select("USER_ID, ITEM_ID")
          .eq("USER_ID", loggedInUser.id); // Filter by logged-in user's ID
        if (submitsError) throw submitsError;

        const submittedItemIds = submits.map((submit) => submit.ITEM_ID);

        // Fetch items with LOST status associated with the logged-in user
        const { data: items, error: itemsError } = await supabase
          .from("ITEM")
          .select("ITEM_ID, NAME, DESCRIPTION, STATUS, IMAGE_URL")
          .in("ITEM_ID", submittedItemIds) // Filter by submitted ITEM_IDs
          .eq("STATUS", "LOST"); // Only include items with LOST status
        if (itemsError) throw itemsError;

        // Fetch lost_at data
        const { data: lostAts, error: lostAtsError } = await supabase
          .from("LOST_AT")
          .select("ITEM_ID, LOCATION_ID, DATE");
        if (lostAtsError) throw lostAtsError;

        // Fetch location data
        const { data: locations, error: locationsError } = await supabase
          .from("LOCATION")
          .select("LOCATION_ID, BUILDING, ROOM");
        if (locationsError) throw locationsError;

        const combinedData = items.map((item) => {
            const lostAt = lostAts.find((lost) => lost.ITEM_ID === item.ITEM_ID);
            const location = locations.find(
              (loc) => loc.LOCATION_ID === lostAt?.LOCATION_ID
            );
          
            // Format location based on ROOM value
            const formattedLocation = location
              ? location.ROOM
                ? `${location.BUILDING} (${location.ROOM})`
                : `${location.BUILDING}`
              : "Location not found";
          
            return {
              ...item,
              date: lostAt?.DATE,
              location: formattedLocation,
            };
          });
          
        setSubmissions(combinedData);
      } catch (error) {
        console.error("Error fetching lost report history:", error);
        setFetchError("Could not fetch lost report history.");
      }
    };

    fetchLostReportHistory();
  }, [loggedInUser]);

  return (
    <div className="view-lost-page">
      <header className="header">
        <div>
          <button className="back">
            <Link to="/LoginPage/ProfileManagement">
              <img src={backIcon} alt="Back" />
            </Link>
          </button>
        </div>
        <div className="buttons">
          <button className="settings">
            <img src={settingIcon} alt="Settings" />
          </button>
          <button className="profile">
            <Link to="/LoginPage/ProfileManagement">
              <img src={profileIcon} alt="Profile" />
            </Link>
          </button>
        </div>
      </header>

      <div>
        <img src={tmuLogo} alt="TMU Logo" />
      </div>
      <div className="view-buttons">
      <button>
            <Link to="/LoginPage/ProfileManagement/ViewLostReportHistory">Lost</Link>
        </button>
        <button>
            <Link to="/LoginPage/ProfileManagement/ViewFoundReportHistory">Found</Link>
        </button>
      </div>

      {fetchError ? (
        <p className="error-message">{fetchError}</p>
      ) : submissions.length > 0 ? (
        <ul className="submission-list">
          {submissions.map((submission) => {
            console.log("submission.IMAGE_URL:", submission.IMAGE_URL); // Check the path

            // Check if IMAGE_URL exists
            if (!submission.IMAGE_URL) {
              console.log("No IMAGE_URL found for this item.");
              return (
                <li key={submission.ITEM_ID} className="lost-item-container">
                  <div className="info">
                    <h4>{submission.date || "Unknown Date"}</h4>
                    <h2>{submission.NAME}</h2>
                    <h4>{submission.location}</h4>
                    <p>{submission.DESCRIPTION}</p>
                  </div>
                  <div className="right">
                    <p>Image not available</p>
                    <button className="edit">
                        <Link to={`/LoginPage/ProfileManagement/ViewLostReportHistory/${submission.ITEM_ID}/UpdateLostReport`}>Edit Report</Link>
                    </button>
                  </div>
                </li>
              );
            }

            const publicUrl = `https://npuneojjiqzybvnjnfsv.supabase.co/storage/v1/object/public/items/${submission.IMAGE_URL}`;

            console.log("Directly generated public URL:", publicUrl);

            return (
              <li key={submission.ITEM_ID} className="lost-item-container">
                <div className="info">
                  <h4>{submission.date || "Unknown Date"}</h4>
                  <h2>{submission.NAME}</h2>
                  <h4>{submission.location}</h4>
                  <p>{submission.DESCRIPTION}</p>
                </div>
                <div className="right">
                    {publicUrl ? (
                    <img
                        src={publicUrl}
                        alt={submission.NAME}
                        style={{ maxWidth: "200px", maxHeight: "200px" }} // Optional styling to control image size
                    />
                    ) : (
                    <p>Image not available</p>
                    )}
                    <button className="edit">
                        <Link to={`/LoginPage/ProfileManagement/ViewLostReportHistory/${submission.ITEM_ID}/UpdateLostReport`}>Edit Report</Link>
                    </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No lost items found.</p>
      )}
    </div>
  );
}

export default ViewLostReportHistory;
