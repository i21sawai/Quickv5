import { DocumentData } from 'firebase-admin/firestore';

import { ExamAttr } from '@/types/exam';

export const examAttrConverter = {
  toFirestore(exam: ExamAttr): DocumentData {
    return {
      id: exam.id,
      title: exam.title,
      createdAt: exam.createdAt,
      lastEditedAt: exam.lastEditedAt,
      owner: exam.owner,
      status: exam.status,
    };
  },

  fromFirestore(snapshot: DocumentData): ExamAttr {
    const data = snapshot.data();
    return {
      id: data.id,
      title: data.title,
      createdAt: new Date(data.createdAt.seconds * 1000),
      lastEditedAt: new Date(data.lastEditedAt.seconds * 1000),
      owner: data.owner,
      status: data.status,
    };
  },
};
