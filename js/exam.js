/**
 * Vocab Master - Exam Page Logic
 */

const ExamPage = {
  mode: null, // 'learned' or 'full'
  questions: [],
  currentQuestion: 0,
  score: 0,
  answers: [],
  
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
      
      // Mode buttons
      modeLearned: document.getElementById('mode-learned'),
      modeFull: document.getElementById('mode-full'),
      
      // Quiz elements
      questionCounter: document.getElementById('question-counter'),
      quizWord: document.getElementById('quiz-word'),
      optionsGrid: document.getElementById('options-grid'),
      feedback: document.getElementById('feedback'),
      nextBtn: document.getElementById('next-btn'),
      
      // Results elements
      scoreCircle: document.getElementById('score-circle'),
      scoreNumber: document.getElementById('score-number'),
      scoreTotal: document.getElementById('score-total'),
      accuracy: document.getElementById('accuracy'),
      performanceMsg: document.getElementById('performance-msg'),
      correctCount: document.getElementById('correct-count'),
      wrongCount: document.getElementById('wrong-count'),
      percentage: document.getElementById('percentage'),
      restartBtn: document.getElementById('restart-btn'),
      homeBtn: document.getElementById('home-btn')
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
    this.answers = [];
    
    // Generate questions
    if (mode === 'learned') {
      const learnedWords = App.getLearnedWordsData();
      if (learnedWords.length === 0) {
        alert('No learned words yet! Go to Learn page and mark some words as learned first.');
        return;
      }
      if (learnedWords.length < 4) {
        alert('Please learn at least 4 words before taking this quiz.');
        return;
      }
      this.questions = this.generateQuestions(learnedWords, Math.min(10, learnedWords.length));
    } else {
      this.questions = this.generateQuestions(App.words, 10);
    }
    
    this.elements.modeSelection.classList.add('hidden');
    this.elements.quizContainer.classList.remove('hidden');
    this.elements.resultsContainer.classList.add('hidden');
    
    this.showQuestion();
  },
  
  generateQuestions(wordList, count) {
    const shuffled = App.shuffleArray([...wordList]);
    const selected = shuffled.slice(0, count);
    
    return selected.map(word => ({
      word: word,
      options: App.generateOptions(word, 4),
      correct: word.meaning_bn
    }));
  },
  
  showQuestion() {
    const q = this.questions[this.currentQuestion];
    
    // Update counter
    this.elements.questionCounter.innerHTML = `
      Question <span>${this.currentQuestion + 1}</span> / ${this.questions.length}
    `;
    
    // Show word
    this.elements.quizWord.textContent = q.word.word;
    
    // Clear previous state
    this.elements.feedback.classList.remove('show', 'correct', 'wrong');
    this.elements.feedback.textContent = '';
    this.elements.nextBtn.classList.add('hidden');
    
    // Generate options
    this.elements.optionsGrid.innerHTML = '';
    q.options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = option.meaning_bn;
      btn.addEventListener('click', () => this.selectAnswer(btn, option, q));
      this.elements.optionsGrid.appendChild(btn);
    });
  },
  
  selectAnswer(button, selectedOption, question) {
    // Disable all buttons
    const buttons = this.elements.optionsGrid.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    const isCorrect = selectedOption.meaning_bn === question.correct;
    
    if (isCorrect) {
      button.classList.add('correct');
      this.elements.feedback.textContent = '✓ Correct!';
      this.elements.feedback.classList.add('correct');
      this.score++;
      this.answers.push({ correct: true, word: question.word.word });
    } else {
      button.classList.add('wrong');
      // Highlight correct answer
      buttons.forEach(btn => {
        if (btn.textContent === question.correct) {
          btn.classList.add('reveal-correct');
        }
      });
      this.elements.feedback.textContent = `✗ Wrong! Correct: ${question.correct}`;
      this.elements.feedback.classList.add('wrong');
      this.answers.push({ correct: false, word: question.word.word, correctAnswer: question.correct });
    }
    
    this.elements.feedback.classList.add('show');
    this.elements.nextBtn.classList.remove('hidden');
    
    // Auto advance after delay if not last question
    if (this.currentQuestion < this.questions.length - 1) {
      setTimeout(() => this.nextQuestion(), 1500);
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
    
    // Update score display
    this.elements.scoreNumber.textContent = correct;
    this.elements.scoreTotal.textContent = `/${total}`;
    this.elements.accuracy.textContent = `${percentage}% Accuracy`;
    
    // Set circle color based on performance
    this.elements.scoreCircle.className = 'score-circle';
    if (percentage >= 80) {
      this.elements.scoreCircle.classList.add('excellent');
      this.elements.performanceMsg.textContent = 'Outstanding performance! You\'re mastering these words!';
    } else if (percentage >= 60) {
      this.elements.scoreCircle.classList.add('good');
      this.elements.performanceMsg.textContent = 'Good job! Keep practicing to improve further.';
    } else {
      this.elements.scoreCircle.classList.add('needs-practice');
      this.elements.performanceMsg.textContent = 'Keep practicing! Review the words and try again.';
    }
    
    // Update stats
    this.elements.correctCount.textContent = correct;
    this.elements.wrongCount.textContent = wrong;
    this.elements.percentage.textContent = percentage + '%';
  },
  
  restart() {
    this.showModeSelection();
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  ExamPage.init();
});
