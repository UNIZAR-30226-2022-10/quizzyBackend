/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: users.js
 * Module: controllers/rest
 * Description: Controller for users route.
 */
const { PrismaClient } = require("@prisma/client");

const {
    validateNickname,
    validateEmail
} = require("../../utils/validateInput");
const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");
const createError = require("http-errors");
const prisma = new PrismaClient();

/**
 * Register a new user.
 * If the input isn't valid or a user with the same nickname already exists,
 * this will throw an exception.
 * 
 * Note that this is an async function so it must be handled via async/await or
 * the promise API.
 * @param {String} nickname The new user's nickname 
 * @param {String} email The new user's email
 * @param {String} password The user's hashed password
 */
async function registerUser(nickname, email, password) {
    // Validate nickname
    if (!nickname || !validateNickname(nickname))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    // Validate email
    if (!email || !validateEmail(email))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid email");

    // Check if hash exists
    if (!password)
        throw createError(StatusCodes.BAD_REQUEST, "Invalid password hash");

    return await prisma.users.create({
        data: {
            nickname: nickname,
            email: email,
            password: password,
            wallet: 300,
            actual_cosmetic: 1
        }
    }).then(async () => {
        // create initial user info

        // initialize wildcard count
        var wildcards = await prisma.wildcards.findMany();
        var records = wildcards.map(w => {
            return { 
                nickname, 
                wildcard_id : w.wildcard_id
            } 
        })

        await prisma.user_wildcards.createMany({
            data: records,
        })

        // Add basic cosmetic
        await prisma.user_cosmetics.create({
            data : {
                cosmetic_id : 1,
                nickname : nickname
            }
        })
    }).catch(e => {
        // If the user already exists, catch the exception generated by
        // Prisma and throw an HttpError.
        throw createError(StatusCodes.CONFLICT, "User already exists")
    });
}

/**
 * Get user information.
 * 
 * Note that this is an async function so it must be handled via async/await or
 * the promise API.
 * @param {String} nickname The user's nickname
 * @returns {User} The user info object
 */
async function getUser(nickname) {
    // Validate nickname
    if (!nickname || !validateNickname(nickname))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    // Find user by nickname
    var user = await prisma.users.findFirst({
        where: {
            nickname: nickname
        }
    })

    // throw if user doesn't exist
    if ( !user ) {
        throw createError(StatusCodes.NOT_FOUND);
    }

    return user;
}

/**
 * Get rduced user information.
 * 
 * Note that this is an async function so it must be handled via async/await or
 * the promise API.
 * @param {String} nickname The user's nickname
 * @returns {User} The user info object
 */
 async function getUserReduced(nickname) {
    // Validate nickname
    if (!nickname || !validateNickname(nickname))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    // Find user by nickname
    var user = await prisma.users.findFirst({
        where: {
            nickname: nickname
        },

        select: {
            nickname: true,
            actual_cosmetic: true
        }
    })

    // throw if user doesn't exist
    if ( !user ) {
        throw createError(StatusCodes.NOT_FOUND);
    }

    return user;
}

/**
 * Delete user by its nickname.
 * 
 * Note that this is an async function so it must be handled via async/await or
 * the promise API.
 * @param {String} nickname The user's nickname
 */
async function deleteUser(nickname) {
    // Validate nickname
    if (!nickname || !validateNickname(nickname))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    // delete user
    await prisma.users.delete({
        where: {
            nickname: nickname
        }
    }).catch(e => {
        // This could happen only if the jwt doesn't come from the backend.
        // This should never throw, but if it ever happens, we got this 
        // covered anyway.
        throw createError(StatusCodes.NOT_FOUND);
    });
}

/**
 * 
 * @param {String} nickname The user's nickname
 * @param {String} password The user's password (without hashing)
 * @returns 
 */
async function checkUserCredentials(nickname, password) {
    // Validate nickname
    if (!nickname || !validateNickname(nickname))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    // Check if hash exists
    if (!password)
        throw createError(StatusCodes.BAD_REQUEST, "Invalid password hash");

    // Find entry in database
    await prisma.users
        .findFirst({
            where: {
                nickname: nickname
            }
        })
        .then(async (info) => {
            // Check if the user exists
            if (info) {
                // Check if user exists and hashes are equal
                const validPassword = await bcrypt.compare(
                    password,
                    info.password
                );

                // user exists but passwords do not match
                if ( !validPassword )
                    throw createError(StatusCodes.UNAUTHORIZED, "Passwords do not match");
            } else {
                // User doesn't exist
                throw createError(StatusCodes.NOT_FOUND, `Can't find ${nickname}`);
            }
        })
}

/**
 * Get user wildcard information.
 * 
 * Note that this is an async function so it must be handled via async/await or
 * the promise API.
 * @param {String} nickname The user's nickname
 * @returns {Array} An array with the wildcards that this user owns.
 */
async function getUserWildcards(nickname) {
    // Validate nickname
    if (!nickname || !validateNickname(nickname))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    // Find user by nickname
    var user = await prisma.users.findFirst({
        where: {
            nickname: nickname
        }
    })

    if ( !user ) 
        throw createError(StatusCodes.NOT_FOUND, "User not found");

    // Find wildcards owned by user
    var wildcards = await prisma.user_wildcards.findMany({
        orderBy: [
            {
                wildcard_id: 'asc',
            },
        ],
        where: {
            nickname: nickname
        },
        select : {
            wildcard_id : true,
            cuantity : true,
            wildcards : {
                select : {
                    wname : true,
                    description : true
                }
            }
        }
    });

    // throw if user doesn't exist
    if ( !wildcards ) {
        throw createError(StatusCodes.NOT_FOUND, "User not found");
    }

    return wildcards.map(c => {
        let { wildcard_id, cuantity, wildcards } = c;
        
        return { wildcard_id, cuantity, ...wildcards }
    });
}

/**
 * Get user cosmetics information.
 * 
 * Note that this is an async function so it must be handled via async/await or
 * the promise API.
 * @param {String} nickname The user's nickname
 * @returns {Array} An array with the wildcards that this user owns.
 */
async function getUserCosmetics(nickname) {
    // Validate nickname
    if (!nickname || !validateNickname(nickname))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    // Find user by nickname
    var user = await prisma.users.findFirst({
        where: {
            nickname: nickname
        }
    })

    if ( !user ) 
        throw createError(StatusCodes.NOT_FOUND, "User not found");

    // Get user's cosmetics
    var cosmetics = await prisma.user_cosmetics.findMany({
        where: {
            nickname: nickname
        },
        select : {
            cosmetic_id : true,
            cosmetics : {
                select : {
                    cname : true,
                }
            }
        }
    })

    return cosmetics.map(c => {
        let { cosmetic_id, cosmetics } = c;

        return { cosmetic_id, ...cosmetics }
    });
}

/**
 * Equip a cosmetic. This function will throw if the cosmetic doesn't exist
 * or if the user hasn't bought it. Otherwise, the user's current cosmetic
 * w
 * @param {String} nickname The user's nickname
 * @param {BigInt} id The cosmetic id to equip
 */
async function equipCosmetic(nickname, id) {

    // Validate nickname
    if (!nickname || !validateNickname(nickname))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    // Find user by nickname
    var user = await prisma.users.findFirst({
        where: {
            nickname: nickname
        }
    })

    if ( !user ) 
        throw createError(StatusCodes.NOT_FOUND, "User not found");

    // check if item exists
    var item = await prisma.cosmetics.findFirst({
        where: {
            cosmetic_id: id
        }
    });

    if (!item) throw createError(StatusCodes.NOT_FOUND, "Cosmetic not found");

    // Get user's cosmetics
    var cosmetics = await prisma.user_cosmetics.findMany({
        where: {
            nickname: nickname
        },
        select : {
            cosmetic_id : true
        }
    })

    if ( !cosmetics.some(c => c.cosmetic_id === id) ) throw createError(StatusCodes.CONFLICT, "You haven't bought that cosmetic!");

    await prisma.users.update({
        where: {
            nickname: nickname,
        },
        data: {
            actual_cosmetic: id,
        },
    })
}

/**
 * Search users by a query string
 * @param {String} query The query to match
 * @returns {ArrayList} The list of users that match the query
 */
async function searchUsers(query) {
    console.log(`SELECT * FROM users WHERE nickname LIKE ${"'%" + query + "%'"}`)
    let v = await prisma.$queryRaw`SELECT * FROM users WHERE nickname LIKE ${"%" + query + "%"}`

    console.log(v);
    return v;
}

async function addMatch(winner, stats) {

    // update wallet
    // no ORM feature currently available (see https://github.com/prisma/prisma-client-js/issues/775)
    await prisma.$queryRaw`UPDATE users SET wallet = wallet + 50
        WHERE nickname = ${winner};`;

    // TODO: add match to match history
}

async function useWildcard(nickname, id) {

    console.log(id);

    // Validate nickname
    if (!nickname || !validateNickname(nickname))
    throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    // Find user by nickname
    var user = await prisma.users.findFirst({
        where: {
            nickname: nickname
        }
    })

    if ( !user ) 
        throw createError(StatusCodes.NOT_FOUND, "User not found");

    // check if item exists
    var item = await prisma.wildcards.findFirst({
        where: {
            wildcard_id: id
        }
    });

    if (!item) throw createError(StatusCodes.NOT_FOUND, "Wildcard not found");

    //  check if cuantity is > 0
    var num = await prisma.user_wildcards.findFirst({
        where: {
            wildcard_id : id,
            nickname: nickname
        }
    });

    if (!num || num.cuantity <= 0) throw createError(StatusCodes.CONFLICT, "You don't have this type of wildcard!");
    
    // update wildcard accound
    // no ORM feature currently available (see https://github.com/prisma/prisma-client-js/issues/775)
    await prisma.$queryRaw`UPDATE user_wildcards SET cuantity = cuantity - 1
        WHERE nickname = ${nickname} AND wildcard_id = ${id};`;
}
 
// Exports
module.exports = {
    registerUser,
    deleteUser, 
    checkUserCredentials, 
    getUser, 
    getUserWildcards, 
    getUserCosmetics,
    equipCosmetic,
    searchUsers,
    addMatch,
    useWildcard,
    getUserReduced
}
