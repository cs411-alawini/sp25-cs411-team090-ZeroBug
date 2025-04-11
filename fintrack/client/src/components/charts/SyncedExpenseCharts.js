import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

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

export function ExpensePieChart({ data, highlightedItem, setHighlightedItem }) {
  const processedData = withIds(data);

  return (
    <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {processedData.length > 0 ? (
        <PieChart
          series={[
            {
              id: 'categories',
              data: processedData,
              highlightScope: { fade: 'global', highlight: 'item' },
            },
          ]}
          height={300}
          margin={{ right: 5 }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
          sx={{
            '.MuiPieArc-highlighted': {
              filter: 'drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.2))',
            },
          }}
        />
      ) : (
        <Typography variant="body1" sx={{ color: '#64748B' }}>
          No category data available
        </Typography>
      )}
    </Box>
  );
}

export function ExpenseBarChart({ data, highlightedItem, setHighlightedItem }) {
  const processedData = withIds(data);

  return (
    <Box sx={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {processedData.length > 0 ? (
        <BarChart
          dataset={processedData}
          series={[
            {
              id: 'categories',
              dataKey: 'value',
              label: 'Amount',
              valueFormatter,
              highlightScope: { fade: 'global', highlight: 'item' },
            },
          ]}
          xAxis={[{ scaleType: 'band', dataKey: 'label' }]}
          height={250}
        />
      ) : (
        <Typography variant="body1" sx={{ color: '#64748B' }}>
          No category data available
        </Typography>
      )}
    </Box>
  );
}

export function SyncedExpenseCharts({ pieData, barData }) {
  const [highlightedItem, setHighlightedItem] = React.useState(null);

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ width: '100%' }}
    >
      <ExpensePieChart
        data={pieData}
        highlightedItem={highlightedItem}
        setHighlightedItem={setHighlightedItem}
      />
      <ExpenseBarChart
        data={barData}
        highlightedItem={highlightedItem}
        setHighlightedItem={setHighlightedItem}
      />
    </Stack>
  );
}