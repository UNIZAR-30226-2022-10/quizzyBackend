/*
 * Author: Darío Marcos Casalé (795306) & Mathis Boston
 * Filename: chatHandler.js
 * Module: controllers/ws
 * Description: Socket.io chat handlers
 */

var User = require('../../game/user');

module.exports = (socket, controller) => {

    /**
     * Try to join the public matchmaking queue.
     * 
     * If the user joined the queue, the callback will return an object with
     * the ok flag set to true. Otherwise, the ok flag will be set as false.
     * @param {Object} args Argument (should be empty) 
     * @param {Function} callback The acknowledgment function.
     */
    const joinPublicGame = (callback) => {
        // join queue
        const user = new User(socket.user.name, socket);
        try {
            controller.enqueueUser(user);
            callback({ ok : true })
        } catch (e) {
            callback({ ok : false, msg : e.message })
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
    const leavePublicGame = (callback) => {
        // leave queue 
        console.log("leavePublicGame");
        try {
            controller.dequeueUser(socket.user.name);
            callback({ ok : true })
        } catch (e) {
            console.log(e.message);
            callback({ ok : false, msg : e.message })
        }
    };

    /**
     * Start the first phase of a game turn.
     * @param {Object} args Argument object, which contains the room id of the user.
     * Example :
     * 
     * {
     *     rid : 0
     * }
     * 
     * @param {Function} callback The acknowledgement function
     */
    const startTurn = async (args, callback) => {
        try {
            let q = await controller.startTurn(args.rid, socket.user.name);
            callback(q)
        } catch (e) {
            callback({ ok : false, msg : e.message })
        }
    }

    /**
     * Make a move in the second phase of a game turn, only if the user has previously answered 
     * a question correctly in the current turn.
     * @param {Object} args Argument object, which contains the room id of the user and the 
     * desired position
     * Example :
     * 
     * {
     *     rid : 0,
     *     pos : 3
     * }
     * @param {Function} callback The acknowledgement function
     */
    const makeMove = (args, callback) => {
        try {
            let { rollAgain, roll, cells } = controller.makeMove(args.rid, socket.user.name, args.pos);

            console.log("makeMove : ", rollAgain, roll, cells)

            callback({ ok : true, rollAgain : rollAgain, roll, cells });
        } catch (e) {
            callback({ ok : false, msg : e.message })
        }
    }

    const pause = (args, callback) => {
        try {
            controller.pause(socket.user.name, args.rid);
            callback({ok : true});
        } catch (e) {
            callback({ ok : false, msg : e.message })
        }
    }

    const resume = (args, callback) => {
        try {
            let info = controller.resume(socket.user.name, args.rid, socket);
            callback({ ok : true, info});
        } catch (e) {
            callback({ ok : false, msg : e.message })
        }
    }

    // Handle each event separately
    socket.on("public:join", joinPublicGame);
    socket.on("public:leave", leavePublicGame);
    socket.on("public:startTurn", startTurn);
    socket.on("public:makeMove", makeMove);
    socket.on("public:pause", pause);
    socket.on("public:resume", resume);
};