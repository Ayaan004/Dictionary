from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from typing import Dict, List, Optional

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# External Dictionary API
DICTIONARY_API_URL = "https://freedictionaryapi.com/api/v1/entries/en/"


class DictionaryService:
    """Service to interact with dictionary API and process data"""

    @staticmethod
    def fetch_word_data(word: str) -> Optional[Dict]:
        """
        Fetch word data from external dictionary API
        
        Args:
            word: The word to look up
            
        Returns:
            Processed dictionary data or None if not found
        """
        try:
            response = requests.get(f"{DICTIONARY_API_URL}{word}", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                return DictionaryService.process_word_data(data)
            else:
                return None
                
        except requests.RequestException as e:
            print(f"Error fetching word data: {e}")
            return None

    @staticmethod
    def process_word_data(raw_data: Dict) -> Dict:
        """
        Process raw API data into structured format
        
        Args:
            raw_data: Raw data from dictionary API
            
        Returns:
            Processed dictionary data
        """
        word = raw_data.get('word', '')
        entries = raw_data.get('entries', [])
        
        # Extract phonetic (IPA format preferred)
        phonetic = ''
        if entries and entries[0].get('pronunciations'):
            pronunciations = entries[0]['pronunciations']
            # Try to get IPA pronunciation
            for p in pronunciations:
                if p.get('type') == 'ipa' and p.get('text'):
                    phonetic = p['text']
                    break
        
        # Audio is not provided by this API
        audio = ''
        
        # Extract meanings
        meanings = []
        all_synonyms = set()
        all_antonyms = set()
        all_examples = []
        
        for entry in entries:
            part_of_speech = entry.get('partOfSpeech', '')
            senses = entry.get('senses', [])
            definitions = []
            
            for sense in senses[:5]:  # Limit to 5 definitions per part of speech
                def_text = sense.get('definition', '')
                examples = sense.get('examples', [])
                example = examples[0] if examples else ''
                
                definitions.append({
                    'definition': def_text,
                    'example': example
                })
                
                # Collect all examples
                all_examples.extend(examples[:3])
                
                # Collect synonyms and antonyms from quotes
                if sense.get('synonyms'):
                    all_synonyms.update(sense['synonyms'][:10])
                if sense.get('antonyms'):
                    all_antonyms.update(sense['antonyms'][:10])
            
            # Get entry-level synonyms and antonyms
            if entry.get('synonyms'):
                all_synonyms.update(entry['synonyms'][:15])
            if entry.get('antonyms'):
                all_antonyms.update(entry['antonyms'][:15])
            
            if definitions:  # Only add if there are definitions
                meanings.append({
                    'partOfSpeech': part_of_speech,
                    'definitions': definitions
                })
        
        return {
            'word': word,
            'phonetic': phonetic,
            'audio': audio,
            'meanings': meanings,
            'synonyms': list(all_synonyms)[:25],  # Limit to 25 synonyms
            'antonyms': list(all_antonyms)[:25],  # Limit to 25 antonyms
            'examples': all_examples[:15]  # Limit to 15 examples
        }


@app.route('/')
def home():
    """Home endpoint with API information"""
    return jsonify({
        'service': 'Dictionary API',
        'version': '1.0.0',
        'endpoints': {
            '/api/dictionary/<word>': 'Get dictionary definition for a word',
            '/api/health': 'Health check endpoint'
        }
    })


@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Dictionary API'
    })


@app.route('/api/dictionary/<word>')
def get_word_definition(word: str):
    """
    Get dictionary definition for a word
    
    Args:
        word: The word to look up
        
    Returns:
        JSON response with word data or error message
    """
    if not word or not word.strip():
        return jsonify({
            'success': False,
            'message': 'Please provide a valid word'
        }), 400
    
    word = word.strip().lower()
    
    # Fetch word data
    word_data = DictionaryService.fetch_word_data(word)
    
    if word_data:
        return jsonify({
            'success': True,
            'data': word_data
        })
    else:
        return jsonify({
            'success': False,
            'message': f'Word "{word}" not found in dictionary'
        }), 404


@app.route('/api/search')
def search_words():
    """
    Search for words (placeholder for future autocomplete feature)
    
    Query params:
        q: Search query
        
    Returns:
        JSON response with search suggestions
    """
    query = request.args.get('q', '').strip().lower()
    
    if not query:
        return jsonify({
            'success': False,
            'message': 'Please provide a search query'
        }), 400
    
    # Placeholder suggestions (in production, you'd have a word database)
    suggestions = [
        'hello', 'world', 'python', 'programming', 'dictionary',
        'definition', 'example', 'synonym', 'antonym', 'language'
    ]
    
    filtered = [word for word in suggestions if query in word]
    
    return jsonify({
        'success': True,
        'query': query,
        'suggestions': filtered[:10]
    })


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500


if __name__ == '__main__':
    print("🚀 Dictionary API Server Starting...")
    print("📚 API will be available at: http://localhost:5000")
    print("🔗 Frontend should connect to: http://localhost:5000/api")
    print("\n✨ Available endpoints:")
    print("   GET /api/dictionary/<word> - Get word definition")
    print("   GET /api/health - Health check")
    print("   GET /api/search?q=<query> - Search suggestions")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
