import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignOut = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await signOut();
      
      if (error) {
        throw error;
      }
      
      // Redirect handled by AuthContext
    } catch (error) {
      setError(error.message || 'Failed to sign out');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="h6">Not logged in</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        User Profile
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <List>
        <ListItem>
          <ListItemText primary="Email" secondary={user.email} />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Account Type" 
            secondary={user.user_metadata?.premium ? "Premium" : "Free"} 
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Account Created" 
            secondary={new Date(user.created_at).toLocaleDateString()} 
          />
        </ListItem>
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          component="a"
          href="/"
        >
          Back to Translator
        </Button>
        
        <Button
          variant="outlined"
          color="error"
          onClick={handleSignOut}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign Out'}
        </Button>
      </Box>
    </Paper>
  );
};

export default UserProfile;
