import { GoogleAPI } from "./google-api";
import { StrapiAPI } from "./strapi-api";
import type { RespJson } from "./common"

export async function handleRequest(request: Request): Promise<Response> {
  const google = new GoogleAPI();
  const report = await google.getAuditReports();

  const strapi = new StrapiAPI();
  const profile = await strapi.getPoints();

  parseReports(report)
  return new Response(`request method: ${request.method}, token: ${JSON.stringify(profile)}, list: ${JSON.stringify(report)}`)
}

function parseReports(report: RespJson) {
  if (report == null || report.items.length == 0) {
    return;
  }
  for (const item of report.items) {
    for (const param of item.events[0].parameters) {
      switch (param.name) {
        case "identifier":
          console.log(`identifier ${param.value}`);
          break;
        case "meeting_code":
          console.log(`meeting code ${param.value}`);
          break;
        case "duration_seconds":
          console.log(`duration_seconds ${param.intValue}`);
          break;
      }
    }
  }
}

