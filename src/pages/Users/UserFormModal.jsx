import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Modal,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function UserFormModal({ open, handleClose, mode, user, onFormSubmit }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    roleId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for roles, replace with an API call if available
  const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Instructor' },
    { id: 3, name: 'Student' },
  ];

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        password: '', // Password is not returned from API, should be handled separately
        roleId: user.roleId || '',
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        roleId: '',
      });
    }
  }, [mode, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        roleId: parseInt(formData.roleId, 10),
      };

      let response;
      if (mode === 'create') {
        if (!formData.password) {
          throw new Error('Password is required to create a new user.');
        }
        userData.password = formData.password;
        
        response = await fetch('https://localhost:59244/api/Users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });
      } else if (mode === 'edit') {
        userData.userId = user.userId;
        if (formData.password) {
          userData.password = formData.password;
        }

        response = await fetch(`https://localhost:59244/api/Users/${user.userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${mode} user.`);
      }

      const updatedUser = await response.json();
      onFormSubmit(updatedUser);
      handleClose();
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2" mb={2}>
          {mode === 'create' ? 'Add New User' : 'Edit User'}
        </Typography>
        {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: 10, right: 10 }} />}
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        <TextField
          name="fullName"
          label="Full Name"
          fullWidth
          margin="normal"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={handleChange}
          required={mode === 'create'}
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Role</InputLabel>
          <Select
            name="roleId"
            value={formData.roleId}
            label="Role"
            onChange={handleChange}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}