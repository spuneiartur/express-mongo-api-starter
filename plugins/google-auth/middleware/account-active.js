import { error } from '@functions';
import { accountActive as sharedGate } from '@middleware';

/**
 * Reuses the shared account gate, so this login method cannot skip a check the
 * password login enforces. Only the error is translated, because this route
 * redirects back to the app instead of returning JSON.
 */
const accountActive = (req, res, next) => {
  try {
    return sharedGate(req, res, next);
  } catch (err) {
    throw error(err.status || 400, 'account-not-active');
  }
};

export default accountActive;
