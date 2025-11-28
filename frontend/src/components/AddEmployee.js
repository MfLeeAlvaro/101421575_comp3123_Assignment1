import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { employeeAPI } from '../services/api';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    salary: '',
    date_of_joining: '',
    department: '',
    profile_picture: null,
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [preview, setPreview] = useState(null);

  const mutation = useMutation({
    mutationFn: (data) => employeeAPI.create(data),
    onSuccess: () => {
      navigate('/employees');
    },
    onError: (error) => {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        const fieldErrors = {};
        errorData.errors.forEach((err) => {
          if (err.param) {
            fieldErrors[err.param] = err.msg;
          }
        });
        setErrors(fieldErrors);
      }
      setErrorMessage(errorData?.message || 'Failed to create employee');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setErrorMessage('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profile_picture: 'File size must be less than 5MB',
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, profile_picture: file }));
      setPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, profile_picture: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.salary) {
      newErrors.salary = 'Salary is required';
    } else if (isNaN(formData.salary) || parseFloat(formData.salary) < 0) {
      newErrors.salary = 'Salary must be a positive number';
    }
    if (!formData.date_of_joining) {
      newErrors.date_of_joining = 'Date of joining is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!validate()) return;

    mutation.mutate(formData);
  };

  const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Engineering'];
  const positions = [
    'Manager',
    'Developer',
    'Designer',
    'Analyst',
    'Coordinator',
    'Director',
    'Engineer',
    'Specialist',
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/employees')}
          sx={{ mb: 2 }}
        >
          Back to Employee List
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Add New Employee
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={!!errors.first_name}
                helperText={errors.first_name}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={!!errors.last_name}
                helperText={errors.last_name}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              required
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
              <TextField
                fullWidth
                select
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                error={!!errors.position}
                helperText={errors.position}
                required
              >
                {positions.map((pos) => (
                  <MenuItem key={pos} value={pos}>
                    {pos}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                error={!!errors.department}
                helperText={errors.department}
                required
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                error={!!errors.salary}
                helperText={errors.salary}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                fullWidth
                label="Date of Joining"
                name="date_of_joining"
                type="date"
                value={formData.date_of_joining}
                onChange={handleChange}
                error={!!errors.date_of_joining}
                helperText={errors.date_of_joining}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>

            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Profile Picture (Optional)
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="profile-picture-upload">
                <Button variant="outlined" component="span" sx={{ mr: 2 }}>
                  Upload Picture
                </Button>
              </label>
              {preview && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
                  />
                </Box>
              )}
              {errors.profile_picture && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                  {errors.profile_picture}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={mutation.isPending}
                fullWidth
              >
                {mutation.isPending ? <CircularProgress size={24} /> : 'Add Employee'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/employees')}
                fullWidth
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddEmployee;

