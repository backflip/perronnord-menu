#!/usr/bin/env node
// @ts-check
import Fastify from "fastify";
import App from "../app.js";

const fastify = Fastify({
  logger: {
    level: "warn",
    transport: {
      target: "pino-pretty",
    },
  },
});

App(fastify);

// @ts-ignore
fastify.listen(
  {
    port: process.env.HTTP_PORT || 3000,
    host: process.env.HTTP_ADDRESS || "127.0.0.1",
  },
  (err, address) => {
    if (err) {
      fastify.log.error(err);

      process.exit(1);
    }

    console.log(`Started Fastify server on ${address}`);
  }
);
