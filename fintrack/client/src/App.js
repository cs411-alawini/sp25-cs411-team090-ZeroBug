import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './components/dashboard/Dashboard';
import './App.css';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#F8FAFF',
    },
  },
});

function App() {
  return (
    <CssVarsProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Dashboard />
        </Router>
      </ThemeProvider>
    </CssVarsProvider>
  );
}

export default App;