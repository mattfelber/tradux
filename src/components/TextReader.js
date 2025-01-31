import React, { useState, useRef, useEffect } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { translateText } from '../services/translationService';

const TextReader = () => {
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState(null);
  const [selectionTranslation, setSelectionTranslation] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownTime, setMouseDownTime] = useState(0);
  const textRef = useRef(null);
  const translationTimeoutRef = useRef(null);

  const calculatePosition = (rect) => {
    const margin = 10;
    const minSpaceNeeded = 60;
    const x = rect.left + (rect.width / 2);
    let y = rect.top - margin;
    
    if (rect.top < minSpaceNeeded) {
      y = rect.bottom + margin;
    }

    return { x, y };
  };

  const expandSelectionToWords = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const text = range.toString().trim();
    if (!text) return null;

    // Get the start and end containers
    let startNode = range.startContainer;
    let endNode = range.endContainer;

    // If we're inside a text node, move up to the parent span
    if (startNode.nodeType === Node.TEXT_NODE) {
      startNode = startNode.parentNode;
    }
    if (endNode.nodeType === Node.TEXT_NODE) {
      endNode = endNode.parentNode;
    }

    // If either node is not a word span, return null
    if (!startNode.classList?.contains('word') || !endNode.classList?.contains('word')) {
      return null;
    }

    // Create a new range that encompasses the whole words
    const newRange = document.createRange();
    newRange.setStartBefore(startNode);
    newRange.setEndAfter(endNode);

    // Update the selection
    selection.removeAllRanges();
    selection.addRange(newRange);

    return {
      text: newRange.toString().trim(),
      range: newRange
    };
  };

  const handleTextSelection = async () => {
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }

    translationTimeoutRef.current = setTimeout(async () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      // Clear translations if no text is selected
      if (!selectedText) {
        clearTranslations();
        return;
      }

      // If it's just a single word click, don't show selection translation
      if (!isDragging && selectedText.split(/\s+/).length === 1) {
        return;
      }

      const expandedSelection = expandSelectionToWords();
      if (!expandedSelection) {
        setSelectionTranslation(null);
        return;
      }

      const { text, range } = expandedSelection;
      
      if (text) {
        setTranslation(null);
        setIsLoading(true);
        
        const rect = range.getBoundingClientRect();
        const position = calculatePosition(rect);
        setSelectionPosition(position);

        try {
          const translatedText = await translateText(text);
          setSelectionTranslation(translatedText);
        } catch (error) {
          console.error('Translation error:', error);
          setSelectionTranslation('Translation error occurred');
        } finally {
          setIsLoading(false);
        }
      }
    }, 300);
  };

  const handleWordClick = async (event, word) => {
    event.stopPropagation();
    setSelectionTranslation(null);
    setIsLoading(true);
    
    const rect = event.target.getBoundingClientRect();
    const position = calculatePosition(rect);
    setPopupPosition(position);

    try {
      const translatedText = await translateText(word);
      setTranslation(translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslation('Translation error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderWords = (text) => {
    return text.split(/(\s+)/).map((word, index) => {
      if (word.trim() === '') return word;
      return (
        <span
          key={index}
          className="word"
          onMouseDown={(e) => {
            e.stopPropagation();
            setMouseDownTime(Date.now());
            setIsDragging(false);
          }}
          onMouseMove={() => {
            if (mouseDownTime > 0) {
              setIsDragging(true);
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!isDragging) {
              e.preventDefault();
              const range = document.createRange();
              range.selectNodeContents(e.target);
              const selection = window.getSelection();
              selection.removeAllRanges();
              selection.addRange(range);
              handleWordClick(e, word.trim());
            }
            setMouseDownTime(0);
            setIsDragging(false);
          }}
        >
          {word}
        </span>
      );
    });
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setText(e.target.result);
      setTranslation(null);
      setSelectionTranslation(null);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const clearTranslations = () => {
    setTranslation(null);
    setSelectionTranslation(null);
  };

  useEffect(() => {
    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="reader-container" onClick={clearTranslations}>
      <div className="app-header" onClick={(e) => e.stopPropagation()}>
        <Typography variant="h1" className="app-title">
          German Reader
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Click words for translations or select text for phrase translations
        </Typography>
      </div>

      <div
        className={`upload-section ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <div className="upload-icon">📄</div>
        <label htmlFor="file-upload">
          <Typography variant="h6" color="primary" style={{ cursor: 'pointer' }}>
            Drop your German text file here
          </Typography>
          <Typography variant="body2" color="textSecondary">
            or click to upload
          </Typography>
        </label>
      </div>

      <Paper
        ref={textRef}
        elevation={0}
        onMouseUp={handleTextSelection}
        className="text-content"
        onClick={(e) => {
          // Only clear if clicking directly on the Paper (not on a word)
          if (e.target === e.currentTarget) {
            clearTranslations();
          }
        }}
      >
        {text ? renderWords(text) : (
          <Typography variant="body1" color="textSecondary" align="center">
            Your German text will appear here
          </Typography>
        )}
      </Paper>

      {(translation || isLoading) && (
        <div
          className="translation-container"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="translation-popup">
            {isLoading ? (
              <CircularProgress size={20} className="loading-spinner" />
            ) : (
              <Typography variant="body1">{translation}</Typography>
            )}
          </div>
        </div>
      )}

      {selectionTranslation && (
        <div
          className="translation-container"
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="selection-translation">
            <Typography variant="body1">
              <strong>Translation:</strong> {selectionTranslation}
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextReader;
