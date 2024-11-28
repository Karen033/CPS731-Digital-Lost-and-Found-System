import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./main.css";
import userIcon from "./assets/user_icon.png";
import settingsIcon from "./assets/settings_icon.png";
import supabase from "./supabaseClient";
import { Link } from "react-router-dom";

function UpdateLostPage () {
    const { item_id: ITEM_ID } = useParams(); // Get the ITEM_ID from the URL params
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [building, setBuilding] = useState('');
    const [room, setRoom] = useState('');
    const [date, setDate] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(null);
    const [locationId, setLocationId] = useState(null); // Store LOCATION_ID
    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Get logged-in user from localStorage
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        if (user) {
            setLoggedInUser(user);
        }
    }, []);

    // Fetch the existing report data when the component mounts
    useEffect(() => {
        const fetchReportDetails = async () => {
            try {
                // First, fetch the LOCATION_ID from LOST_AT table
                const { data: lostAtData, error: lostAtError } = await supabase
                    .from('LOST_AT')
                    .select('LOCATION_ID, DATE')
                    .eq('ITEM_ID', ITEM_ID)  // Use the itemId as an integer
                    .single();

                if (lostAtError) {
                    console.error("Error fetching LOST_AT data:", lostAtError.message);
                    return;
                }

                // Now, use the LOCATION_ID from LOST_AT to fetch location data
                const { data: locationData, error: locationError } = await supabase
                    .from('LOCATION')
                    .select('BUILDING, ROOM')
                    .eq('LOCATION_ID', lostAtData?.LOCATION_ID)
                    .single();

                if (locationError) {
                    console.error("Error fetching location data:", locationError.message);
                    return;
                }

                // Fetch item details (NAME, DESCRIPTION, etc.) from ITEM table
                const { data: itemData, error: itemError } = await supabase
                    .from('ITEM')
                    .select('NAME, DESCRIPTION, STATUS, IMAGE_URL, ITEM_ID')
                    .eq('ITEM_ID', ITEM_ID)  // Use the itemId as an integer
                    .single();

                if (itemError) {
                    console.error("Error fetching item data:", itemError.message);
                    return;
                }

                // Set the state with fetched data
                setName(itemData?.NAME || '');
                setDescription(itemData?.DESCRIPTION || '');
                setStatus(itemData?.STATUS || '');
                setBuilding(locationData?.BUILDING || '');
                setRoom(locationData?.ROOM || '');
                setDate(lostAtData?.DATE || '');  // Set the lost date
                setLocationId(lostAtData?.LOCATION_ID); // Store LOCATION_ID

            } catch (error) {
                console.error("Error fetching report details:", error);
            }
        };

        fetchReportDetails();
    }, [ITEM_ID]);

    // Helper function to sanitize filenames
    const sanitizeFileName = (fileName) => {
        return fileName.replace(/[^a-zA-Z0-9.-_]/g, '_');
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleReport = async () => {
        if (!name || !description || !building || !date) {
            alert("Please fill out required fields");
            return;
        }

        // Validate room (optional field)
        const roomNumber = room ? parseInt(room, 10) : null;
        if (room && isNaN(roomNumber)) {
            alert("Room must be a valid number.");
            return;
        }

        // Ensure date is in valid format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            alert("Date must be in YYYY-MM-DD format.");
            return;
        }

        setUploading(true);
        try {
            let fileName = null;

            // Prepare the update payload for the ITEM table
            const itemUpdatePayload = {
                NAME: name,
                DESCRIPTION: description,
            };

            if (file) {
                const sanitizedFileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
                const { error: uploadError } = await supabase.storage
                    .from('items')
                    .upload(sanitizedFileName, file);

                if (uploadError) {
                    setMessage('Upload failed.');
                    console.error('Error uploading file:', uploadError.message);
                    return;
                }
                fileName = sanitizedFileName;
                itemUpdatePayload.IMAGE_URL = fileName;
            }

            const { error: itemError } = await supabase
                .from('ITEM')
                .update(itemUpdatePayload)
                .eq('ITEM_ID', ITEM_ID);

            if (itemError) {
                console.error('Update error:', itemError);
                setStatus('Error updating item. Please try again.');
                return;
            }

            const { error: locError } = await supabase
                .from('LOCATION')
                .update({ BUILDING: building, ROOM: room ? parseInt(room) : null })
                .eq('LOCATION_ID', locationId);

            if (locError) {
                console.error('Update error:', locError);
                setStatus('Error updating location. Please try again.');
                return;
            }

            const { error: lostAtError } = await supabase
                .from('LOST_AT')
                .update({ DATE: date })
                .eq('ITEM_ID', ITEM_ID);

            if (lostAtError) {
                console.error('Update error:', lostAtError);
                setStatus('Error updating lost date.');
                return;
            }

            const { error: notifError } = await supabase 
                .from ('NOTIFICATIONS')
                .insert([{
                    USER_ID: loggedInUser.id,
                    TITLE: "Update On Item Received",
                    DESCRIPTION: `Information on lost item, ${name}, was successfully updated`
            }]);

            if (notifError) {
                console.error('Insert error:', notifError);
                setStatus('Error creating notification');
                return;
            }

            setMessage('Item successfully updated.');
            // Redirect or clear form
            navigate("/LoginPage/ProfileManagement/ViewLostReportHistory");
        } catch (error) {
            console.error('Error:', error.message);
            setMessage('An unexpected error occurred.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="lost-item-page">
            <header>
                <button className="settings">
                    <Link to="/LoginPage/ProfileManagement/Settings">
                        <img src={settingsIcon} alt="Settings" />
                    </Link>
                </button>
                <h1>Update Lost Item Report</h1>
                <button className="profile">
                    <Link to="/LoginPage/ProfileManagement">
                        <img src={userIcon} />
                    </Link>
                </button>
            </header>
            <div className="lost-container">
                <h3>Name of the item lost:</h3>
                <input
                    type="text"
                    placeholder="Input String"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="lost-container">
                <h3>Description of the item:</h3>
                <input
                    type="text"
                    placeholder="Input String"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div className="lost-container">
                <h3>Building the item was lost in:</h3>
                <input
                    type="text"
                    placeholder="Input String"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                />
            </div>
            <div className="lost-container">
                <h3>Room# if applicable:</h3>
                <input
                    type="number"
                    placeholder="Input Number"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                />
            </div>
            <div className="lost-container">
                <h3>Date the item was lost:</h3>
                <input
                    type="date"
                    placeholder="Input YYYY-MM-DD"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>
            <div className="lost-container">
                <h3>Upload an image of the item (optional):</h3>
                <input
                    type="file"
                    onChange={handleFileChange}
                />
            </div>
            <div>
                <button onClick={handleReport}>Update Report</button>
            </div>
            {message && <p>{message}</p>}
        </div>
    );
}

export default UpdateLostPage;
