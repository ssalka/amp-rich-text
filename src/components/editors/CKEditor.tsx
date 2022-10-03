// missing TS types 😢
import { CKEditor } from '@ckeditor/ckeditor5-react';
// missing TS types 😢
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { useSetRecoilState } from 'recoil';
import { defaultText, jsonState } from '@/content';

export default () => {
  const setJson = useSetRecoilState(jsonState);
  return (
    <CKEditor
      editor={InlineEditor}
      data="<p>Hello from CKEditor 5!</p>"
      onReady={(editor) => {
        console.log('Editor is ready to use', editor);
        editor.setData(defaultText);
        setJson(editor.getData());
      }}
      onChange={(event, editor) => {
        // NOTE: data is a string of HTML... not sure this will suffice
        // for custom elements like charts, cohorts etc
        const data = editor.getData();
        setJson(data);
      }}
      onBlur={(event, editor) => {
        console.log('Blur.', editor);
      }}
      onFocus={(event, editor) => {
        console.log('Focus.', editor);
      }}
    />
  );
};
