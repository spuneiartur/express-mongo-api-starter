import claimIdentity from '../src/claim-identity';
import createIdentity from '../src/create-identity';
import findState from '../src/find-state';
import redirectToApp from '../src/redirect-to-app';
import resolveAction from '../src/resolve-action';

/**
 * Decides what to do with the Google profile and hands the account downstream
 * on req.user, the very same contract the credentials middleware fulfills.
 */
const resolveIdentity = async (req, res, next) => {
  const profile = req.googleProfile;
  const state = await findState(profile);

  const { action, reason } = resolveAction(profile, state);
  if (action === 'deny') {
    return redirectToApp(res, reason);
  }

  if (action === 'create') {
    req.user = await createIdentity(profile);
    return next();
  }

  if (action === 'claim') {
    req.user = await claimIdentity(state.identity);
    return next();
  }

  // The link may point to an account that no longer exists
  if (!state.identity) {
    return redirectToApp(res, 'account-not-found');
  }

  req.user = state.identity;

  return next();
};

export default resolveIdentity;
