const userTestSuite = require('./unit/usersUnitTest');
const questionsTestSuite = require('./unit/questionsUnitTest');
const friendsTestSuite = require('./unit/friendsUnitTest');

describe('Unit tests', () => {
    userTestSuite();
    questionsTestSuite();
    friendsTestSuite();
});