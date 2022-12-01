// @ts-check
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { basename, extname } from "path";
import FormBody from "@fastify/formbody";
import Traps from "@dnlup/fastify-traps";
import mime from "mime-types";

const config = {
  deadlineHours: 14,
  messages: {
    errorApiNotFound: "Kein aktuelles Menu gefunden.",
    updateSuccessful:
      "Menu erfolgreich aktualisiert und bis 14.00 Uhr sichtbar: https://perronnord.ch/#menu",
    updateFailedTiming:
      "Das Menu kann nur zwischen 0.00 und 14.00 Uhr aktualisiert werden.",
    updateFailedMissingPhoto: "Bitte Foto anhängen.",
    incorrectToken: "Fehler: Das korrekte Token wurde nicht mitgeliefert.",
  },
  directory: "/data",
};

/**
 * Create extension-less file name from current date
 * @returns {string}
 */
function getFileBasename() {
  const filename = new Date().toISOString().split("T")[0];

  return filename;
}

/**
 * Check whether we are within the allowed timeframe
 * @returns {boolean}
 */
function checkTimeframe() {
  const hours = new Date().toLocaleString("de-DE", {
    hour: "2-digit",
    hour12: false,
    timeZone: "Europe/Zurich",
  });
  const isMatch = parseInt(hours, 10) < config.deadlineHours;

  return isMatch;
}

/**
 * Wrap response for Twilio
 * @params {string} text
 * @returns {string}
 */
function getTwilioResponse(text) {
  const response = `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
      <Message><Body>${text}</Body></Message>
  </Response>`;

  return response;
}

/**
 * Init Fastify
 * @returns {Promise<void>}
 */
export default async function (fastify, opts) {
  // Gracefully exit in SIGINT / SIGTERM
  fastify.register(Traps);

  // Handle form POST
  fastify.register(FormBody);

  // Basic index route
  fastify.get("/", function (request, reply) {
    reply.send(`Nein`);
  });

  // API route
  fastify.route({
    method: ["GET", "POST"],
    url: "/api",
    handler: async (request, reply) => {
      const isAllowedTimeframe = checkTimeframe();

      // Get today's menu
      if (request.method === "GET") {
        if (!isAllowedTimeframe) {
          return reply.code(404).send(config.messages.errorApiNotFound);
        }

        // Find upload by file name
        const imageFileBasename = getFileBasename();
        const imageFileName = readdirSync(config.directory).find((fileName) => {
          const isMatch =
            basename(fileName, extname(fileName)) === imageFileBasename;

          return isMatch;
        });
        const imageFilePath = `${config.directory}/${imageFileName}`;

        if (!existsSync(imageFilePath)) {
          return reply.code(404).send(config.messages.errorApiNotFound);
        }

        if (imageFilePath) {
          const image = readFileSync(imageFilePath);
          const contentType = mime.contentType(extname(imageFilePath));

          reply.header("Content-Type", contentType);

          return reply.send(image);
        }
      }

      // Handle Twilio request
      reply.header("Content-Type", "text/xml");

      if (request.query.token !== process.env.TOKEN) {
        return reply.send(getTwilioResponse(config.messages.incorrectToken));
      }

      if (!isAllowedTimeframe) {
        return reply.send(
          getTwilioResponse(config.messages.updateFailedTiming)
        );
      }

      const { body } = request;

      if (!body?.MediaUrl0) {
        return reply.send(
          getTwilioResponse(config.messages.updateFailedMissingPhoto)
        );
      }

      // Download image from Twilio URL
      const response = await fetch(body.MediaUrl0);
      const image = await response.arrayBuffer();
      const contentType = response.headers.get("Content-Type");
      const extension = mime.extension(contentType);

      const imageFileBasename = getFileBasename();
      const imageFilePath = `${config.directory}/${imageFileBasename}.${extension}`;

      // Delete existing files
      for (const fileName of readdirSync(config.directory)) {
        if (basename(fileName, extname(fileName)) === imageFileBasename) {
          rmSync(`${config.directory}/${fileName}`);
        }
      }

      // Save file
      writeFileSync(imageFilePath, Buffer.from(image));

      return reply.send(getTwilioResponse(config.messages.updateSuccessful));
    },
  });
}
