/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: userQueue.js
 * Module: controllers/common
 * Description: matchmaking user queue
 */
const { Socket } = require("socket.io");
const Stats = require("./stats");

class UserQueue {

    /**
     * Create an empty user queue 
     */
    constructor() {
        this.data = [];
    }

    /**
     * Enqueues an element. If the user is already in the queue,
     * this function will throw an exception.
     * @param {User} v The element to enqueue
     */
    enqueue(v) {
        if ( this.data.find(u => u.nickname === v.nickname) ) {
            throw new Error("User already enqueued");
        }
        this.data.push(v);
    }

    /**
     * @returns {User} null if the queue is empty, the first user otherwise
     */
    dequeue() {
        if ( this.data.length > 0 ) {
            let d = this.data.shift();
            return d;
        }
        else return null;
    }

    /**
     * Delete user from queue by nickname. If the user can't be found,
     * this function will throw an error.
     * @param {String} nickname The user's nickname
     */
    delete(nickname) {
        let idx = this.data.findIndex(u => u.nickname === nickname);
        if ( idx < 0 ) {
            throw new Error("User can't be found in the queue");
        } 
        
        this.data.splice(idx, 1);
    }

    /**
     * 
     * @returns {BigInt} The length of the queue
     */
    length() {
        return this.data.length;
    }
}

module.exports = UserQueue;