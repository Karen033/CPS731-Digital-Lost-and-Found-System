import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./main.css";

// Initialize Supabase client
const supabase = createClient("https://npuneojjiqzybvnjnfsv.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdW5lb2pqaXF6eWJ2bmpuZnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNDIwNDgsImV4cCI6MjA0NzYxODA0OH0.lDJb8FvMrcRAzHtFR1QvRFWcZp3FcQWzoYcBJ1VdnoU");

const ItemMatchPage = () => {
  const [match, setMatch] = useState(null); // Store a single match
  const [loading, setLoading] = useState(true);

  // Fetch match data from Supabase
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const { data, error } = await supabase
          .from("matches") // Replace with your Supabase table name
          .select("*")
          .limit(1); // Fetch only one item match for simplicity

        if (error) throw error;

        if (data.length > 0) {
          setMatch(data[0]); // Set the first match
        }
      } catch (error) {
        console.error("Error fetching match data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, []);

  const handleYesClick = () => {
    alert("You selected 'Yes'! Proceeding to contact the reporter...");
    // Add additional logic, such as marking the item as claimed
  };

  const handleNoClick = () => {
    alert("You selected 'No'. Searching for other matches...");
    // Add additional logic, such as fetching another match
  };

  if (loading) {
    return <div className="loading">Loading match...</div>;
  }

  if (!match) {
    return <div className="no-match">No matches found at the moment.</div>;
  }

  return (
    <div className="item-match-page">
      <header className="header">
        <button className="back-button">←</button>
        <h1>Item Match Page</h1>
        <button className="settings-button">⚙️</button>
      </header>
      <div className="item-content">
        <h2>Is This Your Item?</h2>
        <div className="item-card">
          <img
            src={match.image_url || "/placeholder.png"} // Fallback image
            alt={match.name}
            className="item-image"
          />
          <div className="item-info">
            <h3>{match.name}</h3>
            <p className="item-category">{match.category || "Uncategorized"}</p>
            <p className="item-description">{match.description}</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="yes-button" onClick={handleYesClick}>
            Yes
          </button>
          <button className="no-button" onClick={handleNoClick}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemMatchPage;
