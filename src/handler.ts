import { GoogleAPI } from "./google-api";
import { StrapiAPI } from "./strapi-api";

export async function handleRequest(request: Request): Promise<Response> {
  const google = new GoogleAPI();
  const calList = await google.getCalendarList();

  const strapi = new StrapiAPI();
  const profile = await strapi.getPoints();

  return new Response(`request method: ${request.method}, token: ${JSON.stringify(profile)}, list: ${JSON.stringify(calList)}`)
}
