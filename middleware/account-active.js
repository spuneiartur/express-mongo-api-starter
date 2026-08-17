import { error } from '@functions';

/**
 * Shared gate for every authentication method.
 *
 * Whatever proved the identity, an account that is not active or not confirmed
 * cannot open a session. Keeping this in one middleware is what stops a new
 * login method from silently skipping a check the password login enforces.
 */
const accountActive = (req, res, next) => {
  if (!req.user) {
    throw error(401, 'Authentication required');
  }

  const { active, confirmed } = req.user;
  if (!active || !confirmed) {
    throw error(400, 'Your account is not active');
  }

  return next();
};

export default accountActive;
