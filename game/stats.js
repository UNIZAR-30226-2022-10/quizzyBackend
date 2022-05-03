/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: stats.js
 * Module: controllers/common
 * Description: user stats in a match
 */

class Stats {
    position
    constructor() {
        this.correctAnswers = Array(6).fill(0);
        this.totalAnswers = Array(6).fill(0);

        // true if the user has the i-th category token, false otherwise. 
        this.tokens = Array(6).fill(false);
        this.position = 0;
    }

    /**
     * Add a new answer outcome to the user's stats.
     * @param {BigInt} category The question's category
     * @param {Boolean} outcome True if the question was answered correctly, false otherwise
     */
    addAnswer(category, outcome) {
        // Check if category is invalid
        if ( category < 0 || category >= 6 )
            throw new Error("Invalid category");

        // If the question out
        if ( outcome )
            this.correctAnswers[category]++;

        this.totalAnswers[category]++;
    }

    /**
     * Add a new token to the user's stats.
     * @param {BigInt} category The question's category
     */
    addToken(category) {
        if ( category < 0 || category >= 6 )
            throw new Error("Invalid category");

        this.tokens[category] = true;
    }

    /**
     * Check if the user has won the match
     * @returns {Boolean} True if the user has every token
     */
    hasWon() {
        return this.tokens.every(token => token)
    }
}

module.exports = Stats