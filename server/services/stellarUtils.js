import { createHash } from 'crypto';

export function serializeCredentialData(credentialData) {
  if (!credentialData) return '';
  return JSON.stringify(credentialData);
}

export function buildStellarDataValue(credentialData) {
  const payload = serializeCredentialData(credentialData);
  if (payload.length <= 64) {
    return payload;
  }
  return createHash('sha256').update(payload).digest('hex');
}

export function buildStellarDataKey(roadmapId) {
  const prefix = 'pulse_learn_receipt';
  return `${prefix}_${roadmapId}`.slice(0, 64);
}
