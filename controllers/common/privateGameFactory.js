/*
 * Author: Jaime Martín Trullén (801965)
 * Filename: privateGameFactory.js
 * Module: controllers/common
 * Description: private room factory object
 */

const { v4: uuid } = require('uuid');

const PrivateRoom = require('./privateRoom');
const PrivateGameController = require('./privateGameController');

class PrivateGameFactory {

    /**
     * Create a new room and join every user's socket to the Socket.io room.
     * @param {Array} users The list of user objects
     * @returns The newly created room
     */
    createGame(nickname, turnTimeout, difficulty, wildcardsEnable) {

        // generate random room
        let roomUuid = uuid();

        let roomManager = nickname;

        let room = new PrivateRoom(roomUuid);
            room.addUser(nickname);
            nickname.socket.join(roomUuid);

        return new PrivateGameController(room, roomManager, turnTimeout, difficulty, wildcardsEnable);
    }
}

module.exports = PrivateGameFactory;