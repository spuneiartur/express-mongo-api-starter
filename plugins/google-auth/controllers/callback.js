import { identityPayload, issueTokens } from '@functions';
import redirectToApp from '../src/redirect-to-app';

/**
 * Opens a session for the identity the middleware chain already proved.
 * Same job as the login controller, only the response differs: the access
 * token is not returned here, the app reads it from /refresh-token.
 */
export default async (req, res) => {
  issueTokens(res, identityPayload(req.user));

  await req.user.updateOne({ lastLoginAt: Date.now() });

  return redirectToApp(res);
};
