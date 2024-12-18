import { TElement } from '@udecode/plate-common';

export type ElemType = 'text' | 'paragraph' | 'matrix' | 'radio' | undefined;
export type Element = {
  id: string;
  type: ElemType;
  title: string;
  point: number;
  options: string[];
  questions: string[];
  answers: number[] | number[][] | string[];
  telems: TElement[];
  tags: string[];
};

export type ElementSaveData = {
  id: string;
  title: string;
  // blocks: Value;
  elements: Element[];
  updatedAt: Date;
};
