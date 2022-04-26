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
    constructor(users) {
        this.board = new Board();
        this.stats = {}

        users.forEach(u => {
            this.stats[u] = new Stats();
        });
    }
}

module.exports = GameState;