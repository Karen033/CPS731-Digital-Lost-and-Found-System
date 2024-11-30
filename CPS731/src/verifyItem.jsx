import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./main.css";
import supabase from "./supabaseClient";
import { Link } from "react-router-dom";

function verifyItem() {
    const [item, setItem] = useState('');
    const [claimant, setUser] = useState('');
    const [status, setStatus] = useState('');
    const navigate = useNavigate(); 
    const [admin, setAdmin] = useState(false);

    //Check if user is an admin
    useEffect(() => {
        const checkAdminStatus = async () => {
            const user = JSON.parse(localStorage.getItem("loggedInUser"));
            if(user) {
                try {
                    const{ data, error} = await supabase
                        .from("users")
                        .select("account_type")
                        .eq("user_id", user.id)
                        .single();
                
                if (error) {
                    console.error("Error fetching account type:", error.message)
                    } else {
                        setAdmin(data.account_type === "Admin");
                    } 
                } 
                catch (err) {
                    console.error("Unexpected error:", err);
                }
            }
        };

        checkAdminStatus();
      }, []);

      //If user is not an admin they should be redirected
      useEffect(() => {
        if (admin === false) {
            navigate("/");
        }
      }, [admin, navigate]);
}