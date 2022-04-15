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
            return questionGet(5, diff, cat, (response) => {
                expect(response.statusCode).toBe(StatusCodes.OK);
                expect(response.body.questions.length).toBe(5);
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
