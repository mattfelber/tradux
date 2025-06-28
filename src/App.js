import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, Container, Box, AppBar, Toolbar, Typography, Button, Tabs, Tab } from '@mui/material';
import TextReader from './components/TextReader';
import ApiTest from './components/ApiTest';
import ThemeToggle from './components/ThemeToggle';
import UsageDashboard from './components/UsageDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has a preference saved in localStorage
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' ? true : false;
  });
  
  // State for admin mode and tab navigation
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentTab, setCurrentTab] = useState('translator');

  useEffect(() => {
    // Apply the theme to the document
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    // Save user preference to localStorage
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
  };
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
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
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Tradux
            </Typography>
            <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <Button 
              color={isAdminMode ? "primary" : "inherit"}
              onClick={toggleAdminMode}
              sx={{ ml: 2 }}
            >
              {isAdminMode ? "Exit Admin" : "Admin Mode"}
            </Button>
          </Toolbar>
          
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Translator" value="translator" />
            <Tab label="Usage" value="usage" />
            {isAdminMode && <Tab label="Admin Dashboard" value="admin" />}
          </Tabs>
        </AppBar>
        
        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}>
            {currentTab === 'translator' && <TextReader />}
            {currentTab === 'usage' && <UsageDashboard />}
            {currentTab === 'admin' && isAdminMode && <AdminDashboard />}
          </Box>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
