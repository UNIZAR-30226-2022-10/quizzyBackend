/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: publicRoom.js
 * Module: controllers/common
 * Description: public room
 */

const GameController = require('./gameController');
const Room = require('./room');

class PublicRoom extends Room {
    gameController

    constructor() {
        this.gameController = new GameController();
    }
}

module.exports = PublicRoom;