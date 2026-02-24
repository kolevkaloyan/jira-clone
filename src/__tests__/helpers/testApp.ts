import { testDataSource } from "../setup";

export const createTestApp = async () => {
  await testDataSource.initialize();

  jest.resetModules();

  jest.doMock("../data-source", () => ({
    AppDataSource: testDataSource
  }));

  const { app } = require("../app");

  return app;
};
