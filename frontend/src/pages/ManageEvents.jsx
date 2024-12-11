import React, { useState, useEffect } from "react";
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
  Paper,
  Chip
} from "@mui/material";
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Link as LinkIcon
} from "@mui/icons-material";
import { toast } from "react-toastify";
import moment from "moment";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [popup, setPopup] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    event_id: "",
    speaker_name: "",
    company_name: "",
    date: "",
    description: "",
    link: "",
  });

  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchEvents();
  },[]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/event/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setEvents(data.events);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Server Error');
    }
    setLoading(false);
  };

  const openPopup = () => {
    setPopup(true);
    setEditing(false);
  };

  const closePopup = () => {
    setPopup(false);
    setEditing(false);
    setEditId(null);
  };

  const toggleDescriptionExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openEditor = (id) => {
    setEditing(true);
    setEditId(id);
    setFormData(events[id]);
    setPopup(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "description" && value.length > 200) {
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/event/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": sessionStorage.getItem("token"),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.mesage);
        fetchEvents();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server Error");
    }
    setSubmitting(false);
    closePopup();
  };

  const cancelEvent = async (id) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/event/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": sessionStorage.getItem("token"),
        },
        body: JSON.stringify({
          event_id: id,
        }),
      });

      const data = await response.json();
      if(response.ok){
        toast.success(data.mesage);
        fetchEvents();
      }else{
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server Error");
    }
    setSubmitting(false);
  };

  return loading ? (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      typography: 'h4' 
    }}>
      Fetching Events...
    </Box>
  ):(
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4" fontWeight="bold">
          📅 Event Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={openPopup}
          sx={{ 
            backgroundColor: '#1976d2', 
            '&:hover': { backgroundColor: '#115293' } 
          }}
        >
          Add New Event
        </Button>
      </Box>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.event_id}>
            <Paper 
              elevation={3} 
              sx={{ 
                transition: 'transform 0.3s ease-in-out',
                '&:hover': { 
                  transform: 'scale(1.02)' 
                } 
              }}
            >
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EventNoteIcon sx={{ mr: 2, color: '#1976d2' }} />
                    <Typography variant="h5" fontWeight="bold">
                      {event.speaker_name}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 2, color: '#1976d2' }} />
                    <Typography variant="body1" color="text.secondary">
                      <strong>Company:</strong> {event.company_name}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 2, color: '#1976d2' }} />
                    <Typography variant="body2" color="text.secondary">
                      {moment(event.date).format("hh:mm A DD-MM-YYYY")}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Description:</strong>
                      {expandedId === event.event_id ? (
                        <> {event.description} </>
                      ) : (
                        <> {event.description.slice(0, 100)}... </>
                      )}

                      <Button 
                        size="small" 
                        onClick={() => toggleDescriptionExpand(event.event_id)} 
                        sx={{ 
                          textTransform: "none", 
                          ml: 1,
                          color: '#1976d2' 
                        }}
                      >
                        {expandedId === event.event_id ? "Show less" : "View more"}
                      </Button>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinkIcon sx={{ mr: 2, color: '#1976d2' }} />
                    <Typography variant="body2" color="text.secondary">
                      Meeting Link:{" "}
                      <a 
                        href={event.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#1976d2', textDecoration: 'none' }}
                      >
                        Open Link
                      </a>
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions>
                  <Button 
                    onClick={() => openEditor(event.event_id)} 
                    startIcon={<EditIcon />}
                    sx={{ color: '#1976d2' }}
                  >
                    Edit
                  </Button>
                  <Button 
                    color="error" 
                    onClick={() => cancelEvent(event.event_id)} 
                    startIcon={<DeleteIcon />}
                  >
                    {submitting ? 'Deleting...' : 'Delete'}
                  </Button>
                </CardActions>
              </Card>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={popup} onClose={closePopup} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
          {editing ? "Edit Event" : "Add New Event"}
        </DialogTitle>

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
            sx={{ mb: 2 }}
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
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            name="date"
            label="Date & Time"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={formData.date || ""}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            name="link"
            label="Link"
            type="url"
            fullWidth
            variant="outlined"
            value={formData.link}
            onChange={handleChange}
            sx={{ mb: 2 }}
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

        <DialogActions sx={{ backgroundColor: '#f0f0f0' }}>
          <Button onClick={closePopup}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ 
              backgroundColor: '#1976d2', 
              '&:hover': { backgroundColor: '#115293' } 
            }}
          >
            {submitting ? "Loading..." : editing ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageEvents;