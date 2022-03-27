const request = require("supertest");
const { app } = require("../../app");
const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require("http-status-codes");
const prisma = new PrismaClient();

/* register user tests */
function registerTest(nickname, email, password, expected) {
    return request(app)
        .post("/user/")
        .type('form')
        .set('Accept', 'application/json')
        .send({
            nickname : nickname,
            email : email,
            password : password
        })
        .then(response => {
            expected(response);
        });
}

// TODO: black box equivalence class tests for thoroughly testing every type of input
describe("Test user path", () => {
    describe('Test register route', () => { 

        // Setup for all register tests
        beforeAll(async () => {
            // Create dummy user
            await prisma.users.create({
                data: {
                    nickname: 'usuario',
                    email: "abc@def.gh",
                    password: "superSecretHash",
                    wallet: 0,
                    public_wins: 0,
                    private_wins: 0,
                    actual_cosmetic: 1
                },
            })
        });
        
        afterAll(async () => {
            // delete dummy user
            await prisma.users.delete({
                where: {
                    nickname: 'usuario'
                },
            })
        });

        describe('Register route valid classes', () => {
            // Setup for valid class tests
            afterAll(async () => {
                // delete dummy user
                await prisma.users.delete({
                    where: {
                        nickname: '231_c'
                    },
                })
            });
            
            // Valid input
            test("EQ 1,2,3,4,10,11,14", async () => {
                return registerTest("231_c", "abc@def.gh", "superSecretHash", response => {
                    expect(response.statusCode).toBe(StatusCodes.OK);
                })
            });
        });

        describe('Register route invalid classes', () => {
            // Empty nickname
            test("EQ 5", async () => {
                return registerTest("", "abc@def.gh", "superSecretHash", response => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            // nickname.length > 20
            test("EQ 6", async () => {
                return registerTest("qwertyuiopasdfghjklñzxcvbnm", "abc@def.gh", "superSecretHash", response => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            // nickname contains special characters
            test("EQ 7", async () => {
                return registerTest("a?", "abc@def.gh", "superSecretHash", response => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            // user already exists
            test("EQ 8", async () => {
                return registerTest("usuario", "abc@def.gh", "superSecretHash", response => {
                    expect(response.statusCode).toBe(StatusCodes.CONFLICT);
                })
            });

            // null nickname
            test("EQ 9", async () => {
                return registerTest(null, "abc@def.gh", "superSecretHash", response => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            // null email
            test("EQ 12", async () => {
                return registerTest("231_c", null, "superSecretHash", response => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            // invalid email
            test("EQ 13", async () => {
                return registerTest("231_c", "abc", "superSecretHash", response => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            test("EQ 15", async () => {
                return registerTest("231_c", "abc@def.gh", null, response => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                })
            });
        });
    })
});