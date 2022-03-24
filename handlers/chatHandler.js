module.exports = (io, socket) => {
    const sendMsg = (payload) => {
        // Get payload fields
        const { msg, author, date } = payload;

        // Store message
        console.log(`${author} (${date}): ${msg}`);

        // broadcast message to everyone (To do rooms)
        io.emit('chat:send', msg);
    }

    // Handle each event separately
    socket.on("chat:send", sendMsg);
}