/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/globals.css',
    '!src/app/favicon.ico',
    '!src/app/layout.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss|sass|less)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(jpg|jpeg|png|gif|svg|ico|webp|avif)$': '<rootDir>/__mocks__/fileMock.js',
    '^next/font/(.*)$': '<rootDir>/__mocks__/nextFontMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': '<rootDir>/jest-transformer.js',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transformIgnorePatterns: [
    '/node_modules/',
  ],
};

module.exports = config;
