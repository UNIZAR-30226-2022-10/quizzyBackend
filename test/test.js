const userTestSuite = require('./unit/usersUnitTest');
const questionsTestSuite = require('./unit/questionsUnitTest');

describe('Unit tests', () => {
    userTestSuite();
    questionsTestSuite();
});