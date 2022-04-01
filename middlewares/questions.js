const { PrismaClient } = require('@prisma/client');
const { pickRandom } = require('../utils/algorithm');
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

module.exports.getQuestions   = getQuestions;
module.exports.acceptQuestion = acceptQuestion;