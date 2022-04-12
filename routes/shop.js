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
    getShop
} = require('../controllers/rest/shop');

var shopRouter = express.Router();

shopRouter.get('/', function (req, res, next){
    getShop().then(({cosmetics, wildcards}) => {
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
});

shopRouter.post('/buy', authRestToken, function (req, res, next) {
    console.log("jwt ok")
    res.status(StatusCodes.OK);
    res.send({ ok : true })
})

module.exports = shopRouter;