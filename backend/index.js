import cors from "cors";
import express from "express";
import http from "http";
import dotenv from "dotenv";

import { connectDB } from "./dummyData/connectDB.js";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { startStandaloneServer } from "@apollo/server/standalone";

dotenv.config();
const app = express();
const httpServer = http.createServer(app);

import mergedResolvers from "./resolvers/user.resolver.js";
import mergedTypeDefs from "./typeDefs/index.js";

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  "/",
  cors(),
  express.json(),

  expressMiddleware(server, {
    context: async ({ req }) => ({ req }),
  })
);

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);
