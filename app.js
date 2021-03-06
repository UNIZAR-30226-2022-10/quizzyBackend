var express = require("express");
var http = require("http");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { Server } = require("socket.io");
const cors = require("cors");

// express instance
var app = express();

// online controller classes
var PublicController = require('./controllers/common/publicController');
var PrivateController = require("./controllers/common/privateController");

// Middleware imports
const { authRestToken, authAdmin, authWsToken } = require("./middleware/auth");

// http server instance to attach Socket.io handlers
const server = http.createServer(app);

// Use modules and folders
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var corsOptions = {
    origin: "*", // Reemplazar con dominio
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

let publicControllerInstance = new PublicController(io);
let privateControllerInstance = new PrivateController(io);

// Router imports
var usersRouter = require("./routes/users");
var questionsRouter = require("./routes/questions");
var chatRouter = require("./routes/games");
var shopRouter = require("./routes/shop");
var friendsRouter = require("./routes/friends");
var gamesRouter = require("./routes/games")(privateControllerInstance, publicControllerInstance);


// Use routers
app.use("/user", usersRouter);
app.use("/questions", questionsRouter);
app.use("/chat", chatRouter);
app.use("/shop", shopRouter);
app.use("/friends", friendsRouter);
app.use("/games", gamesRouter);

// Websocket handling imports
const registerChatHandlers = require("./controllers/ws/chatHandler");
const registerPublicHandlers = require("./controllers/ws/publicHandler");
const registerPrivateHandlers = require("./controllers/ws/privateHandler");

let onlineUsers = 0;

const onConnection = (socket) => {

    onlineUsers++;
    // join common room
    socket.join('main');
    console.log('User with ID ' + socket.id + ' connected');
    socket.to('main').emit("otherConnect", {name : socket.user.name, systemMsg : 'connection'});

    socket.on('disconnect', () => {
        onlineUsers--;
        console.log('User with ID ' + socket.id + ' disconnected');
        socket.to('main').emit("otherDisconnect", {name : socket.user.name, systemMsg : 'disconnection'});
    })

    // Register handlers here
    registerChatHandlers(io, socket);
    registerPublicHandlers(socket, publicControllerInstance);
    registerPrivateHandlers(socket, privateControllerInstance);
};

app.get('/admin/stats', authRestToken, authAdmin, (req, res, next) => {
    res.statusCode = 200;
    res.send({
        onlineUsers,
        activePrivateGames : privateControllerInstance.getActiveGames(),
        activePublicGames : publicControllerInstance.getActiveGames(),
        enqueuedUsers : publicControllerInstance.getEnqueuedUsers()
    })
})

io.on('connection', onConnection);
io.use(authWsToken);

module.exports = { io, app, server };
