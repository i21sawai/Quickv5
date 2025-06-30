import { config } from 'dotenv';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

config();

//TODO FIX HOURS SINCE WE CAN'T USE ARRAY or USE CONVERTER

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.SA_PROJECT_ID,
      clientEmail: process.env.SA_CLIENT_EMAIL,
      //privateKey: process.env.SA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      privateKey: process.env.SA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
  const db = getFirestore();
  db.settings({ ignoreUndefinedProperties: true });
}

export const db = getFirestore();
export const fs_e = db.collection('Exam').doc('exam').collection('exams');
export const fs_user = db.collection('Exam').doc('user').collection('users');

// export const fs_a = db
//   .collection('mapman')
//   .doc('datas')
//   .collection('accounts')
//   .withConverter(accountConverter);
