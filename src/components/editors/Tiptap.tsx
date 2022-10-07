import clsx from 'clsx';
import camelCase from 'lodash/camelCase';
import times from 'lodash/times';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import type { JSONContent } from '@tiptap/core';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Level } from '@tiptap/extension-heading';
import { defaultMarkdownParser } from 'prosemirror-markdown';
import type { Node } from 'prosemirror-model';

import { defaultText, jsonState } from '@/content';

import './Tiptap.css';

const markMap: Partial<Record<string, string>> = {
  em: 'italic',
};

// TODO: fix empty lines being removed
function mdToJson(doc: Node): JSONContent {
  return {
    type: camelCase(doc.type.name),
    ...(doc.attrs && { attrs: doc.attrs }),
    ...(doc.type.name === 'text'
      ? {
          text: doc.text,
          marks: doc.marks.map((m) => ({
            ...m,
            // tiptap plugins use *some* different type names - use those
            // from markMap, else use the default prosemirror name
            type: markMap[m.type.name] || m.type.name,
          })),
        }
      : {
          // something about the type defs here is off
          content: (doc.content as unknown as { content: Node[] }).content.map(
            mdToJson
          ),
        }),
  };
}

export default ({ canEdit = true }) => {
  const setJson = useSetRecoilState(jsonState);
  const editor = useEditor(
    {
      content: mdToJson(defaultMarkdownParser.parse(defaultText)!),
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
      onFocus({ editor }) {
        console.log('focus', canEdit);
        editor.setEditable(canEdit);
      },
      onBlur({ editor }) {
        editor.setEditable(false);
      },
    },
    [canEdit]
  );

  useEffect(() => {
    if (editor) {
      setJson(editor.getJSON());
    }
  }, [editor]);

  return (
    <div className="tiptap-container">
      {editor && (
        // BUG BubbleMenu breaks on unmount https://github.com/ueberdosis/tiptap/issues/3135
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="tiptap-toolbar">
            <select
              onChange={(e) =>
                e.target.options[e.target.selectedIndex].value === 'text'
                  ? editor.chain().focus().setParagraph().run()
                  : editor
                      .chain()
                      .focus()
                      .setHeading({
                        level: parseInt(
                          e.target.options[e.target.selectedIndex].value
                        ) as Level,
                      })
                      .run()
              }
            >
              <option
                value="text"
                className={clsx({ selected: editor.isActive('h1') })}
                label="⁋"
              />
              {times(6, (i) => (
                <option
                  key={i}
                  value={i + 1}
                  className={clsx({ selected: editor.isActive(`h${i + 1}`) })}
                  label={`h${i + 1}`}
                />
              ))}
            </select>
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={clsx({ selected: editor.isActive('bold') })}
            >
              b
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={clsx({ selected: editor.isActive('italic') })}
            >
              i
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={clsx({ selected: editor.isActive('strike') })}
            >
              s
            </button>
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};
