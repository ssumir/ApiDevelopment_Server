import React from 'react';
import { Box, Typography, Container, CircularProgress } from '@mui/material';

export default function ViewUserInformation({ user }) {
  if (!user) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2, backgroundColor: '#fff' }}>
        <Typography variant="h5" gutterBottom>
          User Information
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={2}>
          This section provides details about the currently logged-in user.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          **Full Name:** {user.fullName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          **Email:** {user.email}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          **Role:** {user.role}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          **User ID:** {user.userId}
        </Typography>
      </Box>
    </Container>
  );
}