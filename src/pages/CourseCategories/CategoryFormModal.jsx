import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Modal,
  TextField,
  Button,
  CircularProgress,
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

export default function CategoryFormModal({ open, handleClose, mode, category, onFormSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [mode, category]);

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

      const categoryData = {
        name: formData.name,
        description: formData.description,
      };

      let response;
      if (mode === 'create') {
        response = await fetch('https://apibeta.fellow.one/api/CourseCategories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(categoryData),
        });
      } else if (mode === 'edit') {
        response = await fetch(`https://apibeta.fellow.one/api/CourseCategories/${category.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ ...categoryData, id: category.id }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${mode} category.`);
      }

      const updatedCategory = await response.json();
      onFormSubmit(updatedCategory);
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
          {mode === 'create' ? 'Add New Category' : 'Edit Category'}
        </Typography>
        {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: 10, right: 10 }} />}
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        <TextField
          name="name"
          label="Category Name"
          fullWidth
          margin="normal"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          name="description"
          label="Description"
          fullWidth
          margin="normal"
          value={formData.description}
          onChange={handleChange}
          required
        />
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