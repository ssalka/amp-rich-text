import clsx from 'clsx';
import camelCase from 'lodash/camelCase';
import times from 'lodash/times';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { markInputRule, type JSONContent } from '@tiptap/core';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import Bold from '@tiptap/extension-bold';
import Italic, {
  // by default *sdf* creates italic text, however we want it to be bold
  starInputRegex as boldInputRegex,
  // only _sdf_ will be treated as italic text
  underscoreInputRegex as italicInputRegex,
} from '@tiptap/extension-italic';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Level } from '@tiptap/extension-heading';
import { defaultMarkdownParser } from 'prosemirror-markdown';
import { RemoveMarkStep, ReplaceStep } from 'prosemirror-transform';
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
          // overridden to customize input rules
          bold: false,
          // overridden to customize input rules
          italic: false,
          paragraph: {
            HTMLAttributes: {
              style: 'margin: 0;',
            },
          },
        }),
        Bold.extend({
          addInputRules() {
            return [
              markInputRule({
                find: boldInputRegex,
                type: this.type,
              }),
            ];
          },
        }),
        Italic.extend({
          addInputRules() {
            return [
              markInputRule({
                find: italicInputRegex,
                type: this.type,
              }),
            ];
          },
        }),
        Link.extend({
          addKeyboardShortcuts() {
            return {
              'Mod-k': () => {
                // TODO replace with popover
                const href = prompt('Enter URL or clear to remove link:');
                return href
                  ? this.editor.commands.setLink({ href })
                  : this.editor.commands.unsetLink();
              },
              'Shift-Mod-k': () => this.editor.commands.unsetLink(),
            };
          },
        }).configure({
          autolink: true,
          openOnClick: false,
        }),
      ],
      editorProps: {
        attributes: {
          class: 'tiptap-editor',
        },
      },
      onUpdate({ editor, transaction }) {
        const { steps, storedMarks } = transaction;
        const isCodeMarkContinuedOnNewLine =
          steps.length === 1 &&
          steps[0] instanceof ReplaceStep &&
          storedMarks?.[0]?.type.name === 'code';

        /**
         * BUG on editor load, if the document ends with a code mark,
         * entering a new line preserves the code mark, preventing other
         * markdown shortcuts from taking effect (notably `* `).
         * HACK To prevent this, we unset the code mark on the new line.
         * NOTE this bug doesn't happen with regular user input 👍
         */
        if (isCodeMarkContinuedOnNewLine) {
          console.log('unsetting code on new line');
          editor.commands.unsetCode();
        }

        const isUndoOfSingleCharAutoFormatting =
          steps.length === 2 &&
          steps[0] instanceof RemoveMarkStep &&
          steps[1] instanceof ReplaceStep;

        if (isUndoOfSingleCharAutoFormatting) {
          console.log('reapplying trailing character');
          // HACK referencing `steps[1].slice.content[0].text` directly somehow has a side effect
          const res = JSON.parse(JSON.stringify(steps[1]));
          editor.commands.insertContent(res.slice.content[0].text);
        }

        setJson(editor.getJSON());
      },
      onFocus({ editor }) {
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
      editor.commands.unsetCode();
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
