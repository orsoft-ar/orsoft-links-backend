import { RESERVED_USERNAMES } from '../constants/reserved-usernames';

const USERNAME_REGEX = /^[a-z0-9_-]+$/;

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string): boolean {
  return value.length >= 3 && value.length <= 30 && USERNAME_REGEX.test(value);
}

export function isReservedUsername(value: string): boolean {
  return RESERVED_USERNAMES.includes(normalizeUsername(value));
}