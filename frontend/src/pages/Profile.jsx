// File: src/pages/Page4.js
import React, { useState } from 'react';
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
  FormControl
} from '@mui/material';

// Sample data - replace with actual data or fetch from an API
const initialProfileData = {
  name: 'Anushka',
  lastName: 'Kathal',
  sex: '',
  age: '21',
  address: 'Yadav colony, Jabalpur',
  pincode: '12345',
  college: '',
  rollNumber: '21I7112',
  enrollmentNumber: 'DE21428',
  department: '',
  yearOfPassing: '2025',
  cgpa: '3.8'
};

const colleges = [
  'University A',
  'University B',
  'University C',
  'University D',
  'University E',
  'University F'
];

const sexOptions = ['Male', 'Female', 'Other'];

const departments = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'EI Engineering'
];

function Profile() {
  const [profileData, setProfileData] = useState(initialProfileData);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfileData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ width: 150, height: 150, mb: 2 }}>{profileData.name[0]}</Avatar>
            <Typography variant="h6">{`${profileData.name} ${profileData.lastName}`}</Typography>
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              {['name', 'lastName'].map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    fullWidth
                    label={field === 'lastName' ? 'Last Name' : 'Name'}
                    name={field}
                    value={profileData[field]}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
              ))}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Sex</InputLabel>
                  <Select
                    label="Sex"
                    name="sex"
                    value={profileData.sex}
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                    {sexOptions.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {['age', 'address', 'pincode'].map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    fullWidth
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    name={field}
                    value={profileData[field]}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Educational Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>College Name</InputLabel>
              <Select
                label="College Name"
                name="college"
                value={profileData.college}
                onChange={handleChange}
                disabled={!isEditing}
              >
                {colleges.map((college) => (
                  <MenuItem key={college} value={college}>{college}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {['rollNumber', 'enrollmentNumber'].map((field) => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                fullWidth
                label={field === 'rollNumber' ? 'Roll Number' : 'Enrollment Number'}
                name={field}
                value={profileData[field]}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
          ))}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                label="Department"
                name="department"
                value={profileData.department}
                onChange={handleChange}
                disabled={!isEditing}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {['yearOfPassing', 'cgpa'].map((field) => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                fullWidth
                label={field === 'yearOfPassing' ? 'Year of Passing' : 'CGPA'}
                name={field}
                value={profileData[field]}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={toggleEdit}>
          {isEditing ? 'Save' : 'Edit'}
        </Button>
      </Box>
    </Box>
  );
}

export default Profile;