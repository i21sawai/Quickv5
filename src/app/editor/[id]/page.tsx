'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { ExamAttr } from '@/types/exam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEditorContext } from '@/components/context/editor';
import { FormRenderer } from '@/components/oarganisms/formRenderer';
import PlateEditor from '@/components/plate-editor';

export default function IndexPage() {
  const { elemSave, setElemSave, ready, attr, setAttr } = useEditorContext();
  const { data, status } = useSession();
  const router = useRouter();

  if (
    status === 'authenticated' &&
    data?.user?.email &&
    JSON.parse(data?.user?.email).role === '管理者'
  ) {
    return (
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            {attr?.title}の編集
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Markdown記法を元にした記法を使って、試験問題を作成することができます。
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href={`/exam/${elemSave?.id}`}>生徒用 : 回答ページ</Link>
            </Button>
            <Button asChild>
              <Link href={`/result/${elemSave?.id}`}>
                教員用 : 結果確認ページ
              </Link>
            </Button>
          </div>

          {attr && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>状態変更</Label>
              <Select
                value={attr?.status}
                onValueChange={(e) =>
                  setAttr({
                    ...attr,
                    status: e as
                      | '下書き'
                      | '回答募集中'
                      | '採点中'
                      | '採点完了',
                  })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="問題の状態を設定" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="下書き">下書き</SelectItem>
                    <SelectItem value="回答募集中">回答募集中</SelectItem>
                    <SelectItem value="採点中">採点中</SelectItem>
                    <SelectItem value="採点完了">採点完了</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
          {attr && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="timeLimit">試験時間(分)</Label>
              <Input
                className="w-[120px]"
                id="timeLimit"
                placeholder="試験時間"
                type="number"
                value={attr?.timeLimit}
                onChange={(e) =>
                  setAttr({
                    ...attr,
                    timeLimit: parseInt(e.target.value),
                  })
                }
                min={0}
              />
            </div>
          )}
        </div>

        <div className="flex max-w-[1336px]">
          <div className="w-1/2 rounded-lg border bg-background shadow">
            {ready && <PlateEditor />}
          </div>
          <div className="w-1/2 p-16">
            {/* <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            プレビュー
          </h1> */}
            <FormRenderer elemSave={elemSave} setElemSave={setElemSave} />
          </div>
        </div>
      </section>
    );
  } else {
    if (status === 'authenticated') {
      router.push('/');
    }
  }
}
