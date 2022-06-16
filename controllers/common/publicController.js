/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: publicController.js
 * Module: controllers/common
 * Description: online game controller for public games
 */

const PublicGameFactory = require('./publicGameFactory');
const UserQueue = require("./userQueue");
const Controller = require("./controller");

const config = require('../../config');

class PublicController extends Controller {

    /**
     * Initialize a new online public controller
     * @param {io} io The socket.io server handler
     */
    constructor(io) {

        super(io)

        // matchmaking queue
        this.queue = new UserQueue();

        // game timeout reference
        this.gameTimeout = null;

        // turn timeout reference
        this.turnTimeout = null;

        // factories
        this.publicGameFactory = new PublicGameFactory();
    }

    getEnqueuedUsers() {
        return this.queue.length();
    }

    /**
     * Enqueue a user for public matchmaking.
     * 
     * If the user is already in the queue, this function will throw an exception.
     * @param {User} user The user to add into the queue
     * @returns {String}
     */
    enqueueUser(user) {
        // Try to enqueue user in queue
        this.queue.enqueue(user);

        // prepare room and add to active rooms if possible
        if ( this.queue.length() >= config.publicRoomMaxPlayers ) {
            // create a new room with 6 players

            let users = [];
            for ( var i = 0; i < config.publicRoomMaxPlayers; i++ ) {
                users.push(this.queue.dequeue());
            }

            // add game to list of active games
            let game = this.publicGameFactory.createGame(users, this.serversocket);

            this.activeGames[game.room.rid] = game;

            this.serversocket.to(game.room.rid).emit('server:public:joined', { rid : game.room.rid } );

            game.startGame();
        }

        // Reset online timer
        this.resetOnlineTimer();
        
        if ( this.queue.length() >= config.publicRoomMinPlayers ) {

            this.gameTimeout = setTimeout(() => {
                // create a new room with every player remaining in the room
                
                let users = [];
                while ( this.queue.length() > 0 ) {
                    users.push(this.queue.dequeue());
                }
                
                // add game to list of active games
                let game = this.publicGameFactory.createGame(users, this.serversocket);

                this.activeGames[game.room.rid] = game;

                this.serversocket.to(game.room.rid).emit('server:public:joined', { rid : game.room.rid });

                game.startGame();

            }, config.publicRoomTimeout);
        }
        // this.print()
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

        if ( this.queue.length() < config.publicRoomMinPlayers ) {
            // Reset online timer
            this.resetOnlineTimer();
        }
        
        // print game state
        // this.print();
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
}

module.exports = PublicController;