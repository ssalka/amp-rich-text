import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { defaultText, jsonState } from '@/content';

const useSlate = () => {
  const [editor] = useState(() => withReact(createEditor()));
  return editor;
};

export default () => {
  const setJson = useSetRecoilState(jsonState);
  const editor = useSlate();
  const [value] = useState([
    {
      type: 'paragraph',
      children: [{ text: defaultText }],
    },
  ]);

  return (
    <Slate editor={editor} value={value} onChange={setJson}>
      {/*
        all formatting is defined by us and determined by
        the Editable props renderElement and renderLeaf
      */}
      <Editable />
    </Slate>
  );
};
