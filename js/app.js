// Main application initialization
class App {
    static init() {
        console.log('Vocab Master initialized');
        this.setupEventListeners();
    }

    static setupEventListeners() {
        // Add any global event listeners here
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
