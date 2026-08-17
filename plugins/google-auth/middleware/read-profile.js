import decodeProfile from '../src/read-profile';

/**
 * Validates the identity token and puts the normalized profile on the request
 */
const readProfile = (req, res, next) => {
  req.googleProfile = decodeProfile(req.googleToken);

  return next();
};

export default readProfile;
