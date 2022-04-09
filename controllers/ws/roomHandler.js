module.exports = (io, socket) => {
    const joinRoom = (roomName) => {
        console.log("join: " + roomName);
        socket.join(roomName);

        /*
            const outgoingMessage = {
                name: "SERVER",
                id: "server",
                message: `${socket.id} has joined.`,
            };
            socket.to(roomName).emit("message", outgoingMessage);
            */
    };

    // Handle each event separately
    socket.on("room:join", joinRoom);
};
