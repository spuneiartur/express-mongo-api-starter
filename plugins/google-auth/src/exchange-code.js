import axios from 'axios';
import settings from './settings';

const endpoint = 'https://oauth2.googleapis.com/token';

/**
 * Exchanges the authorization code for tokens, server to server.
 * The client secret never leaves the API, so the browser cannot forge this call.
 *
 * @param {string} code The authorization code received on the callback
 * @returns {Promise<object>} The Google token response
 */
const exchangeCode = async (code) => {
  const body = new URLSearchParams({
    client_id: settings.clientId,
    client_secret: settings.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: settings.callbackUrl,
  });

  const { data } = await axios.post(endpoint, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return data;
};

export default exchangeCode;
