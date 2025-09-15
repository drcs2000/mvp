import Hashids from 'hashids';
import 'dotenv/config';

const salt = process.env.HASHID_SALT;

const minLength = 6;

const hashids = new Hashids(salt, minLength);

export const encodeId = (id: number): string => {
  return hashids.encode(id);
};

export const decodeId = (hash: string): number | null => {
  const numbers = hashids.decode(hash);
  if (Array.isArray(numbers) && numbers.length > 0) {
    return numbers[0] as number;
  }
  return null;
};
