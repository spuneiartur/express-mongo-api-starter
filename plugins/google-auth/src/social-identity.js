import { model, Schema, Types } from 'mongoose';

/**
 * Links an identity to an account from an external login provider.
 * The provider id is the stable key, the email address is only informative.
 */
const name = 'social-identity';
const schema = new Schema(
  {
    provider: {
      type: String,
      required: true,
      default: 'google',
    },
    providerId: {
      type: String,
      required: true,
    },
    identity: {
      type: Types.ObjectId,
      required: true,
      get: (value) => value.toString(),
    },
    email: {
      type: String,
    },
    picture: {
      type: String,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  { autoCreate: false, timestamps: true }
);

schema.index({ provider: 1, providerId: 1 }, { unique: true });
schema.index({ identity: 1 });

export default model(name, schema);
