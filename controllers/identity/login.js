import { error, identityPayload, issueTokens } from '@functions';

/**
 * Opens a session for the identity that the middleware chain already proved.
 * This controller knows nothing about passwords, providers or any other way
 * of authenticating, it only mints tokens.
 */
export default async (req, res) => {
  const identity = req.user;
  if (!identity) {
    throw error(400, 'Your email or password are invalid');
  }

  // Sign both tokens and set the refresh token cookie
  const token = issueTokens(res, identityPayload(identity));

  // Add last login information to the current user
  await identity.updateOne({ lastLoginAt: Date.now() });

  return res.status(200).json({ token, message: 'Authentication successful' });
};
