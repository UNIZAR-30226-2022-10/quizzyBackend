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

const { addMatch } = require("../rest/users");
const categories = ["Geography", "Art", "History", "Science", "Sports", "Entertainment"];
class GameController {
    room;
    roomManager;
    turnTimeout;
    difficulty;
    wildcardsEnable;

    /**
     * Create a new game controller with a room linked to it.
     *
     * This will setup a generic game and assign the first room at random.
     * 
     * Note: We shouldn't write socket code here, this task should be delegated
     * to the startGame routine.
     * @param {Room} room
     * @param {Socket} srvsock The server's main socket
     */
    constructor(room, srvsock, pub, turnTimeout, difficulty, wildcardsEnable) {

        // Game params
        this.turnTimeout = turnTimeout;
        this.difficulty = difficulty;
        this.wildcardsEnable = wildcardsEnable;

        this.serversocket = srvsock;

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

        // Timestamp of the beginning of the timeout object
        this.start = null;

        // Remaining timeof the timeout object 
        this.remaining = null;

        // Tokens on current turn
        this.currentTurnTokens = 0;

        // Game state
        this.state = new GameState(room.getUsers());

        this.pub = pub;

        this.turns = []
    }

    /**
     * Start the current game. This function will be called after constructing the game controller object
     */
    startGame() {

        let users = this.room.getUsers();
        this.turns = pickRandom(users, users.length);
        // Send initial turn message
        this.serversocket.to(this.room.rid).emit("server:turn", 
            { 
                turns : this.turns[this.currentTurn], 
                stats : this.state.stats,
                timer : this.turnTimeout
            }
        );
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

        if (this.currentTurnTokens === 3) {
            this.currentTurnTokens = 0;
            this.nextTurn();
            throw new Error("Can't start a turn, you won 3 tokens in the last turn!");
        }

        this.ackTurn = true;

        // This statement will throw if user is not in this room.
        // Should not throw because precondition always holds
        var user = this.room.findUser(nickname);

        let cell = this.state.board.getCell(this.state.getPlayerPos(nickname));
        let question = await getQuestions(1, this.difficulty, categories[cell.category]);
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
                    this.serversocket.to(this.room.rid).emit("server:turn", 
                        { 
                            stats : this.state.stats 
                        }
                    );
                
                    if(this.state.hasWon(nickname)){
                        this.serversocket.to(this.room.rid).emit("server:winner", nickname);

                        // room persistence add match
                        addMatch(nickname);
                    }
                    else{
                        this.currentTurnTokens = this.currentTurnTokens + 1;
                    }
                }
                this.movePending = true;
                callback({ok, continue : true, roll : this.rollDice(nickname)});
            } else {
                this.currentTurnTokens = 0;
                this.nextTurn();
                callback({ok, continue : false});
            }
        };

        // listen to one answer event.
        // Any unexpected event will act as a wrong answer
        user.socket.once(`${this.pub ? "public" : "private"}:answer`, listener);

        // start timeout
        this.remaining = this.turnTimeout ;
        this.start = Date.now();
        this.currentQuestionTimeout = null;
        this.resumeAnswerTimer(user,listener,nickname,cell)

        // listen once to more time joker.
        // Any unexpected event will act as a wrong answer
        user.socket.once('moreTime', () => {
            // reset timer
            this.pauseAnswerTimer();
            setTimeout(() => {
                this.resumeAnswerTimer(user,listener,nickname,cell);
            }
            , config.moreTimeWildcard); //15s
        })

        const currentQuestion = this.currentQuestion;
        return {currentQuestion};
    }

    /**
     * Perform next turn.
     * This function will increment the turn value on a round robin, 
     * and for each turn it will send the current turn's user's nickname
     * and the game stats for each player.
     */
    nextTurn() {
        console.log("nextturn");
        this.ackTurn = false;
        this.movePending = false;
        this.currentTurn = (this.currentTurn + 1) % this.turns.length;
        this.serversocket.to(this.room.rid).emit("server:turn", 
            { 
                turns : this.turns[this.currentTurn], 
                stats : this.state.stats 
            }
        );
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

        console.log("cell : ", cell);

        if ( cell.rollAgain === true ) {
            return { rollAgain : cell.rollAgain, ...this.rollDice(nickname) };
        } else {
            this.movePending = false;
            this.ackTurn = false;
            this.serversocket.to(this.room.rid).emit("server:turn", 
                { 
                    turns : this.turns[this.currentTurn], 
                    stats : this.state.stats 
                }
            );
            return { rollAgain : cell.rollAgain };
        }
    }

    /**
     * Get the current turn for this game.
     * @returns {BigInt} The current game's turn. 
     */
    getCurrentTurn() {
        return this.currentTurn;
    }

    /**
     * Check if wildcards are enabled for this game.
     * @returns {Boolean} True if wildcards are enabled, false otherwise.
     */
    wildcardsStatus() {
        return this.wildcardsEnable;
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

    /**
     * Pause the online timeout for answering a question
     */
    pauseAnswerTimer() {
        // if timeout exists, pause timer
        if (this.currentQuestionTimeout) {
            clearTimeout(this.currentQuestionTimeout);
            this.currentQuestionTimeout = null;
            this.remaining -= Date.now() - this.start;
        }
    }

    /**
     * Resume the online timeout for answering a question
     */
    resumeAnswerTimer(user,listener,nickname,cell) {
        // if timer don't exists, resume timer
        if (this.currentQuestionTimeout) {
            return;
        }
        this.start = Date.now();
        this.currentQuestionTimeout = setTimeout(() => {
            // update game state
            user.socket?.off(`${this.pub ? "public" : "private"}:answer`, listener);
            this.state.addAnswer(nickname, cell.category, false);

            user.socket.emit("server:timeout", "Timeout");
            this.nextTurn();
        }, this.remaining);

        
    }

    /**
     * Pause user. This will set the user's socket as null
     * @param {String} nickname 
     */
    pause(nickname) {
        this.room.pause(nickname);
    }

    /**
     * Resume user game. This will set the user's socket to the new
     * connection object.
     * @param {String} nickname The user's nickname
     * @param {String} socket The user's new socket
     */
    resume(nickname, socket) {
        this.room.resume(nickname, socket)

        return { 
            turns : this.turns[this.currentTurn], 
            stats : this.state.stats 
        }
    }

    print() {
        console.log(this);
    }
}

module.exports = GameController;
