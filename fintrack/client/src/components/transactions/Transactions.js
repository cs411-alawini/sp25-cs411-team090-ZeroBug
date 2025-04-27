import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

// Import components
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import Sidebar from '../shared/Sidebar';
import TransactionsList from './TransactionsList';
import TransactionForm from './TransactionForm';
import FilterDialog from './FilterDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { StyledPaper } from './TransactionsStyles';

export default function Transactions() {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [userId, setUserId] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([
    { currency_code: 'USD' }, 
    { currency_code: 'EUR' }, 
    { currency_code: 'GBP' }, 
    { currency_code: 'JPY' }, 
    { currency_code: 'CNY' }
  ]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    type: '',
    category: '',
    currency: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

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
    const amountInUSD = amount / exchangeRates[fromCurrency];
    return amountInUSD * exchangeRates[toCurrency];
  };

  // Load transactions and categories when userId is available
  useEffect(() => {
    if (!userId) return; // Skip if userId is not available
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Load categories
        const categoriesResponse = await axios.get('/api/categories');
        setCategories(categoriesResponse.data);
        
        // Load transactions
        await fetchTransactions();
      } catch (error) {
        console.error('Error loading data:', error);
        setAlertInfo({
          open: true,
          message: 'Failed to load data. Please try again.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [userId, exchangeRates, baseCurrency]); // Added dependencies

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch transactions with optional filters
  const fetchTransactions = async () => {
    if (!userId) return; // Skip if userId is not available
    
    try {
      const filterParams = {};
      
      if (filters.startDate) {
        filterParams.startDate = filters.startDate.toISOString().split('T')[0];
      }
      
      if (filters.endDate) {
        filterParams.endDate = filters.endDate.toISOString().split('T')[0];
      }
      
      if (filters.type) {
        filterParams.type = filters.type;
      }
      
      if (filters.category) {
        filterParams.category = filters.category;
      }
      
      if (filters.currency) {
        filterParams.currency = filters.currency;
      }
      
      const response = await axios.get(`/api/transactions/user/${userId}`, {
        params: filterParams
      });
      
      // Process for grid display with currency conversion
      const transactionsForGrid = response.data.map(t => {
        // Convert amount to user's base currency
        const convertedAmount = convertCurrency(
          Math.abs(Number(t.amount)), 
          t.currency_code, 
          baseCurrency
        );
        
        return {
          id: t.transaction_id,
          type: t.description || t.transaction_type,
          date: new Date(t.transaction_date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          rawDate: t.transaction_date,
          amount: convertedAmount, // Converted amount
          original_amount: Math.abs(Number(t.amount)), // Keep original amount
          original_currency: t.currency_code, // Keep original currency
          category: t.category_name,
          category_id: t.category_id,
          payment_method: t.payment_method,
          currency_code: baseCurrency, // Display in base currency
          transaction_type: t.transaction_type
        };
      });
      
      setTransactions(transactionsForGrid);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setAlertInfo({
        open: true,
        message: 'Failed to fetch transactions.',
        severity: 'error'
      });
    }
  };

  // Apply filters to transactions
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    fetchTransactions();
  };

  // Open form to add new transaction
  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setOpenForm(true);
  };

  // Open form to edit transaction
  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenForm(true);
  };

  // Click handler for delete button
  const handleDeleteClick = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDeleteDialog(true);
  };

  // Confirm transaction deletion
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/transactions/${selectedTransaction.id}`);
      
      // Refresh transactions list
      await fetchTransactions();
      
      setAlertInfo({
        open: true,
        message: 'Transaction deleted successfully',
        severity: 'success'
      });
      
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setAlertInfo({
        open: true,
        message: 'Failed to delete transaction.',
        severity: 'error'
      });
    }
  };

  // Handle form save (create/update)
  const handleFormSave = async (transaction) => {
    setAlertInfo({
      open: true,
      message: `Transaction ${selectedTransaction ? 'updated' : 'created'} successfully`,
      severity: 'success'
    });
    
    // Refresh transactions
    await fetchTransactions();
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      transaction.type?.toLowerCase().includes(term) ||
      transaction.category?.toLowerCase().includes(term) ||
      transaction.payment_method?.toLowerCase().includes(term) ||
      transaction.amount.toString().includes(term)
    );
  });

  // Handle alert close
  const handleAlertClose = () => {
    setAlertInfo({ ...alertInfo, open: false });
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
              Transactions
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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Actions toolbar */}
                <StyledPaper sx={{ mb: 3, p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={handleSearch}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<FilterListIcon />}
                        onClick={() => setOpenFilter(true)}
                        sx={{ mr: 1 }}
                      >
                        Filter
                      </Button>
                      <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={handleAddTransaction}
                      >
                        Add Transaction
                      </Button>
                    </Grid>
                  </Grid>
                </StyledPaper>
                
                {/* Transactions list with currency information */}
                <TransactionsList 
                  transactions={filteredTransactions}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteClick}
                  baseCurrency={baseCurrency}
                />
              </>
            )}
          </Container>
        </Box>
        
        {/* Transaction Form with currency information */}
        <TransactionForm 
          open={openForm}
          handleClose={() => setOpenForm(false)}
          transaction={selectedTransaction}
          categories={categories}
          currencies={currencies}
          onSave={handleFormSave}
          baseCurrency={baseCurrency}
          exchangeRates={exchangeRates}
        />
        
        {/* Filter Dialog */}
        <FilterDialog 
          open={openFilter}
          handleClose={() => setOpenFilter(false)}
          filters={filters}
          onApplyFilters={handleApplyFilters}
          categories={categories}
          currencies={currencies}
        />
        
        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog 
          open={openDeleteDialog}
          handleClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
          transaction={selectedTransaction}
        />
        
        {/* Alert Snackbar */}
        <Snackbar
          open={alertInfo.open}
          autoHideDuration={6000}
          onClose={handleAlertClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleAlertClose} severity={alertInfo.severity} sx={{ width: '100%' }}>
            {alertInfo.message}
          </Alert>
        </Snackbar>
      </Box>
    </AppTheme>
  );
}