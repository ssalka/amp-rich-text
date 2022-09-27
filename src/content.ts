import { atom } from 'recoil';

export const defaultText = 'Hello world!';

type Json = unknown;

export const jsonState = atom<Json>({
  key: 'json',
  default: {},
});
