import jwt from 'jsonwebtoken';

const sign = (payload, expiresIn) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn, algorithm: 'HS256' });
};

/**
 * Opens a session exactly like the password login does.
 *
 * This mirrors `controllers/identity/login.js` on purpose, so the plugin needs
 * no change anywhere in the app. Everything that has to match is in this one
 * file: the payload claims, both expiry times and the cookie options. If you
 * ever change them in the login controller, change them here too.
 *
 * The README explains how to remove this duplication if you prefer to.
 *
 * @param {object} res The express response object
 * @param {object} identity The identity document
 * @returns {string} The short lived access token
 */
const issueTokens = (res, identity) => {
  const { id, name, email, __t: role } = identity;
  const payload = { name, email, role, me: id };

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
