import { Identity } from '@controllers';
import { accountActive, credentials } from '@middleware';
import { loginSchema } from '@schemas';
import { Router } from 'express';
import { recaptcha, validate } from 'express-goodies/middleware';

const router = Router();
export default router;

router.post('/confirm/:hash', recaptcha, Identity.confirm);
router.post('/forgot', recaptcha, Identity.forgot);
router.post('/reset/:hash', recaptcha, Identity.reset);

// The whole login policy is readable here, one step per line
router.post(
  '/login',
  recaptcha,
  validate(loginSchema),
  credentials,
  accountActive,
  Identity.login
);

router.post('/logout', Identity.logout);
router.post('/refresh-token', Identity.refreshToken);

router.post('/admin/change-password', Identity.changePassword);
router.get('/admin/profile', Identity.profile);
