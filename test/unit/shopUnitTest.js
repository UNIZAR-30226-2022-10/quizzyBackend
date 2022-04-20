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
const { signToken } = require("../../utils/auth");

/* register user tests */
function getCosmetics(expected) {
    return request(app)
        .get("/shop/cosmetics")
        .set({Accept: 'application/json'})
        .send()
        .then(async (response) => {
            await expected(response);
        });
}

/* register user tests */
function getWildcards(expected) {
    return request(app)
        .get("/shop/wildcards")
        .set({Accept: 'application/json'})
        .send()
        .then(async (response) => {
            await expected(response);
        });
}

/* register user tests */
function buyCosmeticTest(token, id, expected) {
    return request(app)
        .post("/shop/cosmetics/buy")
        .set({Accept: 'application/json',
        authorization: token ? `Bearer ${token}` : null})
        .send({
            id: id
        })
        .then(async (response) => {
            await expected(response);
        });
}

const shopTestSuite = () => describe('Test shop route', () => {
    test('Get cosmetics', async () => {
        return getCosmetics((response) => {
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toBeTruthy();
        })
    })

    test('Get wildcards', async () => {
        return getWildcards((response) => {
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toBeTruthy();
        })
    })

    describe('Test cosmetic purchases', () => {
        beforeAll(async () => {
            return request(app)
                .post("/user/")
                .set("Accept", "application/json")
                .send({
                    nickname: "usuario",
                    email: "abc@def.gh",
                    password: "dadada"
                });
        });

        afterAll(async () => {
            return request(app)
                .delete("/user/")
                .set({Accept: 'application/json',
                    Authorization: `Bearer ${signToken("usuario")}` })
                .send({});
        });

        describe('Valid classes', () => {
            test('EQ 1,2,3,7,9,13', async () => {
                return buyCosmeticTest(signToken("usuario"), 2, (response) => {
                    console.log(response.body);
                    expect(response.status).toBe(StatusCodes.OK);
                })
            })
        });

        describe('Invalid classes', () => {
            test('EQ 4', async () => {
                return buyCosmeticTest(null, 2, (response) => {
                    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
                })
            });

            test('EQ 5', async () => {
                return buyCosmeticTest("abcd", 2, (response) => {
                    expect(response.status).toBe(StatusCodes.FORBIDDEN);
                })
            });

            test('EQ 6', async () => {
                return buyCosmeticTest(signToken("abcd"), 2, (response) => {
                    expect(response.status).toBe(StatusCodes.NOT_FOUND);
                })
            });

            test('EQ 10', async () => {
                return buyCosmeticTest(signToken("usuario"), null, (response) => {
                    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            test('EQ 11', async () => {
                return buyCosmeticTest(signToken("usuario"), -1, (response) => {
                    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            test('EQ 12', async () => {
                return buyCosmeticTest(signToken("usuario"), 10000, (response) => {
                    expect(response.status).toBe(StatusCodes.NOT_FOUND);
                })
            });

            test('EQ 14', async () => {
                return buyCosmeticTest(signToken("usuario"), 1, (response) => {
                    expect(response.status).toBe(StatusCodes.CONFLICT);
                })
            });
        })
    })
})

module.exports = shopTestSuite;