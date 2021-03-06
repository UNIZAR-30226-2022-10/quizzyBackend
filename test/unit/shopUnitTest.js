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

function getCosmetics(expected) {
    return request(app)
        .get("/shop/cosmetics")
        .set({Accept: 'application/json'})
        .send()
        .then(async (response) => {
            await expected(response);
        });
}

function getWildcards(expected) {
    return request(app)
        .get("/shop/wildcards")
        .set({Accept: 'application/json'})
        .send()
        .then(async (response) => {
            await expected(response);
        });
}

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

function buyWildcardTest(token, id, amount, expected) {
    return request(app)
        .post("/shop/wildcards/buy")
        .set({Accept: 'application/json',
        authorization: token ? `Bearer ${token}` : null})
        .send({
            id: id,
            amount: amount
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
            // buy cosmetic
            test('EQ 1,2,3,7,8,9,13,15', async () => {
                return buyCosmeticTest(signToken("usuario"), 2, (response) => {
                    // check wallet
                    request(app)
                        .get("/user")
                        .set({Accept: 'application/json',
                            authorization: `Bearer ${signToken("usuario")}`})
                        .send()
                        .then(async (response) => {
                            expect(response.body.wallet).toBe(100);
                        });
                    expect(response.status).toBe(StatusCodes.OK);
                })
            })
        });

        describe('Invalid classes', () => {
            // null token
            test('EQ 4', async () => {
                return buyCosmeticTest(null, 2, (response) => {
                    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
                })
            });

            // malformed token
            test('EQ 5', async () => {
                return buyCosmeticTest("abcd", 2, (response) => {
                    expect(response.status).toBe(StatusCodes.FORBIDDEN);
                })
            });

            // user doesn't exist
            test('EQ 6', async () => {
                return buyCosmeticTest(signToken("abcd"), 2, (response) => {
                    expect(response.status).toBe(StatusCodes.NOT_FOUND);
                })
            });

            // null id
            test('EQ 10', async () => {
                return buyCosmeticTest(signToken("usuario"), null, (response) => {
                    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            // invalid id
            test('EQ 11', async () => {
                return buyCosmeticTest(signToken("usuario"), -1, (response) => {
                    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            // cosmetic doesn't exist
            test('EQ 12', async () => {
                return buyCosmeticTest(signToken("usuario"), 10000, (response) => {
                    expect(response.status).toBe(StatusCodes.NOT_FOUND);
                })
            });

            // user already has this item
            test('EQ 14', async () => {
                return buyCosmeticTest(signToken("usuario"), 1, (response) => {
                    expect(response.status).toBe(StatusCodes.CONFLICT);
                })
            });

            // user doesn't have enough coins
            test('EQ 16', async () => {
                return buyCosmeticTest(signToken("usuario"), 5, (response) => {
                    expect(response.status).toBe(StatusCodes.CONFLICT);
                })
            });
        })
    });

    describe('Test wildcard purchases', () => {

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
            // buy cosmetic
            test('EQ 1,2,3,7,8,9,13,14', async () => {
                return buyWildcardTest(signToken("usuario"), 1, 3, (response) => {
                    console.log(response.body);
                    // check wallet
                    request(app)
                        .get("/user")
                        .set({Accept: 'application/json',
                            authorization: `Bearer ${signToken("usuario")}`})
                        .send()
                        .then(async (response) => {
                            expect(response.body.wallet).toBe(150);
                        });
                    expect(response.status).toBe(StatusCodes.OK);
                })
            });
        });

        describe('Invalid classes', () => {
            // null token
            test('EQ 4', async () => {
                return buyWildcardTest(null, 1, 3, (response) => {
                    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
                })
            });

            // malformed token
            test('EQ 5', async () => {
                return buyWildcardTest("abcd", 1, 3, (response) => {
                    expect(response.status).toBe(StatusCodes.FORBIDDEN);
                })
            });

            // user doesn't exist
            test('EQ 6', async () => {
                return buyWildcardTest(signToken("abcd"), 1, 3, (response) => {
                    expect(response.status).toBe(StatusCodes.NOT_FOUND);
                })
            });

            // null id
            test('EQ 10', async () => {
                return buyWildcardTest(signToken("usuario"), null, 3, (response) => {
                    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            // invalid id
            test('EQ 11', async () => {
                return buyWildcardTest(signToken("usuario"), -1, 3, (response) => {
                    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            // Wildcard doesn't exist
            test('EQ 12', async () => {
                return buyWildcardTest(signToken("usuario"), 10000, 3, (response) => {
                    expect(response.status).toBe(StatusCodes.NOT_FOUND);
                })
            });

            // null amount
            test('EQ 16', async () => {
                return buyWildcardTest(signToken("usuario"), 1, null, (response) => {
                    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            // invalid amount
            test('EQ 16', async () => {
                return buyWildcardTest(signToken("usuario"), 1, -1, (response) => {
                    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
                })
            });

            // Not enough coins in wallet
            test('EQ 16', async () => {
                return buyWildcardTest(signToken("usuario"), 1, 1000, (response) => {
                    expect(response.status).toBe(StatusCodes.CONFLICT);
                })
            });
        })
    });
})

module.exports = shopTestSuite;