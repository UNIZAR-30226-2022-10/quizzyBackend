/*
 * Author: Darío Marcos Casalé (795306)
 *      & Jaime Martín Trullén (801965)
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
    deleteQuestion,
    getPendingProposals
} = require("../controllers/rest/questions");

var questionsRouter = express.Router();

const { authRestToken, authAdmin } = require('../middleware/auth');

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

// get review pending questions
questionsRouter.get("/pending", authRestToken, authAdmin, function (req, res, next) {
    getPendingProposals()
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
questionsRouter.put("/review", authRestToken, authAdmin, function (req, res, next) {
    // query parameters are strings, we have to parse them first!
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
            res.statusCode = e.status || 400;
            res.send({
                msg: e.message,
                ok: false
            });
        });
});

questionsRouter.delete("/review", authRestToken, authAdmin, function (req, res, next) {
    // query parameters are strings, we have to parse them first!
    const id = parseInt(req.query.id);

    deleteQuestion(id)
        .then(() => {
            res.statusCode = StatusCodes.OK;
            res.send({
                msg: "Question deleted succesfully",
                ok: true
            });
        })
        .catch((e) => {
            res.statusCode = e.status || 400;
            res.send({
                msg: e.message,
                ok: false
            });
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
        wrongAnswer3
    } = req.body;
    
    proposalQuestion(
        statement,
        category,
        difficulty,
        correctAnswer,
        wrongAnswer1,
        wrongAnswer2,
        wrongAnswer3,
        req.jwtUser
    )
        .then(() => {
            res.statusCode = StatusCodes.OK;
            res.send({
                msg: "Question proposal sent succesfully",
                ok: true
            });
        })
        .catch((e) => {
            res.statusCode = e.status || 400;
            res.send({
                msg: e.message,
                ok: false
            });
        });
});

module.exports = questionsRouter;
