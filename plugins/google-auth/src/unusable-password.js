import { randomHash } from '@functions';

/**
 * Builds a password nobody knows, for accounts that only log in with a provider.
 * The identity schema requires a password, and this keeps the schema untouched.
 * Such users can still set a real password later through the forgot flow.
 *
 * @returns {string} A 96 character random string
 */
const unusablePassword = () => {
  return `${randomHash()}${randomHash()}`;
};

export default unusablePassword;
