import { Router } from 'express';
import middleware from 'express-goodies/middleware';
import { handleCallback, settings, startAuth } from './src';

const router = Router();
export default router;

// The routes do not exist at all while the plugin is disabled
if (settings.enabled) {
  router.get('/auth/google', middleware.speedLimiter, startAuth);
  router.get('/auth/google/callback', handleCallback);
}
