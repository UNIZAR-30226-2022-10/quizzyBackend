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

    constructor(room, roomManager, turnTimeout, difficulty, wildcardsEnable, srvsock) {
        super(room, srvsock);

        this.roomManager = roomManager;
        this.turnTimeout = turnTimeout;
        this.difficulty = difficulty;
        this.wildcardsEnable = wildcardsEnable;
    }

    restartGame() {
        
    }
}

module.exports = PrivateGameController;