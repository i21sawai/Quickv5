export type ExamAttr = {
  id: string;
  title: string;
  status: '下書き' | '回答募集中' | '採点中' | '採点完了';
  owner: string;
  createdAt: Date;
  lastEditedAt: Date;
  elemRef: string;
  saveRef: string;
  timeLimit: number;
  examStartAt: Date;
  examEndAt: Date;
};
