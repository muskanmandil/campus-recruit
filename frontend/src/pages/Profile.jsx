import React, { useEffect, useState } from "react";
import { Box, Avatar, Typography, TextField, Grid, Paper, Select, MenuItem, Button, InputLabel, FormControl, InputAdornment, Stack } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AddAPhoto } from "@mui/icons-material";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";

dayjs.locale("en-gb");

const genders = ["Male", "Female"];
const colleges = ["IET", "IIPS", "SCSIT", "SOCS", "SDSF"];
const courses = ["B.E.", "B.Tech", "BCA", "B.Tech + M.Tech", "BCA + MCA"];
const branches = ["CS", "IT", "ETC", "EI", "Mechanical", "Civil"];

function Profile() {
  const [profile, setProfile] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchProfile();
  },[]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/student/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": sessionStorage.getItem("token"),
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data);
        if (data.image) {
          setProfileImagePreview(data.image);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }
    setLoading(false);
  };

  const toggleEdit = () => {
    setEditing(!editing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDateChange = (date) => {
    setProfile((prevData) => ({...prevData, date_of_birth: date ? dayjs(date).format("DD-MM-YYYY") : "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      toast.error("Upload an image");
      return;
    }

    if (!file.type.match("image/jpe?g")) {
      toast.error("Please select a JPG/JPEG image only");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Please select an image less than 2MB");
      return;
    }

    setProfileImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // const handleSave = async (e) => {
  //   e.preventDefault();
  //   const formattedDate = dayjs(profile.date_of_birth, "DD-MM-YYYY").format("YYYY-MM-DD");
  //   setSubmitting(true);
  //   try {

  //     const formData = new FormData();
  //     if (profileImage) {
  //       if (profileImage.size > 1024 * 1024) {
  //         alert('Image size should be less than 1MB');
  //         return;
  //       }
  //       formData.append('image', profileImage);
  //     }

  //     // Append other form data
  //     Object.keys(profile).forEach(key => {
  //       if (key !== 'image') {
  //         formData.append(key, profile[key]);
  //       }
  //     });

  //     const response = await fetch(`${backendUrl}/student/profile`, {
  //       method: "POST",
  //       headers: {
  //         "auth-token": sessionStorage.getItem("token"),
  //       },
  //       body: formData,
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       toast.success(data.message);
  //       setEditing(false);
  //     } else {
  //       toast.error(data.message);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Server error");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  return loading ? (
    <>Fetching Profile...</>
  ) : (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>

          <Stack direction="column" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Avatar src={profileImagePreview} sx={{ width: 120, height: 120 }}/>

            {editing && (
              <Button variant="outlined" component="label" startIcon={<AddAPhoto />}>
                Upload Photo
                <input type="file" hidden accept="image/*" onChange={handleImageChange}/>
              </Button>
            )}
          </Stack>

          <Typography variant="h6" color="primary" gutterBottom>
            Personal Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={profile?.first_name || ""}
                onChange={handleChange}
                disabled={!editing}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={profile?.last_name || ""}
                onChange={handleChange}
                disabled={!editing}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  name="gender"
                  value={profile?.gender || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                >
                  {genders.map((option) => (
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
                value={profile?.date_of_birth ? dayjs(profile.date_of_birth, "DD-MM-YYYY") : null}
                onChange={handleDateChange}
                disabled={!editing}
                format="DD-MM-YYYY"
                sx={{ width: "100%" }}
                renderInput={(params) => (
                  <TextField {...params} required fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Personal Email"
                name="personal_email"
                type="email"
                value={profile?.personal_email || ""}
                onChange={handleChange}
                disabled={!editing}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact No."
                name="contact_no"
                type="tel"
                value={profile?.contact_no || ""}
                onChange={handleChange}
                disabled={!editing}
                required
                inputProps={{ maxLength: 10 }}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Educational Details
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Enrollment No."
                name="enrollment_no"
                value={profile?.enrollment_no || ""}
                onChange={handleChange}
                disabled={!editing}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>College</InputLabel>
                <Select
                  label="College"
                  name="college"
                  value={profile?.college || ""}
                  onChange={handleChange}
                  disabled={!editing}
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
                <InputLabel>Course</InputLabel>
                <Select
                  label="Course"
                  name="course"
                  value={profile?.course || ""}
                  onChange={handleChange}
                  disabled={!editing}
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
                  value={profile?.branch || ""}
                  onChange={handleChange}
                  disabled={!editing}
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
                value={profile?.year_of_passing || ""}
                onChange={handleChange}
                disabled={!editing}
                required
                inputProps={{ min: 2010, max: 2100 }}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" color="primary" sx={{ mt: 4, mb: 2 }}>
            Academic Performance
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tenth Percentage"
                name="tenth_percentage"
                type="number"
                value={profile?.tenth_percentage || ""}
                onChange={handleChange}
                disabled={!editing}
                required
                InputProps={{
                  endAdornment: (<InputAdornment position="end">%</InputAdornment>),
                  inputProps: { min: 0, max: 100, step: 0.01 },
                }}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Twelfth Percentage"
                name="twelfth_percentage"
                type="number"
                value={profile?.twelfth_percentage || ""}
                onChange={handleChange}
                disabled={!editing}
                required={!profile?.diploma_cgpa}
                InputProps={{
                  endAdornment: (<InputAdornment position="end">%</InputAdornment>),
                  inputProps: { min: 0, max: 100, step: 0.01 },
                }}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Diploma CGPA"
                name="diploma_cgpa"
                type="number"
                value={profile?.diploma_cgpa || ""}
                onChange={handleChange}
                disabled={!editing}
                required={!profile?.twelfth_percentage}
                InputProps={{
                  inputProps: { min: 0, max: 10, step: 0.01 },
                }}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="UG CGPA"
                name="ug_cgpa"
                type="number"
                value={profile?.ug_cgpa || ""}
                onChange={handleChange}
                disabled={!editing}
                required
                InputProps={{
                  inputProps: { min: 0, max: 10, step: 0.01 },
                }}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Backlogs"
                name="total_backlogs"
                type="number"
                value={profile?.total_backlogs || 0}
                onChange={handleChange}
                disabled={!editing}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Active Backlogs"
                name="active_backlogs"
                type="number"
                value={profile?.active_backlogs || 0}
                onChange={handleChange}
                disabled={!editing}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          {editing ? (
            <Button variant="contained" onClick="" disabled={submitting} >
              {submitting ? "Saving..." : "Save"}
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