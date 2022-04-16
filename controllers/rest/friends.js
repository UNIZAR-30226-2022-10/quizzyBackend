/*
 * Author: Darío Marcos Casalé (795306) 
 *      & Jaime Martín Trullén (801965)
 * Filename: friends.js
 * Module: controllers/rest
 * Description: Controller for friends route
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { StatusCodes } = require("http-status-codes");
const createError = require("http-errors");


