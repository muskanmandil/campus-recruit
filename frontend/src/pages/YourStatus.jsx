// import React from 'react'

// const Page1 = () => {
//   return (
//     <div>App 1</div>
//   )
// }

// export default Page1;


// File: src/pages/Page2.js
import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

// Sample data - replace with your actual data
const columnsData = {
  applied: ['Company A', 'Company B', 'Company C'],
  inProcess: ['Company D', 'Company E'],
  selected: ['Company F'],
  rejected: ['Company G', 'Company H']
};

const CompanyCard = ({ name }) => (
  <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
    <Typography variant="body1">{name}</Typography>
  </Paper>
);

const Column = ({ title, companies }) => (
  <Box>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    {companies.map((company, index) => (
      <CompanyCard key={index} name={company} />
    ))}
  </Box>
);

function YourStatus() {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <Column title="Applied" companies={columnsData.applied} />
        </Grid>
        <Grid item xs={3}>
          <Column title="In Process" companies={columnsData.inProcess} />
        </Grid>
        <Grid item xs={3}>
          <Column title="Selected" companies={columnsData.selected} />
        </Grid>
        <Grid item xs={3}>
          <Column title="Rejected" companies={columnsData.rejected} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default YourStatus;