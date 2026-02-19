const ExamPage = {
  questions: [],
  current: 0,
  score: 0,
  wrong: [],
  
  start(mode) {
    this.current = 0;
    this.score = 0;
    this.wrong = [];
    
    const words = mode === 'learned' 
      ? App.getLearnedWords()
      : App.getExamWords(50);
    
    if (words.length < 4) {
      alert('Need at least 4 words!');
      return;
    }
    
    this.questions = this.makeQuestions(words);
    
    document.getElementById('mode-select').classList.add('hidden');
    document.getElementById('quiz-section').classList.remove('hidden');
    document.getElementById('results-section').classList.add('hidden');
    
    this.showQuestion();
  },
  
  makeQuestions(words) {
    return words.map(w => {
      const wrong = App.words
        .filter(x => x.word !== w.word && x.meaning_bn !== w.meaning_bn)
        .slice(0, 3);
      
      const opts = App.shuffle([w, ...wrong]);
      return { word: w, options: opts, answer: w.meaning_bn };
    });
  },
  
  showQuestion() {
    const q = this.questions[this.current];
    
    document.getElementById('q-current').textContent = this.current + 1;
    document.getElementById('q-total').textContent = this.questions.length;
    document.getElementById('quiz-word').textContent = q.word.word;
    
    const list = document.getElementById('options-list');
    list.innerHTML = '';
    
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-card';
      btn.textContent = opt.meaning_bn;
      btn.onclick = () => this.answer(btn, opt, q);
      list.appendChild(btn);
    });
    
    document.getElementById('feedback').className = 'feedback-msg';
    document.getElementById('next-btn').classList.add('hidden');
  },
  
  answer(btn, opt, q) {
    const correct = opt.meaning_bn === q.answer;
    const all = document.querySelectorAll('.option-card');
    
    all.forEach(b => {
      b.classList.add('disabled');
      b.onclick = null;
      if (b.textContent === q.answer) b.classList.add('reveal');
    });
    
    const fb = document.getElementById('feedback');
    fb.classList.add('show');
    
    if (correct) {
      btn.classList.add('correct');
      fb.className = 'feedback-msg correct show';
      fb.textContent = '✓ Correct!';
      this.score++;
    } else {
      btn.classList.add('wrong');
      fb.className = 'feedback-msg wrong show';
      fb.textContent = '✗ Wrong! Answer: ' + q.answer;
      this.wrong.push({ word: q.word.word, meaning: q.word.meaning_bn });
    }
    
    const nextBtn = document.getElementById('next-btn');
    nextBtn.classList.remove('hidden');
    nextBtn.textContent = this.current === this.questions.length - 1 ? 'See Results →' : 'Next Question →';
  },
  
  next() {
    this.current++;
    if (this.current < this.questions.length) {
      this.showQuestion();
    } else {
      this.showResults();
    }
  },
  
  showResults() {
    document.getElementById('quiz-section').classList.add('hidden');
    document.getElementById('results-section').classList.remove('hidden');
    
    const total = this.questions.length;
    const pct = Math.round((this.score / total) * 100);
    
    document.getElementById('score-percent').textContent = pct + '%';
    document.getElementById('score-ring').style.setProperty('--score-percent', pct + '%');
    document.getElementById('res-correct').textContent = this.score;
    document.getElementById('res-wrong').textContent = total - this.score;
    document.getElementById('res-total').textContent = total;
    
    const msg = document.getElementById('result-msg');
    if (pct >= 80) {
      msg.textContent = 'Outstanding! 🎉';
      document.querySelector('.score-ring').style.background = `conic-gradient(var(--neon-green) ${pct}%, rgba(255,255,255,0.1) 0)`;
    } else if (pct >= 60) {
      msg.textContent = 'Good job! 👍';
      document.querySelector('.score-ring').style.background = `conic-gradient(var(--neon-yellow) ${pct}%, rgba(255,255,255,0.1) 0)`;
    } else {
      msg.textContent = 'Keep practicing! 💪';
      document.querySelector('.score-ring').style.background = `conic-gradient(var(--neon-pink) ${pct}%, rgba(255,255,255,0.1) 0)`;
    }
    
    // Wrong words
    const box = document.getElementById('wrong-box');
    const list = document.getElementById('wrong-words-list');
    
    if (this.wrong.length > 0) {
      box.classList.remove('hidden');
      list.innerHTML = this.wrong.map(w => `
        <div class="wrong-word-row">
          <span class="wrong-word-en">${w.word}</span>
          <span class="wrong-word-bn">${w.meaning}</span>
        </div>
      `).join('');
    } else {
      box.classList.add('hidden');
    }
  },
  
  restart() {
    document.getElementById('mode-select').classList.remove('hidden');
    document.getElementById('results-section').classList.add('hidden');
  }
};
