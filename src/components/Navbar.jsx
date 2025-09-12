import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse, // Import Collapse for a smooth toggle animation
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { text: 'Login', path: '/Auth/login' },
    { text: 'Register', path: '/Auth/register' },
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <AppBar position="fixed" sx={{
        backgroundColor: '#1a237e',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderRadius: '5px 5px 0 0',
        top: 0,
        left: 0,
        right: 0,
      }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <SchoolIcon sx={{ mr: 1, color: '#e8f5e9' }} />
            <Typography variant="h6" component="div">
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                Course Management System
              </Link>
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Button
              color="inherit"
              component={Link}
              to="/Auth/login"
              sx={{ fontWeight: 'semi-bold', textTransform: 'none', mx: 1, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              component={Link}
              to="/Auth/register"
              sx={{ fontWeight: 'semi-bold', textTransform: 'none', mx: 1, borderColor: 'white', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
            >
              Register
            </Button>
          </Box>
          <IconButton
            color="inherit"
            aria-label="open mobile menu"
            edge="end"
            onClick={handleMobileMenuToggle}
            sx={{ display: { md: 'none' } }}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Mobile Menu List (replaces the Drawer) */}
      <Collapse in={mobileMenuOpen} timeout="auto" unmountOnExit>
        <Box 
          sx={{
            display: { md: 'none' }, // Only show on mobile
            backgroundColor: '#1a237e',
            color: 'white',
            position: 'fixed',
            top: '64px', // Adjust to sit just below the Navbar
            width: '100%',
            zIndex: (theme) => theme.zIndex.drawer,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <List>
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  component={Link} 
                  to={item.path} 
                  onClick={handleMobileMenuToggle} // Close the menu on click
                >
                  <ListItemText primary={item.text} sx={{ textAlign: 'center' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Collapse>
    </>
  );
};

export default Navbar;