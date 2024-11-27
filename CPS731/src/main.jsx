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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TitlePage />} />
        <Route path="/Register" element={<RegisterPage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/LoginPage/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/LoginPage/Home" element={<HomePage />} />
        <Route path="/LoginPage/LostItemReport" element={<LostItemReport />} />
        <Route path="/LoginPage/FoundItemReport" element={<FoundItemReport />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
