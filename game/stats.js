/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: stats.js
 * Module: controllers/common
 * Description: user stats in a match
 */

class Stats {
    constructor() {
        this.correctAnswers = Array(6).fill(0);
        this.totalAnswers = Array(6).fill(0);

        // true if the user has the i-th category token, false otherwise. 
        this.tokens = Array(6).fill(false);
    }

    addAnswer(category, outcome) {
        // Check if category is invalid
        if ( category < 0 || category >= 6 )
            throw new Error("Invalid category");

        // If the question out
        if ( outcome )
            this.correctAnswers[category]++;

        this.totalAnswers[category]++;
    }

    addToken(category) {
        if ( category < 0 || category >= 6 )
            throw new Error("Invalid category");

        this.tokens[category] = true;
    }
}

module.exports = Stats