import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Box, Container, Typography, Modal, Backdrop, Fade, Button, Paper } from '@mui/material';
import NotFound from '../NotFound/NotFound';
import AllCourses from './AllCourses';
import { modalStyle } from './modalStyles'; // Import the modalStyle object

const Home = () => {
  const location = useLocation();
  const [openNotFoundModal, setOpenNotFoundModal] = useState(false);
  const [openCoursesModal, setOpenCoursesModal] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);

  useEffect(() => {
    const navbar = document.querySelector('header');
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight);
    }

    if (location.state && location.state.notFound) {
      setOpenNotFoundModal(true);
    }
  }, [location.state]);

  const handleCloseNotFoundModal = () => {
    setOpenNotFoundModal(false);
  };

  const handleOpenCoursesModal = () => {
    setOpenCoursesModal(true);
  };

  const handleCloseCoursesModal = () => {
    setOpenCoursesModal(false);
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          minHeight: `calc(100vh - ${navbarHeight}px)`,
          marginTop: `${navbarHeight}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
            className="text-3xl md:text-5xl lg:text-6xl"
          >
            Elevate Your Skills. Master Your Future.
          </Typography>
          <Typography
            variant="h5"
            sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
            className="text-base md:text-lg"
          >
            Discover expert-led courses and gain the knowledge you need to succeed. Your learning journey starts here.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              fontWeight: 'bold',
              letterSpacing: 1.5,
              borderRadius: '50px',
              px: 4,
              py: 1.5,
              mt: 2,
            }}
            className="transform transition-transform hover:scale-105"
            onClick={handleOpenCoursesModal}
          >
            Explore Courses
          </Button>
        </Container>
      </Box>

      {/* Modal for 404 page */}
      <Modal
        aria-labelledby="not-found-modal-title"
        aria-describedby="not-found-modal-description"
        open={openNotFoundModal}
        onClose={handleCloseNotFoundModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openNotFoundModal}>
          <Box sx={{ ...modalStyle, top: '50%', transform: 'translate(-50%, -50%)' }}>
            <NotFound />
          </Box>
        </Fade>
      </Modal>

      {/* Modal for All Courses */}
      <Modal
        aria-labelledby="courses-modal-title"
        aria-describedby="courses-modal-description"
        open={openCoursesModal}
        onClose={handleCloseCoursesModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openCoursesModal}>
          <Paper sx={modalStyle}>
            <AllCourses onClose={handleCloseCoursesModal} />
          </Paper>
        </Fade>
      </Modal>
    </>
  );
};

export default Home;