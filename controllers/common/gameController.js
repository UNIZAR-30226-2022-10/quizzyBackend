/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: gameController.js
 * Module: controllers/common
 * Description: game controller for each room
 */

const { pickRandom } = require("../../utils/algorithm");

class GameController {
    room

    /**
     * Create a new game controller with a room linked to it.
     * 
     * This will setup a generic game and assign the first room at random
     * @param {Room} room 
     */
    constructor(room) {
        this.room = room;
        this.currentTurn = 0;

        // start game with random order
        let users = room.getUsers();
        this.turns = pickRandom(users, users.length);
    }

    playTurn(nickname) {
        if ( this.turns[this.currentTurn] !== nickname )
            throw new Error("This is not your turn!");

        // play turn
    }

    getCurrentTurn() {
        return this.currentTurn;
    }

    print() {
        console.log(this);
    }
}

module.exports = GameController;