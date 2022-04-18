/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: publicRoomFactory.js
 * Module: controllers/common
 * Description: public room factory object
 */

const { v4: uuid } = require('uuid');

const Room = require('./room');

class PublicRoomFactory {

    createRoom(users) {

        // generate random room
        let roomUuid = uuid();

        let room = new Room(roomUuid);
        for ( var user in users ) {
            room.addUser(user);
        }

        return room;
    }
}

module.exports = PublicRoomFactory;