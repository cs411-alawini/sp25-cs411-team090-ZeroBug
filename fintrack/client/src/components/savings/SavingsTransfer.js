import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Snackbar, Alert, InputAdornment,
  AppBar, Toolbar, IconButton, Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SavingsIcon from '@mui/icons-material/Savings';
import { styled } from '@mui/material/styles';

// Import components
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import Sidebar from '../shared/Sidebar';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 16,
  padding: theme.spacing(2),
  height: '100%',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0px 2px 6px rgba(0, 0, 0, 0.2)' 
    : '0px 2px 6px rgba(0, 0, 0, 0.05)',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

export default function SavingsTransfer() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [fromGoalId, setFromGoalId] = useState('');
  const [toGoalId, setToGoalId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingGoals, setFetchingGoals] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  // Get userId from localStorage when component mounts
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.user_id) {
      setUserId(userData.user_id);
    }
  }, []);

  // Fetch savings goals
  useEffect(() => {
    if (!userId) return;
    
    const fetchSavingsGoals = async () => {
      setFetchingGoals(true);
      try {
        const response = await axios.get(`/api/savings/user/${userId}`);
        setSavingsGoals(response.data);
      } catch (err) {
        console.error('Error fetching savings goals:', err);
        setAlert({
          open: true,
          message: 'Failed to fetch savings goals',
          severity: 'error'
        });
      } finally {
        setFetchingGoals(false);
      }
    };
    
    fetchSavingsGoals();
  }, [userId]);

  // Handle transfer
  const handleTransfer = async () => {
    if (!fromGoalId || !toGoalId || !amount || fromGoalId === toGoalId) {
      setAlert({
        open: true,
        message: 'Please select different goals and enter a valid amount',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('/api/analysis/transfer-savings', {
        userId,
        fromGoalId,
        toGoalId,
        amount: parseFloat(amount)
      });
      
      setAlert({
        open: true,
        message: 'Transfer completed successfully',
        severity: 'success'
      });
      
      // Reset form
      setAmount('');
      
      // Refresh savings goals to show updated balances
      const response = await axios.get(`/api/savings/user/${userId}`);
      setSavingsGoals(response.data);
      
    } catch (err) {
      console.error('Error transferring funds:', err);
      setAlert({
        open: true,
        message: err.response?.data?.message || 'Transfer failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get maximum available amount for selected goal
  const getMaxAmount = () => {
    if (!fromGoalId) return 0;
    
    const selectedGoal = savingsGoals.find(goal => goal.goal_id === parseInt(fromGoalId));
    return selectedGoal ? selectedGoal.current_savings : 0;
  };

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppTheme>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* App Bar */}
        <AppBar 
          position="fixed" 
          color="default"
          elevation={0}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: 'background.paper',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
              Transfer Between Savings Goals
            </Typography>
            <ColorModeSelect sx={{ ml: 1 }} />
          </Toolbar>
        </AppBar>
        
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={handleDrawerToggle} />
        
        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: 8, // Space for fixed AppBar
            px: 2,
            backgroundColor: 'background.default',
          }}
        >
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <StyledPaper sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                  <SavingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Transfer Between Savings Goals
                </Typography>
              </Box>
              
              <Typography variant="body1" paragraph>
                Move funds between your different savings goals as your priorities change.
              </Typography>
            </StyledPaper>
            
            <StyledPaper>
              {fetchingGoals ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={5}>
                    <FormControl fullWidth>
                      <InputLabel>From Goal</InputLabel>
                      <Select
                        value={fromGoalId}
                        label="From Goal"
                        onChange={(e) => setFromGoalId(e.target.value)}
                      >
                        {savingsGoals.map((goal) => (
                          <MenuItem key={goal.goal_id} value={goal.goal_id}>
                            {goal.goal_name} (${goal.current_savings})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={5}>
                    <FormControl fullWidth>
                      <InputLabel>To Goal</InputLabel>
                      <Select
                        value={toGoalId}
                        label="To Goal"
                        onChange={(e) => setToGoalId(e.target.value)}
                      >
                        {savingsGoals.map((goal) => (
                          <MenuItem key={goal.goal_id} value={goal.goal_id}>
                            {goal.goal_name} (${goal.current_savings})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      inputProps={{
                        min: 0.01,
                        max: getMaxAmount(),
                        step: 0.01
                      }}
                      fullWidth
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      sx={{ 
                        bgcolor: '#1e2a38', 
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#2c3e50',
                        }
                      }}
                      onClick={handleTransfer}
                      disabled={loading || !fromGoalId || !toGoalId || !amount || fromGoalId === toGoalId}
                      fullWidth
                    >
                      {loading ? <CircularProgress size={24} /> : 'Transfer Funds'}
                    </Button>
                  </Grid>
                </Grid>
              )}
            </StyledPaper>
          </Container>
        </Box>
      </Box>
      
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert 
          onClose={() => setAlert({ ...alert, open: false })} 
          severity={alert.severity}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </AppTheme>
  );
}
