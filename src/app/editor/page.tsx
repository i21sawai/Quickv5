// redirect to /editor/[id]
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

import { ExamAttr } from '@/types/exam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { columns, Examtable } from '@/components/organisms/examTable';

//ask user to decide id
//it's kind of bad to leave many drafts
//Want to save id, title,
//creation date, last edit date
//owner, status,
//write those info to firestore document

export default function Page() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState<string>('');
  const [examId, setExamId] = useState<string>('');
  const fetcher = (url: string) =>
    fetch(url).then(async (res) => {
      const json = (await res.json()).reverse();
      return json;
    });
  const {
    data: tableData,
    error,
    isLoading,
  } = useSWR('/api/editor/list', fetcher, { revalidateOnMount: true });

  const router = useRouter();
  const onSubmit = async () => {
    const ereq = await fetch(
      `https://storage.googleapis.com/sandbox-35d1d.appspot.com/WebExam%2Feditor%2F${examId}_elem.json?ignoreCache=1`
    );
    if (ereq.status === 200) {
      alert('試験IDが既に使われています');
      //router.push(`/exam/${examId}`);
    } else {
      const res = await fetch('/api/editor/attr', {
        method: 'POST',
        body: JSON.stringify({
          id: examId,
          title: title,
          createdAt: new Date(),
          lastEditedAt: new Date(),
          owner: session?.user?.name,
          status: '下書き',
          elemRef: `https://storage.googleapis.com/sandbox-35d1d.appspot.com/WebExam%2Feditor%2F${examId}_save.json?ignoreCache=1`,
          saveRef: `https://storage.googleapis.com/sandbox-35d1d.appspot.com/WebExam%2Feditor%2F${examId}_elem.json?ignoreCache=1`,
        }),
      });
      if (res.status === 400) {
        alert('IDが既に使われています');
      } else if (res.status !== 200) {
        alert('エラーが発生しました');
        return;
      }
      router.push(`/editor/${examId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-4 mt-16">
      <div className="max-w-7xl flex-col flex gap-4">
        <h1 className="text-4xl font-bold">新しい試験を作成</h1>
        <Input
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex gap-4">
          <Input
            placeholder="試験ID"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
          />
          <Button onClick={() => onSubmit()}>試験を作成</Button>
        </div>
        {!isLoading && <Examtable columns={columns} data={tableData} />}
      </div>
    </div>
  );
}
