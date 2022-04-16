/*
 * Author: Jaime Martín Trullén (801965)
 * Filename: friends.js
 * Module: routes
 * Description: Friends router
 */
var express = require("express");
const { StatusCodes } = require("http-status-codes");
const {

} = require("../controllers/rest/friends");

var friendsRouter = express.Router();

const { PrismaClientKnownRequestError } = require("@prisma/client");

const { authRestToken } = require('../middleware/auth');



module.exports = friendsRouter;
