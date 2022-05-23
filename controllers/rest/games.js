/*
 * Author: Darío Marcos Casalé (795306) & Jaime Martín Trullén
 * Filename: games.js
 * Module: controllers/rest
 * Description: game route controllers
 */
const createError = require("http-errors");
const { StatusCodes } = require("http-status-codes");

const { validateNickname } = require('../../utils/validateInput')
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Get a list with the public games in which the user is currently playing
 * @param {String} nickname The user's nickname
 * @param {String} publicController The public controller instance
 * @returns {Array} The list of games
 */
function getPublicGames(nickname, publicController) {
    return publicController.getUserMatches(nickname);
}

/**
 * Get a list with the private games in which the user is currently playing
 * @param {String} nickname The user's nickname
 * @param {String} privateController The public controller instance
 * @returns {Array} The list of games
 */
function getPrivateGames(nickname, privateController) {
    return privateController.getUserMatches(nickname);
}

/**
 * Invite player to a private match.
 * @param {String} nickname The invited user's nickname
 * @param {BigInt} rid The room id
 * @param {String} leaderNick The room leader's nickname
 */
async function invitePlayer(nickname, rid, leaderNick) {
    // Validate nickname
    if (!nickname || !validateNickname(nickname))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    // Validate leader nickname
    if (!leaderNick || !validateNickname(leaderNick))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid leader nickname");

    // Validate room number
    if ( rid == null || rid < 0 )
        throw createError(StatusCodes.BAD_REQUEST, "Invalid room id");

    // TODO: include in atomic transaction
    await prisma.users.count({
            where : {
                nickname
            }
        })
        .then(c => {
            if ( c === 0 ) {
                throw createError(StatusCodes.NOT_FOUND, "Can't find user")
            }
        })
    await prisma.users.count({
            where : {
                nickname : leaderNick
            }
        })
        .then(c => {
            if ( c === 0 ) {
                throw createError(StatusCodes.NOT_FOUND, "Can't find leader")
            }
        })

    await prisma.game_invites.create({
        data : {
            nickname,
            leader_nickname: leaderNick,
            rid
        }
    })
    .catch(e => {
        throw createError(StatusCodes.CONFLICT, "Can't send same invitation more than once");
    })
}

/**
 * Remove invite from game invitation list.
 * @param {String} nickname The invited user's nickname
 * @param {BigInt} rid The room id
 */
async function removeInvite(nickname, rid) {
    // Validate nickname
    if (!nickname || !validateNickname(nickname))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    // Validate room number
    if ( rid == null || rid < 0 )
        throw createError(StatusCodes.BAD_REQUEST, "Invalid room id");

    await prisma.game_invites.deleteMany({
        where : {
            nickname,
            rid
        }
    })
    .catch(e => {
        throw createError(StatusCodes.CONFLICT, "Can't send same invitation more than once");
    })
}

/**
 * Get all invites sent to this user.
 * @param {String} nickname The user's nickname 
 * @return {Array} The list of invites
 */
async function getInvites(nickname) {
    // Validate nickname
    if (!nickname || !validateNickname(nickname))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    return await prisma.game_invites.findMany({
        where : {
            nickname
        }
    })
}

module.exports = {
    getPublicGames,
    getPrivateGames,
    invitePlayer,
    getInvites,
    removeInvite,
}