import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Link, IconButton, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Select, MenuItem, FormControl, InputLabel, Avatar, Stack } from '@mui/material';
import { Visibility, VisibilityOff, AddAPhoto } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { toast } from "react-toastify";
import dayjs from 'dayjs';
import "dayjs/locale/en-gb";

dayjs.locale("en-gb");

const genders = ["Male", "Female"];
const colleges = ["IET", "IIPS", "SCSIT", "SOCS", "SDSF"];
const courses = ["B.E.", "B.Tech", "BCA", "B.Tech + M.Tech", "BCA + MCA"];
const branches = ["CS", "IT", "ETC", "EI", "Mechanical", "Civil"];

const AuthComponent = () => {
  const [submitting, setSubmitting] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Profile Modal Variables
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profile, setprofile] = useState({
    enrollment_no: '',
    first_name: '',
    last_name: '',
    image: null,
    gender: '',
    date_of_birth: '',
    personal_email: '',
    contact_no: '',
    college: '',
    course: '',
    branch: '',
    year_of_passing: '',
    tenth_percentage: '',
    twelfth_percentage: 0,
    diploma_cgpa: 0,
    ug_cgpa: '',
    total_backlogs: '',
    active_backlogs: '',
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleInputChange = (e) => {
    e.preventDefault();

    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetAuthForm = () => {
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    setIsForgotPassword(false);
    setForgotPasswordStep(0);
    setIsSignup(false);
    setIsOtpSent(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      otp: '',
      newPassword: '',
      setNewPassword: ''
    });
  }

  const handleProceed = async (e) => {
    e.preventDefault();

    if (isSignup && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      if (isSignup) {
        // Send OTP for signup
        const response = await fetch(`${backendUrl}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          sessionStorage.setItem('email', formData.email);
          toast.success(data.message);
          setIsOtpSent(true);
        } else {
          toast.error(data.message);
        }
      } else {
        // Login request
        const response = await fetch(`${backendUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('role', data.role);
          window.location.href = '/home';
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Server Error');
    }

    setSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.otp) {
      toast.error('Please enter OTP');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${backendUrl}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: sessionStorage.getItem('email'),
          otp: formData.otp
        })
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.removeItem('email');
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('role', data.role);
        toast.success(data.message);
        setShowProfileModal(true);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.error(error);
      toast.error('Server Error');
    }

    setSubmitting(false);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      if (forgotPasswordStep === 0) {
        // Send OTP for forgot password
        const response = await fetch(`${backendUrl}/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: formData.email })
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(data.message);
          setForgotPasswordStep(1);  // Move to OTP verification step
        } else {
          toast.error(data.message);
        }

      } else if (forgotPasswordStep === 1) {
        // Verify OTP for forgot password
        const response = await fetch(`${backendUrl}/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: formData.email, otp: formData.otp })
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(data.message);
          sessionStorage.removeItem('email');
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('role', data.role);
          setForgotPasswordStep(2);  // Move to set new password step
        } else {
          toast.error(data.message);
        }


      } else if (forgotPasswordStep === 2) {
        // Submit new password
        if (formData.newPassword !== formData.confirmNewPassword) {
          toast.error("Password do not match");
          setSubmitting(false);
          return;
        }
        const response = await fetch(`${backendUrl}/auth/new-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': sessionStorage.getItem('token')
          },
          body: JSON.stringify({
            new_password: formData.newPassword
          })
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(data.message);
          setIsForgotPassword(false);
          setForgotPasswordStep(0);  // Reset to initial state
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Server Error');
    }

    setSubmitting(false);
  };

  const handleProfileChange = (e) => {
    e.preventDefault();

    const { name, value } = e.target;
    setprofile(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setprofile(prev => ({ ...prev, date_of_birth: date ? dayjs(date).format("DD-MM-YYYY") : "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      toast.error('Upload an image');
      return;
    }

    if (!file.type.match('image/jpe?g')) {
      toast.error('Please select a JPG/JPEG image only');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Please select an image less than 2MB');
      return;
    }

    setProfileImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('image', profileImage);

      Object.keys(profile).forEach(key => {
        if (key !== 'image') {
          formData.append(key, profile[key]);
        }
      });

      const response = await fetch(`${backendUrl}/student/create-profile`, {
        method: 'POST',
        headers: {
          'auth-token': sessionStorage.getItem('token')
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        window.location.href = '/profile';
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error');
    } finally {
      setSubmitting(false);
    }
  };

  // Profile Modal
  const renderProfileModal = () => {
    return (
      <Dialog open={showProfileModal} maxWidth="md" fullWidth onClose={(e) => e.preventDefault()}>
        <DialogTitle>
          Create New Profile
        </DialogTitle>

        <DialogContent>
          <Box component="form" onSubmit={(e) => e.preventDefault()} noValidate autoComplete="off">

            {/* Profile Image Upload */}
            <Stack direction="column" alignItems="center" spacing={2} sx={{ my: 3 }} >
              <Avatar src={profileImagePreview} sx={{ width: 120, height: 120 }} />
              <Button variant="outlined" component="label" startIcon={<AddAPhoto />}>
                Upload Photo
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
            </Stack>

            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='en-gb'>

              <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={profile.first_name}
                    onChange={handleProfileChange}
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
                    value={profile.last_name}
                    onChange={handleProfileChange}
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
                      value={profile.gender}
                      onChange={handleProfileChange}
                      required
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
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
                    value={profile.date_of_birth ? dayjs(profile.date_of_birth, "DD-MM-YYYY") : null}
                    onChange={handleDateChange}
                    required
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: '100%' }}
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
                    value={profile.personal_email}
                    onChange={handleProfileChange}
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
                    value={profile.contact_no}
                    onChange={handleProfileChange}
                    required
                    inputProps={{ maxLength: 10 }}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }} color='primary'>Educational Details</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Enrollment No."
                    name="enrollment_no"
                    value={profile.enrollment_no}
                    onChange={handleProfileChange}
                    required
                    inputProps={{ maxLength: 10 }}
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
                      value={profile.college}
                      onChange={handleProfileChange}
                      required
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    >
                      {colleges.map((college) => (
                        <MenuItem key={college} value={college}>{college}</MenuItem>
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
                      value={profile.course}
                      onChange={handleProfileChange}
                      required
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    >
                      {courses.map((course) => (
                        <MenuItem key={course} value={course}>{course}</MenuItem>
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
                      value={profile.branch}
                      onChange={handleProfileChange}
                      required
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    >
                      {branches.map((branch) => (
                        <MenuItem key={branch} value={branch}>{branch}</MenuItem>
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
                    value={profile.year_of_passing}
                    onChange={handleProfileChange}
                    required
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: 2010, max: 2100 }}
                  />
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" color="primary">
                    Academic Performance
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tenth Percentage"
                    name="tenth_percentage"
                    type="number"
                    value={profile.tenth_percentage}
                    onChange={handleProfileChange}
                    required
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      inputProps: { min: 0, max: 100, step: 0.01 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Twelfth Percentage"
                    name="twelfth_percentage"
                    type="number"
                    value={profile.twelfth_percentage}
                    onChange={handleProfileChange}
                    required={!profile.diploma_cgpa}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      inputProps: { min: 0, max: 100, step: 0.01 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Diploma CGPA"
                    name="diploma_cgpa"
                    type="number"
                    value={profile.diploma_cgpa}
                    onChange={handleProfileChange}
                    required={!profile.twelfth_percentage}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      inputProps: { min: 0, max: 10, step: 0.01 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="UG CGPA"
                    name="ug_cgpa"
                    type="number"
                    value={profile.ug_cgpa}
                    onChange={handleProfileChange}
                    required
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      inputProps: { min: 0, max: 10, step: 0.01 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Backlogs"
                    name="total_backlogs"
                    type="number"
                    value={profile.total_backlogs}
                    onChange={handleProfileChange}
                    required
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Active Backlogs"
                    name="active_backlogs"
                    type="number"
                    value={profile.active_backlogs}
                    onChange={handleProfileChange}
                    required
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleProfileSubmit} variant="contained" color="primary" disabled={submitting} >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>);
  };

  const renderForgotPasswordContent = () => {
    switch (forgotPasswordStep) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label="Institute Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
              {submitting ? 'Sending...' : 'Send OTP'}
            </Button>
          </>
        );

      case 1:
        return (
          <>
            <TextField
              fullWidth
              label="Enter OTP"
              name="otp"
              value={formData.otp}
              onChange={handleInputChange}
              margin="normal"
              required
              inputProps={{ maxLength: 6 }}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }} >
              {submitting ? "Verifying..." : "Verify"}
            </Button>
          </>
        );

      case 2:
        return (
          <>
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleInputChange}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmNewPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmNewPassword}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
              {submitting ? "Setting Password..." : "Set Password"}
            </Button>
          </>
        );
      default:
        return null;
    }
  };


  const renderMainContent = () => {
    if (showProfileModal) {
      return renderProfileModal();
    }

    if (isForgotPassword) {
      return (
        <>
          <Typography variant="h5" component="h1" textAlign="center" gutterBottom>
            {forgotPasswordStep === 0 ? 'Forgot Password' :
              forgotPasswordStep === 1 ? 'Verify OTP' : 'New Password'}
          </Typography>

          <Box component="form" onSubmit={handleForgotPasswordSubmit} sx={{ mt: 2 }}>
            {renderForgotPasswordContent()}
            <Button fullWidth variant="text" onClick={resetAuthForm} sx={{ mt: 1 }}>
              Back to Login
            </Button>
          </Box>
        </>
      );
    }

    return (
      <>
        <Typography variant="h5" component="h1" textAlign="center" gutterBottom>
          {isSignup ? 'Sign Up' : 'Login'}
        </Typography>

        <Typography variant="body2" textAlign="center" gutterBottom>
          {isSignup ? 'Already have an account? ' : `Don't have an account? `}
          <Link component="button" variant="body2" onClick={() => { setIsSignup(!isSignup); setIsOtpSent(false); }}>
            {isSignup ? 'Login' : 'Signup'}
          </Link>
        </Typography>

        <Box component="form" onSubmit={isOtpSent ? handleSubmit : handleProceed} sx={{ mt: 2 }}>
          {isOtpSent ?
            (<TextField
              fullWidth
              label="Enter OTP"
              name="otp"
              value={formData.otp}
              onChange={handleInputChange}
              margin="normal"
              required
              inputProps={{ maxLength: 6 }}
            />
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Institute Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {isSignup && (
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                  />
                )}
              </>
            )}

          {!isSignup && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Link component="button" variant="body2" onClick={() => { setIsForgotPassword(true) }}>
                Forgot Password?
              </Link>
            </Box>
          )}

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            {submitting ? "submitting..." : isSignup ? (isOtpSent ? "Submit" : "Proceed") : "Login"}
          </Button>


          {isSignup && (
            <Button fullWidth variant="text" onClick={resetAuthForm} sx={{ mt: 1 }}>
              Back to Login
            </Button>
          )}
        </Box>
      </>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', p: 2 }} >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          {renderMainContent()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthComponent;