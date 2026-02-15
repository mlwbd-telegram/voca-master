// Review page functionality
class ReviewPage {
    constructor() {
        this.words = [];
        this.learnedWords = [];
        this.filteredWords = [];
        this.init();
    }

    async init() {
        this.words = await DataLoader.init();
        this.loadLearnedWords();
        this.renderWordsList();
        this.setupEventListeners();
    }

    loadLearnedWords() {
        const progress = Progress.getProgress();
        this.learnedWords = this.words.filter(word => 
            progress.learnedWords.includes(word.word)
        );
        this.filteredWords = [...this.learnedWords];
    }

    renderWordsList() {
        const container = document.getElementById('words-list');
        container.innerHTML = '';
        
        if (this.filteredWords.length === 0) {
            container.innerHTML = '<li class="no-results">No words found</li>';
            return;
        }
        
        this.filteredWords.forEach(word => {
            const li = document.createElement('li');
            li.className = 'word-item';
            
            li.innerHTML = `
                <div class="word-info">
                    <div class="word-name">${word.word}</div>
                    <div class="word-meaning">${word.definition_bn}</div>
                </div>
                <button class="remove-btn" data-word="${word.word}">Remove</button>
            `;
            
            container.appendChild(li);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const wordToRemove = e.target.getAttribute('data-word');
                this.removeWord(wordToRemove);
            });
        });
    }

    setupEventListeners() {
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterWords(e.target.value);
        });
    }

    filterWords(query) {
        query = query.toLowerCase().trim();
        
        if (query === '') {
            this.filteredWords = [...this.learnedWords];
        } else {
            this.filteredWords = this.learnedWords.filter(word => 
                word.word.toLowerCase().includes(query) || 
                word.definition_bn.toLowerCase().includes(query)
            );
        }
        
        this.renderWordsList();
    }

    removeWord(word) {
        if (confirm(`Are you sure you want to remove "${word}" from your learned words?`)) {
            Progress.unmarkWordAsLearned(word);
            this.loadLearnedWords(); // Reload learned words
            this.filterWords(document.getElementById('search-input').value); // Reapply filter
            UI.showToast(`${word} removed from learned words`);
        }
    }
}

// Initialize review page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReviewPage();
});
