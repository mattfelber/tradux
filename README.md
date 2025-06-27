# 🌐 tradux - Interactive Multi-Language Translation Tool

A modern, user-friendly web application designed to help language learners read and understand texts in multiple languages with ease. Built with React and featuring real-time translations powered by Google Cloud Translation API, this tool makes reading foreign language texts more accessible and enjoyable.

![tradux Demo](demo-screenshot.png)

## ✨ Features

### 📚 Interactive Reading Experience
- **Single Word Translation**: Click on any word to see its translation instantly
- **Phrase Translation**: Select multiple words to get contextual translations of phrases or sentences
- **Smart Word Selection**: Automatically selects complete words even when clicking or selecting partially
- **Clean Interface**: Translations appear in elegant popups near the selected text
- **Language Selection**: Choose from multiple source and target languages

### 📝 Text Management
- **File Upload**: Easily upload text files in any language through drag-and-drop or file selection
- **Format Support**: Compatible with plain text (.txt) files
- **Dynamic Display**: Text is formatted for optimal readability with clear word separation

### 🎯 User Experience
- **Intuitive Design**: Modern, clean interface inspired by Apple's design principles
- **Responsive Layout**: Works seamlessly on different screen sizes
- **Smart Positioning**: Translation popups automatically position themselves to stay visible
- **Click-Away Clearing**: Translations disappear when clicking outside of words
- **Visual Feedback**: Subtle highlights and animations for better interaction feedback

### 🔄 Translation Features
- **Real-Time Translation**: Instant translations powered by Google Cloud Translation API
- **Multi-Language Support**: Translate between 100+ languages
- **Auto-Detection**: Automatically detect the source language or specify it manually
- **Context-Aware**: Different handling for single words vs. phrases
- **Error Handling**: Graceful handling of translation errors with user feedback

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/mattfelber/tradux.git
   ```

2. Install dependencies:
   ```bash
   cd tradux
   npm install
   ```

3. Set up your Google Cloud Translation API key:
   - Create a Google Cloud account at [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Cloud Translation API
   - Create an API key in the Credentials section
   - Create a `.env` file in the root directory
   - Add your API key:
     ```
     REACT_APP_GOOGLE_TRANSLATE_API_KEY=your_google_api_key_here
     ```
   - **Important**: Restart the development server after changing the `.env` file

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Technical Stack

- **Frontend**: React.js
- **UI Components**: Material-UI
- **Styling**: CSS with custom variables for theming
- **Translation**: Google Cloud Translation API
- **HTTP Client**: Axios for API requests

## 📖 How to Use

1. **Select Languages**:
   - Choose your source language (or use Auto-detect)
   - Choose your target language

2. **Upload Text**:
   - Drag and drop a text file in any language onto the upload area
   - Or click to select a file from your computer

3. **Get Word Translations**:
   - Click any word to see its translation in your chosen target language
   - Translation appears in a popup above or below the word

3. **Get Phrase Translations**:
   - Click and drag to select multiple words
   - The translation appears for the entire selected phrase
   - Selection automatically expands to include complete words

4. **Clear Translations**:
   - Click anywhere outside of words to clear current translations
   - Start a new selection to clear previous translations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Translation services provided by MyMemory via RapidAPI
- UI design inspired by modern reading applications
- Special thanks to the React and Material-UI teams

---

Made with ❤️ for language learners
