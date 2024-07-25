import { AutoformatRule } from '@udecode/plate-autoformat';
import { isBlock, setNodes } from '@udecode/plate-common';
import { ListStyleType, toggleIndentList } from '@udecode/plate-indent-list';
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  TTodoListItemElement,
} from '@udecode/plate-list';

export const autoformatIndentLists: AutoformatRule[] = [
  {
    mode: 'block',
    type: 'list',
    match: ['* ', '- '],
    format: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
    },
  },
  {
    mode: 'block',
    type: 'list',
    match: ['1. ', '1) '],
    format: (editor) =>
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      }),
  },
  {
    mode: 'block',
    type: 'list',
    match: ['[] ', '[ ] '],
    format: (editor) =>
      setNodes<TTodoListItemElement>(
        editor,
        { type: ELEMENT_TODO_LI, checked: false },
        {
          match: (n) => isBlock(editor, n),
        }
      ),
  },
  {
    mode: 'block',
    type: 'list',
    match: '[x] ',
    format: (editor) =>
      setNodes<TTodoListItemElement>(
        editor,
        { type: ELEMENT_TODO_LI, checked: true },
        {
          match: (n) => isBlock(editor, n),
        }
      ),
  },
];
