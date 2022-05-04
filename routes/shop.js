/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: users.js
 * Module: routes
 * Description: Users router
 */
var express = require("express");
const { StatusCodes } = require("http-status-codes");
const jwt_decode = require("jwt-decode");

const { authRestToken } = require('../middleware/auth');
const {
    getCosmetics, getWildcards, buyCosmetic, buyWildcards
} = require('../controllers/rest/shop');

var shopRouter = express.Router();

shopRouter.get('/cosmetics', function (req, res, next){
    getCosmetics().then((cosmetics) => {
        res.statusCode = StatusCodes.OK;
        res.send({
            cosmetics,
            ok: true
        });
    })
    .catch((e) => {
        res.statusCode = StatusCodes.BAD_REQUEST;
        res.send({
            msg: e.message,
            ok: false
        });
    });
});

shopRouter.get('/wildcards', function (req, res, next){
    getWildcards().then((wildcards) => {
        res.statusCode = StatusCodes.OK;
        res.send({
            wildcards,
            ok: true
        });
    })
    .catch((e) => {
        res.statusCode = StatusCodes.BAD_REQUEST;
        res.send({
            msg: e.message,
            ok: false
        });
    });
});

shopRouter.post('/cosmetics/buy', authRestToken, function (req, res, next) {

    // Get jwt ( must be a valid one )
    const token = req.headers['authorization'].split(" ")[1]

    // parse header
    var { name } = jwt_decode(token, { payload: true });

    const { id } = req.body;
    buyCosmetic(name, id).then(() => {
        res.statusCode = StatusCodes.OK;
        res.send({
            ok: true
        });
    })
    .catch((e) => {
        res.statusCode = e.status || 400;
        res.send({
            msg: e.message,
            ok: false
        });
    });
})

shopRouter.post('/wildcards/buy', authRestToken, function (req, res, next) {

    // Get jwt ( must be a valid one )
    const token = req.headers['authorization'].split(" ")[1]

    // parse header
    var { name } = jwt_decode(token, { payload: true });

    const { id, amount } = req.body;
    buyWildcards(name, id, amount).then(() => {
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
})

module.exports = shopRouter;