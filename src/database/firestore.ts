// firebase.ts
// import { config } from 'dotenv'; // ★この行は削除★
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// config(); // ★この行も削除★

let dbInstance: ReturnType<typeof getFirestore>;

if (!getApps().length) {
  // 環境変数が存在するかチェック (Vercelで設定されていない場合の早期エラー検出)
  if (!process.env.SA_PROJECT_ID || !process.env.SA_CLIENT_EMAIL || !process.env.SA_PRIVATE_KEY) {
    console.error('Firebase Admin SDK: Missing required environment variables (SA_PROJECT_ID, SA_CLIENT_EMAIL, SA_PRIVATE_KEY).');
    // 本番環境でこのエラーが出た場合、Vercelの環境変数設定を見直してください。
    // デプロイが成功しても、この部分でエラーになる可能性があります。
    throw new Error('Firebase Admin SDK environment variables are not set.');
  }

  initializeApp({
    credential: cert({
      projectId: process.env.SA_PROJECT_ID,
      clientEmail: process.env.SA_CLIENT_EMAIL,
      // SA_PRIVATE_KEYの改行コード処理は、Vercelでの設定方法に依存します。
      // JSONキーファイルからコピーした値をVercelにそのまま貼り付けた場合、
      // Vercelが自動でエスケープするため、ここでreplaceが必要です。
      // もしVercelに既に\\nとエスケープされた値を貼り付けた場合は、replaceは不要です。
      privateKey: process.env.SA_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
  dbInstance = getFirestore();
  dbInstance.settings({ ignoreUndefinedProperties: true });
} else {
  // 既に初期化されている場合は既存のインスタンスを取得
  dbInstance = getFirestore();
}

export const db = dbInstance; // 初期化されたFirestoreインスタンスをエクスポート
export const fs_e = db.collection('Exam').doc('exam').collection('exams');
export const fs_user = db.collection('Exam').doc('user').collection('users');

// export const fs_a = db
//   .collection('mapman')
//   .doc('datas')
//   .collection('accounts')
//   .withConverter(accountConverter);