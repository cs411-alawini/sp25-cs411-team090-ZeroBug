import * as React from 'react';
import { useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LogoutIcon from '@mui/icons-material/Logout';
import { DataGrid } from '@mui/x-data-grid';
import { SyncedExpenseCharts } from './charts/SyncedExpenseCharts';
import axios from 'axios';
// Import AppTheme and ColorModeSelect
import AppTheme from './shared-theme/AppTheme';
import ColorModeSelect from './shared-theme/ColorModeSelect';
import Sidebar from './shared/Sidebar';

const drawerWidth = 240;

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

// API service functions
const fetchUserTransactions = async (userId) => {
  try {
    const response = await axios.get(`/api/transactions/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

const fetchTransactionSummary = async (userId) => {
  try {
    const response = await axios.get(`/api/transactions/summary/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    return { summary: {}, categories: [] };
  }
};

// Transaction DataGrid component
function TransactionsDataGrid({ transactions, baseCurrency }) {
  // Currency symbol mapping
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥'
  };
  
  const symbol = currencySymbols[baseCurrency] || baseCurrency;
  
  // Define columns for DataGrid
  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70 
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" component="div">
          {params.value}
        </Typography>
      ),
    },
    { 
      field: 'type', 
      headerName: 'Description', 
      width: 200,
      flex: 1,
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ 
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' ? 'rgba(52, 97, 255, 0.2)' : '#EEF2FF',
            color: (theme) => 
              theme.palette.mode === 'dark' ? '#6B8AFF' : '#3461FF'
          }}
        />
      ),
    },
    { 
      field: 'payment_method', 
      headerName: 'Payment Method', 
      width: 150,
      renderCell: (params) => (
        params.value ? (
          <Chip
            icon={getPaymentMethodIcon(params.value)}
            label={params.value}
            size="small"
            sx={{ 
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark' ? 'rgba(52, 97, 255, 0.2)' : '#F8FAFF',
              color: (theme) => 
                theme.palette.mode === 'dark' ? '#6B8AFF' : '#3461FF'
            }}
          />
        ) : null
      ),
    },
    { 
      field: 'amount', 
      headerName: `Amount (${baseCurrency})`, 
      width: 150,
      type: 'number',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          component="div"
          sx={{ 
            color: theme => params.row.transaction_type === 'Income' 
              ? theme.palette.success.main
              : theme.palette.error.main,
            fontWeight: 600 
          }}
        >
          {params.row.transaction_type === 'Income' ? '+' : '-'}{symbol}{Math.abs(params.value).toFixed(2)}
          {params.row.original_currency !== baseCurrency && 
            <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
              Original: {currencySymbols[params.row.original_currency] || params.row.original_currency}
              {params.row.original_amount.toFixed(2)}
            </Typography>
          }
        </Typography>
      ),
    },
    { 
      field: 'currency_code', 
      headerName: 'Currency', 
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ 
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' ? 'rgba(52, 97, 255, 0.2)' : '#F1F5F9',
            color: (theme) => 
              theme.palette.mode === 'dark' ? '#6B8AFF' : '#64748B'
          }}
        />
      ),
    },
  ];

  // Function to get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch(method?.toLowerCase()) {
      case 'credit card':
        return <CreditCardIcon fontSize="small" />;
      case 'bank transfer':
        return <AccountBalanceIcon fontSize="small" />;
      default:
        return <PaymentIcon fontSize="small" />;
    }
  };

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={transactions}
        columns={columns}
        rowHeight={48}
        checkboxSelection
        disableRowSelectionOnClick
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
          sorting: {
            sortModel: [{ field: 'date', sort: 'desc' }],
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: (theme) => theme.palette.background.default,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          },
        }}
      />
    </Box>
  );
}

// The main content component
function FinancialContent() {
  // State variables for data
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [userId, setUserId] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [currencyDistribution, setCurrencyDistribution] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [lastActivity, setLastActivity] = useState(null);
  const [highlightedItem, setHighlightedItem] = useState(null);

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

  // Fetch currency exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await axios.get('/api/currency');
        const rates = {};
        
        // Format exchange rates as a lookup object
        response.data.forEach(currency => {
          rates[currency.currency_code] = currency.exchange_rate_to_base;
        });
        
        setExchangeRates(rates);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    };
    
    fetchExchangeRates();
  }, []);

  // Convert amount from one currency to another
  const convertCurrency = (amount, fromCurrency, toCurrency = baseCurrency) => {
    if (!amount || fromCurrency === toCurrency) {
      return amount;
    }
    
    // If we don't have exchange rates yet, return original amount
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      return amount;
    }
    
    // Convert to base currency (USD), then to target currency
    // This assumes exchange_rate_to_base is the rate to convert to USD
    const amountInUSD = amount / exchangeRates[fromCurrency];
    return amountInUSD * exchangeRates[toCurrency];
  };

  // Update currency formatter to use the user's base currency
  const formatCurrency = (value, currency = baseCurrency) => {
    if (typeof value === 'number') {
      // Currency symbol mapping - add more as needed
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

  // Process transactions with currency conversion
  useEffect(() => {
    if (!userId) return; // Skip if userId is not available
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch transactions
        const transactions = await fetchUserTransactions(userId);
        
        // Define summaryData before using it
        const summaryData = await fetchTransactionSummary(userId);
        
        // Keep track of converted totals
        let incomeTotal = 0;
        let expenseTotal = 0;
        
        // Process for grid display with currency conversion
        const transactionsForGrid = transactions.map(t => {
          // Convert amount to user's base currency
          const convertedAmount = convertCurrency(
            Math.abs(t.amount), 
            t.currency_code, 
            baseCurrency
          );
          
          // Update totals
          if (t.transaction_type === 'Income') {
            incomeTotal += convertedAmount;
          } else if (t.transaction_type === 'Expense') {
            expenseTotal += convertedAmount;
          }
          
          return {
            id: t.transaction_id,
            type: t.description || t.transaction_type,
            date: new Date(t.transaction_date).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            amount: convertedAmount, // Converted amount
            original_amount: Math.abs(t.amount), // Keep original amount
            original_currency: t.currency_code, // Keep original currency
            category: t.category_name,
            payment_method: t.payment_method,
            currency_code: baseCurrency, // Use base currency for display
            transaction_type: t.transaction_type
          };
        });
        
        setAllTransactions(transactionsForGrid);
        setRecentTransactions(transactionsForGrid.slice(0, 10));
        
        // Get last activity
        if (transactions.length > 0) {
          const lastTrans = transactions[0]; // Assuming transactions are sorted by date desc
          const convertedAmount = convertCurrency(
            Math.abs(lastTrans.amount),
            lastTrans.currency_code,
            baseCurrency
          );
          
          setLastActivity({
            date: new Date(lastTrans.transaction_date).toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            amount: convertedAmount,
            type: lastTrans.transaction_type,
            description: lastTrans.description || lastTrans.category_name,
            currency: baseCurrency
          });
        }
        
        // Analyze currency distribution with converted amounts
        const currencies = {};
        transactions.forEach(t => {
          const convertedAmount = convertCurrency(
            Math.abs(t.amount),
            t.currency_code, 
            baseCurrency
          );
          
          if (!currencies[t.currency_code]) {
            currencies[t.currency_code] = { 
              count: 0, 
              total: 0,
              expense: 0,
              income: 0,
              converted_total: 0 // Total in base currency
            };
          }
          
          currencies[t.currency_code].count += 1;
          currencies[t.currency_code].total += Math.abs(t.amount); // Original amount
          currencies[t.currency_code].converted_total += convertedAmount; // Converted amount
          
          if (t.transaction_type === 'Income') {
            currencies[t.currency_code].income += Math.abs(t.amount);
          } else {
            currencies[t.currency_code].expense += Math.abs(t.amount);
          }
        });
        
        const currencyArr = Object.entries(currencies).map(([code, data]) => ({
          code,
          count: data.count,
          total: data.total,
          expense: data.expense,
          income: data.income,
          converted_total: data.converted_total,
          exchange_rate: exchangeRates[code] || 1
        }));
        
        setCurrencyDistribution(currencyArr);
        
        // Use our locally calculated totals (with conversion)
        setTotalIncome(incomeTotal);
        setTotalExpense(expenseTotal);
        
        // Analyze payment methods - only include expense transactions
        const paymentMethods = {};
        transactions.forEach(t => {
          if (t.payment_method && t.transaction_type === 'Expense') {
            if (!paymentMethods[t.payment_method]) {
              paymentMethods[t.payment_method] = 0;
            }
            paymentMethods[t.payment_method] += Math.abs(Number(t.amount));
          }
        });
        
        const paymentMethodArr = Object.entries(paymentMethods).map(([name, value]) => ({
          name,
          value: Number(value)
        }));
        setPaymentMethodData(paymentMethodArr.sort((a, b) => b.value - a.value));
        
        // Process category data for pie chart
        const colors = ['#2C3E50', '#E74C3C', '#3498DB', '#E91E63', '#9C27B0', '#009688'];
        const categories = summaryData.categories || [];
        
        const categoryData = categories
          .filter(cat => cat.category_type === 'Expense')
          .map((cat, index) => ({
            id: index,
            value: Math.abs(Number(cat.total_amount)) || 0,
            label: cat.category_name,
            color: colors[index % colors.length]
          }));
          
        setCategorySummary(categoryData);
        
        // Get top spending categories
        const topCats = [...categoryData]
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        setTopCategories(topCats);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only load data if we have exchange rates
    if (Object.keys(exchangeRates).length > 0) {
      loadData();
    }
  }, [userId, baseCurrency, exchangeRates]); // Add dependencies

  // Function to render payment method icon
  const getPaymentIcon = (method) => {
    switch(method?.toLowerCase()) {
      case 'credit card':
        return <CreditCardIcon />;
      case 'bank transfer':
        return <AccountBalanceIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  // Currency formatter for pie chart
  const valueFormatter = (value) => {
    // Check if value is a number before using toFixed
    if (typeof value === 'number') {
      return `$${value.toFixed(2)}`;
    }
    return `$${value}`;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Summary Cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Financial Overview
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
              Financial Summary
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>Total Income:</Typography>
                <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600 }}>
                  {formatCurrency(totalIncome)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>Total Expenses:</Typography>
                <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600 }}>
                  {formatCurrency(totalExpense)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>Net Balance:</Typography>
                <Typography variant="h6" sx={{ 
                  color: theme => (totalIncome - totalExpense) >= 0 ? theme.palette.success.main : theme.palette.error.main, 
                  fontWeight: 600 
                }}>
                  {(totalIncome - totalExpense) >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalIncome - totalExpense))}
                </Typography>
              </Box>
              {lastActivity && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #F1F5F9' }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Last Activity:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {lastActivity.description} - {formatCurrency(lastActivity.amount)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {lastActivity.date}
                  </Typography>
                </Box>
              )}
            </Box>
          </StyledPaper>
        </Grid>

        {/* Currency Distribution - moved here */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
              Currency Distribution
            </Typography>
            {currencyDistribution.length > 0 ? (
              <TableContainer>
                <Table sx={{ minWidth: 250 }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Currency</TableCell>
                      <TableCell align="right">Transactions</TableCell>
                      <TableCell align="right">Total Volume</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currencyDistribution.map((row) => (
                      <TableRow key={row.code}>
                        <TableCell component="th" scope="row">
                          <Chip label={row.code} size="small" />
                        </TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                        <TableCell align="right">{formatCurrency(row.converted_total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  No currency data available
                </Typography>
              </Box>
            )}
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Financial Details */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Financial Details
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: 3 }}>
        {/* Expense Categories - moved here */}
        <Grid item xs={12} md={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
              Expense Breakdown by Category
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <SyncedExpenseCharts />
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Transactions DataGrid */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Transactions
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
              All Transactions
            </Typography>
            <Box sx={{ mt: 2 }}>
              {allTransactions.length > 0 ? (
                <TransactionsDataGrid transactions={allTransactions} baseCurrency={baseCurrency} />
              ) : (
                <Typography variant="body1" align="center" sx={{ py: 2, color: 'text.secondary' }}>
                  No transactions available
                </Typography>
              )}
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Top Spending Categories */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Top Categories
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
              Top Spending Categories
            </Typography>
            {topCategories.length > 0 ? (
              <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">% of Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topCategories.map((category) => (
                      <TableRow key={category.label}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                bgcolor: category.color,
                                mr: 1 
                              }} 
                            />
                            {category.label}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(category.value)}</TableCell>
                        <TableCell align="right">
                          {((category.value / totalExpense) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" align="center" sx={{ py: 2, color: 'text.secondary' }}>
                No category data available
              </Typography>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppTheme>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* App Bar with hamburger menu and theme selector */}
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
              FinTrack Dashboard
            </Typography>
            {/* Add ColorModeSelect for theme switching */}
            <ColorModeSelect sx={{ ml: 1 }} />
          </Toolbar>
        </AppBar>
        
        {/* Use the shared Sidebar */}
        <Sidebar open={sidebarOpen} onClose={handleDrawerToggle} />
        
        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: 8, // Space for fixed AppBar
            px: 2,
            backgroundColor: 'background.default', // Use theme background instead of hardcoded color
          }}
        >
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <FinancialContent />
          </Container>
        </Box>
      </Box>
    </AppTheme>
  );
}