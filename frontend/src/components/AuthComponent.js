import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert,
  Link,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AuthComponent = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0); // 0: email, 1: OTP, 2: new password
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

  const navigate = useNavigate();

  // Example authentication check
const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token; // Or more sophisticated token validation
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    
    switch (forgotPasswordStep) {
      case 0: // Email submission
        if (!formData.email) {
          setError('Please enter your email');
          return;
        }
        // Here you would make an API call to send OTP
        console.log('Sending OTP to:', formData.email);
        setForgotPasswordStep(1);
        break;

      case 1: // OTP verification
        if (!formData.otp) {
          setError('Please enter OTP');
          return;
        }
        // Here you would verify the OTP
        console.log('Verifying OTP:', formData.otp);
        setForgotPasswordStep(2);
        break;

      case 2: // New password submission
        if (!formData.newPassword || !formData.confirmNewPassword) {
          setError('Please fill in all fields');
          return;
        }
        if (formData.newPassword !== formData.confirmNewPassword) {
          setError('Passwords do not match');
          return;
        }
        // Here you would make an API call to update password
        console.log('Updating password');
        // Reset everything and go back to login
        setIsForgotPassword(false);
        setForgotPasswordStep(0);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          otp: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        break;
    }
  };

  const handleProceed = (e) => {
    e.preventDefault();
    
    if (isSignup) {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    if (isSignup && !isOtpSent) {
      setIsOtpSent(true);
      console.log('Sending OTP to:', formData.email);
    }
  };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!isSignup) {
//       if (!formData.email || !formData.password) {
//         setError('Please fill in all fields');
//         return;
//       }
//       console.log('Logging in...');
//       window.location.href = '/home';
//     } else {
//       if (!formData.otp) {
//         setError('Please enter OTP');
//         return;
//       }
//       console.log('Creating account...');
//       window.location.href = '/profile';
//     }
//   };

const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isSignup) {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }
      // After successful login
      localStorage.setItem('token', 'your-auth-token'); // Store your auth token
      
    //   navigate('/'); // Navigate to home
    window.location.href = '/home';
    } else {
      if (!formData.otp) {
        setError('Please enter OTP');
        return;
      }
      // After successful signup
      window.location.href = '/profile';
    }
  };

  const renderForgotPasswordContent = () => {
    switch (forgotPasswordStep) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label="Email"
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
    }
  };

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
          {isSignup && !isOtpSent && (
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          )}

          {!isOtpSent && (
            <>
              <TextField
                fullWidth
                label="Email"
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

              {!isSignup && (
                <Box sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                      />
                    }
                    label="Show password"
                  />
                </Box>
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
    </Box>
  );
};

export default AuthComponent;