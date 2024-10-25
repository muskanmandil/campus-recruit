// // import React from 'react';
// // import { Typography } from '@mui/material';

// // function HomePage() {
// //   return (
// //     <Typography variant="h4">Welcome to the Home Page</Typography>
// //   );
// // }

// // export default HomePage;


// File: src/pages/HomePage.jss
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
    heading: "Deutsche Bank",
    subheading: "Subheading 1",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries,This is a longer description for Card 1. It contains more details about the topic.",
    applyLink: "/apply1"
  },
  {
    heading: "Barclays",
    subheading: "Subheading 2",
    description: "It provides additional information about the subject.",
    applyLink: "/apply2"
  },
  {
    heading: "Master Card",
    subheading: "Subheading 2",
    description: "Card 2 description goes here. It provides additional information about the subject.",
    applyLink: "/apply2"
  },
  {
    heading: "ZScaler",
    subheading: "Subheading 2",
    description: "Card 2 description goes here. It provides additional information about the subject.",
    applyLink: "/apply2"
  },
  {
    heading: "NRI Fintech",
    subheading: "Subheading 2",
    description: "Card 2 description goes here. It provides additional information about the subject.",
    applyLink: "/apply2"
  },
  {
    heading: "ZS Associates",
    subheading: "Subheading 2",
    description: "Card 2 description goes here. It provides additional information about the subject.",
    applyLink: "/apply2"
  },
  {
    heading: "Principle Global Services",
    subheading: "Subheading 2",
    description: "Card 2 description goes here. It provides additional information about the subject.",
    applyLink: "/apply2"
  },
  // Add more card data objects here, up to 6-7 cards
];

function HomePage() {
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
                <Collapse in={expanded[index] || false}>
                  <Typography variant="body2">
                    {card.description}
                  </Typography>
                </Collapse>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleExpandClick(index)}>
                  {expanded[index] ? "View Less" : "View More"}
                </Button>
                <Button size="small" component={RouterLink} to={card.applyLink}>
                  Apply
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default HomePage;

// File: src/pages/HomePage.js
// import React from 'react';
// import { Typography, Box } from '@mui/material';

// function HomePage() {
//   return (
//     <Box sx={{ padding: 3 }}>
//       <Typography variant="h4">Welcome to the Home Page</Typography>
//       <Typography variant="body1">This is a simplified version of the home page.</Typography>
//     </Box>
//   );
// }

// export default HomePage;