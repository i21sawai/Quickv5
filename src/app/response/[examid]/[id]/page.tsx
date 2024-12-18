'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ElementSaveData } from '@/types/element';
import { FormRenderer } from '@/components/oarganisms/formRenderer';

export default function IndexPage() {
  const [elemSave, setElemSave] = useState<ElementSaveData | undefined>(
    undefined
  );
  const router = useRouter();
  const params = useParams<{ examid: string; id: string }>();

  useEffect(() => {
    const f = async () => {
      const res = await fetch(`/api/exam/response`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId: params.examid,
          userId: params.id,
        }),
      });
      if (res.status === 200) {
        const data = await res.json();
        setElemSave(data.data);
      } else {
        router.push(
          `/message?title=${'エラー'}&message=${'問題が見つかりませんでした。'}`
        );
      }
    };
    f();
  }, []);

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
          {/* {JSON.stringify(elemSave)}
          {JSON.stringify(response)} */}
        </div>
      </div>
    </section>
  );
}
