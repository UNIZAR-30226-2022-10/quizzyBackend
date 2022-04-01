/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: users.js
 * Module: utils
 * Description: Input validation utilities
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Constraints
const NICKNAME_MAX_LENGTH = 20;

/**
 * 
 * @param {string} nickname The string to validate 
 * @returns {boolean} true if the nickname has between 1 and 20 characters,
 *                    false otherwise
 */
function validateNickname(nickname) {

    const regexNicknameValidation = /^[A-Za-z0-9_]{1,20}$/;

    return regexNicknameValidation.test(nickname)
}

function validateEmail(email) {

    // RFC 5322 official regex for checking if an email is valid is too long
    // (nevertheless, it can be found here: http://emailregex.com)
    // The regex used here is an adaptation of a version found at 
    // https://www.regular-expressions.info/email.html .
    //
    // An email is considered to be valid if it has at least one character behind the 
    // @, at least one character after the @, a dot and more than one character for
    // the domain.
    const regexMailValidation = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/

    return regexMailValidation.test(email)
}

async function validateCategory(category) {
    
    // fetch category from database if it exists
    return await prisma.categories.findFirst({
        where : {
            category_name : category
        }
    })
}

function validateDifficulty(diff) {
    
    return diff === 'easy' ||
           diff === 'medium' ||
           diff === 'hard';
}

module.exports.validateNickname   = validateNickname;
module.exports.validateEmail      = validateEmail;
module.exports.validateCategory   = validateCategory;
module.exports.validateDifficulty = validateDifficulty;
