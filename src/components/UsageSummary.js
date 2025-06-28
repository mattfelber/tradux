import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Box, Typography, CircularProgress, LinearProgress } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const UsageSummary = () => {
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [todayCharacters, setTodayCharacters] = useState(0);
  const [loading, setLoading] = useState(true);
  const FREE_TIER_LIMIT = 500;
  
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
        } else if (todayData) {
          const todayTotal = todayData.reduce((sum, row) => sum + row.characters_processed, 0);
          setTodayCharacters(todayTotal);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsageStats();
    
    // Refresh stats every minute
    const interval = setInterval(fetchUsageStats, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Calculate free tier usage percentage
  const usagePercentage = Math.min(100, (todayCharacters / FREE_TIER_LIMIT) * 100);
  
  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 1 }}>
        <CircularProgress size={16} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      p: 1, 
      mb: 2,
      borderRadius: 1,
      bgcolor: 'background.paper',
      boxShadow: 1
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          Today's Usage: <strong>{todayCharacters}</strong> / {FREE_TIER_LIMIT}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: <strong>{totalCharacters}</strong>
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={usagePercentage} 
        color={usagePercentage > 80 ? "error" : "primary"}
        sx={{ height: 4, borderRadius: 2 }}
      />
    </Box>
  );
};

export default UsageSummary;
