/**
 * Vocab Master - Core Application Logic
 */

const App = {
  words: [],
  learnedWords: [],
  currentIndex: 0,
  usedExamWords: [],
  isLoaded: false,
  
  async init() {
    this.loadLearnedWords();
    this.loadUsedExamWords();
    await this.loadWords();
    this.isLoaded = true;
    this.updateHUD();
    console.log('App initialized with', this.words.length, 'words');
    return this.isLoaded;
  },
  
  async loadWords() {
    try {
      // Try multiple possible paths for word.json
      const possiblePaths = ['word.json', './word.json', '../word.json', '/word.json'];
      let response = null;
      
      for (const path of possiblePaths) {
        try {
          response = await fetch(path);
          if (response.ok) {
            console.log('Loaded word.json from:', path);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!response || !response.ok) {
        throw new Error('Failed to load word.json from any path');
      }
      
      this.words = await response.json();
      
      // Validate words data
      if (!Array.isArray(this.words) || this.words.length === 0) {
        throw new Error('Invalid word data');
      }
      
      // Ensure each word has required fields
      this.words = this.words.map(w => ({
        word: w.word || 'unknown',
        pos: w.pos || 'unknown',
        meaning_bn: w.meaning_bn || '-',
        definition: w.definition || 'No definition',
        example_en: w.example_en || 'No example',
        example_bn: w.example_bn || '',
        synonyms: w.synonyms || []
      }));
      
      return true;
    } catch (error) {
      console.error('Error loading words:', error);
      // Set dummy data for testing
      this.words = [
        {
          word: "abandon",
          pos: "verb",
          meaning_bn: "পরিত্যাগ করা",
          definition: "To leave behind, to desert",
          example_en: "The crew had to abandon the sinking ship.",
          example_bn: "দলকে ডুবে যাওয়া জাহাজ পরিত্যাগ করতে হয়েছিল।",
          synonyms: ["desert", "forsake"]
        },
        {
          word: "ability",
          pos: "noun",
          meaning_bn: "সামর্থ্য",
          definition: "The power to do something",
          example_en: "She has the ability to solve problems.",
          example_bn: "তার সমস্যা সমাধান করার সামর্থ্য আছে।",
          synonyms: ["skill", "talent"]
        }
      ];
      return false;
    }
  },
  
  loadLearnedWords() {
    try {
      const stored = localStorage.getItem('learned_words');
      if (stored) {
        this.learnedWords = JSON.parse(stored);
      }
    } catch (e) {
      this.learnedWords = [];
    }
  },
  
  saveLearnedWords() {
    try {
      localStorage.setItem('learned_words', JSON.stringify(this.learnedWords));
    } catch (e) {
      console.error('Failed to save learned words:', e);
    }
  },
  
  loadUsedExamWords() {
    try {
      const stored = localStorage.getItem('used_exam_words');
      if (stored) {
        this.usedExamWords = JSON.parse(stored);
      }
    } catch (e) {
      this.usedExamWords = [];
    }
  },
  
  saveUsedExamWords() {
    try {
      localStorage.setItem('used_exam_words', JSON.stringify(this.usedExamWords));
    } catch (e) {
      console.error('Failed to save used exam words:', e);
    }
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

// Initialize App immediately
App.init();
