import * as jose from 'jose'


// generate jwt signed with private key from google
export async function sign_jwt() {
    const privateKey = await getPrivateKey();
    const jwt = await new jose.SignJWT({ 'scope': 'https://www.googleapis.com/auth/calendar' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT'})
    .setIssuedAt()
    .setIssuer('platform-api-google-group@pure-phalanx-300410.iam.gserviceaccount.com')
    .setAudience('https://oauth2.googleapis.com/token')
    .setExpirationTime('1h')
    .sign(privateKey)
    return jwt;
}


type RespJson = Record<string, any>

// authenticate with google with the signed jwt token and returns the token
export async function get_token() {
    let jwt = await sign_jwt();
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

async function getPrivateKey() {
    const algorithm = 'RS256'
    const pkcs8 = `insert-key-here`
    const privateKey = await jose.importPKCS8(pkcs8, algorithm)

    return privateKey;
}