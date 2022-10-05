import { useCallback, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { EditorState } from 'lexical';
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { jsonState, defaultText } from '@/content';

import './Lexical.css';

const theme = {
  // Theme styling goes here
};

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error);
}

function Editor({ canEdit = true }) {
  const setJson = useSetRecoilState(jsonState);

  const handleChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        // Read the contents of the EditorState here.
        // const root = $getRoot();
        // const selection = $getSelection();
        setJson(editorState);
      });
    },
    [setJson]
  );

  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'MyEditor',
        editable: canEdit,
        theme,
        onError,
        nodes: TRANSFORMERS.flatMap((t) => t.dependencies).filter(Boolean),
        editorState: () =>
          // ready-to-go load from markdown 👀
          $convertFromMarkdownString(defaultText, TRANSFORMERS),
      }}
    >
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<></>}
      />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <SetInitialJsonPlugin setJson={setJson} />
      <OnChangePlugin onChange={handleChange} />
      <HistoryPlugin />
    </LexicalComposer>
  );
}

export default Editor;

const SetInitialJsonPlugin = ({ setJson }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    setJson(editor.getEditorState());
  }, [editor]);

  return null;
};
