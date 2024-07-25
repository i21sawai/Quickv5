import { useState } from 'react';
import { Label } from '@radix-ui/react-dropdown-menu';

import { Element } from '@/types/element';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';

export const FormElemQRenderer = ({
  element,
  setElement,
}: {
  element: Element;
  setElement: (e: Element) => void;
}) => {
  const [text, setText] = useState('');

  switch (element.type) {
    case 'text':
      return (
        <Input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setElement({ ...element, answers: [e.target.value] });
          }}
        />
      );
    case 'paragraph':
      return (
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setElement({ ...element, answers: [e.target.value] });
          }}
        />
      );
    case 'radio':
      return (
        <RadioGroup
          value={`${element.answers[0]}` as string}
          onValueChange={(value) => {
            setElement({ ...element, answers: [parseInt(value)] });
          }}
        >
          {element.options.map((option, i) => (
            <div key={i + 1} className="flex items-center gap-2">
              <RadioGroupItem value={`${i + 1}`} />
              <Label>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    case 'matrix':
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-20 max-w-20 w-20">問題</TableHead>
              {element.options.map((option, i) => (
                <TableHead
                  className={cn(
                    'text-center min-w-12 max-w-12 w-12 md:min-w-28 md:max-w-28 md:w-28'
                  )}
                  key={i}
                >
                  {option}
                </TableHead>
              ))}
              <TableHead className="w-auto"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {element.questions.map((question, i) => (
              <TableRow key={i}>
                <TableCell>{question}</TableCell>
                <TableCell colSpan={element.options.length}>
                  <RadioGroup
                    value={
                      `${(element.answers as number[][])[i] ? (element.answers as number[][])[i][0] || 0 : 0}` as string
                    }
                    onValueChange={(value: any) => {
                      const answers = element.answers as number[][];
                      answers[i] = [parseInt(value)];
                      setElement({ ...element, answers });
                    }}
                    className="flex justify-end px-3 gap-[48px] md:px-8 md:gap-[96px]"
                  >
                    {element.options.map((_, j) => (
                      <RadioGroupItem key={j} value={`${j + 1}`} />
                    ))}
                  </RadioGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );

    default:
      return null;
  }
};
