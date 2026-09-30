import settings from './settings';

// Only these codes ever reach the browser, anything else becomes a generic error
const codes = [
  'account-not-active',
  'account-not-found',
  'domain-not-allowed',
  'email-in-use',
  'email-not-verified',
  'invalid-state',
  'invalid-token',
  'missing-code',
  'no-account',
];

/**
 * Sends the user back to the frontend app.
 * The redirect targets come from settings.json and are never read from the
 * query string, so this cannot be turned into an open redirect.
 *
 * @param {object} res The express response object
 * @param {string} reason An error code, when the login failed
 */
const redirectToApp = (res, reason) => {
  if (!reason) {
    return res.redirect(`${process.env.APP_BASE_URL}${settings.successRedirect}?status=ok`);
  }

  const code = codes.includes(reason) ? reason : 'failed';

  return res.redirect(`${process.env.APP_BASE_URL}${settings.failureRedirect}?error=${code}`);
};

export default redirectToApp;
