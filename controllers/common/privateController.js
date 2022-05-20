/*
 * Author: Jaime Martín Trullén (801965)
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



    createPrivateGame(user, turnTimeout, difficulty, wildcardsEnable){
        let game = this.privateRoomFactory.createGame(user, turnTimeout, difficulty, wildcardsEnable, this.serversocket);
    
        this.activeGames[game.room.rid] = game;
        return game.room.rid;
    }

    startPrivateGame(rid, user){
        if ( !this.activeGames[rid] ) 
            throw new Error("This game doesn't exist");

        if (user.nickname !== this.activeGames[rid].roomManager.nickname)
            throw new Error("You must be the room manager to start the game");


        if ( this.activeGames[rid].room.users.length < config.privateRoomMinPlayers )
            throw new Error("There should be at least" + config.privateRoomMinPlayers + "players");
            
        
        this.serversocket.to(this.activeGames[rid].room.rid).emit('server:private:joined');
        this.activeGames[rid].startGame();
    }



    addUserPrivateGame(rid, user){

        if ( !this.activeGames[rid] ) 
            throw new Error("This game doesn't exist");

        if (this.activeGames[rid].room.users.length == config.publicRoomMaxPlayers)
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

            this.serversocket.to(this.activeGames[rid].room.rid).emit('server:private:cancelled');
        delete this.activeGames[rid];
    }
}

module.exports = PrivateController;