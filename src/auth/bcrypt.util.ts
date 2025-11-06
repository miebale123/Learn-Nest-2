// src/common/utils/bcrypt.util.ts
import * as bcrypt from 'bcrypt';

export async function hash(value: string): Promise<string> {
  return await bcrypt.hash(value, Number(process.env.BCRYPT_ROUNDS) || 12);
}

export async function compare(raw: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(raw, hashed);
}
