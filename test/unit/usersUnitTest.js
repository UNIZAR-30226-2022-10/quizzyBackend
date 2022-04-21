/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: usersUnitTest.js
 * Module: test
 * Description: Users Unit Test
 */

const request = require("supertest");
const { app } = require("../../app");
const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const { signToken } = require("../../utils/auth");
const prisma = new PrismaClient();

/* register user tests */
function registerTest(nickname, email, password, expected) {
    return request(app)
        .post("/user/")
        .set("Accept", "application/json")
        .send({
            nickname: nickname,
            email: email,
            password: password
        })
        .then(async (response) => {
            await expected(response);
        });
}

/* login user tests */
function loginTest(nickname, password, expected) {
    return request(app)
        .post("/user/login")
        .set("Accept", "application/json")
        .send({
            nickname: nickname,
            password: password
        })
        .then((response) => {
            expected(response);
        });
}

function getCosmeticsTest(token, expected) {
    return request(app)
        .get("/user/cosmetics")
        .set({Accept: 'application/json',
            Authorization: token ? `Bearer ${token}` : null})
        .send({})
        .then((response) => {
            console.log(response.body)
            expected(response);
        });
}

function getWildcardsTest(token, expected) {
    return request(app)
        .get("/user/wildcards")
        .set({Accept: 'application/json',
            Authorization: token ? `Bearer ${token}` : null})
        .send({})
        .then((response) => {
            console.log(response.body)
            expected(response);
        });
}

const userTestSuite = () => describe("Test user path", () => {
    // Setup for all user tests
    beforeAll(async () => {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync("superSecretHash", salt);
        // Create dummy user
        await prisma.users.create({
            data: {
                nickname: "usuario",
                email: "abc@def.gh",
                password: hash,
                wallet: 0,
                actual_cosmetic: 1
            }
        });

        // Add initial cosmetics
        await prisma.user_cosmetics.createMany({
            data : [
                { cosmetic_id : 1, nickname : "usuario" },
                { cosmetic_id : 2, nickname : "usuario" },
                { cosmetic_id : 4, nickname : "usuario" }
            ]
        })

        // Add initial wildcard info
        await prisma.user_wildcards.createMany({
            data : [
                { nickname : "usuario", wildcard_id : 1, cuantity : 5 },
                { nickname : "usuario", wildcard_id : 2, cuantity : 3 }
            ]
        })
    });

    afterAll(async () => {
        // delete dummy user
        await prisma.users.delete({
            where: {
                nickname: "usuario"
            }
        });
    });

    describe("Test register route", () => {
        describe("Register route valid classes", () => {
            // Setup for valid class tests
            afterAll(async () => {
                // delete dummy user
                await prisma.users.delete({
                    where: {
                        nickname: "231_c"
                    }
                });
            });

            // Valid input
            test("EQ 1,2,3,4,10,11,14", async () => {
                return registerTest(
                    "231_c",
                    "abc@def.gh",
                    "superSecretHash",
                    (response) => {
                        expect(response.statusCode).toBe(StatusCodes.OK);
                    }
                );
            });
        });

        describe("Register route invalid classes", () => {
            // Empty nickname
            test("EQ 5", async () => {
                return registerTest(
                    "",
                    "abc@def.gh",
                    "superSecretHash",
                    (response) => {
                        expect(response.statusCode).toBe(
                            StatusCodes.BAD_REQUEST
                        );
                    }
                );
            });

            // nickname.length > 20
            test("EQ 6", async () => {
                return registerTest(
                    "qwertyuiopasdfghjklñzxcvbnm",
                    "abc@def.gh",
                    "superSecretHash",
                    (response) => {
                        expect(response.statusCode).toBe(
                            StatusCodes.BAD_REQUEST
                        );
                    }
                );
            });

            // nickname contains special characters
            test("EQ 7", async () => {
                return registerTest(
                    "a?",
                    "abc@def.gh",
                    "superSecretHash",
                    (response) => {
                        expect(response.statusCode).toBe(
                            StatusCodes.BAD_REQUEST
                        );
                    }
                );
            });

            // user already exists
            test("EQ 8", async () => {
                return registerTest(
                    "usuario",
                    "abc@def.gh",
                    "superSecretHash",
                    (response) => {
                        expect(response.statusCode).toBe(StatusCodes.CONFLICT);
                    }
                );
            });

            // null nickname
            test("EQ 9", async () => {
                return registerTest(
                    null,
                    "abc@def.gh",
                    "superSecretHash",
                    (response) => {
                        expect(response.statusCode).toBe(
                            StatusCodes.BAD_REQUEST
                        );
                    }
                );
            });

            // null email
            test("EQ 12", async () => {
                return registerTest(
                    "231_c",
                    null,
                    "superSecretHash",
                    (response) => {
                        expect(response.statusCode).toBe(
                            StatusCodes.BAD_REQUEST
                        );
                    }
                );
            });

            // invalid email
            test("EQ 13", async () => {
                return registerTest(
                    "231_c",
                    "abc",
                    "superSecretHash",
                    (response) => {
                        expect(response.statusCode).toBe(
                            StatusCodes.BAD_REQUEST
                        );
                    }
                );
            });

            test("EQ 15", async () => {
                return registerTest("231_c", "abc@def.gh", null, (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });
        });
    });

    describe("Test login route", () => {
        describe("Login route valid classes", () => {
            test("EQ 1,2,3,8,9", async () => {
                return loginTest("usuario", "superSecretHash", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.OK);
                    // TODO: test if JWT is valid
                });
            });
        });

        describe("Login route invalid classes", () => {
            // Null nickname
            test("EQ 4", async () => {
                return loginTest(null, "superSecretHash", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });

            // Empty nickname
            test("EQ 5", async () => {
                return loginTest("", "superSecretHash", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });

            test("EQ 6", async () => {
                return loginTest(
                    "qwertyuiopasdfghjklñzxcvbnm",
                    "superSecretHash",
                    (response) => {
                        expect(response.statusCode).toBe(
                            StatusCodes.BAD_REQUEST
                        );
                    }
                );
            });

            test("EQ 7", async () => {
                return loginTest("abababa", "superSecretHash", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
                });
            });

            test("EQ 10", async () => {
                return loginTest("usuario", null, (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });

            test("EQ 11", async () => {
                return loginTest("usuario", "D:", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
                });
            });
        });
    });

    // TODO delete and get routes for users

    describe('Test get cosmetics route', () => {
        describe('Valid classes', () => {
            test("EQ 1,2,3", async () => {
                return getCosmeticsTest(signToken("usuario"), (response) => {
                    expect(response.statusCode).toBe(StatusCodes.OK);
                });
            });
        });

        describe('Invalid classes', () => {
            // null jwt
            test("EQ 4", async () => {
                return getCosmeticsTest(null, (response) => {
                    expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
                });
            });

            // malformed jwt
            test("EQ 5", async () => {
                return getCosmeticsTest("abcd", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
                });
            });

            // user doesn't exist
            test("EQ 6", async () => {
                return getCosmeticsTest(signToken("abcd"), (response) => {
                    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
                });
            });
        });
    });

    describe('Test get wildcards route', () => {
        describe('Valid classes', () => {
            test("EQ 1,2,3", async () => {
                return getWildcardsTest(signToken("usuario"), (response) => {
                    expect(response.statusCode).toBe(StatusCodes.OK);
                });
            });
        });

        describe('Invalid classes', () => {
            // null jwt
            test("EQ 4", async () => {
                return getWildcardsTest(null, (response) => {
                    expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
                });
            });

            // malformed jwt
            test("EQ 5", async () => {
                return getWildcardsTest("abcd", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
                });
            });

            // user doesn't exist
            test("EQ 6", async () => {
                return getWildcardsTest(signToken("abcd"), (response) => {
                    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
                });
            });
        });
    });
});

module.exports = userTestSuite;