import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Plate } from '@udecode/plate-common';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';

import { Element, ElementSaveData } from '@/types/element';
import { plugins } from '@/lib/plate/plate-plugins';

import { useEditorContext } from '../context/editor';
import { Editor } from '../plate-ui/editor';
import { Badge } from '../ui/badge';
import { FormElemRenderer } from './formElemRenderer';

export type FormRendererProps = {
  elemSave: ElementSaveData | undefined;
  setElemSave: (elem: ElementSaveData) => void;
};

export const FormRenderer = ({ elemSave, setElemSave }: FormRendererProps) => {
  const [rendered, setRendered] = useState<(JSX.Element | null | undefined)[]>(
    []
  );

  useEffect(() => {
    if (!elemSave) return;
    let count = 1;
    setRendered(
      elemSave.elements.map((element, i) => {
        if (!element) return null;
        return (
          <FormElemRenderer
            key={i}
            count={count++}
            elem={element}
            setElem={(e) => {
              elemSave.elements[i] = e;
              console.log(e);
              setElemSave({ ...elemSave });
            }}
          />
        );
      })
    );
  }, [elemSave]);

  const totalPoint = useMemo(() => {
    if (!elemSave) return 0;
    return elemSave.elements.reduce((acc, elem) => acc + elem.point, 0);
  }, [elemSave]);

  return (
    <div className="flex flex-col gap-4">
      {
        <div className="flex mb-4">
          <div className="flex flex-col gap-2 w-full">
            <h1 className="scroll-m-20 pb-2 text-4xl font-bold tracking-tight first:mt-0">
              {elemSave?.title}
            </h1>
          </div>

          <div className="text-sm text-muted-foreground w-16">
            {totalPoint}点
          </div>
        </div>
        // <h1 className="scroll-m-20 pb-2 text-4xl font-bold tracking-tight first:mt-0">
        //   {elemSave?.title}
        // </h1>
      }
      {rendered}
    </div>
  );
};
