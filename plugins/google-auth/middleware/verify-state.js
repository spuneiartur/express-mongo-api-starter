import { error } from '@functions';
import { timingSafeEqual } from 'crypto';
import settings from '../src/settings';

/**
 * Compares the state returned by Google with the one stored in the signed
 * cookie. Without this check anyone could replay a callback URL against a
 * logged in browser.
 */
const verifyState = (req, res, next) => {
  const expected = req.signedCookies[settings.stateCookie];
  const actual = req.query.state;

  // The state is single use, drop the cookie as soon as it was read
  res.clearCookie(settings.stateCookie, { path: '/auth/google' });

  if (!expected || !actual || expected.length !== actual.length) {
    throw error(400, 'invalid-state');
  }

  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(actual))) {
    throw error(400, 'invalid-state');
  }

  return next();
};

export default verifyState;
