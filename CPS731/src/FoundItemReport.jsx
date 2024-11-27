import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./main.css";
import userIcon from "./assets/user_icon.png";
import settingsIcon from "./assets/settings_icon.png";
import supabase from "./supabaseClient";

function FoundItemPage () {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [building, setBuilding] = useState('');
    const [room, setRoom] = useState('');
    const [date, setDate] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(null);
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
            }
    
            const { error: itemError } = await supabase
                .from('ITEM')
                .insert([{ NAME: name, DESCRIPTION: description, STATUS: 'FOUND', IMAGE_URL: fileName }]);
    
            if (itemError) {
                console.error('Insert error:', itemError);
                setStatus('Error registering item. Please try again.');
                return;
            }
    
            const { error: locError } = await supabase
                .from('LOCATION')
                .insert([{ BUILDING: building, ROOM: room ? parseInt(room) : null }]);
    
            if (locError) {
                console.error('Insert error:', locError);
                setStatus('Error registering location. Please try again.');
                return;
            }
    
            const { data: itemData } = await supabase
                .from('ITEM')
                .select('ITEM_ID')
                .order('ITEM_ID', { ascending: false })
                .limit(1)
                .single();
    
            const itemId = itemData?.ITEM_ID;
    
            const { data: locationData } = await supabase
                .from('LOCATION')
                .select('LOCATION_ID')
                .order('LOCATION_ID', { ascending: false })
                .limit(1)
                .single();
    
            const locationId = locationData?.LOCATION_ID;
    
            const { error: lostAtError } = await supabase
                .from('FOUND_AT')
                .insert([{ ITEM_ID: itemId, LOCATION_ID: locationId, DATE: date }]);
    
            if (lostAtError) {
                console.error('Insert error:', lostAtError);
                setStatus('Error linking item and location.');
                return;
            }
    
            const { error: submitError } = await supabase
                .from('SUBMITS')
                .insert([{ USER_ID: loggedInUser.id, ITEM_ID: itemId }]);
    
            if (submitError) {
                console.error('Insert error:', submitError);
                setStatus('Error submitting report.');
                return;
            }
    
            setMessage('Item successfully registered.');

            // Clear input fields
            setName('');
            setDescription('');
            setBuilding('');
            setRoom('');
            setDate('');
            setFile(null);
        } catch (error) {
            console.error('Error:', error.message);
            setMessage('An unexpected error occurred.');
        } finally {
            setUploading(false);
        }
    };    

    return (
        <div className="found-item-page">
            <header>
                <button className="settings">
                    <img src={settingsIcon} />
                </button>
                <h1>Report Found Item</h1>
                <button className="profile">
                    <img src={userIcon} />
                </button>
            </header>
            <div className="found-container">
                <h3>Name of the item found:</h3>
                <input
                    type="text"
                    placeholder="Input String"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="found-container">
                <h3>Description of the item:</h3>
                <input
                    type="text"
                    placeholder="Input String"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div className="found-container">
                <h3>Building the item was found in:</h3>
                <input
                    type="text"
                    placeholder="Input String"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                />
            </div>
            <div className="found-container">
                <h3>Room# if applicable:</h3>
                <input
                    type="number"
                    placeholder="Input Number"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                />
            </div>
            <div className="found-container">
                <h3>Date the item was found:</h3>
                <input
                    type="date"
                    placeholder="Input YYYY-MM-DD"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>
            <div className="found-container">
                <h3>Upload an image of the item (optional):</h3>
                <input
                    type="file"
                    onChange={handleFileChange}
                />
            </div>
            <div>
                <button onClick={handleReport}>Create Report</button>
            </div>
            {message && <p>{message}</p>}
        </div>
    );
}

export default FoundItemPage;