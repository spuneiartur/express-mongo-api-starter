import authorizeUrl from '../src/authorize-url';
import createState from '../src/create-state';

export default async (req, res) => {
  const state = createState(res);

  return res.redirect(authorizeUrl(state));
};
