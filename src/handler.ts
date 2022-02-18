import { get_token } from "./auth";

type RespJson = Record<string, any>

export async function handleRequest(request: Request): Promise<Response> {
  const token = await get_token()
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
