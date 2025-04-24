import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function FilterDialog({ open, handleClose, filters, onApplyFilters, categories, currencies }) {
  const [filterState, setFilterState] = useState({
    startDate: '',
    endDate: '',
    type: '',
    category: '',
    currency: '',
  });
  
  useEffect(() => {
    // Format dates for form inputs
    setFilterState({
      startDate: filters.startDate ? filters.startDate.toISOString().split('T')[0] : '',
      endDate: filters.endDate ? filters.endDate.toISOString().split('T')[0] : '',
      type: filters.type || '',
      category: filters.category || '',
      currency: filters.currency || '',
    });
  }, [filters, open]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilterState({ ...filterState, [name]: value });
  };
  
  const handleApply = () => {
    // Convert string dates to Date objects for the parent component
    const processedFilters = {
      ...filterState,
      startDate: filterState.startDate ? new Date(filterState.startDate) : null,
      endDate: filterState.endDate ? new Date(filterState.endDate) : null,
    };
    onApplyFilters(processedFilters);
    handleClose();
  };
  
  const handleReset = () => {
    const resetFilters = {
      startDate: null,
      endDate: null,
      type: '',
      category: '',
      currency: '',
    };
    setFilterState({
      startDate: '',
      endDate: '',
      type: '',
      category: '',
      currency: '',
    });
    onApplyFilters(resetFilters);
    handleClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filter Transactions</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                id="startDate"
                label="Start Date"
                name="startDate"
                type="date"
                value={filterState.startDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                id="endDate"
                label="End Date"
                name="endDate"
                type="date"
                value={filterState.endDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="filter-type-label">Type</InputLabel>
                <Select
                  labelId="filter-type-label"
                  id="type"
                  name="type"
                  value={filterState.type}
                  onChange={handleChange}
                  label="Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Expense">Expense</MenuItem>
                  <MenuItem value="Income">Income</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="filter-category-label">Category</InputLabel>
                <Select
                  labelId="filter-category-label"
                  id="category"
                  name="category"
                  value={filterState.category}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="filter-currency-label">Currency</InputLabel>
                <Select
                  labelId="filter-currency-label"
                  id="currency"
                  name="currency"
                  value={filterState.currency}
                  onChange={handleChange}
                  label="Currency"
                >
                  <MenuItem value="">All Currencies</MenuItem>
                  {currencies.map((currency) => (
                    <MenuItem key={currency.currency_code} value={currency.currency_code}>
                      {currency.currency_code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="inherit">
          Reset
        </Button>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleApply} variant="contained" color="primary">
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
} 