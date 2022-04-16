const request = require("supertest");
const { app } = require("../../app");
const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const prisma = new PrismaClient();
const { categories, difficulties } = require("../../utils/misc");

/* register user tests */
function questionGet(limit, difficulty, category, expected) {
    return request(app)
        .get("/questions")
        .set("Accept", "application/json")
        .query({ limit, category, difficulty })
        .then(async (response) => {
            await expected(response);
        });
}

describe("question get", () => {
    describe("Valid classes", () => {
        // no params + check number of questions
        test("EQ 1, 7, 10", async () => {
            return questionGet(null, null, null, (response) => {
                expect(response.statusCode).toBe(StatusCodes.OK);
                expect(response.body.questions.length).toBe(20);
            });
        });

        // full params + check if filter is correctly applied
        test("EQ 2, 3, 9, 12", async () => {
            let cat = categories[Math.floor(Math.random() * 6)];
            let diff = difficulties[Math.floor(Math.random() * 3)];
            console.log("testing ", { cat, diff });
            return questionGet(15, diff, cat, (response) => {
                expect(response.statusCode).toBe(StatusCodes.OK);
                expect(response.body.questions.length).toBe(15);
                response.body.questions.forEach(question => {
                    expect(question.category_name).toBe(cat)
                    expect(question.difficulty).toBe(diff)
                });
            });
        });
    });

    describe("Invalid classes", () => {
        // limit is not a number
        test("EQ 4", async () => {
            return questionGet(":(", null, null, (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        // negative limit
        test("EQ 5", async () => {
            return questionGet(-1, null, null, (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        // too big limit
        test("EQ 6", async () => {
            return questionGet(10000, null, null, (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        // invalid difficulty
        test("EQ 9", async () => {
            return questionGet(null, "meh", null, (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        // invalid difficulty
        test("EQ 13", async () => {
            return questionGet(10000, null, "cats", (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });
    });
});


function questionDelete(questionId, expected) {
    return request(app)
        .delete("/questions/review")
        .set({Accept: 'application/json',
            Authorization: `Bearer ${process.env.JWT_TEST}` })
        .send({questionId})
        .then(async (response) => {
            await expected(response);
        });
}

describe("question delete", () => {
    describe("Valid classes", () => {

        
        // questionId >= 1 && questionId != null
        test("EQ 1, 2", async () => {
            return questionDelete(20, (response) => {
                expect(response.statusCode).toBe(StatusCodes.OK);
            });
        });
    });

    describe("Invalid classes", () => {
        // questionId < 1
        test("EQ 3", async () => {
            return questionDelete(-2, (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        // null questionId
        test("EQ 4", async () => {
            return questionDelete(null, (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });
    });
});


function questionPost(
    category, 
    statement, 
    difficulty,
    correctAnswer,
    wrongAnswer1,
    wrongAnswer2,
    wrongAnswer3,
    expected
) {
    return request(app)
        .post("/questions/proposal")
        .set({Accept: 'application/json',
            Authorization: `Bearer ${process.env.JWT_TEST}` })
        .send({
            category, 
            statement, 
            difficulty,
            correctAnswer,
            wrongAnswer1,
            wrongAnswer2,
            wrongAnswer3
        })
        .then(async (response) => {
            await expected(response);
        });
}

describe("question post", () => {
    describe("Valid classes", () => {

        
        // full correct params
        test("EQ 1, 2, 3, 4, 5, 6, 7, 8, 9", async () => {
            return questionPost("Art", "Is this a question?", "easy", "Yes", "No", "Maybe", "Really?",  (response) => {
                console.log(response.body);
                expect(response.statusCode).toBe(StatusCodes.OK);
            });
        });
    });

    describe("Invalid classes", () => {
        // category == null
        test("EQ 10", async () => {
            return questionPost(null, "Is this a question?", "easy", "Yes", "No", "Maybe", "Really?",  (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        // invalid category
        test("EQ 11", async () => {
            return questionPost("Cat", "Is this a question?", "easy", "Yes", "No", "Maybe", "Really?",  (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        // statement == null
        test("EQ 12", async () => {
            return questionPost("Art", null, "easy", "Yes", "No", "Maybe", "Really?",  (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        // difficulty == null
        test("EQ 13", async () => {
            return questionPost("Art", "Is this a question?", null, "Yes", "No", "Maybe", "Really?",  (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        // invalid difficulty
        test("EQ 14", async () => {
            return questionPost("Art", "Is this a question?", "demential", "Yes", "No", "Maybe", "Really?",  (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        // correctAnswer == null
        test("EQ 15", async () => {
            return questionPost("Art", "Is this a question?", "easy", null, "No", "Maybe", "Really?",  (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        }); 

        // wrongAnswer1 == null
        test("EQ 16", async () => {
            return questionPost("Art", "Is this a question?", "easy", "Yes", null, "Maybe", "Really?",  (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        // wrongAnswer2 == null
        test("EQ 17", async () => {
            return questionPost("Art", "Is this a question?", "easy", "Yes", "No", null, "Really?",  (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        // wrongAnswer3 == null
        test("EQ 10", async () => {
            return questionPost("Art", "Is this a question?", "easy", "Yes", "No", "Maybe", null,  (response) => {
                expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            });
        });
    });
});