import { createReactEditorJS } from 'react-editor-js';
import { defaultText } from '@/content';

const ReactEditorJS = createReactEditorJS();

const initialBlocks = {
  blocks: [
    {
      type: 'paragraph',
      data: {
        text: defaultText,
        level: 2,
      },
    },
  ],
};

export default () => {
  return <ReactEditorJS value={initialBlocks} />;
};
