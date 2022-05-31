var port = process.env.PORT || 5000;

//server.js
const { server } = require("./app");

server.listen(port, () => {
    console.log(`WS API listening on ${port}`);
});
