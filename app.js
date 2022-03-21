var port = process.env.PORT || 5000;

var express = require('express');
var http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { Server } = require("socket.io");
// Router imports
var usersRouter = require('./routes/users');

// Websocket handling imports
const registerChatHandlers = require("./handlers/chatHandler");

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

const io = new Server(server);

const onConnection = (socket) => {
    // Register handlers here
    registerChatHandlers(io, socket);
}

io.on("connection", onConnection);


app.listen(port, () => {
    console.log(`REST API listening on port ${port}`)
})

server.listen(3000, () => {
    console.log(`WS API listening on ${port}`);
});

module.exports = app;
