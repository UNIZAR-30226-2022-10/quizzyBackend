var port = process.env.PORT || 5000;

var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { Server } = require("socket.io");
const cors = require('cors');

// Router imports
var usersRouter = require('./routes/users');
var questionsRouter = require('./routes/questions');
var chatRouter = require('./routes/chat');

// Middleware imports
const { authWsToken, authRestToken } = require('./middleware/auth');

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
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
var corsOptions = {
    origin: '*', // Reemplazar con dominio
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

// Use routers
app.use('/user', usersRouter);
app.use('/questions', questionsRouter);
app.use('/chat', chatRouter);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

// Websocket handling imports
const registerChatHandlers = require("./controllers/ws/chatHandler");

const onConnection = (socket) => {

    // join common room
    socket.join('main');
    console.log('User with ID ' + socket.id + ' connected');
    socket.to('main').emit("otherConnect", {name : socket.user.name, systemMsg : 'connection'});

    socket.on('disconnect', () => {
        console.log('User with ID ' + socket.id + ' disconnected');
        socket.to('main').emit("otherDisconnect", {name : socket.user.name, systemMsg : 'disconnection'});
    })
    // Register handlers here
    registerChatHandlers(io, socket);

}
module.exports = { app, server };
