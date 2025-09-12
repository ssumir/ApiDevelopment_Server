import React from 'react';
import { Box, Typography, Container } from '@mui/material';

export default function DashboardSummary() {
  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2, backgroundColor: '#fff' }}>
        <Typography variant="h5" gutterBottom>
          Dashboard Summary
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your personal dashboard! This area provides a quick overview
          of your system's key metrics, including the total number of users,
          courses, and enrollments. Use the navigation menu on the left to
          manage different aspects of the system.
        </Typography>
        {/* You can add more summary widgets here, e.g., cards with counts */}
      </Box>
    </Container>
  );
}