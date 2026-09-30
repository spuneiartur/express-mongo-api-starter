import { Confirm } from '@models';
import settings from './settings';
import unusablePassword from './unusable-password';

/**
 * Takes over an account that was never confirmed.
 *
 * This blocks pre-registration hijacking: an attacker signs up with somebody
 * else's email address and waits for the real owner to arrive through Google.
 * Since the account was never confirmed, the existing password belongs to
 * nobody and must be invalidated before the real owner is let in.
 *
 * @param {object} identity The unconfirmed identity document
 * @returns {Promise<object>} The claimed identity document
 */
const claimIdentity = async (identity) => {
  identity.confirmed = true;
  identity.confirmedAt = Date.now();
  identity.loginAttempts = 0;
  identity.password = unusablePassword();

  if (settings.activateOnClaim) {
    identity.active = true;
  }

  await identity.save(); // validates and throws if anything is wrong
  await Confirm.deleteMany({ identity: identity.id });

  return identity;
};

export default claimIdentity;
