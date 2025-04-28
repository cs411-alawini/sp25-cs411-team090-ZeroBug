import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import MenuIcon from '@mui/icons-material/Menu';
import SavingsIcon from '@mui/icons-material/Savings';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
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

export default function SavingGoals() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [savingGoals, setSavingGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    current_savings: '',
    deadline: ''
  });
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [baseCurrency, setBaseCurrency] = useState('USD');

  // Get userId and base currency from localStorage when component mounts
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      if (userData.user_id) {
        setUserId(userData.user_id);
      }
      if (userData.base_currency) {
        setBaseCurrency(userData.base_currency);
      }
    }
  }, []);

  // Fetch saving goals when userId changes
  useEffect(() => {
    if (userId) {
      fetchSavingGoals();
    }
  }, [userId]);

  const fetchSavingGoals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/savings/user/${userId}`);
      setSavingGoals(response.data);
    } catch (error) {
      console.error('Error fetching saving goals:', error);
      setAlert({
        open: true,
        message: 'Failed to fetch saving goals',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOpenAddDialog = () => {
    setFormData({
      goal_name: '',
      target_amount: '',
      current_savings: '0',
      deadline: ''
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (goal) => {
    setCurrentGoal(goal);
    setFormData({
      goal_name: goal.goal_name,
      target_amount: goal.target_amount.toString(),
      current_savings: goal.current_savings.toString(),
      deadline: goal.deadline ? goal.deadline.split('T')[0] : ''
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentGoal(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      current_savings: parseFloat(formData.current_savings),
      user_id: userId
    };
    
    try {
      if (dialogMode === 'add') {
        await axios.post('/api/savings', data);
        setAlert({
          open: true,
          message: 'Saving goal added successfully',
          severity: 'success'
        });
      } else {
        await axios.put(`/api/savings/${currentGoal.goal_id}`, data);
        setAlert({
          open: true,
          message: 'Saving goal updated successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchSavingGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      setAlert({
        open: true,
        message: 'Failed to save goal',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this saving goal?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/savings/${goalId}`);
      setAlert({
        open: true,
        message: 'Saving goal deleted successfully',
        severity: 'success'
      });
      fetchSavingGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      setAlert({
        open: true,
        message: 'Failed to delete goal',
        severity: 'error'
      });
    }
  };

  const formatCurrency = (value) => {
    const currencySymbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CNY': '¥'
    };
    
    const symbol = currencySymbols[baseCurrency] || baseCurrency;
    return `${symbol}${parseFloat(value).toFixed(2)}`;
  };

  const calculateProgress = (current, target) => {
    return Math.min(100, (current / target) * 100);
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
              Saving Goals
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
                  Your Saving Goals
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                >
                  Add New Goal
                </Button>
              </Box>
              
              <Typography variant="body1" paragraph>
                Set up and track your saving goals. Monitor your progress and adjust your targets over time.
              </Typography>
            </StyledPaper>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {savingGoals.length > 0 ? (
                  savingGoals.map((goal) => (
                    <Grid item xs={12} sm={6} md={4} key={goal.goal_id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {goal.goal_name}
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                              Progress: {formatCurrency(goal.current_savings)} of {formatCurrency(goal.target_amount)}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={calculateProgress(goal.current_savings, goal.target_amount)} 
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                            {goal.deadline ? (
                              <>Target Date: {new Date(goal.deadline).toLocaleDateString()}</>
                            ) : (
                              <>No target date set</>
                            )}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Remaining: {formatCurrency(goal.target_amount - goal.current_savings)}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenEditDialog(goal)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="small" 
                            color="error" 
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(goal.goal_id)}
                          >
                            Delete
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <StyledPaper>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <SavingsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          No Saving Goals Yet
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
                          Start by creating your first saving goal to track your progress.
                        </Typography>
                        <Button 
                          variant="contained" 
                          startIcon={<AddIcon />}
                          onClick={handleOpenAddDialog}
                        >
                          Create Your First Goal
                        </Button>
                      </Box>
                    </StyledPaper>
                  </Grid>
                )}
              </Grid>
            )}
          </Container>
        </Box>
      </Box>

      {/* Add/Edit Goal Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === 'add' ? 'Add New Saving Goal' : 'Edit Saving Goal'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="goal_name"
                  label="Goal Name"
                  value={formData.goal_name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="target_amount"
                  label="Target Amount"
                  type="number"
                  value={formData.target_amount}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="current_savings"
                  label="Current Savings"
                  type="number"
                  value={formData.current_savings}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="deadline"
                  label="Target Date"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {dialogMode === 'add' ? 'Add Goal' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Alert Snackbar */}
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
