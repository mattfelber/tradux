import React, { useState } from 'react';
import { Container, Box } from '@mui/material';
import Login from './Login';
import SignUp from './SignUp';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        {isLogin ? (
          <Login onToggleForm={toggleForm} />
        ) : (
          <SignUp onToggleForm={toggleForm} />
        )}
      </Box>
    </Container>
  );
};

export default AuthPage;
