# Perronnord Menu

Serve photo of today's lunch menu. Photo is uploaded via WhatsApp, using a Twilio WhatsApp Sandbox.

## Embed

https://perronnord.responsive.ch/api returns either image or 404 with error text.

Example:

```js
const img = new Image();

img.classList.add("menu-image");
img.setAttribute("alt", "Mittagsmenu");

img.onload = () => {
  document.body.appendChild(img);
};

img.src = "https://perronnord.responsive.ch/api";
```

## Deploy

- Deploy via `flyctl`, make sure a volume [has been created](https://fly.io/docs/flyctl/volumes-create/) before deploying the first time and a `TOKEN` secret [has been set](https://fly.io/docs/flyctl/secrets-set/)
- Set up Webhook endpoint https://perronnord.responsive.ch/api?token=TOKEN in [Twilio](https://www.twilio.com/docs/usage/webhooks)
- Register with [Twilio WhatsApp Sandbox](https://www.twilio.com/docs/sms/whatsapp/api#twilio-sandbox-for-whatsapp)
- Text like it's 1989

## Develop locally

- Build image: `docker build -t perronnord .`
- Run: `docker run -p 8080:8080 -v $(pwd):/data -e TOKEN=test perronnord`
