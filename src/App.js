import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, Container, Box } from '@mui/material';
import TextReader from './components/TextReader';
import ApiTest from './components/ApiTest';
import ThemeToggle from './components/ThemeToggle';
import UsageDashboard from './components/UsageDashboard';
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
      <div className="App">
        <div className="theme-toggle-container" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
          <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </div>
        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}>
            <UsageDashboard />
            <ApiTest />
            <TextReader />
          </Box>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
