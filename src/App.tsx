import { useCallback, useState, type MouseEvent } from 'react';
import clsx from 'clsx';
import './App.css';

const textEditors = [
  {
    name: 'Tiptap',
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
];

function App() {
  const [selectedEditor, setSelectedEditor] = useState(textEditors[0]);
  const selectEditor = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const nextEditor =
      textEditors[+(e.target as HTMLButtonElement).dataset.index!];
    setSelectedEditor(nextEditor);
  }, []);

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
      <div className="selected-editor">TODO: {selectedEditor.name} editor</div>
    </div>
  );
}

export default App;
