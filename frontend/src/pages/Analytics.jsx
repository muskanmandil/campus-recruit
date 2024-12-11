// import React, { useEffect, useState } from "react";
// import { Box, Card, CardContent, Typography, Grid, Container} from "@mui/material";
// import { styled } from "@mui/material/styles";
// import { toast } from "react-toastify";

// const StyledCard = styled(Card)(({ theme }) => ({
//   height: "100%",
//   transition: "all 0.3s",
//   "&:hover": {
//     transform: "translateY(-5px)",
//     boxShadow: theme.shadows[4],
//   },
// }));

// const backendUrl = process.env.REACT_APP_BACKEND_URL;

// const StatCard = ({ title, value }) => (
//   <StyledCard>
//     <CardContent>
//       <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//         {title}
//       </Typography>
//       <Typography variant="h4" component="div" color="primary" fontWeight="bold">
//         {value}
//       </Typography>
//     </CardContent>
//   </StyledCard>
// );

// const SectionTitle = styled(Typography)(({ theme }) => ({
//   marginBottom: theme.spacing(3),
//   marginTop: theme.spacing(3),
// }));

// const Analytics = () => {
//   const [analytics, setAnalytics] = useState({
//     totalStudents: 0,
//     placedStudents: 0,
//     unplacedStudents: 0,
//     totalCompanies: 0,
//     placedStudentsByBranch: {},
//     placedStudentsByGender: {},
//     placedStudentsByCompany: {},
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchAnalytics();
//   },[]);

//   const fetchAnalytics = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${backendUrl}/analytic/`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setAnalytics({
//           ...data,
//           totalStudents: Number(data.totalStudents) || 0,
//           placedStudents: Number(data.placedStudents) || 0,
//           unplacedStudents: Number(data.unplacedStudents) || 0,
//           totalCompanies: Number(data.totalCompanies) || 0,
//           placedStudentsByBranch: data.placedStudentsByBranch || {},
//           placedStudentsByGender: data.placedStudentsByGender || {},
//           placedStudentsByCompany: data.placedStudentsByCompany || {},
//         });
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Server Error");
//     }
//     setLoading(false);
//   };

//   return loading ? (
//     <>Fetching Stats...</>
//   ) : (
//     <Box sx={{ backgroundColor: "background.default", minHeight: "100vh", py: 4 }} >
//       <Container maxWidth="lg">

//         <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
//           Placement Analytics
//         </Typography>

//         {/* Overview Statistics */}
//         <Grid container spacing={3}>
//           <Grid item xs={12} sm={6} md={3}>
//             <StatCard title="Total Students" value={analytics.totalStudents} />
//           </Grid>

//           <Grid item xs={12} sm={6} md={3}>
//             <StatCard title="Placed Students" value={analytics.placedStudents} />
//           </Grid>

//           <Grid item xs={12} sm={6} md={3}>
//             <StatCard title="Unplaced Students" value={analytics.unplacedStudents} />
//           </Grid>

//           <Grid item xs={12} sm={6} md={3}>
//             <StatCard title="Total Companies" value={analytics.totalCompanies}/>
//           </Grid>
//         </Grid>

//         {/* Branch-wise Placement */}
//         <SectionTitle variant="h5" fontWeight="bold">
//           Branch-wise Placement
//         </SectionTitle>

//         <Grid container spacing={3}>
//           {Object.entries(analytics.placedStudentsByBranch).map(
//             ([branch, count]) => (
//               <Grid item xs={12} sm={6} md={4} key={branch}>
//                 <StatCard title={`${branch} Branch`} value={count} />
//               </Grid>
//             )
//           )}
//         </Grid>

//         {/* Gender-wise Placement */}
//         <SectionTitle variant="h5" fontWeight="bold">
//           Gender-wise Placement
//         </SectionTitle>

//         <Grid container spacing={3}>
//           {Object.entries(analytics.placedStudentsByGender).map(
//             ([gender, count]) => (
//               <Grid item xs={12} sm={6} key={gender}>
//                 <StatCard
//                   title={`${gender.charAt(0).toUpperCase() + gender.slice(1)} Students Placed`}
//                   value={count}
//                 />
//               </Grid>
//             )
//           )}
//         </Grid>

//         {/* Company-wise Placement */}
//         <SectionTitle variant="h5" fontWeight="bold">
//           Company-wise Placement
//         </SectionTitle>

//         <Grid container spacing={3}>
//           {Object.entries(analytics.placedStudentsByCompany).map(
//             ([company, count]) => (
//               <Grid item xs={12} sm={6} md={3} key={company}>
//                 <StatCard title={company} value={count} />
//               </Grid>
//             )
//           )}
//         </Grid>
//       </Container>
//     </Box>
//   );
// };

// export default Analytics;

import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

const Analytics = () => {
  // References for each chart
  const placementStatusRef = useRef(null);
  const branchPlacementRef = useRef(null);
  const genderDistributionRef = useRef(null);
  const companyWisePlacementRef = useRef(null);
  const phasePlacementRef = useRef(null);
  const monthWisePlacementRef = useRef(null);

  // Track chart instances
  const chartInstances = useRef({});

  useEffect(() => {
    const createChart = (canvasRef, config, chartKey) => {
      // Destroy the chart if it already exists
      if (chartInstances.current[chartKey]) {
        chartInstances.current[chartKey].destroy();
      }

      // Create a new chart
      if (canvasRef.current) {
        chartInstances.current[chartKey] = new Chart(canvasRef.current, config);
      }
    };

    // Placement Status Pie Chart
    createChart(placementStatusRef, {
      type: 'pie',
      data: {
        labels: ['Placed', 'Unplaced'],
        datasets: [{
          data: [450, 50],
          backgroundColor: ['#36A2EB', '#FF6384']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Allows custom sizing
        aspectRatio: 1,
        layout: {
          padding: {
            top: 20,   // Padding at the top
            right: 20, // Padding on the right
            bottom: 20,// Padding at the bottom
            left: 20   // Padding on the left
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Placement Status',
            font: {
              size: 18, // Font size for the title
              weight: 'bold' // Bold font for the title
            },
            padding: {
              top: 10, // Space above the title
              bottom: 10 // Space below the title
            }
          }
        },
        legend: {
          labels: {
            font: {
              size: 14, 
            }
          }
        },
      }
    }, 'placementStatus');

    // Branch Placement Bar Chart
    createChart(branchPlacementRef, {
      type: 'bar',
      data: {
        labels: ['CS', 'IT', 'ECE', 'Mech', 'Civil'],
        datasets: [{
          label: 'Placements',
          data: [120, 100, 80, 70, 60],
          backgroundColor: '#36A2EB'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Allows custom sizing
        aspectRatio: 1,
        layout: {
          padding: {
            top: 20,   // Padding at the top
            right: 20, // Padding on the right
            bottom: 20,// Padding at the bottom
            left: 20   // Padding on the left
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Placements by Branch',
            font: {
              size: 18, // Font size for the title
              weight: 'bold' // Bold font for the title
            },
            padding: {
              top: 10, // Space above the title
              bottom: 10 // Space below the title
            }
          },
          legend: {
            labels: {
              font: {
                size: 14, 
              }
            }
          },
        }
      }
    }, 'branchPlacement');

    // Gender Distribution Pie Chart
    createChart(genderDistributionRef, {
      type: 'pie',
      data: {
        labels: ['Male', 'Female'],
        datasets: [{
          data: [300, 200],
          backgroundColor: ['#36A2EB', '#FF6384']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Allows custom sizing
        aspectRatio: 1,
        plugins: {
          title: {
            display: true,
            text: 'Gender Distribution',
            font: {
              size: 18, // Font size for the title
              weight: 'bold' // Bold font for the title
            },
            padding: {
              top: 10, // Space above the title
              bottom: 10 // Space below the title
            }
          }
        },
        legend: {
          labels: {
            font: {
              size: 14, 
            }
          }
        },
      }
    }, 'genderDistribution');

    // Company-wise Placement Pie Chart
    createChart(companyWisePlacementRef, {
      type: 'pie',
      data: {
        labels: ['TCS', 'Infosys', 'Google', 'Microsoft', 'Amazon'],
        datasets: [{
          data: [100, 80, 60, 50, 40],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Allows custom sizing
        aspectRatio: 1,
        plugins: {
          title: {
            display: true,
            text: 'Company-wise Placements',
            font: {
              size: 18, // Font size for the title
              weight: 'bold' // Bold font for the title
            },
            padding: {
              top: 10, // Space above the title
              bottom: 10 // Space below the title
            }
          }
        }
      }
    }, 'companyWisePlacement');

    // Placements by Phase Bar Chart
    createChart(phasePlacementRef, {
      type: 'bar',
      data: {
        labels: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'],
        datasets: [{
          label: 'Students Placed',
          data: [100, 120, 130, 100],
          backgroundColor: '#36A2EB'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Allows custom sizing
        aspectRatio: 1,
        plugins: {
          title: {
            display: true,
            text: 'Placements by Phase'
          }
        }
      }
    }, 'phasePlacement');

    // Monthly Placements Bar Chart
    createChart(monthWisePlacementRef, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Monthly Placements',
          data: [50, 75, 100, 80, 60, 85],
          backgroundColor: '#FF6384'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Allows custom sizing
        aspectRatio: 1,
        plugins: {
          title: {
            display: true,
            text: 'Monthly Placements'
          }
        }
      }
    }, 'monthWisePlacement');

    // Cleanup function to destroy charts on unmount
    return () => {
      Object.values(chartInstances.current).forEach(chart => chart.destroy());
      chartInstances.current = {};
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Placement Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Placement Status Chart */}
        <div className="border rounded-lg p-4">
          <canvas ref={placementStatusRef}></canvas>
        </div>

        {/* Branch Placement Chart */}
        <div className="border rounded-lg p-4">
          <canvas ref={branchPlacementRef}></canvas>
        </div>

        {/* Gender Distribution Chart */}
        <div className="border rounded-lg p-4">
          <canvas ref={genderDistributionRef}></canvas>
        </div>

        {/* Company-wise Placement Chart */}
        <div className="border rounded-lg p-4">
          <canvas ref={companyWisePlacementRef}></canvas>
        </div>

        {/* Placements by Phase Chart */}
        <div className="border rounded-lg p-4">
          <canvas ref={phasePlacementRef}></canvas>
        </div>

        {/* Monthly Placements Chart */}
        <div className="border rounded-lg p-4">
          <canvas ref={monthWisePlacementRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default Analytics;