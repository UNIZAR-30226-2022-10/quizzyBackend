/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: users.js
 * Module: routes
 * Description: Users router
 */
var express = require('express');
const { StatusCodes, getReasonPhrase } = require('http-status-codes');
const { registerUser, deleteUser } = require('../middlewares/data/users');
var usersRouter = express.Router();

const { PrismaClientKnownRequestError } = require('@prisma/client')

/**
 * This route will register a new user in the database if the information 
 * is valid.
 */
usersRouter.post('/', function (req, res, next) {
    const { nickname, email, password } = req.body;
    console.log(nickname, email, password);

    // try to create entry in database
    registerUser(nickname, email, password).then(() => {
        // Send response back
        res.statusCode = StatusCodes.OK;
        res.send({
            msg: "ok",
            ok: true,
        })
    }).catch((e) => {

        // Check type of error
        if ( e instanceof PrismaClientKnownRequestError ) {
            // database conflict error
            res.statusCode = StatusCodes.CONFLICT;
            // Send error response
            res.send({
                msg: "User already exists in the database",
                ok: false,
            })
        } else {
            // bad input error
            res.statusCode = StatusCodes.BAD_REQUEST;
            // Send error response
            res.send({
                msg: e.message,
                ok: false,
            })
        }
    })
    
});

/* GET users listing. */
usersRouter.post('/login', function (req, res, next) {
    const { nickname, email, password } = req.body;
    console.log(nickname, email, password);

    // fetch user in database

    res.send({ ok: true });
});

usersRouter.delete('/:nickname', function (req, res, next) {
    const { nickname } = req.params;

    // delete user in database
    // try to create entry in database
    deleteUser(nickname).then(() => {
        // Send response back
        res.statusCode = StatusCodes.OK;
        res.send({
            msg: "ok",
            ok: true,
        })
    }).catch((e) => {

        // bad input error
        res.statusCode = StatusCodes.NOT_FOUND;
        // Send error response
        res.send({
            msg: "user not found",
            ok: false,
        })
    })
})

module.exports = usersRouter;