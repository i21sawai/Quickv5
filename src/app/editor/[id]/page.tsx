'use client';

import Link from 'next/link';

import { siteConfig } from '@/config/site';
import { Input } from '@/components/ui/input';
import { useEditorContext } from '@/components/context/editor';
import { FormRenderer } from '@/components/oarganisms/formRenderer';
import PlateEditor from '@/components/plate-editor';
import { buttonVariants } from '@/components/plate-ui/button';

export default function IndexPage() {
  const { blocks, setBlocks, elements, ready } = useEditorContext();

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          試験問題の作成
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Markdown記法を元にした記法を使って、試験問題を作成することができます。
        </p>
      </div>

      <div className="max-w-[1336px] flex">
        <div className="w-1/2 rounded-lg border bg-background shadow">
          {ready && <PlateEditor />}
        </div>
        <div className="w-1/2 p-16">
          {/* <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            プレビュー
          </h1> */}
          <FormRenderer />
        </div>
      </div>
    </section>
  );
}
