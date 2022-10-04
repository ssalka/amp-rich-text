import clsx from 'clsx';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import { useMount } from 'react-use';
import { useSetRecoilState } from 'recoil';

import isHotkey from 'is-hotkey';
import {
  Editor,
  Transforms,
  createEditor,
  Element as SlateElement,
} from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';

import { defaultText, jsonState } from '@/content';

import './Slate.css';

const useSlate = () => {
  const [editor] = useState(() => withHistory(withReact(createEditor())));
  return editor;
};

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: defaultText }],
  },
];

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

export const Portal = ({ children }: PropsWithChildren) => {
  return createPortal(children, document.body);
};

const HoveringToolbar = ({ editor, update }: any) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.isCollapsed || update === null) {
      el.style.opacity = '0';
      return;
    }

    const domRange = domSelection!.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    el.style.opacity = '1';
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight - 20}px`;
    el.style.left = `${
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
    }px`;
  }, [update, editor.selection]);

  return (
    <Portal>
      <div
        className="slate-toolbar"
        ref={ref}
        style={{
          opacity: 0,
          top: -10000,
          left: -10000,
        }}
      >
        <MarkButton editor={editor} format="bold" label="b" />
        <MarkButton editor={editor} format="italic" label="i" />
        <MarkButton editor={editor} format="underline" label="u" />
        <MarkButton editor={editor} format="code" label="</>" />
        <BlockButton editor={editor} format="heading-one" label="h1" />
        <BlockButton editor={editor} format="heading-two" label="h2" />
        <BlockButton editor={editor} format="block-quote" label=">" />
        <BlockButton editor={editor} format="numbered-list" label="1." />
        <BlockButton editor={editor} format="bulleted-list" label="&bull;" />
      </div>
    </Portal>
  );
};

const RichTextExample = () => {
  const setJson = useSetRecoilState(jsonState);
  const editor = useSlate();
  const [value] = useState(initialValue);
  // hacky way to trigger toolbar showing on type, click  etc
  const [update, setUpdate] = useState<boolean | null>(false);

  useMount(() => {
    setJson(value);
  });

  return (
    <Slate editor={editor} value={initialValue}>
      <HoveringToolbar editor={editor} update={update} />
      <Editable
        renderElement={Element}
        renderLeaf={Leaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onBlur={() => {
          setUpdate(null);
        }}
        onClick={() => {
          setUpdate(!update);
        }}
        onKeyDown={(event) => {
          setUpdate(!update);
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event as any)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey as keyof typeof HOTKEYS];
              toggleMark(editor, mark);
            }
          }
        }}
      />
    </Slate>
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties: Partial<SlateElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format, blockType = 'type') => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  );

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element = ({ attributes, children, element }) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const BlockButton = ({ format, label, editor }) => {
  return (
    <button
      className={clsx({
        selected: isBlockActive(
          editor,
          format,
          TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
        ),
      })}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {label}
    </button>
  );
};

const MarkButton = ({ format, label, editor }) => {
  return (
    <button
      className={clsx({ active: isMarkActive(editor, format) })}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {label}
    </button>
  );
};

export default RichTextExample;
