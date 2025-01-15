import { useState } from 'react';
import { Label } from '@radix-ui/react-dropdown-menu';

import { Element } from '@/types/element';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
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
  switch (element.type) {
    case 'text':
      return (
        <div className="flex flex-col gap-4">
          <Input
            value={element.answers[0] as string}
            onChange={(e) => {
              setElement({ ...element, answers: [e.target.value] });
            }}
            disabled={element.readonly}
          />
          {element.trueAnswers && (
            <div className="flex flex-col gap-4">
              <Label className="font-bold text-green-500">模範解答</Label>
              {element.trueAnswers.map((ans, i) => (
                <p key={i} className="text-muted-foreground">
                  {ans}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    case 'paragraph':
      return (
        <div className="flex flex-col gap-4">
          <Textarea
            value={element.answers[0] as string}
            onChange={(e) => {
              setElement({ ...element, answers: [e.target.value] });
            }}
            disabled={element.readonly}
          />
          {element.trueAnswers && (
            <div className="flex flex-col gap-4">
              <Label className="font-bold text-green-500">模範解答</Label>
              {element.trueAnswers.map((ans, i) => (
                <p key={i} className="text-muted-foreground">
                  {ans}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    case 'radio':
      return (
        <RadioGroup
          value={`${element.answers[0]}` as string}
          onValueChange={(value) => {
            setElement({ ...element, answers: [parseInt(value)] });
          }}
          disabled={element.readonly}
        >
          {element.options.map((option, i) => (
            <div key={i + 1} className="flex items-center gap-2">
              <RadioGroupItem
                value={`${i + 1}`}
                className={
                  element.trueAnswers && i + 1 === element.trueAnswers[0]
                    ? 'bg-green-500 border-green-500'
                    : ''
                }
              />
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
              <TableHead className="w-20 min-w-20 max-w-20">問題</TableHead>
              {element.options.map((option, i) => (
                <TableHead
                  className={cn(
                    'w-12 min-w-12 max-w-12 text-center md:w-28 md:min-w-28 md:max-w-28'
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
                    className={
                      'flex justify-end gap-[48px] px-3 md:gap-[96px] md:px-8 '
                    }
                    disabled={element.readonly}
                  >
                    {element.options.map((_, j) => (
                      <RadioGroupItem
                        key={j}
                        value={`${j + 1}`}
                        className={
                          element.trueAnswers &&
                          j + 1 === (element.trueAnswers as number[][])[i][0]
                            ? 'bg-green-500 border-green-500'
                            : ''
                        }
                      />
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
