/*
 * Author: Darío Marcos Casalé (795306) 
 *      & Jaime Martín Trullén (801965)
 * Filename: friends.js
 * Module: controllers/rest
 * Description: Controller for friends route
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
    validateNickname
} = require("../../utils/validateInput");

const { StatusCodes } = require("http-status-codes");
const createError = require("http-errors");

/**
 * Get the list of friends for the user.
 * This function will throw if the user doesn't exist.
 * @param {String} nickname The user's nickname
 * @returns {Array} the user's friends
 */
async function getFriends(nickname){

    if(!nickname || !validateNickname(nickname)){
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");
    }

    await prisma.users.findFirst({
        where : {
            nickname : nickname
        }
    }).catch(e => {
        throw new createError(StatusCodes.NOT_FOUND, "This user doesn't exist")
    })
    
    // GET
    /*
     * Load list of accepted and pending friends for the current user.
     * A is B's friend iff A has accepted B's request and viceversa.
     */
    let allFriends = await prisma.$queryRaw`
        SELECT F.nickname_2 FROM (
            SELECT nickname_1, nickname_2 
            FROM friends A
            WHERE ( nickname_1 = ${nickname} AND accepted = TRUE)
        ) AS F, friends AS G
        WHERE G.nickname_1 = F.nickname_2 AND G.nickname_2 = F.nickname_1 AND G.accepted = TRUE;
        `

    return allFriends;
}

async function getPendingRequests(nickname){

    if(!nickname || !validateNickname(nickname)){
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");
    }
    
    //  GET
    const allPending = await prisma.friends.findMany(
    {
        where: {
            nickname_1: nickname,
            accepted: false
        },

        select: {
            nickname_2: true
        }
    });

    return allPending;
}

async function addFriend(nickname, friendNickname){

    if(!nickname || !validateNickname(nickname)){
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");
    }

    if(!friendNickname || !validateNickname(friendNickname)){
        throw createError(StatusCodes.BAD_REQUEST, "Invalid friend nickname");
    }

    //  ADD

    await prisma.friends.createMany(
    {
        data: [
            {nickname_1: nickname,       nickname_2: friendNickname, accepted: true}, 
            {nickname_1: friendNickname, nickname_2: nickname}
        ]
            
    })
    .catch(() => {
        throw createError(StatusCodes.CONFLICT, "You already have a pending friend request!");
    });
}

async function deleteFriend(nickname, friendNickname){

    if(!nickname || !validateNickname(nickname)){
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");
    }

    if(!friendNickname || !validateNickname(friendNickname)){
        throw createError(StatusCodes.BAD_REQUEST, "Invalid friend nickname");
    }

    //  DELETE

    //  Due to a reiterated problem, we decided to use
    //  SQL syntax
    await prisma.$queryRaw`DELETE FROM friends WHERE
    (nickname_1 = ${nickname} AND nickname_2 = ${friendNickname}) OR 
    (nickname_1 = ${friendNickname} AND nickname_2 = ${nickname});`
    .catch(() => {
        throw createError(StatusCodes.NOT_FOUND, "Friend request not found");
    });
}

async function acceptFriend(nickname, friendNickname){

    if(!nickname || !validateNickname(nickname)){
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");
    }
    
    if(!friendNickname || !validateNickname(friendNickname)){
        throw createError(StatusCodes.BAD_REQUEST, "Invalid friend nickname");
    }

    //  UPDATE
    //  Due to a reiterated problem, we decided to use
    //  SQL syntax
    await prisma.$queryRaw`UPDATE friends SET accepted = true
    WHERE nickname_1 = ${nickname} AND nickname_2 = ${friendNickname} AND accepted = false;`
    .catch(() => {
        throw createError(StatusCodes.NOT_FOUND, "Friend request not found");
    });
}

module.exports.getFriends = getFriends;
module.exports.addFriend = addFriend;
module.exports.deleteFriend = deleteFriend;
module.exports.acceptFriend = acceptFriend;
module.exports.getPendingRequests = getPendingRequests;