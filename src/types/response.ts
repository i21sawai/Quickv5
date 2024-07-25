import { ElemType } from './element';

export type AnswerKey = {
  id: string;
  type: ElemType;
  title: string;
  answers: number[] | number[][] | string[];
};
//export type Response
export type Response = {
  examId: string;
  userId: string;
  answers: AnswerKey[];
  submitTime: Date;
};
