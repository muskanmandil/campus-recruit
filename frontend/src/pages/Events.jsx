import React, { useState, useEffect } from "react";
import { Typography, Card, CardContent, CardActions, Button, Grid, Box, Collapse } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment";

function Events() {
  const [expanded, setExpanded] = useState({});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

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
      toast.error("Server Error");
    }
    setLoading(false);
  };

  const handleExpandClick = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return loading ? (
    <>Fetching Events...</>
  ) : (
    <Box sx={{ flexGrow: 1, overflow: "auto", height: "calc(100vh - 64px)" }}>
      <Grid container spacing={3}>
        {events?.map((event) => (

          <Grid item xs={12} key={event.event_id}>
            <Card sx={{ minWidth: 275, height: "100%" }}>

              <CardContent>
                <Typography variant="h5" component="div">
                  {event.speaker_name}
                </Typography>

                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {event.company_name}
                </Typography>

                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {moment(event.date).format("hh:mm A DD-MM-YYYY")}
                </Typography>

                <Collapse in={expanded[event.event_id] || false}>
                  <Typography variant="body2">{event.description}</Typography>
                </Collapse>
              </CardContent>

              <CardActions>
                <Button size="small" onClick={() => handleExpandClick(event.event_id)} >
                  {expanded[event.event_id] ? "View Less" : "View More"}
                </Button>

                <Button size="small" component={RouterLink} to={event.link} target="_blank">
                  Join Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Events;