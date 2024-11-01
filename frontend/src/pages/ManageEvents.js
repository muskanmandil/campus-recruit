import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Grid,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const ManageEvents = () => {
  const initialFormData = {
    speaker_name: '',
    company_name: '',
    meeting_date: '',
    meeting_link: '',
    description: ''
  };

  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleOpen = () => {
    setOpen(true);
    setIsEdit(false);
    setFormData(initialFormData);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEdit(false);
    setEditIndex(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'description' && value.length > 200) {
      return;
    }
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = () => {
    if (isEdit) {
      const updatedEvents = [...events];
      updatedEvents[editIndex] = formData;
      setEvents(updatedEvents);
    } else {
      setEvents([formData, ...events]);
    }
    handleClose();
  };

  const handleEdit = (index) => {
    setIsEdit(true);
    setEditIndex(index);
    setFormData(events[index]);
    setOpen(true);
  };

  const toggleDescriptionExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add New Event
        </Button>
      </Box>

      <Grid container spacing={3}>
        {events.map((event, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {event.speaker_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Company: {event.company_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date & Time: {new Date(event.meeting_date).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Description: 
                  {expandedIndex === index ? (
                    <>{event.description} </>
                  ) : (
                    <>{event.description.slice(0, 100)}...</>
                  )}
                  <Button
                    size="small"
                    onClick={() => toggleDescriptionExpand(index)}
                    sx={{ textTransform: 'none', ml: 1 }}
                  >
                    {expandedIndex === index ? 'Show less' : 'View more'}
                  </Button>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Meeting Link:{" "}
                  <a
                    href={event.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {event.meeting_link}
                  </a>
                </Typography>
              </CardContent>
              <CardActions>
                <Button onClick={() => handleEdit(index)} startIcon={<EditIcon />}>Edit</Button>
                <IconButton onClick={() => setEvents(events.filter((_, i) => i !== index))}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEdit ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="speaker_name"
            label="Speaker Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.speaker_name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="company_name"
            label="Company Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.company_name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="meeting_date"
            label="Meeting Date & Time"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={formData.meeting_date}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="meeting_link"
            label="Meeting Link"
            type="url"
            fullWidth
            variant="outlined"
            value={formData.meeting_link}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description (max 200 characters)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
            helperText={`${formData.description.length}/200`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageEvents;
