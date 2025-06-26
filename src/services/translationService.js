import axios from 'axios';

const translateText = async (text) => {
    // Using Google Cloud Translation API
    const apiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const options = {
        method: 'POST',
        url: url,
        data: {
            q: text,
            source: 'de',
            target: 'en',
            format: 'text'
        },
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        console.log('Attempting to translate:', text);
        const response = await axios.request(options);
        console.log('Translation response:', response.data);
        
        if (response.data && 
            response.data.data && 
            response.data.data.translations && 
            response.data.data.translations[0]) {
            return response.data.data.translations[0].translatedText;
        } else {
            console.error('Unexpected response structure:', response.data);
            return 'Translation error: Unexpected response';
        }
    } catch (error) {
        console.error('Translation error:', error.response?.data || error.message);
        return 'Translation error occurred';
    }
};

export { translateText };
