var port = process.env.PORT || 5000;
var wsport = process.env.WSPORT || 8000;

var express = require('express');
var http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { Server } = require("socket.io");

// Router imports
var usersRouter = require('./routes/users');
const chatRouter = require('./routes/chat');

// express instance
var app = express();

// http server instance to attach Socket.io handlers
const server = http.createServer(app);

// Use modules and folders
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Use routers
app.use('/user', usersRouter);
app.use('/chat', chatRouter);

const io = new Server(server);

// Websocket handling imports
const registerChatHandlers = require("./handlers/chatHandler");

const onConnection = (socket) => {
    
    console.log('User with ID' + socket.id + ' connected');
    
    // Register handlers here
    registerChatHandlers(io, socket);

    socket.on('disconnect', () => {
        console.log('User with ID' + socket.id + ' disconnected');
    })
}

io.on("connection", onConnection);


server.listen(port, () => {
    console.log(`WS API listening on ${port}`);
});

module.exports = app;
