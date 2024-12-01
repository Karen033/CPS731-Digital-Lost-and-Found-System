import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "./supabaseClient";

function ItemMatchPage() {
    
    const location = useLocation();
    const navigate = useNavigate();
    const [match, setMatch] = useState(null);
    const [error, setError] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null);


    const { lostItemName, lostItemDescription } = location.state || {};
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        if (user) {
            setLoggedInUser(user);
        }
    }, []);

    useEffect(() => {
        if (!lostItemName || !lostItemDescription) {
            setError("Lost item information is missing.");
            return;
        }


        const fetchMatch = async () => {
            try {
                const { data: itemData, error: itemError } = await supabase
            .from("ITEM")
            .select("ITEM_ID, NAME, DESCRIPTION, IMAGE_URL, STATUS")
            .eq("NAME", lostItemName)
            .eq("DESCRIPTION", lostItemDescription)
            .eq("STATUS", "FOUND") // Ensure the status is "FOUND"
            .single();

        if (itemError || !itemData) {
            console.error("Error fetching item:", itemError);
            setError("No matching item found.");
            return;
        }

        const { ITEM_ID } = itemData;

        // Step 2: Fetch the location and date details using ITEM_ID
        const { data: foundAtData, error: foundAtError } = await supabase
            .from("FOUND_AT")
            .select("DATE, LOCATION_ID")
            .eq("ITEM_ID", ITEM_ID)
            .single();

        if (foundAtError || !foundAtData) {
            console.error("Error fetching found_at details:", foundAtError);
            setError("No location or date information available.");
            return;
        }

        const { DATE, LOCATION_ID } = foundAtData;

        // Step 3: Fetch building and room details using LOCATION_ID
        const { data: locationData, error: locationError } = await supabase
            .from("LOCATION")
            .select("BUILDING, ROOM")
            .eq("LOCATION_ID", LOCATION_ID)
            .single();

        if (locationError || !locationData) {
            console.error("Error fetching location details:", locationError);
            setError("No building or room information available.");
            return;
        }

        // Combine all fetched data into one object
        const itemDetails = {
            name: itemData.NAME,
            description: itemData.DESCRIPTION,
            imageUrl: itemData.IMAGE_URL,
            date: DATE,
            building: locationData.BUILDING,
            room: locationData.ROOM,
        };

        setMatch(itemDetails);
            } catch (error) {
                console.error("Unexpected error:", error);
                setError("An unexpected error occurred.");
            }
        };

        fetchMatch();
    }, [lostItemName, lostItemDescription]);
    

    const handleBack = () => {
        navigate("/LoginPage/Home");
    };

    const handleYes = async(data) => {
        if (!loggedInUser) {
            console.error("User not logged in.");
            alert("You need to log in to claim items.");
            return;
        }
        alert("You have confirmed the item.");
        navigate("/LoginPage/Home"); // Redirect after confirmation
    };

    const handleNo = () => {
        alert("Sorry to hear that. You can try searching for more items.");
        navigate("/LoginPage/Home"); // Redirect after rejection
    };

    const handleClaim = async (itemData) => {
        
        try {
            // Insert the claim into the CLAIMED table
            const { data, error } = await supabase
                .from("CLAIMED")
                .insert({
                    ITEM_ID: itemData.ITEM_ID,
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

    return (
        <div>
            <header>
                <button onClick={handleBack}>← Back</button>
            </header>
            {error ? (
                <div>
                    <p>{error}</p>
                    <button onClick={handleBack}>Back to Home</button>
                </div>
            ) : match ? (
                <div>
                    <h2>Is This Your Item?</h2>
                    <div key={match.ITEM_ID}>
                        {match.imageUrl && (
                            <img
                            src={`https://npuneojjiqzybvnjnfsv.supabase.co/storage/v1/object/public/items/${match.imageUrl}`}
                            alt={match.NAME}
                            style={{ width: "300px", height: "300px", objectFit: "cover" }}
                        />
                        )}
                        <div>
                            <p><strong>Name: </strong>{match.name}</p>
                            <p><strong>Description: </strong>{match.description}</p>
                            <p><strong>Location: </strong>{match.building} {match.room ? `, Room ${match.room}` : ""}</p>
                            <p><strong>Date:</strong> {new Date(match.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div>
                        <button onClick={handleYes}>Yes</button>
                        <button onClick={handleNo}>No</button>
                    </div>
                </div>
            ) : (
                <p>Checking for matches...</p>
            )}
        </div>
    );
}

export default ItemMatchPage;
