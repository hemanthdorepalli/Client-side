import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Snackbar, Alert, CircularProgress, Backdrop } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css'; // Import your custom CSS file

const LoginPage: React.FC<{ setUser: (user: any) => void }> = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('https://backend-nodejs-1-i9zy.onrender.com/api/auth/login', { email, password });
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setSnackbarMessage('Login successful');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => navigate('/home'), 500);
    } catch (error: any) {
      setSnackbarMessage(error.response?.data?.message || 'Error logging in');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container className="login-container">
      {loading && (
        <Backdrop open={loading} style={{ zIndex: 1201 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
      <Typography variant="h4" align="center" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleLogin} className="login-form">
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" color="primary" fullWidth type="submit" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
        </Button>
        <Link to="/register" className="register-link">
          Don’t have an account? Register
        </Link>
      </form>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%', backgroundColor: snackbarSeverity === 'success' ? 'green' : 'red' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LoginPage;
