import axios from 'axios';

const translateText = async (text) => {
    // Debug: Check if API key is available
    console.log('API Key available:', !!process.env.REACT_APP_RAPIDAPI_KEY);
    console.log('API Key length:', process.env.REACT_APP_RAPIDAPI_KEY?.length);

    const options = {
        method: 'GET',
        url: 'https://translated-mymemory---translation-memory.p.rapidapi.com/get',
        params: {
            langpair: 'de|en',
            q: text,
            mt: '1',
            onlyprivate: '0',
            de: 'a@b.c'
        },
        headers: {
            'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'translated-mymemory---translation-memory.p.rapidapi.com'
        }
    };

    try {
        console.log('Attempting to translate:', text);
        console.log('Request headers:', options.headers); // Debug: Check headers
        const response = await axios.request(options);
        console.log('Translation response:', response.data);
        
        if (response.data && response.data.responseData) {
            return response.data.responseData.translatedText;
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
