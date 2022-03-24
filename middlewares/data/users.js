/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: users.js
 * Module: middlewares/data
 * Description: User data access layer for managing user data.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Register user into the system

async function registerUser(nickname, email, password) {
    
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

// Exports
module.exports.registerUser = registerUser;
