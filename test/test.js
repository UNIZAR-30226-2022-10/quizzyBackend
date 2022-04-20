const userTestSuite = require('./unit/usersUnitTest');
const questionsTestSuite = require('./unit/questionsUnitTest');
const matchmakingTestSuite = require('./unit/matchmakingUnitTest');
const friendsTestSuite = require('./unit/friendsUnitTest');

describe('Unit tests', () => {
    // REST API tests
    userTestSuite();
    questionsTestSuite();
    friendsTestSuite();

    // Real time tests
    matchmakingTestSuite();
});
