import { NextRequest, NextResponse } from 'next/server';
import {
  allResponseConverter,
  responseConverter,
} from '@/database/converters/response';
import { fs_e, fs_user } from '@/database/firestore';
import { makeid } from '@/utils/str';

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

    const ereq = await fetch(
      `https://storage.googleapis.com/sandbox-35d1d.appspot.com/WebExam%2Feditor%2F${res.examId}_elem.json?ignoreCache=1`
    );
    if (ereq.status !== 200) return;
    let elem = (await ereq.json()) as ElementSaveData;
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
      await fs_e
        .doc(res.examId)
        .collection('responses')
        .withConverter(allResponseConverter)
        .doc('all')
        .set(allRes);
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
