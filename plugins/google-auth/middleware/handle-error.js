/* eslint-disable no-unused-vars */
import redirectToApp from '../src/redirect-to-app';

/**
 * Failures on this router send the user back to the app instead of rendering
 * the JSON error the global error handler would produce. Mounted on the plugin
 * path only, so errors from the rest of the API never reach it.
 */
const handleError = (err, req, res, next) => {
  return redirectToApp(res, err.message);
};

export default handleError;
