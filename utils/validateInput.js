/*
 * Author: Darío Marcos Casalé (795306) & Jaime Martín Trullén
 * Filename: users.js
 * Module: utils
 * Description: Input validation utilities
 */

const { PrismaClient } = require("@prisma/client");
const { categories, difficulties } = require('./misc');

/**
 *
 * @param {string} nickname The string to validate
 * @returns {boolean} true if the nickname has between 1 and 20 characters,
 *                    false otherwise
 */
function validateNickname(nickname) {
    const regexNicknameValidation = /^[A-Za-z0-9_]{1,20}$/;

    return regexNicknameValidation.test(nickname);
}

/**
 *
 * @param {string} email The email to validate
 * @returns {boolean} true if the email follows the email regex specification
 *                    false otherwise
 */
function validateEmail(email) {
    // RFC 5322 official regex for checking if an email is valid is too long
    // (nevertheless, it can be found here: http://emailregex.com)
    // The regex used here is an adaptation of a version found at
    // https://www.regular-expressions.info/email.html .
    //
    // An email is considered to be valid if it has at least one character behind the
    // @, at least one character after the @, a dot and more than one character for
    // the domain.
    const regexMailValidation =
        /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/;

    return regexMailValidation.test(email);
}

/**
 *
 * @param {string} category_name The category to validate
 * @returns {boolean} true if category belongs to the set of question categories
 *                    false otherwise
 */
function validateCategory(category_name) {
    return categories.includes(category_name);
}

/**
 *
 * @param {string} difficulty_level the difficulty level to validate
 * @returns {boolean} true if difficulty belongs to the set of question categories
 *                    false otherwise
 */
function validateDifficulty(difficulty_level) {
    return difficulties.includes(difficulty_level);
}

module.exports = {validateCategory, validateDifficulty, validateEmail, validateNickname};
