import settings from '../src/settings';

/**
 * Clears a lockout when the user proved mailbox ownership through Google.
 * The password reset flow already grants the same, so this adds no new power.
 * Runs before the shared account gate, which would otherwise refuse the login.
 */
const unlockLockout = async (req, res, next) => {
  const { active, loginAttempts } = req.user;

  // Locked out by failed password attempts, not disabled by an administrator
  const isLockedOut = !active && loginAttempts >= 5;
  if (isLockedOut && settings.unlockOnLogin) {
    await req.user.updateOne({ active: true, loginAttempts: 0 });
    req.user.active = true;
    req.user.loginAttempts = 0;
  }

  return next();
};

export default unlockLockout;
