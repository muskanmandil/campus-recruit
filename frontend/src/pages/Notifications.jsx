import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

// Sample notification data
const notificationData = [
  {
    type: "newCompany",
    message: "New company Atlassian added on campus!",
    date: "2024-10-02",
  },
  {
    type: "deadlineExtended",
    message: "Deadline extended for Amazon applications.",
    date: "2024-10-01",
  },
  {
    type: "offerReceived",
    message: "Congrats! You got an offer from Google.",
    date: "2024-09-30",
  },
  // Add more notifications here
];

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Simulating fetching daily notifications
  useEffect(() => {
    // Here you could fetch the notifications from an API
    setNotifications(notificationData); // Set sample data for now
  }, []);

  return (
    <div>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Daily Notifications
      </Typography>
      {notifications.map((notification, index) => (
        <Card key={index} sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography variant="body1">{notification.message}</Typography>
            <Typography variant="caption" color="text.secondary">
              {notification.date}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Notifications;