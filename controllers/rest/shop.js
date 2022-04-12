/*
 * Author: Darío Marcos Casalé (795306) & Jaime Martín Trullén
 * Filename: questions.js
 * Module: controllers/rest
 * Description: Input validation utilities
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { StatusCodes } = require("http-status-codes");
const createError = require("http-errors");

async function getShop() {
    return {
        cosmetics : await prisma.cosmetics.findMany(),
        wildcards : await prisma.wildcards.findMany()
    };
}

module.exports = { getShop };