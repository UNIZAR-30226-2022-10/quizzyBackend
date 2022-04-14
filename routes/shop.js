/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: users.js
 * Module: routes
 * Description: Users router
 */
var express = require("express");
const { StatusCodes } = require("http-status-codes");

const { authRestToken } = require('../middleware/auth');
const {
    getCosmetics, getWildcards
} = require('../controllers/rest/shop');

var shopRouter = express.Router();
shopRouter.use(authRestToken);

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

shopRouter.post('/buy/cosmetic', function (req, res, next) {
    const { nickname, id } = req.body;
    buyItem('cosmetic', id).then(bought => {
        res.statusCode = StatusCodes.OK;
        res.send({
            cosmetics,
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
})

module.exports = shopRouter;