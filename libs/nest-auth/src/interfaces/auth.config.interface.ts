export interface IConfigAuth {
  jwt: {
    accessToken: {
      secretKey: string
      expirationTime: number
    }

    refreshToken: {
      secretKey: string
      expirationTime: number
    }

    audience: string
    issuer: string
    header: 'Authorization'
    prefix: 'Bearer'
  }

  password: {
    attempt: boolean
    maxAttempt: number
    saltLength: number
    expiredIn: number
    expiredInTemporary: number
    period: number
  }

  apple: {
    header: 'Authorization'
    prefix: 'Bearer'
    clientId: string
    signInClientId: string
  }

  google: {
    header: 'Authorization'
    prefix: 'Bearer'
    clientId: string
    clientSecret: string
  }

  xApiKey: {
    header: string
  }

  otp: {
    length: number
    maxAttempts: number
    ttl: number
  }

  token: {
    length: number
    maxAttempts: number
    ttl: number
  }
}
