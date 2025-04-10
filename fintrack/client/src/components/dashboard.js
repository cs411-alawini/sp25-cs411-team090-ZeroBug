import * as React from 'react';
import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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

// Create a basic theme instead of using AppTheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3461FF',
    },
    secondary: {
      main: '#4CAF50',
    },
    background: {
      default: '#F8FAFF',
      paper: '#FFFFFF'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const drawerWidth = 240;

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: theme.spacing(2),
  height: '100%',
  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

// Sidebar component - now always temporary for hamburger style
function Sidebar({ open, onClose }) {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, active: true },
    { text: 'Transactions', icon: <ReceiptIcon /> },
    { text: 'Accounts', icon: <AccountBalanceWalletIcon /> },
    { text: 'Analytics', icon: <BarChartIcon /> },
    { text: 'Settings', icon: <SettingsIcon /> },
  ];

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
          backgroundColor: '#FFFFFF',
          borderRight: 'none',
          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
          FinTrack
        </Typography>
      </Box>
      <Divider />
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              sx={{
                borderRadius: '10px',
                mx: 1,
                mb: 0.5,
                backgroundColor: item.active ? '#EEF2FF' : 'transparent',
                color: item.active ? '#3461FF' : '#64748B',
                '&:hover': {
                  backgroundColor: '#F8FAFF',
                },
              }}
            >
              <ListItemIcon sx={{ color: item.active ? '#3461FF' : '#64748B' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', mb: 2, mx: 2 }}>
        <ListItemButton
          sx={{
            borderRadius: '10px',
            color: '#64748B',
            '&:hover': {
              backgroundColor: '#F8FAFF',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#64748B' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}

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
function TransactionsDataGrid({ transactions }) {
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
          sx={{ backgroundColor: '#EEF2FF', color: '#3461FF' }}
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
            sx={{ backgroundColor: '#F8FAFF' }}
          />
        ) : null
      ),
    },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          component="div"
          sx={{ 
            color: params.value < 0 ? '#FF3B3B' : '#4CAF50',
            fontWeight: 600 
          }}
        >
          {params.value < 0 ? '-' : '+'}${Math.abs(params.value).toFixed(2)}
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
          sx={{ backgroundColor: '#F1F5F9' }}
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
            borderBottom: '1px solid #F1F5F9',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#F8FAFF',
            borderBottom: '1px solid #E2E8F0',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid #E2E8F0',
          },
        }}
      />
    </Box>
  );
}

// The main content component
function FinancialContent() {
  // State variables for data
  const userId = 158; // Using fixed user ID
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

  // Fetch data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch transactions
        const transactions = await fetchUserTransactions(userId);
        
        // Process for grid display
        const transactionsForGrid = transactions.map(t => ({
          id: t.transaction_id,
          type: t.description || t.transaction_type,
          date: new Date(t.transaction_date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          amount: -t.amount, // Always negative since all are expenses
          category: t.category_name,
          payment_method: t.payment_method,
          currency_code: t.currency_code
        }));
        
        setAllTransactions(transactionsForGrid);
        setRecentTransactions(transactionsForGrid.slice(0, 10));
        
        // Get last activity
        if (transactions.length > 0) {
          const lastTrans = transactions[0]; // Assuming transactions are sorted by date desc
          setLastActivity({
            date: new Date(lastTrans.transaction_date).toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            amount: lastTrans.amount,
            type: lastTrans.transaction_type,
            description: lastTrans.description || lastTrans.category_name
          });
        }
        
        // Analyze payment methods
        const paymentMethods = {};
        transactions.forEach(t => {
          if (t.payment_method) {
            if (!paymentMethods[t.payment_method]) {
              paymentMethods[t.payment_method] = 0;
            }
            if (t.transaction_type === 'Expense') {
              paymentMethods[t.payment_method] += Number(t.amount);
            }
          }
        });
        
        const paymentMethodArr = Object.entries(paymentMethods).map(([name, value]) => ({
          name,
          value: Number(value)
        }));
        setPaymentMethodData(paymentMethodArr.sort((a, b) => b.value - a.value));
        
        // Analyze currency distribution
        const currencies = {};
        transactions.forEach(t => {
          if (!currencies[t.currency_code]) {
            currencies[t.currency_code] = { count: 0, total: 0 };
          }
          currencies[t.currency_code].count += 1;
          currencies[t.currency_code].total += Number(t.amount);
        });
        
        const currencyArr = Object.entries(currencies).map(([code, data]) => ({
          code,
          count: data.count,
          total: data.total
        }));
        setCurrencyDistribution(currencyArr);
        
        // Fetch summary data
        const summaryData = await fetchTransactionSummary(userId);
        if (summaryData.summary) {
          setTotalIncome(summaryData.summary.total_income || 0);
          setTotalExpense(summaryData.summary.total_expense || 0);
        }
        
        // Process category data for pie chart
        const colors = ['#2C3E50', '#E74C3C', '#3498DB', '#E91E63', '#9C27B0', '#009688'];
        const categories = summaryData.categories || [];
        
        const categoryData = categories
          .filter(cat => cat.category_type === 'Expense')
          .map((cat, index) => ({
            id: index,
            value: Number(cat.total_amount) || 0,
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
    
    loadData();
  }, [userId]);

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
            <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
              Financial Summary
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ color: '#64748B' }}>Total Income:</Typography>
                <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                  ${parseFloat(totalIncome).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ color: '#64748B' }}>Total Expenses:</Typography>
                <Typography variant="h6" sx={{ color: '#FF3B3B', fontWeight: 600 }}>
                  ${parseFloat(totalExpense).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ color: '#64748B' }}>Net Balance:</Typography>
                <Typography variant="h6" sx={{ 
                  color: totalIncome - totalExpense >= 0 ? '#4CAF50' : '#FF3B3B', 
                  fontWeight: 600 
                }}>
                  ${parseFloat(totalIncome - totalExpense).toFixed(2)}
                </Typography>
              </Box>
              {lastActivity && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #F1F5F9' }}>
                  <Typography variant="subtitle2" sx={{ color: '#64748B', mb: 1 }}>
                    Last Activity:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1E293B' }}>
                    {lastActivity.description} - ${parseFloat(lastActivity.amount).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
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
            <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
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
                        <TableCell align="right">${row.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography variant="body1" sx={{ color: '#64748B' }}>
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
            <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
              Expense Categories
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
            <SyncedExpenseCharts pieData={categorySummary} barData={categorySummary} />
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
            <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
              All Transactions
            </Typography>
            <Box sx={{ mt: 2 }}>
              {allTransactions.length > 0 ? (
                <TransactionsDataGrid transactions={allTransactions} />
              ) : (
                <Typography variant="body1" align="center" sx={{ py: 2, color: '#64748B' }}>
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
            <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
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
                        <TableCell align="right">${category.value.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          {((category.value / totalExpense) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" align="center" sx={{ py: 2, color: '#64748B' }}>
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* App Bar with hamburger menu */}
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
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: '#1E293B' }}>
              FinTrack Dashboard
            </Typography>
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
            backgroundColor: '#F8FAFF',
          }}
        >
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <FinancialContent />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}