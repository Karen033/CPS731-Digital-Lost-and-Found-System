import { useState } from 'react'
import tmuLogo from './assets/tmu_logo_cropped.png'
import userProfile from './assets/user.png'
import { Link } from "react-router-dom";
import './main.css'

function TitlePage() {

  return (
    <>
      <div>
        <img src={tmuLogo} className="logo" alt="Vite logo" />
      </div>
      <h1>Digital Lost and Found</h1>
      <div>
        <img src={userProfile} className="logo user" alt="React logo" />
      </div>
      <button className="login">
        <Link to='/LoginPage'>Login</Link>
      </button>
      <p>Don't have an account?</p>
      <p>
        Register now
      </p>
    </>
  )
}

export default TitlePage;
