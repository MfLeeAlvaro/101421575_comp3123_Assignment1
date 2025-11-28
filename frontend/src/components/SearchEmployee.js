import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Avatar,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Search as SearchIcon } from '@mui/icons-material';
import { employeeAPI } from '../services/api';

const SearchEmployee = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    department: '',
    position: '',
  });
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { data: employees = [], isLoading, error, refetch } = useQuery({
    queryKey: ['employees', 'search', searchParams],
    queryFn: () => employeeAPI.search(searchParams).then((res) => res.data),
    enabled: false, // Don't run automatically
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    if (!searchParams.department && !searchParams.position) {
      alert('Please enter at least one search criteria (department or position)');
      return;
    }
    setSearchTriggered(true);
    refetch();
  };

  const getImageUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith('http')) return profilePicture;
    const baseUrl = process.env.REACT_APP_BACKEND_URL || 
      (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
    return `${baseUrl}${profilePicture}`;
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
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/employees')}
          sx={{ mb: 2 }}
        >
          Back to Employee List
        </Button>

        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Search Employees
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Search employees by department or position
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              select
              label="Department"
              name="department"
              value={searchParams.department}
              onChange={handleChange}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Position"
              name="position"
              value={searchParams.position}
              onChange={handleChange}
            >
              <MenuItem value="">All Positions</MenuItem>
              {positions.map((pos) => (
                <MenuItem key={pos} value={pos}>
                  {pos}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ minWidth: 150 }}
            >
              Search
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.response?.data?.message || 'Failed to search employees'}
          </Alert>
        )}

        {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        )}

        {searchTriggered && !isLoading && (
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Search Results ({employees.length} found)
            </Typography>
            {employees.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No employees found matching the search criteria.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Profile</TableCell>
                      <TableCell>First Name</TableCell>
                      <TableCell>Last Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Salary</TableCell>
                      <TableCell>Date of Joining</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.employee_id} hover>
                        <TableCell>
                          <Avatar
                            src={getImageUrl(employee.profile_picture)}
                            alt={`${employee.first_name} ${employee.last_name}`}
                          >
                            {employee.first_name[0]}{employee.last_name[0]}
                          </Avatar>
                        </TableCell>
                        <TableCell>{employee.first_name}</TableCell>
                        <TableCell>{employee.last_name}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>${employee.salary?.toLocaleString()}</TableCell>
                        <TableCell>
                          {new Date(employee.date_of_joining).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default SearchEmployee;

