/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: publicGameController.js
 * Module: controllers/common
 * Description: game controller for each public room
 */

const GameController = require("./gameController");

/**
 * Object that controls the flow of a public game (including rematches)
 */
class PublicGameController extends GameController {
    constructor(room, srvsock) {
        super(room, srvsock, true, 15000, null, true);
    }

    restartGame() {
        
    }
}

module.exports = PublicGameController;