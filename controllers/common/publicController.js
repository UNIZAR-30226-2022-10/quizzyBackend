/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: publicController.js
 * Module: controllers/common
 * Description: online game controller for public games
 */

const PublicRoomFactory = require('./publicGameFactory');
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

        this.activeGames = {};

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
    enqueueUser(user) {
        console.log("enqueuing")
        // Try to enqueue user in queue
        this.queue.enqueue(user);

        // prepare room and add to active rooms if possible
        if ( this.queue.length() >= 6 ) {
            // create a new room with 6 players

            let users = [];
            for ( var i = 0; i < 6; i++ ) {
                users.push(this.queue.dequeue());
            }

            // add game to list of active games
            let game = this.publicRoomFactory.createGame(users);

            this.activeGames[game.room.rid] = game;

            this.serversocket.to(game.room.rid).emit('public:server:joined', { rid : game.room.rid })
            
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
                
                // add game to list of active games
                let game = this.publicRoomFactory.createGame(users);

                this.activeGames[game.room.rid] = game;

                this.serversocket.to(game.room.rid).emit('public:server:joined', { rid : game.room.rid })
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
    dequeueUser(nickname) {
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

    startTurn(nickname) {

    }

    print() {
        console.log(this.queue);
        console.log(this.activeGames);
    }
}

module.exports = PublicController;