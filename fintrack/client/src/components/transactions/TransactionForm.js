import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

export default function TransactionForm({ open, handleClose, transaction, categories, currencies, onSave }) {
  const isEdit = Boolean(transaction?.id);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
    payment_method: '',
    currency_code: 'USD',
    transaction_type: 'Expense',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      // Convert amount to positive for the form
      const amount = transaction.amount ? Math.abs(transaction.amount).toString() : '';
      
      setFormData({
        description: transaction.type || '',
        amount: amount,
        category_id: transaction.category_id || '',
        transaction_date: transaction.rawDate || new Date().toISOString().split('T')[0],
        payment_method: transaction.payment_method || '',
        currency_code: transaction.currency_code || 'USD',
        transaction_type: transaction.transaction_type || 'Expense',
      });
    } else {
      // Reset form for new transaction
      setFormData({
        description: '',
        amount: '',
        category_id: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: '',
        currency_code: 'USD',
        transaction_type: 'Expense',
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate form
      if (!formData.description || !formData.amount || !formData.category_id) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Prepare data for API
      const userId = 158; // Use the same user ID as in the dashboard
      const apiData = {
        user_id: userId,
        description: formData.description,
        // Convert to negative for expenses
        amount: formData.transaction_type === 'Expense' 
          ? -Math.abs(parseFloat(formData.amount)) 
          : Math.abs(parseFloat(formData.amount)),
        category_id: formData.category_id,
        transaction_date: formData.transaction_date,
        payment_method: formData.payment_method,
        currency_code: formData.currency_code,
        transaction_type: formData.transaction_type,
      };

      let response;
      if (isEdit) {
        // Update existing transaction
        response = await axios.put(`/api/transactions/${transaction.id}`, apiData);
      } else {
        // Create new transaction
        response = await axios.post('/api/transactions', apiData);
      }

      onSave(response.data);
      // Dispatch an event to notify charts to refresh
      window.dispatchEvent(new Event('transaction_updated'));
      handleClose();
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError('Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Transaction' : 'Add New Transaction'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="description"
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                autoFocus
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="transaction-type-label">Type</InputLabel>
                <Select
                  labelId="transaction-type-label"
                  id="transaction_type"
                  name="transaction_type"
                  value={formData.transaction_type}
                  onChange={handleChange}
                  label="Type"
                >
                  <MenuItem value="Expense">Expense</MenuItem>
                  <MenuItem value="Income">Income</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="amount"
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  label="Category"
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="transaction_date"
                label="Transaction Date"
                name="transaction_date"
                type="date"
                value={formData.transaction_date}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="payment-method-label">Payment Method</InputLabel>
                <Select
                  labelId="payment-method-label"
                  id="payment_method"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  label="Payment Method"
                >
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="Debit Card">Debit Card</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Mobile Payment">Mobile Payment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="currency-label">Currency</InputLabel>
                <Select
                  labelId="currency-label"
                  id="currency_code"
                  name="currency_code"
                  value={formData.currency_code}
                  onChange={handleChange}
                  label="Currency"
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.currency_code} value={currency.currency_code}>
                      {currency.currency_code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : (isEdit ? 'Update' : 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}