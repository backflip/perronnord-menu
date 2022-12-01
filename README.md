# Perronnord Menu

Serve photo of today's lunch menu. Photo is uploaded via WhatsApp, using a Twilio WhatsApp Sandbox.

## Embed

https://perronnord.responsive.ch/api returns either image or 404 with error text.

Example with toggle button:

```js
const img = new Image();

img.classList.add("menu-image");
img.setAttribute("alt", "Mittagsmenu");

// Insert toggle button
img.onload = () => {
  const button = document.createElement("button");

  button.innerText = "Mittagsmenu";
  button.classList.add("menu-btn");
  button.setAttribute("type", "button");
  button.setAttribute("aria-expanded", "false");

  button.addEventListener("click", () => {
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

  document.body.appendChild(button);
};

img.src = "https://perronnord.responsive.ch/api";
```

## Deploy

- Deploy via `flyctl`, make sure a volume [has been created](https://fly.io/docs/flyctl/volumes-create/) before deploying the first time
- Set up Webhook endpoint https://perronnord.responsive.ch/api in [Twilio](https://www.twilio.com/docs/usage/webhooks)
- Register with [Twilio WhatsApp Sandbox](https://www.twilio.com/docs/sms/whatsapp/api#twilio-sandbox-for-whatsapp)
- Text like it's 1989

## Develop locally

- Build image: `docker build -t perronnord .`
- Run: `docker run -p 8080:8080 -v $(pwd):/data perronnord`
