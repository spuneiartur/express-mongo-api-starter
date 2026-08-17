# Google Auth Plugin

Optional "Login with Google" for the existing JWT authentication.

Quick start

1. Create the OAuth credentials in Google Cloud Console
2. Setup environment variables
3. Turn the plugin on in `settings.json`
4. Add the matching plugin in the frontend app

## Dependencies

None. The plugin uses `axios` and `jsonwebtoken`, which are already installed.

## Environment variables

- `GOOGLE_CALLBACK_URL`: the callback on **this API**, eg `http://localhost:9000/auth/google/callback`
- `GOOGLE_CLIENT_ID`: the OAuth client id
- `GOOGLE_CLIENT_SECRET`: the OAuth client secret

`APP_BASE_URL` must point to the **frontend app**, because the user is redirected
there once the login is done.

The plugin stays disabled while `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` are
missing, even when `settings.json` says otherwise.

## How it works

The plugin never issues its own tokens. It proves who the user is and then calls
the same `issueTokens` function as the password login, with the same JWT payload.
Everything downstream (refresh token, cookie, roles, guards) is untouched.

```
GET /auth/google           redirects to the Google consent screen
GET /auth/google/callback  exchanges the code, resolves the account, sets the
                           refresh token cookie and redirects to the app
```

The access token is never put in a URL. The app calls `POST /refresh-token` on
landing and reads it from the cookie that was just set.

## Configuration

| Setting | Default | Description |
| --- | --- | --- |
| `enabled` | `false` | Master switch, the routes do not exist while this is off |
| `linking` | `auto` | `auto` links an existing confirmed account, `deny` refuses it |
| `allowSignup` | `true` | Create an account when the email address is unknown |
| `defaultRole` | `admin` | Discriminator used for accounts created by this plugin |
| `allowedDomains` | `[]` | Restrict logins to these email domains, empty means any |
| `activateOnClaim` | `true` | Activate an unconfirmed account when it is claimed |
| `unlockOnLogin` | `true` | Let a locked out account back in, like a password reset does |
| `successRedirect` | `/auth/google` | Frontend path after a successful login |
| `failureRedirect` | `/login` | Frontend path after a failed login |

## How an account is matched

The Google `sub` claim is the primary key, not the email address. A user who
changes their email address at Google still lands on the same account, and the
email address is only used the very first time.

| Situation | Action |
| --- | --- |
| `email_verified` is false | **deny**, nothing else is safe |
| Email domain not allowed | **deny** |
| The Google account is already linked | **login** |
| No account with this email address | **create** a new one, or **deny** when `allowSignup` is off |
| Account exists and is confirmed | **link** both login methods to it |
| Account exists and is not confirmed | **claim** it and invalidate its password |

### Why linking a confirmed account is safe

`email_verified` is a statement by Google that this user controls that mailbox.
Whoever controls the mailbox can already take over the account through the
forgot password flow, so linking adds no new power to an attacker.

### Why an unconfirmed account is claimed, not linked

This blocks pre-registration hijacking. An attacker signs up with somebody
else's email address and a password only they know, and never confirms it. When
the real owner later arrives through Google, a naive link would hand them an
account the attacker can still open. Claiming replaces the password with an
unusable one, which is exactly what clicking the confirmation link would do.

## Accounts without a password

Accounts created by this plugin get a random 96 character password nobody knows,
because the identity schema requires one. Those users can run the normal forgot
password flow to set a real one and end up with both login methods.

## Configuration in Google Cloud Console

- Navigate to the [Cloud Console](https://console.cloud.google.com) and create a new project
- Navigate to *APIs & Services -> OAuth consent screen*, pick **External** and add the `openid`, `email` and `profile` scopes
- Navigate to *Credentials -> Create credentials -> OAuth client ID* and pick **Web application**
- Add the authorized redirect URIs, they have to match `GOOGLE_CALLBACK_URL` exactly

```
http://localhost:9000/auth/google/callback
https://api.example.com/auth/google/callback
```

- Copy the client id and the client secret into your `.env` file
- Set `enabled` to `true` in `plugins/google-auth/settings.json`

After following these steps the Google button in the frontend app should work!

## Testing

The decision logic is a pure function, so all of its branches are covered
without a database or an HTTP call.

```bash
npm test
```

## Architecture

This plugin is composed as a middleware chain rather than one orchestrating
controller. The route is the policy:

```js
router.get(
  '/auth/google/callback',
  guards.verifyState,      // CSRF gate
  guards.exchangeCode,     // code    -> req.googleToken
  guards.readProfile,      // token   -> req.googleProfile
  guards.resolveIdentity,  // profile -> req.user
  guards.unlockLockout,    // plugin specific exception
  guards.accountActive,    // the SAME gate the password login uses
  guards.linkIdentity,
  controllers.callback     // mints tokens, nothing else
);
```

Three things follow from this shape:

- `req.user` is the only contract between an authentication method and the
  session. `middleware/credentials.js` fulfills it from an email and a password,
  `middleware/resolve-identity.js` fulfills it from a Google profile, and
  `controllers/identity/login.js` does not care which one ran.
- `accountActive` is imported from the app, not reimplemented here. A new login
  method cannot silently skip a check the password login enforces.
- Failures are handled by `middleware/handle-error.js`, mounted on
  `/auth/google` only. No `try/catch` in the controller, and errors from the
  rest of the API still render as JSON.

### The cost of this shape

`req.user` and `req.googleProfile` are implicit. They appear in no signature and
nothing verifies them, so reordering the chain or dropping a step breaks the
flow silently. That is exactly why `controllers/identity/login.js` starts with a
guard on `req.user`: it is the line that turns a broken chain into a loud
failure instead of a quiet one.

Middleware is the right tool for gates. It is a weaker tool for the main step of
a flow, because the data handoff is invisible.
