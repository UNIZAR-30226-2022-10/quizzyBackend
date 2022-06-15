/*
 * Author: Jaime Martín Trullén (801965)
 * Filename: privateHandler.js
 * Module: controllers/ws
 * Description: Socket.io private games handlers
 */

var User = require('../../game/user');

module.exports = (socket, controller) => {


    /**
     * 
     * @param {Object} args Argument object, which contains the room parameters:
     *  - The question timeout, in milliseconds
     *  - The difficulty
     *  - A flag enabling wildcards if set to true.
     * Example :
     * 
     * {
     *     turnTimeout : 10000,
     *     difficulty  : "easy",
     *     categories  : [true, true, false, false, true, false]
     *     wildcardsEnable : true
     * }
     * @param {Function} callback The acknowledgement function, which returns the room identifier.
     */
    const createPrivateGame = (args, callback) => {
        console.log("createPrivateGame");

        const user = new User(socket.user.name, socket);

        try {
            let rid = controller.createPrivateGame(user, args.turnTimeout, args.difficulty, args.wildcardsEnable);
            callback({ok: true, rid});
        } catch (e) {
            callback({ok: false, msg :e.message});
        }
    };


    /**
     * Try to join a room.
     * 
     * If the user joined the room, the callback will return an object with
     * the ok flag set to true. Otherwise, the ok flag will be set to false.
     * @param {Object} args Argument object, which contains the rid of the room to join.
     *  - rid: The room's identifier
     * Example: 
     * {
     *     rid : 4
     * }
     * @param {Function} callback The acknowledgment function.
     */
    const joinPrivateGame = (args, callback) => {
        // join queue
        const user = new User(socket.user.name, socket);
        try {
            let { players, config } = controller.addUserPrivateGame(args.rid, user);
            callback({ ok : true, players, config })
        } catch (e) {
            callback({ ok : false, msg : e.message })
        }
    };

    /**
     * Try to leave a private game
     * 
     * If the room doesn't exist or the user is not in this room, the callback will return an object
     * with the ok flag set to false and the error message. Otherwise, the ok flag 
     * will be set to true 
     * @param {Object} args Argument object, which contains the rid of the room to leave.
     *  - rid: The room's identifier
     * Example: 
     * {
     *     rid : 4
     * }
     * @param {Function} callback The acknowledgment function.
     */
    const leavePrivateGame = (args, callback) => {
        // leave queue 
        console.log("leavePrivateGame");
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

    const wildcardsStatus = (args, callback) => {
        try {
            let r = controller.wildcardsStatus(args.rid);
            callback({ok : true, status : r});
        } catch (e) {
            callback({ ok : false, msg : e.message })
        }
    }


    /**
     * Pause user's game
     * @param {Object} args Argument object, which contains the room id
     * @param {Function} callback The acknowledgement function
     */
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
    socket.on("private:create", createPrivateGame);
    socket.on("private:start", startPrivateGame);
    socket.on("private:join", joinPrivateGame);
    socket.on("private:leave", leavePrivateGame);
    socket.on("private:cancel", cancelPrivateGame);
    socket.on("private:startTurn", startTurn);
    socket.on("private:makeMove", makeMove);
    socket.on("private:wildcardsStatus", wildcardsStatus);
    
    socket.on("private:pause", pause);
    socket.on("private:resume", resume);
};