# Perronnord Menu

Photo of current day's menu is sent via WhatsApp to Twilio, uploaded to S3 and displayed until 15.00.

Why? Because sending the menu via WhatsApp to a group of chosen ones is the current publication process.

## Embed

`DEPLOYMENT_URL/api` returns either image or 404 with error text.

Example with toggle button:

```js
(function() {
  // Prepare image
  var img = new Image();
  img.className = "img img--menu";

  img.onload = function() {
    // Create button
    var button = document.createElement("button");
    button.innerText = "Mittagsmenu anzeigen";
    button.className = "btn btn--menu";
    document.body.appendChild(button);

    // Display image on click
    button.addEventListener("click", function() {
      if (!img.parentNode) {
        document.body.appendChild(img);
      }

      if (button.getAttribute("aria-expanded") === "true") {
        button.setAttribute("aria-expanded", "false");
        img.style.display = "none";
      } else {
        button.setAttribute("aria-expanded", "true");
        img.style.display = "block";
      }
    });
  };

  // Load image
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  img.src = "DEPLOYMENT_URL/api?" + today.getTime();
})();
```

## Setup

- Create bucket in [S3](https://aws.amazon.com/s3/)
- Store [S3 credentials](./now.json) in [Now](https://zeit.co/docs/v2/serverless-functions/env-and-secrets)
- Deploy via `npx now`
- Set up Webhook endpoint (`DEPLOYMENT_URL/api`) in [Twilio](https://www.twilio.com/docs/usage/webhooks)
- Register with [Twilio WhatsApp Sandbox](https://www.twilio.com/docs/sms/whatsapp/api#twilio-sandbox-for-whatsapp)
- Text like it's 1989

## Local development

- Create `.env` with [environment variables](./now.json)
- Run via `npx now dev`
