import googleAuth from './google-auth/router';

/**
 * Optional plugins that register their own routes.
 *
 * Every router here is empty while its plugin is disabled, so a plugin that is
 * turned off costs nothing. Adding another plugin means adding it to this list,
 * not touching `router.js`.
 */
export default [googleAuth];
