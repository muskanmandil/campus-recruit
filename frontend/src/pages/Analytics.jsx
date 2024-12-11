import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Grid, Container} from "@mui/material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  transition: "all 0.3s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[4],
  },
}));

const backendUrl = process.env.REACT_APP_BACKEND_URL;

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
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    placedStudents: 0,
    unplacedStudents: 0,
    totalCompanies: 0,
    placedStudentsByBranch: {},
    placedStudentsByGender: {},
    placedStudentsByCompany: {},
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  },[]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/analytic/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAnalytics({
          ...data,
          totalStudents: Number(data.totalStudents) || 0,
          placedStudents: Number(data.placedStudents) || 0,
          unplacedStudents: Number(data.unplacedStudents) || 0,
          totalCompanies: Number(data.totalCompanies) || 0,
          placedStudentsByBranch: data.placedStudentsByBranch || {},
          placedStudentsByGender: data.placedStudentsByGender || {},
          placedStudentsByCompany: data.placedStudentsByCompany || {},
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server Error");
    }
    setLoading(false);
  };

  return loading ? (
    <>Fetching Stats...</>
  ) : (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh", py: 4 }} >
      <Container maxWidth="lg">

        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Placement Analytics
        </Typography>

        {/* Overview Statistics */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Students" value={analytics.totalStudents} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Placed Students" value={analytics.placedStudents} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Unplaced Students" value={analytics.unplacedStudents} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Companies" value={analytics.totalCompanies}/>
          </Grid>
        </Grid>

        {/* Branch-wise Placement */}
        <SectionTitle variant="h5" fontWeight="bold">
          Branch-wise Placement
        </SectionTitle>

        <Grid container spacing={3}>
          {Object.entries(analytics.placedStudentsByBranch).map(
            ([branch, count]) => (
              <Grid item xs={12} sm={6} md={4} key={branch}>
                <StatCard title={`${branch} Branch`} value={count} />
              </Grid>
            )
          )}
        </Grid>

        {/* Gender-wise Placement */}
        <SectionTitle variant="h5" fontWeight="bold">
          Gender-wise Placement
        </SectionTitle>

        <Grid container spacing={3}>
          {Object.entries(analytics.placedStudentsByGender).map(
            ([gender, count]) => (
              <Grid item xs={12} sm={6} key={gender}>
                <StatCard
                  title={`${gender.charAt(0).toUpperCase() + gender.slice(1)} Students Placed`}
                  value={count}
                />
              </Grid>
            )
          )}
        </Grid>

        {/* Company-wise Placement */}
        <SectionTitle variant="h5" fontWeight="bold">
          Company-wise Placement
        </SectionTitle>

        <Grid container spacing={3}>
          {Object.entries(analytics.placedStudentsByCompany).map(
            ([company, count]) => (
              <Grid item xs={12} sm={6} md={3} key={company}>
                <StatCard title={company} value={count} />
              </Grid>
            )
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Analytics;