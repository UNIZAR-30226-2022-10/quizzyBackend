/*
 * Author: Darío Marcos Casalé (795306) & Mathis Boston
 * Filename: chatHandler.js
 * Module: controllers/ws
 * Description: Socket.io chat handlers
 */

var User = require('../common/user');

module.exports = (socket, controller) => {

    const joinPublicGame = (args, callback) => {
        // join queue
        const user = new User(socket.user.name, socket);
        try {
            controller.enqueue(user);
            callback({ ok : true })
        } catch (e) {
            console.log(e.message)
            callback({ ok : false })
        }
    };

    const leavePublicGame = (args, callback) => {
        // leave queue 
        try {
            controller.removeUser(socket.user.name);
            callback({ ok : true })
        } catch (e) {
            console.log(e.message);
            callback({ ok : false })
        }
    };

    // Handle each event separately
    socket.on("public:join", joinPublicGame);
    socket.on("public:leave", leavePublicGame);
};