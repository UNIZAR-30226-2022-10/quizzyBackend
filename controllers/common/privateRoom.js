/*
 * Author: Jaime Martín Trullén (795306)
 * Filename: privateRoom.js
 * Module: controllers/common
 * Description: private room
 */

const Room = require('./room');

class PrivateRoom extends Room {
    constructor(rid) {
        super(rid);
    }
}

module.exports = PrivateRoom;