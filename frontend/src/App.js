import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import EmployeeList from './components/EmployeeList';
import AddEmployee from './components/AddEmployee';
import ViewEmployee from './components/ViewEmployee';
import UpdateEmployee from './components/UpdateEmployee';
import SearchEmployee from './components/SearchEmployee';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/employees"
                element={
                  <ProtectedRoute>
                    <EmployeeList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees/add"
                element={
                  <ProtectedRoute>
                    <AddEmployee />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees/view/:id"
                element={
                  <ProtectedRoute>
                    <ViewEmployee />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees/update/:id"
                element={
                  <ProtectedRoute>
                    <UpdateEmployee />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees/search"
                element={
                  <ProtectedRoute>
                    <SearchEmployee />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/employees" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
