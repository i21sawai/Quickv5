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
      setReady(false);
      
      // First get the attribute data from Firestore
      const attrreq = await fetch(`/api/editor/attr?id=${id}`);
      if (attrreq.status === 200) {
        const attrData = await attrreq.json();
        //! DON'T FORGET TO CONVERT DATE STRING TO DATE OBJECT
        attrData.createdAt = new Date(attrData.createdAt);
        attrData.lastEditedAt = new Date(attrData.lastEditedAt);
        if (attrData.examStartAt) attrData.examStartAt = new Date(attrData.examStartAt);
        if (attrData.examEndAt) attrData.examEndAt = new Date(attrData.examEndAt);
        setAttr(attrData);
        
        // Use the elemRef URL from Firestore to fetch the element data
        if (attrData.elemRef) {
          // Extract path from the Storage URL
          const storageUrl = attrData.elemRef;
          let storagePath = '';
          
          if (storageUrl.includes('firebasestorage.app')) {
            // Extract path after the bucket name
            const match = storageUrl.match(/firebasestorage\.app\/(.+?)(?:\?|$)/);
            if (match) {
              storagePath = decodeURIComponent(match[1]);
              // Remove the '/o/' prefix if present
              if (storagePath.startsWith('o/')) {
                storagePath = storagePath.substring(2);
              }
            }
          } else if (storageUrl.includes('storage.googleapis.com')) {
            // Extract path from Google Cloud Storage URL
            const match = storageUrl.match(/storage\.googleapis\.com\/[^/]+\/(.+?)(?:\?|$)/);
            if (match) {
              storagePath = decodeURIComponent(match[1]);
            }
          }
          
          if (storagePath) {
            const ereq = await fetch(`/api/storage/${storagePath}`);
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
          }
        } else {
          // Fallback: try to fetch from the old Google Cloud Storage location via API
          const ereq = await fetch(`/api/storage/WebExam/editor/${id}_elem.json`);
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
        }
      } else {
        // If no Firestore document exists, try the old Google Cloud Storage location via API
        const ereq = await fetch(`/api/storage/WebExam/editor/${id}_elem.json`);
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
      }

      setReady(true);
    };
    f();
  }, [id, page]);

  const [elemSave, setElemSave] = useState<ElementSaveData | undefined>();

  useEffect(() => {
    if (!attr) return;
    async function f() {
      await fetch(`/api/editor/attr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
