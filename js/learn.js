/**
 * Vocab Master - Learn Page Logic
 */

const LearnPage = {
  currentFilter: 'all',
  wordList: [],
  isReady: false,
  
  init() {
    // Check if App is loaded
    if (App.words.length === 0) {
      console.log('Waiting for App to load...');
      // Wait for App.init to complete
      const checkInterval = setInterval(() => {
        if (App.words.length > 0) {
          clearInterval(checkInterval);
          this.isReady = true;
          this.setup();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!this.isReady) {
          console.error('Failed to load words');
          this.showError();
        }
      }, 10000);
    } else {
      this.isReady = true;
      this.setup();
    }
  },
  
  setup() {
    this.cacheElements();
    this.bindEvents();
    this.applyFilter('all');
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
      learnedStatus: document.getElementById('learned-status'),
      filterAll: document.getElementById('filter-all'),
      filterLearned: document.getElementById('filter-learned'),
      wordCount: document.getElementById('word-count'),
      learnedCount: document.getElementById('learned-count-btn'),
      wordListModal: document.getElementById('word-list-modal'),
      learnedListModal: document.getElementById('learned-list-modal'),
      modalClose: document.querySelectorAll('.modal-close'),
      wordListContainer: document.getElementById('word-list-container'),
      learnedListContainer: document.getElementById('learned-list-container')
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
    
    // Filter buttons
    if (this.elements.filterAll) {
      this.elements.filterAll.addEventListener('click', () => this.applyFilter('all'));
    }
    if (this.elements.filterLearned) {
      this.elements.filterLearned.addEventListener('click', () => this.applyFilter('learned'));
    }
    
    // Word list buttons
    if (this.elements.wordCount) {
      this.elements.wordCount.addEventListener('click', () => this.showWordList());
    }
    if (this.elements.learnedCount) {
      this.elements.learnedCount.addEventListener('click', () => this.showLearnedList());
    }
    
    // Modal close
    this.elements.modalClose.forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });
    
    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModals();
      });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevWord();
      if (e.key === 'ArrowRight') this.nextWord();
      if (e.key === ' ') {
        e.preventDefault();
        this.toggleLearned();
      }
      if (e.key === 'Escape') this.closeModals();
    });
  },
  
  applyFilter(filter) {
    this.currentFilter = filter;
    App.currentIndex = 0;
    
    // Update button states
    if (this.elements.filterAll && this.elements.filterLearned) {
      if (filter === 'all') {
        this.elements.filterAll.classList.add('active');
        this.elements.filterLearned.classList.remove('active');
        this.wordList = [...App.words];
      } else {
        this.elements.filterAll.classList.remove('active');
        this.elements.filterLearned.classList.add('active');
        this.wordList = App.getLearnedWordsData();
      }
    } else {
      // Fallback if filter buttons don't exist
      this.wordList = filter === 'all' ? [...App.words] : App.getLearnedWordsData();
    }
    
    // Update counts
    if (this.elements.wordCount) {
      const countEl = this.elements.wordCount.querySelector('.count');
      if (countEl) countEl.textContent = App.words.length;
    }
    if (this.elements.learnedCount) {
      const countEl = this.elements.learnedCount.querySelector('.count');
      if (countEl) countEl.textContent = App.learnedWords.length;
    }
    
    this.render();
  },
  
  render() {
    if (!this.wordList || this.wordList.length === 0) {
      this.showEmpty();
      return;
    }
    
    // Ensure index is valid
    if (App.currentIndex >= this.wordList.length) {
      App.currentIndex = 0;
    }
    
    const word = this.wordList[App.currentIndex];
    if (!word) {
      this.showEmpty();
      return;
    }
    
    this.displayWord(word);
    this.updateNavigation();
  },
  
  displayWord(word) {
    if (!word) return;
    
    // Safely set text content
    if (this.elements.wordMain) this.elements.wordMain.textContent = word.word || 'N/A';
    if (this.elements.wordPos) this.elements.wordPos.textContent = word.pos || 'unknown';
    if (this.elements.wordBangla) this.elements.wordBangla.textContent = word.meaning_bn || '-';
    if (this.elements.definition) this.elements.definition.textContent = word.definition || 'No definition available.';
    if (this.elements.example) this.elements.example.textContent = word.example_en || 'No example available.';
    if (this.elements.exampleBn) this.elements.exampleBn.textContent = word.example_bn || '';
    
    this.renderSynonyms(word.synonyms);
    this.updateLearnedButton(word.word);
    
    if (this.elements.currentIndex) this.elements.currentIndex.textContent = App.currentIndex + 1;
    if (this.elements.totalWords) this.elements.totalWords.textContent = this.wordList.length;
  },
  
  renderSynonyms(synonyms) {
    if (!this.elements.synonyms) return;
    
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
    if (!this.elements.learnedBtn || !this.elements.learnedStatus) return;
    
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
    if (this.elements.prevBtn) {
      this.elements.prevBtn.disabled = App.currentIndex === 0;
    }
    if (this.elements.nextBtn) {
      this.elements.nextBtn.disabled = App.currentIndex >= this.wordList.length - 1;
    }
  },
  
  prevWord() {
    if (App.currentIndex > 0) {
      App.currentIndex--;
      this.render();
    }
  },
  
  nextWord() {
    if (App.currentIndex < this.wordList.length - 1) {
      App.currentIndex++;
      this.render();
    }
  },
  
  toggleLearned() {
    if (!this.wordList || this.wordList.length === 0) return;
    
    const word = this.wordList[App.currentIndex];
    if (!word) return;
    
    const isLearned = App.isLearned(word.word);
    
    if (isLearned) {
      App.unmarkAsLearned(word.word);
    } else {
      App.markAsLearned(word.word);
    }
    
    // Update filter if in learned mode and unlearned
    if (this.currentFilter === 'learned' && isLearned) {
      this.wordList = App.getLearnedWordsData();
      if (App.currentIndex >= this.wordList.length) {
        App.currentIndex = Math.max(0, this.wordList.length - 1);
      }
      this.render();
    } else {
      this.updateLearnedButton(word.word);
    }
    
    // Update counts
    if (this.elements.wordCount) {
      const countEl = this.elements.wordCount.querySelector('.count');
      if (countEl) countEl.textContent = App.words.length;
    }
    if (this.elements.learnedCount) {
      const countEl = this.elements.learnedCount.querySelector('.count');
      if (countEl) countEl.textContent = App.learnedWords.length;
    }
    
    App.updateHUD();
  },
  
  showEmpty() {
    if (this.elements.wordMain) this.elements.wordMain.textContent = 'No Words';
    if (this.elements.wordPos) this.elements.wordPos.textContent = '-';
    if (this.elements.wordBangla) this.elements.wordBangla.textContent = '-';
    if (this.elements.definition) this.elements.definition.textContent = 'No words available in this filter.';
    if (this.elements.example) this.elements.example.textContent = '-';
    if (this.elements.exampleBn) this.elements.exampleBn.textContent = '-';
    if (this.elements.synonyms) this.elements.synonyms.innerHTML = '<span class="synonym-tag">-</span>';
    if (this.elements.currentIndex) this.elements.currentIndex.textContent = '0';
    if (this.elements.totalWords) this.elements.totalWords.textContent = '0';
    if (this.elements.prevBtn) this.elements.prevBtn.disabled = true;
    if (this.elements.nextBtn) this.elements.nextBtn.disabled = true;
  },
  
  showError() {
    if (this.elements.wordMain) this.elements.wordMain.textContent = 'Error';
    if (this.elements.definition) this.elements.definition.textContent = 'Failed to load words. Please refresh the page.';
  },
  
  showWordList() {
    if (!this.elements.wordListContainer) return;
    
    this.elements.wordListContainer.innerHTML = '';
    
    App.words.forEach((word, index) => {
      const item = document.createElement('div');
      item.className = 'word-list-item';
      if (App.isLearned(word.word)) {
        item.classList.add('learned');
      }
      
      item.innerHTML = `
        <span class="word-list-en">${word.word}</span>
        <span class="word-list-bn">${word.meaning_bn}</span>
        ${App.isLearned(word.word) ? '<span class="word-list-check">✓</span>' : ''}
      `;
      
      item.addEventListener('click', () => {
        this.closeModals();
        this.applyFilter('all');
        App.currentIndex = index;
        this.render();
      });
      
      this.elements.wordListContainer.appendChild(item);
    });
    
    this.elements.wordListModal.classList.add('show');
  },
  
  showLearnedList() {
    if (!this.elements.learnedListContainer) return;
    
    this.elements.learnedListContainer.innerHTML = '';
    
    const learnedWords = App.getLearnedWordsData();
    
    if (learnedWords.length === 0) {
      this.elements.learnedListContainer.innerHTML = '<p style="text-align: center; color: rgba(224,230,237,0.5); padding: 2rem;">No learned words yet</p>';
    } else {
      learnedWords.forEach((word, index) => {
        const item = document.createElement('div');
        item.className = 'word-list-item learned';
        
        item.innerHTML = `
          <span class="word-list-en">${word.word}</span>
          <span class="word-list-bn">${word.meaning_bn}</span>
          <span class="word-list-check">✓</span>
        `;
        
        item.addEventListener('click', () => {
          this.closeModals();
          this.applyFilter('learned');
          App.currentIndex = index;
          this.render();
        });
        
        this.elements.learnedListContainer.appendChild(item);
      });
    }
    
    this.elements.learnedListModal.classList.add('show');
  },
  
  closeModals() {
    if (this.elements.wordListModal) this.elements.wordListModal.classList.remove('show');
    if (this.elements.learnedListModal) this.elements.learnedListModal.classList.remove('show');
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure App is initialized
  setTimeout(() => {
    LearnPage.init();
  }, 100);
});
