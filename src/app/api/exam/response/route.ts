import { NextRequest, NextResponse } from 'next/server';
import {
  allResponseConverter,
  responseConverter,
} from '@/database/converters/response';
import { fs_e, fs_user } from '@/database/firestore';
import { makeid } from '@/utils/str';
import { getStorage } from 'firebase-admin/storage';

import { ElementSaveData } from '@/types/element';
import {
  AllResponse,
  AnswerKey,
  appendAnswerKey,
  Response,
  setCorrectAnswers,
} from '@/types/response';

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    // value hand over with json
    const res: Response = await req.json();
    await fs_e
      .doc(res.examId)
      .collection('responses')
      .doc(res.id)
      .withConverter(responseConverter)
      .set(res);
    //add responseId to user
    //create user if not exist
    let user = (await fs_user.doc(res.userId).get()).data();
    let responses = [];
    if (!user) {
      await fs_user.doc(res.userId).set({
        id: res.userId,
        responses: [],
      });
    } else {
      responses = user.responses;
    }
    await fs_user.doc(res.userId).update({
      responses: [...responses, JSON.stringify(res)],
    });
    //append answer to all res
    let allRes = (
      await fs_e
        .doc(res.examId)
        .collection('responses')
        .withConverter<AllResponse>(allResponseConverter)
        .doc('all')
        .get()
    ).data();

    // Get exam attributes to find elemRef
    const examDoc = await fs_e.doc(res.examId).get();
    const examData = examDoc.data();
    
    let elem: ElementSaveData;
    
    // Try to use elemRef from Firestore first
    if (examData?.elemRef) {
      // Extract path from the Storage URL
      const storageUrl = examData.elemRef;
      let storagePath = '';
      
      if (storageUrl.includes('firebasestorage.app')) {
        const match = storageUrl.match(/firebasestorage\.app\/(.+?)(?:\?|$)/);
        if (match) {
          storagePath = decodeURIComponent(match[1]);
          // Remove the '/o/' prefix if present
          if (storagePath.startsWith('o/')) {
            storagePath = storagePath.substring(2);
          }
        }
      } else if (storageUrl.includes('storage.googleapis.com')) {
        const match = storageUrl.match(/storage\.googleapis\.com\/[^/]+\/(.+?)(?:\?|$)/);
        if (match) {
          storagePath = decodeURIComponent(match[1]);
        }
      }
      
      if (!storagePath) {
        storagePath = `WebExam/editor/${res.examId}_elem.json`;
      }
      
      try {
        const storage = getStorage();
        const bucket = storage.bucket();
        const file = bucket.file(storagePath);
        const [contents] = await file.download();
        elem = JSON.parse(contents.toString()) as ElementSaveData;
      } catch (error) {
        console.error(`Failed to fetch exam elements for ${res.examId}:`, error);
        return NextResponse.json({ status: 500, error: 'Failed to fetch exam elements' });
      }
    } else {
      // Fallback to default location
      try {
        const storage = getStorage();
        const bucket = storage.bucket();
        const file = bucket.file(`WebExam/editor/${res.examId}_elem.json`);
        const [contents] = await file.download();
        elem = JSON.parse(contents.toString()) as ElementSaveData;
      } catch (error) {
        console.error(`Failed to fetch exam elements for ${res.examId}:`, error);
        return NextResponse.json({ status: 500, error: 'Failed to fetch exam elements' });
      }
    }
    let correctAnswers = elem.elements.map((e) => {
      return {
        id: e.id,
        type: e.type,
        title: e.title,
        answers: e.answers,
      } as AnswerKey;
    });

    if (allRes === undefined) {
      let answerList = appendAnswerKey([], res.answers);
      answerList = setCorrectAnswers(answerList, correctAnswers);
      allRes = {
        examId: res.examId,
        userIdList: [res.userId],
        responseIdList: [res.id],
        answersList: answerList,
        submissionTimeList: [res.submitTime],
        updateAt: res.submitTime,
      };
      await fs_e
        .doc(res.examId)
        .collection('responses')
        .withConverter(allResponseConverter)
        .doc('all')
        .set(allRes);
    } else {
      allRes.answersList = appendAnswerKey(allRes.answersList, res.answers);
      allRes.answersList = setCorrectAnswers(
        allRes.answersList,
        correctAnswers
      );
      allRes.userIdList.push(res.userId);
      allRes.responseIdList.push(res.id);
      allRes.submissionTimeList.push(res.submitTime);
      allRes.updateAt = res.submitTime;
      console.log('[RESPONSE API] Setting all document for examId:', res.examId);
      console.log('[RESPONSE API] AllResponse userIdList:', allRes.userIdList);
      await fs_e
        .doc(res.examId)
        .collection('responses')
        .withConverter(allResponseConverter)
        .doc('all')
        .set(allRes);
      console.log('[RESPONSE API] Successfully saved all document');
    }

    return NextResponse.json({ status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ status: 500 });
  }
}

export async function GET(req: NextRequest, res: NextResponse) {
  const searchParams = req.nextUrl.searchParams;
  const examId = searchParams.get('examId');
  const submissionId = searchParams.get('submissionId');
  if (!examId || !submissionId) return NextResponse.json({ status: 400 });
  const doc = await (
    await fs_e
      .doc(examId)
      .collection('responses')
      .withConverter<Response>(responseConverter)
      .doc(submissionId)
      .get()
  ).data();
  if (!doc) {
    return NextResponse.json({ status: 404 });
  } else {
    return NextResponse.json({ status: 200, data: doc });
  }
}
