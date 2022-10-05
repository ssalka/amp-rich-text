// missing TS types 😢
import { CKEditor } from '@ckeditor/ckeditor5-react';
// missing TS types 😢
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { useSetRecoilState } from 'recoil';
import { useEffect, useRef } from 'react';

import { defaultText, jsonState } from '@/content';

import './CKEditor.css';

// plugin already loaded? but it doesn't work
// console.log('InlineEditor.builtinPlugins', InlineEditor.builtinPlugins);
// InlineEditor.builtinPlugins.unshift(CodeBlock);

const readonlyId = '123';

export default ({ canEdit = true }) => {
  const setJson = useSetRecoilState(jsonState);
  const editor = useRef<any>();

  useEffect(() => {
    if (canEdit) {
      // FIXME this doesn't work??
      editor.current?.disableReadOnlyMode(readonlyId);
    } else {
      editor.current?.enableReadOnlyMode(readonlyId);
    }
  }, [canEdit, editor.current]);

  return (
    <CKEditor
      editor={InlineEditor}
      data="<p>Hello from CKEditor 5!</p>"
      onReady={(editor: any) => {
        editor.setData(defaultText);
        setJson(editor.getData());
        editor.current = editor;
      }}
      onChange={(event: any, editor: any) => {
        // NOTE: data is a string of HTML... not sure this will suffice
        // for custom elements like charts, cohorts etc
        const data = editor.getData();
        setJson(data);
      }}
      onBlur={(event: any, editor: any) => {
        editor.enableReadOnlyMode(readonlyId);
      }}
      onFocus={(event: any, editor: any) => {
        if (canEdit) {
          editor.disableReadOnlyMode(readonlyId);
        } else {
          editor.enableReadOnlyMode(readonlyId);
        }
      }}
    />
  );
};
