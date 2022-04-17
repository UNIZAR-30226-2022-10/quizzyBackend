/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: room.js
 * Module: controllers/common
 * Description: Room object
 */

const { User } = require('./userQueue');

class Room {
    /**
     * Create a new room
     */
    constructor(rid) {
        // room id
        this.rid = rid;

        // nickname to user mapping for efficient access
        this.users = {};
    }

    /**
     * Add a new user to the room. If the user is already in the room,
     * this function will throw an exception.
     * @param {User} user The user object to insert in the room.
     */
    addUser(user) {
        if ( this.users[user.nickname] ) {
            throw new Error("User is already in this room");
        }

        // map nickname to user object
        this.users[user.nickname] = user;
    }

    /**
     * Remove user from room. If the user can't be found, this function
     * will throw an exception.
     * @param {String} nickname The nickname of the user to delete.
     */
    removeUser(nickname) {
        if ( !this.users[nickname] ) {
            throw new Error("User can't be found in this room");
        }

        // delete map entry
        delete this.users[nickname];
    }
}

module.exports = Room;