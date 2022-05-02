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
    movePlayer(nickname, pos) {
        if ( !this.stats[nickname] ) {
            throw new Error("User can't be found");
        }

        let cell = this.board.getCell(pos);

        this.stats[u].position = pos;

        return cell;
    }

    findReachableCells(nickname, distance) {
        if ( !this.stats[nickname] ) {
            throw new Error("User can't be found");
        }

        return this.board.findReachableCells(this.stats[nickname].position, distance);
    }
}

module.exports = GameState;