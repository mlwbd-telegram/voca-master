/**
 * Vocab Master - Learn Page Logic
 */

const LearnPage = {
  init() {
    // Wait for App to load data
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
      wordDisplay: document.getElementById('word-display'),
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
    this.elements.prevBtn.addEventListener('click', () => this.prevWord());
    this.elements.nextBtn.addEventListener('click', () => this.nextWord());
    this.elements.learnedBtn.addEventListener('click', () => this.toggleLearned());
    this.elements.examBtn.addEventListener('click', () => {
      window.location.href = 'exam.html';
    });
    
    // Keyboard navigation
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
    // Animate transition
    this.elements.wordDisplay.classList.remove('fade-in');
    void this.elements.wordDisplay.offsetWidth; // Trigger reflow
    this.elements.wordDisplay.classList.add('fade-in');
    
    // Main word
    this.elements.wordMain.textContent = word.word;
    this.elements.wordMain.setAttribute('data-text', word.word);
    
    // Part of speech
    this.elements.wordPos.textContent = word.pos || 'unknown';
    
    // Bangla meaning
    this.elements.wordBangla.textContent = word.meaning_bn;
    
    // Definition
    this.elements.definition.textContent = word.definition || 'No definition available.';
    
    // Examples
    this.elements.example.textContent = word.example_en || 'No example available.';
    this.elements.exampleBn.textContent = word.example_bn || '';
    
    // Synonyms
    this.renderSynonyms(word.synonyms);
    
    // Update learned button state
    this.updateLearnedButton(word.word);
    
    // Update counter
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
      btn.innerHTML = '✓ Learned';
      btn.classList.remove('btn-success');
      btn.classList.add('btn-danger');
      this.elements.learnedStatus.textContent = 'LEARNED';
      this.elements.learnedStatus.style.color = 'var(--neon-green)';
    } else {
      btn.innerHTML = '+ Mark as Learned';
      btn.classList.remove('btn-danger');
      btn.classList.add('btn-success');
      this.elements.learnedStatus.textContent = 'NEW';
      this.elements.learnedStatus.style.color = 'var(--neon-cyan)';
    }
  },
  
  updateNavigation() {
    this.elements.prevBtn.disabled = App.currentIndex === 0;
    this.elements.nextBtn.disabled = App.currentIndex === App.words.length - 1;
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
    
    // Visual feedback
    this.flashNotification(isLearned ? 'Removed from learned' : 'Marked as learned!');
  },
  
  flashNotification(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 240, 255, 0.2);
      border: 1px solid var(--neon-cyan);
      color: var(--neon-cyan);
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-family: var(--font-hud);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
      notif.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => notif.remove(), 300);
    }, 2000);
  },
  
  showLoading() {
    this.elements.wordDisplay.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>Loading vocabulary database...</p>
      </div>
    `;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  LearnPage.init();
});
