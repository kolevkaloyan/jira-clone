/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "./src",
  testMatch: ["**/__tests__/**/*.test.ts"],
  testTimeout: 60000
};

module.exports = config;
