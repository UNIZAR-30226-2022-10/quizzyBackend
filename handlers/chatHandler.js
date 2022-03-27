module.exports = (io, socket) => {
    const sendMsg = ({ message, roomName }) => {

        // Store message
        console.log(`${author} (${date}): ${msg}`);


        console.log("room: ", roomName)
        // send socket to all in room except sender
        socket.to(roomName).emit("message", message);
        callback({
            status: "ok"
        });
    }

    // Handle each event separately
    socket.on("chat:send", sendMsg);
}