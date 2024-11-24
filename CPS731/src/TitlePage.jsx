import tmuLogo from './assets/tmu_logo_cropped.png'
import userProfile from './assets/user.png'
import { Link } from "react-router-dom";
import './main.css'

function TitlePage() {

  return (
    <>
    <div className="title-page">
      <div>
        <img src={tmuLogo} className="logo" />
      </div>
      <h1>Digital Lost and Found</h1>
      <div>
        <img src={userProfile} className="logo user" />
      </div>
      <button className="login">
        <Link to='/LoginPage'>Login</Link>
      </button>
      <p>Don't have an account?</p>
      <Link to="/Register">Register Now</Link>
    </div>
    </>
  )
}

export default TitlePage;
