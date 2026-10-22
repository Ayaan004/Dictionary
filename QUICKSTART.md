# 🚀 Quick Start Guide

## Step-by-Step Instructions

### 1️⃣ Install Python Dependencies

Open a terminal/command prompt in this folder and run:

```bash
pip install Flask flask-cors requests
```

Or use the requirements file:

```bash
pip install -r requirements.txt
```

### 2️⃣ Start the Backend Server

Run the Flask server:

```bash
python app.py
```

You should see:
```
🚀 Dictionary API Server Starting...
📚 API will be available at: http://localhost:5000
🔗 Frontend should connect to: http://localhost:5000/api

✨ Available endpoints:
   GET /api/dictionary/<word> - Get word definition
   GET /api/health - Health check
   GET /api/search?q=<query> - Search suggestions

 * Running on http://0.0.0.0:5000
```

**✅ Keep this terminal window open!**

### 3️⃣ Open the Frontend

You have two options:

#### Option A: Direct File (Simple)
Simply double-click `index.html` in your file explorer.

#### Option B: Local Server (Recommended)
Open a **NEW** terminal window and run:

```bash
python -m http.server 8000
```

Then open your browser and go to:
```
http://localhost:8000
```

### 4️⃣ Start Searching! 🎉

1. Type a word in the search box (try "hello", "serendipity", or "ephemeral")
2. Press Enter or click the Search button
3. Explore definitions, synonyms, antonyms, and examples
4. Click the speaker icon to hear pronunciation (using Text-to-Speech)
5. Click on synonym/antonym chips to search related words

## 🎨 What You'll See

- **Header**: Logo and search statistics
- **Search Box**: Large, centered search with gradient button
- **Suggestions**: Click pre-loaded word chips to try them out
- **Results**: Beautiful cards with tabs for different information
- **Tabs**: Switch between Definitions, Synonyms, Antonyms, and Examples

## 🔧 Troubleshooting

### Backend won't start?
- Make sure Python 3.8+ is installed: `python --version`
- Install dependencies: `pip install Flask flask-cors requests`
- Check if port 5000 is available

### Frontend shows errors?
- Make sure the backend is running first
- Check browser console (F12) for error messages
- Verify the API URL in `script.js` is `http://localhost:5000/api`

### Word not found?
- Try common English words first
- The API sources data from Wiktionary
- Some very rare or technical words might not be available

### No audio pronunciation?
- This API doesn't provide audio files
- The app uses browser Text-to-Speech instead
- Make sure your browser supports Web Speech API
- Chrome, Edge, Safari, and Firefox all support it

## 📚 API Information

**External API**: https://freedictionaryapi.com/
**Data Source**: Wiktionary (CC BY-SA 4.0)
**Format**: JSON
**Rate Limit**: None for personal use

## 🎯 Features to Try

1. Search "hello" - See multiple definitions and many synonyms
2. Search "serendipity" - Beautiful long definition
3. Search "ephemeral" - Great example of detailed pronunciation
4. Click synonyms to explore related words
5. Use the speaker button for pronunciation
6. Watch your search count increase in the header

## ⚡ Quick Commands

### Windows (PowerShell/CMD)
```bash
# Install dependencies
pip install Flask flask-cors requests

# Start backend
python app.py

# Start frontend (new terminal)
python -m http.server 8000
```

### Mac/Linux (Terminal)
```bash
# Install dependencies
pip3 install Flask flask-cors requests

# Start backend
python3 app.py

# Start frontend (new terminal)
python3 -m http.server 8000
```

## 🎊 You're Ready!

Enjoy your professional dictionary application! 📖✨

For more details, see `README.md`
