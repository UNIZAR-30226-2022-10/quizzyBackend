/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: chat.js
 * Module: routes
 * Description: Chat router
 */

var express = require("express");
const { StatusCodes } = require("http-status-codes");
const {
    getPublicGames,
    getPrivateGames,
} = require("../controllers/rest/games");

var gamesRouter = express.Router();

const { PrismaClientKnownRequestError } = require("@prisma/client");

const { authRestToken } = require('../middleware/auth');
const path = require("path");

module.exports = function (privateController, publicController) {
    gamesRouter.get("/public", authRestToken, (req, res, next) => {
        res.status(StatusCodes.OK)
        res.send({
            ok : true,
            games : getPublicGames(req.jwtUser, publicController)
        });
    });

    gamesRouter.get("/private", authRestToken, (req, res, next) => {
        res.status(StatusCodes.OK)
        res.send({
            ok : true,
            games : getPrivateGames(req.jwtUser, privateController)
        });
    });

    return gamesRouter;
}