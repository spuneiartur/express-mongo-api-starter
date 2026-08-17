import link from '../src/link-identity';

/**
 * Creates or refreshes the link between the account and the Google profile
 */
const linkIdentity = async (req, res, next) => {
  await link(req.user, req.googleProfile);

  return next();
};

export default linkIdentity;
