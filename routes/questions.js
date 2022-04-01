/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: questions.js
 * Module: routes
 * Description: Questions router
 */
var express = require('express');
const { StatusCodes } = require('http-status-codes');
const { getQuestions, acceptQuestion, proposalQuestion, deleteQuestion } = require('../middlewares/questions');

var questionsRouter = express.Router();

const { PrismaClientKnownRequestError, PrismaClient } = require('@prisma/client');

// get questions
questionsRouter.get('/', function(req, res, next) {
    const { limit, difficulty, category } = req.query;
    
    getQuestions(limit, difficulty, category).then(questions => {
        res.statusCode = StatusCodes.OK;
        res.send({
            questions : questions,
            ok: true
        });
    }).catch(e => {
        res.statusCode = StatusCodes.BAD_REQUEST;
        res.send({
            msg: e.message,
            ok : false
        })
    })
})

// get proposals
questionsRouter.put('/review', function(req, res, next) {
    const id = parseInt(req.query.id);

    acceptQuestion(id).then(() => {
        res.statusCode = StatusCodes.OK;
        res.send({
            msg: "Question reviewed",
            ok: true
        });
    }).catch(e => {
        res.statusCode = e.status;
        res.send({
            msg: e.message,
            ok : false
        })
    })
})

questionsRouter.delete('/review', function(req, res, next) {
    
    const {questionId} = req.body;

    deleteQuestion(questionId).then( () => {
        res.statusCode = StatusCodes.OK;
        res.send({
            msg: "Question deleted succesfully",
            ok : true,
        })
    }).catch((e) => {
        
        // Check type of error
        if (e instanceof PrismaClientKnownRequestError) {
            // database conflict error
            res.statusCode = StatusCodes.CONFLICT;
            // Send error response
            res.send({
                msg: "The specified resource was not found",
                ok: false,
            })
        } else {
            // bad input error
            res.statusCode = StatusCodes.BAD_REQUEST;
            // Send error response
            res.send({
                msg: e.message,
                ok: false,
            })
        }
    })
})

// proposal
questionsRouter.post('/proposal', function(req, res, next) {
    const {category, statement, difficulty, correctAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3, user} = req.body;
    console.log(req.body)
    proposalQuestion(statement, category, difficulty, correctAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3, user).then(() => {
        res.statusCode = StatusCodes.OK;
        res.send({
            msg: "Question proposal sent succesfully",
            ok : true,
        })    
    }).catch((e) => {
        // bad input error
        res.statusCode = StatusCodes.BAD_REQUEST;
        // Send error response
        res.send({
            msg: e.message,
            ok: false,
        })
    })
});

module.exports = questionsRouter;