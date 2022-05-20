/*
 * Author: Darío Marcos Casalé (795306) & Jaime Martín Trullén
 * Filename: games.js
 * Module: controllers/rest
 * Description: game route controllers
 */

function getPublicGames(nickname, publicController) {
    return publicController.getUserMatches(nickname);
}

function getPrivateGames(nickname, privateController) {
    return privateController.getUserMatches(nickname);
}

module.exports = {
    getPublicGames,
    getPrivateGames
}