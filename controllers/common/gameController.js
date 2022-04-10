/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: gameController.js
 * Module: controllers/common
 * Description: game controller for each room
 */

const { User } = require('./userQueue');
const Stats = require('./stats');

class GameController {
    /**
     * 
     * @param {Array<User>} users 
     */
    constructor(users) {
        this.stats = {}
        users.forEach(u => {
            this.stats[u.nickname] = new Stats();
        })
    }
}

module.exports = GameController;