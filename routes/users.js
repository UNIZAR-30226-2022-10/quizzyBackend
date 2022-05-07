/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: users.js
 * Module: routes
 * Description: Users router
 */
var express = require("express");
const { StatusCodes } = require("http-status-codes");
const jwt_decode = require("jwt-decode");

const {
    registerUser,
    deleteUser,
    checkUserCredentials,
    getUser,
    getUserWildcards,
    getUserCosmetics,
    equipCosmetic
} = require("../controllers/rest/users");

const { signToken } = require("../utils/auth");
const { authRestToken } = require('../middleware/auth');

var usersRouter = express.Router();

/**
 * This route will register a new user in the database if the information
 * is valid.
 */
usersRouter.post("/", function (req, res, next) {
    const { nickname, email, password } = req.body;

    // try to create entry in database
    registerUser(nickname, email, password)
        .then(() => {
            // Send response back
            res.statusCode = StatusCodes.OK;
            res.send({
                msg: "ok",
                ok: true
            });
        })
        .catch((e) => {
            // bad input error
            res.statusCode = e.status || 400;
            // Send error response
            res.send({
                msg: e.message,
                ok: false
            });
        });
});

/* GET users listing. */
usersRouter.post("/login", function (req, res, next) {
    const { nickname, password } = req.body;

    // fetch user in database
    checkUserCredentials(nickname, password)
        .then(() => {
            // Sign token
            const token = signToken(nickname);

            res.send({
                ok: true,
                token: token
            });
        })
        .catch((e) => {
            res.statusCode = e.status || 400;
            // Send error response
            res.send({
                msg: e.message,
                ok: false
            });
        });
});

usersRouter.get("/", authRestToken, function (req, res, next) {

    // delete user in database
    getUser(req.jwtUser)
        .then((user) => {
            // Send response back
            res.statusCode = StatusCodes.OK;
            res.send({
                ...user,
                ok: true
            });
        })
        .catch((e) => {
            // bad input error
            res.statusCode = e.status || 400;
            // Send error response
            res.send({
                msg: e.message,
                ok: false
            });
        });
});

usersRouter.delete("/", authRestToken, function (req, res, next) {

    // delete user in database
    deleteUser(req.jwtUser)
        .then(() => {
            // Send response back
            res.statusCode = StatusCodes.OK;
            res.send({
                ok: true
            });
        })
        .catch((e) => {
            // bad input error
            res.statusCode = e.status || 400;
            // Send error response
            res.send({
                msg: e.message,
                ok: false
            });
        });
});


usersRouter.get("/wildcards", authRestToken, function (req, res, next) {

    // delete user in database
    getUserWildcards(req.jwtUser)
        .then((wildcards) => {
            // Send response back
            res.statusCode = StatusCodes.OK;
            res.send({
                wildcards,
                ok: true
            });
        })
        .catch((e) => {
            // bad input error
            res.statusCode = e.status || 400;
            // Send error response
            res.send({
                msg: e.message,
                ok: false
            });
        });
});

usersRouter.get("/cosmetics", authRestToken, function (req, res, next) {

    // delete user in database
    getUserCosmetics(req.jwtUser)
        .then((cosmetics) => {
            // Send response back
            res.statusCode = StatusCodes.OK;
            res.send({
                cosmetics,
                ok: true
            });
        })
        .catch((e) => {
            // bad input error
            res.statusCode = e.status || 400;
            // Send error response
            res.send({
                msg: e.message,
                ok: false
            });
        });
});

usersRouter.put("/equip", authRestToken, function (req, res, next) {

    equipCosmetic(req.jwtUser, req.body.id)
        .then(() => {
            // Send response back
            res.statusCode = StatusCodes.OK;
            res.send({
                ok: true
            });
        })
        .catch((e) => {
            // bad input error
            res.statusCode = e.status || 400;
            // Send error response
            res.send({
                msg: e.message,
                ok: false
            });
        });
});

module.exports = usersRouter;
