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
  CircularProgress 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
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

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
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

const fetchExpenseByCategory = async (userId) => {
  try {
    const response = await axios.get(`/api/transactions/summary/${userId}`);
    return response.data.categories || [];
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    return [];
  }
};

function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State variables for data
  const [userId, setUserId] = useState(158); // Using fixed user ID 158
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);
  const [balanceData, setBalanceData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Fetch data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch transactions
        const transactions = await fetchUserTransactions(userId);
        
        // Process recent transactions
        const recent = transactions.slice(0, 5).map(t => ({
          id: t.transaction_id,
          type: t.description || t.transaction_type,
          date: new Date(t.transaction_date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          amount: t.transaction_type === 'Expense' ? -t.amount : t.amount
        }));
        setRecentTransactions(recent);
        
        // Process weekly activity data
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 is Sunday
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - dayOfWeek);
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekly = days.map(day => ({
          day,
          deposit: 0,
          withdraw: 0
        }));
        
        // Fill in transaction data for the week
        transactions.forEach(t => {
          const transDate = new Date(t.transaction_date);
          // Check if transaction is from current week
          if (transDate >= weekStart && transDate <= now) {
            const dayIndex = transDate.getDay();
            if (t.transaction_type === 'Income') {
              weekly[dayIndex].deposit += Number(t.amount);
            } else {
              weekly[dayIndex].withdraw += Number(t.amount);
            }
          }
        });
        
        setWeeklyData(weekly);
        
        // Process balance history (last 6 months)
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          months.push({
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            date: d,
            balance: 0
          });
        }
        
        // Calculate balance for each month
        let runningBalance = 0;
        transactions.sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));
        
        transactions.forEach(t => {
          const amount = Number(t.amount);
          if (t.transaction_type === 'Income') {
            runningBalance += amount;
          } else {
            runningBalance -= amount;
          }
          
          const transDate = new Date(t.transaction_date);
          // Find which month this belongs to
          for (const month of months) {
            if (transDate.getMonth() === month.date.getMonth() &&
                transDate.getFullYear() === month.date.getFullYear()) {
              month.balance = runningBalance;
              break;
            }
          }
        });
        
        setBalanceData(months.map(m => ({
          month: m.month,
          balance: m.balance
        })));
        
        // Fetch expense categories
        const categories = await fetchExpenseByCategory(userId);
        const colors = ['#2C3E50', '#E74C3C', '#3498DB', '#E91E63', '#9C27B0', '#009688'];
        
        const expenseStats = categories
          .filter(cat => cat.category_type === 'Expense')
          .map((cat, index) => ({
            name: cat.category_name,
            value: Number(cat.total_amount) || 0,
            color: colors[index % colors.length]
          }));
          
        setExpenseData(expenseStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [userId]);

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
          Overview
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
  
      {/* Main Content: Four Modules in 2x2 Grid */}
      <Grid container spacing={3}>
        {/* Weekly Activity */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
              Weekly Activity
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="deposit" fill="#3461FF" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="withdraw" fill="#36CFCF" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </StyledPaper>
        </Grid>
  
        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
              Recent Transaction
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto', mt: 2 }}>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <TransactionItem key={transaction.id}>
                    <Avatar 
                      sx={{ 
                        bgcolor: transaction.amount < 0 ? '#FFE2E5' : '#E8F5E9',
                        color: transaction.amount < 0 ? '#FF3B3B' : '#4CAF50',
                        mr: 2 
                      }}
                    >
                      {transaction.amount < 0 ? '-' : '+'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ color: '#1E293B', fontWeight: 500 }}>
                        {transaction.type}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        {transaction.date}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        color: transaction.amount < 0 ? '#FF3B3B' : '#4CAF50',
                        fontWeight: 600 
                      }}
                    >
                      {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount)}
                    </Typography>
                  </TransactionItem>
                ))
              ) : (
                <Typography variant="body1" align="center" sx={{ py: 2 }}>
                  No recent transactions
                </Typography>
              )}
            </Box>
          </StyledPaper>
        </Grid>
  
        {/* Balance History */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
              Balance History
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={balanceData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#3461FF" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </StyledPaper>
        </Grid>
  
        {/* Expense Statistics */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
              Expense Statistics
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
}

export default Dashboard;