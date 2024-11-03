// import React from 'react'

// const Page1 = () => {
//   return (
//     <div>App 1</div>
//   )
// }

// export default Page1;

import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Container,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatCard = ({ title, value }) => (
  <StyledCard>
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" color="primary" fontWeight="bold">
        {value}
      </Typography>
    </CardContent>
  </StyledCard>
);

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  marginTop: theme.spacing(3),
}));

const Analytics = () => {
  const stats = {
    totalStudents: 1200,
    placedStudents: 850,
    unplacedStudents: 350,
    totalCompanies: 25,
    branchWisePlacement: {
      CS: 250,
      IT: 200,
      ETC: 150,
      EI: 100,
      MECH: 100,
      CIVIL: 50
    },
    genderWisePlacement: {
      male: 500,
      female: 350
    },
    companyWisePlacement: {
      DB: 120,
      Barclays: 100,
      MasterCard: 80,
      ZS: 90
    }
  };

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Placement Analytics
        </Typography>

        {/* Overview Statistics */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Students" value={stats.totalStudents} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Placed Students" value={stats.placedStudents} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Unplaced Students" value={stats.unplacedStudents} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Companies" value={stats.totalCompanies} />
          </Grid>
        </Grid>

        {/* Branch-wise Placement */}
        <SectionTitle variant="h5" fontWeight="bold">
          Branch-wise Placement
        </SectionTitle>
        <Grid container spacing={3}>
          {Object.entries(stats.branchWisePlacement).map(([branch, count]) => (
            <Grid item xs={12} sm={6} md={4} key={branch}>
              <StatCard title={`${branch} Branch`} value={count} />
            </Grid>
          ))}
        </Grid>

        {/* Gender-wise Placement */}
        <SectionTitle variant="h5" fontWeight="bold">
          Gender-wise Placement
        </SectionTitle>
        <Grid container spacing={3}>
          {Object.entries(stats.genderWisePlacement).map(([gender, count]) => (
            <Grid item xs={12} sm={6} key={gender}>
              <StatCard 
                title={`${gender.charAt(0).toUpperCase() + gender.slice(1)} Students Placed`} 
                value={count} 
              />
            </Grid>
          ))}
        </Grid>

        {/* Company-wise Placement */}
        <SectionTitle variant="h5" fontWeight="bold">
          Company-wise Placement
        </SectionTitle>
        <Grid container spacing={3}>
          {Object.entries(stats.companyWisePlacement).map(([company, count]) => (
            <Grid item xs={12} sm={6} md={3} key={company}>
              <StatCard title={company} value={count} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Analytics;