import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Chip,
  Divider,
  LinearProgress,
} from "@mui/material";
import { toast } from "react-toastify";

const CompanyCard = ({ company, students }) => (
  <Paper
    elevation={6}
    sx={{
      p: 4,
      m: 2,
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      borderRadius: 3,
      background: "linear-gradient(145deg, #f0f4f8 0%, #ffffff 100%)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: "transform 0.3s ease-in-out",
      position: "relative",
      "&:hover": {
        transform: "scale(1.02)",
      },
    }}
  >
    <Box sx={{ mb: 3, textAlign: "center" }}>
      <Typography
        variant="h4"
        sx={{
          mb: 1,
          fontWeight: "bold",
          color: "primary.main",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {company.toUpperCase()}
      </Typography>
      <Chip
        label={`${students.length} Students Selected`}
        color="primary"
        variant="outlined"
        sx={{
          mb: 2,
          fontWeight: "medium",
          fontSize: "0.9rem",
        }}
      />
    </Box>

    <Divider sx={{ mb: 3 }} />

    <Grid container spacing={3} justifyContent="center" alignItems="stretch">
      {students.map((student, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Box
            sx={{
              textAlign: "center",
              p: 2,
              borderRadius: 2,
              background: "#f7f9fc",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
              transition: "background 0.3s ease",
              "&:hover": {
                background: "#e9f0f7",
              },
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mb: 2,
                mx: "auto",
                background: "primary.main",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
              src={student.image} // Use the image URL
              alt={student.name} // Fallback in case the image doesn't load
            >
              {!student.image && student.name.split(" ")[0][0]}{" "}
              {/* Show initials if image is unavailable */}
            </Avatar>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 0.5,
                color: "text.primary",
              }}
            >
              {student.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontStyle: "italic",
                color: "text.secondary",
              }}
            >
              {student.branch} Branch
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Paper>
);

function Success() {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [successData, setSuccessData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuccessData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${backendUrl}/success`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        setSuccessData(data.finalSelects);
      } catch (err) {
        toast.error(`Failed to fetch success stories: ${err.message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuccessData();
  }, []);

  return (
    <Box
      sx={{
        p: 4,
        background: "#f4f6f9",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {isLoading && (
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 1000,
          }}
        />
      )}

      <Typography
        variant="h2"
        sx={{
          textAlign: "center",
          mb: 4,
          fontWeight: "bold",
          color: "primary.main",
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        Success Stories
      </Typography>

      {!isLoading && successData.length === 0 ? (
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          No success stories found
        </Typography>
      ) : (
        successData.map((item, index) => (
          <CompanyCard
            key={index}
            company={item.company}
            students={item.students}
          />
        ))
      )}
    </Box>
  );
}

export default Success;
