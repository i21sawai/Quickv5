'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { columns, ResponseTable } from '@/components/organisms/responseTable';

export default function Page() {
  const [examId, setExamId] = useState<string>('');
  const router = useRouter();
  const fetcher = (url: string) =>
    fetch(url).then(async (res) => {
      const json = (await res.json())
        .map((data: string) => JSON.parse(data))
        .reverse();
      return json;
    });
  const { data: session, status } = useSession();
  const {
    data: tableData,
    error,
    isLoading,
  } = useSWR(`/api/exam/response/list/${session?.user?.name}`, fetcher, {
    revalidateOnReconnect: true,
  });

  const onSubmit = async () => {
    // Firestore経由で試験IDの存在を確認
    const attrReq = await fetch(`/api/editor/attr?id=${examId}`);
    if (attrReq.status === 200) {
      const attrData = await attrReq.json();
      // elemRefが存在し、空でないことを確認
      if (attrData.elemRef && attrData.elemRef !== '') {
        router.push(`/exam/${examId}`);
      } else {
        alert('試験IDは存在しますが、試験内容がまだ保存されていません。試験作成者に確認してください。');
      }
    } else {
      alert('試験IDが存在しません');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-4 mt-16">
      <div className="max-w-lg flex-col flex gap-4">
        <h1 className="text-4xl font-bold">試験IDを入力して試験を始める</h1>
        <div className="flex gap-4">
          <Input
            placeholder="試験ID"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
          />
          <Button onClick={() => onSubmit()}>試験を始める</Button>
        </div>
        {!isLoading && tableData && (
          <ResponseTable columns={columns} data={tableData.reverse()} />
        )}
      </div>
    </div>
  );
}
