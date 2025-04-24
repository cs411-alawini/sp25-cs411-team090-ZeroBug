import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

export default function DeleteConfirmationDialog({ open, handleClose, onConfirm, transaction }) {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Transaction</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </Typography>
        {transaction && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {transaction.type}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Amount: ${Math.abs(transaction.amount || 0).toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date: {transaction.date}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
} 