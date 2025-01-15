'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { makeid } from '@/utils/str';
import { useSession } from 'next-auth/react';

import { AnswerKey, Response } from '@/types/response';
import { Button } from '@/components/ui/button';
import { useEditorContext } from '@/components/context/editor';
import { FormRenderer } from '@/components/organisms/formRenderer';

export default function IndexPage() {
  const { blocks, setBlocks, elemSave, setElemSave, ready, id, attr } =
    useEditorContext();
  const [status, setStatus] = useState<'WAITING' | 'RESPONDING' | 'FINISHED'>(
    'WAITING'
  );
  const { data: session } = useSession();
  const router = useRouter();
  const submitting = useRef(false);
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [timeNotice, setTimeNotice] = useState<string>('');

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
      id: `${session!.user!.name!}-${makeid(10)}`,
      userId: session!.user!.name!,
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

  const onStartExam = () => {
    setStatus('RESPONDING');
    const _deadline = new Date(Date.now() + (attr?.timeLimit || 0) * 60 * 1000);
    setDeadline(_deadline);
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getTime() > _deadline.getTime()) {
        setStatus('FINISHED');
        alert('試験時間終了です。回答を送信します。');
        clearInterval(timer);
        submit();
      } else {
        setTimeNotice(
          `残り${Math.floor((_deadline!.getTime() - now.getTime()) / 1000 / 60)}分`
        );
        //3分を切ったら秒数表示
        if ((_deadline!.getTime() - now.getTime()) / 1000 / 60 < 3) {
          setTimeNotice(
            `残り${Math.floor((_deadline!.getTime() - now.getTime()) / 1000 / 60)}分${Math.floor((_deadline!.getTime() - now.getTime()) / 1000) % 60}秒`
          );
        }
      }
    }, 1000);
  };

  if (status === 'WAITING') {
    if (!attr) return <div>loading...</div>;
    if (attr?.status !== '回答募集中') {
      return (
        <div className="flex h-[480px] flex-col items-center justify-center gap-32 p-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            現在回答を受け付けていません。試験官にお問い合わせください。
          </h1>
          <Button asChild>
            <Link href="/">トップページに戻る</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex h-[480px] flex-col items-center justify-center gap-32 p-4">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            試験官の指示があるまでお待ちください。
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            試験時間は{attr?.timeLimit}分です。
          </p>
        </div>
        <Button onClick={() => onStartExam()}>回答を開始する</Button>
      </div>
    );
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2"></div>

      <div className="flex w-full min-w-0 max-w-full justify-center">
        <div className="w-full max-w-screen-md p-0 md:p-8">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight pb-8">
            {timeNotice}
          </h3>
          <FormRenderer elemSave={elemSave} setElemSave={setElemSave} />
          <div className="flex h-[120px] items-end justify-end ">
            <Button variant="default" onClick={submit}>
              提出
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
