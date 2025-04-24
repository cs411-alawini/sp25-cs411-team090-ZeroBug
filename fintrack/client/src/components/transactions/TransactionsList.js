import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { StyledPaper } from './TransactionsStyles';

export default function TransactionsList({ transactions, onEdit, onDelete }) {
  // Function to get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch(method?.toLowerCase()) {
      case 'credit card':
      case 'debit card':
        return <CreditCardIcon fontSize="small" />;
      case 'bank transfer':
        return <AccountBalanceIcon fontSize="small" />;
      default:
        return <PaymentIcon fontSize="small" />;
    }
  };

  // DataGrid columns definition
  const columns = [
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" component="div">
          {params.value}
        </Typography>
      ),
    },
    { 
      field: 'type', 
      headerName: 'Description', 
      width: 200,
      flex: 1,
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ 
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' ? 'rgba(52, 97, 255, 0.2)' : '#EEF2FF',
            color: (theme) => 
              theme.palette.mode === 'dark' ? '#6B8AFF' : '#3461FF'
          }}
        />
      ),
    },
    { 
      field: 'payment_method', 
      headerName: 'Payment Method', 
      width: 150,
      renderCell: (params) => (
        params.value ? (
          <Chip
            icon={getPaymentMethodIcon(params.value)}
            label={params.value}
            size="small"
            sx={{ 
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark' ? 'rgba(52, 97, 255, 0.2)' : '#F8FAFF',
              color: (theme) => 
                theme.palette.mode === 'dark' ? '#6B8AFF' : '#3461FF'
            }}
          />
        ) : null
      ),
    },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          component="div"
          sx={{ 
            color: theme => params.row.transaction_type === 'Income' 
              ? theme.palette.success.main  // Green for income
              : theme.palette.error.main,   // Red for expense
            fontWeight: 600 
          }}
        >
          {params.row.transaction_type === 'Income' ? '+' : '-'}${Math.abs(params.value).toFixed(2)}
        </Typography>
      ),
    },
    { 
      field: 'currency_code', 
      headerName: 'Currency', 
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ 
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' ? 'rgba(52, 97, 255, 0.2)' : '#F1F5F9',
            color: (theme) => 
              theme.palette.mode === 'dark' ? '#6B8AFF' : '#64748B'
          }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton 
            size="small" 
            onClick={() => onEdit(params.row)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => onDelete(params.row)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <StyledPaper>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600, mb: 2 }}>
        All Transactions
      </Typography>
      
      <Box sx={{ height: 500, width: '100%' }}>
        {transactions.length > 0 ? (
          <DataGrid
            rows={transactions}
            columns={columns}
            rowHeight={48}
            disableRowSelectionOnClick
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
              sorting: {
                sortModel: [{ field: 'date', sort: 'desc' }],
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: (theme) => theme.palette.background.default,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }}
          />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              No transactions found. Add a new transaction to get started.
            </Typography>
          </Box>
        )}
      </Box>
    </StyledPaper>
  );
} 