import { NextResponse } from 'next/server';
import { examAttrConverter } from '@/database/converters/exam';
import { fs_e } from '@/database/firestore';

export async function GET() {
  try {
    //get list of document
    const snapshot = await fs_e.withConverter(examAttrConverter).get();
    const data = snapshot.docs.map((doc) => doc.data());
    console.log('--- API /api/editor/list Data Output ---');
console.log('Fetched raw data from Firestore:', snapshot.docs.map(doc => doc.data())); // Firestoreから取得した生データ
console.log('Converted data for table:', data); // converter後のデータ
console.log('--- End API /api/editor/list Data Output ---');
    return NextResponse.json(data);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ status: 'fail', data: e }, { status: 500 });
  }
}
