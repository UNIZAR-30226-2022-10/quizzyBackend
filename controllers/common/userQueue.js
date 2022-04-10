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
        if ( this.length > 0 ) {
            return this.data.shift();
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

/**
 * User object wrapper
 */
class User {
    /**
     * 
     * @param {String} nickname The user's nickname
     * @param {Socket} socket The user's socket object
     */
    constructor(nickname, socket) {
        this.nickname = nickname;
        this.socket = socket;
        this.stats = new Stats();
    }

    /**
     * 
     * @param {Socket} socket The new socket connection
     */
    setOnline(socket) {
        this.socket = socket;
    }

    /**
     * Set socket to null
     */
    setOffline() {
        this.socket = null;
    }

    /**
     * @returns the user's socket 
     */
    isOnline() {
        return this.socket;
    }

    /**
     * 
     * @param {String} event The event name
     * @param {String} msg The message payload
     */
    sendMessage(event, msg) {
        this.socket.emit(event, msg)
    }
}

module.exports = UserQueue, { User };