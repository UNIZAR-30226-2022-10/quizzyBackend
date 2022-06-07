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

    static nextCode = 0;

    /**
     * Create a new room and join every user's socket to the Socket.io room.
     * @param {Array} users The list of user objects
     * @returns The newly created room
     */
    createGame(nickname, turnTimeout, difficulty, wildcardsEnable, serversocket) {

        // generate random room
        let roomUuid = PrivateGameFactory.nextCode++;

        let roomManager = nickname;

        let room = new PrivateRoom(roomUuid);
            room.addUser(nickname);
            nickname.socket.join(roomUuid);

        return new PrivateGameController(room, roomManager, turnTimeout, difficulty, wildcardsEnable, serversocket);
    }
}

module.exports = PrivateGameFactory;