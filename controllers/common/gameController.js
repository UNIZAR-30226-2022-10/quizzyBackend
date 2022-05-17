/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: gameController.js
 * Module: controllers/common
 * Description: game controller for each room
 */

const { pickRandom } = require("../../utils/algorithm");

const { getQuestions } = require("../rest/questions");

const GameState = require("../../game/gameState");

const config = require("../../config");

class GameController {
    room;

    /**
     * Create a new game controller with a room linked to it.
     *
     * This will setup a generic game and assign the first room at random
     * @param {Room} room
     */
    constructor(room) {
        this.room = room;

        // Player turn index. Updates on round-robin
        this.currentTurn = 0;

        // Flag set to false if the current user hasn't acknowledged his/her turn yet.
        this.ackTurn = false;

        // Flag that indicates if a player hasn't made a move yet.
        this.movePending = false;

        // Question being answered in a turn in this game
        this.currentQuestion = null;

        // Timeout object
        this.currentQuestionTimeout = null;

        // Tokens on current turn
        this.currentTurnTokens = 0;

        // Game state
        this.state = new GameState(room.getUsers());

        // start game with random order
        let users = room.getUsers();
        this.turns = pickRandom(users, users.length);

        // Send first message to the first player
        this.room
            .findUser(this.turns[this.currentTurn])
            .socket.emit("server:turn", "turn");
    }

    /**
     * Start first phase of the player's turn.
     * @param {String} nickname The nickname of the user
     */
    async startTurn(nickname) {
        if (this.turns[this.currentTurn] !== nickname)
            throw new Error("This is not your turn!");

        if (this.ackTurn || this.movePending)
            throw new Error("Can't start a turn if it is already your turn");

        // This statement will throw if user is not in this room.
        // Should not throw because precondition always holds
        var user = this.room.findUser(nickname);

        let cell = this.state.board.getCell(this.state.getPlayerPos(nickname));

        let question = await getQuestions(1, null, null);
        this.currentQuestion = question[0];

        const listener = (answer, callback) => {
            // reset timer
            this.resetAnswerTimer();

            let ok = answer === this.currentQuestion.correct_answer;

            // update game state
            this.state.addAnswer(nickname, cell.category, ok);
            if (ok) {
                if ( cell.hasToken ) {
                    this.state.addToken(nickname, cell.category);
                    // TODO : check if player has won the match
                
                    if(this.state.hasWon(nickname)){
                        this.room.serversocket(room.rid).emit("server:winner", nickname);

                        // room persistence add match
                    }
                    else{
                        this.currentTurnTokens = this.currentTurnTokens + 1;

                        if(this.currentTurnTokens == 3){
                            this.currentTurnTokens = 0;
                            this.currentTurn = (this.currentTurn + 1) % this.turns.length;
                            callback({ok});
                        }

                        //  check if this runs ok in case the user won 3 tokens in a same turn
                    }
                }
                this.movePending = true;
                callback({ok, roll : this.rollDice(nickname)});
            } else {
                this.currentTurn = (this.currentTurn + 1) % this.turns.length;
                callback({ok});
            }
        };

        // listen to one answer event.
        // Any unexpected event will act as a wrong answer
        user.socket.once("client:answer", listener);

        // start timeout
        this.currentQuestionTimeout = setTimeout(() => {
            // update game state
            this.currentTurn = (this.currentTurn + 1) % this.turns.length;
            this.state.addAnswer(nickname, cell.category);

            user.socket.emit("server:timeout", "Timeout");
            user.socket.off("client:answer", listener);
        }, config.publicQuestionTimeout);

        console.log(this.currentQuestion);
        return this.currentQuestion;
    }

    /**
     * Performs a dice roll and returns and object with the outcome and
     * the reachable cells from the user's current position.
     * @param {String} nickname The nickname of the user who will roll the dice.
     * @returns {Object} An object with an integer and an array of reachable cell positions.
     * Example: 
     * {
     *     roll : 3,
     *     cells : [ 3, 6, 9, 12, 15, 18 ]
     * }
     */
    rollDice(nickname) {
        let roll = Math.floor(Math.random() * 6) + 1;

        let cells = this.state.findReachableCells(nickname, roll);

        return { roll, cells }
    }

    makeMove(nickname, pos) {
        if (this.turns[this.currentTurn] !== nickname)
            throw new Error("This is not your turn!");

        if (!this.movePending)
            throw new Error("You don't have any pending move yet!");

        let cell = this.state.movePlayer(nickname, pos);

        if ( cell.rollAgain ) {
            
        } else {
            this.movePending = false;
            this.ackTurn = false;
        }
        return cell.rollAgain;
    }

    /**
     * Get the current turn for this game.
     * @returns {BigInt} The current game's turn. 
     */
    getCurrentTurn() {
        return this.currentTurn;
    }

    /**
     * Reset the online timeout for answering a question
     */
    resetAnswerTimer() {
        // if timeout exists, reset timer
        if (this.currentQuestionTimeout) {
            clearTimeout(this.currentQuestionTimeout);
            this.currentQuestionTimeout = null;
        }
    }

    print() {
        console.log(this);
    }
}

module.exports = GameController;
