import { error, identityPayload, issueTokens } from '@functions';
import claimIdentity from './claim-identity';
import createIdentity from './create-identity';
import ensureCanLogin from './ensure-can-login';
import exchangeCode from './exchange-code';
import findState from './find-state';
import linkIdentity from './link-identity';
import readProfile from './read-profile';
import redirectToApp from './redirect-to-app';
import resolveIdentity from './resolve-identity';
import verifyState from './verify-state';

const authenticate = async (req, res) => {
  verifyState(req, res);

  const { code } = req.query;
  if (!code) {
    throw error(400, 'missing-code');
  }

  const { id_token: idToken } = await exchangeCode(code);
  const profile = readProfile(idToken);
  const state = await findState(profile);

  const { action, reason } = resolveIdentity(profile, state);
  if (action === 'deny') {
    return redirectToApp(res, reason);
  }

  let identity = state.identity;
  if (action === 'create') {
    identity = await createIdentity(profile);
  }
  if (action === 'claim') {
    identity = await claimIdentity(identity);
  }

  // Same account checks as the password login, Google is not a way around them
  ensureCanLogin(identity);

  await linkIdentity(identity, profile);
  await identity.updateOne({ active: true, lastLoginAt: Date.now(), loginAttempts: 0 });

  // The access token is not returned here, the app reads it from /refresh-token
  issueTokens(res, identityPayload(identity));

  return redirectToApp(res);
};

/**
 * A failed callback has to send the user back to the app instead of rendering a
 * JSON error, which is why this is the only controller with a try/catch block
 */
export default async (req, res) => {
  try {
    return await authenticate(req, res);
  } catch (err) {
    return redirectToApp(res, err.message);
  }
};
