import { error } from '@functions';
import jwt from 'jsonwebtoken';
import settings from './settings';

const issuers = ['accounts.google.com', 'https://accounts.google.com'];

/**
 * Decodes and validates the Google identity token.
 * The signature is not checked because the token was received directly from
 * Google over TLS, in a server to server call we initiated ourselves.
 *
 * @param {string} idToken The raw id_token from the Google token response
 * @returns {object} The normalized profile
 */
const readProfile = (idToken) => {
  const payload = jwt.decode(idToken);
  if (!payload) {
    throw error(401, 'invalid-token');
  }

  const { aud, iss, exp, sub, email, email_verified: verified, name, picture, hd } = payload;
  if (aud !== settings.clientId || !issuers.includes(iss) || exp * 1000 < Date.now()) {
    throw error(401, 'invalid-token');
  }

  const address = String(email || '').toLowerCase().trim();

  return {
    domain: hd || address.split('@').pop(),
    email: address,
    name: name || address,
    picture,
    providerId: sub,
    verified: verified === true,
  };
};

export default readProfile;
