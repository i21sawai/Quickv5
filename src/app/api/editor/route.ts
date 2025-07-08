// このAPIルートは413 Payload Too Largeエラーを回避するため、
// クライアントサイドから直接Firebase Storageにアップロードする方式に変更されました。
// 以下のコードは参考のため残しています。

//import { pipeline } from 'stream';
//import { promisify } from 'util';
import { NextRequest, NextResponse } from 'next/server';
import { bucket } from '@/database/storage';

//const pump = promisify(pipeline);

// DEPRECATED: このPUTメソッドは使用されなくなりました
export async function PUT(req: NextRequest, res: NextResponse) {
  try {
    const formData = await req.formData();
    const save = formData.get('save') as File;
    const elem = formData.get('elem') as File;

    const upload = async (file: File) => {
      if (!file) {
        return NextResponse.json({ status: 'fail', data: 'No file uploaded' });
      }
      const fileName = `WebExam/editor/${file.name}`; //${makeid(10)}_
      const fileBuffer = await file.arrayBuffer();
      const blob = bucket.file(fileName);
      await blob.save(Buffer.from(fileBuffer), {
        resumable: false,
        metadata: {
          contentType: file.type,
        },
      });
      // no cache
      await blob.setMetadata({
        cacheControl: 'no-cache, max-age=0',
      });
      await blob.makePublic();
      return blob.publicUrl();
    };

    const surl = await upload(save);
    const eurl = await upload(elem);

    return NextResponse.json({ status: 'success', surl: surl, eurl: eurl });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ status: 'fail', data: e });
  }
}
