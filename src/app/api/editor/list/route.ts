import { NextResponse } from 'next/server';
import { examAttrConverter } from '@/database/converters/exam';
import { fs_e } from '@/database/firestore';

export async function GET() {
  try {
    //get list of document
    const snapshot = await fs_e.withConverter(examAttrConverter).get();
    const data = snapshot.docs.map((doc) => doc.data());
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        // キャッシュを一切許可しない非常に強力な指示
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',      // HTTP/1.0 互換性のため
        'Expires': '0',            // 過去の日付を指定し、キャッシュを即座に無効化
        'Surrogate-Control': 'no-store' // CDN (VercelのCDNなど) に対する指示
      },
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ status: 'fail', data: e }, { status: 500 });
  }
}
