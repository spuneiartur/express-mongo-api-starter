import settings from '../settings.json';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

/**
 * The plugin can never be enabled without credentials, no matter what settings.json says
 */
export default {
  ...settings,
  callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  clientId,
  clientSecret,
  enabled: Boolean(settings.enabled && clientId && clientSecret),
};
