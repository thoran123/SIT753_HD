module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/integration/**/*.test.js'
  ],
  testTimeout: 30000,
  verbose: true,
  reporters: [
    'default'
    // Remove jest-junit or install it first
  ]
};