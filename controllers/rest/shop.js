/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: shop.js
 * Module: controllers/rest
 * Description: Controller for shop route
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { StatusCodes } = require("http-status-codes");
const createError = require("http-errors");
const { validateNickname } = require("../../utils/validateInput");

/**
 * Get a list of the available cosmetics
 * @returns A list with every cosmetic
 */
async function getCosmetics() {
    return await prisma.cosmetics.findMany();
}

/**
 * Get a list of the available wildcards
 * @returns 
 */
async function getWildcards() {
    return await prisma.wildcards.findMany();
}

/**
 * Try to buy a cosmetic from the shop.
 * 
 * If the cosmetic and user exist and there's enough cash in his wallet
 * in order to buy the article, its price will be subtracted from the user's wallet
 * and the item will be included in the user's inventory.
 * Otherwise, this function will throw an exception with the appropriate message and
 * HTTP status code.
 * @param {String} user The user who will buy the cosmetic 
 * @param {BigInt} id The id of the cosmetic
 */
async function buyCosmetic(user, id) {
    // validate inputs
    if (!user || !validateNickname(user))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    if (!id || id < 0)
        throw createError(StatusCodes.BAD_REQUEST, "Invalid cosmetic id");

    // check if user exists
    var account = await prisma.users.findFirst({
        where: {
            nickname: user
        }
    });

    if (!account) throw createError(StatusCodes.NOT_FOUND, "User not found");

    // check if item exists
    var item = await prisma.cosmetics.findFirst({
        where: {
            cosmetic_id: id
        }
    });

    if (!item) throw createError(StatusCodes.NOT_FOUND, "Cosmetic not found");

    if (account.wallet < item.price)
        throw createError(StatusCodes.CONFLICT, "You don't have enough coins");

    // add new record : user owns this cosmetic
    await prisma.user_cosmetics
        .create({
            data: {
                nickname: user,
                cosmetic_id: id
            }
        })
        .then(async () => {
            // update wallet
            await prisma.users.update({
                where: {
                    nickname: user
                },
                data: {
                    wallet: account.wallet - item.price
                }
            });
        })
        .catch(() => {
            // user already owns this product
            throw createError(
                StatusCodes.CONFLICT,
                "You already have this item!"
            );
        });
}

async function buyWildcards(user, id, amount) {
    // validate inputs
    if (!user || !validateNickname(user))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");

    if (!id || id <= 0)
        throw createError(StatusCodes.BAD_REQUEST, "Invalid cosmetic id");

    if (!amount || amount <= 0)
        throw createError(StatusCodes.BAD_REQUEST, "Invalid amount");

    // check if user exists
    var account = await prisma.users.findFirst({
        where: {
            nickname: user
        }
    });

    if (!account) throw createError(StatusCodes.NOT_FOUND, "User not found");

    // check if item exists
    var item = await prisma.wildcards.findFirst({
        where: {
            wildcard_id: id
        }
    });

    if (!item) throw createError(StatusCodes.NOT_FOUND, "Wildcard not found");

    if (account.wallet < item.price * amount)
        throw createError(StatusCodes.CONFLICT, "You don't have enough coins");

    // update wallet
    // no ORM feature currently available (see https://github.com/prisma/prisma-client-js/issues/775)
    await prisma.$queryRaw`UPDATE user_wildcards SET cuantity = cuantity + ${amount}
    WHERE wildcard_id = ${id} AND nickname = ${user};`;

    // update wallet
    await prisma.users.update({
        where: {
            nickname: user
        },
        data: {
            wallet: account.wallet - item.price * amount
        }
    });
}

module.exports = { getCosmetics, getWildcards, buyCosmetic, buyWildcards };
