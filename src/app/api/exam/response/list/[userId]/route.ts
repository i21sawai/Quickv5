import { NextRequest, NextResponse } from 'next/server';
import { fs_e, fs_user } from '@/database/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    //get list of document
    const userId = (await params).userId;
    const snapshot = await fs_user
      .doc(userId)
      // .withConverter(responseConverter)
      .get();
    const data = snapshot.data();
    if (!data)
      return NextResponse.json(
        { status: 'fail', data: 'No data' },
        { status: 404 }
      );
    return NextResponse.json(data.responses, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ status: 'fail', data: e }, { status: 500 });
  }
}
