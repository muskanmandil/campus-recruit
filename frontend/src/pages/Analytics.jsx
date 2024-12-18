import React, { useRef, useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { toast } from "react-toastify";
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  CircularProgress 
} from '@mui/material';

const Analytics = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    placedStudents: 0,
    unplacedStudents: 0,
    totalCompanies: 0,
    placedStudentsByBranch: {
      "CS": 0,
      "IT": 0,
      "ETC": 0,
      "EI": 0,
      "Mechanical": 0,
      "Civil": 0
    },
    placedStudentsByGender: {
      "Male": 0,
      "Female": 0
    },
    placedStudentsByCompany: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

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
          placedStudentsByBranch: {
            ...{
              "CS": 0,
              "IT": 0,
              "ETC": 0,
              "EI": 0,
              "Mechanical": 0,
              "Civil": 0
            },
            ...data.placedStudentsByBranch
          },
          placedStudentsByGender: {
            ...{
              "Male": 0,
              "Female": 0
            },
            ...data.placedStudentsByGender
          },
          placedStudentsByCompany: data.placedStudentsByCompany || {}
        });
      } else {
        toast.error(data.message || "Failed to fetch analytics");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server Error: Unable to fetch analytics");
    }
    setLoading(false);
  };

  // References for each chart
  const placementStatusRef = useRef(null);
  const branchPlacementRef = useRef(null);
  const genderDistributionRef = useRef(null);
  const companyWisePlacementRef = useRef(null);

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
    createChart(
      placementStatusRef,
      {
        type: "pie",
        data: {
          labels: ["Placed", "Unplaced"],
          datasets: [
            {
              data: [analytics.placedStudents, analytics.unplacedStudents],
              backgroundColor: ["#36A2EB", "#FF6384"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 25,
              right: 20,
              bottom: 20,
              left: 20,
            },
          },
          
          plugins: {
            title: {
              display: true,
              text: "Placement Status",
              font: { size: 25, weight: "bold" },
            },
          },
        },
      },
      "placementStatus"
    );

    // Gender Distribution Pie Chart
    createChart(
      genderDistributionRef,
      {
        type: "pie",
        data: {
          labels: Object.keys(analytics.placedStudentsByGender),
          datasets: [
            {
              data: Object.values(analytics.placedStudentsByGender),
              backgroundColor: ["#36A2EB", "#FF6384"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 25,
              right: 20,
              bottom: 20,
              left: 20,
            },
          },
          plugins: {
            title: {
              display: true,
              text: "Gender Distribution",
              font: { size: 25, weight: "bold" },
            },
          },
        },
      },
      "genderDistribution"
    );

    // Branch Placement Bar Chart
    createChart(
      branchPlacementRef,
      {
        type: "bar",
        data: {
          labels: Object.keys(analytics.placedStudentsByBranch),
          datasets: [
            {
              label: "Placements",
              data: Object.values(analytics.placedStudentsByBranch),
              backgroundColor: "#36A2EB",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          
          plugins: {
            title: {
              display: true,
              text: "Placements by Branch",
              font: { size: 25, weight: "bold" },
            },
          },
        },
      },
      "branchPlacement"
    );

    

    // Company-wise Placement Pie Chart
    createChart(
      companyWisePlacementRef,
      {
        type: "pie",
        data: {
          labels: Object.keys(analytics.placedStudentsByCompany).length > 0 
            ? Object.keys(analytics.placedStudentsByCompany)
            : ["No Placements"],
          datasets: [
            {
              data: Object.keys(analytics.placedStudentsByCompany).length > 0
                ? Object.values(analytics.placedStudentsByCompany)
                : [1],
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 25,
              right: 20,
              bottom: 20,
              left: 20,
            },
          },
          plugins: {
            title: {
              display: true,
              text: "Company-wise Placements",
              font: { size: 25, weight: "bold" },
            },
          },
        },
      },
      "companyWisePlacement"
    );

    // Cleanup function to destroy charts on unmount
    return () => {
      Object.values(chartInstances.current).forEach((chart) => chart.destroy());
      chartInstances.current = {};
    };
  }, [analytics]);

  if (loading) {
    return (
      <div className="text-center text-xl py-8">
        Loading Analytics...
      </div>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography 
        variant="h4" 
        component="h1" 
        align="center" 
        gutterBottom 
        sx={{ fontWeight: 'bold', my: 3 }}
      >
        Placement Analytics Dashboard
      </Typography>
      
      {/* Pie Charts Row */}
      <Grid 
        container 
        spacing={3} 
        justifyContent="center" 
        alignItems="stretch"
      >
        {/* Placement Status Chart */}
        <Grid item xs={12} sm={6} md={4}>
          <Box 
            border={1} 
            borderRadius={2} 
            p={2} 
            height="100%" 
            display="flex" 
            flexDirection="column"
          >
            <canvas ref={placementStatusRef} style={{ height: '300px' }}></canvas>
          </Box>
        </Grid>
        
        {/* Gender Distribution Chart */}
        <Grid item xs={12} sm={6} md={4}>
          <Box 
            border={1} 
            borderRadius={2} 
            p={2} 
            height="100%" 
            display="flex" 
            flexDirection="column"
          >
            <canvas ref={genderDistributionRef} style={{ height: '300px' }}></canvas>
          </Box>
        </Grid>
        
        {/* Company-wise Placement Chart */}
        <Grid item xs={12} sm={6} md={4}>
          <Box 
            border={1} 
            borderRadius={2} 
            p={2} 
            height="100%" 
            display="flex" 
            flexDirection="column"
          >
            <canvas ref={companyWisePlacementRef} style={{ height: '300px' }}></canvas>
          </Box>
        </Grid>
      </Grid>

      {/* Bar Chart for Branch Placements */}
      <Grid 
        container 
        spacing={3} 
        justifyContent="center" 
        sx={{ mt: 3 }}
      >
        <Grid item xs={12}>
          <Box 
            border={1} 
            borderRadius={2} 
            p={2} 
            height="100%" 
            display="flex" 
            flexDirection="column"
          >
            <canvas ref={branchPlacementRef} style={{ height: '400px' }}></canvas>
          </Box>
        </Grid>
      </Grid>

      {/* Total Companies Section */}
      <Grid 
        container 
        spacing={2} 
        justifyContent="center" 
        sx={{ mt: 3 }}
      >
        <Grid item xs={12} sm={6} md={4}>
          <Box 
            bgcolor="purple.100" 
            p={2} 
            borderRadius={2} 
            textAlign="center"
          >
            <Typography variant="h6" fontWeight="fontWeightSemiBold">
              Total Companies
            </Typography>
            <Typography variant="h4" fontWeight="fontWeightBold">
              {analytics.totalCompanies}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;

// import React, { useRef, useEffect, useState } from "react";
// import { 
//   Container, 
//   Grid, 
//   Typography, 
//   Box, 
//   CircularProgress 
// } from '@mui/material';
// import Chart from "chart.js/auto";
// import { toast } from "react-toastify";

// const Analytics = () => {
//   const backendUrl = process.env.REACT_APP_BACKEND_URL;
//   const [analytics, setAnalytics] = useState({
//     totalStudents: 0,
//     placedStudents: 0,
//     unplacedStudents: 0,
//     totalCompanies: 0,
//     placedStudentsByBranch: {
//       "CS": 0,
//       "IT": 0,
//       "ETC": 0,
//       "EI": 0,
//       "Mechanical": 0,
//       "Civil": 0
//     },
//     placedStudentsByGender: {
//       "Male": 0,
//       "Female": 0
//     },
//     placedStudentsByCompany: {}
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchAnalytics();
//   }, []);

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
//           placedStudentsByBranch: {
//             ...{
//               "CS": 0,
//               "IT": 0,
//               "ETC": 0,
//               "EI": 0,
//               "Mechanical": 0,
//               "Civil": 0
//             },
//             ...data.placedStudentsByBranch
//           },
//           placedStudentsByGender: {
//             ...{
//               "Male": 0,
//               "Female": 0
//             },
//             ...data.placedStudentsByGender
//           },
//           placedStudentsByCompany: data.placedStudentsByCompany || {}
//         });
//       } else {
//         toast.error(data.message || "Failed to fetch analytics");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Server Error: Unable to fetch analytics");
//     }
//     setLoading(false);
//   };

//   // References for each chart
//   const placementStatusRef = useRef(null);
//   const genderDistributionRef = useRef(null);
//   const companyWisePlacementRef = useRef(null);

//   // Track chart instances
//   const chartInstances = useRef({});

//   useEffect(() => {
//     const createChart = (canvasRef, config, chartKey) => {
//       // Destroy the chart if it already exists
//       if (chartInstances.current[chartKey]) {
//         chartInstances.current[chartKey].destroy();
//       }

//       // Create a new chart
//       if (canvasRef.current) {
//         chartInstances.current[chartKey] = new Chart(canvasRef.current, config);
//       }
//     };

//     // Placement Status Pie Chart
//     createChart(
//       placementStatusRef,
//       {
//         type: "pie",
//         data: {
//           labels: ["Placed", "Unplaced"],
//           datasets: [
//             {
//               data: [analytics.placedStudents, analytics.unplacedStudents],
//               backgroundColor: ["#36A2EB", "#FF6384"],
//             },
//           ],
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             title: {
//               display: true,
//               text: "Placement Status",
//               font: { size: 16, weight: "bold" },
//             },
//           },
//         },
//       },
//       "placementStatus"
//     );

//     // Gender Distribution Pie Chart
//     createChart(
//       genderDistributionRef,
//       {
//         type: "pie",
//         data: {
//           labels: Object.keys(analytics.placedStudentsByGender),
//           datasets: [
//             {
//               data: Object.values(analytics.placedStudentsByGender),
//               backgroundColor: ["#36A2EB", "#FF6384"],
//             },
//           ],
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             title: {
//               display: true,
//               text: "Gender Distribution",
//               font: { size: 16, weight: "bold" },
//             },
//           },
//         },
//       },
//       "genderDistribution"
//     );

//     // Company-wise Placement Pie Chart
//     createChart(
//       companyWisePlacementRef,
//       {
//         type: "pie",
//         data: {
//           labels: Object.keys(analytics.placedStudentsByCompany).length > 0 
//             ? Object.keys(analytics.placedStudentsByCompany)
//             : ["No Placements"],
//           datasets: [
//             {
//               data: Object.keys(analytics.placedStudentsByCompany).length > 0
//                 ? Object.values(analytics.placedStudentsByCompany)
//                 : [1],
//               backgroundColor: [
//                 "#FF6384",
//                 "#36A2EB",
//                 "#FFCE56",
//                 "#4BC0C0",
//                 "#9966FF",
//                 "#FF9F40",
//               ],
//             },
//           ],
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             title: {
//               display: true,
//               text: "Company-wise Placements",
//               font: { size: 16, weight: "bold" },
//             },
//           },
//         },
//       },
//       "companyWisePlacement"
//     );

//     // Cleanup function to destroy charts on unmount
//     return () => {
//       Object.values(chartInstances.current).forEach((chart) => chart.destroy());
//       chartInstances.current = {};
//     };
//   }, [analytics]);

//   if (loading) {
//     return (
//       <Box 
//         display="flex" 
//         justifyContent="center" 
//         alignItems="center" 
//         height="100vh"
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Container maxWidth="xl">
//       <Typography 
//         variant="h4" 
//         component="h1" 
//         align="center" 
//         gutterBottom 
//         sx={{ fontWeight: 'bold', my: 3 }}
//       >
//         Placement Analytics Dashboard
//       </Typography>
      
//       {/* Pie Charts Row */}
//       <Grid 
//         container 
//         spacing={3} 
//         justifyContent="center" 
//         alignItems="stretch"
//       >
//         {/* Placement Status Chart */}
//         <Grid item xs={12} sm={6} md={4}>
//           <Box 
//             border={1} 
//             borderRadius={2} 
//             p={2} 
//             height="100%" 
//             display="flex" 
//             flexDirection="column"
//           >
//             <canvas ref={placementStatusRef} style={{ height: '300px' }}></canvas>
//           </Box>
//         </Grid>
        
//         {/* Gender Distribution Chart */}
//         <Grid item xs={12} sm={6} md={4}>
//           <Box 
//             border={1} 
//             borderRadius={2} 
//             p={2} 
//             height="100%" 
//             display="flex" 
//             flexDirection="column"
//           >
//             <canvas ref={genderDistributionRef} style={{ height: '300px' }}></canvas>
//           </Box>
//         </Grid>
        
//         {/* Company-wise Placement Chart */}
//         <Grid item xs={12} sm={6} md={4}>
//           <Box 
//             border={1} 
//             borderRadius={2} 
//             p={2} 
//             height="100%" 
//             display="flex" 
//             flexDirection="column"
//           >
//             <canvas ref={companyWisePlacementRef} style={{ height: '300px' }}></canvas>
//           </Box>
//         </Grid>
//       </Grid>

//       {/* Total Companies Section */}
//       <Grid 
//         container 
//         spacing={2} 
//         justifyContent="center" 
//         sx={{ mt: 3 }}
//       >
//         <Grid item xs={12} sm={6} md={4}>
//           <Box 
//             bgcolor="purple.100" 
//             p={2} 
//             borderRadius={2} 
//             textAlign="center"
//           >
//             <Typography variant="h6" fontWeight="fontWeightSemiBold">
//               Total Companies
//             </Typography>
//             <Typography variant="h4" fontWeight="fontWeightBold">
//               {analytics.totalCompanies}
//             </Typography>
//           </Box>
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };

// export default Analytics;