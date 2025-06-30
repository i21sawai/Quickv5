'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/date-time-picker';
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
import { FormRenderer } from '@/components/organisms/formRenderer';
import PlateEditor from '@/components/plate-editor';

export default function IndexPage() {
  const { elemSave, setElemSave, ready, attr, setAttr } = useEditorContext();
  const { data, status } = useSession();
  const router = useRouter();
  const [update, setUpdate] = useState(0);

  useEffect(() => {
    setUpdate((prev) => prev + 1);
  }, [elemSave]);

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
              <Link href={`/exam/${elemSave?.id}`}>回答者用 : 回答ページ</Link>
            </Button>
            <Button asChild>
              <Link href={`/result/${elemSave?.id}`}>
                管理者用 : 結果確認ページ
              </Link>
            </Button>
          </div>

          {attr && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>試験開始時間</Label>
              <DateTimePicker
                date={attr.examStartAt}
                setDate={(date) =>
                  setAttr({
                    ...attr,
                    examStartAt: new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      date.getHours(),
                      date.getMinutes(),
                      0
                    ),
                  })
                }
              />
            </div>
          )}
          {attr && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>試験終了時間</Label>
              <DateTimePicker
                date={attr.examEndAt}
                setDate={(date) =>
                  //the seconds part should be zero
                  setAttr({
                    ...attr,
                    examEndAt: new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      date.getHours(),
                      date.getMinutes(),
                      0
                    ),
                  })
                }
              />
            </div>
          )}
          {attr && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>制限時間（分）</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={attr.timeLimit}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      setAttr({ ...attr, timeLimit: value });
                    }
                  }}
                  className="w-24"
                  min="1"
                />
                <span className="text-sm text-muted-foreground">分</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAttr({ ...attr, timeLimit: Math.max(1, attr.timeLimit - 10) })}
                >
                  -10分
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAttr({ ...attr, timeLimit: Math.max(1, attr.timeLimit - 5) })}
                >
                  -5分
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAttr({ ...attr, timeLimit: attr.timeLimit + 5 })}
                >
                  +5分
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAttr({ ...attr, timeLimit: attr.timeLimit + 10 })}
                >
                  +10分
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAttr({ ...attr, timeLimit: 30 })}
                >
                  30分
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAttr({ ...attr, timeLimit: 60 })}
                >
                  60分
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAttr({ ...attr, timeLimit: 90 })}
                >
                  90分
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAttr({ ...attr, timeLimit: 120 })}
                >
                  120分
                </Button>
              </div>
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
            <FormRenderer
              elemSave={elemSave}
              setElemSave={setElemSave}
              key={update}
            />
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
