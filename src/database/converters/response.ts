import { DocumentData } from 'firebase-admin/firestore';

import { AllResponse, Response } from '@/types/response';

export const responseConverter = {
  toFirestore(response: Response): DocumentData {
    return {
      id: response.id,
      examId: response.examId,
      userId: response.userId,
      answers: response.answers.map((a) => JSON.stringify(a)),
      submitTime: response.submitTime,
    };
  },

  fromFirestore(snapshot: DocumentData): Response {
    const data = snapshot.data();
    return {
      id: data.id,
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
      responseIdList: response.responseIdList,
      answersList: response.answersList.map((a) => JSON.stringify(a)),
      submissionTimeList: response.submissionTimeList.map((t) => t.toString()),
      updateAt: response.updateAt,
    };
  },

  fromFirestore(snapshot: DocumentData): AllResponse {
    const data = snapshot.data();
    console.log(data.updateAt, typeof data.updateAt);
    return {
      examId: data.examId,
      userIdList: data.userIdList,
      responseIdList: data.responseIdList,
      answersList: data.answersList.map((a: string) => JSON.parse(a)),
      submissionTimeList: data.submissionTimeList.map(
        (t: string) => new Date(t)
      ),
      updateAt: new Date(data.updateAt),
    };
  },
};
