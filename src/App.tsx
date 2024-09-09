//App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, CircularProgress, Backdrop } from '@mui/material';
import RegistrationPage from './components/RegistrationPage';
import LoginPage from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import NavBar from './components/NavBar'; 
import MySession from './components/MySession';
import './App.css';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null); // Define user type here or use an interface
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData: any) => {
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setLoading(false);
    }, 2000);
  };

  const handleLogout = () => {
    setLoading(true);

    setTimeout(() => {
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
    }, 2000);
  };

  return (
    <Router>
      <Container className="container-center">
        {loading && (
          <Backdrop open={loading} style={{ zIndex: 1201 }}>
            <CircularProgress color="inherit" />
          </Backdrop>
        )}
        {user ? (
          <>
            <NavBar onLogout={handleLogout} />
            <Routes>
              <Route path="/home" element={<AvailabilityCalendar user={user} />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/session" element={<MySession user={user} />} />
              <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
          </>
        ) : (
          <Routes>
            <Route path="/" element={<LoginPage setUser={handleLogin} />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </Container>
    </Router>
  );
};

export default App;
