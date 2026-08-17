import defaults from './settings';

/**
 * Decides what to do with a Google profile without touching the database.
 * Pure function on purpose, so every branch can be unit tested.
 *
 * @param {object} profile The normalized Google profile
 * @param {object} state The current database state
 * @param {object} state.link The existing social identity, if any
 * @param {object} state.identity The identity matching the email address, if any
 * @param {object} config The plugin settings, injectable for testing
 * @returns {{ action: string, reason?: string }} login, create, claim, link or deny
 */
const resolveIdentity = (profile, { link, identity }, config = defaults) => {
  // Google is the only party that can prove ownership of the mailbox
  if (!profile.verified) {
    return { action: 'deny', reason: 'email-not-verified' };
  }

  const { allowedDomains } = config;
  if (allowedDomains.length > 0 && !allowedDomains.includes(profile.domain)) {
    return { action: 'deny', reason: 'domain-not-allowed' };
  }

  // Known Google account, the email address is irrelevant from here on
  if (link) {
    return { action: 'login' };
  }

  if (!identity) {
    return config.allowSignup ? { action: 'create' } : { action: 'deny', reason: 'no-account' };
  }

  // Nobody ever proved ownership of this email, so the password belongs to nobody
  if (!identity.confirmed) {
    return { action: 'claim' };
  }

  if (config.linking === 'deny') {
    return { action: 'deny', reason: 'email-in-use' };
  }

  return { action: 'link' };
};

export default resolveIdentity;
