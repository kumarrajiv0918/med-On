'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import PersonIcon from '@mui/icons-material/Person';

const drawerWidth = 240;

export default function Sidebar() {
  const [roleId, setRoleId] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setRoleId(user.roleId);
    }
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1976d2',
          color: '#fff',
        },
      }}
    >
      <Toolbar />
      <List>

        {/* Dashboard Link */}
        <ListItem disablePadding>
          <Link href="/dashboard" passHref legacyBehavior>
            <ListItemButton component="a">
              <ListItemIcon sx={{ color: 'white' }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </Link>
        </ListItem>

        {/* Upload File Link */}
        <ListItem disablePadding>
          <Link href="/uploadFile" passHref legacyBehavior>
            <ListItemButton component="a">
              <ListItemIcon sx={{ color: 'white' }}>
                <FilePresentIcon />
              </ListItemIcon>
              <ListItemText primary="Upload File" />
            </ListItemButton>
          </Link>
        </ListItem>

        {/* Show User menu only if admin */}
        {roleId === 'admin' && (
          <ListItem disablePadding>
            <Link href="/register" passHref legacyBehavior>
              <ListItemButton component="a">
                <ListItemIcon sx={{ color: 'white' }}>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="User" />
              </ListItemButton>
            </Link>
          </ListItem>
        )}

      </List>
    </Drawer>
  );
}
