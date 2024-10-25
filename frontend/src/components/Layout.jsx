import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { AccountCircle, Notifications } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            CAMPUS-RECRUIT
          </Typography>
          <IconButton color="inherit" component={Link} to="/notifications">
            <Notifications />
          </IconButton>
          <IconButton color="inherit" component={Link} to="/profile">
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 3, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default Layout;