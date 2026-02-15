/**
 * Vocab Master - Core Application Logic
 * Shared utilities and data management
 */

const App = {
  // Data storage
  words: [],
  learnedWords: [],
  currentIndex: 0,
  
  // Initialize application
  init() {
    this.loadLearnedWords();
    return this.loadWords();
  },
  
  // Load words from word.json
  async loadWords() {
    try {
      const response = await fetch('word.json');
      if (!response.ok) {
        throw new Error('Failed to load word.json');
      }
      this.words = await response.json();
      return true;
    } catch (error) {
      console.error('Error loading words:', error);
      return false;
    }
  },
  
  // Load learned words from localStorage
  loadLearnedWords() {
    const stored = localStorage.getItem('learned_words');
    if (stored) {
      try {
        this.learnedWords = JSON.parse(stored);
      } catch (e) {
        this.learnedWords = [];
      }
    }
  },
  
  // Save learned words to localStorage
  saveLearnedWords() {
    localStorage.setItem('learned_words', JSON.stringify(this.learnedWords));
  },
  
  // Check if word is learned
  isLearned(word) {
    return this.learnedWords.includes(word);
  },
  
  // Mark word as learned
  markAsLearned(word) {
    if (!this.isLearned(word)) {
      this.learnedWords.push(word);
      this.saveLearnedWords();
      return true;
    }
    return false;
  },
  
  // Remove word from learned
  unmarkAsLearned(word) {
    const index = this.learnedWords.indexOf(word);
    if (index > -1) {
      this.learnedWords.splice(index, 1);
      this.saveLearnedWords();
      return true;
    }
    return false;
  },
  
  // Get learned words data
  getLearnedWordsData() {
    return this.words.filter(w => this.isLearned(w.word));
  },
  
  // Get random words for quiz
  getRandomWords(count, exclude = []) {
    const available = this.words.filter(w => !exclude.includes(w.word));
    const shuffled = this.shuffleArray([...available]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  },
  
  // Shuffle array
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },
  
  // Generate quiz options
  generateOptions(correctWord, count = 4) {
    const options = [correctWord];
    const otherWords = this.words.filter(w => w.word !== correctWord.word);
    const shuffled = this.shuffleArray([...otherWords]);
    
    while (options.length < count && shuffled.length > 0) {
      const word = shuffled.pop();
      if (!options.find(o => o.meaning_bn === word.meaning_bn)) {
        options.push(word);
      }
    }
    
    return this.shuffleArray(options);
  },
  
  // Update HUD counter
  updateHUD() {
    const counter = document.getElementById('learned-counter');
    if (counter) {
      counter.textContent = this.learnedWords.length;
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init().then(() => {
    App.updateHUD();
  });
});
