const { io } = require("socket.io-client");
const { signToken } =require('../../utils/auth')

var port = process.env.PORT || 5000;

//server.js
const { server } = require("../../app");

const matchmakingTestSuite = () =>
    describe("Test matchmaking", () => {
        beforeAll((done) => {
            server.listen(port, () => {
                console.log(`WS API listening on ${port}`);
                done();
            });
        });

        afterAll(async () => {
            // wait for tests to finish
            server.close();
        });

        describe("Join and leave queue", () => {

            let clientSocket;

            beforeAll((done) => {
                clientSocket = io("http://localhost:5000", {
                    auth: {
                        token: signToken('usuario')
                    }
                });
                clientSocket.on("connect", done);
                clientSocket.on("connect_error", () => { throw new Error("connect_error") });
            });
    
            afterAll(async () => {
                clientSocket.close();
                // wait for tests to finish
                await new Promise((r) => setTimeout(r, 500));
            });

            test("Join queue", (done) => {

                clientSocket.emit("public:join", "", (response) => {
                    console.log("response : ", response);
                    expect(response.ok).toBeTruthy();
                    done();
                });
            });

            test("Leave queue", (done) => {

                clientSocket.emit("public:leave", "", (response) => {
                    console.log("response : ", response);
                    expect(response.ok).toBeTruthy();
                    done();
                });
            });
        });

        describe('Join and create full room', () => {

            let users = [];

            beforeAll(async () => {
                for ( var i = 0; i < 6; i++ ) {
                    let user = io("http://localhost:5000", {
                        auth: {
                            token: signToken('usuario' + i.toString())
                        }
                    });
                    users.push(user);
                }
            })

            afterAll(async () => {
                users.forEach(u => u.close());

                // wait for tests to finish
                await new Promise((r) => setTimeout(r, 500));
            });

            test("Join queue", (done) => {

                let ackCount = 0;
                let okCount = 0;

                users.forEach(u => u.emit("public:join", "", (response) => {
                    console.log("response : ", response);
                    expect(response.ok).toBeTruthy();
                    ackCount++;
                    if ( ackCount == 6 ) {
                        done();
                    }
                }));
            });
            
        });
    });

module.exports = matchmakingTestSuite;
