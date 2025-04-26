import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  Stack,
  IconButton,
  AppBar,
  Toolbar,
  CssBaseline,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import MenuIcon from '@mui/icons-material/Menu';
import { motion } from 'framer-motion';
import { getUserProfile, updateUserProfile } from '../../services/userService';
import Sidebar from '../shared/Sidebar';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';

const currencies = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'CNY', label: 'Chinese Yuan (CNY)' },
];

const Account = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    base_currency: 'USD',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (!userData || !userData.user_id) {
          setLoading(false);
          return;
        }
        
        const profile = await getUserProfile(userData.user_id);
        setUser(profile);
        setFormData({
          name: profile.name,
          email: profile.email,
          base_currency: profile.base_currency,
        });
        setLoading(false);
      } catch (error) {
        setError('Failed to load user profile');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await updateUserProfile(user.user_id, formData);
      setUser(updatedUser);
      
      // Update local storage
      const userData = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({
        ...userData,
        ...updatedUser
      }));
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      base_currency: user.base_currency,
    });
    setIsEditing(false);
    setError('');
  };

  if (!localStorage.getItem('user')) {
    return <Navigate to="/login" />;
  }

  return (
    <AppTheme>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* App Bar with hamburger menu and theme selector */}
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
              Account Settings
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
            pt: 8,
            px: 2,
            backgroundColor: 'background.default',
          }}
        >
          <Container maxWidth="md" sx={{ py: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper elevation={3} sx={{ 
                p: 4, 
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: (theme) => theme.palette.mode === 'dark' 
                  ? '0px 2px 6px rgba(0, 0, 0, 0.2)' 
                  : '0px 2px 6px rgba(0, 0, 0, 0.05)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h5" component="h1" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 600 }}>
                    Profile Information
                  </Typography>
                  {!isEditing && (
                    <Button 
                      startIcon={<EditIcon />} 
                      variant="contained" 
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                  </Alert>
                )}

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                      <Avatar
                        sx={{ 
                          width: 100, 
                          height: 100, 
                          mr: 3,
                          bgcolor: (theme) => theme.palette.primary.main,
                        }}
                        alt={user?.name || ''}
                      >
                        {user?.name?.charAt(0).toUpperCase() || ''}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ color: 'text.primary' }}>{user?.name}</Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          {user?.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
                            Personal Information
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "filled"}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "filled"}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
                            Preferences
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            select
                            label="Base Currency"
                            name="base_currency"
                            value={formData.base_currency}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "filled"}
                          >
                            {currencies.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                      </Grid>

                      {isEditing && (
                        <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={handleCancel}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            disabled={loading}
                          >
                            Save Changes
                          </Button>
                        </Stack>
                      )}
                    </Box>
                  </>
                )}
              </Paper>
            </motion.div>
          </Container>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default Account; 