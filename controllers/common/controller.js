/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: controller.js
 * Module: controllers/common
 * Description: common controller for public and private games
 */

class Controller {

    constructor(io) {
        // server socket 
        this.serversocket = io;

        // Active games identified by room uuid
        this.activeGames = {};
    }

    /**
         * Start current player's turn after acknowledgement.
         * In this phase, the player must answer the provided question.
         * The first phase ends when the user answers the question or after timing out.
         * @param {String} rid The room id 
         * @param {String} nickname The player's nickname
         */
    async startTurn(rid, nickname) {
        if ( this.activeGames[rid] == null ) 
            throw new Error("startturn : This game doesn't exist");
            
        return await this.activeGames[rid].startTurn(nickname);
    }

    makeMove(rid, nickname, pos) {
        if ( !this.activeGames[rid] ) 
            throw new Error("makemove : This game doesn't exist");

        return this.activeGames[rid].makeMove(nickname, pos);
    }

    print() {
        console.log("queue : ", this.queue);
    }

    getUserMatches(nickname) {
        let result = Object.values(this.activeGames)
            .filter(gm => gm.room.getUsers().includes(nickname))
            .map(gm => {
                let users = Object.values(gm.room.users).map(u => {
                    return { nickname : u.nickname, stats : u.stats };
                })
                return { rid: gm.room.rid, users };
            });
        return result;
    }

    pause(nickname, rid) {
        if ( !this.activeGames[rid] ) 
            throw new Error("pause : This game doesn't exist");

        this.activeGames[rid].pause(nickname);
    }

    resume(nickname, rid, socket) {
        if ( !this.activeGames[rid] ) 
            throw new Error("restart : This game doesn't exist");

        return this.activeGames[rid].resume(nickname);
    }
}

module.exports = Controller;