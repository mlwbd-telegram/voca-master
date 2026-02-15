/**
 * Vocab Master - Learn Page Logic
 */

const LearnPage = {
  init() {
    if (App.words.length === 0) {
      App.init().then(() => this.setup());
    } else {
      this.setup();
    }
  },
  
  setup() {
    this.cacheElements();
    this.bindEvents();
    this.render();
  },
  
  cacheElements() {
    this.elements = {
      wordMain: document.getElementById('word-main'),
      wordPos: document.getElementById('word-pos'),
      wordBangla: document.getElementById('word-bangla'),
      definition: document.getElementById('definition'),
      example: document.getElementById('example'),
      exampleBn: document.getElementById('example-bn'),
      synonyms: document.getElementById('synonyms'),
      prevBtn: document.getElementById('prev-btn'),
      nextBtn: document.getElementById('next-btn'),
      learnedBtn: document.getElementById('learned-btn'),
      examBtn: document.getElementById('exam-btn'),
      currentIndex: document.getElementById('current-index'),
      totalWords: document.getElementById('total-words'),
      learnedStatus: document.getElementById('learned-status')
    };
  },
  
  bindEvents() {
    this.elements.prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.prevWord();
    });
    
    this.elements.nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.nextWord();
    });
    
    this.elements.learnedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleLearned();
    });
    
    this.elements.examBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'exam.html';
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevWord();
      if (e.key === 'ArrowRight') this.nextWord();
      if (e.key === ' ') {
        e.preventDefault();
        this.toggleLearned();
      }
    });
  },
  
  render() {
    if (App.words.length === 0) {
      this.showLoading();
      return;
    }
    
    const word = App.words[App.currentIndex];
    this.displayWord(word);
    this.updateNavigation();
  },
  
  displayWord(word) {
    this.elements.wordMain.textContent = word.word;
    this.elements.wordPos.textContent = word.pos || 'unknown';
    this.elements.wordBangla.textContent = word.meaning_bn;
    this.elements.definition.textContent = word.definition || 'No definition available.';
    this.elements.example.textContent = word.example_en || 'No example available.';
    this.elements.exampleBn.textContent = word.example_bn || '';
    
    this.renderSynonyms(word.synonyms);
    this.updateLearnedButton(word.word);
    
    this.elements.currentIndex.textContent = App.currentIndex + 1;
    this.elements.totalWords.textContent = App.words.length;
  },
  
  renderSynonyms(synonyms) {
    this.elements.synonyms.innerHTML = '';
    
    if (!synonyms || synonyms.length === 0) {
      this.elements.synonyms.innerHTML = '<span class="synonym-tag">None</span>';
      return;
    }
    
    synonyms.forEach(syn => {
      const tag = document.createElement('span');
      tag.className = 'synonym-tag';
      tag.textContent = syn;
      this.elements.synonyms.appendChild(tag);
    });
  },
  
  updateLearnedButton(word) {
    const isLearned = App.isLearned(word);
    const btn = this.elements.learnedBtn;
    
    if (isLearned) {
      btn.innerHTML = '✓ LEARNED';
      btn.classList.remove('btn-success');
      btn.classList.add('btn-danger');
      this.elements.learnedStatus.textContent = 'LEARNED';
      this.elements.learnedStatus.style.color = 'var(--neon-green)';
    } else {
      btn.innerHTML = '+ MARK AS LEARNED';
      btn.classList.remove('btn-danger');
      btn.classList.add('btn-success');
      this.elements.learnedStatus.textContent = 'NEW';
      this.elements.learnedStatus.style.color = 'var(--neon-cyan)';
    }
  },
  
  updateNavigation() {
    if (App.currentIndex === 0) {
      this.elements.prevBtn.disabled = true;
    } else {
      this.elements.prevBtn.disabled = false;
    }
    
    if (App.currentIndex >= App.words.length - 1) {
      this.elements.nextBtn.disabled = true;
    } else {
      this.elements.nextBtn.disabled = false;
    }
  },
  
  prevWord() {
    if (App.currentIndex > 0) {
      App.currentIndex--;
      this.render();
    }
  },
  
  nextWord() {
    if (App.currentIndex < App.words.length - 1) {
      App.currentIndex++;
      this.render();
    }
  },
  
  toggleLearned() {
    const word = App.words[App.currentIndex];
    const isLearned = App.isLearned(word.word);
    
    if (isLearned) {
      App.unmarkAsLearned(word.word);
    } else {
      App.markAsLearned(word.word);
    }
    
    this.updateLearnedButton(word.word);
    App.updateHUD();
  },
  
  showLoading() {
    this.elements.wordMain.textContent = 'Loading...';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  LearnPage.init();
});
