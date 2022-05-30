/*
 * Author: Jaime Martín Trullén (801965) && Darío Marcos Casalé (795306)
 * Filename: privateController.js
 * Module: controllers/common
 * Description: online game controller for private games
 */

const PrivateRoomFactory = require('./privateGameFactory');
const Controller = require("./controller");
const config = require('../../config');

class PrivateController extends Controller {

    /**
     * Initialize a new online private controller
     * @param {io} io The socket.io server handler
     */
    constructor(io) {

        super(io)

        // factories
        this.privateRoomFactory = new PrivateRoomFactory();
    }

    /**
     * Create a new private room
     * @param {String} user The user who creates the new game
     * @param {BigInt} turnTimeout The number of seconds after the question times out.
     * @param {String} difficulty The game difficulty.
     * @param {Boolean} wildcardsEnable A flag that enables wildcards when set to true.
     * @returns {BigInt} The new room id
     */
    createPrivateGame(user, turnTimeout, difficulty, categories, wildcardsEnable){
        let game = this.privateRoomFactory.createGame(user, turnTimeout, difficulty, categories, wildcardsEnable, this.serversocket);
    
        this.activeGames[game.room.rid] = game;
        return game.room.rid;
    }

    /**
     * Try to start a game. If the game doesn't exist, the user isn't the leader or 
     * there aren't enough players to start the game, this function will throw an
     * exception.
     * @param {BigInt} rid The room id
     * @param {User} user The user who wants to start the game
     */
    startPrivateGame(rid, user){
        if ( !this.activeGames[rid] ) 
            throw new Error("This game doesn't exist");

        if (user.nickname !== this.activeGames[rid].roomManager.nickname)
            throw new Error("You must be the room manager to start the game");


        if ( Object.keys(this.activeGames[rid].room.users).length < config.privateRoomMinPlayers )
            throw new Error("There should be at least" + config.privateRoomMinPlayers + "players");
            
        this.serversocket.to(this.activeGames[rid].room.rid).emit('server:private:start');
        this.activeGames[rid].startGame();
    }


    /**
     * Try to join a game. If the game doesn't exist, the user is already in the room 
     * or the game is already full, this function will throw an exception.
     * 
     * If the player joined the room, an event will be send to that room, with the new
     * player's nickname.
     * @param {BigInt} rid The room id
     * @param {User} user The user who wants to join the game
     */
    addUserPrivateGame(rid, user){

        if ( !this.activeGames[rid] ) 
            throw new Error("This game doesn't exist");

        if (this.activeGames[rid].room.users.length == config.publicRoomMaxPlayers)
            throw new Error("This room is already full");
        
        this.activeGames[rid].room.addUser(user);
        this.serversocket.to(this.activeGames[rid].room.rid).emit('server:private:player', "");
        user.socket.join(rid);
            
    }

    /**
     * Try to leave a game. If the game doesn't exist, the user is not in the room 
     * or the game is already full, this function will throw an exception.
     * @param {BigInt} rid The room id
     * @param {User} user The user who wants to join the game
     */
    delUserPrivateGame(rid, user){
        if ( !this.activeGames[rid] ) 
            throw new Error("This game doesn't exist");

        this.activeGames[rid].room.removeUser(user.nickname);

        // todo: choose new leader if leader left
        // if (user.nickname !== this.activeGames[rid].roomManager.nickname) {
        // 
        // }

        // if room is empty after user leaves, delete room
        if ( this.activeGames[rid].room.empty() ) {
            delete this.activeGames[rid];
        }
    }

    /**
     * Try to cancel a game. If the game doesn't exist, the user is already in the room 
     * or the game is already full, this function will throw an exception.
     * 
     * Every user who was in the room will receive a server:private:cancelled event.
     * @param {BigInt} rid The room id
     * @param {User} user The user who wants to join the game
     */
    cancelPrivateGame(rid, user){
        if ( !this.activeGames[rid] ) 
            throw new Error("This game doesn't exist");

        if (user.nickname !== this.activeGames[rid].roomManager.nickname)
            throw new Error("You must be the room manager to cancel the game");

        this.serversocket.to(this.activeGames[rid].room.rid).emit('server:private:cancelled');
        delete this.activeGames[rid];
    }
}

module.exports = PrivateController;