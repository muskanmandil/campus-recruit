import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { Home, Info, Work, Mail, Settings, Help } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const drawerWidth = '18%';

const menuItems = [
  { text: 'Home', icon: <Home />, path: '/home' },
  { text: 'Your Status', icon: <Info />, path: '/yourStatus' },
  { text: 'Events', icon: <Work />, path: '/events' },
  { text: 'Success', icon: <Mail />, path: '/success' },
  { text: 'Profile', icon: <Settings />, path: '/profile' },
  // { text: 'Page 5', icon: <Help />, path: '/page5' },
];

function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} component={Link} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;