import { atom } from 'recoil';

export const defaultText = `
### Hello world!

This is a paragraph

* bulleted list
* item #2 [link](https://amplitude.com/)

_sdf_

\`sdf\`
`;

type Json = unknown;

export const jsonState = atom<Json>({
  key: 'json',
  default: {},
});
