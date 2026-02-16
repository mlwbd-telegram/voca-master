/**
 * Vocab Master - Exam Page Logic
 */

const ExamPage = {
  mode: null,
  questions: [],
  currentQuestion: 0,
  score: 0,
  selected: false,
  wrongAnswers: [],
  
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
    this.showModeSelection();
  },
  
  cacheElements() {
    this.elements = {
      modeSelection: document.getElementById('mode-selection'),
      quizContainer: document.getElementById('quiz-container'),
      resultsContainer: document.getElementById('results-container'),
      modeLearned: document.getElementById('mode-learned'),
      modeFull: document.getElementById('mode-full'),
      questionCounter: document.getElementById('question-counter'),
      quizWord: document.getElementById('quiz-word'),
      optionsGrid: document.getElementById('options-grid'),
      feedback: document.getElementById('feedback'),
      nextBtn: document.getElementById('next-btn'),
      scoreCircle: document.getElementById('score-circle'),
      scoreNumber: document.getElementById('score-number'),
      scoreTotal: document.getElementById('score-total'),
      accuracy: document.getElementById('accuracy'),
      performanceMsg: document.getElementById('performance-msg'),
      correctCount: document.getElementById('correct-count'),
      wrongCount: document.getElementById('wrong-count'),
      percentage: document.getElementById('percentage'),
      restartBtn: document.getElementById('restart-btn'),
      homeBtn: document.getElementById('home-btn'),
      wrongWordsSection: document.getElementById('wrong-words-section'),
      wrongWordsList: document.getElementById('wrong-words-list')
    };
  },
  
  bindEvents() {
    this.elements.modeLearned.addEventListener('click', () => this.startExam('learned'));
    this.elements.modeFull.addEventListener('click', () => this.startExam('full'));
    this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
    this.elements.restartBtn.addEventListener('click', () => this.restart());
    this.elements.homeBtn.addEventListener('click', () => {
      window.location.href = 'learn.html';
    });
  },
  
  showModeSelection() {
    this.elements.modeSelection.classList.remove('hidden');
    this.elements.quizContainer.classList.add('hidden');
    this.elements.resultsContainer.classList.add('hidden');
  },
  
  startExam(mode) {
    this.mode = mode;
    this.currentQuestion = 0;
    this.score = 0;
    this.selected = false;
    this.wrongAnswers = [];
    
    if (mode === 'learned') {
      const learnedWords = App.getLearnedWordsData();
      if (learnedWords.length < 4) {
        alert('Please learn at least 4 words first!');
        return;
      }
      // Use 50 or all learned words
      const count = Math.min(50, learnedWords.length);
      const shuffled = App.shuffleArray([...learnedWords]);
      this.questions = this.generateQuestions(shuffled.slice(0, count), count);
    } else {
      // Get 50+ words with no repetition
      const examWords = App.getExamWords(50);
      this.questions = this.generateQuestions(examWords, examWords.length);
    }
    
    this.elements.modeSelection.classList.add('hidden');
    this.elements.quizContainer.classList.remove('hidden');
    this.elements.resultsContainer.classList.add('hidden');
    
    this.showQuestion();
  },
  
  generateQuestions(wordList, count) {
    const selected = wordList.slice(0, Math.min(count, wordList.length));
    
    return selected.map(word => {
      const wrongOptions = [];
      const otherWords = App.words.filter(w => w.word !== word.word);
      const shuffledOthers = App.shuffleArray([...otherWords]);
      
      for (let w of shuffledOthers) {
        if (wrongOptions.length >= 3) break;
        if (!wrongOptions.find(o => o.meaning_bn === w.meaning_bn) && w.meaning_bn !== word.meaning_bn) {
          wrongOptions.push(w);
        }
      }
      
      const options = App.shuffleArray([word, ...wrongOptions]);
      
      return {
        word: word,
        options: options,
        correct: word.meaning_bn
      };
    });
  },
  
  showQuestion() {
    this.selected = false;
    const q = this.questions[this.currentQuestion];
    
    this.elements.questionCounter.innerHTML = `Question <span>${this.currentQuestion + 1}</span> / ${this.questions.length}`;
    this.elements.quizWord.textContent = q.word.word;
    
    this.elements.feedback.classList.remove('show', 'correct', 'wrong');
    this.elements.feedback.textContent = '';
    this.elements.nextBtn.classList.add('hidden');
    
    this.elements.optionsGrid.innerHTML = '';
    
    q.options.forEach((option) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = option.meaning_bn;
      
      btn.addEventListener('click', () => {
        if (!this.selected) {
          this.selectAnswer(btn, option, q);
        }
      });
      
      this.elements.optionsGrid.appendChild(btn);
    });
  },
  
  selectAnswer(button, selectedOption, question) {
    this.selected = true;
    
    const buttons = this.elements.optionsGrid.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    const isCorrect = selectedOption.meaning_bn === question.correct;
    
    if (isCorrect) {
      button.classList.add('correct');
      this.elements.feedback.textContent = '✓ Correct!';
      this.elements.feedback.classList.add('correct');
      this.score++;
    } else {
      button.classList.add('wrong');
      buttons.forEach(btn => {
        if (btn.textContent === question.correct) {
          btn.classList.add('reveal-correct');
        }
      });
      this.elements.feedback.textContent = `✗ Wrong! Correct: ${question.correct}`;
      this.elements.feedback.classList.add('wrong');
      
      // Save wrong answer
      this.wrongAnswers.push({
        word: question.word.word,
        meaning: question.word.meaning_bn,
        yourAnswer: selectedOption.meaning_bn
      });
    }
    
    this.elements.feedback.classList.add('show');
    this.elements.nextBtn.classList.remove('hidden');
    
    if (this.currentQuestion === this.questions.length - 1) {
      this.elements.nextBtn.textContent = 'See Results →';
    } else {
      this.elements.nextBtn.textContent = 'Next Question →';
    }
  },
  
  nextQuestion() {
    this.currentQuestion++;
    
    if (this.currentQuestion < this.questions.length) {
      this.showQuestion();
    } else {
      this.showResults();
    }
  },
  
  showResults() {
    this.elements.quizContainer.classList.add('hidden');
    this.elements.resultsContainer.classList.remove('hidden');
    
    const total = this.questions.length;
    const correct = this.score;
    const wrong = total - correct;
    const percentage = Math.round((correct / total) * 100);
    
    this.elements.scoreNumber.textContent = correct;
    this.elements.scoreTotal.textContent = `/${total}`;
    this.elements.accuracy.textContent = `${percentage}% Accuracy`;
    
    this.elements.scoreCircle.className = 'score-circle';
    if (percentage >= 80) {
      this.elements.scoreCircle.classList.add('excellent');
      this.elements.performanceMsg.textContent = 'Outstanding performance!';
    } else if (percentage >= 60) {
      this.elements.scoreCircle.classList.add('good');
      this.elements.performanceMsg.textContent = 'Good job! Keep practicing!';
    } else {
      this.elements.scoreCircle.classList.add('needs-practice');
      this.elements.performanceMsg.textContent = 'Keep practicing! Review the words!';
    }
    
    this.elements.correctCount.textContent = correct;
    this.elements.wrongCount.textContent = wrong;
    this.elements.percentage.textContent = percentage + '%';
    
    // Show wrong words list
    this.renderWrongWords();
  },
  
  renderWrongWords() {
    this.elements.wrongWordsList.innerHTML = '';
    
    if (this.wrongAnswers.length === 0) {
      this.elements.wrongWordsSection.classList.add('hidden');
      return;
    }
    
    this.elements.wrongWordsSection.classList.remove('hidden');
    
    this.wrongAnswers.forEach(item => {
      const div = document.createElement('div');
      div.className = 'wrong-word-item';
      div.innerHTML = `
        <span class="wrong-word-en">${item.word}</span>
        <span class="wrong-word-bn">${item.meaning}</span>
      `;
      this.elements.wrongWordsList.appendChild(div);
    });
  },
  
  restart() {
    this.showModeSelection();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ExamPage.init();
});
