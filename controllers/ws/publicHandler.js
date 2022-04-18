/*
 * Author: Darío Marcos Casalé (795306) & Mathis Boston
 * Filename: chatHandler.js
 * Module: controllers/ws
 * Description: Socket.io chat handlers
 */

var User = require('../common/user');

module.exports = (io, socket, controller) => {

    const joinPublicGame = () => {
        // join queue
        const user = new User(socket.user.name, socket);
        try {
            controller.enqueue(user);
        } catch (e) {
            console.log("User already enqueued!")
        }
    };

    const leavePublicGame = () => {
        // leave queue 
        try {
            controller.removeUser(socket.user.name);
        } catch (e) {
            console.log("User not enqueued!")
        }
    };

    // Handle each event separately
    socket.on("public:join", joinPublicGame);
    socket.on("public:leave", leavePublicGame);
};