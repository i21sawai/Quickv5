import { Plate, setElements } from '@udecode/plate-common';

import { Element } from '@/types/element';
import { plugins } from '@/lib/plate/plate-plugins';

import { Editor } from '../plate-ui/editor';
import { Badge } from '../ui/badge';
import { FormElemQRenderer } from './formElemQRenderer';

export const FormElemRenderer = ({
  count,
  elem,
  setElem,
}: {
  count: number;
  elem: Element;
  setElem: (e: Element) => void;
}) => {
  return (
    <div className="flex flex-col">
      <div className="flex mb-4">
        <div className="flex flex-col gap-2 w-full">
          <h2 className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0 w-full">
            問題{count++}. {elem.title}
          </h2>
          {elem.tags.length >= 1 && (
            <div className="flex gap-2">
              {elem?.tags.map((tag, i) => (
                <Badge key={i} variant={'secondary'}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground w-16">
          {elem?.point}点
        </div>
      </div>
      {elem && (
        <div>
          {elem.telems.length >= 1 && (
            <Plate
              plugins={plugins}
              value={JSON.parse(JSON.stringify(elem.telems))}
              readOnly
              key={count}
            >
              <Editor className="p-0 border-none" readOnly />
            </Plate>
          )}

          <FormElemQRenderer element={elem as Element} setElement={setElem} />
        </div>
      )}
    </div>
  );
};
