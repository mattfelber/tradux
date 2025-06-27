import React from 'react';
import { Button, Tooltip } from '@mui/material';

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
      <Button 
        onClick={toggleDarkMode} 
        color="inherit" 
        className="theme-toggle"
        aria-label="toggle dark mode"
        variant="text"
        size="small"
        sx={{ minWidth: 'auto', padding: '6px 10px', fontSize: '1.2rem' }}
      >
        {darkMode ? '☀️' : '🌙'}
      </Button>
    </Tooltip>
  );
};

export default ThemeToggle;
