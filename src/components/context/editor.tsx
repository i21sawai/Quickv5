'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { makeid } from '@/utils/str';
import { PlateStoreState, TNode, TText, Value } from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

import { Element, ElementSaveData } from '@/types/element';

export interface EditorContextValue {
  id: string;
  blocks: Value;
  setBlocks: (text: Value) => void;
  elemSave: ElementSaveData | undefined;
  setElemSave: (elements: ElementSaveData) => void;
  ready: boolean;
}

export const EditorContext = createContext<EditorContextValue | undefined>(
  undefined
);

export const useEditorContext = () => {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error(
      'useEditorContext must be used within an EditorContextProvider'
    );
  }

  return context;
};

export interface EditorContextProviderProps {
  children: ReactNode;
}

const initialValue = [
  {
    id: '1',
    type: ELEMENT_PARAGRAPH,
    children: [{ text: '' }],
  },
];

export const EditorContextProvider = ({
  children,
}: EditorContextProviderProps) => {
  const path = usePathname();
  const id = path.split('/').pop() || '';
  const page = path.split('/').slice(-2, -1)[0];
  const [blocks, setBlocks] = useState<Value>(initialValue); //(() => {
  const [ready, setReady] = useState(false);
  //   if (typeof window === 'undefined') {
  //     return initialValue;
  //   }
  //   const blocks = await fetch(`https://storage.googleapis.com/sandbox-35d1d.appspot.com/WebExam%2Feditor%2F${id}_save.json`)
  //   if (blocks) {
  //     return JSON.parse(blocks);
  //   }
  //   return initialValue;
  // });f
  useEffect(() => {
    console.log(path, id);
    const f = async () => {
      const sreq = await fetch(
        `https://storage.googleapis.com/sandbox-35d1d.appspot.com/WebExam%2Feditor%2F${id}_save.json?ignoreCache=1`
      );
      const ereq = await fetch(
        `https://storage.googleapis.com/sandbox-35d1d.appspot.com/WebExam%2Feditor%2F${id}_elem.json?ignoreCache=1`
      );
      if (sreq.status === 200 && ereq.status === 200) {
        const save = await sreq.json();
        setBlocks(save);
        let elem = (await ereq.json()) as ElementSaveData;
        if (page === 'exam') {
          //delete answer
          elem.elements = elem.elements.map((e: Element) => {
            if (!e) return e;
            e.answers = [];
            return e;
          });
        }
        setElemSave(elem);
      } else {
        setBlocks(initialValue);
      }
      setReady(true);
    };
    f();
  }, [id]);

  const [elemSave, setElemSave] = useState<ElementSaveData | undefined>();

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
    if (page !== 'editor') return;
    let isMounted = true;
    //console.log('upadate?', isMounted, blocks.length);
    const processBlocks = () => {
      console.log('called', isMounted, blocks.length);
      if (blocks.length <= 1) return; //!isMounted omitted
      console.log('next');
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
            method: 'POST',
            body: formData,
          })
        ).json();
        if (res.status === 'success') {
          // toast({
          //   title: 'Image uploaded',
          // });
          console.log(res.surl);
          // loc.imgs.unshift(res.url);
          // setLoc(loc);
        } else {
          console.error(res);
        }
      };
      f();
    };

    const timeoutId = setTimeout(processBlocks, 2000); // seconds
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [blocks, identify]);

  const value: EditorContextValue = {
    id,
    blocks,
    setBlocks,
    elemSave,
    setElemSave,
    ready,
  };

  // store cache to local storage

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
};
