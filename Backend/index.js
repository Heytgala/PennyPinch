import { ApolloServer } from "@apollo/server";

import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";

import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import express from "express";
import http from "http";
import cors from "cors";

import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";

import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";
import { url } from "inspector";

import { buildContext } from "graphql-passport";
import { configurePassport } from "./passport/passport.js";


dotenv.config();
configurePassport();

const app = express();
const httpServer = http.createServer(app);

const MongoDBStore = connectMongo(session);

const store = MongoDBStore({
	uri: process.env.MongoDB_URL,
	collection: "sessions",
})

store.on("error", (err) => console.log(err));

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 7,
		httpOnly: true,
	},
	store: store
}))

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
		context: async ({ req,res }) => buildContext({ req, res }),
	})
);

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
await connectDB();

console.log(`Server ready at http://localhost:4000`);
