import { error, issueTokens, removeRefreshTokenCookie } from '@functions';
import jwt from 'jsonwebtoken';

export default async (req, res) => {
  const signedCookie = req.signedCookies[process.env.JWT_TOKEN_NAME];
  if (!signedCookie) {
    throw error(401, 'Refresh token not provided');
  }

  let payload;
  try {
    payload = jwt.verify(signedCookie, process.env.JWT_SECRET, { ignoreExpiration: true });
  } catch (err) {
    removeRefreshTokenCookie(res);
    throw error(401, 'Refresh token invalid');
  }

  // See: https://gist.github.com/ziluvatar/a3feb505c4c0ec37059054537b38fc48
  delete payload.iat;
  delete payload.exp;
  delete payload.nbf;
  delete payload.jti;

  // Sign both tokens again and refresh the refresh token cookie
  const token = issueTokens(res, payload);

  return res.json({ token, message: 'Token refresh successful' });
};
