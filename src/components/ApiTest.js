import React, { useEffect } from 'react';

const ApiTest = () => {
    useEffect(() => {
        console.log('Environment variables:', {
            apiKeyExists: !!process.env.REACT_APP_RAPIDAPI_KEY,
            apiKeyLength: process.env.REACT_APP_RAPIDAPI_KEY?.length,
            nodeEnv: process.env.NODE_ENV
        });
    }, []);

    return null;
};

export default ApiTest;
