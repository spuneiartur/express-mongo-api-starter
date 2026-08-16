/**
 * Builds the public JWT payload for an identity document.
 * Every authentication method must produce the exact same payload.
 *
 * @param {object} identity The identity document
 * @returns {object} The public JWT payload
 */
const identityPayload = (identity) => {
  const { id, name, email, __t: role } = identity;

  return { name, email, role, me: id };
};

export default identityPayload;
