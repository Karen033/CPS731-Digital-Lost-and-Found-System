import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './main.css';

function VerifiedClaimsPage() {
    const [claims, setClaims] = useState([]);
    const [fetchError, setFetchError] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate
    const [items, setItems] = useState([]);
    const [users, setUser] = useState([]);

    // Fetch claims data from CLAIMED table (Approved or Rejected)
    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const { data, error } = await supabase
                    .from('CLAIMED')
                    .select('CLAIM_ID, STATUS, ITEM_ID, CLAIMANT_ID')
                    .in('STATUS', ['Approved', 'Rejected']); // Fetch Approved and Rejected claims

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

    return (
        <div className="verify-claims-container">
            <h1>Previously Verified Claims</h1>
            <button className="back-button" onClick={() => navigate('/LoginPage/VerifyClaimsPage')}>
                Back to Verify Claims
            </button>
            {fetchError ? (
                <div className="error-message">
                    <p>{fetchError}</p>
                </div>
            ) : (
                <table className="claims-table">
                    <thead>
                        <tr>
                            <th>Claim ID</th>
                            <th>Status</th>
                            <th>Item Name</th>
                            <th>Claimant Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claims.map((claim) => (
                            <tr key={claim.CLAIM_ID}>
                                <td>{claim.CLAIM_ID}</td>
                                <td>{claim.STATUS}</td>
                                <td>{getItemName(claim.ITEM_ID)}</td>
                                <td>{getUserName(claim.CLAIMANT_ID)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default VerifiedClaimsPage;
