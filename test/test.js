const userTestSuite = require('./unit/usersUnitTest');
const questionsTestSuite = require('./unit/questionsUnitTest');
const matchmakingTestSuite = require('./unit/matchmakingUnitTest');

describe('Unit tests', () => {
    //userTestSuite();
    //questionsTestSuite();

    matchmakingTestSuite();
});
