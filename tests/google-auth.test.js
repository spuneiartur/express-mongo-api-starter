import resolveIdentity from '@plugins/google-auth/src/resolve-action';
import { expect } from 'chai';
import { it } from 'mocha';

const profile = {
  domain: 'email.com',
  email: 'michael@email.com',
  name: 'Michael Scott',
  picture: 'https://lh3.googleusercontent.com/a/example',
  providerId: '110169484474386276334',
  verified: true,
};

const config = { allowSignup: true, allowedDomains: [], linking: 'auto' };
const confirmed = { confirmed: true, active: true };
const unconfirmed = { confirmed: false, active: false };

export default function () {
  it('denies unverified email addresses', function () {
    const google = { ...profile, verified: false };
    const result = resolveIdentity(google, { link: null, identity: confirmed }, config);

    expect(result.action).to.equal('deny');
    expect(result.reason).to.equal('email-not-verified');
  });

  it('denies email domains outside the allowed list', function () {
    const restricted = { ...config, allowedDomains: ['chesscoders.com'] };
    const result = resolveIdentity(profile, { link: null, identity: null }, restricted);

    expect(result.action).to.equal('deny');
    expect(result.reason).to.equal('domain-not-allowed');
  });

  it('logs in on the provider id, ignoring the email address', function () {
    const google = { ...profile, email: 'changed@email.com', domain: 'email.com' };
    const link = { identity: 'abc123', providerId: profile.providerId };
    const result = resolveIdentity(google, { link, identity: confirmed }, config);

    expect(result.action).to.equal('login');
  });

  it('creates an account when the email address is unknown', function () {
    const result = resolveIdentity(profile, { link: null, identity: null }, config);

    expect(result.action).to.equal('create');
  });

  it('denies unknown email addresses when signup is disabled', function () {
    const closed = { ...config, allowSignup: false };
    const result = resolveIdentity(profile, { link: null, identity: null }, closed);

    expect(result.action).to.equal('deny');
    expect(result.reason).to.equal('no-account');
  });

  it('links a confirmed account with the same email address', function () {
    const result = resolveIdentity(profile, { link: null, identity: confirmed }, config);

    expect(result.action).to.equal('link');
  });

  it('claims an unconfirmed account instead of linking it', function () {
    const result = resolveIdentity(profile, { link: null, identity: unconfirmed }, config);

    expect(result.action).to.equal('claim');
  });

  it('denies existing accounts when linking is turned off', function () {
    const strict = { ...config, linking: 'deny' };
    const result = resolveIdentity(profile, { link: null, identity: confirmed }, strict);

    expect(result.action).to.equal('deny');
    expect(result.reason).to.equal('email-in-use');
  });
}
