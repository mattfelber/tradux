import axios from 'axios';

const translateText = async (text, sourceLang = 'auto', targetLang = 'en') => {
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
