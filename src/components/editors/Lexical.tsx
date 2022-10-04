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

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error);
}

function Editor() {
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

      <OnChangePlugin onChange={handleChange} />
      <HistoryPlugin />
      <MyCustomAutoFocusPlugin />
    </LexicalComposer>
  );
}

export default Editor;
