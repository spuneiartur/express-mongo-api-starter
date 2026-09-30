import { error } from '@functions';
import settings from './settings';

/**
 * Applies the same account checks as the password login.
 * Google must never become a way around a locked or disabled account.
 *
 * A lockout is the one exception: proving mailbox ownership through Google is
 * the same proof as the password reset flow, which also unlocks the account.
 *
 * @param {object} identity The identity document
 */
const ensureCanLogin = (identity) => {
  // The link points to an account that no longer exists
  if (!identity) {
    throw error(404, 'account-not-found');
  }

  const { active, confirmed, loginAttempts } = identity;
  if (!confirmed) {
    throw error(400, 'account-not-active');
  }

  // Locked out by failed password attempts, not disabled by an administrator
  const isLockedOut = !active && loginAttempts >= 5;
  if (isLockedOut && settings.unlockOnLogin) {
    return;
  }

  if (!active) {
    throw error(400, 'account-not-active');
  }
};

export default ensureCanLogin;
