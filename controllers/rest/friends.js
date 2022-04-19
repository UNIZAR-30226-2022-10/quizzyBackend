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
                OR: [
                    {
                        nickname_1: nickname,

                        select: {
                            nickname_2: true
                        }
                    },
                    {
                        nickname_2: nickname,

                        select: {
                            nickname_1: true
                        }
                    }
                ]
            },
            
        }
    );

    return allFriends;
}

async function addFriend(nickname, friendNickname){

    if(!nickname || !validateNickname(nickname)){
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");
    }

    if(!nickname || !validateNickname(nickname)){
        throw createError(StatusCodes.BAD_REQUEST, "Invalid friend nickname");
    }

    //  ADD

    return await prisma.friends.create({
        data: {
            nickname_1: nickname,
            nickname_2: friendNickname
        }
    });
}

async function deleteFriend(nickname, friendNickname){

    if(!nickname || !validateNickname(nickname)){
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");
    }

    if(!nickname || !validateNickname(nickname)){
        throw createError(StatusCodes.BAD_REQUEST, "Invalid friend nickname");
    }

    //  DELETE
    return await prisma.friends.delete({
        where: {
            OR: [
                {
                    nickname_1: nickname,
                    nickname_2: friendNickname
                },
                
                {
                    nickname_1: friendNickname,
                    nickname_2: nickname
                }
            ]
        }
    });
}

module.exports.getFriends = getFriends;
module.exports.addFriend = addFriend;
module.exports.deleteFriend = deleteFriend;