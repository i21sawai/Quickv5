'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { database } from 'firebase-admin';

import { ElementSaveData } from '@/types/element';
import { Response } from '@/types/response';
import { useEditorContext } from '@/components/context/editor';
import { FormRenderer } from '@/components/organisms/formRenderer';

export default function IndexPage() {
  const { elemSave, setElemSave, attr } = useEditorContext();
  const router = useRouter();
  const params = useParams<{ examId: string; responseId: string }>();
  const [response, setResponse] = useState<Response | undefined>();
  const ready = useRef(false);
  const [_elemSave, _setElemSave] = useState<ElementSaveData | undefined>();

  useEffect(() => {
    const f = async () => {
      const res = await fetch(
        `/api/exam/response?examId=${params.examId}&submissionId=${params.responseId}
        `
      );
      if (res.status === 200) {
        const data = await res.json();
        setResponse(data.data);
        console.log(data.data);
      } else {
        router.push(
          `/message?title=${'エラー'}&message=${'問題が見つかりませんでした。'}`
        );
      }
      console.log('DATA FETCHED');
    };
    f();
  }, []);

  useEffect(() => {
    console.log(elemSave, response);
    if (!elemSave || !response || ready.current) return; //can't early return this
    elemSave.elements = elemSave.elements.map((e, i) => {
      return {
        id: e.id,
        type: e.type,
        title: e.title,
        point: e.point,
        options: e.options,
        questions: e.questions,
        trueAnswers: e.answers,
        answers: response.answers[i].answers,
        telems: e.telems,
        tags: e.tags,
        readonly: true,
      };
    });
    ready.current = true;
    _setElemSave(elemSave);
  }, [elemSave, response]);

  const total = useMemo(() => {
    //calculate point
    if (!response) return;
    if (!elemSave) return;
    let total = 0;
    response.answers.forEach((answer, i) => {
      const question = elemSave.elements[i];
      const trueAnswer = question.answers;
      switch (answer.type) {
        case 'radio':
          const correct = trueAnswer[0];
          const a = answer.answers[0];
          if (a.toString() === correct.toString()) {
            total += question.point;
          }
          break;
        case 'matrix':
          trueAnswer.forEach((correct, i) => {
            const a = answer.answers[i];
            if (a === correct) {
              total += question.point;
            }
          });
          break;
        case 'text':
        case 'paragraph':
          for (let i = 0; i < trueAnswer.length; i++) {
            const correct = trueAnswer[i];
            const a = answer.answers[i];
            if (a === correct) {
              total += question.point;
              break;
            }
          }
          break;
        default:
          console.error('Not implemented');
      }
    });
    return total;
  }, [response, elemSave]);

  if (!ready.current) return <div>Loading...</div>;

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2"></div>

      <div className="flex w-full min-w-0 max-w-full justify-center">
        <div className="w-full max-w-screen-md p-0 md:p-8">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-16">
            {total}点
          </h1>
          <FormRenderer elemSave={_elemSave} setElemSave={_setElemSave} />
        </div>
      </div>
    </section>
  );
}
