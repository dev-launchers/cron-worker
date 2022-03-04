import { GoogleJwtAuthenticater } from "./auth";

type RespJson = Record<string, any>

export async function handleRequest(request: Request): Promise<Response> {
  const authenticator = new GoogleJwtAuthenticater('https://www.googleapis.com/auth/calendar', 'platform-api-google-group@pure-phalanx-300410.iam.gserviceaccount.com', 'https://oauth2.googleapis.com/token')

  // uncomment this line if running locally with miniflare
  await authenticator.setPrivateKey("set-private-key-here")

  const token = await authenticator.getToken()
  const cal_url = "https://www.googleapis.com/calendar/v3/users/me/calendarList"

  const response2 = await fetch(cal_url, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  const list = await response2.json<RespJson>();
  return new Response(`request method: ${request.method}, token: ${JSON.stringify(list)}`)
}
