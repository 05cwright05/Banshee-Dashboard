import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

const livekitUrl = process.env.LIVEKIT_URL!;
const apiKey = process.env.LIVEKIT_API_KEY!;
const apiSecret = process.env.LIVEKIT_API_SECRET!;

const httpUrl = livekitUrl.replace("wss://", "https://");

export function getRoomService() {
  return new RoomServiceClient(httpUrl, apiKey, apiSecret);
}

export async function createListenerToken(roomName: string, identity: string) {
  const token = new AccessToken(apiKey, apiSecret, { identity });
  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: false,
    canPublishData: false,
    canSubscribe: true,
  });
  return await token.toJwt();
}

export { livekitUrl };
