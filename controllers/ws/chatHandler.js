/*
 * Author: Darío Marcos Casalé (795306) & Mathis Boston
 * Filename: chatHandler.js
 * Module: controllers/ws
 * Description: Socket.io chat handlers
 */
module.exports = (io, socket) => {
    const sendMsg = ({ username, message, roomName },callback) => {

        // generate data to send to receivers
        const outgoingMessage = {
            name: username,
            id: socket.id,
            message
        };

        // TODO store message in database

        // send socket to all in room except sender
        socket.to(roomName).emit("chat:message", outgoingMessage);
        callback({
            status: "ok"
        });
    };

    const joinRoom = (roomName) => {
        console.log("join: " + roomName);
        socket.leave;
        socket.join(roomName);

        const outgoingMessage = {
            name: "SERVER",
            id: "server",
            message: `${socket.id} has joined.`
        };
        socket.to(roomName).emit("message", outgoingMessage);
    };

    // Handle each event separately
    socket.on("chat:send", sendMsg);
    socket.on("chat:join", joinRoom);
};