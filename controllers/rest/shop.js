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

async function getCosmetics() {
    return await prisma.cosmetics.findMany();
}

async function getWildcards() {
    return await prisma.wildcards.findMany();
}

async function buyItem() {
    
}

module.exports = { getCosmetics, getWildcards, buyItem };