import { atom } from 'recoil';

export const defaultText = 'Hello world!';

export const jsonState = atom<Record<string, unknown>>({
  key: 'json',
  default: {},
});
