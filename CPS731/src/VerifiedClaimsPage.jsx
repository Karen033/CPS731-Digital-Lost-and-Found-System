import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './main.css';

function VerifiedClaimsPage() {
    const [claims, setClaims] = useState([]);
    const [fetchError, setFetchError] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

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

export default VerifiedClaimsPage;
