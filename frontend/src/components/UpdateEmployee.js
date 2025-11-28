import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const UpdateEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const [existingImage, setExistingImage] = useState(null);

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeAPI.getById(id).then((res) => res.data),
    onSuccess: (data) => {
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        position: data.position || '',
        salary: data.salary?.toString() || '',
        date_of_joining: data.date_of_joining
          ? new Date(data.date_of_joining).toISOString().split('T')[0]
          : '',
        department: data.department || '',
        profile_picture: null,
      });
      if (data.profile_picture) {
        const baseUrl = process.env.REACT_APP_BACKEND_URL || 
          (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
        setExistingImage(
          data.profile_picture.startsWith('http')
            ? data.profile_picture
            : `${baseUrl}${data.profile_picture}`
        );
      }
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => employeeAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
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
      setErrorMessage(errorData?.message || 'Failed to update employee');
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
      setExistingImage(null);
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

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

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
            Update Employee
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
              {existingImage && !preview && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={existingImage}
                    alt="Current"
                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
                  />
                </Box>
              )}
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-upload-update"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="profile-picture-upload-update">
                <Button variant="outlined" component="span" sx={{ mr: 2 }}>
                  {existingImage ? 'Change Picture' : 'Upload Picture'}
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
                {mutation.isPending ? <CircularProgress size={24} /> : 'Update Employee'}
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

export default UpdateEmployee;

