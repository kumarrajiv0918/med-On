'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
export default function HomePage() {
  return (
    <>
      {/* Top Navigation Bar */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <MedicalServicesIcon fontSize="large" />
           med'On
          </Typography>
          <Button href="/auth" color="inherit">
            Login
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          minHeight: '90vh',
          backgroundColor: '#e3f2fd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          p: 4,
        }}
      >
        <Typography variant="h3" gutterBottom>
          Your Health, Our Priority
        </Typography>
        <Typography variant="h6" gutterBottom>
          Trusted medical care for your whole family.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          href="/appointment"
        >
          Book Appointment
        </Button>
      </Box>

      {/* About Us Section */}
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>
          About Us
        </Typography>
        <Typography variant="body1">
          At MedCare, we are dedicated to providing world-class healthcare
          services with compassion and care. Our team of experienced
          professionals is here to ensure your wellbeing.
        </Typography>
      </Container>
    </>
  );
}
