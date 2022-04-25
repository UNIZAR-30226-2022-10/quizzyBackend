/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: gameState.js
 * Module: controllers/common
 * Description: game state class that implements the game logic
 */

const Board = require("./board");

class GameState {

    board
    constructor() {
        this.board = new Board();
    }
}

module.exports = GameState;