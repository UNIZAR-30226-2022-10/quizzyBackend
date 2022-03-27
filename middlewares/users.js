/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: users.js
 * Module: middlewares
 * Description: User data access layer for managing user data.
 */
const { PrismaClient } = require('@prisma/client');

const { validateNickname, validateEmail } = require('../utils/validateInput');

const prisma = new PrismaClient();

// Register user into the system
async function registerUser(nickname, email, password) {
    
    // Validate nickname 
    if ( !nickname || !validateNickname(nickname) )
        throw new Error("Invalid nickname");

    // Validate email
    if ( !email || !validateEmail(email) )
        throw new Error("Invalid email");

    // Check if hash exists
    if ( !password )
        throw new Error("Invalid password hash");

    console.log(password)
    return await prisma.users.create({
        data: {
            nickname: nickname,
            email: email,
            password: password,
            wallet: 0,
            public_wins: 0,
            private_wins: 0,
            actual_cosmetic: 1
        },
    })
}

async function deleteUser(nickname) {

    // Validate nickname 
    if ( !nickname || !validateNickname(nickname) )
        throw new Error("Invalid nickname");

    return await prisma.users.delete({
        where: {
            nickname: nickname,
        },
    })
}

async function checkUserCredentials(nickname, password) {

    // Validate nickname 
    if ( !nickname || !validateNickname(nickname) )
        throw new Error("Invalid nickname");

    // Check if hash exists
    if ( !password )
        throw new Error("Invalid password hash");
    
    // Find entry in database
    return await prisma.users.findFirst({
        where: {
            nickname: nickname
        }
    }).then(info => {
        // Check if user exists and hashes are equal
        if ( info && info.password.trim() === password ) {
            return true;
        } else if ( !info ) {
            throw new Error(`Can't find ${nickname}`)
        } else {
            throw new Error("Passwords do not match")
        }
    })
}


// Exports
module.exports.registerUser         = registerUser;
module.exports.deleteUser           = deleteUser;
module.exports.checkUserCredentials = checkUserCredentials;
