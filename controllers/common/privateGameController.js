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


    constructor(room, roomManager, turnTimeout, difficulty, wildcardsEnable, srvsock) {
        super(room, srvsock, false, turnTimeout, difficulty, wildcardsEnable);
        this.roomManager = roomManager;
    }

    addUser(user) {
        this.room.addUser(user);
        this.state.addUserStats(user.nickname);
        user.socket.join(this.room.rid);
    }

    restartGame() {
        
    }
}

module.exports = PrivateGameController;