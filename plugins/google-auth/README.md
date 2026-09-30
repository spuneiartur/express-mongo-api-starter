# Google Auth Plugin

Optional "Login with Google" for the existing JWT authentication.

Quick start

1. Create the OAuth credentials in Google Cloud Console
2. Setup environment variables
3. Turn the plugin on in `settings.json`
4. Add the matching plugin in the frontend app

## Dependencies

None. The plugin uses `axios` and `jsonwebtoken`, which are already installed.

## Footprint

This plugin is additive. Everything it needs lives in this folder, and the app
was touched in exactly three places:

| File | Change |
| --- | --- |
| `router.js` | two lines: import the plugin list and `router.use(plugins)` |
| `.env.template` | three variable names |
| `.env.example` | the same three, empty by default |

Nothing else. `controllers/identity/login.js`, `controllers/identity/refresh-token.js`,
`models/identity.ts`, `routes/identity.js` and the `middleware` folder are
untouched, so a project that already runs on this template can take the plugin
without revisiting its login flow.

Removing the plugin is deleting this folder and taking it out of
`plugins/index.js`. The two lines in `router.js` stay and cost nothing.

## Environment variables

- `GOOGLE_CALLBACK_URL`: the callback on **this API**, eg `http://localhost:9000/auth/google/callback`
- `GOOGLE_CLIENT_ID`: the OAuth client id
- `GOOGLE_CLIENT_SECRET`: the OAuth client secret

`APP_BASE_URL` must point to the **frontend app**, because the user is redirected
there once the login is done.

The plugin stays disabled while `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` are
missing, even when `settings.json` says otherwise.

## How it works

The plugin proves who the user is and then opens a session with the same claims,
the same expiry and the same refresh cookie as the password login. Everything
downstream (refresh token, roles, route guards, the frontend) is untouched and
cannot tell the two apart.

```
GET /auth/google           redirects to the Google consent screen
GET /auth/google/callback  exchanges the code, resolves the account, sets the
                           refresh token cookie and redirects to the app
```

The access token is never put in a URL. The app calls `POST /refresh-token` on
landing and reads it from the cookie that was just set.

## Keeping in sync with the login controller

`src/issue-tokens.js` is a deliberate copy of the token logic in
`controllers/identity/login.js`. That copy is the price of not modifying the
app's login flow, and it is contained in one file on purpose.

Three things have to stay identical, or a Google session will behave differently
from a password session:

- the payload claims: `{ name, email, role, me }`
- the two expiry times: `15m` for the access token, `12h` for the refresh token
- the cookie options, above all `signed`, `httpOnly` and `sameSite`

If your project adds a claim to the JWT payload in the login controller, add it
here too.

### Removing the duplication, if you want to

When you are willing to change the login controller, move the body of
`src/issue-tokens.js` into `functions/issue-tokens.js`, export it from
`functions/index.ts`, and have both the login controller and this plugin call
it. The plugin then imports `{ issueTokens } from '@functions'` and
`src/issue-tokens.js` can be deleted. That is a better end state, it is simply
not free for projects already in production.

## Recommended before you enable it

The identity schema has **no unique index on the email address**, so two
identities can share one. `Identity.findOne({ email })` then returns an
arbitrary one, in the login controller as well as here. Matching an account by
email is only sound with that index in place.

Check for duplicates first:

```js
db.identities.aggregate([
  { $group: { _id: '$email', n: { $sum: 1 } } },
  { $match: { n: { $gt: 1 } } },
]);
```

Then, in `models/identity.ts`:

```js
schema.index({ email: 1 }, { unique: true });
```

This is a recommendation, not a requirement of the plugin, which is why it is
not part of it.

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
- Under **Google Auth Platform -> Branding**, fill in the app name and support email
- Under **Audience**, pick `External`, or `Internal` for a single Workspace domain
- Under **Data access**, add the `openid`, `email` and `profile` scopes. They are
  non sensitive, so the app needs no verification from Google
- Under **Clients**, create a client of type **Web application**
- Add the authorized redirect URIs, they have to match `GOOGLE_CALLBACK_URL` exactly

```
http://localhost:9000/auth/google/callback
https://api.example.com/auth/google/callback
```

You do not need authorized JavaScript origins, and you do not need to enable any
API: the name and the picture arrive inside the identity token.

- Copy the client id and the client secret into your `.env` file
- Set `enabled` to `true` in `plugins/google-auth/settings.json`

Changes in the console can take from five minutes to a few hours to apply.

## Testing

The decision logic is a pure function, so all of its branches are covered
without a database or an HTTP call.

```bash
npm test
```
