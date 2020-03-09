const { S3 } = require("aws-sdk");
const fetch = require("node-fetch");
const mime = require("mime-types");

const {
  PN_AWS_ACCESS_KEY_ID,
  PN_AWS_SECRET_ACCESS_KEY,
  PN_AWS_BUCKET
} = process.env;

const config = {
  deadline: 13.5, // hours, decimal
  messages: {
    errorApiNotFound: "Kein aktuelles Menu gefunden.",
    updateSuccessful:
      "Menu erfolgreich aktualisiert und bis 13.30 Uhr sichtbar: https://perronnord-web.now.sh/#menu",
    updateFailedTiming:
      "Das Menu kann nur zwischen 0.00 und 13.30 Uhr aktualisiert werden.",
    updateFailedMissingPhoto: "Bitte Foto anhängen."
  }
};

const s3 = new S3({
  accessKeyId: PN_AWS_ACCESS_KEY_ID,
  secretAccessKey: PN_AWS_SECRET_ACCESS_KEY,
  params: { Bucket: PN_AWS_BUCKET }
});

module.exports = async (req, res) => {
  const now = new Date();
  const hour = parseInt(
    now.toLocaleString("de-DE", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Europe/Zurich"
    }),
    10
  );
  const isAllowedTimeframe = hour < config.deadline;

  if (req.method === "GET") {
    if (isAllowedTimeframe) {
      // Find upload from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const data = await s3.listObjects().promise();
      const imageObject = data.Contents.sort(
        (a, b) => b.LastModified - a.LastModified
      ).find(image => image.LastModified > today);

      // Download matching file from S3 and serve
      if (imageObject) {
        const image = await s3
          .getObject({
            Bucket: PN_AWS_BUCKET,
            Key: imageObject.Key
          })
          .promise();

        res.writeHead(200, { "Content-Type": image.ContentType });

        return res.end(image.Body);
      }
    }

    return res.status(404).end(config.messages.errorApiNotFound);
  } else {
    const { body, headers } = req;

    res.writeHead(200, { "Content-Type": "text/xml" });

    // Download image from Twilio URL and upload to S3
    if (body.MediaUrl0) {
      if (isAllowedTimeframe) {
        const response = await fetch(body.MediaUrl0);
        const image = await response.buffer();
        const contentType = response.headers.get("Content-Type");
        const extension = mime.extension(contentType);
        const key = `Menu_${new Date().toISOString()}.${extension}`;

        await s3
          .putObject({
            Bucket: PN_AWS_BUCKET,
            Key: key,
            Body: image,
            ContentType: contentType
          })
          .promise();

        return res.end(`<?xml version="1.0" encoding="UTF-8"?>
          <Response>
            <Message><Body>${config.messages.updateSuccessful}</Body></Message>
          </Response>`);
      } else {
        return res.end(`<?xml version="1.0" encoding="UTF-8"?>
          <Response>
            <Message><Body>${config.messages.updateFailedTiming}</Body></Message>
          </Response>`);
      }
    }

    return res.end(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message><Body>${config.messages.updateFailedMissingPhoto}</Body></Message>
      </Response>`);
  }
};
