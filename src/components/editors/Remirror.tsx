import {
  BoldExtension,
  CalloutExtension,
  ItalicExtension,
} from 'remirror/extensions';
import { EditorComponent, Remirror, useRemirror } from '@remirror/react';
import 'remirror/styles/all.css';

import { defaultText } from '@/content';

const remirrorJsonFromStorage = {
  hash: '0',
  type: 'doc',
  content: [
    {
      hash: '1',
      type: 'paragraph',
      content: [{ hash: '2', type: 'text', text: defaultText }],
    },
  ],
};

export default () => {
  const { manager, state } = useRemirror({
    extensions: () => [
      new BoldExtension(),
      new ItalicExtension(),
      new CalloutExtension({ defaultType: 'warn' }), // Override defaultType: 'info'
    ],
    content: remirrorJsonFromStorage,
  });

  return (
    <div className="remirror-theme">
      {/* the className is used to define css variables necessary for the editor */}
      <Remirror manager={manager} initialContent={state}>
        <EditorComponent />
      </Remirror>
    </div>
  );
};
