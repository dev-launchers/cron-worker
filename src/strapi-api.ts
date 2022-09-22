import type { RespJson } from "./common";

export class StrapiAPI {
    static readonly GET = 'GET'
    token: string = "";
    env: any = (typeof process !== "undefined") ? process.env : global

    public async getProfile() {
        return this.fetch("/users/profiles")
    }

    public async getPoints() {
        return this.fetch("/users/points")
    }

    private async fetch(urlPath: string) {
        if (!this.token) {
            this.token = await this.getToken()
        }

        let url = this.env.STRAPIBASEURL + urlPath
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'cookie': this.token
            }
        })
        const result = await response.json<RespJson>();
        return result
    }

    private async getToken(): Promise<string> {

        // in prod, we check for cron_worker cloudflare secret store
        var username: string = await cron_worker.get("strapi_username") as string;
        var password: string = await cron_worker.get("strapi_password") as string;

        // for dev environment, we check the env variable
        if (!username || !password) {
            username = this.env.STRAPIUSERNAME;
            password =  this.env.STRAPIPASSWORD;
        }

        let data = {
            "identifier": username,
            "password": password
        }
        let authUrl = this.env.STRAPIBASEURL + "/auth/local"
        let strapiResponse = await fetch(authUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        })

        let response = new Response(strapiResponse.body, strapiResponse)
        let cookie: string = response.headers.get('set-cookie')!

        return cookie
    }
}