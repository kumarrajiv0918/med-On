'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async () => {
    setMessage('');
    setError('');

    // Basic form validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3001/auth/login', {
        email,
        password
      });

      if (res.data?.message) {
        const { roleId } = res.data.data;

        if (roleId !== 'admin') {
          setError('Only admin users can login.');
          setLoading(false);
          return;
        }

        // Set localStorage values
        localStorage.setItem('authToken', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data));

        setMessage(res.data.message);
        setLoading(false);
        router.push('/dashboard');
      } else {
        setError('Unexpected server response');
        setLoading(false);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'An unexpected error occurred. Please try again.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #1976d2, #0D47A1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2
      }}
    >
      <Paper
        elevation={15}
        sx={{
          padding: 5,
          maxWidth: 450,
          width: '100%',
          borderRadius: 4,
          background: '#f4f9fb'
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
          <LocalHospitalIcon sx={{ fontSize: 55, color: '#2e7d32', mr: 1 }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: '#2e7d32',
              textShadow: '0 1px 1px rgba(0,0,0,0.15)'
            }}
          >
            MedLogin Portal
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <TextField
          label="Email Address"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            disabled={loading}
            sx={{
              backgroundColor: '#2e7d32',
              '&:hover': { backgroundColor: '#27632a' },
              paddingY: 1.2,
              fontWeight: 600,
              boxShadow: '0 3px 5px rgba(0,0,0,0.2)'
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Login'}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            color="error"
            onClick={handleBack}
            sx={{
              paddingY: 1.2,
              fontWeight: 600
            }}
          >
            Back
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
