import { DocumentData } from 'firebase-admin/firestore';

import { AllResponse, Response } from '@/types/response';

export const responseConverter = {
  toFirestore(response: Response): DocumentData {
    return {
      examId: response.examId,
      userId: response.userId,
      answers: response.answers.map((a) => JSON.stringify(a)),
      submitTime: response.submitTime,
    };
  },

  fromFirestore(snapshot: DocumentData): Response {
    const data = snapshot.data();
    return {
      examId: data.examId,
      userId: data.userId,
      answers: data.answers.map((a: string) => JSON.parse(a)),
      submitTime: new Date(data.submitTime),
    };
  },
};

export const allResponseConverter = {
  toFirestore(response: AllResponse): DocumentData {
    return {
      examId: response.examId,
      userIdList: response.userIdList,
      answersList: response.answersList.map((a) => JSON.stringify(a)),
      updateAt: response.updateAt,
    };
  },

  fromFirestore(snapshot: DocumentData): AllResponse {
    const data = snapshot.data();
    console.log(data.updateAt, typeof data.updateAt);
    return {
      examId: data.examId,
      userIdList: data.userIdList,
      answersList: data.answersList.map((a: string) => JSON.parse(a)),
      updateAt: new Date(data.updateAt),
    };
  },
};
