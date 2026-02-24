/** @type {import('jest').Config} */
const config = {
  projects: [
    {
      displayName: "unit",
      preset: "ts-jest",
      testEnvironment: "node",
      rootDir: "./src",
      testMatch: ["**/__tests__/unit/**/*.test.ts"],
      testTimeout: 30000
    },
    {
      displayName: "integration",
      preset: "ts-jest",
      testEnvironment: "node",
      rootDir: "./src",
      testMatch: ["**/__tests__/integration/**/*.test.ts"],
      setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
      testTimeout: 60000,
      testEnvironmentOptions: {
        env: {
          NODE_ENV: "test"
        }
      },
      globals: {
        "ts-jest": {
          tsconfig: "tsconfig.json"
        }
      }
    }
  ]
};

module.exports = config;
