import { randomHash } from '@functions';
import settings from './settings';

/**
 * Creates a single use CSRF token and stores it in a signed cookie
 *
 * @param {object} res The express response object
 * @returns {string} The state to send to Google
 */
const createState = (res) => {
  const state = randomHash();
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(settings.stateCookie, state, {
    httpOnly: true,
    maxAge: settings.stateMaxAge,
    path: '/auth/google',
    sameSite: 'Lax',
    secure: isProduction,
    signed: true,
  });

  return state;
};

export default createState;
