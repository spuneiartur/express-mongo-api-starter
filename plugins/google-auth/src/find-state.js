import { Identity } from '@models';
import SocialIdentity from '../models/social-identity';

/**
 * Loads everything the resolver needs in order to make a decision.
 * The provider id is matched first, so a Google user who changed the email
 * address on their side still lands on the same account.
 *
 * @param {object} profile The normalized Google profile
 * @returns {Promise<{ link: object, identity: object }>} The current state
 */
const findState = async (profile) => {
  const link = await SocialIdentity.findOne({
    provider: 'google',
    providerId: profile.providerId,
  });

  const identity = link
    ? await Identity.findById(link.identity)
    : await Identity.findOne({ email: profile.email });

  return { link, identity };
};

export default findState;
