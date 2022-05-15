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


async function getFriends(nickname){

    if(!nickname || !validateNickname(nickname)){
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");
    }
    
    //  GET

    const allFriends = await prisma.friends.findMany(
        {
            where: {
                nickname_1: nickname,
                accepted: true
            },

            select: {
                nickname_2: true
            }
        });

    return allFriends;
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
            {nickname_1: nickname,          nickname_2: friendNickname}, 
            {nickname_1:friendNickname,     nickname_2: nickname}
        ]
            
    })
    .catch(() => {
        throw createError(StatusCodes.NOT_FOUND, "Friend request not found");
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
    WHERE ((nickname_1 = ${nickname} AND nickname_2 = ${friendNickname}) 
    OR (nickname_1 = ${friendNickname} AND nickname_2 = ${nickname})) AND accepted = false;`
    .catch(() => {
        throw createError(StatusCodes.NOT_FOUND, "Friend request not found");
    });
}

module.exports.getFriends = getFriends;
module.exports.addFriend = addFriend;
module.exports.deleteFriend = deleteFriend;
module.exports.acceptFriend = acceptFriend;