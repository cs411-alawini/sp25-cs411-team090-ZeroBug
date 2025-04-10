import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  InputBase,
  IconButton,
  Avatar,
  styled,
  useTheme,
  useMediaQuery,
  CircularProgress,
  List, 
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { 
  PieChart, Pie, Cell, 
  ResponsiveContainer,
  Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import axios from 'axios';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: theme.spacing(2),
  height: '100%',
  boxShadow: 'none',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  backgroundColor: '#F8FAFF',
  borderRadius: 12,
  width: 300,
  display: 'flex',
  alignItems: 'center',
}));

const TransactionItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderRadius: 12,
  backgroundColor: '#FFFFFF',
  marginBottom: theme.spacing(2),
  '&:hover': {
    backgroundColor: '#F8FAFF',
  },
}));

const DashboardContainer = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(2),
    backgroundColor: '#F8FAFF',
    minHeight: '100vh',
    maxWidth: '1280px',
    margin: '0 auto',
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

function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State variables for data
  const userId = 158; // Using fixed user ID 158
  const [isLoading, setIsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [currencyDistribution, setCurrencyDistribution] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [lastActivity, setLastActivity] = useState(null);

  // Fetch data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch transactions
        const transactions = await fetchUserTransactions(userId);
        
        // Process recent transactions
        const recent = transactions.slice(0, 10).map(t => ({
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
        setRecentTransactions(recent);
        
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
            name: cat.category_name,
            value: Number(cat.total_amount) || 0,
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardContainer>
      {/* Header */}
      <Box sx={{ 
        mb: 3,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2,
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1E293B' }}>
          Financial Overview
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          width: isMobile ? '100%' : 'auto'
        }}>
          <SearchBar sx={{ 
            flex: isMobile ? 1 : 'none',
            maxWidth: isMobile ? '100%' : 300
          }}>
            <IconButton sx={{ p: 1 }}>
              <SearchIcon sx={{ color: '#94A3B8' }} />
            </IconButton>
            <InputBase
              placeholder="Search for something"
              sx={{ ml: 1, flex: 1, color: '#94A3B8' }}
            />
          </SearchBar>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small">
              <SettingsIcon sx={{ color: '#94A3B8' }} />
            </IconButton>
            <IconButton size="small">
              <NotificationsIcon sx={{ color: '#94A3B8' }} />
            </IconButton>
            <Avatar 
              alt="UI" 
              src="/path/to/illinois-logo.png"
              sx={{ width: 32, height: 32 }}
            />
          </Box>
        </Box>
      </Box>
  
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
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
  
        {/* Expense By Category */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
              Expense Categories
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              {categorySummary.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySummary}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categorySummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" sx={{ color: '#64748B' }}>
                    No category data available
                </Typography>
                </Box>
              )}
            </Box>
          </StyledPaper>
        </Grid>
        </Grid>
  
      {/* New Features Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Payment Method Analysis */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
              Payment Method Analysis
            </Typography>
            {paymentMethodData.length > 0 ? (
              <Box sx={{ height: 250, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentMethodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Bar dataKey="value" fill="#3461FF" />
                  </BarChart>
              </ResponsiveContainer>
            </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography variant="body1" sx={{ color: '#64748B' }}>
                  No payment method data available
                </Typography>
              </Box>
            )}
          </StyledPaper>
        </Grid>
  
        {/* Currency Distribution */}
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

      {/* Top Spending Categories */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
              Top Spending Categories
            </Typography>
            {topCategories.length > 0 ? (
              <TableContainer sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">% of Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topCategories.map((category) => (
                      <TableRow key={category.name}>
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
                            {category.name}
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
  
      {/* Recent Transactions */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
              Recent Transactions
            </Typography>
            <Box sx={{ mt: 2 }}>
              {recentTransactions.length > 0 ? (
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  {recentTransactions.map((transaction) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: transaction.amount < 0 ? '#FFE2E5' : '#E8F5E9',
                              color: transaction.amount < 0 ? '#FF3B3B' : '#4CAF50',
                            }}
                          >
                            {transaction.amount < 0 ? '-' : '+'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography component="span" variant="subtitle1" color="#1E293B">
                                {transaction.type}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {transaction.payment_method && (
                                  <Chip 
                                    icon={getPaymentIcon(transaction.payment_method)} 
                                    label={transaction.payment_method}
                                    size="small"
                                    sx={{ mr: 1, fontSize: '0.7rem' }}
                                  />
                                )}
                                <Typography 
                                  component="span" 
                                  variant="subtitle1"
                                  sx={{ 
                                    color: transaction.amount < 0 ? '#FF3B3B' : '#4CAF50',
                                    fontWeight: 600 
                                  }}
                                >
                                  {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                                  {transaction.currency_code !== 'USD' && ` ${transaction.currency_code}`}
                                </Typography>
                              </Box>
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="#64748B">
                                {transaction.date} • {transaction.category}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" align="center" sx={{ py: 2, color: '#64748B' }}>
                  No recent transactions
                </Typography>
              )}
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
}

export default Dashboard;