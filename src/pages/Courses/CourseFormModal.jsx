import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Modal,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

// Mock data for categories and instructors
const mockCategories = [
  { id: 1, name: 'Programming' },
  { id: 2, name: 'Web Development' },
  { id: 3, name: 'Design' },
];

const mockInstructors = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Peter Jones' },
];

export default function CourseFormModal({ open, handleClose, mode, course, onFormSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    categoryId: '',
    instructorId: '',
  });
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    setCategories(mockCategories);
    setInstructors(mockInstructors);

    if (mode === 'edit' && course) {
      setFormData({
        name: course.name || '',
        description: course.description || '',
        price: course.price || '',
        discountPrice: course.discountPrice || '',
        categoryId: course.categoryId || '',
        instructorId: course.instructorId || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        categoryId: '',
        instructorId: '',
      });
    }
  }, [mode, course]);

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

      const courseData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        instructorId: parseInt(formData.instructorId, 10),
        categoryId: parseInt(formData.categoryId, 10),
      };

      let response;
      let updatedCourse;
      if (mode === 'create') {
        response = await fetch('https://apibeta.fellow.one/api/Courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(courseData),
        });
      } else if (mode === 'edit') {
        response = await fetch(`https://apibeta.fellow.one/api/Courses/${course.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ ...courseData, id: course.id }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${mode} course.`);
      }

      // FIX for Line 117: Check if the response has a body before parsing JSON
      // This prevents the "Unexpected end of JSON input" error.
      // PUT requests often return a 204 (No Content) status.
      if (response.status !== 204) {
        updatedCourse = await response.json();
      } else {
        // If the server returns no content, we can assume success
        // and use the existing course data combined with form data.
        updatedCourse = { ...course, ...courseData };
      }

      // FIX for Line 136: This line will no longer show an error
      // because the updatedCourse variable is now correctly populated.
      onFormSubmit(updatedCourse);
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
          {mode === 'create' ? 'Add New Course' : 'Edit Course'}
        </Typography>
        {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: 10, right: 10 }} />}
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        <TextField
          name="name"
          label="Course Name"
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
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Category</InputLabel>
          <Select
            name="categoryId"
            value={formData.categoryId}
            label="Category"
            onChange={handleChange}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Instructor</InputLabel>
          <Select
            name="instructorId"
            value={formData.instructorId}
            label="Instructor"
            onChange={handleChange}
          >
            {instructors.map((instructor) => (
              <MenuItem key={instructor.id} value={instructor.id}>
                {instructor.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          name="price"
          label="Price"
          type="number"
          fullWidth
          margin="normal"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <TextField
          name="discountPrice"
          label="Discount Price"
          type="number"
          fullWidth
          margin="normal"
          value={formData.discountPrice}
          onChange={handleChange}
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