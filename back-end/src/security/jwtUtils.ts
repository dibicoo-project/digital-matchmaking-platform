import { expressJwtSecret } from 'jwks-rsa';
import jwt from 'express-jwt';

export const AUTH_CHECK = Symbol.for('AUTH_CHECK');

const secretProvider = () => expressJwtSecret({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: 'https://dibicoo.eu.auth0.com/.well-known/jwks.json'
});

export const jwtCheck = () => jwt({
  secret: secretProvider(),
  audience: 'https://dibicoo-matchmaking-tool.appspot.com/api/',
  issuer: 'https://dibicoo.eu.auth0.com/',
  algorithms: ['RS256'],
  credentialsRequired: false
});
