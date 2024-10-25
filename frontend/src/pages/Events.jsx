// import React from 'react'

// const Page2 = () => {
//   return (
//     <div>Page2 helooooooooooooo</div>
//   )
// }

// export default Page2;


import React, { useState } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Grid, 
  Box, 
  Collapse
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const cardData = [
  {
    heading: "Riti Nema",
    subheading: "Atlassian",
    description: "solving dsa made easier",
    applyLink: "https://www.google.com"
  },
  {
    heading: "Striver",
    subheading: "Google",
    description: "out of limit, but dummy data so okay",
    applyLink: "https://www.google.com"
  },
  // Add more card data objects here, up to 6-7 cards
];

function Events() {
  const [expanded, setExpanded] = useState({});

  const handleExpandClick = (index) => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Box sx={{ flexGrow: 1, overflow: 'auto', height: 'calc(100vh - 64px)' }}>
      <Grid container spacing={3}>
        {cardData.map((card, index) => (
          <Grid item xs={12} key={index}>
            <Card sx={{ minWidth: 275, height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  {card.heading}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {card.subheading}
                </Typography>
                {/* <Collapse in={expanded[index] || false}> */}
                  <Typography variant="body2">
                    {card.description}
                  </Typography>
                {/* </Collapse> */}
              </CardContent>
              <CardActions>
                {/* <Button size="small" onClick={() => handleExpandClick(index)}>
                  {expanded[index] ? "View Less" : "View More"}
                </Button> */}
                <Button size="small" component={RouterLink} to={card.applyLink}>
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