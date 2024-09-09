import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper,
  Snackbar, Alert, TextField, Button, Stack, IconButton, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import './AdminDashboard.css';

// Utility function to format date for input fields
const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface Slot {
  _id: string;
  start: string;
  end: string;
  duration: number;
}

interface User {
  email: string;
  name: string;
}

const AdminDashboard: React.FC = () => {
  const [availability, setAvailability] = useState<Slot[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [editedSlot, setEditedSlot] = useState<Slot | null>(null);
  const [sessionDetails, setSessionDetails] = useState<{
    title: string;
    start: string;
    end: string;
    attendees: string[];
  }>({
    title: '',
    start: '',
    end: '',
    attendees: []
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://nodejs-backend-g2il.onrender.com/api/admin/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setSnackbarMessage('Error fetching users');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserEmail) {
      const fetchAvailability = async () => {
        try {
          const response = await axios.get(`https://nodejs-backend-g2il.onrender.com/api/admin/availability/${selectedUserEmail}`);
          setAvailability(response.data);
        } catch (error) {
          console.error('Error fetching availability:', error);
          setSnackbarMessage('Error fetching availability');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      };
      fetchAvailability();
    }
  }, [selectedUserEmail]);

  const handleEditSlot = (slot: Slot) => {
    setEditedSlot(slot);
  };

  const handleUpdateSlot = async () => {
    if (editedSlot) {
      try {
        await axios.put(`https://nodejs-backend-g2il.onrender.com/api/admin/availability/${editedSlot._id}`, {
          start: editedSlot.start,
          end: editedSlot.end,
          duration: editedSlot.duration,
        });

        setSnackbarMessage('Slot updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        if (selectedUserEmail) {
          const response = await axios.get(`https://nodejs-backend-g2il.onrender.com/api/admin/availability/${selectedUserEmail}`);
          setAvailability(response.data);
        }
        setEditedSlot(null);
      } catch (error) {
        console.error('Error updating slot:', error);
        setSnackbarMessage('Error updating slot');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await axios.delete(`https://nodejs-backend-g2il.onrender.com/api/admin/availability/${slotId}`);

      setSnackbarMessage('Slot deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      if (selectedUserEmail) {
        const response = await axios.get(`https://nodejs-backend-g2il.onrender.com/api/admin/availability/${selectedUserEmail}`);
        setAvailability(response.data);
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      setSnackbarMessage('Error deleting slot');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationInMs = endDate.getTime() - startDate.getTime();
    return Math.floor(durationInMs / (1000 * 60)); // Convert ms to minutes
  };

  const handleScheduleSession = async () => {
    const duration = calculateDuration(sessionDetails.start, sessionDetails.end);
    try {
      const response = await axios.post('https://nodejs-backend-g2il.onrender.com/api/slots', { 
        start: sessionDetails.start, 
        end: sessionDetails.end, 
        duration,
        user: selectedUserEmail 
      });

      setSnackbarMessage('Session scheduled successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Clear form after scheduling
      setSessionDetails({
        title: '',
        start: '',
        end: '',
        attendees: []
      });

      // Refresh availability list
      const availabilityResponse = await axios.get(`https://nodejs-backend-g2il.onrender.com/api/admin/availability/${selectedUserEmail}`);
      setAvailability(availabilityResponse.data);
    } catch (error) {
      console.error('Error scheduling session:', error);
      setSnackbarMessage('Error scheduling session');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    
    <Container className="admin-dashboard-container">
      <Typography variant="h4" align="center" gutterBottom>
        Admin Dashboard
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="user-select-label">Select User</InputLabel>
        <Select
          labelId="user-select-label"
          value={selectedUserEmail}
          onChange={(e) => setSelectedUserEmail(e.target.value)}
          label="Select User"
        >
          {users.map((user) => (
            <MenuItem key={user.email} value={user.email}>
              {user.name} ({user.email})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {availability.length === 0 ? (
        <Typography variant="h6" align="center" gutterBottom>
          No availability data available
        </Typography>
      ) : (
        <div className="availability-list-container">
          <Typography variant="h6" align="center" gutterBottom>
            Availability for {selectedUserEmail}
          </Typography>
          <Stack spacing={2} alignItems="center">
            {availability.map((slot) => (
              <Paper key={slot._id} className="slot-container">
                <div>
                  <Typography variant="body1">
                    {`${new Date(slot.start).toLocaleString()} - ${new Date(slot.end).toLocaleString()}`}
                  </Typography>
                  <Typography variant="body2">
                    Duration: {slot.duration} minutes
                  </Typography>
                </div>
                <Stack direction="row" spacing={1} justifyContent="center" className="action-buttons">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditSlot(slot)}
                  >
                    Reschedule
                  </Button>
                  <IconButton onClick={() => handleDeleteSlot(slot._id)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </div>
      )}
      {editedSlot && (
        <div className="edit-slot-container">
          <Typography variant="h6" align="center" gutterBottom>
            Edit Slot
          </Typography>
          <Stack spacing={2} alignItems="center">
            <TextField
              label="Start Time"
              type="datetime-local"
              value={formatDateForInput(editedSlot.start)}
              onChange={(e) => setEditedSlot(prev => prev ? { ...prev, start: e.target.value } : null)}
              fullWidth
            />
            <TextField
              label="End Time"
              type="datetime-local"
              value={formatDateForInput(editedSlot.end)}
              onChange={(e) => setEditedSlot(prev => prev ? { ...prev, end: e.target.value } : null)}
              fullWidth
            />
            <Button variant="contained" color="primary" onClick={handleUpdateSlot}>
              Update Slot
            </Button>
          </Stack>
        </div>
      )}
      <div className="schedule-session-container">
        <Typography variant="h6" align="center" gutterBottom>
          Schedule New Session
        </Typography>
        <Stack spacing={2} alignItems="center">
          <TextField
            label="Session Title"
            value={sessionDetails.title}
            onChange={(e) => setSessionDetails({ ...sessionDetails, title: e.target.value })}
            fullWidth
          />
          <TextField
            label="Start Time"
            type="datetime-local"
            value={sessionDetails.start}
            onChange={(e) => setSessionDetails({ ...sessionDetails, start: e.target.value })}
            fullWidth
          />
          <TextField
            label="End Time"
            type="datetime-local"
            value={sessionDetails.end}
            onChange={(e) => setSessionDetails({ ...sessionDetails, end: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="attendees-select-label">Attendees</InputLabel>
            <Select
              labelId="attendees-select-label"
              multiple
              value={sessionDetails.attendees}
              onChange={(e) => setSessionDetails({ ...sessionDetails, attendees: e.target.value as string[] })}
              renderValue={(selected) => selected.join(', ')}
            >
              {users.map((user) => (
                <MenuItem key={user.email} value={user.email}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleScheduleSession}>
            Schedule Session
          </Button>
        </Stack>
      </div>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard;

