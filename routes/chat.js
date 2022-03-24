var express = require('express');
const { StatusCodes, getReasonPhrase } = require('http-status-codes');
const { registerUser } = require('../handlers/chatHandler');
var chatRouter = express.Router();

const path = require('path');

// dummy example for testing chat in development
chatRouter.get('/', (req, res) => {
    console.log(path.resolve('public/chattest.html'))
    res.sendFile(path.resolve('public/chattest.html'));
});

module.exports = chatRouter;