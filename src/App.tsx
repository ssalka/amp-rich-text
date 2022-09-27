import clsx from 'clsx';
import { lazy, useCallback, useState, type MouseEvent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { usePrevious } from 'react-use';
import { useRecoilValue } from 'recoil';

import Slate from '@/components/editors/Slate';
import Tiptap from '@/components/editors/Tiptap';
import { jsonState } from '@/content';

import './App.css';

const textEditors = [
  {
    name: 'Tiptap',
    editor: Tiptap,
  },
  {
    name: 'Slate',
    editor: Slate,
  },
  {
    name: 'Lexical',
  },
  {
    name: 'ProseMirror',
  },
  {
    name: 'CKEditor',
  },
  {
    name: 'TinyMCE',
  },
] as const;

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

  return (
    <div className="App">
      <h1>Rich Text Editor Playground</h1>
      <div className="tabs">
        {textEditors.map((editor, i) => (
          <button
            key={editor.name}
            data-index={i}
            onClick={selectEditor}
            className={clsx({ selected: editor.name === selectedEditor.name })}
          >
            {editor.name}
          </button>
        ))}
      </div>
      <div className="editor-main">
        <ErrorBoundary
          fallbackRender={({ resetErrorBoundary }) => {
            if (previousEditor?.name === 'Tiptap') {
              // Tiptap editor breaks on unmount - prevent it from crashing the page
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
          <div className="selected-editor">
            {'editor' in selectedEditor && selectedEditor.editor ? (
              <selectedEditor.editor />
            ) : (
              `TODO: ${selectedEditor.name} editor`
            )}
          </div>
        </ErrorBoundary>
        <pre>{JSON.stringify(editorJson, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App;
