import { NextResponse } from 'next/server';
import { examAttrConverter } from '@/database/converters/exam';
import { fs_e } from '@/database/firestore';

export async function GET() {
  try {
    //get list of document
    const snapshot = await fs_e.withConverter(examAttrConverter).get();
    const data = snapshot.docs.map((doc) => doc.data());
    return NextResponse.json(data);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ status: 'fail', data: e }, { status: 500 });
  }
}
