import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './main.css'

import TitlePage from './TitlePage.jsx';
import LoginPage from './LoginPage.jsx';
import HomePage from './HomePage.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TitlePage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/LoginPage/Home" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
