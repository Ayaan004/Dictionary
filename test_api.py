#!/usr/bin/env python3
"""
Quick test script to verify the Dictionary API is working
"""

import requests
import json

def test_api():
    """Test the dictionary API endpoint"""
    
    print("🧪 Testing Dictionary API...\n")
    
    # Test words
    test_words = ['hello', 'python', 'serendipity', 'ephemeral']
    
    for word in test_words:
        print(f"📖 Testing word: '{word}'")
        print("-" * 50)
        
        try:
            url = f"https://freedictionaryapi.com/api/v1/entries/en/{word}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Word found: {data.get('word', 'N/A')}")
                
                entries = data.get('entries', [])
                print(f"📚 Entries: {len(entries)}")
                
                if entries:
                    first_entry = entries[0]
                    print(f"🔤 Part of Speech: {first_entry.get('partOfSpeech', 'N/A')}")
                    
                    pronunciations = first_entry.get('pronunciations', [])
                    if pronunciations:
                        ipa = next((p['text'] for p in pronunciations if p.get('type') == 'ipa'), 'N/A')
                        print(f"🔊 Pronunciation: {ipa}")
                    
                    senses = first_entry.get('senses', [])
                    print(f"📝 Definitions: {len(senses)}")
                    
                    if senses:
                        print(f"💡 First definition: {senses[0].get('definition', 'N/A')[:80]}...")
                    
                    synonyms = first_entry.get('synonyms', [])
                    if synonyms:
                        print(f"🔄 Synonyms: {', '.join(synonyms[:5])}...")
                
                print("✅ SUCCESS\n")
            else:
                print(f"❌ Error: Status code {response.status_code}\n")
                
        except Exception as e:
            print(f"❌ Error: {e}\n")
    
    print("=" * 50)
    print("🎉 API testing complete!")
    print("\nYou can now start the Flask server with:")
    print("   python app.py")

if __name__ == '__main__':
    test_api()
