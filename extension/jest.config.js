/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  testTimeout: 20000,
  moduleNameMapper: {
    '\\.(svg|png)$': '<rootDir>/test/fileMock.js',
    '\\.css$': '<rootDir>/test/cssMock.js',
  },
}
