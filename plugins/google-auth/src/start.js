import authorizeUrl from './authorize-url';
import createState from './create-state';

export default async (req, res) => {
  const state = createState(res);

  return res.redirect(authorizeUrl(state));
};
