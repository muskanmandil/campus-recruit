import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Grid, 
  Chip, 
  Divider 
} from '@mui/material';

const companiesData = [
  {
    name: 'Company 1',
    subheading: 'Innovative Tech Solutions',
    profiles: [
      { name: 'Person A', subheading: '*CEO*' },
      { name: 'Person B', subheading: '*CTO*' },
      { name: 'Person C', subheading: '*CFO*' },
      { name: 'Person A', subheading: '*CEO*' },
      { name: 'Person B', subheading: '*CTO*' },
      { name: 'Person C', subheading: '*CFO*' },
      { name: 'Person A', subheading: '*CEO*' },
      { name: 'Person B', subheading: '*CTO*' },
      { name: 'Person C', subheading: '*CFO*' },
    ]
  },
  {
    name: 'Company 2',
    subheading: 'Digital Marketing Experts',
    profiles: [
      { name: 'Person D', subheading: '*Founder*' },
      { name: 'Person E', subheading: '*Marketing Director*' },
      { name: 'Person F', subheading: '*Creative Lead*' },
    ]
  },
  {
    name: 'Company 3',
    subheading: 'Innovative Data Solutions',
    profiles: [
      { name: 'Person A', subheading: '*CEO*' },
      { name: 'Person B', subheading: '*CTO*' },
      { name: 'Person C', subheading: '*CFO*' },
    ]
  },
  {
    name: 'Company 4',
    subheading: 'Creative Design Studio',
    profiles: [
      { name: 'Person A', subheading: '*CEO*' },
      { name: 'Person B', subheading: '*CTO*' },
      { name: 'Person C', subheading: '*CFO*' },
    ]
  },
];

const CompanyCard = ({ company }) => (
  <Paper 
    elevation={6} 
    sx={{ 
      p: 4, 
      m: 2, 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 3,
      background: 'linear-gradient(145deg, #f0f4f8 0%, #ffffff 100%)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease-in-out',
      '&:hover': {
        transform: 'scale(1.02)'
      }
    }}
  >
    <Box sx={{ mb: 3, textAlign: 'center' }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 1, 
          fontWeight: 'bold', 
          color: 'primary.main',
          textTransform: 'uppercase',
          letterSpacing: 1 
        }}
      >
        {company.name}
      </Typography>
      <Chip 
        label={company.subheading} 
        color="primary" 
        variant="outlined" 
        sx={{ 
          mb: 2, 
          fontWeight: 'medium',
          fontSize: '0.9rem'
        }} 
      />
    </Box>

    <Divider sx={{ mb: 3 }} />

    <Grid 
      container 
      spacing={3} 
      justifyContent="center" 
      alignItems="stretch"
    >
      {company.profiles.map((profile, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Box 
            sx={{ 
              textAlign: 'center', 
              p: 2, 
              borderRadius: 2,
              background: '#f7f9fc',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
              transition: 'background 0.3s ease',
              '&:hover': {
                background: '#e9f0f7'
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mb: 2, 
                mx: 'auto',
                background: 'primary.main',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
              }}
            >
              {profile.name[0]}
            </Avatar>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 0.5,
                color: 'text.primary' 
              }}
            >
              {profile.name}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontStyle: 'italic', 
                color: 'text.secondary' 
              }}
            >
              {profile.subheading}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Paper>
);

function Success() {
  return (
    <Box 
      sx={{ 
        p: 4, 
        background: '#f4f6f9', 
        minHeight: '100vh' 
      }}
    >
      <Typography 
        variant="h2" 
        sx={{ 
          textAlign: 'center', 
          mb: 4, 
          fontWeight: 'bold',
          color: 'primary.main',
          textTransform: 'uppercase',
          letterSpacing: 2
        }}
      >
        Success Stories
      </Typography>

      {companiesData.map((company, index) => (
        <CompanyCard key={index} company={company} />
      ))}
    </Box>
  );
}

export default Success;