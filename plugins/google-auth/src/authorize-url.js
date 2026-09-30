import settings from './settings';

const endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

/**
 * Builds the Google consent screen URL
 *
 * @param {string} state The single use CSRF token
 * @returns {string} The URL to redirect the user to
 */
const authorizeUrl = (state) => {
  const params = new URLSearchParams({
    access_type: 'online',
    client_id: settings.clientId,
    prompt: settings.prompt,
    redirect_uri: settings.callbackUrl,
    response_type: 'code',
    scope: settings.scope.join(' '),
    state,
  });

  // Ask Google to preselect the workspace domain when there is only one allowed
  if (settings.allowedDomains.length === 1) {
    params.set('hd', settings.allowedDomains[0]);
  }

  return `${endpoint}?${params.toString()}`;
};

export default authorizeUrl;
