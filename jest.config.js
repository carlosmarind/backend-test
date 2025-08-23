module.exports = {
testTimeout: 60000,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.spec.ts',
    '!src/config/configuration.ts',
    '!src/coverage/**'
  ],
  coverageReporters: ['lcov', 'text'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
};
