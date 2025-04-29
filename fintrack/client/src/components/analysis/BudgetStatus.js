import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Grid, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Chip, Alert, AppBar, Toolbar, IconButton, Container
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import TextField from '@mui/material/TextField';
import MenuIcon from '@mui/icons-material/Menu';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import Sidebar from '../shared/Sidebar';
import { styled } from '@mui/material/styles';

// Styled components
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

export default function BudgetStatus() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get userId from localStorage when component mounts
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.user_id) {
      setUserId(userData.user_id);
    }
  }, []);

  // Fetch budget status when month changes
  useEffect(() => {
    if (!userId) return;
    
    const fetchBudgetStatus = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/api/analysis/budget-status/${userId}`, {
          params: {
            month: selectedMonth.toISOString().split('T')[0]
          }
        });
        
        console.log('Budget status response:', response.data);
        setBudgetData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching budget status:', err);
        setError('Failed to fetch budget status data. Please make sure the API is running and the endpoint is correct.');
        setBudgetData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBudgetStatus();
  }, [userId, selectedMonth]);

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get color for budget status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Over Budget':
        return 'error';
      case 'Within Budget':
        return 'success';
      case 'No Budget Set':
        return 'default';
      default:
        return 'primary';
    }
  };

  // Get color for progress bar
  const getProgressColor = (percentageUsed) => {
    if (percentageUsed >= 100) return 'error';
    if (percentageUsed >= 90) return 'warning';
    if (percentageUsed >= 75) return 'info';
    return 'success';
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
              Budget Status
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
            <StyledPaper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 600, mb: 3 }}>
                Budget Status
              </Typography>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Select Month"
                      views={['month', 'year']}
                      value={selectedMonth}
                      onChange={(newValue) => setSelectedMonth(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6">
                      {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Typography>
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </StyledPaper>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            )}
            
            <StyledPaper>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : budgetData.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Spent</TableCell>
                        <TableCell align="right">Budget</TableCell>
                        <TableCell align="right">Remaining</TableCell>
                        <TableCell>Progress</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Recommendation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {budgetData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.Category}</TableCell>
                          <TableCell align="right">${parseFloat(row['Amount Spent']).toFixed(2)}</TableCell>
                          <TableCell align="right">${parseFloat(row['Budget Limit']).toFixed(2)}</TableCell>
                          <TableCell align="right">${parseFloat(row['Remaining Budget']).toFixed(2)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min(parseFloat(row['Percentage Used']), 100)} 
                                  color={getProgressColor(parseFloat(row['Percentage Used']))}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {`${parseFloat(row['Percentage Used']).toFixed(0)}%`}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={row.Status} 
                              color={getStatusColor(row.Status)} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{row.Recommendation}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No budget data available for this month.
                  </Typography>
                </Box>
              )}
            </StyledPaper>
          </Container>
        </Box>
      </Box>
    </AppTheme>
  );
}
