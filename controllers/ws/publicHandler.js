/*
 * Author: Darío Marcos Casalé (795306) & Mathis Boston
 * Filename: chatHandler.js
 * Module: controllers/ws
 * Description: Socket.io chat handlers
 */

var User = require('../common/user');

module.exports = (socket, controller) => {

    /**
     * Try to join the public matchmaking queue.
     * 
     * If the user joined the queue, the callback will return an object with
     * the ok flag set to true. Otherwise, the ok flag will be set as false.
     * @param {Object} args Argument (should be empty) 
     * @param {Function} callback The acknowledgment function.
     */
    const joinPublicGame = (args, callback) => {
        // join queue
        const user = new User(socket.user.name, socket);
        try {
            controller.enqueueUser(user);
            callback({ ok : true })
        } catch (e) {
            console.log(e.message)
            callback({ ok : false })
        }
    };

    /**
     * Try to leave the matchmaking queue.
     * 
     * If the user left the queue, the callback will return an object with
     * the ok flag set to true. Otherwise, the ok flag will be set as false.
     * @param {Object} args Argument (should be empty) 
     * @param {Function} callback The acknowledgment function.
     */
    const leavePublicGame = (args, callback) => {
        // leave queue 
        try {
            controller.dequeueUser(socket.user.name);
            callback({ ok : true })
        } catch (e) {
            console.log(e.message);
            callback({ ok : false })
        }
    };

    const startTurn = (args, callback) => {
        try {
            controller.startTurn(socket.user.name);
            callback({ ok : true })
        } catch {
            console.log(e.message);
            callback({ ok : false })
        }
    }

    // Handle each event separately
    socket.on("public:join", joinPublicGame);
    socket.on("public:leave", leavePublicGame);
    socket.on("public:ackTurn", startTurn);

};