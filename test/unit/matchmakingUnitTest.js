const { io } = require("socket.io-client");
const { signToken } = require("../../utils/auth");

var port = process.env.PORT || 5000;

//server.js
const { server } = require("../../app");

function connectPlayers(n, done) {

    let users = [];
    let connCount = 0;
    for (var i = 0; i < n; i++) {
        let user = io("http://localhost:5000", {
            auth: {
                token: signToken("usuario" + i.toString())
            }
        });
        
        user.on("connect", () => {
            connCount++;
            if ( connCount === n )
                done();
        });
        user.on("connect_error", () => {
            throw new Error("connect_error");
        });

        users.push(user);
    }

    return users;
}

function joinPlayers(n, users, done) {
    let rid = null;
    let okCount = 0;
    users.forEach((u) => {
        u.emit("public:join", (response) => {
            console.log("response : ", response);
            expect(response.ok).toBeTruthy();
        })

        u.on("server:public:joined", (response) => {
            console.log(response);
            if ( response.rid ) {
                okCount++;
                if ( !rid ) {
                    rid = response.rid;
                } else {
                    console.log("response : ", response.rid, "expected : ", rid);
                    expect(response.rid).toBe(rid);
                } 

                if ( okCount == n ) {
                    done();
                }
            } else {
                throw new Error("Couldn't join a room");
            }
        });
    });
}

const matchmakingTestSuite = () =>
    describe("Test matchmaking", () => {
        beforeAll((done) => {
            server.listen(port, () => {
                console.log(`WS API listening on ${port}`);
                done();
            });
        });

        afterAll((done) => {
            // wait for tests to finish
            server.close();
            done();
        });

        describe("Join and leave queue", () => {
            let clientSocket;

            beforeAll((done) => {
                clientSocket = io("http://localhost:5000", {
                    auth: {
                        token: signToken("usuario")
                    }
                });
                clientSocket.on("connect", done);
                clientSocket.on("connect_error", () => {
                    throw new Error("connect_error");
                });
            });

            afterAll(async () => {
                clientSocket.close();
                // wait for tests to finish
                await new Promise((r) => setTimeout(r, 500));
            });

            test("Join and leave queue", (done) => {
                clientSocket.emit("public:join", (response) => {
                    console.log("response : ", response);
                    expect(response.ok).toBeTruthy();
                });

                clientSocket.emit("public:leave", (response) => {
                    console.log("response : ", response);
                    expect(response.ok).toBeTruthy();
                    done();
                });
            });
        });

        describe("Join and create full room", () => {
            let users = [];

            beforeAll((done) => {
                
                users = connectPlayers(6, done);
            });

            afterAll(async () => {
                users.forEach(u => u.close());

                // wait for tests to finish
                await new Promise((r) => setTimeout(r, 500));
            });

            test("Join queue", (done) => {
                joinPlayers(6, users, done);
            });
        });

        describe("Join and create partial room", () => {
            let users = [];

            beforeAll((done) => {
                
                users = connectPlayers(5, done);
            });

            afterAll(async () => {
                users.forEach(u => u.close());

                // wait for tests to finish
                await new Promise((r) => setTimeout(r, 500));
            });

            test("Join queue", (done) => {
                joinPlayers(5, users, done);
            }, 20000);
        });
    });

module.exports = matchmakingTestSuite;
