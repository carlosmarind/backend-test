module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/*.test.ts'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/config/**',
    '!src/**/*.module.ts',
    '!src/**/*.d.ts'
  ],
  coverageReporters: ['lcov', 'text-summary', 'json', 'json-summary'],
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['ts', 'js', 'json']
};
