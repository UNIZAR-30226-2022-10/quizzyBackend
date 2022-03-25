/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: users.js
 * Module: utils
 * Description: Input validation utilities
 */

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

/**
 * 
 * @param {string} password The password to validate
 * @returns {Number} The strength of the passwordL
 *  - 0 for bad passwords
 *  - 1 for weak passwords
 *  - 2 for medium passwords
 *  - 3 for strong passwords
 */
function validatePassword(password) {

    // at least 8 characters
    const regexPasswordWeak = /^.{8,}$/;

    // At least one lowercase, one uppercase, one number. At least 8 characters
    const regexPasswordMedium = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

    // At least one lowercase, one uppercase, one number and one special symbol. At least 8 characters
    const regexPasswordStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[_\-!@#$&*])(?=.*[0-9]).{8,}$/;

    if ( regexPasswordStrong.test(password) ) {
        return 3;
    } else if ( regexPasswordMedium.test(password) ) {
        return 2;
    } else if ( regexPasswordWeak.test(password) ) {
        return 1;
    } else {
        return 0;
    }
}

function validateEmail(email) {

    // RFC 5322 official regex for checking if an email is valid is too long
    // and a pain to test (nevertheless, it can be found here: http://emailregex.com)
    // The regex used here is an adaptation of a version found at 
    // https://www.regular-expressions.info/email.html .
    //
    // An email is considered to be valid if it has at least one character behind the 
    // @, at least one character after the @, a dot and more than one character for
    // the domain.
    const regexMailValidation = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/

    return regexMailValidation.test(email)
}

module.exports.validateNickname = validateNickname;
module.exports.validateEmail    = validateEmail;
module.exports.validatePassword = validatePassword;
