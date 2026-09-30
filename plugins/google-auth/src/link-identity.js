import SocialIdentity from './social-identity';

/**
 * Creates or refreshes the link between an identity and a Google account.
 * Idempotent, so it can be called on every successful login.
 *
 * @param {object} identity The identity document
 * @param {object} profile The normalized Google profile
 * @returns {Promise<object>} The social identity document
 */
const linkIdentity = async (identity, profile) => {
  const query = { provider: 'google', providerId: profile.providerId };
  const update = {
    email: profile.email,
    identity: identity.id,
    lastLoginAt: Date.now(),
    picture: profile.picture,
  };

  return SocialIdentity.findOneAndUpdate(query, { $set: update }, { new: true, upsert: true });
};

export default linkIdentity;
