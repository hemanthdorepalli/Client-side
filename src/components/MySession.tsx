import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, IconButton, Snackbar, Alert, Button, TextField, Stack } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import axios from 'axios';
import moment, { Moment } from 'moment';

interface Slot {
  _id: string;
  start: Moment;
  end: Moment;
  duration: number;
}

interface User {
  email: string;
  name: string;
}

interface MySessionProps {
  user: User;
}

const MySession: React.FC<MySessionProps> = ({ user }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [editSlot, setEditSlot] = useState<Slot | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await axios.get('https://nodejs-backend-g2il.onrender.com/api/availability/slots', {
          params: { user: user.email },
        });
        // Ensure dates are converted to moment objects
        const slotsWithDates = response.data.map((slot: any) => ({
          ...slot,
          start: moment(slot.start),
          end: moment(slot.end),
        }));
        setSlots(slotsWithDates);
      } catch (error) {
        console.error('Error fetching slots:', error);
        setSnackbarMessage('Error fetching slots');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    fetchSlots();
  }, [user.email]);

  const handleDelete = async (_id: string) => {
    try {
      await axios.delete(`https://nodejs-backend-g2il.onrender.com/api/availability/slots/${_id}`);
      setSlots(slots.filter((slot) => slot._id !== (_id)));
      setSnackbarMessage('Slot deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting slot:', error);
      setSnackbarMessage('Error deleting slot');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleEditSave = async () => {
    if (editSlot) {
      try {
        await axios.put(`https://nodejs-backend-g2il.onrender.com/api/availability/slots/${editSlot._id}`, {
          start: editSlot.start.toISOString(),
          end: editSlot.end.toISOString(),
          duration: editSlot.duration,
        });
        setSlots(slots.map((slot) => (slot._id === editSlot._id ? editSlot : slot)));
        setEditSlot(null);
        setSnackbarMessage('Slot updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error updating slot:', error);
        setSnackbarMessage('Error updating slot');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleEditClick = (slot: Slot) => {
    setEditSlot({
      ...slot,
      start: moment(slot.start),
      end: moment(slot.end),
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        My Upcoming Sessions
      </Typography>
      <List>
        {slots.map((slot) => (
          <ListItem key={slot._id} secondaryAction={
            <>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(slot)}>
                <Edit />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(slot._id)}>
                <Delete />
              </IconButton>
            </>
          }>
            <ListItemText
              primary={`${moment(slot.start).format('MMMM Do YYYY, h:mm a')} - ${moment(slot.end).format('MMMM Do YYYY, h:mm a')}`}
              secondary={`Duration: ${slot.duration} minutes`}
            />
          </ListItem>
        ))}
      </List>
      {editSlot && (
        <Container>
          <Typography variant="h6" align="center" gutterBottom>
            Edit Slot
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Start Time"
              type="datetime-local"
              value={editSlot.start.format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => setEditSlot({ ...editSlot, start: moment(e.target.value) })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Time"
              type="datetime-local"
              value={editSlot.end.format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => setEditSlot({ ...editSlot, end: moment(e.target.value) })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={editSlot.duration}
              onChange={(e) => setEditSlot({ ...editSlot, duration: parseInt(e.target.value, 10) })}
              fullWidth
            />
            <Button variant="contained" color="primary" onClick={handleEditSave} fullWidth>
              Save Changes
            </Button>
          </Stack>
        </Container>
      )}
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

export default MySession;
