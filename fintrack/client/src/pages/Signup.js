import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  IconButton,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import logo from '../logo.svg';

const currencies = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'CNY', label: 'Chinese Yuan (CNY)' },
];

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    base_currency: 'USD',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { confirmPassword, ...signupData } = formData;
      const response = await axios.post('/api/users', signupData);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2 
            }}
          >
            <img src={logo} alt="FinTrack Logo" style={{ width: 120, marginBottom: 16 }} />
          </motion.div>

          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
            }}
          >
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                mb: 3, 
                fontWeight: 600,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
              }}
            >
              Create Account
            </Typography>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                  {error}
                </Alert>
              </motion.div>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              {[
                {
                  name: 'name',
                  label: 'Full Name',
                  autoComplete: 'name',
                  delay: 0.3,
                },
                {
                  name: 'email',
                  label: 'Email Address',
                  autoComplete: 'email',
                  delay: 0.4,
                },
                {
                  name: 'password',
                  label: 'Password',
                  type: showPassword ? 'text' : 'password',
                  delay: 0.5,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
                {
                  name: 'confirmPassword',
                  label: 'Confirm Password',
                  type: showConfirmPassword ? 'text' : 'password',
                  delay: 0.6,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              ].map((field) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: field.delay, duration: 0.5 }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id={field.name}
                    label={field.label}
                    name={field.name}
                    autoComplete={field.autoComplete}
                    type={field.type || 'text'}
                    value={formData[field.name]}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: field.endAdornment,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#2196F3',
                        },
                      },
                    }}
                  />
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <TextField
                  select
                  margin="normal"
                  required
                  fullWidth
                  id="base_currency"
                  label="Base Currency"
                  name="base_currency"
                  value={formData.base_currency}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#2196F3',
                      },
                    },
                  }}
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </MenuItem>
                  ))}
                </TextField>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    height: 48,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #21CBF3 90%)',
                    },
                  }}
                >
                  Sign Up
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      style={{
                        color: '#2196F3',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Sign in here
                    </Link>
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Signup;
