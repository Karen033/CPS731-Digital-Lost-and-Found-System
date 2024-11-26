import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "./supabaseClient";
import "./main.css";

function HomePage() {
  const [items, setItems] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const navigate = useNavigate();

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
      <header>
        <h1>Digital Lost and Found</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
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
  );
}

export default HomePage;
