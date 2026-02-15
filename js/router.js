// Simple routing utility
class Router {
    static navigateTo(page) {
        window.location.href = page;
    }

    static getCurrentPage() {
        return window.location.pathname.split('/').pop();
    }

    static ensureDataLoaded() {
        if (!DataLoader.loaded) {
            UI.showToast('Data not loaded yet. Please wait...', 2000);
            return false;
        }
        return true;
    }

    static validatePageAccess(requiredMinLearnedWords = 0) {
        const progress = Progress.getProgress();
        if (progress.learnedWords.length < requiredMinLearnedWords) {
            UI.showToast(`You need at least ${requiredMinLearnedWords} learned words for this feature.`, 3000);
            return false;
        }
        return true;
    }
}
