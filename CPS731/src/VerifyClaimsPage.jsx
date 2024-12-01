import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import "./main.css";

function VerifyClaimsPage() {
    const [claims, setClaims] = useState([]);
    const [fetchError, setFetchError] = useState(null);
    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState(null);

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

    // Fetch claims data from CLAIMED table
    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const { data, error } = await supabase
                    .from('CLAIMED')
                    .select('CLAIM_ID, STATUS, ITEM_ID, CLAIMANT_ID');

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

    return (
        <div className="verify-claims-container">
            <h1>Verify Claims</h1>
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
                            <th>Item ID</th>
                            <th>Claimant ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claims.map((claim) => (
                            <tr key={claim.CLAIM_ID}>
                                <td>{claim.CLAIM_ID}</td>
                                <td>{claim.STATUS}</td>
                                <td>{claim.ITEM_ID}</td>
                                <td>{claim.CLAIMANT_ID}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default VerifyClaimsPage;