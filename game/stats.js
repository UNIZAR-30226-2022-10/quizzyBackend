/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: stats.js
 * Module: controllers/common
 * Description: user stats in a match
 */

const { categories } = require("../utils/misc");

class Stats {
    constructor() {
        this.correctAnswers = 0;
        this.totalAnswers = 0;

        // Mapping between token categories and whether the user
        // has that token or not.
        this.tokens = {};
        categories.forEach(c => this.tokens[c] = false);
    }
}

module.exports = Stats