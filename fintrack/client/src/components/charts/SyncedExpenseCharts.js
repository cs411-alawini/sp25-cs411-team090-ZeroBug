import React, { useState } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const SyncedExpenseCharts = () => {
  const theme = useTheme();
  const [highlightedItem, setHighlightedItem] = useState(null);

  // Format value as currency
  const valueFormatter = (value) => {
    // Extract the numeric value if it's an object
    const numericValue = typeof value === 'object' && value !== null ? value.value : value;
    
    if (typeof numericValue === 'number') {
      return `$${numericValue.toFixed(2)}`;
    }
    return '';
  };

  // Ensure every data item has an 'id' field
  function withIds(data) {
    return data.map((item) => ({
      ...item,
      id: item.id || item.label, // Use label as id if not provided
    }));
  }

  // Sample data - in a real app, this would be passed as props
  const expenseData = withIds([
    { value: 250, label: 'Food', color: '#2C3E50' },
    { value: 175, label: 'Transport', color: '#E74C3C' },
    { value: 320, label: 'Shopping', color: '#3498DB' },
    { value: 130, label: 'Utilities', color: '#E91E63' },
    { value: 95, label: 'Entertainment', color: '#9C27B0' }
  ]);

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
          />
        </Grid>
      </Grid>
    </Box>
  );
};


