// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const results = document.getElementById('results');
const wordTitle = document.getElementById('wordTitle');
const phonetic = document.getElementById('phonetic');
const audioBtn = document.getElementById('audioBtn');
const meaningsContainer = document.getElementById('meaningsContainer');
const synonymsList = document.getElementById('synonymsList');
const antonymsList = document.getElementById('antonymsList');
const examplesList = document.getElementById('examplesList');
const meaningSummary = document.getElementById('meaningSummary');
const wordCount = document.getElementById('wordCount');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');
const closeModal = document.getElementById('closeModal');
const historyList = document.getElementById('historyList');
const emptyHistory = document.getElementById('emptyHistory');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const resetBtn = document.getElementById('resetBtn');

// State
let currentAudio = null;
let searchCount = parseInt(localStorage.getItem('searchCount')) || 0;
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Initialize
updateSearchCount();
showSuggestions();

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

audioBtn.addEventListener('click', playAudio);

historyBtn.addEventListener('click', openHistoryModal);
closeModal.addEventListener('click', closeHistoryModal);
clearHistoryBtn.addEventListener('click', clearHistory);
resetBtn.addEventListener('click', resetSearchCount);

// Close modal when clicking outside
historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
        closeHistoryModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && historyModal.classList.contains('active')) {
        closeHistoryModal();
    }
});

// Functions
async function handleSearch() {
    const word = searchInput.value.trim().toLowerCase();
    
    if (!word) {
        showError('Please enter a word to search');
        return;
    }

    showLoading();
    hideError();
    hideResults();

    try {
        const response = await fetch(`${API_BASE_URL}/dictionary/${word}`);
        const data = await response.json();

        if (response.ok && data.success) {
            displayResults(data.data);
            incrementSearchCount();
            // Get first definition for history
            const firstDef = data.data.meanings?.[0]?.definitions?.[0]?.definition || '';
            addToHistory(word, firstDef);
        } else {
            showError(data.message || 'Word not found. Please try another search.');
        }
    } catch (error) {
        console.error('Error fetching dictionary data:', error);
        showError('Unable to connect to the dictionary service. Please try again.');
    } finally {
        hideLoading();
    }
}

function displayResults(data) {
    // Set word title and phonetic
    wordTitle.textContent = data.word;
    phonetic.textContent = data.phonetic || '';

    // Store audio URL - show button even without URL for speech synthesis fallback
    currentAudio = data.audio;
    audioBtn.style.display = 'flex';
    audioBtn.title = currentAudio ? 'Play pronunciation' : 'Speak word (Text-to-Speech)';

    // Display meaning summary
    displayMeaningSummary(data);

    // Display meanings
    displayMeanings(data.meanings);

    // Display synonyms
    displayWordList(synonymsList, data.synonyms, 'synonyms');

    // Display antonyms
    displayWordList(antonymsList, data.antonyms, 'antonyms');

    // Display examples
    displayExamples(data.examples);

    // Show results
    showResults();
}

function displayMeaningSummary(data) {
    meaningSummary.innerHTML = '';

    if (!data.meanings || data.meanings.length === 0) {
        meaningSummary.innerHTML = createEmptyState('No meaning found');
        return;
    }

    const firstMeaning = data.meanings[0];
    const firstDefinition = firstMeaning.definitions[0];
    
    // Create meaning summary card
    const titleDiv = document.createElement('div');
    titleDiv.className = 'meaning-title';
    titleDiv.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        What does "${data.word}" mean?
    `;
    
    // Part of speech
    const posDiv = document.createElement('div');
    posDiv.className = 'meaning-part-of-speech';
    posDiv.textContent = firstMeaning.partOfSpeech;
    
    // Main definition
    const textDiv = document.createElement('div');
    textDiv.className = 'meaning-text';
    textDiv.textContent = firstDefinition.definition;
    
    meaningSummary.appendChild(titleDiv);
    meaningSummary.appendChild(posDiv);
    meaningSummary.appendChild(textDiv);
    
    // Add example if available
    if (firstDefinition.example) {
        const exampleDiv = document.createElement('div');
        exampleDiv.className = 'definition-example';
        exampleDiv.style.marginTop = '16px';
        exampleDiv.textContent = `"${firstDefinition.example}"`;
        meaningSummary.appendChild(exampleDiv);
    }
    
    // Add simplified meaning
    const simpleMeaningDiv = document.createElement('div');
    simpleMeaningDiv.className = 'meaning-simple';
    
    const simpleTitle = document.createElement('div');
    simpleTitle.className = 'meaning-simple-title';
    simpleTitle.innerHTML = '💡 In Simple Terms';
    
    const simpleText = document.createElement('div');
    simpleText.className = 'meaning-simple-text';
    simpleText.textContent = generateSimpleMeaning(data.word, firstMeaning.partOfSpeech, firstDefinition.definition);
    
    simpleMeaningDiv.appendChild(simpleTitle);
    simpleMeaningDiv.appendChild(simpleText);
    meaningSummary.appendChild(simpleMeaningDiv);
}

function generateSimpleMeaning(word, partOfSpeech, definition) {
    // Generate a simplified explanation based on the definition
    const lowerDef = definition.toLowerCase();
    const lowerWord = word.toLowerCase();
    
    // Try to create a simple sentence
    let simple = '';
    
    switch (partOfSpeech.toLowerCase()) {
        case 'noun':
            simple = `"${word}" is a word that refers to ${definition.toLowerCase()}`;
            break;
        case 'verb':
            simple = `To "${lowerWord}" means to ${lowerDef.replace(/^to /, '')}`;
            break;
        case 'adjective':
            simple = `When something is "${lowerWord}", it means it is ${lowerDef}`;
            break;
        case 'adverb':
            simple = `"${word}" describes how something is done: ${lowerDef}`;
            break;
        case 'interjection':
            simple = `"${word}" is an expression used to ${lowerDef}`;
            break;
        default:
            simple = `"${word}" means: ${definition}`;
    }
    
    return simple;
}

function displayMeanings(meanings) {
    meaningsContainer.innerHTML = '';

    if (!meanings || meanings.length === 0) {
        meaningsContainer.innerHTML = createEmptyState('No definitions found');
        return;
    }

    meanings.forEach(meaning => {
        const card = document.createElement('div');
        card.className = 'meaning-card';

        const pos = document.createElement('span');
        pos.className = 'part-of-speech';
        pos.textContent = meaning.partOfSpeech;

        const list = document.createElement('ol');
        list.className = 'definition-list';

        meaning.definitions.forEach((def, index) => {
            const item = document.createElement('li');
            item.className = 'definition-item';

            const number = document.createElement('span');
            number.className = 'definition-number';
            number.textContent = index + 1;

            const content = document.createElement('div');
            content.style.flex = '1';

            const text = document.createElement('div');
            text.className = 'definition-text';
            text.textContent = def.definition;

            content.appendChild(text);

            if (def.example) {
                const example = document.createElement('div');
                example.className = 'definition-example';
                example.textContent = `"${def.example}"`;
                content.appendChild(example);
            }

            item.appendChild(number);
            item.appendChild(content);
            list.appendChild(item);
        });

        card.appendChild(pos);
        card.appendChild(list);
        meaningsContainer.appendChild(card);
    });
}

function displayWordList(container, words, type) {
    container.innerHTML = '';

    if (!words || words.length === 0) {
        container.innerHTML = createEmptyState(`No ${type} found`);
        return;
    }

    words.forEach(word => {
        const chip = document.createElement('div');
        chip.className = 'word-chip';
        chip.textContent = word;
        chip.addEventListener('click', () => {
            searchInput.value = word;
            handleSearch();
        });
        container.appendChild(chip);
    });
}

function displayExamples(examples) {
    examplesList.innerHTML = '';

    if (!examples || examples.length === 0) {
        examplesList.innerHTML = createEmptyState('No examples found');
        return;
    }

    examples.forEach(example => {
        const item = document.createElement('div');
        item.className = 'example-item';
        item.textContent = example;
        examplesList.appendChild(item);
    });
}

function createEmptyState(message) {
    return `
        <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>${message}</p>
        </div>
    `;
}

function switchTab(tabName) {
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabName);
    });
}

function playAudio() {
    if (!currentAudio) {
        // Fallback to web speech API if no audio URL
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(wordTitle.textContent);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
        return;
    }

    const audio = new Audio(currentAudio);
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        // Fallback to speech synthesis
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(wordTitle.textContent);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    });
}

function showLoading() {
    loading.classList.add('active');
}

function hideLoading() {
    loading.classList.remove('active');
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add('active');
}

function hideError() {
    errorMessage.classList.remove('active');
}

function showResults() {
    results.classList.add('active');
    switchTab('meaning');
}

function hideResults() {
    results.classList.remove('active');
}

function incrementSearchCount() {
    searchCount++;
    localStorage.setItem('searchCount', searchCount);
    updateSearchCount();
}

function updateSearchCount() {
    wordCount.textContent = searchCount;
}

function resetSearchCount() {
    if (confirm('Are you sure you want to reset the search count to zero?')) {
        searchCount = 0;
        localStorage.setItem('searchCount', searchCount);
        updateSearchCount();
        
        // Optional: Add a visual feedback animation
        wordCount.style.transform = 'scale(1.3)';
        setTimeout(() => {
            wordCount.style.transform = 'scale(1)';
        }, 300);
    }
}

// History Functions
function addToHistory(word, firstDefinition = '') {
    // Remove if already exists
    searchHistory = searchHistory.filter(item => item.word !== word);
    
    // Add to beginning with timestamp and definition
    searchHistory.unshift({
        word: word,
        timestamp: Date.now(),
        definition: firstDefinition
    });
    
    // Keep only last 50 searches
    if (searchHistory.length > 50) {
        searchHistory = searchHistory.slice(0, 50);
    }
    
    // Save to localStorage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

function openHistoryModal() {
    renderHistory();
    historyModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeHistoryModal() {
    historyModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

function renderHistory() {
    historyList.innerHTML = '';
    
    if (searchHistory.length === 0) {
        emptyHistory.classList.add('active');
        historyList.style.display = 'none';
        clearHistoryBtn.style.display = 'none';
        return;
    }
    
    emptyHistory.classList.remove('active');
    historyList.style.display = 'flex';
    clearHistoryBtn.style.display = 'flex';
    
    searchHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const content = document.createElement('div');
        content.className = 'history-item-content';
        
        const wordElement = document.createElement('div');
        wordElement.className = 'history-word';
        wordElement.textContent = item.word;
        
        const timeElement = document.createElement('div');
        timeElement.className = 'history-time';
        timeElement.textContent = formatTimestamp(item.timestamp);
        
        content.appendChild(wordElement);
        
        // Add definition preview if available
        if (item.definition) {
            const defElement = document.createElement('div');
            defElement.className = 'history-definition';
            defElement.textContent = item.definition.length > 80 
                ? item.definition.substring(0, 80) + '...' 
                : item.definition;
            content.appendChild(defElement);
        }
        
        content.appendChild(timeElement);
        
        const actions = document.createElement('div');
        actions.className = 'history-item-actions';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'history-delete-btn';
        deleteBtn.title = 'Remove from history';
        deleteBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
        `;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromHistory(index);
        });
        
        actions.appendChild(deleteBtn);
        
        historyItem.appendChild(content);
        historyItem.appendChild(actions);
        
        // Click to search
        historyItem.addEventListener('click', () => {
            searchInput.value = item.word;
            closeHistoryModal();
            handleSearch();
        });
        
        historyList.appendChild(historyItem);
    });
}

function removeFromHistory(index) {
    searchHistory.splice(index, 1);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    renderHistory();
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all search history?')) {
        searchHistory = [];
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        renderHistory();
    }
}

function formatTimestamp(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) {
        return 'Just now';
    } else if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    }
}

function showSuggestions() {
    const suggestions = ['serendipity', 'ephemeral', 'eloquent', 'resilient', 'ubiquitous'];
    const container = document.getElementById('suggestions');
    
    suggestions.forEach(word => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = word;
        chip.addEventListener('click', () => {
            searchInput.value = word;
            handleSearch();
        });
        container.appendChild(chip);
    });
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
