import { pipeline } from 'stream';
import { promisify } from 'util';
import { NextRequest, NextResponse } from 'next/server';
import { examAttrConverter } from '@/database/converters/exam';
import { fs_e } from '@/database/firestore';
import { bucket } from '@/database/storage';
import { useSession } from 'next-auth/react';

import { ExamAttr } from '@/types/exam';

const pump = promisify(pipeline);

//status can be draft, collecting_answers
type POST_BODY = {
  id: string;
  title: string;
  userId: string;
};
export async function POST(req: NextRequest) {
  const json: POST_BODY = await req.json();
  try {
    //check if taken already
    const doc = await fs_e.doc(json.id).get();
    if (doc.exists) {
      return NextResponse.json(
        { status: 'fail', data: 'ID already taken' },
        { status: 400 }
      );
    }
    await fs_e.withConverter(examAttrConverter).doc(json.id).set({
      id: json.id,
      title: json.title,
      createdAt: new Date(),
      lastEditedAt: new Date(),
      owner: json.userId,
      status: 'draft',
    });
    return NextResponse.json({ status: 'success' });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ status: 'fail', data: e }, { status: 500 });
  }
}

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
