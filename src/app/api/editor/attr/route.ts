import { NextRequest, NextResponse } from 'next/server';
import { examAttrConverter } from '@/database/converters/exam';
import { fs_e } from '@/database/firestore';

import { ExamAttr } from '@/types/exam';

//status can be draft, collecting_answers
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json(
      { status: 'fail', data: 'No ID provided' },
      { status: 400 }
    );
  }
  try {
    const doc = await fs_e.doc(id).withConverter(examAttrConverter).get();
    if (!doc.exists) {
      return NextResponse.json(
        { status: 'fail', data: 'Document does not exist' },
        { status: 400 }
      );
    }
    const data = doc.data();
    return NextResponse.json(data);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ status: 'fail', data: e }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const json: ExamAttr = await req.json();
  try {
    const data: any = {
      id: json.id,
      title: json.title,
      createdAt: new Date(json.createdAt),
      lastEditedAt: new Date(json.lastEditedAt),
      owner: json.owner,
      status: json.status,
      elemRef: json.elemRef,
      saveRef: json.saveRef,
      timeLimit: json.timeLimit,
    };
    
    // examStartAtとexamEndAtがnullでない場合のみ設定
    if (json.examStartAt) {
      data.examStartAt = new Date(json.examStartAt);
    }
    if (json.examEndAt) {
      data.examEndAt = new Date(json.examEndAt);
    }
    
    await fs_e
      .withConverter(examAttrConverter)
      .doc(json.id)
      .set(data);
    return NextResponse.json({ status: 'success' });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ status: 'fail', data: e }, { status: 500 });
  }
}
