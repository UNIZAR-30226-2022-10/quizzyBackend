/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: publicRoom.js
 * Module: controllers/common
 * Description: public room
 */

const Room = require('./room');

class PublicRoom extends Room {
    constructor(rid) {
        super(rid);
    }
}

module.exports = PublicRoom;