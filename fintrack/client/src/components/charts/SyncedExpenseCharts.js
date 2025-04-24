import React, { useState, useEffect } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

export const SyncedExpenseCharts = () => {
  const theme = useTheme();
  const [highlightedItem, setHighlightedItem] = useState(null);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = 158; // Use the same user ID as in dashboard
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Function to refresh data
  const refreshData = () => {
    setLastUpdated(Date.now());
  };

  // Expose refresh function to the global scope
  useEffect(() => {
    // Add a global event listener for transaction updates
    window.addEventListener('transaction_updated', refreshData);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('transaction_updated', refreshData);
    };
  }, []);

  // Load real expense data
  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/transactions/summary/${userId}`);
        const summaryData = response.data;
        
        // Process category data for charts
        const colors = ['#2C3E50', '#E74C3C', '#3498DB', '#E91E63', '#9C27B0', '#009688', '#FF9800', '#4CAF50'];
        const categories = summaryData.categories || [];
        
        const processedData = categories
          .filter(cat => cat.category_type === 'Expense' && Number(cat.total_amount) > 0)
          .map((cat, index) => ({
            id: index,
            value: Math.abs(Number(cat.total_amount) || 0),
            label: cat.category_name,
            color: colors[index % colors.length]
          }));
        
        setExpenseData(processedData);
      } catch (error) {
        console.error('Error loading expense chart data:', error);
        // Provide some fallback data if the API call fails
        setExpenseData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpenseData();
  }, [userId, lastUpdated]); // Add lastUpdated to update when triggered

  // Format value as currency
  const valueFormatter = (value) => {
    // Extract the numeric value if it's an object
    const numericValue = typeof value === 'object' && value !== null ? value.value : value;
    
    if (typeof numericValue === 'number') {
      return `$${numericValue.toFixed(2)}`;
    }
    return '';
  };

  // Common props for both charts
  const barChartProps = {
    height: 250,
    margin: { top: 10, bottom: 30, left: 40, right: 10 },
    slotProps: {
      legend: {
        hidden: true,
      },
    },
  };

  // Props for pie chart with legend visible
  const pieChartProps = {
    height: 250,
    margin: { top: 10, bottom: 30, left: 40, right: 30 },
    slotProps: {
      legend: {
        direction: 'row',
        position: { vertical: 'bottom', horizontal: 'middle' },
        padding: 0,
      },
    },
  };

  // Handle highlighting in both charts
  const handleHighlight = (id) => {
    setHighlightedItem(id === highlightedItem ? null : id);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (expenseData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
        <Typography variant="body1" color="text.secondary">
          No expense data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" align="center" gutterBottom>
            Expenses by Category (Bar)
          </Typography>
          <BarChart
            {...barChartProps}
            xAxis={[{
              scaleType: 'band',
              data: expenseData.map(item => item.label),
              tickLabelStyle: {
                fill: theme.palette.text.secondary,
                fontSize: 12,
              },
            }]}
            series={[{
              data: expenseData.map(item => item.value),
              color: expenseData.map(item => 
                highlightedItem === item.id || highlightedItem === null ? item.color : 'rgba(0,0,0,0.2)'
              ),
              valueFormatter,
              label: 'Amount',
            }]}
            tooltip={{ 
              trigger: 'item',
              formatter: (params) => `${params.name}: ${valueFormatter(params.value)}`
            }}
            onItemClick={(_, itemIndex) => {
              handleHighlight(expenseData[itemIndex].id);
            }}
            sx={{
              '.MuiChartsAxis-line, .MuiChartsAxis-tick': {
                stroke: theme.palette.divider,
              },
              '.MuiChartsAxis-tickLabel': {
                fill: theme.palette.text.secondary,
              },
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" align="center" gutterBottom>
            Expenses by Category (Pie)
          </Typography>
          <PieChart
            {...pieChartProps}
            series={[{
              data: expenseData.map(item => ({
                id: item.id,
                value: item.value,
                label: item.label,
                color: item.color,
                highlighted: highlightedItem === item.id
              })),
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
              valueFormatter,
            }]}
            tooltip={{ 
              trigger: 'item',
              formatter: (params) => `${params.name}: ${valueFormatter(params.value)}`
            }}
            onItemClick={(_, itemIndex) => {
              handleHighlight(expenseData[itemIndex].id);
            }}
            sx={{
              '.MuiChartsLegend-label': {
                fill: theme.palette.text.primary,
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};


