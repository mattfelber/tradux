import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, Container, Box, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TextReader from './components/TextReader';
import ApiTest from './components/ApiTest';
import ThemeToggle from './components/ThemeToggle';
import UsageDashboard from './components/UsageDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthPage from './components/auth/AuthPage';
import UserProfile from './components/auth/UserProfile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has a preference saved in localStorage
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' ? true : false;
  });

  useEffect(() => {
    // Apply the theme to the document
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    // Save user preference to localStorage
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#5B9DF5' : '#007AFF',
      },
      background: {
        default: darkMode ? '#121212' : '#F5F5F7',
        paper: darkMode ? '#1E1E1E' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#E4E6EB' : '#2C3E50',
        secondary: darkMode ? '#A0AEC0' : '#5A6A7A',
      },
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    components: {
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1E1E1E' : '#ffffff',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            
            <Container maxWidth="lg">
              <Box sx={{ mt: 4 }}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<TextReader />} />
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/usage" element={<UsageDashboard />} />
                  
                  {/* Protected routes */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin" element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
            </Container>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
