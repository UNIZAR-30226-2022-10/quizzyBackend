/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: publicController.js
 * Module: controllers/common
 * Description: online game controller for public games
 */

const PublicRoomFactory = require('./publicRoomFactory');
const UserQueue = require("./userQueue");

class PublicController {

    constructor() {
        // matchmaking queue
        this.queue = new UserQueue();

        // game timeout reference
        this.gameTimeout = null;

        // list of active rooms
        this.activeRooms = {};

        // factories
        this.publicRoomFactory = new PublicRoomFactory();
    }

    /**
     * Enqueue a user for public matchmaking.
     * 
     * If the user is already in the queue, this function will throw an exception
     * @param {User} user The user to add into the queue
     * @returns 
     */
    enqueue(user) {
        // Try to enqueue user in queue
        this.queue.enqueue(user);

        // prepare room and add to active rooms if possible
        if ( this.queue.length() >= 6 ) {
            // create a new room with 6 players
            console.log("full game starts");

            let users = [];
            for ( var i = 0; i < 6; i++ ) {
                users.push(this.queue.dequeue());
            }

            // add room to list of active rooms
            this.activeRooms.roomUuid = this.publicRoomFactory.createRoom(users);
            
        } else if ( this.queue.length() >= 2 ) {
            // if timeout exists, reset timer
            if ( this.gameTimeout )
                clearTimeout(this.gameTimeout);
            this.gameTimeout = setTimeout(() => {
                // create a new room with every player remaining in the room
                console.log("game starts");
                
                let users = [];
                while ( this.queue.length() > 0 ) {
                    users.push(this.queue.dequeue());
                }
                // add room to list of active rooms
                this.activeRooms.roomUuid = this.publicRoomFactory.createRoom(users);
                this.print()
            }, 15000);
        }
        this.print()
    }


    removeUser(nickname) {
        // remove
        this.queue.delete(nickname);

        // print game state
        this.print()
    }

    print() {
        console.log(this.queue);
        console.log(this.activeRooms);
    }
}

module.exports = PublicController;