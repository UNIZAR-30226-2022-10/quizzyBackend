/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: publicController.js
 * Module: controllers/common
 * Description: online game controller for public games
 */

const PublicRoomFactory = require('./publicRoomFactory');
const UserQueue = require("./userQueue");

class PublicController {

    /**
     * Initialize a new online public controller
     * @param {io} io The socket.io server handler
     */
    constructor(io) {

        // server socket 
        this.serversocket = io;

        // matchmaking queue
        this.queue = new UserQueue();

        // game timeout reference
        this.gameTimeout = null;

        this.activeRooms = {};

        // factories
        this.publicRoomFactory = new PublicRoomFactory();
    }

    /**
     * Enqueue a user for public matchmaking.
     * 
     * If the user is already in the queue, this function will throw an exception.
     * @param {User} user The user to add into the queue
     * @returns {String}
     */
    enqueue(user) {
        // Try to enqueue user in queue
        this.queue.enqueue(user);

        // prepare room and add to active rooms if possible
        if ( this.queue.length() >= 6 ) {
            // create a new room with 6 players

            let users = [];
            for ( var i = 0; i < 6; i++ ) {
                users.push(this.queue.dequeue());
            }

            // add room to list of active rooms
            let room = this.publicRoomFactory.createRoom(users);

            this.activeRooms[room.rid] = room;

            this.serversocket.to(room.rid).emit('public:server:joined', { rid : room.rid })
        } 

        // Reset online timer
        this.resetOnlineTimer();
        
        if ( this.queue.length() >= 2 ) {

            this.gameTimeout = setTimeout(() => {
                // create a new room with every player remaining in the room
                
                let users = [];
                while ( this.queue.length() > 0 ) {
                    users.push(this.queue.dequeue());
                }
                
                // add room to list of active rooms
                let room = this.publicRoomFactory.createRoom(users);

                this.activeRooms[room.rid] = room;

                this.serversocket.to(room.rid).emit('public:server:joined', { rid : room.rid })
            }, 15000);
        }
        this.print()
    }

    /**
     * Remove a user from the matchmaking queue.
     * 
     * If the user isn't enqueued, this function will throw an exception.
     * @param {String} nickname The nickname of the user to remove from the queue
     */
    removeUser(nickname) {
        // remove
        this.queue.delete(nickname);

        if ( this.queue.length() < 2 ) {
            clearTimeout(this.gameTimeout);
        }
        
        // print game state
        this.print();
    }

    /**
     * Reset the online timeout for creating a room
     */
    resetOnlineTimer() {
        // if timeout exists, reset timer
        if ( this.gameTimeout )
            clearTimeout(this.gameTimeout);
            this.gameTimeout = null;
    }

    print() {
        console.log("queue : ", this.queue);
        console.log("rooms : ", this.activeRooms);
    }
}

module.exports = PublicController;