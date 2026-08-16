import jwt from 'jsonwebtoken';

const sign = (payload, expiresIn) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn, algorithm: 'HS256' });
};

/**
 * Signs the access and refresh tokens and sets the refresh token cookie.
 * This is the single place where an authenticated session is created.
 *
 * @param {object} res The express response object
 * @param {object} payload The public JWT payload
 * @returns {string} The short lived access token
 */
const issueTokens = (res, payload) => {
  const token = sign(payload, '15m');
  const refreshToken = sign(payload, '12h');

  const oneDay = 24 * 3600 * 1000;
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(process.env.JWT_TOKEN_NAME, refreshToken, {
    domain: process.env.COOKIE_DOMAIN,
    httpOnly: true,
    maxAge: oneDay,
    secure: isProduction,
    signed: true,
    sameSite: 'Lax',
  });

  return token;
};

export default issueTokens;
