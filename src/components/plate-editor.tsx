'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@udecode/cn';
import { CommentsProvider } from '@udecode/plate-comments';
import { Plate, Value } from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Element, ElementSaveData } from '@/types/element';
import { ExamAttr } from '@/types/exam';
import { commentsUsers, myUserId } from '@/lib/plate/comments';
import { MENTIONABLES } from '@/lib/plate/mentionables';
import { plugins } from '@/lib/plate/plate-plugins';
import { CommentsPopover } from '@/components/plate-ui/comments-popover';
import { CursorOverlay } from '@/components/plate-ui/cursor-overlay';
import { Editor } from '@/components/plate-ui/editor';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';
import { MentionCombobox } from '@/components/plate-ui/mention-combobox';

import { useEditorContext } from './context/editor';

const initialValue = [
  {
    id: '1',
    type: ELEMENT_PARAGRAPH,
    children: [{ text: '' }],
  },
];

export default function PlateEditor() {
  const { elemSave, setElemSave, attr, setAttr, autosave, setStatus, status } =
    useEditorContext();
  const [blocks, setBlocks] = useState<Value>(initialValue);
  const containerRef = useRef(null);
  const path = usePathname();
  const id = path.split('/').pop()!;
  const [ready, setReady] = useState(false);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    const f = async () => {
      const sreq = await fetch(
        //block
        `https://storage.googleapis.com/sandbox-35d1d.appspot.com/WebExam%2Feditor%2F${id}_save.json?ignoreCache=1`
      );
      if (sreq.status === 200) {
        const save = await sreq.json();
        setBlocks(save);
      }
      setStatus('saved');
      setReady(true);
    };
    f();
  }, [id]);

  const get = useCallback(
    (i: number) => {
      return blocks[Math.min(i, blocks.length - 1)];
    },
    [blocks]
  );

  const identify = useCallback(
    (i: number): Element | undefined => {
      const block = get(i);
      if (!(block.type === 'h2')) return undefined;

      const point =
        (get(i + 1).type === 'p' &&
          !isNaN(parseFloat(get(i + 1).children[0].text as string)) &&
          parseFloat(get(i + 1).children[0].text as string)) ||
        0;
      // except for first one
      const tags = (get(i + 1).children[0].text as string)
        .trim()
        .split(',')
        .slice(1);

      let element: Element = {
        id: block.id as string,
        type: undefined,
        title: block.children[0].text as string,
        point: point,
        options: [],
        questions: [],
        answers: [],
        telems: [],
        tags: tags,
      };
      // check if bold in mardown
      const bold = block.children[0].bold as boolean;
      let hasList = false;
      let hasActionItem = false;
      let qn = 0; //question number from 1
      let on = 0; //option number
      let answers: number[] = [];
      loop: for (let j = i + 1; j < blocks.length; j++) {
        const next = get(j);
        sw: switch (next.type) {
          case 'p':
            if (next.listStyleType === 'disc') {
              element.questions.push(next.children[0].text as string);
              hasList = true;
              if (answers.length > 0) element.answers.push(answers as never);
              answers = [];
              on = 0;
              qn++;
            } else if (
              !(
                !isNaN(parseFloat(next.children[0].text as string)) &&
                parseFloat(next.children[0].text as string)
              ) &&
              next.children[0].text !== ''
            ) {
              element.telems.push(next);
            }
            break;
          case 'action_item':
            hasActionItem = true;
            on++;
            if (qn <= 1) {
              element.options.push(next.children[0].text as string);
            }
            if (next.checked) answers.push(on);
            break;
          case 'h2':
            break loop;
          default:
            element.telems.push(next);
            break;
        }
      }
      if (element.answers.length === 0) element.answers = answers;
      else element.answers.push(answers as never);
      if (bold) {
        element.type = 'paragraph';
        element.answers = element.questions;
        element.questions = [];
        return element;
      }
      if (hasList) {
        if (hasActionItem) {
          element.type = 'matrix';
          return element;
        }
      } else {
        if (hasActionItem) {
          element.type = 'radio';
          return element;
        }
      }
      element.type = 'text';
      element.answers = element.questions;
      element.questions = [];
      return element;
    },
    [blocks.length, get]
  );

  // updated with useEffect
  useEffect(() => {
    if (!changed) return;
    setStatus('unsaved');
    if (!autosave) return;

    const processBlocks = () => {
      if (blocks.length <= 1) return; //!isMounted omitted
      setStatus('saving');
      setTimeout(_processBlocks, 100); // seconds
    };

    const _processBlocks = () => {
      let _elements = blocks.map((block, i) => {
        switch (block.type) {
          // case 'h1':
          //   return (
          //     <h1
          //       key={i}
          //       className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-5xl"
          //     >
          //       {block.children[0].text as string}
          //     </h1>
          //   );
          case 'h2':
            let elem = identify(i);
            if (!elem) return undefined;
            return elem;
          default:
            return undefined;
        }
      });
      //filter null
      let elements: Element[] = _elements.filter((e) => {
        return e !== undefined;
      }) as Element[];
      const elemSave: ElementSaveData = {
        id: id,
        title: blocks[0].children[0].text as string,
        elements: elements,
        updatedAt: new Date(),
      };
      setElemSave(elemSave);

      let bstr = JSON.stringify(blocks);
      let estr = JSON.stringify(elemSave);
      //convert this as text file
      let bblob = new Blob([bstr], { type: 'text/plain' });
      let eblob = new Blob([estr], { type: 'text/plain' });
      const formData = new FormData();
      formData.append('save', bblob, `${id}_save.json`);
      formData.append('elem', eblob, `${id}_elem.json`);
      const f = async () => {
        console.log('uploading');
        const res = await (
          await fetch('/api/editor', {
            method: 'PUT',
            body: formData,
          })
        ).json();
        if (res.status === 'success') {
          console.log(res.surl);
          setStatus('saved');
        } else {
          console.error(res);
          setStatus('error');
        }
        if (!attr) return;
        const newAttr: ExamAttr = {
          id: id,
          title: elemSave.title,
          status: attr.status,
          owner: attr.owner,
          createdAt: attr.createdAt,
          lastEditedAt: new Date(),
          elemRef: attr.elemRef,
          saveRef: attr.saveRef,
          timeLimit: attr.timeLimit,
          examStartAt: attr.examStartAt,
          examEndAt: attr.examEndAt,
        };
        setAttr(newAttr);
      };
      f();
      setChanged(false);
    };

    const timeoutId = setTimeout(processBlocks, 2000); // seconds
    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    attr,
    autosave,
    blocks,
    changed,
    id,
    identify,
    setAttr,
    setElemSave,
    setStatus,
  ]);

  if (!ready) return <div>loading...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <CommentsProvider users={commentsUsers} myUserId={myUserId}>
        <Plate
          plugins={plugins}
          initialValue={blocks}
          onChange={(b) => {
            setBlocks(b);
            setChanged(true);
          }}
        >
          <div
            ref={containerRef}
            className={cn(
              'relative',
              // Block selection
              '[&_.slate-start-area-left]:!w-[64px] [&_.slate-start-area-right]:!w-[64px] [&_.slate-start-area-top]:!h-4'
            )}
          >
            <FixedToolbar>
              <FixedToolbarButtons />
            </FixedToolbar>

            <Editor
              className="px-[96px] py-16"
              autoFocus
              focusRing={false}
              variant="ghost"
              size="md"
            />

            <FloatingToolbar>
              <FloatingToolbarButtons />
            </FloatingToolbar>

            <MentionCombobox items={MENTIONABLES} />

            <CommentsPopover />

            <CursorOverlay containerRef={containerRef} />
          </div>
        </Plate>
      </CommentsProvider>
    </DndProvider>
  );
}
