import { useSetRecoilState } from 'recoil';
import { useCallback, useEffect, type FC, type PropsWithChildren } from 'react';
import { useToggle } from 'react-use';
import { PlaceholderExtension, wysiwygPreset } from 'remirror/extensions';
import {
  FloatingToolbar,
  useHelpers,
  EditorComponent,
  Remirror,
  TableComponents,
  ThemeProvider,
  useRemirror,
} from '@remirror/react';
import { TableExtension } from '@remirror/extension-react-tables';
import { MarkdownExtension } from '@remirror/extension-markdown';

import 'remirror/styles/all.css';
import './Remirror.css';

import { defaultText, jsonState } from '@/content';

const remirrorJsonFromStorage = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: defaultText }],
    },
  ],
};

// the insertMarkdown hook is getting run twice?? why?
let ranOnce = false;

const WysiwygEditor: FC<PropsWithChildren<any>> = ({
  placeholder,
  stringHandler,
  canEdit,
  children,
  ...rest
}) => {
  const extensions = useCallback(
    () => [
      new PlaceholderExtension({ placeholder }),
      new TableExtension(),
      new MarkdownExtension(),
      ...wysiwygPreset(),
    ],
    [placeholder]
  );
  // hacky way of updating JSON view because setting from onChange's state.doc has circular JSON??
  const [update, toggle] = useToggle(false);

  const { manager } = useRemirror({ extensions, stringHandler });

  useEffect(() => {
    if (!ranOnce) {
      manager.store.commands.insertMarkdown(defaultText);
      ranOnce = true;
    }

    return () => {
      setTimeout(() => {
        ranOnce = false;
      });
    };
  }, []);

  return (
    <ThemeProvider>
      <Remirror
        editable={canEdit}
        initialContent={[]}
        manager={manager}
        onChange={() => toggle()}
        {...rest}
      >
        <EditorComponent />
        {canEdit && <FloatingToolbar />}
        <TableComponents />
        {children}
        <RemirrorInner update={update} />
      </Remirror>
    </ThemeProvider>
  );
};

const RemirrorInner = ({ update }: any) => {
  const setJson = useSetRecoilState(jsonState);
  const { getJSON } = useHelpers();

  useEffect(() => {
    setJson(getJSON());
  }, [setJson, update]);

  return null;
};

export default WysiwygEditor;
