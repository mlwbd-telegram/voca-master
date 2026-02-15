class VocabularyQuiz {
    constructor() {
        this.words = [];
        this.currentWord = null;
        this.previousWord = null;
        this.currentOptions = [];
        this.score = 0;
        this.questionCount = 0;
        this.maxQuestions = 10;
        
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        this.startScreen = document.getElementById('start-screen');
        this.quizScreen = document.getElementById('quiz-screen');
        this.startBtn = document.getElementById('start-btn');
        this.wordElement = document.getElementById('word');
        this.optionsContainer = document.getElementById('options');
        this.feedbackElement = document.getElementById('feedback');
        this.nextBtn = document.getElementById('next-btn');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startQuiz());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
    }
    
    async startQuiz() {
        try {
            await this.loadWords();
            this.startScreen.classList.add('hidden');
            this.quizScreen.classList.remove('hidden');
            this.nextQuestion();
        } catch (error) {
            console.error('Error starting quiz:', error);
            this.feedbackElement.textContent = 'Failed to load words. Please refresh the page.';
            this.feedbackElement.className = 'feedback-incorrect';
        }
    }
    
    async loadWords() {
        const response = await fetch('words.json');
        if (!response.ok) {
            throw new Error('Failed to load words.json');
        }
        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {            throw new Error('Invalid or empty words.json file');
        }
        
        this.words = data;
    }
    
    nextQuestion() {
        if (this.questionCount >= this.maxQuestions) {
            this.endQuiz();
            return;
        }
        
        this.generateQuestion();
        this.displayQuestion();
        this.resetState();
    }
    
    generateQuestion() {
        if (this.words.length === 0) return;
        
        let availableWords = this.words;
        if (this.previousWord) {
            availableWords = this.words.filter(word => word.word !== this.previousWord.word);
        }
        
        if (availableWords.length === 0) {
            availableWords = this.words; // Fallback if only one word exists
        }
        
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        this.currentWord = availableWords[randomIndex];
        this.previousWord = this.currentWord;
        
        this.generateOptions();
    }
    
    generateOptions() {
        if (!this.currentWord) return;
        
        const correctAnswer = this.currentWord.definition_bn;
        const wrongAnswers = this.getWrongAnswers(3);
        
        this.currentOptions = [correctAnswer, ...wrongAnswers];
        this.shuffleArray(this.currentOptions);
    }
    
    getWrongAnswers(count) {
        if (this.words.length <= 1) {
            // If there's only one word, create dummy answers
            return Array(count).fill('অস্থায়ী উত্তর');        }
        
        const otherWords = this.words.filter(word => 
            word.word !== this.currentWord.word
        );
        
        const wrongAnswers = [];
        const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < count && i < shuffledOthers.length; i++) {
            wrongAnswers.push(shuffledOthers[i].definition_bn);
        }
        
        // If we don't have enough wrong answers, pad with dummy ones
        while (wrongAnswers.length < count) {
            wrongAnswers.push('অস্থায়ী উত্তর');
        }
        
        return wrongAnswers;
    }
    
    displayQuestion() {
        if (!this.currentWord) return;
        
        this.wordElement.textContent = this.currentWord.word;
        this.optionsContainer.innerHTML = '';
        
        this.currentOptions.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn';
            optionBtn.textContent = option;
            optionBtn.dataset.index = index;
            optionBtn.dataset.correct = option === this.currentWord.definition_bn;
            
            optionBtn.addEventListener('click', (e) => this.handleOptionClick(e));
            this.optionsContainer.appendChild(optionBtn);
        });
    }
    
    handleOptionClick(event) {
        const clickedBtn = event.target;
        const isCorrect = clickedBtn.dataset.correct === 'true';
        
        // Disable all buttons
        this.optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Highlight all correct answers
        this.optionsContainer.querySelectorAll('.option-btn[data-correct="true"]').forEach(btn => {            btn.classList.add('correct');
        });
        
        // Highlight clicked button
        clickedBtn.classList.add(isCorrect ? 'correct' : 'incorrect');
        clickedBtn.classList.add('selected');
        
        // Show feedback
        this.showFeedback(isCorrect);
        
        // Show next button
        this.nextBtn.classList.remove('hidden');
    }
    
    showFeedback(isCorrect) {
        if (isCorrect) {
            this.feedbackElement.textContent = 'Correct! Well done!';
            this.feedbackElement.className = 'feedback-correct';
            this.score++;
        } else {
            this.feedbackElement.textContent = `Incorrect. The correct answer is: ${this.currentWord.definition_bn}`;
            this.feedbackElement.className = 'feedback-incorrect';
        }
    }
    
    resetState() {
        this.feedbackElement.textContent = '';
        this.feedbackElement.className = '';
        this.nextBtn.classList.add('hidden');
        this.questionCount++;
    }
    
    endQuiz() {
        this.quizScreen.classList.add('hidden');
        this.startScreen.classList.remove('hidden');
        
        const finalMessage = `Quiz Complete! Your score: ${this.score} out of ${this.maxQuestions}.`;
        this.startBtn.textContent = finalMessage;
        
        // Reset for next quiz
        setTimeout(() => {
            this.startBtn.textContent = 'Start New Quiz';
            this.score = 0;
            this.questionCount = 0;
        }, 3000);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// Initialize the quiz when the module loads
document.addEventListener('DOMContentLoaded', () => {
    new VocabularyQuiz();
});
