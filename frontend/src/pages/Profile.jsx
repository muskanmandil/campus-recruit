import React, { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  TextField,
  Grid,
  Paper,
  Select,
  MenuItem,
  Button,
  InputLabel,
  FormControl,
  InputAdornment,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const genderOptions = ["Male", "Female"];
const colleges = ["IET", "IIPS", "SCSIT", "SOCS", "SDSF"];
const courses = ["B.E.", "M.Tech", "MCA"];
const branches = ["CS", "IT", "ETC", "EI", "Mechanical", "Civil"];

function Profile() {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setProfile((prevData) => ({
      ...prevData,
      date_of_birth: date ? dayjs(date).format("DD-MM-YYYY"): "",
    }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${backendUrl}/student/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${sessionStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setProfile(data);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              md={3}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar sx={{ width: 150, height: 150, mb: 2 }}>
                {profile?.first_name}
              </Avatar>
              <Typography variant="h6">{`${profile?.first_name} ${profile?.last_name}`}</Typography>
            </Grid>
            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={profile?.first_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={profile?.last_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      label="Gender"
                      name="gender"
                      value={profile?.gender}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    >
                      {genderOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date of Birth"
                    name="date_of_birth"
                    value={dayjs(profile?.date_of_birth, "DD-MM-YYYY")}
                    onChange={handleDateChange}
                    disabled={!isEditing}
                    sx={{ width: "100%" }}
                    required
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Personal Email"
                    name="personal_email"
                    type="email"
                    value={profile?.personal_email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact No."
                    name="contact_no"
                    type="tel"
                    value={profile?.contact_no}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Educational Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>College </InputLabel>
                <Select
                  label="College"
                  name="college"
                  value={profile?.college}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                >
                  {colleges.map((college) => (
                    <MenuItem key={college} value={college}>
                      {college}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Course </InputLabel>
                <Select
                  label="Course"
                  name="course"
                  value={profile?.course}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                >
                  {courses.map((course) => (
                    <MenuItem key={course} value={course}>
                      {course}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Branch</InputLabel>
                <Select
                  label="Branch"
                  name="branch"
                  value={profile?.branch}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch} value={branch}>
                      {branch}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year of Passing"
                name="year_of_passing"
                type="number"
                value={profile?.year_of_passing}
                onChange={handleChange}
                disabled={!isEditing}
                required
                inputProps={{ min: 2010, max: 2100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tenth Percentage"
                name="tenth_percentage"
                type="number"
                value={profile?.tenth_percentage}
                onChange={handleChange}
                disabled={!isEditing}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                  inputProps: { min: 0, max: 100, step: 0.01 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Twelfth Percentage"
                name="twelfth_percentage"
                type="number"
                value={profile?.twelfth_percentage}
                onChange={handleChange}
                disabled={!isEditing}
                required={!profile?.diploma_cgpa}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                  inputProps: { min: 0, max: 100, step: 0.01 },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Diploma CGPA"
                name="diploma_cgpa"
                type="number"
                value={profile?.diploma_cgpa}
                onChange={handleChange}
                disabled={!isEditing}
                required={!profile?.twelfth_percentage}
                InputProps={{
                  inputProps: { min: 0, max: 10, step: 0.01 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="UG CGPA"
                name="ug_cgpa"
                type="number"
                value={profile?.ug_cgpa}
                onChange={handleChange}
                disabled={!isEditing}
                required
                InputProps={{
                  inputProps: { min: 0, max: 10, step: 0.01 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Backlogs"
                name="total_backlogs"
                type="number"
                value={profile?.total_backlogs}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Active Backlogs"
                name="active_backlogs"
                type="number"
                value={profile?.active_backlogs}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          {isEditing ? (
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          ) : (
            <Button variant="contained" onClick={toggleEdit}>
              Edit
            </Button>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default Profile;