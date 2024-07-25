import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { NextRequest, NextResponse } from 'next/server';
import { fs_e } from '@/database/firestore';
import { makeid } from '@/utils/str';

import { Response } from '@/types/response';

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    // value hand over with json
    const res: Response = await req.json();
    await fs_e
      .doc(res.examId)
      .collection('responses')
      .doc(`${res.userId}-${makeid(10)}`)
      .set(res);

    return NextResponse.json({ status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ status: 500 });
  }
}

export async function GET(req: NextRequest, res: NextResponse) {
  const { examid, userid } = await req.json();
  const doc = await (
    await fs_e.doc(examid).collection('responses').doc(userid).get()
  ).data();
  if (!doc) {
    return NextResponse.json({ status: 404 });
  } else {
    return NextResponse.json({ status: 200, data: doc.data() });
  }
}
