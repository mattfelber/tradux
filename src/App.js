import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import TextReader from './components/TextReader';
import ApiTest from './components/ApiTest';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007AFF',
    },
    background: {
      default: '#F5F5F7',
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
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <ApiTest />
        <TextReader />
      </div>
    </ThemeProvider>
  );
}

export default App;
