const { PrismaClient } = require('@prisma/client');
const { pickRandom } = require('../utils/algorithm');
const { validateCategory, validateDifficulty, validateNickname } = require('../utils/validateInput');
const prisma = new PrismaClient();

const { StatusCodes } = require('http-status-codes');
const createError = require('http-errors');

function queryArgs(diff, cat) {

    var args = {}
    if ( diff ) {
        // Filter by difficulty 
        args = {
            where : {
                difficulty : diff
            }
        }
    }
    
    if ( cat ) {
        // add category filter
        args = {
            ...args,
            where: {
                ...args.where,
                category_name : cat
            }
        }
    }

    return args;
}

async function getQuestions(limit, difficulty, category) {
    
    // Set default values
    let lim = limit ? limit : 20;

    // validate limit
    if ( lim <= 0 ) {
        throw new Error("Invalid question limit");
    }

    // Note: This might not be the best way to implement random fetching
    //       may be subject to changes in the future.

    // fetch all questions filtering by difficulty and category
    const allQuestions = await prisma.questions.findMany(queryArgs(difficulty, category));

    // Get random number of questions
    return pickRandom(allQuestions, lim);
}

async function acceptQuestion(id) {

    if ( !id ) {
        throw createError(StatusCodes.BAD_REQUEST, "Invalid id");
    }

    return await prisma.questions.findFirst({
        where : {
            question_id : id,
        }
    }).then(r => {

        if ( !r ) throw createError(StatusCodes.NOT_FOUND, "Can't find question");
        if ( r && r.accepted ) throw createError(StatusCodes.BAD_REQUEST, "Question is already accepted");

        return prisma.questions.update({
            where : {
                question_id : id
            },
            data : {
                accepted : true
            }
        })
    })
} 

async function proposalQuestion(statement, category, difficulty,
    correctAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3, nickname) {
    
    if (!statement)
        throw new Error("Invalid question statement");

    if (!category || !validateCategory(category))
        throw new Error("Invalid category name");

    if (!difficulty || !validateDifficulty(difficulty))
        throw new Error("Invalid difficulty name");

    if (!correctAnswer)
        throw new Error("Invalid correct answer");

    if (!wrongAnswer1)
        throw new Error("Invalid wrong answer 1");

    if (!wrongAnswer2)
        throw new Error("Invalid wrong answer 2");

    if (!wrongAnswer3)
        throw new Error("Invalid wrong answer 3");
    
    if (!nickname || !validateNickname(nickname))
        throw new Error("Invalid nickname");

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
        },
    })
}

async function deleteQuestion(questionId){
    
    if ( questionId <= 0 ) {
        throw new Error("Invalid question identifier");
    }

    return await prisma.questions.delete({
        where: {
            question_id: questionId
        },
    })
}

module.exports.getQuestions = getQuestions;
module.exports.acceptQuestion = acceptQuestion;
module.exports.proposalQuestion = proposalQuestion;
module.exports.deleteQuestion = deleteQuestion;