const request = require("supertest");
const { app } = require("../../app");
const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

/* register user tests */
function registerTest(nickname, email, password, expected) {

    return request(app)
        .post("/user/")
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

/* login user tests */
function loginTest(nickname, password, expected) {

    return request(app)
        .post("/user/login")
        .set('Accept', 'application/json')
        .send({
            nickname : nickname,
            password : password
        })
        .then(response => {
            expected(response);
        });
}

// TODO: black box equivalence class tests for thoroughly testing every type of input
describe("Test user path", () => {

    // Setup for all user tests
    beforeAll(async () => {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync("superSecretHash", salt);
        // Create dummy user
        await prisma.users.create({
            data: {
                nickname: 'usuario',
                email: "abc@def.gh",
                password: hash,
                wallet: 0,
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
    
    describe('Test register route', () => { 

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
    });

    describe('Test login route', () => { 
        describe('Login route valid classes', () => {
            test("EQ 1,2,3,8,9", async () => {
                return loginTest("usuario", "superSecretHash", response => {
                    expect(response.statusCode).toBe(StatusCodes.OK);;
                    // TODO: test if JWT is valid
                })
            });
        });

        describe('Login route invalid classes', () => {
            // Null nickname
            test("EQ 4", async () => {
                return loginTest(null, "superSecretHash", response => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            // Empty nickname
            test("EQ 5", async () => {
                return loginTest("", "superSecretHash", response => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            test("EQ 6", async () => {
                return loginTest("qwertyuiopasdfghjklñzxcvbnm", "superSecretHash", response => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            test("EQ 7", async () => {
                return loginTest("abc", "superSecretHash", response => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            test("EQ 10", async () => {
                return loginTest("usuario", null, response => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            test("EQ 11", async () => {
                return loginTest("usuario", "D:", response => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                })
            });
        });
    });
});

