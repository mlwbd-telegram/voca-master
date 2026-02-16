/**
 * Vocab Master - Core Application Logic
 */

const App = {
  words: [],
  learnedWords: [],
  currentIndex: 0,
  usedExamWords: [], // Track used words for exam rotation
  
  init() {
    this.loadLearnedWords();
    this.loadUsedExamWords();
    return this.loadWords();
  },
  
  async loadWords() {
    try {
      const response = await fetch('word.json');
      if (!response.ok) {
        throw new Error('Failed to load word.json');
      }
      this.words = await response.json();
      console.log('Loaded', this.words.length, 'words');
      return true;
    } catch (error) {
      console.error('Error loading words:', error);
      return false;
    }
  },
  
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
  
  saveLearnedWords() {
    localStorage.setItem('learned_words', JSON.stringify(this.learnedWords));
  },
  
  loadUsedExamWords() {
    const stored = localStorage.getItem('used_exam_words');
    if (stored) {
      try {
        this.usedExamWords = JSON.parse(stored);
      } catch (e) {
        this.usedExamWords = [];
      }
    }
  },
  
  saveUsedExamWords() {
    localStorage.setItem('used_exam_words', JSON.stringify(this.usedExamWords));
  },
  
  isLearned(word) {
    return this.learnedWords.includes(word);
  },
  
  markAsLearned(word) {
    if (!this.isLearned(word)) {
      this.learnedWords.push(word);
      this.saveLearnedWords();
      return true;
    }
    return false;
  },
  
  unmarkAsLearned(word) {
    const index = this.learnedWords.indexOf(word);
    if (index > -1) {
      this.learnedWords.splice(index, 1);
      this.saveLearnedWords();
      return true;
    }
    return false;
  },
  
  getLearnedWordsData() {
    return this.words.filter(w => this.isLearned(w.word));
  },
  
  getUnlearnedWords() {
    return this.words.filter(w => !this.isLearned(w.word));
  },
  
  // Get exam words - 50+ words, no repetition until all used
  getExamWords(count = 50) {
    // If all words used, reset
    if (this.usedExamWords.length >= this.words.length - 5) {
      this.usedExamWords = [];
    }
    
    // Get unused words
    let available = this.words.filter(w => !this.usedExamWords.includes(w.word));
    
    // If not enough unused, reset and try again
    if (available.length < count) {
      this.usedExamWords = [];
      available = [...this.words];
    }
    
    // Shuffle and select
    const shuffled = this.shuffleArray([...available]);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    
    // Mark as used
    selected.forEach(w => {
      if (!this.usedExamWords.includes(w.word)) {
        this.usedExamWords.push(w.word);
      }
    });
    this.saveUsedExamWords();
    
    return selected;
  },
  
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },
  
  updateHUD() {
    const counter = document.getElementById('learned-counter');
    if (counter) {
      counter.textContent = this.learnedWords.length;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init().then(() => {
    App.updateHUD();
  });
});
