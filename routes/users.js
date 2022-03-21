var express = require('express');
var router = express.Router();

/*
 * Register a new user.
 */
router.post('/', function(req, res, next) {
    const { nickname, email, password } = req.body;
    console.log(nickname, email, password);
    
    // try to create entry in database
    

    res.send({ ok: true });
});

/* GET users listing. */
router.post('/login', function(req, res, next) {
    const { nickname, email, password } = req.body;
    console.log(nickname, email, password);
    
    // fetch user in database
    

    res.send({ ok: true });
});

/* GET users listing. */
router.post('/login', function(req, res, next) {
    const { nickname, email, password } = req.body;
    console.log(nickname, email, password);
    
    // try to create entry in database
    

    res.send({ ok: true });
});

module.exports = router;
