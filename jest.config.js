module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',         // todos los .ts de src
    '!src/**/*.spec.ts',   // excepto los tests
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary'],
};
