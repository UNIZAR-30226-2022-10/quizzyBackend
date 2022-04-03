const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

function authRestToken(req, res, next) {
    // Get authorization header
    const authHeader = req.headers['authorization']

    // split bearer from jwt string
    const jwtToken = authHeader && authHeader.split(' ')[1]
  
    if (jwtToken == null) return res.sendStatus(StatusCodes.UNAUTHORIZED);
  
    jwt.verify(jwtToken, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err);
    
        if (err) return res.sendStatus(StatusCodes.FORBIDDEN);
    
        // add information to request
        req.jwtUser = user;
    
        next();
    })
}

async function authWsToken(socket, next) {
    // fetch token from handshake auth sent by frontend
    const token = socket.handshake.auth.token;
    try {
        // verify jwt token and get user data
        const user = await jwt.verify(token, process.env.TOKEN_SECRET);
        console.log('user', user);
        // save the user data into socket object, to be used further
        socket.user = user;
        next();
    } catch (e) {
        // if token is invalid, close connection
        console.log('error: ', e.message);
        return next(new Error(e.message));
    }
}

module.exports.authRestToken = authRestToken;
module.exports.authWsToken   = authWsToken;
