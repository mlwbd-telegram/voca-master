// Learn page functionality
class LearnPage {
    constructor() {
        this.currentWordIndex = 0;
        this.words = [];
        this.init();
    }

    async init() {
        this.words = await DataLoader.init();
        this.currentWordIndex = 0;
        this.displayCurrentWord();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('show-meaning-btn').addEventListener('click', () => {
            this.showMeaning();
        });

        document.getElementById('mark-learned-btn').addEventListener('click', () => {
            this.markAsLearned();
        });

        document.getElementById('next-word-btn').addEventListener('click', () => {
            this.nextWord();
        });
    }

    displayCurrentWord() {
        if (this.words.length === 0) return;

        const word = this.words[this.currentWordIndex];
        document.getElementById('word-display').textContent = word.word;
        document.getElementById('pos-display').textContent = word.part_of_speech || '';
        
        // Reset flashcard state
        const flashcard = document.getElementById('flashcard');
        flashcard.classList.remove('flipped');
        
        // Reset buttons
        document.getElementById('show-meaning-btn').style.display = 'block';
        document.getElementById('mark-learned-btn').style.display = 'block';
        document.getElementById('mark-learned-btn').disabled = false;
        
        // Update progress text
        document.getElementById('show-meaning-btn').textContent = 'Show Meaning';
    }

    showMeaning() {
        const flashcard = document.getElementById('flashcard');
        flashcard.classList.add('flipped');
        
        const word = this.words[this.currentWordIndex];
        document.getElementById('meaning-display').textContent = word.definition_bn;
        document.getElementById('definition-display').textContent = `Definition: ${word.definition_en}`;
        document.getElementById('example-display').textContent = `Example: ${word.example_en}`;
        document.getElementById('example-display').textContent += ` (${word.example_bn})`;
        document.getElementById('synonyms-display').textContent = `Synonyms: ${word.synonyms.join(', ')}`;
        
        document.getElementById('show-meaning-btn').textContent = 'Hide Meaning';
    }

    markAsLearned() {
        if (this.words.length === 0) return;
        
        const word = this.words[this.currentWordIndex];
        Progress.markWordAsLearned(word.word);
        UI.showToast(`${word.word} marked as learned!`);
        document.getElementById('mark-learned-btn').disabled = true;
    }

    nextWord() {
        this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
        this.displayCurrentWord();
    }
}

// Initialize learn page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LearnPage();
});
