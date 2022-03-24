var express = require('express');
const { StatusCodes, getReasonPhrase } = require('http-status-codes');
const { registerUser } = require('../middlewares/data/users');
var usersRouter = express.Router();

/*
 * Register a new user.
 */
usersRouter.post('/', function (req, res, next) {
    const { nickname, email, password } = req.body;
    console.log(nickname, email, password);

    // try to create entry in database
    var result = registerUser(nickname, email, password)
    
    result.then(() => {
        res.statusCode = StatusCodes.OK;
    }).catch((e) => {
        console.log(e)
        res.statusCode = StatusCodes.CONFLICT;
    }).finally(() => {
        // Send result message
        res.send({
            msg: getReasonPhrase(res.statusCode),
            ok: StatusCodes.OK === res.statusCode
        })
    });
});

/* GET users listing. */
usersRouter.post('/login', function (req, res, next) {
    const { nickname, email, password } = req.body;
    console.log(nickname, email, password);

    // fetch user in database


    res.send({ ok: true });
});

/* GET users listing. */
usersRouter.post('/login', function (req, res, next) {
    const { nickname, email, password } = req.body;
    console.log(nickname, email, password);

    // try to create entry in database


    res.send({ ok: true });
});

module.exports = usersRouter;