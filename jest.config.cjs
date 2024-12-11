const config = {
    preset: "ts-jest",
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    }
};
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)']
  };