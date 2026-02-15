// UI utilities module
class UI {
    static showFlashcard(cardElement, flipped = false) {
        cardElement.classList.toggle('flipped', flipped);
    }

    static showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    }

    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    static generateOptions(correctMeaning, allWords, excludeCurrent = []) {
        const options = [correctMeaning];
        const otherWords = allWords.filter(word => !excludeCurrent.includes(word.word) && word.definition_bn !== correctMeaning);
        
        while (options.length < 4 && otherWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherWords.length);
            const randomWord = otherWords[randomIndex];
            if (!options.includes(randomWord.definition_bn)) {
                options.push(randomWord.definition_bn);
            }
            otherWords.splice(randomIndex, 1);
        }
        
        // Fill remaining slots if needed
        while (options.length < 4) {
            options.push("Unknown meaning");
        }
        
        return this.shuffleArray(options);
    }
}
