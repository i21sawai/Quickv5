import { useEffect, useMemo, useState } from 'react';

import { ElementSaveData } from '@/types/element';

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
        <div className="mb-4 flex">
          <div className="flex w-full flex-col gap-2">
            <h1 className="scroll-m-20 pb-2 text-4xl font-bold tracking-tight first:mt-0">
              {elemSave?.title}
            </h1>
          </div>

          <div className="w-16 text-sm text-muted-foreground">
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
