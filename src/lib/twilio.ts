import Twilio from "twilio";

const accountSid = process.env.TWILIO_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;

let client: ReturnType<typeof Twilio>;

declare global {
  // eslint-disable-next-line no-var
  var _twilioClient: ReturnType<typeof Twilio> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._twilioClient) {
    global._twilioClient = Twilio(accountSid, authToken);
  }
  client = global._twilioClient;
} else {
  client = Twilio(accountSid, authToken);
}

export default client;
