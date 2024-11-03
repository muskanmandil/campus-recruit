import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Stack
} from '@mui/material';
import { Visibility, VisibilityOff, AddAPhoto } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const genderOptions = ["Male", "Female"];
const colleges = ["IET", "IIPS", "SCSIT", "SOCS", "SDSF"];
const courses = ["B.E.", "M.Tech", "MCA"];
const branches = ["CS", "IT", "ETC", "EI", "Mechanical", "Civil"];

const AuthComponent = () => {
  // Existing state variables
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [error, setError] = useState('');

  // New state variables for profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    personal_email: '',
    contact_no: '',
    college: '',
    course: '',
    branch: '',
    year_of_passing: '',
    tenth_percentage: '',
    twelfth_percentage: '',
    diploma_cgpa: '',
    ug_cgpa: '',
    total_backlogs: 0,
    active_backlogs: 0,
    profile_image: null
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;


  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        setError('Please select an image less than 1MB');
        return;
      }
      setProfileImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile form handlers
  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleDateChange = (date) => {
    setProfileData(prev => ({
      ...prev,
      date_of_birth: date ? dayjs(date).format("DD-MM-YYYY") : ""
    }));
  };

  const handleProfileSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');


      const formDataToSend = new FormData();
      if (profileImage) {
        if (profileImage.size > 1024 * 1024) { // 1MB limit
          setError('Image size should be less than 1MB');
          return;
        }
        // formDataToSend.append('profile_image', profileImage);
        formDataToSend.append('profile_image', profileImage);
      }
      
      // Append other form data
      Object.keys(profileData).forEach(key => {
        if (key !== 'profile_image') {
          formDataToSend.append(key, profileData[key]);
        }
      });



      const response = await fetch(`${backendUrl}/student/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': sessionStorage.getItem('token')
        },
        // body: JSON.stringify(profileData)
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        window.location.href = '/home';
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.log(error);
      setError('Network error');
    }finally {
      setIsSubmitting(false);
    }
  };

  // Modified handleSubmit to show profile modal after successful OTP verification
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.otp) {
      setError('Please enter OTP');
      return;
    }

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
        alert(data.message);
        setShowProfileModal(true); // Show profile modal instead of redirecting
      } else {
        setError(data.message);
      }

    } catch (error) {
      console.log(error);
      setError('Network Error');
    }
  };

  // Profile Modal Component
  const ProfileModal = () => (
    <Dialog 
      open={showProfileModal} 
      maxWidth="md" 
      fullWidth
      onClose={(e) => e.preventDefault()}
    >
      <DialogTitle>
        Create New Profile
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={(e) => e.preventDefault()} noValidate 
          autoComplete="off">

             {/* Profile Image Upload */}
          <Stack
            direction="column"
            alignItems="center"
            spacing={2}
            sx={{ my: 3 }}
          >
            <Avatar
              src={profileImagePreview}
              sx={{ width: 120, height: 120 }}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<AddAPhoto />}
            >
              Upload Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
          </Stack>

        


          <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Personal Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleProfileChange}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleProfileChange}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    label="Gender"
                    name="gender"
                    value={profileData.gender}
                    onChange={handleProfileChange}
                    required
                    variant="outlined"
                  InputLabelProps={{ shrink: true }}
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
                  value={profileData.date_of_birth ? dayjs(profileData.date_of_birth, "DD-MM-YYYY") : null}
                  onChange={handleDateChange}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Personal Email"
                  name="personal_email"
                  type="email"
                  value={profileData.personal_email}
                  onChange={handleProfileChange}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact No."
                  name="contact_no"
                  type="tel"
                  value={profileData.contact_no}
                  onChange={handleProfileChange}
                  required
                  inputProps={{ maxLength: 10 }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </Grid>
  
              {/* Educational Details */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>Educational Details</Typography>
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>College</InputLabel>
                  <Select
                    label="College"
                    name="college"
                    value={profileData.college}
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
                    value={profileData.course}
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
                    value={profileData.branch}
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
                  value={profileData.year_of_passing}
                  onChange={handleProfileChange}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: 2010, max: 2100 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
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
                  value={profileData.tenth_percentage}
                  onChange={handleProfileChange}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100, step: 0.01 }
                    // variant="outlined"
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Twelfth Percentage"
                  name="twelfth_percentage"
                  type="number"
                  value={profileData.twelfth_percentage}
                  onChange={handleProfileChange}
                  required={!profileData.diploma_cgpa}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100, step: 0.01 }
                    // variant="outlined"
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Diploma CGPA"
                  name="diploma_cgpa"
                  type="number"
                  value={profileData.diploma_cgpa}
                  onChange={handleProfileChange}
                  required={!profileData.twelfth_percentage}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    inputProps: { min: 0, max: 10, step: 0.01 }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="UG CGPA"
                  name="ug_cgpa"
                  type="number"
                  value={profileData.ug_cgpa}
                  onChange={handleProfileChange}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    inputProps: { min: 0, max: 10, step: 0.01 }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Backlogs"
                  name="total_backlogs"
                  type="number"
                  value={profileData.total_backlogs}
                  onChange={handleProfileChange}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: 0 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Active Backlogs"
                  name="active_backlogs"
                  type="number"
                  value={profileData.active_backlogs}
                  onChange={handleProfileChange}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: 0 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </Grid>


              {/* <Grid container spacing={2} sx={{ mt: 1 }}></Grid> */}
            </Grid>
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions>
      <Button 
          onClick={handleProfileSubmit} 
          variant="contained" 
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Add this function before the final return statement and after all the other handlers

const renderMainContent = () => {
  if (isForgotPassword) {
    return (
      <>
        <Typography variant="h5" component="h1" textAlign="center" gutterBottom>
          {forgotPasswordStep === 0 ? 'Forgot Password' :
            forgotPasswordStep === 1 ? 'Verify OTP' : 'New Password'}
        </Typography>
        <Box component="form" onSubmit={handleForgotPasswordSubmit} sx={{ mt: 2 }}>
          {renderForgotPasswordContent()}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            fullWidth
            variant="text"
            onClick={() => {
              sessionStorage.removeItem('email');
              sessionStorage.removeItem('token');
              sessionStorage.removeItem('role');
              setIsForgotPassword(false);
              setForgotPasswordStep(0);
              setFormData({
                ...formData,
                otp: '',
                newPassword: '',
                confirmNewPassword: ''
              });
            }}
            sx={{ mt: 1 }}
          >
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

      {!isSignup && (
        <Typography variant="body2" textAlign="center" gutterBottom>
          Don't have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={() => setIsSignup(true)}
          >
            Signup
          </Link>
        </Typography>
      )}

      <Box component="form" onSubmit={isOtpSent ? handleSubmit : handleProceed} sx={{ mt: 2 }}>
        {!isOtpSent && (
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
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
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

        {isOtpSent && (
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
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {!isSignup && !isOtpSent && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                setIsForgotPassword(true);
                setError('');
              }}
            >
              Forgot Password?
            </Link>
          </Box>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
        >
          {isSignup ? (isOtpSent ? 'Submit' : 'Proceed') : 'Login'}
        </Button>

        {isSignup && (
          <Button
            fullWidth
            variant="text"
            onClick={() => {
              setIsSignup(false);
              setIsOtpSent(false);
              setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                otp: ''
              });
            }}
            sx={{ mt: 1 }}
          >
            Back to Login
          </Button>
        )}
      </Box>
    </>
  );
};

const handleInputChange = (event) => {
  const { name, value } = event.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleProceed = async (event) => {
  event.preventDefault();

  // Validation for signup
  if (isSignup && formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
    return;
  }

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
          password: formData.password // Add password to the request
        })
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('email', formData.email); // Store email for OTP verification
        alert(data.message);
        setIsOtpSent(true);
      } else {
        setError(data.message);
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
        setError(data.message);
      }
    }
  } catch (error) {
    console.error(error);
    setError('Network Error');
  }
};

const handleForgotPasswordSubmit = async (event) => {
  event.preventDefault();

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
        alert(data.message);
        setForgotPasswordStep(1);  // Move to OTP verification step
      } else {
        setError(data.message);
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
        alert(data.message);
        setForgotPasswordStep(2);  // Move to set new password step
      } else {
        setError(data.message);
      }

    } else if (forgotPasswordStep === 2) {
      // Submit new password
      const response = await fetch(`${backendUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmNewPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setIsForgotPassword(false);
        setForgotPasswordStep(0);  // Reset to initial state
      } else {
        setError(data.message);
      }
    }
  } catch (error) {
    console.error(error);
    setError('Network Error');
  }
};

// You also need to add the renderForgotPasswordContent function
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
          >
            Send OTP
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
          >
            Verify
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
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
          >
            Done
          </Button>
        </>
      );
    default:
      return null;
  }
};
  // Rest of your existing component code...
  
  return (
    <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'grey.100',
      p: 2
    }}
  >
    <Card sx={{ maxWidth: 400, width: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        {renderMainContent()}
      </CardContent>
    </Card>
    <ProfileModal />
  </Box>
  );
};

export default AuthComponent;