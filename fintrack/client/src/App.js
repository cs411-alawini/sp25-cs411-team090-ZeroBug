import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './components/dashboard';
import Login from './components/sign-in/SignIn';
import Signup from './components/sign-up/SignUp';
import Transactions from './components/transactions/Transactions';
import Account from './components/account/Account';
import Analytics from './components/analytics/Analytics';
import SavingGoals from './components/savings/SavingGoals';
import SavingsTransfer from './components/savings/SavingsTransfer';
import AdvancedSearch from './components/analysis/AdvancedSearch';
import Settings from './pages/Settings';
import './index.css';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';

function App() {
  const menuItems = [
    {
      text: 'Transfer Savings',
      icon: <SwapHorizIcon />,
      path: '/transfer-savings'
    },
    {
      text: 'Advanced Search',
      icon: <SearchIcon />,
      path: '/advanced-search'
    }
  ];

  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/account" element={<Account />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/saving-goals" element={<SavingGoals />} />
          <Route path="/transfer-savings" element={<SavingsTransfer />} />
          <Route path="/advanced-search" element={<AdvancedSearch />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/login" />} />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
