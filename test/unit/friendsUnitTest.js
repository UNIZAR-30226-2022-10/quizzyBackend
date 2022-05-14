/*
 * Author: Darío Marcos Casalé (795306)
 *      & Jaime Martín Trullén (801965)
 * Filename: friendsUnitTest.js
 * Module: test
 * Description: Questions Unit Test
 */

const request = require("supertest");
const { app } = require("../../app");
const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

/* register user tests */

function friendsGet(expected) {
    return request(app)
        .get("/friends")
        .set({Accept: 'application/json',
            Authorization: `Bearer ${process.env.JWT_TEST}` })
        .query({})
        .then(async (response) => {
            await expected(response);
        });
}

function pendingFriendsGet(expected) {
    return request(app)
        .get("/friends/pending")
        .set({Accept: 'application/json',
            Authorization: `Bearer ${process.env.JWT_TEST}` })
        .query({})
        .then(async (response) => {
            await expected(response);
        });
}

function friendsPost(friendNickname, expected) {
    return request(app)
        .post("/friends/add")
        .set({Accept: 'application/json',
            Authorization: `Bearer ${process.env.JWT_TEST}` })
        .send({friendNickname})
        .then(async (response) => {
            await expected(response);
        });
}

function friendsDelete(friendNickname, expected) {
    return request(app)
        .delete("/friends/delete")
        .set({Accept: 'application/json',
            Authorization: `Bearer ${process.env.JWT_TEST}` })
        .send({friendNickname})
        .then(async (response) => {
            await expected(response);
        });
}

function friendsPut(friendNickname, expected) {
    return request(app)
        .put("/friends/accept")
        .set({Accept: 'application/json',
            Authorization: `Bearer ${process.env.JWT_TEST}` })
        .send({friendNickname})
        .then(async (response) => {
            await expected(response);
        });
}

const friendsTestSuite = () => describe("Test friends path", () => {
    
    describe("friends get", () => {
        describe("Valid classes", () => {

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

                await prisma.users.create({
                    data: {
                        nickname: "usuario1",
                        email: "abc@def.gh",
                        password: hash,
                        wallet: 0,
                        actual_cosmetic: 1
                    }
                });

                await prisma.users.create({
                    data: {
                        nickname: "usuario2",
                        email: "abc@def.gh",
                        password: hash,
                        wallet: 0,
                        actual_cosmetic: 1
                    }
                });

                await prisma.friends.create({
                    data: {
                        nickname_1: "usuario",
                        nickname_2: "usuario1",
                        accepted: true
                    }
                });

                await prisma.friends.create({
                    data: {
                        nickname_1: "usuario",
                        nickname_2: "usuario2",
                        accepted: true
                    }
                });
            });

            afterAll(async () => {
                // delete dummy user
                await prisma.users.delete({
                    where: {
                        nickname: "usuario"
                    }
                });

                await prisma.users.delete({
                    where: {
                        nickname: "usuario1"
                    }
                });

                await prisma.users.delete({
                    where: {
                        nickname: "usuario2"
                    }
                });
            });

            // Get friends for any given user
            test("EQ 1", async () => {
                return friendsGet((response) => {
                    expect(response.statusCode).toBe(StatusCodes.OK);
                    expect(response.body.friends.length).toBe(2);
                });
            });
        });
    });

    describe("pending friends get", () => {
        describe("Valid classes", () => {

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

                await prisma.users.create({
                    data: {
                        nickname: "usuario1",
                        email: "abc@def.gh",
                        password: hash,
                        wallet: 0,
                        actual_cosmetic: 1
                    }
                });

                await prisma.users.create({
                    data: {
                        nickname: "usuario2",
                        email: "abc@def.gh",
                        password: hash,
                        wallet: 0,
                        actual_cosmetic: 1
                    }
                });

                await prisma.friends.create({
                    data: {
                        nickname_1: "usuario",
                        nickname_2: "usuario1",
                        accepted: false
                    }
                });

                await prisma.friends.create({
                    data: {
                        nickname_1: "usuario",
                        nickname_2: "usuario2",
                        accepted: false
                    }
                });
            });

            afterAll(async () => {
                // delete dummy user
                await prisma.users.delete({
                    where: {
                        nickname: "usuario"
                    }
                });

                await prisma.users.delete({
                    where: {
                        nickname: "usuario1"
                    }
                });

                await prisma.users.delete({
                    where: {
                        nickname: "usuario2"
                    }
                });
            });

            // no params + check number of questions
            test("EQ 1", async () => {
                return pendingFriendsGet((response) => {
                    expect(response.statusCode).toBe(StatusCodes.OK);
                    expect(response.body.friends.length).toBe(2);
                });
            });
        });
    });

    describe("friends post", () => {

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

            await prisma.users.create({
                data: {
                    nickname: "usuario1",
                    email: "abc@def.gh",
                    password: hash,
                    wallet: 0,
                    actual_cosmetic: 1
                }
            });
        });

        afterAll(async () => {
            // delete dummy user
            await prisma.users.delete({
                where: {
                    nickname: "usuario"
                }
            });

            await prisma.users.delete({
                where: {
                    nickname: "usuario1"
                }
            });

        });
    
        describe("Valid classes", () => {
            test("EQ 1, 2", async () => {
                return friendsPost("usuario1", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.OK);
                });
            });
        });

        describe("Invalid classes", () => {
            test("EQ 3", async () => {
                return friendsPost("", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });

            test("EQ 4", async () => {
                return friendsPost("qwertyuiopasdfghjklñzxcvbnm", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });

            test("EQ 5", async () => {
                return friendsPost("a?", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });

            test("EQ 6", async () => {
                return friendsPost("usuario", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
                });
            });

            test("EQ 7", async () => {
                return friendsPost(null, (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });
        });

    });

    describe("friends delete", () => {

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

            await prisma.users.create({
                data: {
                    nickname: "usuario1",
                    email: "abc@def.gh",
                    password: hash,
                    wallet: 0,
                    actual_cosmetic: 1
                }
            });

            await prisma.friends.create({
                data: {
                    nickname_1: "usuario",
                    nickname_2: "usuario1",
                    accepted: true
                }
            });

            await prisma.friends.create({
                data: {
                    nickname_1: "usuario1",
                    nickname_2: "usuario",
                    accepted: true
                }
            });
        });

        afterAll(async () => {
            // delete dummy user
            await prisma.users.delete({
                where: {
                    nickname: "usuario"
                }
            });

            await prisma.users.delete({
                where: {
                    nickname: "usuario1"
                }
            });

        });
    
        describe("Valid classes", () => {
            test("EQ 1, 2", async () => {
                return friendsDelete("usuario1", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.OK);
                });
            });
        });

        describe("Invalid classes", () => {
            test("EQ 3", async () => {
                return friendsDelete("", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });

            test("EQ 4", async () => {
                return friendsDelete("qwertyuiopasdfghjklñzxcvbnm", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });

            test("EQ 5", async () => {
                return friendsDelete("a?", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });

            test("EQ 6", async () => {
                return friendsDelete(null, (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });
        });
    });

    describe("friends put", () => {

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

            await prisma.users.create({
                data: {
                    nickname: "usuario1",
                    email: "abc@def.gh",
                    password: hash,
                    wallet: 0,
                    actual_cosmetic: 1
                }
            });

            await prisma.friends.create({
                data: {
                    nickname_1: "usuario1",
                    nickname_2: "usuario",
                    accepted: true
                }
            });

            await prisma.friends.create({
                data: {
                    nickname_1: "usuario",
                    nickname_2: "usuario1"
                }
            });
        });

        afterAll(async () => {
            // delete dummy user
            await prisma.users.delete({
                where: {
                    nickname: "usuario"
                }
            });

            await prisma.users.delete({
                where: {
                    nickname: "usuario1"
                }
            });

        });
    
        describe("Valid classes", () => {
            test("EQ 1, 2", async () => {
                return friendsPut("usuario1", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.OK);
                });
            });
        });

        describe("Invalid classes", () => {
            test("EQ 3", async () => {
                return friendsPut("", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });

            test("EQ 4", async () => {
                return friendsPut("qwertyuiopasdfghjklñzxcvbnm", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });

            test("EQ 5", async () => {
                return friendsPut("a?", (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });

            test("EQ 6", async () => {
                return friendsPut(null, (response) => {
                    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                });
            });
        });
    });
});

module.exports = friendsTestSuite;