module.exports = {
    testEnvironment: 'node',
    testMatch: [
      '**/tests/integration/**/*.test.js'
    ],
    testTimeout: 30000,
    verbose: true,
    reporters: [
      'default',
      ['jest-junit', {
        outputDirectory: '.',
        outputName: 'integration-junit.xml',
      }]
    ]
  };