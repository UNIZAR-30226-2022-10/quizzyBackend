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
            console.log("error : ", e.message)
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
    const leavePublicGame = (callback) => {
        // leave queue 
        console.log("leavePublicGame");
        try {
            controller.dequeueUser(socket.user.name);
            callback({ ok : true })
        } catch (e) {
            console.log(e.message);
            callback({ ok : false })
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
            callback({ok : false})
        }
    }

    /**
     * Launch a dice roll and return the number and accessible cells from the player's position
     * @param {*} args 
     * @param {*} callback 
     */
    const rollDice = (callback) => {
        try {
            let roll = controller.rollDice(socket.user.name);
            callback({ ok : true, roll })
        } catch (e) {
            console.log(e.message);
            callback(false)
        }
    }

    // Handle each event separately
    socket.on("public:join", joinPublicGame);
    socket.on("public:leave", leavePublicGame);
    socket.on("client:startTurn", startTurn);
    socket.on("client:dice", rollDice);
};