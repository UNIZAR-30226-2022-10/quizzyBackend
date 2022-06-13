/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: publicRoomFactory.js
 * Module: controllers/common
 * Description: public room factory object
 */

const PublicRoom = require('./publicRoom');
const PublicGameController = require('./publicGameController');

class PublicGameFactory {

    static nextCode = 0;

    /**
     * Create a new room and join every user's socket to the Socket.io room.
     * @param {Array} users The list of user objects
     * @returns The newly created room
     */
    createGame(users, serversocket) {

        // generate random room
        let roomUuid = PublicGameFactory.nextCode++;

        let room = new PublicRoom(roomUuid);
        users.forEach(user => {
            room.addUser(user);
            user.socket?.join(roomUuid);
        })

        return new PublicGameController(room, serversocket);
    }
}

module.exports = PublicGameFactory;