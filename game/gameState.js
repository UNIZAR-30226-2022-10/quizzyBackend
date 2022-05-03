/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: gameState.js
 * Module: controllers/common
 * Description: game state class that implements the game logic
 */

const Board = require("./board");
const Stats = require("./stats");

class GameState {

    board

    /**
     * Create a new game state object
     * @param {Array} users The list of the users' nicknames playing the game 
     */
    constructor(users) {
        this.board = new Board();
        this.stats = {}

        users.forEach(u => {
            this.stats[u] = new Stats();
        });
    }

    /**
     * Move player to pos.
     * If the user is not playing this game or the position is invalid,
     * this function will throw an exception.
     * @param {String} nickname The user's nickname
     * @param {BigInt} pos The new position 
     * @returns The cell to which the user moves.
     */
    getPlayerPos(nickname, pos) {
        if ( !this.stats[nickname] ) {
            throw new Error("User can't be found");
        }

        return this.stats[nickname].position
    }

    /**
     * Move player to pos.
     * If the user is not playing this game or the position is invalid,
     * this function will throw an exception.
     * @param {String} nickname The user's nickname
     * @param {BigInt} pos The new position 
     * @returns The cell to which the user moves.
     */
    movePlayer(nickname, pos) {
        if ( !this.stats[nickname] ) {
            throw new Error("User can't be found");
        }

        let cell = this.board.getCell(pos);

        this.stats[nickname].position = pos;

        return cell;
    }

    /**
     * Find the reachable cells which are at a certain distance from a user's 
     * current position.
     * @param {String} nickname The user's nickname
     * @param {String} distance The distance to any of the reachable cells
     * @returns {Array} An array with the reachable cells' identifiers.
     */
    findReachableCells(nickname, distance) {
        if ( !this.stats[nickname] ) {
            throw new Error("User can't be found");
        }

        return this.board.findReachableCells(this.stats[nickname].position, distance);
    }

    /**
     * Add a new answer outcome to the user's stats.
     * @param {String} nickname The user's nickname
     * @param {BigInt} category The question's category
     * @param {Boolean} outcome True if the question was answered correctly, false otherwise
     */
    addAnswer(nickname, category, outcome) {
        if ( !this.stats[nickname] ) {
            throw new Error("User can't be found");
        }

        this.stats[nickname].addAnswer(category, outcome);
    }

    /**
     * Add a new token to the user's stats.
     * @param {String} nickname The user's nickname
     * @param {BigInt} category The question's category
     */
    addToken(nickname, category) {
        if ( !this.stats[nickname] ) {
            throw new Error("User can't be found");
        }

        this.stats[nickname].addAnswer(category);
    }

    /**
     * Check if the user has won the match
     * @param {String} nickname The user's nickname
     * @returns {Boolean} True if the user has every token
     */
    hasWon(nickname) {
        if ( !this.stats[nickname] ) {
            throw new Error("User can't be found");
        }

        return this.stats[nickname].hasWon();
    }
}

module.exports = GameState;