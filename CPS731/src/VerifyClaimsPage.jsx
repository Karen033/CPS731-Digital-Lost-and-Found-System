import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import './main.css';

function VerifyClaimsPage() {
    const [claims, setClaims] = useState([]);
    const [fetchError, setFetchError] = useState(null);
    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [items, setItems] = useState([]);
    const [users, setUser] = useState([]);

    // Fetch the logged-in user and check if admin
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (user) {
            setLoggedInUser(user);
            if (user.accountType !== 'Admin') {
                navigate('/LoginPage'); // Redirect if not admin
            }
        }
    }, [navigate]);

    // Fetch claims data from CLAIMED table (only Pending initially)
    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const { data, error } = await supabase
                    .from('CLAIMED')
                    .select('CLAIM_ID, STATUS, ITEM_ID, CLAIMANT_ID')
                    .eq('STATUS', 'Pending'); // Filter only Pending claims

                if (error) {
                    setFetchError('Could not fetch claims.');
                    console.error('Error fetching claims:', error);
                } else {
                    setClaims(data);
                    setFetchError(null);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
                setFetchError('An unexpected error occurred.');
            }
        };

        fetchClaims();
    }, []);

    //Fetches item data
    useEffect(() => {
        const fetchItem = async () => {
            try {
                const { data, error } = await supabase
                    .from('ITEM')
                    .select('ITEM_ID, NAME')

                if (error) {
                    setFetchError('Could not fetch items.');
                    console.error('Error fetching items:', error);
                } else {
                    setItems(data);
                    setFetchError(null);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
                setFetchError('An unexpected error occurred.');
            }
        };

        fetchItem();
    }, []);

    //Fetches user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data, error } = await supabase
                    .from('USERS')
                    .select('USER_ID, USER_NAME')

                if (error) {
                    setFetchError('Could not fetch users.');
                    console.error('Error fetching users:', error);
                } else {
                    setUser(data);
                    setFetchError(null);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
                setFetchError('An unexpected error occurred.');
            }
        };

        fetchUser();
    }, []);

    // Map item ID to item name
    const getItemName = (itemId) => {
        const item = items.find((item) => item.ITEM_ID === itemId);
        return item ? item.NAME : 'N/A';
    };

    // Map claimant ID to user name
    const getUserName = (userId) => {
        const user = users.find((user) => user.USER_ID === userId);
        return user ? user.USER_NAME : 'N/A';
    };

    // Handle Approve/Reject
    const handleStatusChange = async (claimantId, claimId, status) => {
        try {
            const { error } = await supabase
                .from('CLAIMED')
                .update({ STATUS: status })
                .eq('CLAIM_ID', claimId);

            const { error: notifError } = await supabase 
                .from ('NOTIFICATIONS')
                .insert([{
                    USER_ID: claimantId,
                    TITLE: "Claim status has changed",
                    DESCRIPTION: `Claim on an item has been ${status}`
            }]);

            if (error || notifError) {
                console.error('Error updating status:', error);
            } else {
                // Re-fetch claims to update the status on the page
                const { data } = await supabase
                    .from('CLAIMED')
                    .select('CLAIM_ID, STATUS, ITEM_ID, CLAIMANT_ID')
                    .eq('STATUS', 'Pending'); // Only Pending claims
                setClaims(data);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    };

    

    // Navigate to the Previously Verified Claims page
    const handleViewVerifiedClaims = () => {
        navigate('/LoginPage/VerifiedClaimsPage'); // Redirect to Verified Claims page
    };

    // Navigate to the homepage
    const handleBackToHomepage = () => {
        navigate('/LoginPage/Home'); // Redirect to homepage
    };

    return (
        <div className="verify-claims-container">
            <h1>Verify Claims</h1>
            <button onClick={handleBackToHomepage}>Back to Homepage</button>
            <button onClick={handleViewVerifiedClaims}>Previously Verified Claims</button>
            {fetchError ? (
                <div className="error-message">
                    <p>{fetchError}</p>
                </div>
            ) : claims.length === 0 ? (
                <div className="no-pending-message">
                    <p>Hoorayyy! No Pending Claims.</p>
                </div>
            ) : (
                <table className="claims-table">
                    <thead>
                        <tr>
                            <th>Claim ID</th>
                            <th>Status</th>
                            <th>Item Name</th>
                            <th>Claimant Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claims.map((claim) => (
                            <tr key={claim.CLAIM_ID}>
                                <td>{claim.CLAIM_ID}</td>
                                <td>{claim.STATUS}</td>
                                <td>{getItemName(claim.ITEM_ID)}</td>
                                <td>{getUserName(claim.CLAIMANT_ID)}</td>
                                <td>
                                    <button
                                        onClick={() =>
                                            handleStatusChange(claim.CLAIMANT_ID, claim.CLAIM_ID, 'Approved')
                                        }
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleStatusChange(claim.CLAIMANT_ID, claim.CLAIM_ID, 'Rejected')
                                        }
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default VerifyClaimsPage;
