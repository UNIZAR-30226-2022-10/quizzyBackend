/*
 * Author: Jaime Martín Trullén (801965)
 * Filename: friends.js
 * Module: routes
 * Description: Friends router
 */
var express = require("express");
const { StatusCodes } = require("http-status-codes");
const {
    getFriends,
    addFriend,
    deleteFriend
} = require("../controllers/rest/friends");

var friendsRouter = express.Router();

const { PrismaClientKnownRequestError } = require("@prisma/client");

const { authRestToken } = require('../middleware/auth');

friendsRouter.get("/user/"+ req.jwtUser + "/friends", authRestToken, function(req, res, next){
    
    getFriends(req.jwtUser)
        .then((friends) => {
            res.statusCode = StatusCodes.OK;
            res.send({
                friends: friends,
                ok: true
            });
        })
        .catch((e) => {
            res.statusCode = e.status;
            res.send({
                msg: e.message,
                ok: false
            });
        });
});

friendsRouter.post("/user/"+ req.jwtUser + "/friends", authRestToken, function(req, res, next){
    
    const{friendNickname} = req.body;

    addFriend(req.jwtUser, friendNickname)
        .then(() => {
            res.statusCode = StatusCodes.OK;
            res.send({
                msg: "Succesfull operation",
                ok: true
            });
        })
        .catch((e) => {
            
            if (e instanceof PrismaClientKnownRequestError){
                res.statusCode = StatusCodes.CONFLICT;

                res.send({
                    msg: "User not found",
                    ok: false
                });
            }
            else{
                res.statusCode = e.status;
                res.send({
                    msg: e.message,
                    ok: false
                });
            }
        });
});

friendsRouter.delete("/user/"+ req.jwtUser + "/friends", authRestToken, function(req, res, next){
    
    const{friendNickname} = req.body;

    deleteFriend(req.jwtUser, friendNickname)
        .then(() => {
            res.statusCode = StatusCodes.OK;
            res.send({
                msg: "Succesfull operation",
                ok: true
            });
        })
        .catch((e) => {

            if (e instanceof PrismaClientKnownRequestError){
                res.statusCode = StatusCodes.CONFLICT;

                res.send({
                    msg: "User not found",
                    ok: false
                });
            }
            else{
                res.statusCode = e.status;
                res.send({
                    msg: e.message,
                    ok: false
                });
            }
        });
});

module.exports = friendsRouter;
