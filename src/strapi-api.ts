import type { RespJson } from "./common";

export class StrapiAPI {
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

        var username: string = await cron_worker.get("strapi_username") as string;
        var password: string = await cron_worker.get("strapi_password") as string;
        if (!username || !password) {
            username = this.env.STRAPIUSERNAME;
            password =  this.env.STRAPIPASSWORD;
        }

        let data = {
            "identifier": username,
            "password": password
        }
        let strapiResponse = await fetch("http://localhost:1337/auth/local", {
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