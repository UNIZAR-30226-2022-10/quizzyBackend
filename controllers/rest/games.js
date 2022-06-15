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
            leader_nickname : nickname,
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

/**
 * Get user's public game history
 * @param {String} nickname 
 */
 async function getPublicHistory(nickname) {
    // Validate nickname
    if (!nickname || !validateNickname(nickname))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    let games = await prisma.$queryRaw`SELECT PG.GAME_ID, PG.WINNERFROM PUBLIC_GAME PG, USER_PUBLIC_GAMES UPG 
        WHERE nickname = ${nickname} AND PG.GAME_ID = UPG.GAME_ID;`
    
    let result = await Promise.all(games.map(g =>
        prisma.user_public_games.findMany({
            where : {
                game_id : g.game_id
            },
            select : {
                nickname : true
            }
        })
        .then(players => { return { ...g, players : players.map(p => p.nickname) } })
    ))

    return result;
}


/**
 * Get user's private game history
 * @param {String} nickname 
 */
async function getPrivateHistory(nickname) {
    // Validate nickname
    if (!nickname || !validateNickname(nickname))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    let games = await prisma.$queryRaw`SELECT PG.GAME_ID, PG.WILDCARDS_ENABLE, PG.ANSWER_TIME, PG.DIFFICULTY, PG.WINNER 
        FROM PRIVATE_GAME PG, USER_PRIVATE_GAMES UPG WHERE nickname = ${nickname} AND PG.GAME_ID = UPG.GAME_ID;`
    
    let result = await Promise.all(games.map(g =>
        prisma.user_private_games.findMany({
            where : {
                game_id : g.game_id
            },
            select : {
                nickname : true
            }
        })
        .then(players => { return { ...g, players : players.map(p => p.nickname) } })
    ))

    return result;
}

module.exports = {
    getPublicGames,
    getPrivateGames,
    invitePlayer,
    getInvites,
    removeInvite,
    getPublicHistory,
    getPrivateHistory,
}