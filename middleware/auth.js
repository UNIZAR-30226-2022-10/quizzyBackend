const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const { getUser } = require('../controllers/rest/users'); 

function authRestToken(req, res, next) {
    // Get authorization header
    const authHeader = req.headers["authorization"];

    // split bearer from jwt string
    const jwtToken = authHeader && authHeader.split(" ")[1];

    if ( !jwtToken ) return res.sendStatus(StatusCodes.UNAUTHORIZED);

    jwt.verify(jwtToken, process.env.TOKEN_SECRET, (err, user) => {

        if (err) return res.sendStatus(StatusCodes.FORBIDDEN);

        // add information to request
        req.jwtUser = user.name;

        next();
    });
}

async function authWsToken(socket, next) {
    // fetch token from handshake auth sent by frontend
    const token = socket.handshake.auth.token;
    try {
        // verify jwt token and get user data
        const user = await jwt.verify(token, process.env.TOKEN_SECRET);
        // save the user data into socket object, to be used further
        socket.user = user;
        next();
    } catch (e) {
        // if token is invalid, close connection
        console.log("error: ", e.message);
        return next(new Error(e.message));
    }
}

async function authAdmin(req, res, next) {
    // delete user in database
    getUser(req.jwtUser)
        .then((user) => {
            if ( user.is_admin ) {
                next();
            } else {
                return res.sendStatus(StatusCodes.FORBIDDEN);
            }
        })
        .catch((e) => {
            return res.sendStatus(e.status);
        });
}

module.exports = {
    authRestToken,
    authWsToken,
    authAdmin
}
