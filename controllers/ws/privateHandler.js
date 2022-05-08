/*
 * Author: Jaime Martín Trullén (801965)
 * Filename: privateHandler.js
 * Module: controllers/ws
 * Description: Socket.io private games handlers
 */

var User = require('../../game/user');

module.exports = (socket, controller) => {



    const createPrivateGame = (args, callback) => {
        console.log("createPublicGame");

        const user = new User(socket.user.name, socket);

        try {
            controller.createPrivateGame(user, args.turnTimeout, args.difficulty, args.wildcardsEnable);
            callback({ok: true});
        } catch (e) {
            callback({ok: false, msg :e.message});
        }
    };


    /**
     * Try to join the public matchmaking queue.
     * 
     * If the user joined the queue, the callback will return an object with
     * the ok flag set to true. Otherwise, the ok flag will be set as false.
     * @param {Object} args Argument (should be empty) 
     * @param {Function} callback The acknowledgment function.
     */
    const joinPrivateGame = (args, callback) => {
        // join queue
        const user = new User(socket.user.name, socket);
        try {
            controller.addUserPrivateGame(args.rid, user);
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
    const leavePrivateGame = (args, callback) => {
        // leave queue 
        console.log("leavePublicGame");
        const user = new User(socket.user.name, socket);
        try {
            controller.delUserPrivateGame(args.rid, user);
            callback({ ok : true })
        } catch (e) {
            console.log(e.message);
            callback({ ok : false, msg : e.message })
        }
    };


    const startPrivateGame = (args, callback) => {

        const user = new User(socket.user.name, socket);
        try {
            controller.startPrivateGame(args.rid, user);
            callback({ ok : true })
        } catch (e) {
            callback({ ok : false, msg : e.message })
        }
    };

    const cancelPrivateGame = (args, callback) => {

        const user = new User(socket.user.name, socket);
        try {
            controller.cancelPrivateGame(args.rid, user);
            callback({ ok : true })
        } catch (e) {
            callback({ ok : false, msg : e.message })
        }
    };

    /**
     * Start the first phase of a game turn.
     * @param {Object} args Argument object, which contains the room id of the user.
     * Example :
     * 
     * {
     *     rid : '15f6bb40-89d9-4c0d-b6ef-a399223ed77f'
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
     * @param {Function} callback The acknowledgement function
     */
    const makeMove = (args, callback) => {
        try {
            let r = controller.makeMove(args.rid, socket.user.name, args.pos);
            callback({ok : true, rollAgain : r});
        } catch (e) {
            callback({ ok : false, msg : e.message })
        }
    }

    // Handle each event separately
    socket.on("private:create", createPrivateGame);
    socket.on("private:start", startPrivateGame);
    socket.on("private:join", joinPrivateGame);
    socket.on("private:leave", leavePrivateGame);
    socket.on("private:cancel", cancelPrivateGame);
    socket.on("client:startTurn", startTurn);
    socket.on("client:makeMove", makeMove);
};