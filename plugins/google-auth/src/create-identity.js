import { Identity } from '@models';
import settings from './settings';
import unusablePassword from './unusable-password';

/**
 * Creates a brand new account from a Google profile.
 * Google already verified the email address, so the account starts confirmed.
 *
 * @param {object} profile The normalized Google profile
 * @returns {Promise<object>} The new identity document
 */
const createIdentity = async (profile) => {
  // The default role is a discriminator name, fall back to a plain identity
  const Model = Identity.discriminators?.[settings.defaultRole] || Identity;

  return Model.create({
    active: true,
    confirmed: true,
    confirmedAt: Date.now(),
    email: profile.email,
    name: profile.name,
    password: unusablePassword(),
  });
};

export default createIdentity;
