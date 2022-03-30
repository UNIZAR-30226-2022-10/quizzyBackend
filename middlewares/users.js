/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: users.js
 * Module: middlewares
 * Description: User data access layer for managing user data.
 */
const { PrismaClient } = require('@prisma/client');

const { validateNickname, validateEmail } = require('../utils/validateInput');
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Register user into the system
async function registerUser(nickname, email, password) {

    // Validate nickname 
    if (!nickname || !validateNickname(nickname))
        throw new Error("Invalid nickname");

    // Validate email
    if (!email || !validateEmail(email))
        throw new Error("Invalid email");

    // Check if hash exists
    if (!password)
        throw new Error("Invalid password hash");

    return await prisma.users.create({
        data: {
            nickname: nickname,
            email: email,
            password: password,
            wallet: 300,
            actual_cosmetic: 1
        },
    })
}

async function deleteUser(nickname) {

    // Validate nickname 
    if (!nickname || !validateNickname(nickname))
        throw new Error("Invalid nickname");

    return await prisma.users.delete({
        where: {
            nickname: nickname,
        },
    })
}

async function checkUserCredentials(nickname, password) {

    // Validate nickname 
    if (!nickname || !validateNickname(nickname))
        throw new Error("Invalid nickname");

    // Check if hash exists
    if (!password)
        throw new Error("Invalid password hash");

    // Find entry in database
    return await prisma.users.findFirst({
        where: {
            nickname: nickname
        }
    }).then(async info => {
        // Check if the user exists
        if (info) {
            // Check if user exists and hashes are equal
            const validPassword = await bcrypt.compare(password, info.password);
            
            if (validPassword) {
                // Valid credentials
                return true;
            }
            // user exists but passwords do not match
            throw new Error("Passwords do not match")
        }
        // User doesn't exist
        throw new Error(`Can't find ${nickname}`)
    })
}


// Exports
module.exports.registerUser = registerUser;
module.exports.deleteUser = deleteUser;
module.exports.checkUserCredentials = checkUserCredentials;
