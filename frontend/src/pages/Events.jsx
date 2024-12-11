import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Box,
  Collapse,
  Chip,
  Avatar,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment";
import {
  Event as EventIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";

function Events() {
  const [expanded, setExpanded] = useState({});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchEvents();
  }, []);

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
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        // background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
      }}
    >
      <Typography variant="h4" color="primary">
        Fetching Events...
      </Typography>
    </Box>
  ) : (
    <Box
      sx={{
        flexGrow: 1,
        overflow: "auto",
        height: "calc(100vh - 64px)",
        background: "linear-gradient(to right, #f5f7fa 0%, #c3cfe2 100%)",
        p: 3,
      }}
    >
      <Grid container spacing={4}>
        {events?.map((event) => (
          <Grid item xs={12} md={6} lg={4} key={event.event_id}>
            <Card
              sx={{
                height: "100%",
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: 3,
                },
                borderRadius: 3,
                background:
                  "linear-gradient(to right, #ffffff 0%, #f9f9f9 100%)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                    <PersonIcon />
                  </Avatar>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {event.speaker_name}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                  <Avatar sx={{ mr: 2, bgcolor: "secondary.main" }}>
                    <BusinessIcon />
                  </Avatar>
                  <Typography
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    {event.company_name}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: "info.main" }}>
                    <EventIcon />
                  </Avatar>
                  <Chip
                    label={moment(event.date).format("hh:mm A DD-MM-YYYY")}
                    color="info"
                    variant="outlined"
                  />
                </Box>

                <Collapse in={expanded[event.event_id] || false}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      p: 2,
                      bgcolor: "grey.100",
                      borderRadius: 2,
                      mt: 2,
                    }}
                  >
                    {event.description}
                  </Typography>
                </Collapse>
              </CardContent>

              <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => handleExpandClick(event.event_id)}
                >
                  {expanded[event.event_id] ? "View Less" : "View More"}
                </Button>

                <Button
                  size="small"
                  variant="contained"
                  color="info"
                  component={RouterLink}
                  to={event.link}
                  target="_blank"
                >
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
