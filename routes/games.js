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
    getInvites,
    invitePlayer,
    removeInvite
} = require("../controllers/rest/games");

var gamesRouter = express.Router();

const { authRestToken } = require('../middleware/auth');

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

    gamesRouter.get("/invite", authRestToken, (req, res, next) => {
        getInvites(req.jwtUser)
            .then((invites) => {
                res.statusCode = StatusCodes.OK;
                res.send({
                    invites: invites,
                    ok: true
                });
            })
            .catch((e) => {
                console.log(e.message);
                res.statusCode = e.status || 400;
                res.send({
                    msg: e.message,
                    ok: false
                });
            });
    });

    gamesRouter.post("/invite", authRestToken, (req, res, next) => {

        const { nickname, rid } = req.body;

        invitePlayer(nickname, rid, req.jwtUser)
            .then(() => {
                res.statusCode = StatusCodes.OK;
                res.send({
                    ok: true
                });
            })
            .catch((e) => {
                console.log(e.message);
                res.statusCode = e.status || 400;
                res.send({
                    msg: e.message,
                    ok: false
                });
            });
    });

    gamesRouter.delete("/invite", authRestToken, (req, res, next) => {

        const { nickname, rid } = req.body;

        removeInvite(nickname, rid)
            .then(() => {
                res.statusCode = StatusCodes.OK;
                res.send({
                    ok: true
                });
            })
            .catch((e) => {
                console.log(e.message);
                res.statusCode = e.status || 400;
                res.send({
                    msg: e.message,
                    ok: false
                });
            });
    });

    return gamesRouter;
}