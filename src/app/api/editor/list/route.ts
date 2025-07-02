// /api/editor/list (src/app/api/editor/list/route.ts または pages/api/editor/list.ts)

import { NextResponse } from 'next/server';
import { examAttrConverter } from '@/database/converters/exam';
import { fs_e } from '@/database/firestore';

export async function GET() {
  try {
    //get list of document
    const snapshot = await fs_e.withConverter(examAttrConverter).get();
    const data = snapshot.docs.map((doc) => doc.data());

    // ★★★ この部分を修正/追加します ★★★
    // NextResponse.json(data); の代わりに new NextResponse を使用してカスタムヘッダーを設定
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        // キャッシュを一切許可しない非常に強力な指示
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',      // HTTP/1.0 互換性
        'Expires': '0',            // 過去の日付を指定し、キャッシュを即座に無効化
        'Surrogate-Control': 'no-store' // CDN (VercelのCDNなど) に対する指示
      },
    });
  } catch (e) {
    console.error('--- ERROR in /api/editor/list GET Request ---'); // エラーログを強化
    console.error('Error details:', e);
    if (e instanceof Error) {
      console.error('Error Name:', e.name);
      console.error('Error Message:', e.message);
      console.error('Error Stack:', e.stack);
    }
    console.error('--- END ERROR in /api/editor/list GET Request ---');
    // エラーレスポンスも NextResponse を使って明示的に JSON を返す
    return new NextResponse(JSON.stringify({ status: 'fail', data: String(e) }), { status: 500 });
  }
}