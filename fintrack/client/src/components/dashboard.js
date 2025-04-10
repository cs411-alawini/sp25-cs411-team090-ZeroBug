import React from 'react';
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
  useMediaQuery 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

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

const weeklyData = [
  { day: 'Sat', deposit: 450, withdraw: 250 },
  { day: 'Sun', deposit: 350, withdraw: 120 },
  { day: 'Mon', deposit: 320, withdraw: 280 },
  { day: 'Tue', deposit: 450, withdraw: 350 },
  { day: 'Wed', deposit: 150, withdraw: 250 },
  { day: 'Thu', deposit: 400, withdraw: 220 },
  { day: 'Fri', deposit: 380, withdraw: 320 },
];

const balanceData = [
  { month: 'Jul', balance: 200 },
  { month: 'Aug', balance: 300 },
  { month: 'Sep', balance: 750 },
  { month: 'Oct', balance: 250 },
  { month: 'Nov', balance: 550 },
  { month: 'Dec', balance: 300 },
  { month: 'Jan', balance: 600 },
];

const expenseData = [
  { name: 'Entertainment', value: 30, color: '#2C3E50' },
  { name: 'Bill Expense', value: 15, color: '#E74C3C' },
  { name: 'Others', value: 35, color: '#3498DB' },
  { name: 'Investment', value: 20, color: '#E91E63' },
];

const recentTransactions = [
  {
    id: 1,
    type: 'Deposit from my Card',
    date: '28 January 2021',
    amount: -8850,
  },
  {
    id: 2,
    type: 'Deposit Paypal',
    date: '25 January 2021',
    amount: 2500,
  },
  {
    id: 3,
    type: 'Jemi Wilson',
    date: '21 January 2021',
    amount: 5400,
  },
];

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
  
  function Dashboard() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
                {recentTransactions.map((transaction) => (
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
                ))}
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