/*
 * Author: Jaime Martín Trullén (801965)
 * Filename: privateGameController.js
 * Module: controllers/common
 * Description: game controller for each private room
 */

const GameController = require("./gameController");

/**
 * Object that controls the flow of a public game (including rematches)
 */
class PrivateGameController extends GameController {

    roomManager
    turnTimeout
    difficulty
    wildcardsEnable

    constructor(room, roomManager, turnTimeout, difficulty, categories, wildcardsEnable, srvsock) {
        super(room, srvsock, false);

        this.roomManager = roomManager;
        this.turnTimeout = turnTimeout;
        this.difficulty = difficulty;
        this.categories = categories
        this.wildcardsEnable = wildcardsEnable;
    }

    restartGame() {
        
    }
}

module.exports = PrivateGameController;