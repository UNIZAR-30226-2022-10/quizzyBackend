/*
 * Author: Jaime Martín Trullén (801965)
 * Filename: publicController.js
 * Module: controllers/common
 * Description: online game controller for public games
 */

const PrivateRoomFactory = require('./privateGameFactory');
const UserQueue = require("./userQueue");

const config = require('../../config');

class PrivateController {

    /**
     * Initialize a new online public controller
     * @param {io} io The socket.io server handler
     */
    constructor(io) {

        // server socket 
        this.serversocket = io;

        // Active games identified by room uuid
        this.activeGames = {};

        // factories
        this.privateRoomFactory = new PrivateRoomFactory();
    }



    createPrivateGame(user, turnTimeout, difficulty, wildcardsEnable){
        let game = this.privateRoomFactory.createGame(user, turnTimeout, difficulty, wildcardsEnable);
    
        this.activeGames[game.room.rid] = game;
        this.serversocket.to(this.activeGames[rid].room.rid).emit('server:private:created', { rid : game.room.rid });
    }

    startPrivateGame(rid, user){
        if ( !this.activeGames[rid] ) 
            throw new Error("This game doesn't exist");

        if (user != this.activeGames[rid].roomManager)
            throw new Error("You must be the room manager to start the game");


        if ( this.activeGames[rid].room.users.length() < config.privateRoomMinPlayers )
            throw new Error("There should be at least" + config.privateRoomMinPlayers + "players");
            
        
        this.serversocket.to(this.activeGames[rid].room.rid).emit('server:private:joined', { rid : game.room.rid });  
    }



    addUserPrivateGame(rid, user){

        if ( !this.activeGames[rid] ) 
            throw new Error("This game doesn't exist");

        if (this.activeGames[rid].users.length() == config.publicRoomMaxPlayers)
            throw new Error("There should be at least" + config.privateRoomMinPlayers + "players");
        
        this.activeGames[rid].room.addUser(user);
        user.socket.join(rid);
            
    }


    delUserPrivateGame(rid, user){
        if ( !this.activeGames[rid] ) 
            throw new Error("This game doesn't exist");

        this.activeGames[rid].room.removeUser(user);
    }

    
    cancelPrivateGame(rid, user){
        if ( !this.activeGames[rid] ) 
            throw new Error("This game doesn't exist");

        if (user != this.activeGames[rid].roomManager)
            throw new Error("You must be the room manager to cancel the game");

            this.serversocket.to(this.activeGames[rid].room.rid).emit('server:private:cancelled', { rid : game.room.rid });
        delete this.activeGames[rid];
    }


    /**
     * Start current player's turn after acknowledgement.
     * In this phase, the player must answer the provided question.
     * The first phase ends when the user answers the question or after timing out.
     * @param {String} rid The room id 
     * @param {String} nickname The player's nickname
     */
    async startTurn(rid, nickname) {
        if ( !this.activeGames[rid] ) 
            throw new Error("This game doesn't exist");
            
        return await this.activeGames[rid].startTurn(nickname);
    }

    makeMove(rid, nickname, pos) {
        if ( !this.activeGames[rid] ) 
            throw new Error("This game doesn't exist");

        return this.activeGames[rid].makeMove(nickname, pos);
    }

    print() {
        console.log(this.activeGames);
    }
}

module.exports = PrivateController;