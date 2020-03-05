# Perronnord Menu

Photo of current day's menu is sent via WhatsApp to Twilio, uploaded to S3 and displayed until 15.00.

## Setup

- Create bucket in [S3](https://aws.amazon.com/s3/)
- Store [S3 credentials](./now.json) in [Now](https://zeit.co/docs/v2/serverless-functions/env-and-secrets)
- Deploy via `npx now`
- Set up Webhook endpoint in [Twilio](https://www.twilio.com/docs/usage/webhooks)
- Register with [Twilio WhatsApp Sandbox](https://www.twilio.com/docs/sms/whatsapp/api#twilio-sandbox-for-whatsapp)
- Text like it's 1989

## Local development

- Create `.env` with [environment variables](./now.json)
- Run via `npx now dev`
