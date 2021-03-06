/*
 * Author: Darío Marcos Casalé (795306) 
 *      & Jaime Martín Trullén (801965)
 * Filename: questions.js
 * Module: controllers/rest
 * Description: Controller for question route
 */

const { PrismaClient } = require("@prisma/client");
const { pickRandom } = require("../../utils/algorithm");
const {
    validateCategory,
    validateDifficulty,
    validateNickname
} = require("../../utils/validateInput");
const prisma = new PrismaClient();

const { StatusCodes } = require("http-status-codes");
const createError = require("http-errors");

/**
 * Make an object containing the filters for the database query for fetching questions.
 * If a filter parameter is null, it won't be included in the query.
 * @param {String} diff the difficulty filter (can be null)
 * @param {String} cat the category filter (can be null)
 * @returns An object with the provided filters which are not null.
 */
function queryArgs(diff, cat) {
    var args = {};
    if (diff) {
        // Filter by difficulty
        args = {
            where: {
                difficulty: diff
            }
        };
    }

    if (cat) {
        // add category filter
        args = {
            ...args,
            where: {
                ...args.where,
                category_name: cat
            }
        };
    }

    return args;
}

/**
 * Get questions from database
 * @param {BigInt} limit The number of questions to retrieve
 * @param {String} difficulty The difficulty filter
 * @param {String} category The category filter
 * @returns {Array} An array with random filtered questions
 * @throws {HttpError} BAD_REQUEST when the input is invalid
 */
async function getQuestions(limit, difficulty, category) {
    // check if limit is correct
    if (isNaN(limit) || (limit <= 0))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid question limit");

    if (category && !validateCategory(category))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid category name");

    if (difficulty && !validateDifficulty(difficulty))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid difficulty name");

    // Note: This might not be the best way to implement random fetching.
    //       may be subject to changes in the future.

    // fetch all questions filtering by difficulty and category
    const allQuestions = await prisma.questions.findMany(
        queryArgs(difficulty, category)
    );

    // Get random number of questions
    try {
        return pickRandom(allQuestions, limit);
    } catch {
        throw createError(StatusCodes.BAD_REQUEST, "Too many questions")
    }
}

/**
 *
 * @param {BigInt} id The id of the question to accept
 * @throws {HttpError} either when the id is invalid, the question doesn't existm
 *                     or if it exists, it has been already accepted
 */
async function acceptQuestion(id) {
    if (!id || id <= 0) {
        throw createError(StatusCodes.BAD_REQUEST, "Invalid id " + id);
    }

    await prisma.questions.findFirst({
            where: {
                question_id: id
            }
        })
        .then(async (r) => {
            if (!r)
                throw createError(StatusCodes.NOT_FOUND, "Can't find question");
            if (r && r.accepted)
                throw createError(
                    StatusCodes.BAD_REQUEST,
                    "Question is already accepted"
                );

            await prisma.questions.update({
                where: {
                    question_id: id
                },
                data: {
                    accepted: true
                }
            });
        });
}

async function proposalQuestion(
    statement,
    category,
    difficulty,
    correctAnswer,
    wrongAnswer1,
    wrongAnswer2,
    wrongAnswer3,
    nickname
) {
    if (!statement)
        throw createError(
            StatusCodes.BAD_REQUEST,
            "Invalid question statement"
        );

    if (!category || !validateCategory(category))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid category name");

    if (!difficulty || !validateDifficulty(difficulty))
        throw createError(StatusCodes.BAD_REQUEST, "Invalid difficulty name");

    if (!correctAnswer)
        throw createError(StatusCodes.BAD_REQUEST, "Invalid correct answer");

    if (!wrongAnswer1)
        throw createError(StatusCodes.BAD_REQUEST, "Invalid wrong answer 1");

    if (!wrongAnswer2)
        throw createError(StatusCodes.BAD_REQUEST, "Invalid wrong answer 2");

    if (!wrongAnswer3)
        throw createError(StatusCodes.BAD_REQUEST, "Invalid wrong answer 3");

    if (!nickname || !validateNickname(nickname)){
        throw createError(StatusCodes.BAD_REQUEST, "Invalid nickname");
    }
        

    return await prisma.questions.create({
        data: {
            question: statement,
            category_name: category,
            difficulty: difficulty,
            correct_answer: correctAnswer,
            wrong_answer_1: wrongAnswer1,
            wrong_answer_2: wrongAnswer2,
            wrong_answer_3: wrongAnswer3,
            accepted: false,
            nickname: nickname
        }
    })
    .catch(() => {
        throw createError(StatusCodes.CONFLICT, "Question Error");
    });
}

async function deleteQuestion(questionId) {
    if (!questionId || questionId <= 0) {
        throw createError(
            StatusCodes.BAD_REQUEST,
            "Invalid question identifier"
        );
    }

    return await prisma.questions.delete({
        where: {
            question_id: questionId
        }
    })
    .catch(() => {
        throw createError(StatusCodes.NOT_FOUND, "Question not found")
    });
}

async function getPendingProposals() {
    return await prisma.questions.findMany({
        where : {
            accepted : false
        }
    })
}

module.exports = {
    getPendingProposals,
    getQuestions,
    acceptQuestion,
    proposalQuestion,
    deleteQuestion
}
