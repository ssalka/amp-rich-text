import clsx from 'clsx';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { defaultText, jsonState } from '@/content';

import './Tiptap.css';
// BUG BubbleMenu breaks on unmount https://github.com/ueberdosis/tiptap/issues/3135

export default () => {
  const setJson = useSetRecoilState(jsonState);
  const editor = useEditor({
    content: defaultText,
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            style: 'margin: 0;',
          },
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
    onUpdate({ editor }) {
      setJson(editor.getJSON());
    },
  });

  useEffect(() => {
    if (editor) {
      setJson(editor.getJSON());
    }
  }, [editor]);

  return (
    <>
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="tiptap-toolbar">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={clsx({ selected: editor.isActive('bold') })}
            >
              bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={clsx({ selected: editor.isActive('italic') })}
            >
              italic
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={clsx({ selected: editor.isActive('strike') })}
            >
              strike
            </button>
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </>
  );
};
