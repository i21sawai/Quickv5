'use client';

import { useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { AnswerKey, Response } from '@/types/response';
import { Button } from '@/components/ui/button';
import { useEditorContext } from '@/components/context/editor';
import { FormRenderer } from '@/components/oarganisms/formRenderer';

export default function IndexPage() {
  const { blocks, setBlocks, elemSave, setElemSave, ready, id } =
    useEditorContext();
  const { data: session } = useSession();
  const router = useRouter();
  const submitting = useRef(false);

  const response = useMemo(() => {
    if (!elemSave) return;
    const answers: AnswerKey[] = elemSave.elements.map((e) => {
      return {
        id: e.id,
        type: e.type,
        title: e.title,
        answers: e.answers,
      };
    });
    const res: Response = {
      userId: session!.user!.email!,
      examId: id,
      answers: answers,
      submitTime: new Date(),
    };
    return res;
  }, [elemSave]);

  const submit = async () => {
    if (submitting.current) return;
    submitting.current = true;
    const res = await fetch('/api/exam/response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    });
    if (res.status === 200) {
      //router push with searchParam
      router.push(
        `/message?title=${elemSave?.title}&message=${'回答が送信されました。お疲れ様でした。'}`
      );
    } else {
      alert('送信に失敗しました。');
      submitting.current = false;
    }
  };

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        {/* <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          試験問題の作成
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Markdown記法を元にした記法を使って、試験問題を作成することができます。
        </p> */}
      </div>

      <div className="flex w-full min-w-0 max-w-full justify-center">
        <div className="w-full max-w-screen-md p-0 md:p-8">
          {/* <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            プレビュー
          </h1> */}
          <FormRenderer elemSave={elemSave} setElemSave={setElemSave} />
          <div className="flex h-[120px] items-end justify-end ">
            <Button variant="default" onClick={submit}>
              提出
            </Button>
          </div>
          {/* {JSON.stringify(elemSave)}
          {JSON.stringify(response)} */}
        </div>
      </div>
    </section>
  );
}
