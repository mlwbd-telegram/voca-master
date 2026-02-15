// Practice page functionality
class PracticePage {
    constructor() {
        this.learnedWords = [];
        this.allWords = [];
        this.currentIndex = 0;
        this.currentQuestion = null;
        this.questions = [];
        this.init();
    }

    async init() {
        this.allWords = await DataLoader.init();
        this.loadLearnedWords();
        
        if (this.learnedWords.length >= 4) {
            this.generateQuestions();
            this.displayQuestion();
            this.setupEventListeners();
        } else {
            document.getElementById('not-enough-words').classList.remove('hidden');
        }
    }

    loadLearnedWords() {
        const progress = Progress.getProgress();
        this.learnedWords = this.allWords.filter(word => 
            progress.learnedWords.includes(word.word)
        );
    }

    generateQuestions() {
        this.questions = [];
        
        for (let i = 0; i < Math.min(10, this.learnedWords.length); i++) {
            const word = this.learnedWords[i];
            const options = UI.generateOptions(
                word.definition_bn, 
                this.learnedWords, 
                [word]
            );
            
            this.questions.push({
                word: word,
                correctAnswer: word.definition_bn,
                options: options
            });
        }
    }
    displayQuestion() {
        if (this.questions.length === 0) return;
        
        const question = this.questions[this.currentIndex];
        this.currentQuestion = question;
        
        document.getElementById('practice-question').textContent = question.word.word;
        
        const optionButtons = document.querySelectorAll('.option-btn');
        question.options.forEach((option, index) => {
            optionButtons[index].textContent = option;
            optionButtons[index].className = 'option-btn';
        });
        
        document.getElementById('feedback-text').textContent = '';
        document.getElementById('next-practice-btn').classList.add('hidden');
    }

    setupEventListeners() {
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleOptionClick(e.target);
            });
        });
        
        document.getElementById('next-practice-btn').addEventListener('click', () => {
            this.nextQuestion();
        });
    }

    handleOptionClick(selectedButton) {
        const selectedText = selectedButton.textContent;
        const isCorrect = selectedText === this.currentQuestion.correctAnswer;
        
        // Disable all buttons
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Highlight correct answer
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.textContent === this.currentQuestion.correctAnswer) {
                btn.classList.add('correct');
            } else if (btn === selectedButton && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        // Show feedback        const feedbackText = document.getElementById('feedback-text');
        if (isCorrect) {
            feedbackText.textContent = 'Correct!';
            feedbackText.style.color = 'var(--success-color)';
        } else {
            feedbackText.textContent = `Incorrect. Correct answer: ${this.currentQuestion.correctAnswer}`;
            feedbackText.style.color = 'var(--error-color)';
        }
        
        // Show next button
        document.getElementById('next-practice-btn').classList.remove('hidden');
    }

    nextQuestion() {
        this.currentIndex = (this.currentIndex + 1) % this.questions.length;
        this.displayQuestion();
    }
}

// Initialize practice page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PracticePage();
});
