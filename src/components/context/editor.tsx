'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { notFound, usePathname } from 'next/navigation';
import { Value } from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

import { Element, ElementSaveData } from '@/types/element';
import { ExamAttr } from '@/types/exam';

export interface EditorContextValue {
  id: string;
  page: string;
  elemSave: ElementSaveData | undefined;
  setElemSave: (elements: ElementSaveData) => void;
  attr: ExamAttr | undefined;
  setAttr: (attr: ExamAttr) => void;
  ready: boolean;
  status: string;
  setStatus: (status: string) => void;
  autosave: boolean;
  setAutosave: (autosave: boolean) => void;
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

export const EditorContextProvider = ({
  children,
}: EditorContextProviderProps) => {
  const path = usePathname();
  const id = path.split('/').pop() || '';
  const page = path.split('/').slice(-2, -1)[0];

  const [ready, setReady] = useState(false);
  const [attr, setAttr] = useState<ExamAttr | undefined>();
  const [autosave, setAutosave] = useState(true);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const f = async () => {
      if (id === 'editor') return;
      const ereq = await fetch(
        `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_BUCKET_NAME}/WebExam%2Feditor%2F${id}_elem.json?ignoreCache=1`
      );
      if (ereq.status === 200) {
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
      }
      const attrreq = await fetch(`/api/editor/attr?id=${id}`);
      if (attrreq.status === 200) {
        const attr = await attrreq.json();
        //! DON'T FORGET TO CONVERT DATE STRING TO DATE OBJECT
        attr.createdAt = new Date(attr.createdAt);
        attr.lastEditedAt = new Date(attr.lastEditedAt);
        attr.examStartAt = new Date(attr.examStartAt);
        attr.examEndAt = new Date(attr.examEndAt);
        setAttr(attr);
      }

      setReady(true);
    };
    f();
  }, [id]);

  const [elemSave, setElemSave] = useState<ElementSaveData | undefined>();

  useEffect(() => {
    if (!attr) return;
    async function f() {
      await fetch(`/api/editor/attr`, {
        method: 'POST',
        body: JSON.stringify(attr),
      });
    }
    f();
  }, [attr]);

  const value: EditorContextValue = {
    id,
    page,
    elemSave,
    setElemSave,
    attr,
    setAttr,
    ready,
    status,
    setStatus,
    autosave,
    setAutosave,
  };

  // store cache to local storage

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
};
