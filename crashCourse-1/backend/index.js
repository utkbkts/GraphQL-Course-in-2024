import cors from "cors";
import express from "express";
import http from "http";
import dotenv from "dotenv";

import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";

import { connectDB } from "./dummyData/connectDB.js";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { startStandaloneServer } from "@apollo/server/standalone";

import mergedResolvers from "./resolvers/user.resolver.js";
import mergedTypeDefs from "./typeDefs/index.js";
import { GraphQLLocalStrategy, buildContext } from "graphql-passport";

dotenv.config();
const app = express();
const httpServer = http.createServer(app);

const MongoStore = connectMongo(session);

const store = new MongoStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

store.on("error", (error) => {
  console.log(error);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 },
    name: "session",
    store: store,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  "/",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
  express.json(),

  expressMiddleware(server, {
    context: async ({ req, res }) => ({ req, res }),
  })
);

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);
