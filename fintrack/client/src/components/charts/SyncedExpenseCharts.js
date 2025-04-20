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
    if (typeof value === 'number') {
      return `$${value.toFixed(2)}`;
    }
    return `$${value}`;
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
  const commonProps = {
    height: 250,
    margin: { top: 10, bottom: 30, left: 40, right: 10 },
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" align="center" gutterBottom>
            Expenses by Category (Bar)
          </Typography>
          <BarChart
            {...commonProps}
            xAxis={[{
              scaleType: 'band',
              data: expenseData.map(item => item.label),
            }]}
            series={[{
              data: expenseData.map(item => item.value),
              color: '#3461FF',
              highlightScope: { faded: 'global', highlighted: 'item' },
              valueFormatter: valueFormatter,
            }]}
            tooltip={{ 
              trigger: 'item',
              formatter: (params) => {
                return `${params.axisValueLabel}: ${valueFormatter(params.value)}`;
              }
            }}
            onItemClick={(_, itemIndex) => {
              setHighlightedItem(highlightedItem === itemIndex ? null : itemIndex);
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" align="center" gutterBottom>
            Expenses by Category (Pie)
          </Typography>
          <PieChart
            {...commonProps}
            series={[{
              data: expenseData.map((item, index) => ({
                ...item,
                highlighted: highlightedItem === index
              })),
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
              valueFormatter: valueFormatter,
            }]}
            onItemClick={(_, itemIndex) => {
              setHighlightedItem(highlightedItem === itemIndex ? null : itemIndex);
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};


