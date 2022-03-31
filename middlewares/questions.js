const { PrismaClient } = require('@prisma/client');
const { pickRandom } = require('../utils/algorithm');
const prisma = new PrismaClient();

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
    const allQuestions = await prisma.questions.findMany(queryArgs(difficulty, category));

    // Get random number of questions
    return pickRandom(allQuestions, lim);
}

module.exports.getQuestions = getQuestions;