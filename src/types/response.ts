import { ElemType } from './element';

//answerKey
//allAnswerKey

//response  -> fs
//allResponse -> fs

export type AnswerKey = {
  id: string;
  type: ElemType;
  title: string;
  answers: number[] | number[][] | string[];
};
//export type Response
export type Response = {
  id: string;
  examId: string;
  userId: string;
  answers: AnswerKey[];
  submitTime: Date;
};

export type AllAnswerKey = {
  id: string;
  type: ElemType;
  title: string;
  correctAnswers: number[] | number[][] | string[];
  answersList: [number[] | number[][] | string[]];
};

export type AllResponse = {
  examId: string;
  userIdList: string[];
  responseIdList: string[];
  answersList: AllAnswerKey[];
  updateAt: Date;
};

export function setCorrectAnswers(
  allAnswers: AllAnswerKey[],
  correctAnswers: AnswerKey[]
) {
  allAnswers = allAnswers.map((a, i) => {
    a.correctAnswers = correctAnswers[i].answers;
    return a;
  });
  return allAnswers;
}

export function appendAnswerKey(
  allAnswers: AllAnswerKey[],
  answers: AnswerKey[]
) {
  if (allAnswers.length === 0) {
    allAnswers = answers.map((a, i) => {
      return {
        id: a.id,
        type: a.type,
        title: a.title,
        correctAnswers: [],
        answersList: [a.answers],
      } as AllAnswerKey;
    });
  } else {
    allAnswers = allAnswers.map((a, i) => {
      a.answersList?.push(answers[i].answers);
      return a;
    });
  }
  return allAnswers;
}
