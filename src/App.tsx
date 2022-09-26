import clsx from 'clsx';
import { lazy, useCallback, useState, type MouseEvent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { usePrevious } from 'react-use';

import './App.css';

const textEditors = [
  {
    name: 'Tiptap',
    editor: lazy(() => import('./components/editors/Tiptap')),
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
  {
    name: 'Slate',
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
    </div>
  );
}

export default App;
