const Stats = require('./stats')

/**
 * User object wrapper
 */
class User {

    nickname
    socket
    stats
    
    /**
     * 
     * @param {String} nickname The user's nickname
     * @param {Socket} socket The user's socket object
     */
    constructor(nickname, socket) {
        this.nickname = nickname;
        this.socket = socket;
        this.stats = new Stats();
    }

    /**
     * 
     * @param {Socket} socket The new socket connection
     */
    setOnline(socket) {
        this.socket = socket;
    }

    /**
     * Set socket to null
     */
    setOffline() {
        this.socket = null;
    }

    /**
     * Check if the user has an active connection.
     * 
     * @returns the user's socket 
     */
    isOnline() {
        return this.socket;
    }
}

module.exports = User;