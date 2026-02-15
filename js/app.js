/**
 * Vocab Master - Core Application Logic
 */

const App = {
  words: [],
  learnedWords: [],
  currentIndex: 0,
  
  init() {
    this.loadLearnedWords();
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
