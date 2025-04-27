import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Grid, Button, TextField, 
  CircularProgress, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PageWrapper from '../shared/PageWrapper';

export default function SpendingAnalysis() {
  const [userId, setUserId] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 3)));
  const [endDate, setEndDate] = useState(new Date());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get userId from localStorage when component mounts
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.user_id) {
      setUserId(userData.user_id);
    }
  }, []);

  // Fetch spending analysis data
  const fetchAnalysisData = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/analysis/spending/${userId}`, {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      
      setData(response.data);
    } catch (err) {
      console.error('Error fetching analysis data:', err);
      setError('Failed to fetch analysis data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Call the API when user changes the date range
  const handleAnalyze = () => {
    fetchAnalysisData();
  };

  // Prepare data for pie chart
  const preparePieChartData = () => {
    if (!data || !data.categoryBreakdown) return [];
    
    return data.categoryBreakdown.map(item => ({
      name: item.Category,
      value: parseFloat(item['Total Amount'])
    }));
  };

  // Prepare data for monthly trend line chart
  const prepareLineChartData = () => {
    if (!data || !data.monthlyTrend) return [];
    
    return data.monthlyTrend.map(item => {
      const yearMonth = item.Month.toString();
      const year = yearMonth.substring(0, 4);
      const month = yearMonth.substring(4, 6);
      
      return {
        name: `${year}-${month}`,
        Income: parseFloat(item.Income),
        Expense: parseFloat(item.Expense),
        Savings: parseFloat(item.Savings)
      };
    });
  };

  return (
    <PageWrapper title="Spending Analysis">
      <Box sx={{ mt: 3, p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Spending Analysis
        </Typography>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button 
                  variant="contained" 
                  onClick={handleAnalyze}
                  disabled={loading || !userId}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Analyze'}
                </Button>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Paper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}
        
        {data && (
          <>
            {/* Summary Section */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h5" gutterBottom>Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle1">Total Income</Typography>
                    <Typography variant="h4" color="primary">
                      ${parseFloat(data.summary[0]['Total Income']).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle1">Total Expense</Typography>
                    <Typography variant="h4" color="error">
                      ${parseFloat(data.summary[0]['Total Expense']).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle1">Net Savings</Typography>
                    <Typography 
                      variant="h4" 
                      color={parseFloat(data.summary[0]['Net Savings']) >= 0 ? 'success' : 'error'}
                    >
                      ${parseFloat(data.summary[0]['Net Savings']).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle1">Expense Ratio</Typography>
                    <Typography variant="h4">
                      {parseFloat(data.summary[0]['Expense Ratio (%)']).toFixed(2)}%
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={8}>
                  <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle1">Highest Expense</Typography>
                    <Typography variant="h5">
                      {data.summary[0]['Highest Expense Category']}
                    </Typography>
                    <Typography variant="h4" color="error">
                      ${parseFloat(data.summary[0]['Highest Expense Amount']).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Charts Section */}
            <Grid container spacing={3}>
              {/* Pie Chart */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: 400 }}>
                  <Typography variant="h6" gutterBottom>Expense by Category</Typography>
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={preparePieChartData()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                      />
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              {/* Line Chart */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: 400 }}>
                  <Typography variant="h6" gutterBottom>Monthly Trend</Typography>
                  <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={prepareLineChartData()}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Income" stroke="#8884d8" />
                      <Line type="monotone" dataKey="Expense" stroke="#ff5252" />
                      <Line type="monotone" dataKey="Savings" stroke="#4caf50" />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Category Breakdown Table */}
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography variant="h5" gutterBottom>Category Breakdown</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">% of Total</TableCell>
                      <TableCell align="right">Transactions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.categoryBreakdown.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.Category}</TableCell>
                        <TableCell align="right">${parseFloat(row['Total Amount']).toFixed(2)}</TableCell>
                        <TableCell align="right">{parseFloat(row['Percentage of Total Expense']).toFixed(2)}%</TableCell>
                        <TableCell align="right">{row['Number of Transactions']}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>
    </PageWrapper>
  );
}
