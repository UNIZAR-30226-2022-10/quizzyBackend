/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: chat.js
 * Module: routes
 * Description: Chat router
 */
var express = require('express');
const { StatusCodes, getReasonPhrase } = require('http-status-codes');
const { registerUser } = require('../controllers/ws/chatHandler');
var chatRouter = express.Router();

const path = require('path');

// dummy example for testing chat in development
chatRouter.get('/', (req, res) => {
    console.log(path.resolve('views/chattest.html'))
    res.sendFile(path.resolve('views/chattest.html'));
});

module.exports = chatRouter;