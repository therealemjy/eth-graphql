module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  resetMocks: true,
  collectCoverageFrom: ['src/**/*.{ts,js}'],
  modulePathIgnorePatterns: ['./src/cli/__tests__/fakeConfig'],
};
