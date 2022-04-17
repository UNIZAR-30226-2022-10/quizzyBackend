/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: publicController.js
 * Module: controllers/common
 * Description: online game controller for public games
 */

const { v4: uuid } = require('uuid')
const Room = require("./room");
const UserQueue = require("./userQueue");

class PublicController {

    constructor() {
        // matchmaking queue
        this.queue = new UserQueue();

        // game timeout reference
        this.gameTimeout = null;

        // list of active rooms
        this.activeRooms = {};
    }

    // i need to refactor this ASAP D:
    enqueue(user) {
        try {
            // Try to enqueue user in queue
            this.queue.enqueue(user);

            // prepare room and add to active rooms if possible
            if ( this.queue.length() >= 6 ) {
                // create a new room with 6 players
                console.log("full game starts");

                // generate random room
                let roomUuid = uuid();

                // TODO: public room factory
                let room = new Room(roomUuid);
                for ( var i = 0; i < 6; i++ ) {
                    room.addUser(this.queue.dequeue());
                }

                // add room to list of active rooms
                this.activeRooms.roomUuid = room;
                
            } else if ( this.queue.length() > 0 ) {
                // if timeout exists, reset timer
                if ( this.gameTimeout )
                    clearTimeout(this.gameTimeout);
                this.gameTimeout = setTimeout(() => {
                    // create a new room with every player remaining in the room
                    console.log("game starts -------------");
                    // generate random room
                    let roomUuid = uuid();

                    let room = new Room(roomUuid);
                    while ( this.queue.length() > 0 ) {
                        const user = this.queue.dequeue();
                        room.addUser(user);
                    }
                    // add room to list of active rooms
                    this.activeRooms.roomUuid = room;
                    this.print()
                }, 15000);
            }
        } catch (e) {
            console.log("user already enqueued")
            // dummy object for now
            return { ok: false };
        }
        this.print()
    }

    removeUser(nickname) {
        // remove
        try {
            this.queue.delete(user);
        } catch (e) {
            console.log("user not in queue")
        }
        // print game state
        console.log(JSON.stringify(this, null, 4));
    }

    print() {
        console.log(this.queue);
        console.log(this.activeRooms);
    }
}

module.exports = PublicController;