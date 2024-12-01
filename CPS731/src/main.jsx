import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './main.css'

import TitlePage from './TitlePage.jsx';
import RegisterPage from './RegisterPage.jsx';
import LoginPage from './LoginPage.jsx';
import ForgotPassword from './ForgotPassword.jsx'
import HomePage from './HomePage.jsx';
import LostItemReport from './LostItemReport.jsx'
import FoundItemReport from './FoundItemReport.jsx';
import ProfileManagement from './ProfileManagement.jsx';
import ViewLostReportHistory from './ViewLostReportHistory.jsx';
import ViewFoundReportHistory from './ViewFoundReportHistory.jsx';
import UpdateLostPage from './UpdateLostReport.jsx';
import UpdateFoundPage from './UpdateFoundReport.jsx';
import SettingsPage from './SettingsPage.jsx';
import NotificationsPage from './NotificationsPage.jsx';
import ItemPageMatch from './ItemPageMatch.jsx';
import VerifyClaimsPage from './VerifyClaimsPage.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TitlePage />} />
        <Route path="/Register" element={<RegisterPage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/LoginPage/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/LoginPage/Home" element={<HomePage />} />
        <Route path="/LoginPage/Home/Notifications" element={<NotificationsPage />} />
        <Route path="/LoginPage/LostItemReport" element={<LostItemReport />} />
        <Route path="/LoginPage/FoundItemReport" element={<FoundItemReport />} />
        <Route path="/LoginPage/ProfileManagement" element={<ProfileManagement />} />
        <Route path="/LoginPage/ProfileManagement/ViewLostReportHistory" element={<ViewLostReportHistory />} />
        <Route path='/LoginPage/ProfileManagement/ViewLostReportHistory/:item_id/UpdateLostReport' element={<UpdateLostPage />} />
        <Route path="/LoginPage/ProfileManagement/ViewFoundReportHistory" element={<ViewFoundReportHistory />} />
        <Route path="/LoginPage/ProfileManagement/ViewFoundReportHistory/:item_id/UpdateFoundReport" element={<UpdateFoundPage />} />
        <Route path="/LoginPage/ProfileManagement/Settings" element={<SettingsPage />} />
        <Route path="/LoginPage/Home/ItemPageMatch" element={<ItemPageMatch />} />
        <Route path="/LoginPage/VerifyClaims" element={ localStorage.getItem('loggedInUser') && JSON.parse(localStorage.getItem('loggedInUser')).accountType === 'admin' ? (<VerifyClaimsPage /> ) : (<p>You do not have permission to view this page.</p>)
  }
/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
