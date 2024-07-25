import { Value } from '@udecode/plate-common';

export type ValueSaveData = {
  id: string;
  userId: string;
  title: string;
  blocks: Value;
  updatedAt: Date;
};
