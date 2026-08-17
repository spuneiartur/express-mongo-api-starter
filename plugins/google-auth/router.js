import { Router } from 'express';
import middleware from 'express-goodies/middleware';
import * as controllers from './controllers';
import * as guards from './middleware';
import settings from './src/settings';

const router = Router();
export default router;

// The routes do not exist at all while the plugin is disabled
if (settings.enabled) {
  router.get('/auth/google', middleware.speedLimiter, controllers.start);

  // The whole login policy is readable here, one step per line
  router.get(
    '/auth/google/callback',
    guards.verifyState,
    guards.exchangeCode,
    guards.readProfile,
    guards.resolveIdentity,
    guards.unlockLockout,
    guards.accountActive,
    guards.linkIdentity,
    controllers.callback
  );

  // Failures redirect back to the app, scoped to this path only
  router.use('/auth/google', guards.handleError);
}
