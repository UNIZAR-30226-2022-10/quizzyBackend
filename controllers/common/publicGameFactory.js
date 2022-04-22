/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: publicRoomFactory.js
 * Module: controllers/common
 * Description: public room factory object
 */

const { v4: uuid } = require('uuid');

const Room = require('./room');
const PublicGameController = require('./publicGameController');

class PublicGameFactory {

    /**
     * Create a new room and join every user's socket to the Socket.io room.
     * @param {Array} users The list of user objects
     * @returns The newly created room
     */
    createGame(users) {

        // generate random room
        let roomUuid = uuid();

        let room = new Room(roomUuid);
        users.forEach(user => {
            room.addUser(user);
            user.socket.join(roomUuid);
        })

        return new PublicGameController(room);
    }
}

module.exports = PublicGameFactory;