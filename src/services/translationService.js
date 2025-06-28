import axios from 'axios';
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Constants
const FREE_TIER_LIMIT = 500; // 500 characters per day for anonymous users

// Helper function to get or create a session ID
const getSessionId = () => {
    let sessionId = localStorage.getItem('tradux_session_id');
    if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem('tradux_session_id', sessionId);
    }
    return sessionId;
};

// Check if user has exceeded their daily limit
const checkDailyLimit = async (textLength) => {
    const sessionId = getSessionId();
    
    try {
        // Check if supabase client is available
        if (!supabase) {
            console.error('Supabase client is not initialized');
            return { allowed: true, remaining: FREE_TIER_LIMIT }; // Default to allowing if we can't check
        }
        
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Query for today's usage
        const { data, error } = await supabase
            .from('usage_metrics')
            .select('characters_processed')
            .eq('session_id', sessionId)
            .gte('created_at', today.toISOString());
        
        if (error) {
            console.error('Error checking usage limit:', error);
            return { allowed: true, remaining: FREE_TIER_LIMIT }; // Default to allowing if query fails
        }
        
        // Calculate total usage today
        const todayUsage = data ? data.reduce((sum, row) => sum + row.characters_processed, 0) : 0;
        const remaining = Math.max(0, FREE_TIER_LIMIT - todayUsage);
        
        // Check if adding the new text would exceed the limit
        const wouldExceedLimit = todayUsage + textLength > FREE_TIER_LIMIT;
        
        return {
            allowed: !wouldExceedLimit,
            remaining: remaining,
            todayUsage: todayUsage
        };
    } catch (error) {
        console.error('Error in checkDailyLimit:', error);
        return { allowed: true, remaining: FREE_TIER_LIMIT }; // Default to allowing on error
    }
};

// Track usage in Supabase
const trackUsage = async (text, sourceLang, targetLang) => {
    const sessionId = getSessionId();
    const charactersProcessed = text.length;
    
    console.log('Attempting to track usage with Supabase...');
    console.log('Session ID:', sessionId);
    console.log('Characters:', charactersProcessed);
    console.log('Source language:', sourceLang);
    console.log('Target language:', targetLang);
    
    try {
        // Check if supabase client is available
        if (!supabase) {
            console.error('Supabase client is not initialized');
            return;
        }
        
        // Insert with all required fields including user_id as null for anonymous users
        const { data, error } = await supabase
            .from('usage_metrics')
            .insert([
                { 
                    session_id: sessionId,
                    user_id: null, // Set to null for anonymous users
                    characters_processed: charactersProcessed,
                    source_language: sourceLang,
                    target_language: targetLang
                }
            ]);
        
        // Log the response for debugging
        console.log('Supabase response:', { data, error });
            
        if (error) {
            console.error('Supabase insert error:', error);
        } else {
            console.log(`Successfully tracked ${charactersProcessed} characters for translation`, data);
        }
    } catch (error) {
        console.error('Failed to track usage:', error);
        console.error('Error details:', error.message, error.stack);
    }
};

const translateText = async (text, sourceLang = 'auto', targetLang = 'en') => {
    // Check daily limit before translation
    const limitCheck = await checkDailyLimit(text.length);
    
    // If user has exceeded their daily limit, return an error
    if (!limitCheck.allowed) {
        console.log('Daily character limit exceeded:', limitCheck);
        return { 
            translatedText: null,
            error: 'Daily character limit exceeded',
            limitExceeded: true,
            usage: {
                todayUsage: limitCheck.todayUsage,
                remaining: limitCheck.remaining,
                limit: FREE_TIER_LIMIT
            }
        };
    }
    
    // Track usage for this translation
    await trackUsage(text, sourceLang, targetLang);
    
    // Using Google Cloud Translation API
    const apiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;
    
    // Check if API key is available without logging sensitive information
    if (!apiKey) {
        console.error('Translation API key is not configured');
        return { translatedText: 'Error: Translation service not properly configured' };
    }
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const options = {
        method: 'POST',
        url: url,
        data: {
            q: text,
            target: targetLang,
            format: 'text'
        },
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    // Only add source if it's not set to auto-detect
    if (sourceLang !== 'auto') {
        options.data.source = sourceLang;
    }

    try {
        console.log('Attempting to translate:', text);
        console.log('Source language:', sourceLang);
        console.log('Target language:', targetLang);
        
        const response = await axios.request(options);
        console.log('Translation response:', response.data);
        
        if (response.data && 
            response.data.data && 
            response.data.data.translations && 
            response.data.data.translations[0]) {
            
            // Return both the translated text and detected source language (if available)
            const result = {
                translatedText: response.data.data.translations[0].translatedText,
                detectedSourceLanguage: response.data.data.translations[0].detectedSourceLanguage
            };
            
            return result;
        } else {
            console.error('Unexpected response structure:', response.data);
            return { translatedText: 'Translation error: Unexpected response' };
        }
    } catch (error) {
        console.error('Translation error:', error.response?.data || error.message);
        return { translatedText: 'Translation error occurred' };
    }
};

export { translateText };
