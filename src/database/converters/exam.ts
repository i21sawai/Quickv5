import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

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
      elemRef: exam.elemRef,
      saveRef: exam.saveRef,
      timeLimit: exam.timeLimit,
      examStartAt: exam.examStartAt,
      examEndAt: exam.examEndAt,
    };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): ExamAttr {
    const data = snapshot.data();
    return {
      id: data.id,
      title: data.title,
      createdAt: data.createdAt.toDate(),
      lastEditedAt: data.lastEditedAt.toDate(),
      owner: data.owner,
      status: data.status,
      elemRef: data.elemRef,
      saveRef: data.saveRef,
      timeLimit: data.timeLimit,
      examStartAt: data.examStartAt ? data.examStartAt.toDate() : undefined,
      examEndAt: data.examEndAt ? data.examEndAt.toDate() : undefined,
    };
  },
};
