// Data loader module
class DataLoader {
    static words = [];
    static loaded = false;

    static async init() {
        if (this.loaded) return this.words;
        
        try {
            const response = await fetch('./data/words.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.words = await response.json();
            this.loaded = true;
            return this.words;
        } catch (error) {
            console.error('Error loading words:', error);
            // Return sample data for demo purposes
            this.words = [
                {
                    word: "sample",
                    part_of_speech: "noun",
                    definition_en: "a small part or quantity intended to show what the whole is like",
                    definition_bn: "একটি ছোট অংশ বা পরিমাণ যা সম্পূর্ণটির মতো দেখানোর জন্য উদ্দিষ্ট",
                    example_en: "This is just a sample.",
                    example_bn: "এটি কেবলমাত্র একটি নমুনা।",
                    synonyms: ["specimen", "example"],
                    level: 1
                }
            ];
            this.loaded = true;
            return this.words;
        }
    }

    static getWords() {
        return this.words;
    }

    static getRandomWords(count) {
        const shuffled = [...this.words].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    static getRandomWord() {
        if (this.words.length === 0) return null;
        return this.words[Math.floor(Math.random() * this.words.length)];
    }
}
