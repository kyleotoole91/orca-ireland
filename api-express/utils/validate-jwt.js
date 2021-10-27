import jwt from "express-jwt"
import { expressJwtSecret } from "jwks-rsa"
require('dotenv').config()

const validateJwt = jwt({
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
})

export default validateJwt 