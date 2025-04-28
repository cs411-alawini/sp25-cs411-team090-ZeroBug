import * as React from 'react';
import { useState, useEffect } from 'react';
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
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import MenuIcon from '@mui/icons-material/Menu';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import WarningIcon from '@mui/icons-material/Warning';
import HistoryIcon from '@mui/icons-material/History';
import TimelineIcon from '@mui/icons-material/Timeline';
import UpdateIcon from '@mui/icons-material/Update';
import BarChartIcon from '@mui/icons-material/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { styled } from '@mui/material/styles';

// Import components
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import Sidebar from '../shared/Sidebar';

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

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// ML Analytics component
const MachineLearningAnalytics = ({ userId, baseCurrency }) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [spendingTrends, setSpendingTrends] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [monthlySpending, setMonthlySpending] = useState({});
  const [categoryPredictions, setCategoryPredictions] = useState([]);
  
  // Currency formatter
  const formatCurrency = (value, currency = baseCurrency) => {
    if (typeof value === 'number') {
      const currencySymbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CNY': '¥'
      };
      
      const symbol = currencySymbols[currency] || currency;
      return `${symbol}${value.toFixed(2)}`;
    }
    return '';
  };

  useEffect(() => {
    const loadMLAnalytics = async () => {
      setLoading(true);
      try {
        // First get transaction data
        const response = await axios.get(`/api/transactions/user/${userId}`);
        const transactionsData = response.data;
        
        // Send transaction data to ML service for prediction
        const mlResponse = await axios.post('http://34.44.184.196:5001/api/ml/predict', {
          transactions: transactionsData
        });
        
        // Handle the ML predictions from Python service
        const predictionsData = mlResponse.data;
        
        setTransactions(transactionsData);
        setCategoryPredictions(predictionsData.categoryPredictions || []);
        setPredictions(predictionsData.monthlyPredictions || []);
        setAnomalies(predictionsData.anomalies || []);
        
        // We still do JS-based analysis for spending trends
        analyzeSpendingTrends(transactionsData);
        
      } catch (error) {
        console.error('Error loading ML analytics data:', error);
        // Fallback to JavaScript-based analysis if ML service fails
        const fallbackResponse = await axios.get(`/api/transactions/user/${userId}`);
        const fallbackData = fallbackResponse.data;
        setTransactions(fallbackData);
        
        // Use fallback JS calculations
        analyzeSpendingTrends(fallbackData);
        detectAnomalies(fallbackData);
        predictFutureSpending(fallbackData);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      loadMLAnalytics();
    }
  }, [userId]);
  
  // Analyze spending trends by category and time
  const analyzeSpendingTrends = (data) => {
    // Group transactions by month and category
    const groupedByMonth = {};
    const categoryTotals = {};
    
    data.forEach(transaction => {
      if (transaction.transaction_type === 'Expense') {
        const date = new Date(transaction.transaction_date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Monthly spending data
        if (!groupedByMonth[monthYear]) {
          groupedByMonth[monthYear] = 0;
        }
        groupedByMonth[monthYear] += Math.abs(Number(transaction.amount));
        
        // Category totals
        if (!categoryTotals[transaction.category_name]) {
          categoryTotals[transaction.category_name] = 0;
        }
        categoryTotals[transaction.category_name] += Math.abs(Number(transaction.amount));
      }
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(groupedByMonth).sort();
    
    // Create time series data for spending trends
    const trendData = sortedMonths.map(month => ({
      month,
      spending: groupedByMonth[month]
    }));
    
    // Generate top spending categories
    const topCats = Object.entries(categoryTotals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    
    setSpendingTrends(trendData);
    setTopCategories(topCats);
    setMonthlySpending({
      labels: sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        return `${monthNum}/${year.substring(2)}`;
      }),
      values: sortedMonths.map(month => groupedByMonth[month])
    });
  };
  
  // Detect anomalies in spending patterns
  const detectAnomalies = (data) => {
    // Group transactions by category
    const categorySpending = {};
    
    data.forEach(transaction => {
      if (transaction.transaction_type === 'Expense') {
        const category = transaction.category_name;
        
        if (!categorySpending[category]) {
          categorySpending[category] = [];
        }
        
        categorySpending[category].push({
          date: new Date(transaction.transaction_date),
          amount: Math.abs(Number(transaction.amount)),
          description: transaction.description
        });
      }
    });
    
    // Calculate average and standard deviation for each category
    const anomalyResults = [];
    
    Object.entries(categorySpending).forEach(([category, transactions]) => {
      if (transactions.length < 3) return; // Need at least 3 data points
      
      const amounts = transactions.map(t => t.amount);
      const avg = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
      const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);
      
      // Detect transactions more than 2 standard deviations from the mean
      const threshold = Math.max(avg + 2 * stdDev, avg * 1.5);
      
      transactions.forEach(transaction => {
        if (transaction.amount > threshold) {
          anomalyResults.push({
            category,
            date: transaction.date,
            amount: transaction.amount,
            description: transaction.description,
            average: avg,
            diff_percent: Math.round((transaction.amount - avg) / avg * 100)
          });
        }
      });
    });
    
    // Sort anomalies by date (most recent first)
    setAnomalies(anomalyResults.sort((a, b) => b.date - a.date).slice(0, 5));
  };
  
  // Predict future spending
  const predictFutureSpending = (data) => {
    // Group by month and category
    const categoryMonthlyData = {};
    
    data.forEach(transaction => {
      if (transaction.transaction_type === 'Expense') {
        const date = new Date(transaction.transaction_date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const category = transaction.category_name;
        
        if (!categoryMonthlyData[category]) {
          categoryMonthlyData[category] = {};
        }
        
        if (!categoryMonthlyData[category][monthYear]) {
          categoryMonthlyData[category][monthYear] = 0;
        }
        
        categoryMonthlyData[category][monthYear] += Math.abs(Number(transaction.amount));
      }
    });
    
    // Simple linear regression prediction for each category
    const predictionResults = [];
    const categoryCounts = {};
    
    Object.entries(categoryMonthlyData).forEach(([category, monthlyData]) => {
      const months = Object.keys(monthlyData).sort();
      categoryCounts[category] = months.length;
      
      if (months.length >= 3) { // Need at least 3 months of data
        const dataPoints = months.map((month, index) => ({
          x: index,
          y: monthlyData[month]
        }));
        
        // Calculate linear regression (y = mx + b)
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        const n = dataPoints.length;
        
        dataPoints.forEach(point => {
          sumX += point.x;
          sumY += point.y;
          sumXY += point.x * point.y;
          sumXX += point.x * point.x;
        });
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Predict next 3 months
        const lastX = dataPoints[dataPoints.length - 1].x;
        const predictions = [];
        
        for (let i = 1; i <= 3; i++) {
          const predictedValue = slope * (lastX + i) + intercept;
          predictions.push({
            month: i,
            value: Math.max(0, predictedValue) // Ensure no negative predictions
          });
        }
        
        const trend = slope > 0 ? 'increasing' : 'decreasing';
        const trendPercent = Math.abs(Math.round(slope / (sumY / n) * 100));
        
        predictionResults.push({
          category,
          predictions,
          trend,
          trendPercent
        });
      }
    });
    
    // Sort by those with most consistent/frequent data
    const sortedPredictions = predictionResults
      .sort((a, b) => categoryCounts[b.category] - categoryCounts[a.category])
      .slice(0, 5);
    
    // Calculate total predicted spending by month
    const nextThreeMonths = [];
    const today = new Date();
    
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(today);
      futureDate.setMonth(today.getMonth() + i);
      
      const monthName = futureDate.toLocaleString('default', { month: 'long' });
      const totalPredicted = sortedPredictions.reduce((total, cat) => {
        return total + (cat.predictions[i-1]?.value || 0);
      }, 0);
      
      nextThreeMonths.push({
        month: monthName,
        totalPredicted
      });
    }
    
    setPredictions(nextThreeMonths);
    setCategoryPredictions(sortedPredictions);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Spending Forecast Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Spending Forecast
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Based on your historical spending patterns, we've generated a forecast for your next 3 months of expenses.
            </Alert>
            <Grid container spacing={3}>
              {predictions.map((prediction, idx) => (
                <Grid item xs={12} sm={4} key={idx}>
                  <Card sx={{ bgcolor: 'background.default', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {prediction.month}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(prediction.totalPredicted)}
                      </Typography>
                      <Chip 
                        icon={<UpdateIcon />} 
                        label="Predicted" 
                        color="primary" 
                        size="small" 
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Spending Trends Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Historical Spending Trends
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              {monthlySpending.labels && monthlySpending.labels.length > 0 ? (
                <LineChart
                  series={[
                    {
                      data: monthlySpending.values,
                      label: 'Monthly Spending',
                      color: '#3461FF',
                    }
                  ]}
                  xAxis={[
                    {
                      data: monthlySpending.labels,
                      scaleType: 'band',
                    }
                  ]}
                  yAxis={[
                    {
                      label: `Amount (${baseCurrency})`,
                    }
                  ]}
                  height={300}
                  margin={{ top: 20, bottom: 30, left: 40, right: 20 }}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    Not enough data for spending trends
                  </Typography>
                </Box>
              )}
            </Box>
          </StyledPaper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Spending Anomalies
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Unusual spending patterns detected in your transaction history.
            </Typography>
            {anomalies.length > 0 ? (
              <Box>
                {anomalies.map((anomaly, idx) => (
                  <Box key={idx} sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle2">
                        {anomaly.category}
                      </Typography>
                      <Chip 
                        size="small" 
                        color="error" 
                        label={`+${anomaly.diff_percent}%`} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {anomaly.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(anomaly.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(anomaly.amount)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography variant="body1" color="text.secondary">
                  No anomalies detected
                </Typography>
              </Box>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
      
      {/* Category Predictions */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Category Spending Predictions
            </Typography>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Trend</TableCell>
                    <TableCell align="right">Next Month</TableCell>
                    <TableCell align="right">Month 2</TableCell>
                    <TableCell align="right">Month 3</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryPredictions.map((cat, idx) => (
                    <TableRow key={idx}>
                      <TableCell component="th" scope="row">
                        {cat.category}
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          icon={cat.trend === 'increasing' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                          label={`${cat.trend} (${cat.trendPercent}%)`}
                          color={cat.trend === 'increasing' ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      {cat.predictions.map((pred, pidx) => (
                        <TableCell key={pidx} align="right">
                          {formatCurrency(pred.value)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {categoryPredictions.length === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography variant="body1" color="text.secondary">
                  Not enough transaction history for category predictions
                </Typography>
              </Box>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Budget Recommendations component
const BudgetRecommendations = ({ userId, baseCurrency }) => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Currency formatter
  const formatCurrency = (value, currency = baseCurrency) => {
    if (typeof value === 'number') {
      const currencySymbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CNY': '¥'
      };
      
      const symbol = currencySymbols[currency] || currency;
      return `${symbol}${value.toFixed(2)}`;
    }
    return '';
  };
  
  useEffect(() => {
    const loadBudgetRecommendations = async () => {
      setLoading(true);
      try {
        // First get transaction data
        const response = await axios.get(`/api/transactions/user/${userId}`);
        const transactionsData = response.data;
        
        // Send transaction data to ML service for budget recommendations
        const mlResponse = await axios.post('http://34.44.184.196:5001/api/ml/budget', {
          transactions: transactionsData
        });
        
        // Handle the ML budget recommendations from Python service
        const recommendationsData = mlResponse.data;
        
        setRecommendations(recommendationsData.recommendations || []);
        
      } catch (error) {
        console.error('Error loading ML budget data:', error);
        // Fallback to JavaScript-based analysis if ML service fails
        const fallbackResponse = await axios.get(`/api/transactions/user/${userId}`);
        analyzeBudgetRecommendations(fallbackResponse.data);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      loadBudgetRecommendations();
    }
  }, [userId]);
  
  // Generate budget recommendations based on spending habits
  const analyzeBudgetRecommendations = (data) => {
    // Group by category and month
    const categoryMonthly = {};
    const uniqueCategories = new Set();
    
    data.forEach(transaction => {
      if (transaction.transaction_type === 'Expense') {
        const category = transaction.category_name;
        uniqueCategories.add(category);
        
        const date = new Date(transaction.transaction_date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!categoryMonthly[category]) {
          categoryMonthly[category] = {};
        }
        
        if (!categoryMonthly[category][monthYear]) {
          categoryMonthly[category][monthYear] = 0;
        }
        
        categoryMonthly[category][monthYear] += Math.abs(Number(transaction.amount));
      }
    });
    
    // Calculate average and determine budget recommendations
    const budgetRecs = [];
    const categoriesData = [];
    
    uniqueCategories.forEach(category => {
      const monthlyData = categoryMonthly[category] || {};
      const months = Object.keys(monthlyData);
      
      if (months.length >= 2) {
        const values = months.map(month => monthlyData[month]);
        const sum = values.reduce((a, b) => a + b, 0);
        const average = sum / values.length;
        
        // Calculate standard deviation for consistency analysis
        const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const coefficient = stdDev / average; // Coefficient of variation
        
        // Higher coefficient means less consistent spending
        const consistency = coefficient < 0.3 ? 'High' : coefficient < 0.6 ? 'Medium' : 'Low';
        
        // Calculate recommended budget (average + small buffer)
        const recommendedBudget = average * 1.1;
        
        budgetRecs.push({
          category,
          avgSpending: average,
          recommendedBudget,
          consistency,
          months: months.length
        });
        
        categoriesData.push({
          category,
          data: months.map(month => ({
            month,
            amount: monthlyData[month]
          }))
        });
      }
    });
    
    // Sort by highest spending categories
    setRecommendations(budgetRecs.sort((a, b) => b.avgSpending - a.avgSpending));
    setCategories(categoriesData);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              <AttachMoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Smart Budget Recommendations
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              These recommendations are based on your historical spending patterns. 
              Consider setting up budget alerts for categories with low consistency 
              to better manage your finances.
            </Alert>
            
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Average Monthly Spending</TableCell>
                    <TableCell align="right">Recommended Budget</TableCell>
                    <TableCell align="right">Spending Consistency</TableCell>
                    <TableCell align="right">Data Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recommendations.map((rec, idx) => (
                    <TableRow key={idx}>
                      <TableCell component="th" scope="row">
                        {rec.category}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(rec.avgSpending)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          {formatCurrency(rec.recommendedBudget)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={rec.consistency} 
                          size="small"
                          color={
                            rec.consistency === 'High' ? 'success' : 
                            rec.consistency === 'Medium' ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        {rec.months} months
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {recommendations.length === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography variant="body1" color="text.secondary">
                  Not enough transaction history for budget recommendations
                </Typography>
              </Box>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Main Analytics component
export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [tabValue, setTabValue] = useState(0);

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

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
              Financial Analytics
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
              <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 600, mb: 3 }}>
                <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                AI-Powered Financial Insights
              </Typography>
              
              <Typography variant="body1" paragraph>
                Our machine learning algorithms analyze your transaction history to provide personalized insights,
                identify spending patterns, and predict future expenses.
              </Typography>
              
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Spending Predictions" />
                <Tab label="Budget Recommendations" />
              </Tabs>
            </StyledPaper>
            
            <TabPanel value={tabValue} index={0}>
              <MachineLearningAnalytics userId={userId} baseCurrency={baseCurrency} />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <BudgetRecommendations userId={userId} baseCurrency={baseCurrency} />
            </TabPanel>
          </Container>
        </Box>
      </Box>
    </AppTheme>
  );
} 