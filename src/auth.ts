import * as jose from 'jose'

type RespJson = Record<string, any>

export class GoogleJwtAuthenticater {

    readonly auth_url: string = "https://oauth2.googleapis.com/token";
    readonly expiration: string = "1h";

    constructor(
        private scope: string,
        private issuer: string,
        private audience: string
    ) {}

    private async sign_jwt() {
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
        const pkcs8 = `insert-key-here`
        const privateKey = await jose.importPKCS8(pkcs8, algorithm)
        return privateKey;
    }

    public async get_token() {
        let jwt = await this.sign_jwt();
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