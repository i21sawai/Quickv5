//set env from .env.local
import { config } from 'dotenv';
import { storage } from 'firebase-admin';
import { cert, getApps, initializeApp } from 'firebase-admin/app';

config();

//TODO FIX HOURS SINCE WE CAN'T USE ARRAY or USE CONVERTER

// console.log(
//   process.env.SA_PROJECT_ID,
//   process.env.SA_CLIENT_EMAIL,
//   process.env.SA_PRIVATE_KEY,
//   process.env.BUCKET_NAME
// );
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.SA_PROJECT_ID,
      clientEmail: process.env.SA_CLIENT_EMAIL,
      //privateKey: process.env.SA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      privateKey: process.env.SA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const bucket = storage().bucket(process.env.BUCKET_NAME!);
