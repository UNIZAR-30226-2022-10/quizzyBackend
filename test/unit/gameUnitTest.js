/*
 * Author: Darío Marcos Casalé (795306) & Jaime Martín Trullén
 * Filename: gameUnitTest.js
 * Module: test/unit
 * Description: game route controllers
 */

const request = require("supertest");
const { app } = require("../../app");
const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
const { signToken } = require("../../utils/auth");

function gamesGet(nickname, expected) {
    return request(app)
        .get("/games/invite")
        .set({Accept: 'application/json',
            Authorization: `Bearer ${signToken(nickname)}` })
        .then(async (response) => {
            await expected(response);
        });
}

function gamesInvite(nickname, rid, leaderNick, expected) {
    return request(app)
        .post("/games/invite")
        .set({Accept: 'application/json',
            Authorization: `Bearer ${signToken(leaderNick)}` })
        .send({ nickname, rid })
        .then(async (response) => {
            await expected(response);
        });
}

const sampleInvites = [
    { nickname: "usuario", rid: 0, leader_nickname: "usuario2" },
    { nickname: "usuario", rid: 1, leader_nickname: "usuario2" },
    { nickname: "usuario2", rid: 1, leader_nickname: "usuario" },
]

const gameTestSuite = () => 
    describe("Test game behaviour", () => {
        beforeAll(async () => {

            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync("superSecretHash", salt);
            // Create dummy user
            await prisma.users.createMany({
                data: [
                    {
                        nickname: "usuario",
                        email: "abc@def.gh",
                        password: hash,
                        wallet: 0,
                        actual_cosmetic: 1
                    },
                    {
                        nickname: "usuario2",
                        email: "abc@def.gh",
                        password: hash,
                        wallet: 0,
                        actual_cosmetic: 1
                    }
                ]
            }).catch(e => {
                console.log("test users exist");
            });
        });

        afterAll(async () => {
            await prisma.users.deleteMany({
                where : {
                    OR : [
                        {
                            nickname: "usuario"
                        },
                        {
                            nickname: "usuario2"
                        }
                    ]
                }
            })
        });

        describe("fetch invites", () => {
            beforeAll(async () => {
                await prisma.game_invites.createMany({
                    data: sampleInvites
                })
            });

            afterAll(async () => {
                await prisma.game_invites.deleteMany({
                    where : {
                        OR : [
                            {
                                nickname: "usuario"
                            },
                            {
                                nickname: "usuario2"
                            }
                        ]
                    }
                })
            });

            describe('valid classes', () => {
                test('EQ 1,2,3', async () => {
                    return gamesGet("usuario", (response) => {
                        expect(response.statusCode).toBe(StatusCodes.OK);
                        expect(response.body.invites).toEqual(sampleInvites.filter(s => s.nickname === "usuario"));
                    })
                })
            })

            // invalid classes
        })

        describe("send invites", () => {
            beforeAll(async () => {
                await prisma.game_invites.createMany({
                    data: sampleInvites
                })
            });

            afterAll(async () => {
                await prisma.game_invites.deleteMany({
                    where : {
                        OR : [
                            {
                                nickname: "usuario"
                            },
                            {
                                nickname: "usuario2"
                            }
                        ]
                    }
                })
            });

            describe('valid classes', () => {
                test('EQ 1,2,3,8,9,10,14,15,16', async () => {
                    return gamesInvite("usuario", 7, "usuario2", (response) => {
                        expect(response.statusCode).toBe(StatusCodes.OK);
                    })
                })
            })

            describe('invalid classes', () => {
                // null nickname
                test('EQ 4', async () => {
                    return gamesInvite(null, 7, "usuario", (response) => {
                        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                    })
                })

                // empty nickname
                test('EQ 5', async () => {
                    return gamesInvite("", 7, "usuario", (response) => {
                        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                    })
                })

                // too long nickname
                test('EQ 6', async () => {
                    return gamesInvite("abcdefghijklmnopqrstuvwxyz", 7, "usuario", (response) => {
                        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                    })
                })

                // user not in database
                test('EQ 7', async () => {
                    return gamesInvite("abcde", 7, "usuario", (response) => {
                        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
                    })
                })

                // null rid
                test('EQ 11', async () => {
                    return gamesInvite("usuario", null, "usuario2", (response) => {
                        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                    })
                })

                test('EQ 12', async () => {
                    return gamesInvite("usuario", -1, "usuario2", (response) => {
                        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                    })
                })

                test('EQ 13', async () => {
                    return gamesInvite("usuario", 0, "usuario2", (response) => {
                        expect(response.statusCode).toBe(StatusCodes.CONFLICT);
                    })
                })

                test('EQ 17', async () => {
                    return gamesInvite("usuario", 7, null, (response) => {
                        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                    })
                })

                test('EQ 18', async () => {
                    return gamesInvite("usuario", 7, "", (response) => {
                        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                    })
                })

                test('EQ 19', async () => {
                    return gamesInvite("usuario", 7, "abcdefghijklmnopqrstuvwxyz", (response) => {
                        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                    })
                })

                test('EQ 20', async () => {
                    return gamesInvite("usuario", 7, "abcde", (response) => {
                        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
                    })
                })
            })
        })
    });

module.exports = gameTestSuite;