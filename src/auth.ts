import * as jose from 'jose'

type RespJson = Record<string, any>
declare global {
    const cron_worker: KVNamespace;
}

export class GoogleJwtAuthenticater {

    readonly auth_url: string = "https://oauth2.googleapis.com/token";
    readonly expiration: string = "1h";

    constructor(
        private scope: string,
        private issuer: string,
        private audience: string
    ) {}

    private async signJwt() {
        const privateKey = await this.getPrivateKey();
        const jwt = await new jose.SignJWT({ 'scope': this.scope })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT'})
        .setIssuedAt()
        .setIssuer(this.issuer)
        .setAudience(this.audience)
        .setExpirationTime('1h')
        .sign(privateKey)
        return jwt;
    }

    private async getPrivateKey() {
        const algorithm = 'RS256'
        // @ts-ignore
        const pkcs8: string = await cron_worker.get("private_key")
        const privateKey = await jose.importPKCS8(pkcs8, algorithm)
        return privateKey;
    }

    public async setPrivateKey(private_key: string) {
        const pk = await cron_worker.put("private_key", private_key)
        return pk
    }

    public async getToken() {
        let jwt = await this.signJwt();
        const url = "https://oauth2.googleapis.com/token";
        let data = {
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": jwt
        }
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        const result = await response.json<RespJson>();
        const token = result['access_token']
        return token
    }

}