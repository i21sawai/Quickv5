export type ExamAttr = {
  id: string;
  title: string;
  status: 'draft' | 'collecting-answer';
  owner: string;
  createdAt: Date;
  lastEditedAt: Date;
};
