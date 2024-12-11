import React, { useRef, useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { toast } from "react-toastify";

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
          plugins: {
            title: {
              display: true,
              text: "Placement Status",
              font: { size: 18, weight: "bold" },
            },
          },
        },
      },
      "placementStatus"
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
              font: { size: 18, weight: "bold" },
            },
          },
        },
      },
      "branchPlacement"
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
          plugins: {
            title: {
              display: true,
              text: "Gender Distribution",
              font: { size: 18, weight: "bold" },
            },
          },
        },
      },
      "genderDistribution"
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
          plugins: {
            title: {
              display: true,
              text: "Company-wise Placements",
              font: { size: 18, weight: "bold" },
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        Placement Analytics Dashboard
      </h1>

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
      </div>

      {/* Additional Information Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center"> 
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Total Companies</h3>
          <p className="text-2xl font-bold">{analytics.totalCompanies}</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;