import axios from 'axios';
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get or create a session ID
const getSessionId = () => {
    let sessionId = localStorage.getItem('tradux_session_id');
    if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem('tradux_session_id', sessionId);
    }
    return sessionId;
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
        
        // Try to list tables to debug
        console.log('Attempting to debug Supabase connection...');
        
        // Try with explicit schema
        const { data, error } = await supabase
            .from('usage_metrics')
            .insert([
                { 
                    session_id: sessionId,
                    characters_processed: charactersProcessed,
                    source_language: sourceLang,
                    target_language: targetLang
                }
            ]);
        
        // Log the full response for debugging
        console.log('Supabase response:', { data, error });
            
        if (error) {
            console.error('Supabase insert error:', error);
            
            // Try alternative table name as fallback
            console.log('Trying fallback with public.usage_metrics...');
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('public.usage_metrics')
                .insert([
                    { 
                        session_id: sessionId,
                        characters_processed: charactersProcessed,
                        source_language: sourceLang,
                        target_language: targetLang
                    }
                ]);
                
            if (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            } else {
                console.log(`Successfully tracked ${charactersProcessed} characters using fallback`, fallbackData);
            }
        } else {
            console.log(`Successfully tracked ${charactersProcessed} characters for translation`, data);
        }
    } catch (error) {
        console.error('Failed to track usage:', error);
        console.error('Error details:', error.message, error.stack);
    }
};

const translateText = async (text, sourceLang = 'auto', targetLang = 'en') => {
    // Track usage first
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
