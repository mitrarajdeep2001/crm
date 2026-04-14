import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;
const HASH_PREFIX = "scrypt";

function toBuffer(value: string) {
  return Buffer.from(value, "hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `${HASH_PREFIX}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedPassword: string | null) {
  if (!storedPassword) {
    return { valid: false, needsRehash: false };
  }

  const [prefix, salt, hash] = storedPassword.split("$");
  if (prefix === HASH_PREFIX && salt && hash) {
    const computedHash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
    const valid =
      computedHash.length === hash.length &&
      timingSafeEqual(toBuffer(computedHash), toBuffer(hash));

    return { valid, needsRehash: false };
  }

  // Backward compatibility for existing plain-text demo users.
  if (storedPassword === password) {
    return { valid: true, needsRehash: true };
  }

  return { valid: false, needsRehash: false };
}
