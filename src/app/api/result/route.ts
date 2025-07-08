import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { allResponseConverter } from '@/database/converters/response';
import { fs_e } from '@/database/firestore';

import { AllResponse } from '@/types/response';

export async function GET(req: NextRequest, res: NextResponse) {
  // get url param

  const examId = req.nextUrl.searchParams.get('id');
  console.log('[RESULT API] Getting result for examId:', examId);
  
  if (!examId) {
    console.log('[RESULT API] No examId provided');
    return NextResponse.json({ status: 404 });
  }
  
  const docPath = `Exam/exam/exams/${examId}/responses/all`;
  console.log('[RESULT API] Fetching from path:', docPath);
  
  const result = await fs_e
    .doc(examId)
    .collection('responses')
    .doc('all')
    .withConverter<AllResponse>(allResponseConverter)
    .get();
    
  if (!result.exists) {
    console.log('No result found for examId:', examId);
    // Check if any responses exist for this exam
    const responsesSnapshot = await fs_e
      .doc(examId)
      .collection('responses')
      .limit(5)
      .get();
    console.log('Found responses:', responsesSnapshot.size);
    responsesSnapshot.forEach(doc => {
      console.log('Response doc id:', doc.id);
    });
    
    return NextResponse.json({ status: 404 });
  } else {
    const data = result.data();
    console.log('Found result data, userIdList length:', data?.userIdList?.length);
    return NextResponse.json({ status: 200, data: data });
  }
}
