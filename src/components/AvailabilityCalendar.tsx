import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import moment, { Moment } from 'moment';

interface Slot {
  id?: string;
  start: Moment;
  end: Moment;
  duration: number;
}

interface User {
  email: string;
  name: string;
}

interface AvailabilityCalendarProps {
  user: User;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ user }) => {
  const [availability, setAvailability] = useState<Slot[]>([]);
  const [newSlot, setNewSlot] = useState<Slot>({
    start: moment(),
    end: moment().add(1, 'hour'),
    duration: 60
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await axios.get('https://backend-nodejs-1-i9zy.onrender.com/api/availability/slots', {
          params: { user: user.email }
        });
        setAvailability(response.data);
      } catch (error) {
        console.error('Error fetching availability:', error);
        setSnackbarMessage('Error fetching availability');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    fetchAvailability();
  }, [user.email]);

  const isSlotConflict = (newSlot: Slot, existingSlots: Slot[]): boolean => {
    return existingSlots.some(slot => 
      (newSlot.start.isBefore(slot.end) && newSlot.end.isAfter(slot.start))
    );
  };

  const handleDateChange = (field: 'start' | 'end', date: Moment | null) => {
    if (date) {
      setNewSlot((prevSlot) => {
        // Calculate duration in minutes based on start and end times
        const updatedSlot = { ...prevSlot, [field]: date };
        if (updatedSlot.start && updatedSlot.end) {
          const duration = updatedSlot.end.diff(updatedSlot.start, 'minutes');
          return { ...updatedSlot, duration };
        }
        return updatedSlot;
      });
    }
  };

  const handleAddSlot = async () => {
    if (newSlot.start.isSameOrAfter(newSlot.end)) {
      setSnackbarMessage('End time must be after start time');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (isSlotConflict(newSlot, availability)) {
      setSnackbarMessage('The slot overlaps with an existing slot');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      await axios.post('https://backend-nodejs-1-i9zy.onrender.com/api/availability/slots', { ...newSlot, user: user.email });
      setSnackbarMessage('Slot added successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      const response = await axios.get('https://backend-nodejs-1-i9zy.onrender.com/api/availability/slots', {
        params: { user: user.email }
      });
      setAvailability(response.data);
    } catch (error) {
      console.error('Error adding slot:', error);
      setSnackbarMessage('Error adding slot');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Welcome, {user.name}!
      </Typography>
      <Typography variant="body1" align="center" style={{ marginBottom: '10px' }}>
        Here, you can efficiently manage and view your availability for scheduling. 
      </Typography>

      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <TextField
          label="Start Time"
          type="datetime-local"
          value={newSlot.start.format('YYYY-MM-DDTHH:mm')}
          onChange={(e) => handleDateChange('start', moment(e.target.value))}
          fullWidth
        />
        <TextField
          label="End Time"
          type="datetime-local"
          value={newSlot.end.format('YYYY-MM-DDTHH:mm')}
          onChange={(e) => handleDateChange('end', moment(e.target.value))}
          fullWidth
        />
        <TextField
          label="Duration (minutes)"
          type="number"
          value={newSlot.duration}
          onChange={(e) => setNewSlot((prevSlot) => ({
            ...prevSlot,
            duration: parseInt(e.target.value, 10)
          }))}
          fullWidth
          disabled
        />
        <Button variant="contained" color="primary" onClick={handleAddSlot} fullWidth>
          Add Slot
        </Button>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AvailabilityCalendar;
