import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "ProjectHub API",
    description: "Lightweight Project & Task Management API",
    version: "1.0.0"
  },
  host: "localhost:3000",
  basePath: "/api/v1",
  schemes: ["http"],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "Enter: Bearer <token>"
    }
  },
  security: [{ bearerAuth: [] }]
};

const outputFile = "./swagger-output.json";
const routes = ["./routes/index.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, routes, doc);
