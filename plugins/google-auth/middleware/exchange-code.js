import { error } from '@functions';
import exchange from '../src/exchange-code';

/**
 * Turns the authorization code into a Google identity token
 */
const exchangeCode = async (req, res, next) => {
  const { code } = req.query;
  if (!code) {
    throw error(400, 'missing-code');
  }

  const { id_token: idToken } = await exchange(code);
  req.googleToken = idToken;

  return next();
};

export default exchangeCode;
