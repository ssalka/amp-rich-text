// missing TS types 😢
import { CKEditor } from '@ckeditor/ckeditor5-react';
// missing TS types 😢
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { useSetRecoilState } from 'recoil';
import { defaultText, jsonState } from '@/content';

import './CKEditor.css';

export default () => {
  const setJson = useSetRecoilState(jsonState);
  return (
    <CKEditor
      editor={InlineEditor}
      data="<p>Hello from CKEditor 5!</p>"
      onReady={(editor: any) => {
        editor.setData(defaultText);
        setJson(editor.getData());
      }}
      onChange={(event: any, editor: any) => {
        // NOTE: data is a string of HTML... not sure this will suffice
        // for custom elements like charts, cohorts etc
        const data = editor.getData();
        setJson(data);
      }}
      onBlur={(event: any, editor: any) => {
        console.log('Blur.', editor);
      }}
      onFocus={(event: any, editor: any) => {
        console.log('Focus.', editor);
      }}
    />
  );
};
