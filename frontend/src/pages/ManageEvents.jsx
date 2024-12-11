import React, { useState, useEffect } from "react";
import { Box, Button, Card, CardContent, CardActions, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Grid, IconButton,} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,} from "@mui/icons-material";
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

  return loading ? (<>Fetching Events...</>):(
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openPopup}>
          Add New Event
        </Button>
      </Box>

      <Grid container spacing={3}>

        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.event_id}>
            <Card>
              <CardContent>

                <Typography variant="h5" gutterBottom>
                  {event.speaker_name}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Company: {event.company_name}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {moment(event.date).format("hh:mm A DD-MM-YYYY")}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Description:
                  {expandedId === event.event_id ? (
                    <>{event.description} </>
                  ) : (
                    <>{event.description.slice(0, 100)}...</>
                  )}

                  <Button size="small" onClick={() => toggleDescriptionExpand(event.event_id)} sx={{ textTransform: "none", ml: 1 }}>
                    {expandedId === event.event_id ? "Show less" : "View more"}
                  </Button>
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Meeting Link:{" "}
                  <a href={event.link} target="_blank" rel="noopener noreferrer">
                    {event.link}
                  </a>
                </Typography>
              </CardContent>

              <CardActions>
                <Button onClick={() => openEditor(event.event_id)} startIcon={<EditIcon />}>
                  Edit
                </Button>
                <IconButton onClick={() => cancelEvent(event.event_id)}>
                  <DeleteIcon />
                  {submitting ? 'Deleting...': 'Delete'}
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={popup} onClose={closePopup}>
        <DialogTitle>{editing ? "Edit Event" : "Add New Event"}</DialogTitle>

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
          <Button onClick={closePopup}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {submitting ? "Loading..." : editing ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageEvents;
