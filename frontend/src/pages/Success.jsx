// import React from 'react'

// const Page3 = () => {
//   return (
//     <div>Page3 helooooooooooooo</div>
//   )
// }

// export default Page3;

// File: src/pages/Page3.js
import React from 'react';
// import Slider from 'react-slick';
import { Box, Typography, Paper, Avatar } from '@mui/material';

// Sample data - we'll just use one company for now
const companiesData = [
  {
    name: 'Company 1',
    subheading: 'Innovative Tech Solutions',
    profiles: [
      { name: 'Person A', subheading: 'CEO' },
      { name: 'Person B', subheading: 'CTO' },
      { name: 'Person C', subheading: 'CFO' },
      { name: 'Person A', subheading: 'CEO' },
      { name: 'Person B', subheading: 'CTO' },
      { name: 'Person C', subheading: 'CFO' },
      { name: 'Person A', subheading: 'CEO' },
      { name: 'Person B', subheading: 'CTO' },
      { name: 'Person C', subheading: 'CFO' },
    ]
  },
  {
    name: 'Company 2',
    subheading: 'Digital Marketing Experts',
    profiles: [
      { name: 'Person D', subheading: 'Founder' },
      { name: 'Person E', subheading: 'Marketing Director' },
      { name: 'Person F', subheading: 'Creative Lead' },
    ]
  },
  {
    name: 'Company 1',
    subheading: 'Innovative Tech Solutions',
    profiles: [
      { name: 'Person A', subheading: 'CEO' },
      { name: 'Person B', subheading: 'CTO' },
      { name: 'Person C', subheading: 'CFO' },
    ]
  },
  {
    name: 'Company 1',
    subheading: 'Innovative Tech Solutions',
    profiles: [
      { name: 'Person A', subheading: 'CEO' },
      { name: 'Person B', subheading: 'CTO' },
      { name: 'Person C', subheading: 'CFO' },
    ]
  },
  // Add more companies as needed
];

const CompanyCard = ({ company }) => (
  <Paper elevation={3} sx={{ p: 3, m: 2, minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
    <Typography variant="h4" sx={{ mb: 1 }}>{company.name}</Typography>
    <Typography variant="subtitle1" sx={{ mb: 3 }}>{company.subheading}</Typography>
    <Box sx={{ 
      flexGrow: 1, 
      display: 'flex', 
      flexWrap: 'wrap', 
      justifyContent: 'left', 
      alignContent: 'flex-start',
    }}>
      {company.profiles.map((profile, index) => (
        <Box key={index} sx={{ m: 8, textAlign: 'center' }}>
          <Avatar sx={{ width: 150, height: 150, mb: 5 }}>{profile.name[0]}</Avatar>
          <Typography variant="body2">{profile.name}</Typography>
          <Typography variant="caption">{profile.subheading}</Typography>
        </Box>
      ))}
    </Box>
  </Paper>
);

function Success() {
  return (
    <Box sx={{ p: 3 }}>
      {/* <Slider {...settings}> */}
      {/* <Slider> */}
        {companiesData.map((company, index) => (
          <div key={index}>
            <CompanyCard company={company} />
          </div>
        ))}
      {/* </Slider> */}
    </Box>
  );
}

export default Success;