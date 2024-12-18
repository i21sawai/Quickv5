import { NextRequest, NextResponse } from 'next/server';
import { allResponseConverter } from '@/database/converters/response';
import { fs_e } from '@/database/firestore';

import { AllResponse } from '@/types/response';

export async function GET(req: NextRequest, res: NextResponse) {
  // get url param

  const examId = req.nextUrl.searchParams.get('id');
  if (!examId) return NextResponse.json({ status: 404 });
  const result = await fs_e
    .doc(examId)
    .collection('responses')
    .doc('all')
    .withConverter<AllResponse>(allResponseConverter)
    .get();
  if (!result.exists) {
    console.log('no result');
    return NextResponse.json({ status: 404 });
  } else {
    return NextResponse.json({ status: 200, data: result.data() });
  }
}
