import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegistrationPage.css';

const RegistrationPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [errors, setErrors] = useState({ name: false, email: false, password: false, confirmPassword: false });
  const navigate = useNavigate();

  const handleRegister = async () => {
    // Reset errors
    setErrors({ name: false, email: false, password: false, confirmPassword: false });

    // Validate fields
    if (!name || !email || !password || !confirmPassword) {
      setErrors({
        name: !name,
        email: !email,
        password: !password,
        confirmPassword: !confirmPassword,
      });
      setSnackbarMessage('Please fill in all fields');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (password !== confirmPassword) {
      setSnackbarMessage('Passwords do not match');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      await axios.post('https://backend-nodejs-1-i9zy.onrender.com/api/auth/register', { name, email, password });
      setSnackbarMessage('User registered successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => navigate('/'), 500); // Redirect to the login page after a short delay
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        setSnackbarMessage('User already exists');
        setSnackbarSeverity('error');
      } else {
        setSnackbarMessage('Error registering user');
        setSnackbarSeverity('error');
      }
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container className="registration-container">
      <Typography variant="h4" align="center" gutterBottom className="registration-title">
        Register
      </Typography>
      <form className="registration-form">
        <TextField 
          label="Name" 
          variant="outlined" 
          fullWidth 
          margin="normal" 
          onChange={(e) => setName(e.target.value)} 
          className="registration-input"
          error={errors.name}
          helperText={errors.name && "Name is required"}
        />
        <TextField 
          label="Email" 
          variant="outlined" 
          fullWidth 
          margin="normal" 
          onChange={(e) => setEmail(e.target.value)} 
          className="registration-input"
          error={errors.email}
          helperText={errors.email && "Email is required"}
        />
        <TextField 
          label="Password" 
          type="password" 
          variant="outlined" 
          fullWidth 
          margin="normal" 
          onChange={(e) => setPassword(e.target.value)} 
          className="registration-input"
          error={errors.password}
          helperText={errors.password && "Password is required"}
        />
        <TextField 
          label="Confirm Password" 
          type="password" 
          variant="outlined" 
          fullWidth 
          margin="normal" 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          className="registration-input"
          error={errors.confirmPassword}
          helperText={errors.confirmPassword && "Confirm Password is required"}
        />
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          onClick={handleRegister}
          className="registration-button"
        >
          Register
        </Button>
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

export default RegistrationPage;
