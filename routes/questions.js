/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: questions.js
 * Module: routes
 * Description: Questions router
 */
var express = require("express");
const { StatusCodes } = require("http-status-codes");
const {
    getQuestions,
    acceptQuestion,
    proposalQuestion,
    deleteQuestion
} = require("../controllers/rest/questions");

var questionsRouter = express.Router();

const { PrismaClientKnownRequestError } = require("@prisma/client");

const { authRestToken } = require('../middleware/auth');

// get questions
questionsRouter.get("/", function (req, res, next) {
    const { difficulty, category } = req.query;
    let limit = req.query.limit ? parseInt(req.query.limit) : 20;
    getQuestions(limit, difficulty, category)
        .then((questions) => {
            res.statusCode = StatusCodes.OK;
            res.send({
                questions: questions,
                ok: true
            });
        })
        .catch((e) => {
            res.statusCode = e.status;
            res.send({
                msg: e.message,
                ok: false
            });
        });
});

// get proposals
questionsRouter.put("/review", authRestToken, function (req, res, next) {
    const id = parseInt(req.query.id);

    acceptQuestion(id)
        .then(() => {
            res.statusCode = StatusCodes.OK;
            res.send({
                msg: "Question reviewed",
                ok: true
            });
        })
        .catch((e) => {
            res.statusCode = e.status;
            res.send({
                msg: e.message,
                ok: false
            });
        });
});

questionsRouter.delete("/review", authRestToken, function (req, res, next) {
    const { questionId } = req.body;

    deleteQuestion(questionId)
        .then(() => {
            res.statusCode = StatusCodes.OK;
            res.send({
                msg: "Question deleted succesfully",
                ok: true
            });
        })
        .catch((e) => {
            // Check type of error
            if (e instanceof PrismaClientKnownRequestError) {
                // database conflict error
                res.statusCode = StatusCodes.CONFLICT;
                // Send error response
                res.send({
                    msg: "The specified resource was not found",
                    ok: false
                });
            } else {
                // other errors
                res.statusCode = e.status;
                res.send({
                    msg: e.message,
                    ok: false
                });
            }
        });
});

// proposal
questionsRouter.post("/proposal", authRestToken, function (req, res, next) {
    const {
        category,
        statement,
        difficulty,
        correctAnswer,
        wrongAnswer1,
        wrongAnswer2,
        wrongAnswer3,
        user
    } = req.body;
    console.log(req.body);
    proposalQuestion(
        statement,
        category,
        difficulty,
        correctAnswer,
        wrongAnswer1,
        wrongAnswer2,
        wrongAnswer3,
        user
    )
        .then(() => {
            res.statusCode = StatusCodes.OK;
            res.send({
                msg: "Question proposal sent succesfully",
                ok: true
            });
        })
        .catch((e) => {
            res.statusCode = e.status;
            res.send({
                msg: e.message,
                ok: false
            });
        });
});

module.exports = questionsRouter;
