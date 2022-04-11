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
    describe("valid classes", () => {
        test("EQ 1, 7, 10", async () => {
            return questionGet(null, null, null, (response) => {
                expect(response.statusCode).toBe(StatusCodes.OK);
                expect(response.body.questions.length).toBe(20);
            });
        });

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
});
