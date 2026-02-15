// Quiz page functionality
class QuizPage {
    constructor() {
        this.words = [];
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.currentQuestion = null;
        this.quizActive = true;
        this.init();
    }

    async init() {
        this.words = await DataLoader.init();
        this.generateQuestions();
        this.displayQuestion();
        this.updateProgress();
        this.setupEventListeners();
    }

    generateQuestions() {
        // Get 10 random words
        const randomWords = DataLoader.getRandomWords(10);
        
        this.questions = randomWords.map(word => {
            const options = UI.generateOptions(
                word.definition_bn,
                this.words,
                [word]
            );
            
            return {
                word: word,
                correctAnswer: word.definition_bn,
                options: options
            };
        });
    }

    displayQuestion() {
        if (this.questions.length === 0) return;
        
        const question = this.questions[this.currentIndex];
        this.currentQuestion = question;
        
        document.getElementById('quiz-question').textContent = question.word.word;
        
        const optionButtons = document.querySelectorAll('.option-btn');
        question.options.forEach((option, index) => {
            optionButtons[index].textContent = option;            optionButtons[index].className = 'option-btn';
            optionButtons[index].disabled = false;
        });
        
        document.getElementById('quiz-feedback-text').textContent = '';
        document.getElementById('next-quiz-btn').classList.add('hidden');
        
        // Update counter
        document.getElementById('question-counter').textContent = `${this.currentIndex + 1}/${this.questions.length}`;
    }

    setupEventListeners() {
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (!this.quizActive) return;
                this.handleOptionClick(e.target);
            });
        });
        
        document.getElementById('next-quiz-btn').addEventListener('click', () => {
            this.nextQuestion();
        });
        
        document.getElementById('retry-quiz-btn').addEventListener('click', () => {
            this.restartQuiz();
        });
    }

    handleOptionClick(selectedButton) {
        if (!this.quizActive) return;
        
        const selectedText = selectedButton.textContent;
        const isCorrect = selectedText === this.currentQuestion.correctAnswer;
        
        if (isCorrect) {
            this.score++;
        }
        
        // Disable all buttons
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Highlight answers
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.textContent === this.currentQuestion.correctAnswer) {
                btn.classList.add('correct');
            } else if (btn === selectedButton && !isCorrect) {
                btn.classList.add('incorrect');            }
        });
        
        // Show feedback
        const feedbackText = document.getElementById('quiz-feedback-text');
        if (isCorrect) {
            feedbackText.textContent = 'Correct!';
            feedbackText.style.color = 'var(--success-color)';
        } else {
            feedbackText.textContent = `Incorrect. Correct answer: ${this.currentQuestion.correctAnswer}`;
            feedbackText.style.color = 'var(--error-color)';
        }
        
        // Show next button
        document.getElementById('next-quiz-btn').classList.remove('hidden');
    }

    nextQuestion() {
        this.currentIndex++;
        
        if (this.currentIndex < this.questions.length) {
            this.displayQuestion();
            this.updateProgress();
        } else {
            this.endQuiz();
        }
    }

    updateProgress() {
        const progressPercent = ((this.currentIndex) / this.questions.length) * 100;
        document.getElementById('quiz-progress').style.width = `${progressPercent}%`;
    }

    endQuiz() {
        this.quizActive = false;
        document.getElementById('quiz-content').classList.add('hidden');
        
        const accuracy = Math.round((this.score / this.questions.length) * 100);
        
        document.getElementById('score-display').textContent = this.score;
        document.getElementById('accuracy-display').textContent = `${accuracy}%`;
        
        document.getElementById('result-screen').classList.remove('hidden');
        
        // Record quiz attempt
        Progress.recordQuizAttempt(this.score, this.questions.length);
    }

    restartQuiz() {
        this.currentIndex = 0;        this.score = 0;
        this.quizActive = true;
        
        this.generateQuestions();
        
        document.getElementById('result-screen').classList.add('hidden');
        document.getElementById('quiz-content').classList.remove('hidden');
        
        this.displayQuestion();
        this.updateProgress();
    }
}

// Initialize quiz page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizPage();
});
