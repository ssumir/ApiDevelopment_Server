import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard'); // Or navigate('/') if that's your main route
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 8,
        textAlign: 'center',
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: '#fff',
      }}
    >
      <Box sx={{ color: 'text.secondary', mb: 3 }}>
        <SentimentVeryDissatisfiedIcon sx={{ fontSize: 100 }} />
      </Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        We couldn't find the page you're looking for. It might have been moved or removed.
      </Typography>
      <Button variant="contained" onClick={handleGoHome}>
        Go Back to Dashboard
      </Button>
    </Container>
  );
}