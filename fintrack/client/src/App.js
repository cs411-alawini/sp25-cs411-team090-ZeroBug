import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3461FF',
    },
    secondary: {
      main: '#36CFCF',
    },
    background: {
      default: '#F8FAFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', backgroundColor: '#F8FAFF' }}>
          <Sidebar />
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1,
              width: { md: `calc(100% - ${240}px)` },
              ml: { md: `${240}px` }
            }}
          >
            <Dashboard />
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;