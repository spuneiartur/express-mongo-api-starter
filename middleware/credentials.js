import { error } from '@functions';
import { Identity } from '@models';
import bcrypt from 'bcryptjs';

/**
 * Proves an identity from the email and password in the request body.
 *
 * The identity document is handed downstream on `req.user`, which is the only
 * contract an authentication method has to fulfill. Any other method that can
 * prove who the user is may replace this middleware in the chain.
 */
const credentials = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw error(400, 'Missing required params');
  }

  // Find the user by case-insensitive email search
  // The email should already be lowercase if loginSchema middleware was used
  const identity = await Identity.findOne({ email }).select('+password');
  if (!identity) {
    throw error(400, 'Your email or password are invalid');
  }

  // Block logins for accounts with 5 or more failed attempts
  if (identity.loginAttempts >= 5) {
    await identity.updateOne({ active: false });
    throw error(400, 'Your account has been locked, please reset your password');
  }

  const passwordsMatch = await bcrypt.compare(password, identity.password);
  if (!passwordsMatch) {
    await identity.updateOne({ $inc: { loginAttempts: 1 } });
    throw error(400, 'Your email or password are invalid');
  }

  await identity.updateOne({ loginAttempts: 0 });
  req.user = identity;

  return next();
};

export default credentials;
