import clsx from 'clsx';
import camelCase from 'lodash/camelCase';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { defaultMarkdownParser } from 'prosemirror-markdown';

import { defaultText, jsonState } from '@/content';

import './Tiptap.css';

const markMap = {
  em: 'italic',
};

// TODO: fix empty lines being removed
function mdToJson(doc: any) {
  return {
    type: camelCase(doc.type.name),
    ...(doc.attrs && { attrs: doc.attrs }),
    ...(doc.type.name === 'text'
      ? {
          text: doc.text,
          marks: doc.marks.map((m: any) => ({
            type: markMap[m.type.name] || m.type.name,
            attrs: m.attrs,
          })),
          ...(doc.attrs && { attrs: doc.attrs }),
        }
      : {
          content: doc.content.content.map(mdToJson),
        }),
  };
}
console.log(defaultMarkdownParser.parse(defaultText));
console.log(mdToJson(defaultMarkdownParser.parse(defaultText)));

// BUG BubbleMenu breaks on unmount https://github.com/ueberdosis/tiptap/issues/3135
export default () => {
  const setJson = useSetRecoilState(jsonState);
  const editor = useEditor({
    content: mdToJson(defaultMarkdownParser.parse(defaultText)),
    // content: rawDoc,
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            style: 'margin: 0;',
          },
        },
      }),
      Link.configure({ autolink: true }).extend({
        addKeyboardShortcuts() {
          return {
            // TODO open popover here where user can set link URL + text
            'Mod-k': () =>
              this.editor.commands.setLink({ href: 'https://amplitude.com' }),
          };
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
