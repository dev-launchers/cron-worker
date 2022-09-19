import * as jose from 'jose'
import type { RespJson } from "./common"

declare global {
    const cron_worker: KVNamespace;
}

export class GoogleAPI {
    authenticator: GoogleJwtAuthenticater;
    adminScopes = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/admin.directory.group https://www.googleapis.com/auth/admin.directory.group.member https://www.googleapis.com/auth/admin.reports.audit.readonly https://www.googleapis.com/auth/admin.directory.user.security" ;


    constructor() {
        this.authenticator = new GoogleJwtAuthenticater(this.adminScopes, 'platform-api-google-group@pure-phalanx-300410.iam.gserviceaccount.com', 'https://oauth2.googleapis.com/token')
    }

    public async getAuditReports() {
        const token = await this.authenticator.getToken();
        const currentTime = new Date();
        const freq = 60;
        const startTime = currentTime.setMinutes(currentTime.getMinutes() - freq);
        const reportUrl = `https://admin.googleapis.com/admin/reports/v1/activity/users/all/applications/meet?call_ended=${startTime}`
        const response = await fetch(reportUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        const list = await response.json<RespJson>();
        return list
      }

    public async getCalendarList() {
        const token = await this.authenticator.getToken()
        const cal_url = "https://www.googleapis.com/calendar/v3/users/me/calendarList"

        const response = await fetch(cal_url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        const list = await response.json<RespJson>();
        return list
    }
}

class GoogleJwtAuthenticater {

    readonly authUrl: string = "https://oauth2.googleapis.com/token";
    readonly expiration: string = "1h";
    readonly typ: string = "JWT";
    readonly alg: string = "RS256";

    constructor(
        private scopes: string,
        private issuer: string,
        private audience: string
    ) {}

    private async signJwt() {
        const privateKey = await this.getPrivateKey();
        const jwt = await new jose.SignJWT({ 'scope': this.scopes })
        .setProtectedHeader({ alg: this.alg, typ: this.typ})
        .setIssuedAt()
        .setIssuer(this.issuer)
        .setAudience(this.audience)
        .setExpirationTime(this.expiration)
        .setSubject("strapi-svc@devlaunchers.com") // subject must be set https://github.com/googleapis/google-api-nodejs-client/issues/1884#issuecomment-625062805
        .sign(privateKey)
        return jwt;
    }

    private async getPrivateKey() {
        const algorithm = this.alg
        var pkcs8: string = await cron_worker.get("private_key") as string;
        if (!pkcs8) {
            const env: any = (typeof process !== "undefined") ? process.env : global
            pkcs8 = env.GOOGLE_PRIVATE_KEY
        }
        const privateKey = await jose.importPKCS8(pkcs8, algorithm)
        return privateKey;
    }

    public async getToken() {
        let jwt = await this.signJwt();
        let data = {
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": jwt
        }
        const response = await fetch(this.authUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json<RespJson>();
        const token = result['access_token']
        return token
    }

}