import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Container, Typography, Grid, Paper, Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, MenuItem, Select, FormControl, InputLabel, Chip, CircularProgress, Card, CardContent, Divider, Alert } from '@mui/material';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';

const AdminDashboard = () => {
  // State for usage statistics
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [todayCharacters, setTodayCharacters] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [topLanguages, setTopLanguages] = useState([]);
  const [recentTranslations, setRecentTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for filters
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  
  // Language options
  const languageOptions = [
    { code: '', name: 'All Languages' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
  ];

  useEffect(() => {
    fetchUsageStats();
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchUsageStats, 300000);
    return () => clearInterval(interval);
  }, [startDate, endDate, sourceLanguage, targetLanguage]);

  const fetchUsageStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if supabase client is available
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      // Prepare date filters
      let startDateFilter = startDate ? new Date(startDate) : null;
      let endDateFilter = endDate ? new Date(endDate) : null;
      
      if (endDateFilter) {
        // Set end date to end of day
        endDateFilter.setHours(23, 59, 59, 999);
      }
      
      // Base query for total characters
      let query = supabase
        .from('usage_metrics')
        .select('characters_processed');
      
      // Apply filters if they exist
      if (startDateFilter) {
        query = query.gte('created_at', startDateFilter.toISOString());
      }
      
      if (endDateFilter) {
        query = query.lte('created_at', endDateFilter.toISOString());
      }
      
      if (sourceLanguage) {
        query = query.eq('source_language', sourceLanguage);
      }
      
      if (targetLanguage) {
        query = query.eq('target_language', targetLanguage);
      }
      
      // Execute query
      const { data: totalData, error: totalError } = await query;
      
      if (totalError) {
        throw new Error(`Error fetching total usage: ${totalError.message}`);
      }
      
      // Calculate total characters
      const total = totalData ? totalData.reduce((sum, row) => sum + row.characters_processed, 0) : 0;
      setTotalCharacters(total);
      
      // Get today's usage
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayData, error: todayError } = await supabase
        .from('usage_metrics')
        .select('characters_processed')
        .gte('created_at', today.toISOString());
      
      if (todayError) {
        throw new Error(`Error fetching today's usage: ${todayError.message}`);
      }
      
      // Calculate today's characters
      const todayTotal = todayData ? todayData.reduce((sum, row) => sum + row.characters_processed, 0) : 0;
      setTodayCharacters(todayTotal);
      
      // Get unique sessions count
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('usage_metrics')
        .select('session_id')
        .limit(1000);  // Limit to avoid excessive data
      
      if (sessionsError) {
        throw new Error(`Error fetching sessions: ${sessionsError.message}`);
      }
      
      // Count unique sessions
      const uniqueSessions = sessionsData ? new Set(sessionsData.map(item => item.session_id)).size : 0;
      setTotalSessions(uniqueSessions);
      
      // Get top languages
      const { data: languagesData, error: languagesError } = await supabase
        .from('usage_metrics')
        .select('target_language, characters_processed');
      
      if (languagesError) {
        throw new Error(`Error fetching language data: ${languagesError.message}`);
      }
      
      // Aggregate by language
      const languageCounts = {};
      if (languagesData) {
        languagesData.forEach(item => {
          const lang = item.target_language || 'unknown';
          if (!languageCounts[lang]) {
            languageCounts[lang] = 0;
          }
          languageCounts[lang] += item.characters_processed;
        });
      }
      
      // Convert to array and sort
      const topLangs = Object.entries(languageCounts)
        .map(([lang, count]) => ({ lang, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setTopLanguages(topLangs);
      
      // Get recent translations
      const { data: recentData, error: recentError } = await supabase
        .from('usage_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (recentError) {
        throw new Error(`Error fetching recent translations: ${recentError.message}`);
      }
      
      setRecentTranslations(recentData || []);
      
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterApply = () => {
    fetchUsageStats();
  };

  const handleFilterReset = () => {
    setStartDate(null);
    setEndDate(null);
    setSourceLanguage('');
    setTargetLanguage('');
  };

  const getLanguageName = (code) => {
    const language = languageOptions.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  if (loading && !recentTranslations.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setStartDate(parseISO(e.target.value));
                } else {
                  setStartDate(null);
                }
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="End Date"
              type="date"
              value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setEndDate(parseISO(e.target.value));
                } else {
                  setEndDate(null);
                }
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Source Language</InputLabel>
              <Select
                value={sourceLanguage}
                label="Source Language"
                onChange={(e) => setSourceLanguage(e.target.value)}
              >
                {languageOptions.map((lang) => (
                  <MenuItem key={`source-${lang.code}`} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Target Language</InputLabel>
              <Select
                value={targetLanguage}
                label="Target Language"
                onChange={(e) => setTargetLanguage(e.target.value)}
              >
                {languageOptions.map((lang) => (
                  <MenuItem key={`target-${lang.code}`} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleFilterApply}
                fullWidth
              >
                Apply
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleFilterReset}
                fullWidth
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Characters Processed
              </Typography>
              <Typography variant="h4">
                {totalCharacters.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Today's Usage
              </Typography>
              <Typography variant="h4">
                {todayCharacters.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Sessions
              </Typography>
              <Typography variant="h4">
                {totalSessions.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Avg. Characters Per Session
              </Typography>
              <Typography variant="h4">
                {totalSessions ? Math.round(totalCharacters / totalSessions).toLocaleString() : '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Top Languages */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Top Target Languages
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Language</TableCell>
                <TableCell align="right">Characters</TableCell>
                <TableCell align="right">Percentage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topLanguages.map((lang) => (
                <TableRow key={lang.lang}>
                  <TableCell>{getLanguageName(lang.lang)}</TableCell>
                  <TableCell align="right">{lang.count.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    {totalCharacters ? `${Math.round((lang.count / totalCharacters) * 100)}%` : '0%'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Recent Translations */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Translations
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Session ID</TableCell>
                <TableCell>Characters</TableCell>
                <TableCell>Source Language</TableCell>
                <TableCell>Target Language</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTranslations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.session_id.substring(0, 8)}...</TableCell>
                    <TableCell>{row.characters_processed}</TableCell>
                    <TableCell>{getLanguageName(row.source_language)}</TableCell>
                    <TableCell>{getLanguageName(row.target_language)}</TableCell>
                    <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={recentTranslations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
