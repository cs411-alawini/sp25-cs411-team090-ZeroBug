import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Chip,
  CircularProgress, Divider, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Autocomplete, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function AdvancedSearch() {
  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    selectedCategories: [],
    minAmount: '',
    maxAmount: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Get userId from localStorage when component mounts
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.user_id) {
      setUserId(userData.user_id);
    }
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setSearchParams({
      ...searchParams,
      [field]: value
    });
  };

  // Handle search
  const handleSearch = async () => {
    if (!userId) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      // Prepare params for advanced search
      const params = {
        keywords: searchParams.keywords,
        categories: searchParams.selectedCategories.map(c => c.category_id).join(','),
        minAmount: searchParams.minAmount || undefined,
        maxAmount: searchParams.maxAmount || undefined
      };
      
      const response = await axios.get(`/api/analysis/advanced-search/${userId}`, {
        params
      });
      
      setResults(response.data);
    } catch (err) {
      console.error('Error performing advanced search:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ mt: 3, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Advanced Transaction Search
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Keywords"
              value={searchParams.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              placeholder="Search in transaction descriptions"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              options={categories}
              getOptionLabel={(option) => option.category_name}
              value={searchParams.selectedCategories}
              onChange={(e, newValue) => handleInputChange('selectedCategories', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Categories"
                  placeholder="Select categories"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.category_name}
                    {...getTagProps({ index })}
                    key={option.category_id}
                  />
                ))
              }
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              label="Min Amount"
              type="number"
              value={searchParams.minAmount}
              onChange={(e) => handleInputChange('minAmount', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{
                min: 0,
                step: 0.01
              }}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              label="Max Amount"
              type="number"
              value={searchParams.maxAmount}
              onChange={(e) => handleInputChange('maxAmount', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{
                min: 0,
                step: 0.01
              }}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading || !userId}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Search Transactions'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {searched && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Search Results {results.length > 0 ? `(${results.length})` : ''}
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : results.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Match Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((transaction) => (
                    <TableRow key={transaction.transaction_id}>
                      <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                      <TableCell>{transaction.description || '(No description)'}</TableCell>
                      <TableCell>{transaction.category_name}</TableCell>
                      <TableCell align="right">
                        ${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={transaction.match_type === 'description_match' ? 'Keyword' : 'Category'}
                          color={transaction.match_type === 'description_match' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No transactions found matching your search criteria.
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
