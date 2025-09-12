import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { ArrowForward, School } from '@mui/icons-material';

// Mock data for courses
const mockCourses = [
  { id: 1, title: 'Web Development Basics', description: 'HTML, CSS, JavaScript fundamentals for modern web.', link: '/courses/web-dev-intro' },
  { id: 2, title: 'React.js Essentials', description: 'Master components, state, and hooks to build powerful UIs.', link: '/courses/react-for-beginners' },
  { id: 3, title: 'Python for Data Science', description: 'Dive into data analysis, machine learning, and visualization.', link: '/courses/data-science-python' },
  { id: 4, title: 'Advanced UX/UI Design', description: 'From user research and prototyping to interactive user testing.', link: '/courses/ux-ui-design' },
  { id: 5, title: 'Flutter Mobile Dev', description: 'Build beautiful, cross-platform apps with a single codebase.', link: '/courses/flutter-dev' },
  { id: 6, title: 'Cloud Computing Intro', description: 'Explore the basics of AWS, Azure, and Google Cloud services.', link: '/courses/cloud-computing' },
];

const AllCourses = ({ onClose }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulating a network request
    setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <Box
      sx={{
        py: 8,
        px: 2,
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container maxWidth="lg" sx={{ flexGrow: 1 }}>
        {/* Modern Hero Section */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 8,
            py: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #673ab7 30%, #5e35b1 90%)',
            color: 'white',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              left: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.05)',
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -50,
              right: -50,
              width: 250,
              height: 250,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.03)',
              zIndex: 0,
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, mb: 1, letterSpacing: '-1px' }}
            >
              Unlock Your Potential.
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Discover a world of skills with our premium course collection.
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="h4"
          align="center"
          sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}
        >
          Featured Courses
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          paragraph
          sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
        >
          Learn from industry experts with our meticulously crafted courses. Each path is designed to guide you from beginner to expert with practical, hands-on projects.
        </Typography>

        {/* Loader / Error / Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress color="primary" size={60} />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
              {error}
            </Alert>
          </Box>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {courses.map((course) => (
              <Grid item key={course.id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: 250,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 4,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                    },
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '5px',
                      background: 'linear-gradient(90deg, #5e35b1, #9575cd)',
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 0.4s ease-in-out',
                    },
                    '&:hover:before': {
                      transform: 'scaleX(1)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3, position: 'relative' }}>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'rgba(150, 150, 150, 0.1)',
                        color: 'primary.main',
                      }}
                    >
                      <School />
                    </IconButton>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="h3"
                      sx={{ fontWeight: 600, lineHeight: 1.3, mb: 1 }}
                    >
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {course.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2.5, pt: 0, mt: 'auto' }}>
                    <Button
                      size="medium"
                      fullWidth
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowForward />}
                      component="a"
                      href={course.link}
                      sx={{
                        fontWeight: 'bold',
                        borderRadius: 2,
                        py: 1.2,
                        textTransform: 'none',
                        fontSize: '1rem',
                      }}
                    >
                      View Course
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      
      {/* Footer and Close Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
          sx={{
            py: 1.2,
            px: 5,
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'primary.light',
              color: '#fff',
            },
          }}
        >
          Back to Home
        </Button>
      </Box>
    </Box>
  );
};

export default AllCourses;