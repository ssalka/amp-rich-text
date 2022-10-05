import clsx from 'clsx';
import { FC, useCallback, useState, type MouseEvent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { usePrevious } from 'react-use';
import { useRecoilValue } from 'recoil';

import CKEditor from '@/components/editors/CKEditor';
import Lexical from '@/components/editors/Lexical';
import Remirror from '@/components/editors/Remirror';
import Slate from '@/components/editors/Slate';
import Tiptap from '@/components/editors/Tiptap';
import EditorJs from './components/editors/EditorJs';

import { jsonState } from '@/content';

import './App.css';

const textEditors: Array<{ name: string; editor?: FC<{ canEdit?: boolean }> }> =
  [
    {
      // early fb project - too experimental?
      name: 'Lexical',
      editor: Lexical,
    },
    {
      // also an early project, but wraps prosemirror
      name: 'Tiptap',
      // comment out if using Remirror
      editor: Tiptap,
    },
    {
      // this is a very DIY library, in this example there's a toolbar
      // that *should* appear when you select text. it's sorta buggy
      name: 'Slate',
      editor: Slate,
    },
    {
      // using a wrapper library called remirror - for a pure prosemirror implementation,

      name: 'ProseMirror',
      // this editor conflicts somehow with tiptap - only have 1 at a time uncommented
      // editor: Remirror,
    },
    {
      name: 'CKEditor',
      editor: CKEditor,
    },
    // doesn't work, I guess
    // {
    //   name: 'Editor.js',
    //   editor: EditorJs,
    // },
  ];

type Editor = typeof textEditors[number];

function App() {
  const [selectedEditor, setSelectedEditor] = useState<Editor>(textEditors[0]);
  const selectEditor = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const nextEditor =
      textEditors[+(e.target as HTMLButtonElement).dataset.index!];
    setSelectedEditor(nextEditor);
  }, []);
  const previousEditor = usePrevious(selectedEditor);
  const editorJson = useRecoilValue(jsonState);
  const [canEdit, setCanEdit] = useState(true);

  return (
    <div className="App">
      <h1>Rich Text Editor Playground</h1>
      <div className="tabs">
        {textEditors.map(({ name, editor }, i) => (
          <button
            key={name}
            data-index={i}
            onClick={selectEditor}
            className={clsx({ selected: name === selectedEditor.name })}
            disabled={!editor}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="editor-main">
        <ErrorBoundary
          fallbackRender={({ resetErrorBoundary }) => {
            if (previousEditor?.name === 'Tiptap') {
              // Tiptap editor breaks on unmount due to bug with BubbleMenu plugin - prevent it from crashing the page
              resetErrorBoundary();
              return null;
            }

            return (
              <div>
                oops 🙈
                <br />
                {previousEditor?.name} crashed – switch to another tab and back
                again to get {selectedEditor.name} to render 😬
              </div>
            );
          }}
        >
          <div className={clsx('selected-editor', selectedEditor.name)}>
            {selectedEditor.editor ? (
              <selectedEditor.editor canEdit={canEdit} />
            ) : (
              `TODO: ${selectedEditor.name} editor`
            )}
          </div>
        </ErrorBoundary>
        <pre>{JSON.stringify(editorJson, null, 2)}</pre>
      </div>
      <br />
      <button
        onClick={() => setCanEdit(!canEdit)}
        style={{ alignSelf: 'start' }}
      >
        {canEdit ? 'disable editing' : 'readonly mode -- click to toggle'}
      </button>
    </div>
  );
}

export default App;
