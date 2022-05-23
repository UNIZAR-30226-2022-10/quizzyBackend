const userTestSuite = require('./unit/usersUnitTest');
const questionsTestSuite = require('./unit/questionsUnitTest');
const matchmakingTestSuite = require('./unit/matchmakingUnitTest');
const friendsTestSuite = require('./unit/friendsUnitTest');
const shopTestSuite = require('./unit/shopUnitTest');
const gameTestSuite = require('./unit/gameUnitTest');

describe('Unit tests', () => {
    // REST API tests
    userTestSuite();
    questionsTestSuite();
    friendsTestSuite();
    shopTestSuite();

    // Real time tests
    
    gameTestSuite();
    matchmakingTestSuite();
});
