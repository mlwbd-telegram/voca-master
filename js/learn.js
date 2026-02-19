const LearnPage = {
  filter: 'all',
  list: [],
  index: 0,
  
  init() {
    this.waitForData(() => {
      this.list = [...App.words];
      this.updateCounts();
      this.render();
      document.getElementById('loading').classList.add('hide');
    });
  },
  
  waitForData(callback) {
    if (App.words.length > 0) return callback();
    const check = setInterval(() => {
      if (App.words.length > 0) {
        clearInterval(check);
        callback();
      }
    }, 100);
  },
  
  setFilter(type) {
    this.filter = type;
    this.index = 0;
    
    document.getElementById('tab-all').classList.toggle('active', type === 'all');
    document.getElementById('tab-learned').classList.toggle('active', type === 'learned');
    
    this.list = type === 'all' ? [...App.words] : App.getLearnedWords();
    this.render();
  },
  
  render() {
    if (this.list.length === 0) {
      this.showEmpty();
      return;
    }
    
    const w = this.list[this.index];
    
    document.getElementById('word-main').textContent = w.word;
    document.getElementById('word-pos').textContent = w.pos;
    document.getElementById('word-bangla').textContent = w.meaning_bn;
    document.getElementById('definition').textContent = w.definition;
    document.getElementById('example').textContent = w.example_en;
    document.getElementById('example-bn').textContent = w.example_bn;
    
    // Synonyms
    const synContainer = document.getElementById('synonyms');
    synContainer.innerHTML = w.synonyms?.length 
      ? w.synonyms.map(s => `<span class="syn-tag">${s}</span>`).join('')
      : '<span class="syn-tag">None</span>';
    
    // Status
    const isLearned = App.isLearned(w.word);
    const btn = document.getElementById('action-btn');
    const badge = document.getElementById('status-badge');
    
    if (isLearned) {
      btn.className = 'action-btn unlearn';
      btn.innerHTML = '<span>✓</span> Learned';
      badge.textContent = 'LEARNED';
      badge.className = 'status-badge learned';
    } else {
      btn.className = 'action-btn learn';
      btn.innerHTML = '<span>+</span> Mark Learned';
      badge.textContent = 'NEW';
      badge.className = 'status-badge';
    }
    
    // Counters
    document.getElementById('current-index').textContent = this.index + 1;
    document.getElementById('total-count').textContent = this.list.length;
    document.getElementById('learned-counter').textContent = App.learnedWords.length;
    
    // Buttons
    document.getElementById('prev-btn').disabled = this.index === 0;
    document.getElementById('next-btn').disabled = this.index >= this.list.length - 1;
  },
  
  showEmpty() {
    document.getElementById('word-main').textContent = 'No Words';
    document.getElementById('definition').textContent = 'No words in this filter.';
  },
  
  prev() {
    if (this.index > 0) {
      this.index--;
      this.render();
    }
  },
  
  next() {
    if (this.index < this.list.length - 1) {
      this.index++;
      this.render();
    }
  },
  
  toggleLearned() {
    const w = this.list[this.index];
    if (App.isLearned(w.word)) {
      App.unmarkLearned(w.word);
      if (this.filter === 'learned') {
        this.list = App.getLearnedWords();
        if (this.index >= this.list.length) this.index = Math.max(0, this.list.length - 1);
      }
    } else {
      App.markLearned(w.word);
    }
    this.updateCounts();
    this.render();
  },
  
  updateCounts() {
    document.getElementById('count-all').textContent = App.words.length;
    document.getElementById('count-learned').textContent = App.learnedWords.length;
  },
  
  showModal() {
    const modal = document.getElementById('word-modal');
    const list = document.getElementById('word-list');
    list.innerHTML = '';
    
    App.words.forEach((w, i) => {
      const item = document.createElement('div');
      item.className = 'word-item' + (App.isLearned(w.word) ? ' learned' : '');
      item.innerHTML = `
        <div class="word-info">
          <div class="word-en">${w.word}</div>
          <div class="word-bn">${w.meaning_bn}</div>
        </div>
        ${App.isLearned(w.word) ? '<div class="word-check">✓</div>' : ''}
      `;
      item.onclick = () => {
        this.setFilter('all');
        this.index = i;
        this.render();
        this.closeModal();
      };
      list.appendChild(item);
    });
    
    modal.classList.add('show');
  },
  
  closeModal() {
    document.getElementById('word-modal').classList.remove('show');
  }
};

// Init
document.addEventListener('DOMContentLoaded', () => LearnPage.init());
