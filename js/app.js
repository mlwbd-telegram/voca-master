const App = {
  words: [],
  learnedWords: [],
  usedExamWords: [],
  
  async init() {
    this.loadLearnedWords();
    this.loadUsedExamWords();
    await this.loadWords();
    console.log('App ready:', this.words.length, 'words');
  },
  
  async loadWords() {
    try {
      const response = await fetch('word.json');
      if (!response.ok) throw new Error('Failed to load');
      const data = await response.json();
      
      this.words = data.map(w => ({
        word: w.word || 'unknown',
        pos: w.pos || 'unknown',
        meaning_bn: w.meaning_bn || '-',
        definition: w.definition || 'No definition',
        example_en: w.example_en || 'No example',
        example_bn: w.example_bn || '',
        synonyms: w.synonyms || []
      }));
    } catch (e) {
      console.error('Load error:', e);
      // Fallback data
      this.words = [
        {word: "abandon", pos: "verb", meaning_bn: "পরিত্যাগ করা", definition: "To leave behind", example_en: "They had to abandon the ship.", example_bn: "তাদের জাহাজ পরিত্যাগ করতে হয়েছিল।", synonyms: ["leave", "desert"]},
        {word: "ability", pos: "noun", meaning_bn: "সামর্থ্য", definition: "Power to do something", example_en: "She has the ability to sing.", example_bn: "তার গাওয়ার সামর্থ্য আছে।", synonyms: ["skill", "talent"]}
      ];
    }
  },
  
  loadLearnedWords() {
    try {
      const data = localStorage.getItem('learned_words');
      this.learnedWords = data ? JSON.parse(data) : [];
    } catch { this.learnedWords = []; }
  },
  
  saveLearnedWords() {
    localStorage.setItem('learned_words', JSON.stringify(this.learnedWords));
  },
  
  loadUsedExamWords() {
    try {
      const data = localStorage.getItem('used_exam_words');
      this.usedExamWords = data ? JSON.parse(data) : [];
    } catch { this.usedExamWords = []; }
  },
  
  saveUsedExamWords() {
    localStorage.setItem('used_exam_words', JSON.stringify(this.usedExamWords));
  },
  
  isLearned(word) { return this.learnedWords.includes(word); },
  
  markLearned(word) {
    if (!this.isLearned(word)) {
      this.learnedWords.push(word);
      this.saveLearnedWords();
    }
  },
  
  unmarkLearned(word) {
    const i = this.learnedWords.indexOf(word);
    if (i > -1) {
      this.learnedWords.splice(i, 1);
      this.saveLearnedWords();
    }
  },
  
  getLearnedWords() {
    return this.words.filter(w => this.isLearned(w.word));
  },
  
  getExamWords(count = 50) {
    if (this.usedExamWords.length >= this.words.length - 5) {
      this.usedExamWords = [];
    }
    
    let available = this.words.filter(w => !this.usedExamWords.includes(w.word));
    if (available.length < count) {
      this.usedExamWords = [];
      available = [...this.words];
    }
    
    const shuffled = this.shuffle([...available]);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    
    selected.forEach(w => {
      if (!this.usedExamWords.includes(w.word)) this.usedExamWords.push(w.word);
    });
    this.saveUsedExamWords();
    
    return selected;
  },
  
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
};

// Initialize
App.init();
