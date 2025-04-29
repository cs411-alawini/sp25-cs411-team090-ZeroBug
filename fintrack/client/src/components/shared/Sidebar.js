import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SavingsIcon from '@mui/icons-material/Savings';

const drawerWidth = 240;

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Transactions', icon: <ReceiptIcon />, path: '/transactions' },
    { text: 'Account', icon: <AccountBalanceWalletIcon />, path: '/account' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
    { text: 'Transfer Savings', icon: <SwapHorizIcon />, path: '/transfer-savings' },
    { text: 'Savings Goals', icon: <SavingsIcon />, path: '/saving-goals' },
    { text: 'Advanced Search', icon: <SearchIcon />, path: '/advanced-search' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };
  
  const handleLogout = () => {
    // Handle logout logic here
    navigate('/login');
    onClose();
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      sx={{
        display: { xs: 'block' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: 'none',
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '4px 0px 10px rgba(0, 0, 0, 0.2)'
            : '4px 0px 10px rgba(0, 0, 0, 0.05)'
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          FinTrack
        </Typography>
      </Box>
      <Divider />
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: '10px',
                  mx: 1,
                  mb: 0.5,
                  backgroundColor: (theme) => isActive 
                    ? (theme.palette.mode === 'dark' ? 'rgba(52, 97, 255, 0.2)' : '#EEF2FF') 
                    : 'transparent',
                  color: (theme) => isActive 
                    ? (theme.palette.mode === 'dark' ? '#6B8AFF' : '#3461FF') 
                    : (theme.palette.mode === 'dark' ? 'text.secondary' : '#64748B'),
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : '#F8FAFF',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: (theme) => isActive 
                    ? (theme.palette.mode === 'dark' ? '#6B8AFF' : '#3461FF') 
                    : (theme.palette.mode === 'dark' ? 'text.secondary' : '#64748B')
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ mt: 'auto', mb: 2, mx: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '10px',
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : '#F8FAFF',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'text.secondary' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Drawer>
  );
} 