import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Box, Card, CardContent, Typography, CircularProgress, Grid, Alert } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const UsageDashboard = () => {
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [todayCharacters, setTodayCharacters] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Function to get or create session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('tradux_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('tradux_session_id', sessionId);
    }
    return sessionId;
  };
  
  useEffect(() => {
    const fetchUsageStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get session ID
        const sessionId = getSessionId();
        
        // Get total usage for this session
        const { data: totalData, error: totalError } = await supabase
          .from('usage_metrics')
          .select('characters_processed')
          .eq('session_id', sessionId);
          
        if (totalError) {
          console.error('Error fetching total usage:', totalError);
          setError('Failed to fetch usage data. Please try again later.');
        } else if (totalData) {
          const total = totalData.reduce((sum, row) => sum + row.characters_processed, 0);
          setTotalCharacters(total);
        }
        
        // Get today's usage
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: todayData, error: todayError } = await supabase
          .from('usage_metrics')
          .select('characters_processed')
          .eq('session_id', sessionId)
          .gte('created_at', today.toISOString());
          
        if (todayError) {
          console.error('Error fetching today usage:', todayError);
          if (!error) {
            setError('Failed to fetch today\'s usage data. Please try again later.');
          }
        } else if (todayData) {
          const todayTotal = todayData.reduce((sum, row) => sum + row.characters_processed, 0);
          setTodayCharacters(todayTotal);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsageStats();
    
    // Refresh stats every minute
    const interval = setInterval(fetchUsageStats, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Calculate free tier usage percentage (assuming 500 chars free limit)
  const FREE_TIER_LIMIT = 500;
  const usagePercentage = Math.min(100, (todayCharacters / FREE_TIER_LIMIT) * 100);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Your Translation Usage
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Today's Usage
              </Typography>
              <Typography variant="h4">
                {todayCharacters} / {FREE_TIER_LIMIT}
              </Typography>
              <Typography color="text.secondary">
                characters ({usagePercentage.toFixed(1)}% of free tier)
              </Typography>
              {usagePercentage > 80 && (
                <Typography color="error" sx={{ mt: 1 }}>
                  You're approaching your free tier limit!
                </Typography>
              )}
              {usagePercentage >= 100 && (
                <Typography color="error" sx={{ mt: 1 }}>
                  You've reached your daily free tier limit. Sign up for a premium account for unlimited translations.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Usage
              </Typography>
              <Typography variant="h4">
                {totalCharacters}
              </Typography>
              <Typography color="text.secondary">
                characters translated
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UsageDashboard;
