// Progress tracking module
class Progress {
    static STORAGE_KEY = 'vocab_master_progress';

    static getProgress() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error parsing progress data:', e);
            }
        }
        
        return {
            learnedWords: [],
            quizAttempts: 0,
            correctAnswers: 0,
            totalAnswers: 0
        };
    }

    static saveProgress(progress) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
        } catch (e) {
            console.error('Error saving progress:', e);
        }
    }

    static markWordAsLearned(word) {
        const progress = this.getProgress();
        if (!progress.learnedWords.includes(word)) {
            progress.learnedWords.push(word);
            this.saveProgress(progress);
        }
    }

    static unmarkWordAsLearned(word) {
        const progress = this.getProgress();
        progress.learnedWords = progress.learnedWords.filter(w => w !== word);
        this.saveProgress(progress);
    }

    static recordQuizAttempt(correct, total) {
        const progress = this.getProgress();
        progress.quizAttempts += 1;
        progress.correctAnswers += correct;
        progress.totalAnswers += total;
        this.saveProgress(progress);
    }

    static resetProgress() {
        const defaultProgress = {
            learnedWords: [],
            quizAttempts: 0,
            correctAnswers: 0,
            totalAnswers: 0
        };
        this.saveProgress(defaultProgress);
    }
}
