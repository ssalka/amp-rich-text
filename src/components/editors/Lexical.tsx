import compact from 'lodash/compact';
import { useCallback, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { EditorState } from 'lexical';
import {
  $convertFromMarkdownString,
  TRANSFORMERS,
  type ElementTransformer,
} from '@lexical/markdown';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { jsonState, defaultText } from '@/content';
import ListMaxIndentLevelPlugin from './LexicalMaxPlugin';

import './Lexical.css';

const theme = {
  list: {
    nested: {
      listitem: 'lexical-nested-list-item',
    },
  },
};

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

  const nodes = compact(
    TRANSFORMERS.flatMap((t) => (t as ElementTransformer).dependencies)
  );

  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'MyEditor',
        editable: canEdit,
        theme,
        nodes,
        onError: (error) => console.error(error),
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
      <ReadonlyPlugin canEdit={canEdit} />
      <ListPlugin />
      <ListMaxIndentLevelPlugin />
    </LexicalComposer>
  );
}

export default Editor;

const SetInitialJsonPlugin = ({ setJson }: any) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    setJson(editor.getEditorState());
  }, [editor]);

  return null;
};

const ReadonlyPlugin = ({ canEdit = true }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(canEdit);
  }, [canEdit, editor]);

  return null;
};
