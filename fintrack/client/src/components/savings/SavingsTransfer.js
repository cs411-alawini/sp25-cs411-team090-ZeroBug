import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Snackbar, Alert, InputAdornment
} from '@mui/material';

export default function SavingsTransfer() {
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

  return (
    <Box sx={{ mt: 3, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Transfer Between Savings Goals
      </Typography>
      
      <Paper sx={{ p: 3 }}>
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
                color="primary"
                onClick={handleTransfer}
                disabled={loading || !fromGoalId || !toGoalId || !amount || fromGoalId === toGoalId}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Transfer Funds'}
              </Button>
            </Grid>
          </Grid>
        )}
      </Paper>
      
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
    </Box>
  );
}
