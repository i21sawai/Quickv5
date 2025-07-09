'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { makeid } from '@/utils/str';
import { useSession } from 'next-auth/react';

import { ElementSaveData } from '@/types/element';
import { AnswerKey, Response } from '@/types/response';
import { Button } from '@/components/ui/button';
import { useEditorContext } from '@/components/context/editor';
import { FormRenderer } from '@/components/organisms/formRenderer';

export default function IndexPage() {
  const { elemSave, setElemSave, ready, id, attr } = useEditorContext();
  const [newElemSave, setNewElemSave] = useState<ElementSaveData | undefined>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState<'WAITING' | 'RESPONDING' | 'FINISHED'>(
    'WAITING'
  );
  const [acceptStatus, setAcceptStatus] = useState<
    'ACCEPTING' | 'LATE' | 'EARLY' | 'LOADING'
  >('LOADING');
  const { data: session } = useSession();
  const router = useRouter();
  const submitting = useRef(false);
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [timeNotice, setTimeNotice] = useState<string>('読み込み中...');

  useEffect(() => {
    if (!elemSave) return;
    
    // elemSaveのディープコピーを作成し、answersを確実に初期化
    const initializedElemSave: ElementSaveData = {
      ...elemSave,
      elements: elemSave.elements.map(elem => ({
        ...elem,
        answers: elem.type === 'text' || elem.type === 'paragraph' 
          ? [] 
          : elem.type === 'radio' 
          ? [] 
          : Array(elem.questions?.length || 0).fill([])
      }))
    };
    setNewElemSave(initializedElemSave);
    // 初期化完了を通知
    setIsInitialized(true);
  }, [elemSave]);

  const response = useMemo(() => {
    if (!newElemSave) return;
    const answers: AnswerKey[] = newElemSave.elements.map((e) => {
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
  }, [newElemSave]);

  const submit = async () => {
    if (submitting.current) return;
    if (!response) return;
    if (!newElemSave) return;
    submitting.current = true;
    //fill up empty answers
    response.answers = response.answers.map((a, i) => {
      const type = newElemSave?.elements[i].type;
      if (a.answers.length === 0) {
        if (type === 'text' || type === 'paragraph') {
          a.answers = ['未回答'];
        } else if (type === 'radio') {
          a.answers = [-1];
        } else {
          a.answers = Array(newElemSave.elements[i].questions.length).fill([
            -1,
          ]);
        }
      }
      return a;
    });
    console.log(response);
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
        `/message?title=${newElemSave?.title}&message=${'回答が送信されました。お疲れ様でした。'}`
      );
    } else {
      alert('送信に失敗しました。');
      submitting.current = false;
    }
  };

  const onStartExam = () => {
    if (!attr || !elemSave) return;
    
    // 初期化処理を再実行
    const initializedElemSave: ElementSaveData = {
      ...elemSave,
      elements: elemSave.elements.map(elem => ({
        ...elem,
        answers: elem.type === 'text' || elem.type === 'paragraph' 
          ? [] 
          : elem.type === 'radio' 
          ? [] 
          : Array(elem.questions?.length || 0).fill([])
      }))
    };
    setNewElemSave(initializedElemSave);
    setIsInitialized(true);
    setStatus('RESPONDING');

    const _deadline = new Date(
      Date.now() + (attr?.timeLimit || 60) * 60 * 1000
    );
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

  const formatTime = (date: Date): string => {
    return `${date.getHours()}時${date.getMinutes()}分`;
  };

  //check every one second
  useEffect(() => {
    const timer = setInterval(() => {
      if (!attr) return;
      if (attr.examStartAt && attr.examStartAt > new Date()) {
        setAcceptStatus('EARLY');
      } else if (attr.examEndAt && attr.examEndAt < new Date()) {
        setAcceptStatus('LATE');
      } else {
        setAcceptStatus('ACCEPTING');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [attr]);

  if (status === 'WAITING') {
    if (!attr) return <div>loading...</div>;
    if (acceptStatus !== 'ACCEPTING') {
      return (
        <div className="flex h-[480px] flex-col items-center justify-center gap-32 p-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            {/* 現在回答を受け付けていません。試験官にお問い合わせください。 */}
            {acceptStatus === 'EARLY'
              ? attr.examStartAt
                ? `試験開始は${formatTime(attr.examStartAt)}です`
                : '試験開始時間が設定されていません'
              : acceptStatus === 'LATE'
                ? attr.examEndAt
                  ? `試験は${formatTime(attr.examEndAt)}に終了しています`
                  : '試験終了時間が設定されていません'
                : '受付状況読み込み中...'}
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
            {`${attr?.title}が開始できます`}
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            制限時間は{attr?.timeLimit}分です。
            {attr?.examEndAt &&
              `試験終了時間は${formatTime(attr.examEndAt)}です。`}
          </p>
        </div>
        <Button onClick={() => onStartExam()}>回答を開始する</Button>
      </div>
    );
  }

  // 初期化中の表示（試験開始後のみ）
  if (status === 'RESPONDING' && (!isInitialized || !newElemSave)) {
    return (
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex w-full min-w-0 max-w-full justify-center">
          <div className="w-full max-w-screen-md p-0 md:p-8">
            <div className="flex h-[400px] items-center justify-center">
              <p className="text-lg text-muted-foreground">問題を読み込んでいます...</p>
            </div>
          </div>
        </div>
      </section>
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
          <FormRenderer elemSave={newElemSave} setElemSave={setNewElemSave} />
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
